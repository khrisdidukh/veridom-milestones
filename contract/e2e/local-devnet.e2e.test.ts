// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// End to end on a local Midnight devnet: real transactions, real ZK proofs from
// the proof server, state read back from the indexer.
//
//   npm run devnet:up      (node 1.0.400, indexer 4.3.5, proof server 8.1.3)
//   npm run test:e2e
//
// One funded wallet pays the fees for every party. That is possible because
// this contract derives caller identity from a witness secret, not from the
// wallet: bank, builder and auditor are separate private states.

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import pino from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { encodeContractAddress } from '@midnight-ntwrk/compact-runtime';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import {
  Contract,
  FactKind,
  StageStatus,
  addStageEvidence,
  bytesEqual,
  createDisclosurePacket,
  createPrivateState,
  evidenceBundleHash,
  generateInspectorKeyPair,
  ledger,
  planProject,
  pureCircuits,
  randomBytes32,
  setTrancheAmount,
  signMilestone,
  toHex,
  verifyDisclosurePacket,
  witnesses,
  type ProvableCircuitId,
  type VeridomPrivateState,
} from '../src/index.js';
import { LOCAL_DEVNET_SEED, MidnightWalletProvider, syncWallet } from './wallet.js';

globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;

const here = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(here, '../src/managed/veridom-milestones');
const evidenceLog = path.resolve(here, '../build-evidence/local-devnet-run.log');

const config = {
  networkId: 'undeployed',
  indexer: 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  node: 'http://127.0.0.1:9944',
  nodeWS: 'ws://127.0.0.1:9944',
  proofServer: process.env['MIDNIGHT_PROOF_SERVER'] ?? 'http://127.0.0.1:6300',
};

const logger = pino({ level: process.env['LOG_LEVEL'] ?? 'warn' });
const EUR = (n: number) => BigInt(Math.round(n * 100));
const record: string[] = [];
const note = (line: string) => {
  record.push(`${new Date().toISOString()}  ${line}`);
  console.log(line);
};

type VeridomContract = Contract<VeridomPrivateState>;

