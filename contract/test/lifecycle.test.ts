// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Happy path and role checks: deployment, inspectors, projects, the full
// attest -> request -> release cycle for every stage of a plan.

import { describe, expect, it } from 'vitest';
import {
  MilestonesSimulator,
  StageStatus,
  bytesEqual,
  createPrivateState,
  generateInspectorKeyPair,
  planProject,
  pureCircuits,
  randomBytes32,
} from '../src/index.js';
import { BANK, BUILDER, EUR, PLAN, STRANGER, inspectStage, setup } from './fixtures.js';

describe('deployment and roles', () => {
  it('pins only the hash of the deployer secret as lender', () => {
    const secret = randomBytes32();
    const sim = new MilestonesSimulator(BANK, createPrivateState(secret));
    expect(bytesEqual(sim.ledger.lender, pureCircuits.lenderKey(secret))).toBe(true);
    expect(bytesEqual(sim.ledger.lender, secret)).toBe(false);
  });

  it('separates the lender and builder identities derived from one secret', () => {
    const secret = randomBytes32();
    expect(bytesEqual(pureCircuits.lenderKey(secret), pureCircuits.builderKey(secret))).toBe(false);
  });

  it('lets the lender register and revoke inspectors', () => {
    const { sim } = setup();
    const extra = generateInspectorKeyPair();
    sim.registerInspector(BANK, 9n, extra.pk);
    expect(sim.ledger.inspectors.member(9n)).toBe(true);
    expect(sim.ledger.inspectors.lookup(9n).x).toBe(extra.pk.x);
    sim.revokeInspector(BANK, 9n);
    expect(sim.ledger.inspectors.member(9n)).toBe(false);
  });

  it('rejects inspector management by anyone but the lender', () => {
    const { sim } = setup();
    const rogue = generateInspectorKeyPair();
    expect(() => sim.registerInspector(STRANGER, 99n, rogue.pk)).toThrow('Only the lender can do this');
    expect(() => sim.registerInspector(BUILDER, 99n, rogue.pk)).toThrow('Only the lender can do this');
    expect(() => sim.revokeInspector(STRANGER, 7n)).toThrow('Only the lender can do this');
    expect(sim.ledger.inspectors.member(99n)).toBe(false);
  });

  it('rejects revoking an unknown inspector', () => {
    const { sim } = setup();
    expect(() => sim.revokeInspector(BANK, 404n)).toThrow('Inspector not found');
  });
});

describe('project registration and acceptance', () => {
  it('publishes the terms only as a commitment', () => {
    const { sim, projectId, project, builderSecret } = setup({ accept: false });
    const p = sim.ledger.projects.lookup(projectId);
    expect(bytesEqual(p.termsCommitment, project.termsCommitment)).toBe(true);
    expect(bytesEqual(p.builder, pureCircuits.builderKey(builderSecret))).toBe(true);
    expect(p.stageCount).toBe(3n);
    expect(p.accepted).toBe(false);
    expect(p.stagesAttested).toBe(0n);
  });

  it('rejects registration by a non-lender, duplicates and invalid plans', () => {
    const { sim, projectId, project } = setup({ accept: false });
    const builderKey = sim.ledger.projects.lookup(projectId).builder;
    expect(() => sim.registerProject(STRANGER, randomBytes32(), builderKey, project.termsCommitment, 3n)).toThrow(
      'Only the lender can do this',
    );
    expect(() => sim.registerProject(BANK, projectId, builderKey, project.termsCommitment, 3n)).toThrow(
      'Project already registered',
    );
    expect(() => sim.registerProject(BANK, randomBytes32(), builderKey, project.termsCommitment, 0n)).toThrow(
      'A plan has between 1 and 6 stages',
    );
    expect(() => sim.registerProject(BANK, randomBytes32(), builderKey, project.termsCommitment, 7n)).toThrow(
      'A plan has between 1 and 6 stages',
    );
  });

  it('lets only the named builder accept, once, with the approved terms', () => {
    const { sim, projectId } = setup({ accept: false });
    expect(() => sim.acceptProject(STRANGER, projectId)).toThrow('Only the builder of this project can do this');
    expect(() => sim.acceptProject(BANK, projectId)).toThrow('Only the builder of this project can do this');
    sim.acceptProject(BUILDER, projectId);
    expect(sim.ledger.projects.lookup(projectId).accepted).toBe(true);
    expect(() => sim.acceptProject(BUILDER, projectId)).toThrow('Project already accepted');
  });

  it('rejects acceptance when the builder holds different terms than the bank committed to', () => {
    const builderSecret = randomBytes32();
    const sim = new MilestonesSimulator(BANK, createPrivateState());
    const approved = planProject(createPrivateState(builderSecret), PLAN);
    // The builder's local copy claims a higher limit than the bank approved.
    const inflated = planProject(createPrivateState(builderSecret), { ...PLAN, limit: EUR(900_000) }, approved.projectId);
    sim.addParty(BUILDER, inflated.state);
    sim.registerProject(BANK, approved.projectId, pureCircuits.builderKey(builderSecret), approved.termsCommitment, 3n);
    expect(() => sim.acceptProject(BUILDER, approved.projectId)).toThrow(
      'Loan terms do not match the approved commitment',
    );
  });

  it('rejects calls on an unknown project', () => {
    const { sim } = setup();
    expect(() => sim.attestMilestone(BUILDER, randomBytes32(), 0n)).toThrow('Unknown project');
  });
});

