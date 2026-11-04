// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Shared test fixtures: a bank, a builder, two inspectors and one approved,
// accepted project with a three-stage plan.

import {
  MilestonesSimulator,
  addStageEvidence,
  createPrivateState,
  evidenceBundleHash,
  generateInspectorKeyPair,
  planProject,
  pureCircuits,
  randomBytes32,
  signMilestone,
  type InspectorKeyPair,
  type PlannedProject,
  type ProjectPlan,
} from '../src/index.js';

export const BANK = 'bank';
export const BUILDER = 'builder';
export const STRANGER = 'stranger';

export const EUR = (euros: number): bigint => BigInt(Math.round(euros * 100));

// Limit 300,000 EUR; caps per stage 120k / 100k / 90k.
export const PLAN: ProjectPlan = { limit: EUR(300_000), stageCaps: [EUR(120_000), EUR(100_000), EUR(90_000)] };

export type Scenario = {
  sim: MilestonesSimulator;
  bankSecret: Uint8Array;
  builderSecret: Uint8Array;
  inspector: InspectorKeyPair;
  inspectorId: bigint;
  project: PlannedProject;
  projectId: Uint8Array;
};

export const evidenceFor = (label: string) =>
  evidenceBundleHash([
    { kind: 'photo', name: `${label}-north.jpg`, sha256: 'aa'.repeat(32), size: 1_204_331 },
    { kind: 'invoice', name: `${label}-invoice.pdf`, sha256: 'bb'.repeat(32), size: 88_120 },
    { kind: 'contractor', name: 'Baumeister GmbH (example)', sha256: 'cc'.repeat(32), size: 0 },
  ]);

/** Deploys, registers an inspector and a project, and has the builder accept it. */
export const setup = (opts: { accept?: boolean; plan?: ProjectPlan } = {}): Scenario => {
  const bankSecret = randomBytes32();
  const builderSecret = randomBytes32();
  const sim = new MilestonesSimulator(BANK, createPrivateState(bankSecret));
  sim.addParty(STRANGER, createPrivateState());

  const inspector = generateInspectorKeyPair();
  const inspectorId = 7n;
  sim.registerInspector(BANK, inspectorId, inspector.pk);

  const project = planProject(createPrivateState(builderSecret), opts.plan ?? PLAN);
  sim.addParty(BUILDER, project.state);
  sim.registerProject(BANK, project.projectId, pureCircuits.builderKey(builderSecret), project.termsCommitment, project.stageCount);
  if (opts.accept !== false) sim.acceptProject(BUILDER, project.projectId);

  return { sim, bankSecret, builderSecret, inspector, inspectorId, project, projectId: project.projectId };
};

/** The inspector signs stage `stage`; the builder stores the evidence and the planned draw. */
export const inspectStage = async (
  s: Scenario,
  stage: bigint,
  trancheAmount: bigint,
  opts: { signer?: InspectorKeyPair; inspectorId?: bigint; projectId?: Uint8Array; signedStage?: bigint } = {},
) => {
  const evidenceHash = await evidenceFor(`stage-${stage}`);
  const signer = opts.signer ?? s.inspector;
  const signature = signMilestone(
    signer.sk,
    s.sim.contractAddressBytes,
    opts.projectId ?? s.projectId,
    opts.signedStage ?? stage,
    evidenceHash,
  );
  s.sim.setPrivateState(
    BUILDER,
    addStageEvidence(s.sim.privateState(BUILDER), s.projectId, stage, {
      evidenceHash,
      inspectorId: opts.inspectorId ?? s.inspectorId,
      signature,
      trancheAmount,
    }),
  );
  return { evidenceHash, signature };
};
