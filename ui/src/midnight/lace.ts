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
import * as ledgerApi from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import type { MidnightProvider, PrivateStateProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, findDeployedContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import {
  Contract,
  fromHex,
  ledger as readLedgerState,
  toHex,
  witnesses,
  type Ledger,
  type ProvableCircuitId,
  type VeridomPrivateState,
} from '@veridom/milestones-contract';
import type { CallOutcome, MilestonesBackend, Party } from '../backend/types';

export const DEFAULT_NETWORK_ID = import.meta.env.VITE_NETWORK_ID || 'preprod';

type VeridomContract = Contract<VeridomPrivateState>;

/** Private states live in memory, scoped by contract address and party. */
function memoryPrivateStateProvider(): PrivateStateProvider<string, VeridomPrivateState> {
  const states = new Map<string, VeridomPrivateState>();
  const signingKeys = new Map<string, unknown>();
  let address = '';
  const key = (id: string) => `${address}:${id}`;
  return {
    setContractAddress(a: string) {
      address = a;
    },
    async get(id: string) {
      return states.get(key(id)) ?? null;
    },
    async set(id: string, value: VeridomPrivateState) {
      states.set(key(id), value);
    },
    async remove(id: string) {
      states.delete(key(id));
    },
    async clear() {
      states.clear();
    },
    async setSigningKey(a: string, k: unknown) {
      signingKeys.set(a, k);
    },
    async getSigningKey(a: string) {
      return signingKeys.get(a) ?? null;
    },
    async removeSigningKey(a: string) {
      signingKeys.delete(a);
    },
    async clearSigningKeys() {
      signingKeys.clear();
    },
    async exportPrivateStates() {
      throw new Error('Export is not supported by the in-memory provider');
    },
    async importPrivateStates() {
      throw new Error('Import is not supported by the in-memory provider');
    },
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
  if (status.status === 'connected') setNetworkId(status.networkId);
  else setNetworkId(networkId);
  if (!config.proverServerUri) throw new Error('Lace has no proof server configured (Settings > Midnight > Local proof server).');

  const addresses = await wallet.getShieldedAddresses();
  const zkConfigProvider = new FetchZkConfigProvider<ProvableCircuitId>(assetBase(), fetch.bind(window));
  const proofProvider = httpClientProofProvider(config.proverServerUri, zkConfigProvider);
  const publicDataProvider = indexerPublicDataProvider(
    config.indexerUri,
    config.indexerWsUri,
    WebSocket as unknown as Parameters<typeof indexerPublicDataProvider>[2],
  );

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => addresses.shieldedCoinPublicKey as ledgerApi.CoinPublicKey,
    getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey as ledgerApi.EncPublicKey,
    async balanceTx(tx: ledgerApi.Transaction<ledgerApi.SignatureEnabled, ledgerApi.Proof, ledgerApi.PreBinding>) {
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
  };
  const midnightProvider: MidnightProvider = {
    async submitTx(tx: ledgerApi.FinalizedTransaction) {
      onStatus?.('Submitting transaction');
      try {
        await wallet.submitTransaction(toHex(tx.serialize()));
        return tx.identifiers()[0];
      } finally {
        onStatus?.(undefined);
      }
    },
  };

  const privateStates = memoryPrivateStateProvider();
  return {
    wallet,
    config,
    networkId,
    shieldedAddress: addresses.shieldedAddress,
    privateStates,
    providers: { privateStateProvider: privateStates, zkConfigProvider, proofProvider, publicDataProvider, walletProvider, midnightProvider },
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

  private constructor(
    private readonly session: LaceSession,
    readonly contractAddress: string,
  ) {
    this.where = `Lace wallet, network "${session.networkId}", proofs by ${session.config.proverServerUri}`;
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
    session.privateStates.setContractAddress(address);
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
    session.privateStates.setContractAddress(address);
    for (const [party, state] of Object.entries(states)) await backend.setPrivateState(party as Party, state);
    return backend;
  }

  async readLedger(): Promise<Ledger> {
    const state = await this.session.providers.publicDataProvider.queryContractState(this.contractAddress);
    if (!state) throw new Error('The indexer has no state for this contract yet');
    return readLedgerState(state.data);
  }

  async publicStateDump(): Promise<string | undefined> {
    const state = await this.session.providers.publicDataProvider.queryContractState(this.contractAddress);
    return state?.data?.toString?.(false);
  }

  async getPrivateState(party: Party): Promise<VeridomPrivateState> {
    const s = await this.session.privateStates.get(party);
    if (!s) throw new Error(`No private state for ${party}`);
    return s;
  }

  async setPrivateState(party: Party, state: VeridomPrivateState): Promise<void> {
    await this.session.privateStates.set(party, state);
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
