// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Private state and witnesses. Everything in VeridomPrivateState stays on the
// caller's machine. The circuits receive it only through the witnesses below and
// verify every value against an on-chain commitment or signature before use.

import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type {
  Ledger,
  LoanTerms,
  MilestoneEvidence,
  Schnorr_SchnorrSignature,
  Witnesses,
} from './managed/veridom-milestones/contract/index.js';
import { randomBytes32, toHex } from './bytes.js';

export const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;

/** What the builder holds for one stage of the plan. */
export type StageSecrets = {
  /** SHA-256 of the evidence bundle: photos, invoices, contractor list. */
  evidenceHash: Uint8Array;
  evidenceSalt: Uint8Array;
  inspectorId: bigint;
  signature: Schnorr_SchnorrSignature;
  /** The draw the builder intends to request for this stage, in euro cents. */
  trancheAmount: bigint;
  /** Set when the tranche is requested: the opening of the tranche commitment. */
  trancheSalt?: Uint8Array;
};

/** What the builder holds for one project. */
export type ProjectSecrets = {
  terms: LoanTerms;
  termsSalt: Uint8Array;
  /** Cumulative amount drawn so far and the salt of its on-chain commitment. */
  drawnTotal: bigint;
  drawnSalt: Uint8Array;
  stages: Record<string, StageSecrets>;
};

/**
 * One party's private state. The bank's holds only its secret; the builder's
 * holds the terms, the running total and the evidence for every project.
 */
export type VeridomPrivateState = {
  secret: Uint8Array;
  projects: Record<string, ProjectSecrets>;
};

export const createPrivateState = (secret: Uint8Array = randomBytes32()): VeridomPrivateState => ({
  secret,
  projects: {},
});

type Ctx = WitnessContext<Ledger, VeridomPrivateState>;

const project = (ps: VeridomPrivateState, projectId: Uint8Array): ProjectSecrets => {
  const p = ps.projects[toHex(projectId)];
  if (!p) throw new Error('No private data for this project in local state');
  return p;
};

const stageOf = (p: ProjectSecrets, stage: bigint): StageSecrets => {
  const s = p.stages[stage.toString()];
  if (!s) throw new Error(`No private evidence for stage ${stage} in local state`);
  return s;
};

const withProject = (ps: VeridomPrivateState, projectId: Uint8Array, next: ProjectSecrets): VeridomPrivateState => ({
  ...ps,
  projects: { ...ps.projects, [toHex(projectId)]: next },
});

// The explicit Witnesses<VeridomPrivateState> annotation keeps the private
// state type from collapsing to `never` in the midnight-js deploy/call helpers.
export const witnesses: Witnesses<VeridomPrivateState> = {
  localSecret: ({ privateState }: Ctx) => {
    if (privateState.secret?.length !== 32) throw new Error('localSecret: secret must be 32 bytes');
    return [privateState, privateState.secret];
  },

  loanTerms: ({ privateState }: Ctx, projectId: Uint8Array) => {
    const p = project(privateState, projectId);
    return [privateState, [p.terms, p.termsSalt]];
  },

  drawnTotal: ({ privateState }: Ctx, projectId: Uint8Array) => {
    const p = project(privateState, projectId);
    return [privateState, [p.drawnTotal, p.drawnSalt]];
  },

  milestoneEvidence: ({ privateState }: Ctx, projectId: Uint8Array, stage: bigint): [VeridomPrivateState, MilestoneEvidence] => {
    const s = stageOf(project(privateState, projectId), stage);
    return [
      privateState,
      {
        evidenceHash: s.evidenceHash,
        evidenceSalt: s.evidenceSalt,
        inspectorId: s.inspectorId,
        signature: s.signature,
      },
    ];
  },

  trancheAmount: ({ privateState }: Ctx, projectId: Uint8Array, stage: bigint) => {
    const s = stageOf(project(privateState, projectId), stage);
    return [privateState, s.trancheAmount];
  },

  trancheOpening: ({ privateState }: Ctx, projectId: Uint8Array, stage: bigint) => {
    const s = stageOf(project(privateState, projectId), stage);
    if (!s.trancheSalt) throw new Error(`No tranche requested for stage ${stage}`);
    return [privateState, [s.trancheAmount, s.trancheSalt]];
  },

  // Opens the private running total at zero with a fresh salt.
  storeAcceptance: ({ privateState }: Ctx, projectId: Uint8Array) => {
    const p = project(privateState, projectId);
    const salt = randomBytes32();
    return [withProject(privateState, projectId, { ...p, drawnTotal: 0n, drawnSalt: salt }), salt];
  },

  // Records the new running total and the tranche opening with fresh salts.
  storeDraw: ({ privateState }: Ctx, projectId: Uint8Array, stage: bigint, amount: bigint, newTotal: bigint) => {
    const p = project(privateState, projectId);
    const s = stageOf(p, stage);
    const trancheSalt = randomBytes32();
    const drawnSalt = randomBytes32();
    const next: ProjectSecrets = {
      ...p,
      drawnTotal: newTotal,
      drawnSalt,
      stages: { ...p.stages, [stage.toString()]: { ...s, trancheAmount: amount, trancheSalt } },
    };
    return [withProject(privateState, projectId, next), [trancheSalt, drawnSalt]];
  },

  // Witness-assisted reduction for the Schnorr module: the circuit checks
  // q * 2^248 + r == challengeHash with q < 116, so a wrong answer is rejected.
  getSchnorrReduction: ({ privateState }: Ctx, challengeHash: bigint) => [
    privateState,
    [challengeHash / TWO_248, challengeHash % TWO_248],
  ],
};
