// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// The wallet path of the web app, end to end on a local Midnight devnet.
//
// The real app runs in Chromium and talks to `window.midnight.mnLace` exactly
// as it does with the Lace extension (DApp Connector API 4.0.1). Here that
// object is a stand-in: each connector call is forwarded to this process, where
// the devnet's genesis-funded headless wallet balances and submits, and the
// local proof server proves. So this covers the app's own code (provider
// wiring, key-material fetching, hex serialisation, the guided run and its
// record) with real transactions and real ZK proofs. It does not cover the
// Lace extension itself.
//
//   npm run compile && npm run devnet:up
//   npx playwright install chromium     (once)
//   npm run test:e2e

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import pino from 'pino';
import { chromium, type Browser, type Page } from 'playwright';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProvingProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { StageStatus, fromHex, ledger, toHex, type ProvableCircuitId } from '../src/index.js';
import { LOCAL_DEVNET_SEED, MidnightWalletProvider, syncWallet } from './wallet.js';

globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;

const here = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(here, '../src/managed/veridom-milestones');
const evidenceLog = path.resolve(here, '../build-evidence/local-devnet-run.log');
const uiDir = path.resolve(here, '../../ui');
const PORT = 5187;

const config = {
  networkId: 'undeployed',
  indexerUri: 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWsUri: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  substrateNodeUri: 'http://127.0.0.1:9944',
  proofServer: process.env['MIDNIGHT_PROOF_SERVER'] ?? 'http://127.0.0.1:6300',
};

const logger = pino({ level: process.env['LOG_LEVEL'] ?? 'warn' });

/** Runs in the page before the app: a wallet object with the connector's shape. */
const installStandIn = (cfg: { networkId: string; indexerUri: string; indexerWsUri: string; substrateNodeUri: string }) => {
  const bridge = (method: string, ...args: unknown[]) =>
    (window as unknown as { __laceBridge: (m: string, a: unknown[]) => Promise<unknown> }).__laceBridge(method, args);
  const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  const bytes = (h: string) => Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16));
  const api = {
    getConfiguration: async () => cfg,
    getConnectionStatus: async () => ({ status: 'connected', networkId: cfg.networkId }),
    getShieldedAddresses: () => bridge('getShieldedAddresses'),
    getDustBalance: async () => ({ cap: 1n, balance: 1n }),
    balanceUnsealedTransaction: (tx: string, options?: unknown) => bridge('balanceUnsealedTransaction', tx, options),
    submitTransaction: (tx: string) => bridge('submitTransaction', tx),
    getProvingProvider: async () => ({
      check: async (preimage: Uint8Array, keyLocation: string) =>
        ((await bridge('check', hex(preimage), keyLocation)) as (string | null)[]).map((v) => (v === null ? undefined : BigInt(v))),
      prove: async (preimage: Uint8Array, keyLocation: string, overwriteBindingInput?: bigint) =>
        bytes((await bridge('prove', hex(preimage), keyLocation, overwriteBindingInput?.toString() ?? null)) as string),
    }),
    hintUsage: async () => undefined,
  };
  (window as unknown as { midnight: unknown }).midnight = {
    mnLace: { rdns: 'test.veridom.lace-stand-in', name: 'Lace stand-in (local devnet)', icon: '', apiVersion: '4.0.1', connect: async () => api },
  };
};

