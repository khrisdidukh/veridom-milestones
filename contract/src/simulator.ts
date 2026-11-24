// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// In-process simulator. It runs the compiled circuits with the official
// compact-runtime against a real contract state, with no network and no
// proofs. Each party (bank, builder, auditor, ...) keeps its own private state;
// a call runs with the caller's private state, exactly as on chain, where every
// party proves with its own witnesses.
//
// A failed `assert` in a circuit throws and leaves both the public state and
// the caller's private state unchanged, as a rejected transaction would.

import {
  type ChargedState,
  type CircuitContext,
  type CircuitResults,
  type EncodedZswapLocalState,
  type JubjubPoint,
  createCircuitContext,
  createConstructorContext,
  encodeContractAddress,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  type FactKind,
  type Ledger,
  ledger,
} from './managed/veridom-milestones/contract/index.js';
import { type VeridomPrivateState, witnesses } from './witnesses.js';
import { toHex } from './bytes.js';

type AlignedValueLike = { value: Uint8Array[] };
type StateValueLike = {
  type(): 'null' | 'cell' | 'map' | 'array' | 'boundedMerkleTree';
  asCell(): AlignedValueLike;
  asMap(): { keys(): AlignedValueLike[]; get(k: AlignedValueLike): StateValueLike | undefined } | undefined;
  asArray(): StateValueLike[] | undefined;
  toString(compact?: boolean): string;
};

const hexOf = (v: AlignedValueLike): string => `<${v.value.map((b) => '[' + toHex(b) + ']').join('')}>`;

/** Every byte of a public contract state, recursively, as text. */
export const dumpStateValue = (sv: StateValueLike): string => {
  switch (sv.type()) {
    case 'null':
      return 'null';
    case 'cell':
      return hexOf(sv.asCell());
    case 'map': {
      const m = sv.asMap()!;
      return `Map {${m.keys().map((k) => `${hexOf(k)}: ${dumpStateValue(m.get(k)!)}`).join(', ')}}`;
    }
    case 'array':
      return `Array [${sv.asArray()!.map(dumpStateValue).join(', ')}]`;
    default:
      return sv.toString(false);
  }
};

// Any 32-byte coin public key works for the constructor context: this contract
// never sends shielded coins.
const COIN_PUBLIC_KEY = '00'.repeat(31) + '01';

export type CallRecord = {
  party: string;
  circuit: string;
  ok: boolean;
  error?: string;
  at: number;
};

type Circuit<R> = (ctx: CircuitContext<VeridomPrivateState>) => Promise<CircuitResults<VeridomPrivateState, R>>;

// From compact-runtime 0.20 (Compact 0.35, ledger 9) the constructor and every
// circuit are async, and createCircuitContext takes one options object. The
// simulator is therefore built with `await MilestonesSimulator.create(...)` and
// every call returns a promise. Calls are serialized so two parties never race
// on the same public state.
export class MilestonesSimulator {
  readonly contract: Contract<VeridomPrivateState>;
  readonly contractAddress: string;
  readonly contractAddressBytes: Uint8Array;
  readonly history: CallRecord[] = [];
  private state!: ChargedState;
  private zswapLocalState!: EncodedZswapLocalState;
  private readonly states = new Map<string, VeridomPrivateState>();
  private queue: Promise<unknown> = Promise.resolve();

  private constructor(witnessOverrides: Partial<typeof witnesses>) {
    this.contract = new Contract<VeridomPrivateState>({ ...witnesses, ...witnessOverrides });
    this.contractAddress = sampleContractAddress();
    this.contractAddressBytes = encodeContractAddress(this.contractAddress);
  }

  /** Deploys the contract. The deploying party becomes the lender. */
  static async create(
    lenderName: string,
    lenderState: VeridomPrivateState,
    witnessOverrides: Partial<typeof witnesses> = {},
  ): Promise<MilestonesSimulator> {
    const sim = new MilestonesSimulator(witnessOverrides);
    const deployed = await sim.contract.initialState(createConstructorContext(lenderState, COIN_PUBLIC_KEY));
    sim.state = deployed.currentContractState.data;
    sim.zswapLocalState = deployed.currentZswapLocalState;
    sim.states.set(lenderName, deployed.currentPrivateState);
    return sim;
  }

