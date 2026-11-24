// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Lace wallet backend: real transactions with ZK proofs. The provider wiring
// follows the official midnightntwrk/midnight-examples zk-loan UI
// (ui/src/contexts/ZKLoanContext.tsx, Apache-2.0, Midnight Foundation).
//
// Every party (bank, builder, auditor) is a separate private-state id. Caller
// identity in this contract comes from the witness secret, not from the wallet,
// so one Lace wallet can pay the fees for all three roles in a demo. In
// production each party runs its own wallet and keeps its own private state.

import type { ConnectedAPI, Configuration, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { encodeContractAddress } from '@midnight-ntwrk/compact-runtime';
import * as ledgerApi from '@midnight-ntwrk/midnight-js-protocol/v9';
import { ContractState } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-js';
import {
  createLedger9MidnightProvider,
  createLedger9ProofProvider,
  createLedger9WalletProvider,
  type ContractPrivateStates,
  type ContractStateRead,
  type LedgerTransaction,
  type PrivateStateProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { deployContract, findDeployedContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import {
  Contract,
  dumpStateValue,
  fromHex,
  ledger as readLedgerState,
  toHex,
  witnesses,
  type Ledger,
  type ProvableCircuitId,
  type VeridomPrivateState,
} from '@veridom/milestones-contract';
import type { CallOutcome, MilestonesBackend, Party } from '../backend/types';

/** How long a built transaction stays valid (Midnight.js 5 `config.ttlSeconds`). */
const TX_TTL_SECONDS = 3600;

/**
 * Midnight.js 5 serves the serialized contract state tagged with the ledger era
 * that wrote it. This contract is deployed on ledger 9 only.
 */
function contractStateData(read: ContractStateRead) {
  if (read.contractState.era !== 'v9') throw new Error('Expected a ledger 9 contract state');
  return read.contractState.deserialize({ v9: ContractState }).data;
}

export const DEFAULT_NETWORK_ID = import.meta.env.VITE_NETWORK_ID || 'preprod';

type VeridomContract = Contract<VeridomPrivateState>;

/**
 * Private states live in memory for the lifetime of the page, scoped by contract
 * address and party (Midnight.js 5 `forContract` shape). Signing keys likewise.
 */
function memoryPrivateStateProvider(): PrivateStateProvider<string, VeridomPrivateState> {
  const states = new Map<string, Map<string, VeridomPrivateState>>();
  const signingKeys = new Map<string, unknown>();
  const unsupported = (what: string) => async (): Promise<never> => {
    throw new Error(`${what} is not supported by the in-memory provider`);
  };
  const forContract = (address: string): ContractPrivateStates<string, VeridomPrivateState> => {
    const contractAddress = address.toLowerCase();
    const scoped = () => {
      let m = states.get(contractAddress);
      if (!m) states.set(contractAddress, (m = new Map()));
      return m;
    };
    return {
      contractAddress,
      async set(id: string, state: VeridomPrivateState) {
        scoped().set(id, state);
      },
      async get(id: string) {
        return states.get(contractAddress)?.get(id) ?? null;
      },
      async remove(id: string) {
        states.get(contractAddress)?.delete(id);
      },
      async clear() {
        states.delete(contractAddress);
      },
      exportPrivateStates: unsupported('Export'),
      importPrivateStates: unsupported('Import'),
    } as ContractPrivateStates<string, VeridomPrivateState>;
  };
  return {
    forContract,
    async clearAll() {
      states.clear();
    },
    async setSigningKey(a: string, k: unknown) {
      signingKeys.set(a, k);
    },
    async getSigningKey(a: string) {
      return (signingKeys.get(a) ?? null) as never;
    },
    async removeSigningKey(a: string) {
      signingKeys.delete(a);
    },
    async clearSigningKeys() {
      signingKeys.clear();
    },
    exportSigningKeys: unsupported('Export'),
    importSigningKeys: unsupported('Import'),
  } as unknown as PrivateStateProvider<string, VeridomPrivateState>;
}

async function findWallet(): Promise<InitialAPI> {
  for (let i = 0; i < 50; i++) {
    const midnight = (window as unknown as { midnight?: Record<string, InitialAPI> }).midnight;
    const w = midnight?.mnLace ?? (midnight ? Object.values(midnight)[0] : undefined);
    if (w) return w;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Midnight Lace was not found. Install the Lace wallet extension with Midnight enabled, then reload.');
}

export type LaceSession = {
  wallet: ConnectedAPI;
  config: Configuration;
  networkId: string;
  shieldedAddress?: string;
  /** How proofs are made in this session, for the screen and the run record. */
  proving: string;
  /** tDUST available for fees, when the wallet reports it. */
  dust?: bigint;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providers: any;
  privateStates: PrivateStateProvider<string, VeridomPrivateState>;
};

export async function connectLace(networkId: string = DEFAULT_NETWORK_ID, onStatus?: (s: string | undefined) => void): Promise<LaceSession> {
  const initial = await findWallet();
  let wallet: ConnectedAPI;
  try {
    wallet = await initial.connect(networkId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('mismatch')) throw new Error(`Lace is on a different network than "${networkId}". Switch it in Lace settings.`);
    throw new Error(`Lace did not authorise this site: ${msg}`);
  }
  const config = await wallet.getConfiguration();
  const status = await wallet.getConnectionStatus();
  const connectedNetwork = status.status === 'connected' ? status.networkId : config.networkId || networkId;

  const addresses = await wallet.getShieldedAddresses();
  const zkConfigProvider = new FetchZkConfigProvider<ProvableCircuitId>(assetBase(), { fetchFunc: fetch.bind(window) });
  // Proofs are made the way the user chose in Lace (Settings > Midnight > Proof generator):
  // in the wallet itself (WASM) or by the proof server configured there.
  // If the wallet offers no prover but names a proof server, talk to that server directly.
  let proofProvider: ReturnType<typeof createLedger9ProofProvider>;
  let proving: string;
  try {
    const provingProvider = await wallet.getProvingProvider(zkConfigProvider.asKeyMaterialProvider());
    proofProvider = createLedger9ProofProvider(provingProvider as unknown as Parameters<typeof createLedger9ProofProvider>[0]);
    proving = config.proverServerUri ? `through Lace, proof server ${config.proverServerUri}` : 'in Lace';
  } catch (e) {
    if (!config.proverServerUri) throw new Error(`Lace offered no way to make proofs: ${e instanceof Error ? e.message : String(e)}`);
    proofProvider = httpClientProofProvider(config.proverServerUri, zkConfigProvider);
    proving = `proof server ${config.proverServerUri}`;
  }
  let dust: bigint | undefined;
  try {
    dust = (await wallet.getDustBalance()).balance;
  } catch {
    dust = undefined;
  }
  const publicDataProvider = indexerPublicDataProvider(
    config.indexerUri,
    config.indexerWsUri,
    WebSocket as unknown as Parameters<typeof indexerPublicDataProvider>[2],
  );

  // Midnight.js 5 providers are era-tagged; these helpers lift ledger 9-only
  // implementations into them (official midnight-examples zk-loan pattern).
  const walletProvider = createLedger9WalletProvider({
    getCoinPublicKey: () => addresses.shieldedCoinPublicKey as ledgerApi.CoinPublicKey,
    getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey as ledgerApi.EncPublicKey,
    async balanceTx(tx: LedgerTransaction<'Unbound', 'v9'>): Promise<ledgerApi.FinalizedTransaction> {
      onStatus?.('Approve the transaction in Lace');
      try {
        // Lace appends {sender} as a third argument; pass an options object second.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (wallet as any).balanceUnsealedTransaction(toHex(tx.serialize()), {});
        return ledgerApi.Transaction.deserialize('signature', 'proof', 'binding', fromHex(result.tx)) as ledgerApi.FinalizedTransaction;
      } finally {
        onStatus?.(undefined);
      }
    },
  });
  const midnightProvider = createLedger9MidnightProvider(async (handle: LedgerTransaction<'Finalized', 'v9'>) => {
    onStatus?.('Submitting transaction');
    try {
      const bytes = handle.serialize();
      await wallet.submitTransaction(toHex(bytes));
      return ledgerApi.Transaction.deserialize('signature', 'proof', 'binding', bytes).identifiers()[0];
    } finally {
      onStatus?.(undefined);
    }
  });

  const privateStates = memoryPrivateStateProvider();
  return {
    wallet,
    config,
    networkId: connectedNetwork,
    shieldedAddress: addresses.shieldedAddress,
    proving,
    dust,
    privateStates,
    providers: {
      privateStateProvider: privateStates,
      zkConfigProvider,
      proofProvider,
      publicDataProvider,
      walletProvider,
      midnightProvider,
      config: { networkId: connectedNetwork, ttlSeconds: TX_TTL_SECONDS },
    },
  };
}

// Assets live next to the page, also when the site is served from a sub-path (GitHub Pages).
const assetBase = () => (window.location.origin + import.meta.env.BASE_URL).replace(/\/$/, '');

const compiledContract = () =>
  CompiledContract.make<VeridomContract>('VeridomMilestones', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(assetBase()),
  );

export class LaceBackend implements MilestonesBackend {
  readonly mode = 'lace' as const;
  readonly where: string;
  readonly contractAddressBytes: Uint8Array;
  private readonly compiled = compiledContract();
  /** Set when this tab deployed the contract. */
  deployTx?: CallOutcome;

  private constructor(
    private readonly session: LaceSession,
    readonly contractAddress: string,
  ) {
    this.where = `Lace wallet, network "${session.networkId}", proofs ${session.proving}`;
    this.contractAddressBytes = encodeContractAddress(contractAddress);
  }

  /** Deploys a new contract. The bank's private state is the deployer's. */
  static async deploy(session: LaceSession, bankState: VeridomPrivateState, others: Partial<Record<Party, VeridomPrivateState>>) {
    const deployed = await deployContract(session.providers, {
      compiledContract: compiledContract(),
      privateStateId: 'bank',
      initialPrivateState: bankState,
    });
    const address = deployed.deployTxData.public.contractAddress;
    const backend = new LaceBackend(session, address);
    backend.deployTx = { txId: String(deployed.deployTxData.public.txId), blockHeight: Number(deployed.deployTxData.public.blockHeight) };
    for (const [party, state] of Object.entries(others)) await backend.setPrivateState(party as Party, state!);
    return backend;
  }

  /** Joins a contract deployed earlier (address from the deploy step or VITE_CONTRACT_ADDRESS). */
  static async join(session: LaceSession, address: string, states: Record<Party, VeridomPrivateState>) {
    await findDeployedContract(session.providers, {
      contractAddress: address,
      compiledContract: compiledContract(),
      privateStateId: 'bank',
      initialPrivateState: states.bank,
    });
    const backend = new LaceBackend(session, address);
    for (const [party, state] of Object.entries(states)) await backend.setPrivateState(party as Party, state);
    return backend;
  }

  private async stateData() {
    const read: ContractStateRead | null = await this.session.providers.publicDataProvider.queryContractState(this.contractAddress);
    if (!read) throw new Error('The indexer has no state for this contract yet');
    return contractStateData(read);
  }

  async readLedger(): Promise<Ledger> {
    return readLedgerState(await this.stateData());
  }

  async publicStateDump(): Promise<string | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dumpStateValue((await this.stateData() as any).state);
  }

  async getPrivateState(party: Party): Promise<VeridomPrivateState> {
    const s = await this.session.privateStates.forContract(this.contractAddress).get(party);
    if (!s) throw new Error(`No private state for ${party}`);
    return s;
  }

  async setPrivateState(party: Party, state: VeridomPrivateState): Promise<void> {
    await this.session.privateStates.forContract(this.contractAddress).set(party, state);
  }

  async call(party: Party, circuit: ProvableCircuitId, args: unknown[]): Promise<CallOutcome> {
    const result = await submitCallTx(this.session.providers, {
      compiledContract: this.compiled,
      contractAddress: this.contractAddress,
      circuitId: circuit,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: args as any,
      privateStateId: party,
    });
    return { txId: String(result.public.txId), blockHeight: Number(result.public.blockHeight) };
  }
}
