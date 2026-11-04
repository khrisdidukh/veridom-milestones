// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Helpers that prepare a builder's private state for a project: loan terms,
// evidence bundles and planned draws. Pure functions, shared by the tests and
// the frontend.

import { pureCircuits, type LoanTerms, type Schnorr_SchnorrSignature } from './managed/veridom-milestones/contract/index.js';
import { randomBytes32, sha256, toHex } from './bytes.js';
import type { StageSecrets, VeridomPrivateState } from './witnesses.js';

export const MAX_STAGES = 6;

/** A typical private-home draw schedule; banks set their own. */
export const DEFAULT_STAGE_NAMES = [
  'Foundation',
  'Shell',
  'Roof',
  'Windows and envelope',
  'Building services',
  'Finishes and handover',
] as const;

export type ProjectPlan = {
  /** Approved loan limit in euro cents. */
  limit: bigint;
  /** Maximum draw per stage in euro cents, one entry per planned stage (1..6). */
  stageCaps: bigint[];
};

export type PlannedProject = {
  state: VeridomPrivateState;
  projectId: Uint8Array;
  /** Goes on chain via registerProject. */
  termsCommitment: Uint8Array;
  stageCount: bigint;
  /** Shared with the bank off chain, inside the loan agreement. */
  terms: LoanTerms;
  termsSalt: Uint8Array;
};

export const toLoanTerms = (plan: ProjectPlan): LoanTerms => {
  if (plan.stageCaps.length < 1 || plan.stageCaps.length > MAX_STAGES) {
    throw new Error(`A plan has between 1 and ${MAX_STAGES} stages`);
  }
  const caps = [...plan.stageCaps];
  while (caps.length < MAX_STAGES) caps.push(0n);
  return { limit: plan.limit, stageCaps: caps };
};

/** The builder's side of a new loan: picks a project id and a salt, keeps the terms private. */
export const planProject = (
  state: VeridomPrivateState,
  plan: ProjectPlan,
  projectId: Uint8Array = randomBytes32(),
): PlannedProject => {
  const terms = toLoanTerms(plan);
  const termsSalt = randomBytes32();
  return {
    state: {
      ...state,
      projects: {
        ...state.projects,
        [toHex(projectId)]: { terms, termsSalt, drawnTotal: 0n, drawnSalt: new Uint8Array(32), stages: {} },
      },
    },
    projectId,
    termsCommitment: pureCircuits.termsCommitment(terms, termsSalt),
    stageCount: BigInt(plan.stageCaps.length),
    terms,
    termsSalt,
  };
};

/** Stores the evidence and the inspector's signature for one stage. */
export const addStageEvidence = (
  state: VeridomPrivateState,
  projectId: Uint8Array,
  stage: bigint,
  evidence: {
    evidenceHash: Uint8Array;
    inspectorId: bigint;
    signature: Schnorr_SchnorrSignature;
    trancheAmount: bigint;
    evidenceSalt?: Uint8Array;
  },
): VeridomPrivateState => {
  const key = toHex(projectId);
  const p = state.projects[key];
  if (!p) throw new Error('Unknown project in private state');
  const s: StageSecrets = {
    evidenceHash: evidence.evidenceHash,
    evidenceSalt: evidence.evidenceSalt ?? randomBytes32(),
    inspectorId: evidence.inspectorId,
    signature: evidence.signature,
    trancheAmount: evidence.trancheAmount,
  };
  return { ...state, projects: { ...state.projects, [key]: { ...p, stages: { ...p.stages, [stage.toString()]: s } } } };
};

/** Changes the planned draw for a stage before the tranche is requested. */
export const setTrancheAmount = (
  state: VeridomPrivateState,
  projectId: Uint8Array,
  stage: bigint,
  amount: bigint,
): VeridomPrivateState => {
  const key = toHex(projectId);
  const p = state.projects[key];
  const s = p?.stages[stage.toString()];
  if (!p || !s) throw new Error('No evidence stored for this stage');
  return {
    ...state,
    projects: { ...state.projects, [key]: { ...p, stages: { ...p.stages, [stage.toString()]: { ...s, trancheAmount: amount } } } },
  };
};

export type EvidenceItem = {
  kind: 'photo' | 'invoice' | 'contractor' | 'inspection-report' | 'other';
  name: string;
  /** Hex SHA-256 of the file or record. */
  sha256: string;
  size: number;
};

/**
 * Hash of an evidence bundle: SHA-256 over a canonical manifest of its items.
 * Only this hash enters the contract, and only inside a commitment.
 */
export const evidenceBundleHash = async (items: EvidenceItem[]): Promise<Uint8Array> => {
  const sorted = [...items].sort((a, b) => (a.kind + a.name).localeCompare(b.kind + b.name));
  const manifest = JSON.stringify({ format: 'veridom-evidence/1', items: sorted });
  return sha256(manifest);
};