describe('full draw schedule', () => {
  it('runs attest -> request -> release for every stage and ends within the limit', async () => {
    const s = setup();
    const { sim, projectId } = s;
    const amounts = [EUR(110_000), EUR(95_000), EUR(80_000)];

    for (const [i, amount] of amounts.entries()) {
      const stage = BigInt(i);
      await inspectStage(s, stage, amount);
      sim.attestMilestone(BUILDER, projectId, stage);
      expect(sim.ledger.stages.lookup(projectId).lookup(stage).status).toBe(StageStatus.Attested);

      const before = sim.ledger.projects.lookup(projectId).drawnCommitment;
      sim.requestTranche(BUILDER, projectId, stage);
      const after = sim.ledger.projects.lookup(projectId).drawnCommitment;
      expect(bytesEqual(before, after)).toBe(false);
      expect(sim.ledger.stages.lookup(projectId).lookup(stage).status).toBe(StageStatus.TrancheRequested);

      sim.releaseTranche(BANK, projectId, stage);
      expect(sim.ledger.stages.lookup(projectId).lookup(stage).status).toBe(StageStatus.TrancheReleased);
    }

    const p = sim.ledger.projects.lookup(projectId);
    expect(p.stagesAttested).toBe(3n);
    expect(p.tranchesReleased).toBe(3n);
    expect(sim.ledger.attestationCount).toBe(3n);

    // The running total lives only in the builder's private state, and it opens
    // the public commitment.
    const local = sim.privateState(BUILDER).projects[Object.keys(sim.privateState(BUILDER).projects)[0]];
    expect(local.drawnTotal).toBe(EUR(285_000));
    expect(bytesEqual(pureCircuits.amountCommitment(local.drawnTotal, local.drawnSalt), p.drawnCommitment)).toBe(true);
  });

  it('lets the bank check a tranche amount sent off chain against the ledger', async () => {
    const s = setup();
    await inspectStage(s, 0n, EUR(100_000));
    s.sim.attestMilestone(BUILDER, s.projectId, 0n);
    s.sim.requestTranche(BUILDER, s.projectId, 0n);
    const local = Object.values(s.sim.privateState(BUILDER).projects)[0].stages['0'];
    const onChain = s.sim.ledger.stages.lookup(s.projectId).lookup(0n).trancheCommitment;
    expect(bytesEqual(pureCircuits.amountCommitment(EUR(100_000), local.trancheSalt!), onChain)).toBe(true);
    expect(bytesEqual(pureCircuits.amountCommitment(EUR(100_001), local.trancheSalt!), onChain)).toBe(false);
  });

  it('rejects release by anyone but the lender and release without a request', async () => {
    const s = setup();
    await inspectStage(s, 0n, EUR(50_000));
    s.sim.attestMilestone(BUILDER, s.projectId, 0n);
    expect(() => s.sim.releaseTranche(BANK, s.projectId, 0n)).toThrow('No open tranche request for this stage');
    s.sim.requestTranche(BUILDER, s.projectId, 0n);
    expect(() => s.sim.releaseTranche(BUILDER, s.projectId, 0n)).toThrow('Only the lender can do this');
    expect(() => s.sim.releaseTranche(BANK, s.projectId, 1n)).toThrow('Stage not attested');
    s.sim.releaseTranche(BANK, s.projectId, 0n);
    expect(() => s.sim.releaseTranche(BANK, s.projectId, 0n)).toThrow('No open tranche request for this stage');
  });
});