  addParty(name: string, state: VeridomPrivateState): void {
    if (this.states.has(name)) throw new Error(`Party ${name} already exists`);
    this.states.set(name, state);
  }

  privateState(name: string): VeridomPrivateState {
    const s = this.states.get(name);
    if (!s) throw new Error(`Unknown party ${name}`);
    return s;
  }

  /** Local edits to a party's own private state (new evidence, planned amounts). */
  setPrivateState(name: string, state: VeridomPrivateState): void {
    this.privateState(name);
    this.states.set(name, state);
  }

  get ledger(): Ledger {
    return ledger(this.state);
  }

  /**
   * The complete public contract state as text: what any chain observer can read.
   * Ledger 9 loads state cells lazily and its `toString` prints `<Lazy Sp>` for
   * them, so this walks the whole tree and prints every cell's bytes as hex.
   */
  publicStateDump(): string {
    return dumpStateValue(this.state.state);
  }

  private run<R>(party: string, circuit: string, call: Circuit<R>): Promise<R> {
    const next = this.queue.then(async () => {
      const ctx = createCircuitContext<VeridomPrivateState>({
        circuitId: circuit,
        contractAddress: this.contractAddress,
        coinPublicKeyOrZswapState: this.zswapLocalState,
        contractState: this.state,
        privateState: this.privateState(party),
      });
      try {
        const res = await call(ctx);
        const after = res.context.callContext;
        this.state = after.currentQueryContext.state;
        this.zswapLocalState = after.currentZswapLocalState ?? this.zswapLocalState;
        this.states.set(party, after.currentPrivateState as VeridomPrivateState);
        this.history.push({ party, circuit, ok: true, at: Date.now() });
        return res.result;
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        this.history.push({ party, circuit, ok: false, error, at: Date.now() });
        throw e;
      }
    });
    this.queue = next.catch(() => undefined);
    return next;
  }

  private get c() {
    return this.contract.impureCircuits;
  }

  /** Calls any impure circuit by name, as the given party. Used by the frontend. */
  async callCircuit(party: string, circuit: keyof Contract<VeridomPrivateState>['impureCircuits'], args: unknown[]): Promise<void> {
    await this.run(party, circuit, (ctx) =>
      (this.c[circuit] as (ctx: CircuitContext<VeridomPrivateState>, ...a: unknown[]) => Promise<CircuitResults<VeridomPrivateState, []>>)(
        ctx,
        ...args,
      ),
    );
  }

  async registerInspector(party: string, inspectorId: bigint, pk: JubjubPoint): Promise<void> {
    await this.run(party, 'registerInspector', (ctx) => this.c.registerInspector(ctx, inspectorId, pk));
  }

  async revokeInspector(party: string, inspectorId: bigint): Promise<void> {
    await this.run(party, 'revokeInspector', (ctx) => this.c.revokeInspector(ctx, inspectorId));
  }

  async registerProject(party: string, projectId: Uint8Array, builder: Uint8Array, termsCommitment: Uint8Array, stageCount: bigint): Promise<void> {
    await this.run(party, 'registerProject', (ctx) => this.c.registerProject(ctx, projectId, builder, termsCommitment, stageCount));
  }

  async acceptProject(party: string, projectId: Uint8Array): Promise<void> {
    await this.run(party, 'acceptProject', (ctx) => this.c.acceptProject(ctx, projectId));
  }

  async attestMilestone(party: string, projectId: Uint8Array, stage: bigint): Promise<void> {
    await this.run(party, 'attestMilestone', (ctx) => this.c.attestMilestone(ctx, projectId, stage));
  }

  async requestTranche(party: string, projectId: Uint8Array, stage: bigint): Promise<void> {
    await this.run(party, 'requestTranche', (ctx) => this.c.requestTranche(ctx, projectId, stage));
  }

  async releaseTranche(party: string, projectId: Uint8Array, stage: bigint): Promise<void> {
    await this.run(party, 'releaseTranche', (ctx) => this.c.releaseTranche(ctx, projectId, stage));
  }

  async discloseToAuditor(party: string, projectId: Uint8Array, stage: bigint, kind: FactKind, auditor: Uint8Array, nonce: Uint8Array): Promise<void> {
    await this.run(party, 'discloseToAuditor', (ctx) => this.c.discloseToAuditor(ctx, projectId, stage, kind, auditor, nonce));
  }
}
