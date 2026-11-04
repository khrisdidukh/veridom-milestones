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
  type CircuitContext,
  type CircuitResults,
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

export class MilestonesSimulator {
  readonly contract: Contract<VeridomPrivateState>;
  readonly contractAddress: string;
  readonly contractAddressBytes: Uint8Array;
  readonly history: CallRecord[] = [];
  private context: CircuitContext<VeridomPrivateState>;
  private readonly states = new Map<string, VeridomPrivateState>();

  /** Deploys the contract. The deploying party becomes the lender. */
  constructor(lenderName: string, lenderState: VeridomPrivateState, witnessOverrides: Partial<typeof witnesses> = {}) {
    this.contract = new Contract<VeridomPrivateState>({ ...witnesses, ...witnessOverrides });
    const deployed = this.contract.initialState(createConstructorContext(lenderState, COIN_PUBLIC_KEY));
    this.contractAddress = sampleContractAddress();
    this.contractAddressBytes = encodeContractAddress(this.contractAddress);
    this.context = createCircuitContext(
      this.contractAddress,
      deployed.currentZswapLocalState,
      deployed.currentContractState,
      deployed.currentPrivateState,
    );
    this.states.set(lenderName, deployed.currentPrivateState);
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
    return ledger(this.context.currentQueryContext.state);
  }

  /** The complete public contract state as text: what any chain observer can read. */
  publicStateDump(): string {
    return this.context.currentQueryContext.state.state.toString(false);
  }

  private run<R>(party: string, circuit: string, call: (ctx: CircuitContext<VeridomPrivateState>) => CircuitResults<VeridomPrivateState, R>): R {
    const ctx = { ...this.context, currentPrivateState: this.privateState(party) };
    try {
      const res = call(ctx);
      this.context = res.context;
      this.states.set(party, res.context.currentPrivateState);
      this.history.push({ party, circuit, ok: true, at: Date.now() });
      return res.result;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      this.history.push({ party, circuit, ok: false, error, at: Date.now() });
      throw e;
    }
  }

  private get c() {
    return this.contract.impureCircuits;
  }

  /** Calls any impure circuit by name, as the given party. Used by the frontend. */
  callCircuit(party: string, circuit: keyof Contract<VeridomPrivateState>['impureCircuits'], args: unknown[]): void {
    this.run(party, circuit, (ctx) =>
      (this.c[circuit] as (ctx: CircuitContext<VeridomPrivateState>, ...a: unknown[]) => CircuitResults<VeridomPrivateState, []>)(
        ctx,
        ...args,
      ),
    );
  }

  registerInspector(party: string, inspectorId: bigint, pk: JubjubPoint): void {
    this.run(party, 'registerInspector', (ctx) => this.c.registerInspector(ctx, inspectorId, pk));
  }

  revokeInspector(party: string, inspectorId: bigint): void {
    this.run(party, 'revokeInspector', (ctx) => this.c.revokeInspector(ctx, inspectorId));
  }

  registerProject(party: string, projectId: Uint8Array, builder: Uint8Array, termsCommitment: Uint8Array, stageCount: bigint): void {
    this.run(party, 'registerProject', (ctx) => this.c.registerProject(ctx, projectId, builder, termsCommitment, stageCount));
  }

  acceptProject(party: string, projectId: Uint8Array): void {
    this.run(party, 'acceptProject', (ctx) => this.c.acceptProject(ctx, projectId));
  }

  attestMilestone(party: string, projectId: Uint8Array, stage: bigint): void {
    this.run(party, 'attestMilestone', (ctx) => this.c.attestMilestone(ctx, projectId, stage));
  }

  requestTranche(party: string, projectId: Uint8Array, stage: bigint): void {
    this.run(party, 'requestTranche', (ctx) => this.c.requestTranche(ctx, projectId, stage));
  }

  releaseTranche(party: string, projectId: Uint8Array, stage: bigint): void {
    this.run(party, 'releaseTranche', (ctx) => this.c.releaseTranche(ctx, projectId, stage));
  }

  discloseToAuditor(party: string, projectId: Uint8Array, stage: bigint, kind: FactKind, auditor: Uint8Array, nonce: Uint8Array): void {
    this.run(party, 'discloseToAuditor', (ctx) => this.c.discloseToAuditor(ctx, projectId, stage, kind, auditor, nonce));
  }
}
