// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// The guided run: one button deploys a fresh contract and walks stage 1 through
// every circuit. This file holds its fixed plan, the sample evidence bundle and
// the run record that is kept in the browser so it survives a reload.

import { sha256, toHex, type EvidenceItem } from '@veridom/milestones-contract';

export type GuidedStep = {
  key: string;
  label: string;
  /** What this transaction proves, in one line. */
  proves: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  txId?: string;
  blockHeight?: number;
  seconds?: number;
  detail?: string;
};

export const GUIDED_STEPS: Pick<GuidedStep, 'key' | 'label' | 'proves'>[] = [
  { key: 'deploy', label: 'Bank deploys the contract', proves: 'The hash of the bank’s secret becomes the lender key.' },
  { key: 'registerInspector', label: 'Bank authorises inspector #7', proves: 'Only the lender can add a signing key to the panel.' },
  { key: 'registerProject', label: 'Bank registers the loan', proves: 'The chain gets a commitment to the terms, not the terms.' },
  { key: 'acceptProject', label: 'Builder accepts', proves: 'The builder holds exactly the terms the bank committed to.' },
  { key: 'attestMilestone', label: 'Builder proves stage 1 is complete', proves: 'An authorised inspector signed this evidence for this stage.' },
  { key: 'requestTranche', label: 'Builder requests tranche 1', proves: 'The amount fits the stage cap and the total stays within the limit.' },
  { key: 'releaseTranche', label: 'Bank releases tranche 1', proves: 'Only the lender can mark a requested tranche as paid.' },
  { key: 'discloseToAuditor', label: 'Builder opens one fact to an auditor', proves: 'Consent is recorded as a salted receipt; the value travels off chain.' },
];

/** Euro cents. The same plan as the form defaults. */
export const GUIDED_PLAN = {
  limit: 300_000_00n,
  caps: [60_000_00n, 95_000_00n, 55_000_00n, 45_000_00n, 40_000_00n, 25_000_00n],
  firstTranche: 58_000_00n,
};

export const sampleBundle = async (stage: number, name: string): Promise<EvidenceItem[]> => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const nonce = toHex(globalThis.crypto.getRandomValues(new Uint8Array(8)));
  const mk = async (kind: EvidenceItem['kind'], file: string, size: number): Promise<EvidenceItem> => ({
    kind,
    name: file,
    size,
    sha256: toHex(await sha256(`${nonce}:${file}`)),
  });
  return Promise.all([
    mk('photo', `${slug}-north.jpg`, 2_314_002),
    mk('photo', `${slug}-south.jpg`, 2_198_771),
    mk('photo', `${slug}-detail.jpg`, 1_604_310),
    mk('invoice', `invoice-stage-${stage + 1}.pdf`, 84_211),
    mk('contractor', `contractor-record-stage-${stage + 1}.json`, 1_102),
  ]);
};

/** Public facts about one run. Holds no secret, no amount and no evidence hash. */
export type RunEvidence = {
  app: 'veridom-milestones';
  network: string;
  where?: string;
  contractAddress?: string;
  startedAt: string;
  finishedAt?: string;
  steps: { key: string; label: string; txId?: string; blockHeight?: number; seconds?: number }[];
  auditorChecks?: { label: string; pass: boolean }[];
  error?: { step: string; message: string };
};

const KEY = 'veridom-milestones:last-network-run';

export const saveEvidence = (e: RunEvidence): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    /* private window or blocked storage: the panel still shows the record */
  }
};

export const loadEvidence = (): RunEvidence | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RunEvidence) : null;
  } catch {
    return null;
  }
};