describe('The web app through the wallet connector, on a local Midnight devnet', () => {
  let wallet: MidnightWalletProvider;
  let vite: ChildProcess;
  let browser: Browser;
  let page: Page;
  const calls: string[] = [];
  const browserErrors: string[] = [];

  beforeAll(async () => {
    setNetworkId(config.networkId);
    const env: EnvironmentConfiguration = {
      walletNetworkId: config.networkId,
      networkId: config.networkId,
      indexer: config.indexerUri,
      indexerWS: config.indexerWsUri,
      node: config.substrateNodeUri,
      nodeWS: config.substrateNodeUri.replace(/^http/, 'ws'),
      faucet: '',
      proofServer: config.proofServer,
    };
    wallet = await MidnightWalletProvider.build(logger, env, { kind: 'seed', value: LOCAL_DEVNET_SEED });
    await wallet.start();
    await syncWallet(logger, wallet.wallet, 10 * 60_000);
    const prover = httpClientProvingProvider(config.proofServer, new NodeZkConfigProvider<ProvableCircuitId>(zkConfigPath));

    vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: uiDir, stdio: 'ignore' });
    for (let i = 0; ; i++) {
      if (await fetch(`http://localhost:${PORT}/`).then((r) => r.ok, () => false)) break;
      if (i > 120) throw new Error('The UI dev server did not start');
      await new Promise((r) => setTimeout(r, 500));
    }

    browser = await chromium.launch();
    // RECORD_VIDEO_DIR=<dir> keeps a screen recording of the run (used for the demo video).
    const videoDir = process.env['RECORD_VIDEO_DIR'];
    const size = videoDir ? { width: 1920, height: 1080 } : { width: 1440, height: 1000 };
    const context = await browser.newContext({ viewport: size, ...(videoDir ? { recordVideo: { dir: videoDir, size } } : {}) });
    page = await context.newPage();
    page.on('pageerror', (e) => browserErrors.push(e.message));
    if (process.env['LOG_LEVEL'] === 'debug') page.on('console', (m) => console.log(`[page] ${m.text().slice(0, 300)}`));
    await page.exposeFunction('__laceBridge', async (method: string, args: unknown[]) => {
      calls.push(method);
      switch (method) {
        case 'getShieldedAddresses':
          return { shieldedAddress: '', shieldedCoinPublicKey: wallet.getCoinPublicKey(), shieldedEncryptionPublicKey: wallet.getEncryptionPublicKey() };
        case 'balanceUnsealedTransaction': {
          const tx = Transaction.deserialize('signature', 'proof', 'pre-binding', fromHex(args[0] as string));
          return { tx: toHex((await wallet.balanceTx(tx as unknown as UnboundTransaction)).serialize()) };
        }
        case 'submitTransaction':
          await wallet.submitTx(Transaction.deserialize('signature', 'proof', 'binding', fromHex(args[0] as string)));
          return null;
        case 'check':
          return (await prover.check(fromHex(args[0] as string), args[1] as string)).map((v) => (v === undefined ? null : v.toString()));
        case 'prove':
          return toHex(await prover.prove(fromHex(args[0] as string), args[1] as string, args[2] === null ? undefined : BigInt(args[2] as string)));
        default:
          throw new Error(`Stand-in wallet: ${method} is not implemented`);
      }
    });
    if (videoDir) {
      // A caption for the recording, drawn into the page.
      await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          const el = document.createElement('div');
          el.textContent = 'The same app with real zero-knowledge proofs: a local Midnight devnet, through the wallet connector. Sped up.';
          el.style.cssText =
            'position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:22px 96px 26px;background:#16324b;color:#fbfcfc;' +
            "font:500 31px/1.35 'IBM Plex Sans',system-ui,sans-serif;text-align:center;border-top:4px solid #e3b23c";
          document.documentElement.appendChild(el);
        });
      });
    }
    await page.addInitScript(installStandIn, {
      networkId: config.networkId,
      indexerUri: config.indexerUri,
      indexerWsUri: config.indexerWsUri,
      substrateNodeUri: config.substrateNodeUri,
    });
  });

  afterAll(async () => {
    await page?.context().close();
    await browser?.close();
    vite?.kill();
    await wallet?.stop();
  });

  it('deploys and runs stage 1 from one button, and the indexer agrees with the screen', async () => {
    await page.goto(`http://localhost:${PORT}/?lace=undeployed`);
    await page.getByRole('button', { name: 'Connect Lace', exact: true }).click();
    await page.getByRole('button', { name: 'Deploy and run stage 1', exact: true }).click();
    await page.locator('.guided-done').waitFor({ timeout: 12 * 60_000 });

    // Eight proven transactions, each with a tx id on the screen.
    expect(await page.locator('.guided-steps li.g-done').count()).toBe(8);
    expect(await page.locator('.guided-steps li .g-tx').count()).toBe(8);
    expect(await page.locator('.log li.rejected').count()).toBe(0);
    expect(calls.filter((c) => c === 'submitTransaction').length).toBe(8);
    expect(calls).toContain('prove');

    // The record the app keeps for the reader holds public facts only.
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem('veridom-milestones:last-network-run')!));
    expect(record.network).toBe('undeployed');
    expect(record.steps).toHaveLength(8);
    expect(record.auditorChecks.every((c: { pass: boolean }) => c.pass)).toBe(true);
    expect(JSON.stringify(record)).not.toMatch(/5800000|30000000|secret|salt/i);

    // Read the same contract back from the indexer, independently of the page.
    const state = await indexerPublicDataProvider(config.indexerUri, config.indexerWsUri).queryContractState(record.contractAddress);
    expect(state).not.toBeNull();
    const l = ledger(state!.data);
    expect(l.inspectors.member(7n)).toBe(true);
    expect(l.projects.size()).toBe(1n);
    const [[projectId, project]] = [...l.projects];
    expect(project.accepted).toBe(true);
    expect(project.stagesAttested).toBe(1n);
    expect(project.tranchesReleased).toBe(1n);
    expect(l.stages.lookup(projectId).lookup(0n).status).toBe(StageStatus.TrancheReleased);
    expect(l.usedAttestations.size()).toBe(1n);
    expect(l.disclosureReceipts.size()).toBe(1n);

    // The auditor's panel shows the verified packet.
    await page.getByRole('tab', { name: /^Auditor/ }).click();
    await page.locator('.check.pass').filter({ hasText: 'consent receipt is on the ledger' }).waitFor();
    expect(browserErrors).toEqual([]);

    appendFileSync(
      evidenceLog,
      [
        '# Web app through the wallet connector (stand-in wallet backed by the devnet genesis wallet), guided run:',
        `# contract ${record.contractAddress}`,
        ...record.steps.map((s: { key: string; txId: string; blockHeight: number; seconds: number }) => `${new Date().toISOString()}  ui:${s.key.padEnd(18)} tx ${s.txId}  block ${s.blockHeight}  ${s.seconds} s`),
        '',
      ].join('\n'),
    );
  });
});