describe('Veridom Milestones on a local Midnight devnet (real proofs)', () => {
  let wallet: MidnightWalletProvider;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let providers: any;
  let contractAddress: string;
  const compiled = CompiledContract.make<VeridomContract>('VeridomMilestones', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const bankSecret = randomBytes32();
  const builderSecret = randomBytes32();
  const auditorKey = randomBytes32();
  const inspector = generateInspectorKeyPair();
  const plan = planProject(createPrivateState(builderSecret), { limit: EUR(200_000), stageCaps: [EUR(120_000), EUR(100_000)] });
  const projectId = plan.projectId;

  const call = async (party: 'bank' | 'builder', circuit: ProvableCircuitId, args: unknown[]) => {
    const started = Date.now();
    const result = await submitCallTx(providers, {
      compiledContract: compiled,
      contractAddress,
      circuitId: circuit,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: args as any,
      privateStateId: party,
    });
    note(`${circuit.padEnd(18)} as ${party.padEnd(7)} tx ${result.public.txId}  block ${result.public.blockHeight}  ${((Date.now() - started) / 1000).toFixed(1)} s`);
    return result;
  };

  const readLedger = async () => {
    const state = await providers.publicDataProvider.queryContractState(contractAddress);
    expect(state).not.toBeNull();
    return ledger(state!.data);
  };

  beforeAll(async () => {
    setNetworkId(config.networkId);
    const env: EnvironmentConfiguration = {
      walletNetworkId: config.networkId,
      networkId: config.networkId,
      indexer: config.indexer,
      indexerWS: config.indexerWS,
      node: config.node,
      nodeWS: config.nodeWS,
      faucet: '',
      proofServer: config.proofServer,
    };
    wallet = await MidnightWalletProvider.build(logger, env, { kind: 'seed', value: LOCAL_DEVNET_SEED });
    await wallet.start();
    await syncWallet(logger, wallet.wallet, 10 * 60_000);
    const zkConfigProvider = new NodeZkConfigProvider<ProvableCircuitId>(zkConfigPath);
    providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: `veridom-milestones-e2e-${Date.now()}`,
        privateStoragePasswordProvider: () => 'Veridom-E2E-Local-Only!',
        accountId: wallet.getCoinPublicKey(),
      }),
      publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
      walletProvider: wallet,
      midnightProvider: wallet,
    };
    note(`network ${config.networkId}, proof server ${config.proofServer}`);
  });

  afterAll(async () => {
    await wallet?.stop();
    mkdirSync(path.dirname(evidenceLog), { recursive: true });
    writeFileSync(
      evidenceLog,
      [
        '# Veridom Milestones: end-to-end run on a local Midnight devnet',
        '# node 1.0.400, indexer-standalone 4.3.5, proof-server 8.1.3, midnight-js 4.1.1',
        '# Lines with a tx id are real transactions with ZK proofs, accepted by the node.',
        "# 'rejected locally' lines are circuit asserts that failed on the prover's machine:",
        '# no proof can be produced for them, so nothing reaches the chain.',
        ...record,
        '',
      ].join('\n'),
    );
  });

  it('deploys with the bank as lender', async () => {
    const started = Date.now();
    const deployed = await deployContract(providers, {
      compiledContract: compiled,
      privateStateId: 'bank',
      initialPrivateState: createPrivateState(bankSecret),
    });
    contractAddress = deployed.deployTxData.public.contractAddress;
    note(`deploy             as bank    contract ${contractAddress}  ${((Date.now() - started) / 1000).toFixed(1)} s`);
    providers.privateStateProvider.setContractAddress?.(contractAddress);
    await providers.privateStateProvider.set('builder', plan.state);
    const l = await readLedger();
    expect(bytesEqual(l.lender, pureCircuits.lenderKey(bankSecret))).toBe(true);
  });

  it('registers the inspector and the project, and the builder accepts', async () => {
    await call('bank', 'registerInspector', [7n, inspector.pk]);
    await call('bank', 'registerProject', [projectId, pureCircuits.builderKey(builderSecret), plan.termsCommitment, plan.stageCount]);
    await call('builder', 'acceptProject', [projectId]);
    const p = (await readLedger()).projects.lookup(projectId);
    expect(p.accepted).toBe(true);
  });

  it('proves stage 1 complete and draws a tranche within the limit', async () => {
    const evidenceHash = await evidenceBundleHash([
      { kind: 'photo', name: 'foundation-north.jpg', sha256: 'aa'.repeat(32), size: 2_000_000 },
      { kind: 'invoice', name: 'invoice-1.pdf', sha256: 'bb'.repeat(32), size: 80_000 },
    ]);
    const signature = signMilestone(inspector.sk, encodeContractAddress(contractAddress), projectId, 0n, evidenceHash);
    const ps = (await providers.privateStateProvider.get('builder')) as VeridomPrivateState;
    await providers.privateStateProvider.set(
      'builder',
      addStageEvidence(ps, projectId, 0n, { evidenceHash, inspectorId: 7n, signature, trancheAmount: EUR(110_000) }),
    );
    await call('builder', 'attestMilestone', [projectId, 0n]);
    await call('builder', 'requestTranche', [projectId, 0n]);
    await call('bank', 'releaseTranche', [projectId, 0n]);
    const rec = (await readLedger()).stages.lookup(projectId).lookup(0n);
    expect(rec.status).toBe(StageStatus.TrancheReleased);
  });

  it('refuses a replayed attestation and an over-limit tranche before anything reaches the chain', async () => {
    await expect(call('builder', 'attestMilestone', [projectId, 0n])).rejects.toThrow(/Attestation already used/);
    note('attestMilestone    replay rejected locally: Attestation already used');

    const evidenceHash = await evidenceBundleHash([{ kind: 'photo', name: 'shell.jpg', sha256: 'cc'.repeat(32), size: 1_000 }]);
    const signature = signMilestone(inspector.sk, encodeContractAddress(contractAddress), projectId, 1n, evidenceHash);
    let ps = (await providers.privateStateProvider.get('builder')) as VeridomPrivateState;
    ps = addStageEvidence(ps, projectId, 1n, { evidenceHash, inspectorId: 7n, signature, trancheAmount: EUR(95_000) });
    await providers.privateStateProvider.set('builder', ps);
    await call('builder', 'attestMilestone', [projectId, 1n]);
    // 110,000 + 95,000 > 200,000
    await expect(call('builder', 'requestTranche', [projectId, 1n])).rejects.toThrow(/exceed the approved loan limit/);
    note('requestTranche     over-limit rejected locally: Cumulative draw would exceed the approved loan limit');
    ps = (await providers.privateStateProvider.get('builder')) as VeridomPrivateState;
    await providers.privateStateProvider.set('builder', setTrancheAmount(ps, projectId, 1n, EUR(90_000)));
    await call('builder', 'requestTranche', [projectId, 1n]);
  });

  it('opens one fact to an auditor, verified against the indexer', async () => {
    const nonce = randomBytes32();
    await call('builder', 'discloseToAuditor', [projectId, 1n, FactKind.TrancheAmount, auditorKey, nonce]);
    const ps = (await providers.privateStateProvider.get('builder')) as VeridomPrivateState;
    const packet = createDisclosurePacket(ps, { contractAddress, projectId, stage: 1n, fact: 'TrancheAmount', auditor: auditorKey, nonce });
    const result = verifyDisclosurePacket(await readLedger(), packet, { contractAddress, auditor: auditorKey });
    expect(result.valid).toBe(true);
    expect(packet.value).toBe(EUR(90_000).toString());
    const local = ps.projects[toHex(projectId)];
    expect(local.drawnTotal).toBe(EUR(200_000));
    note(`auditor verified   ${result.checks.length} checks passed against indexer state`);
  });
});
