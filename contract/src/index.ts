// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Public entry point of the contract package. The generated bindings live in
// src/managed/veridom-milestones, produced by `npm run compile`.

export {
  Contract,
  ledger,
  pureCircuits,
  StageStatus,
  FactKind,
  type Ledger,
  type LoanTerms,
  type Project,
  type StageRecord,
  type MilestoneEvidence,
  type DisclosureReceipt,
  type Schnorr_SchnorrSignature,
  type Witnesses,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/veridom-milestones/contract/index.js';

export * from './witnesses.js';
export * from './bytes.js';
export * from './inspector.js';
export * from './project.js';
export * from './disclosure.js';
export * from './simulator.js';

/** Circuits that produce proofs and need keys from src/managed/veridom-milestones/keys. */
export const PROVABLE_CIRCUITS = [
  'registerInspector',
  'revokeInspector',
  'registerProject',
  'releaseTranche',
  'acceptProject',
  'attestMilestone',
  'requestTranche',
  'discloseToAuditor',
] as const;
export type ProvableCircuitId = (typeof PROVABLE_CIRCUITS)[number];
