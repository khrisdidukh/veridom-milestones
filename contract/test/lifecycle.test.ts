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
  it('pins only the hash of the deployer secret as lender', async () => {
    const secret = randomBytes32();
    const sim = await MilestonesSimulator.create(BANK, createPrivateState(secret));
    expect(bytesEqual(sim.ledger.lender, pureCircuits.lenderKey(secret))).toBe(true);
    expect(bytesEqual(sim.ledger.lender, secret)).toBe(false);
  });

  it('separates the lender and builder identities derived from one secret', async () => {
    const secret = randomBytes32();
    expect(bytesEqual(pureCircuits.lenderKey(secret), pureCircuits.builderKey(secret))).toBe(false);
  });

  it('lets the lender register and revoke inspectors', async () => {
    const { sim } = await setup();
    const extra = generateInspectorKeyPair();
    await sim.registerInspector(BANK, 9n, extra.pk);
    expect(sim.ledger.inspectors.member(9n)).toBe(true);
    expect(sim.ledger.inspectors.lookup(9n).x).toBe(extra.pk.x);
    await sim.revokeInspector(BANK, 9n);
    expect(sim.ledger.inspectors.member(9n)).toBe(false);
  });

  it('rejects inspector management by anyone but the lender', async () => {
    const { sim } = await setup();
    const rogue = generateInspectorKeyPair();
    await expect(sim.registerInspector(STRANGER, 99n, rogue.pk)).rejects.toThrow('Only the lender can do this');
    await expect(sim.registerInspector(BUILDER, 99n, rogue.pk)).rejects.toThrow('Only the lender can do this');
    await expect(sim.revokeInspector(STRANGER, 7n)).rejects.toThrow('Only the lender can do this');
    expect(sim.ledger.inspectors.member(99n)).toBe(false);
  });

  it('rejects revoking an unknown inspector', async () => {
    const { sim } = await setup();
    await expect(sim.revokeInspector(BANK, 404n)).rejects.toThrow('Inspector not found');
  });
});

describe('project registration and acceptance', () => {
  it('publishes the terms only as a commitment', async () => {
    const { sim, projectId, project, builderSecret } = await setup({ accept: false });
    const p = sim.ledger.projects.lookup(projectId);
    expect(bytesEqual(p.termsCommitment, project.termsCommitment)).toBe(true);
    expect(bytesEqual(p.builder, pureCircuits.builderKey(builderSecret))).toBe(true);
    expect(p.stageCount).toBe(3n);
    expect(p.accepted).toBe(false);
    expect(p.stagesAttested).toBe(0n);
  });

  it('rejects registration by a non-lender, duplicates and invalid plans', async () => {
    const { sim, projectId, project } = await setup({ accept: false });
    const builderKey = sim.ledger.projects.lookup(projectId).builder;
    await expect(sim.registerProject(STRANGER, randomBytes32(), builderKey, project.termsCommitment, 3n)).rejects.toThrow(
      'Only the lender can do this',
    );
    await expect(sim.registerProject(BANK, projectId, builderKey, project.termsCommitment, 3n)).rejects.toThrow(
      'Project already registered',
    );
    await expect(sim.registerProject(BANK, randomBytes32(), builderKey, project.termsCommitment, 0n)).rejects.toThrow(
      'A plan has between 1 and 6 stages',
    );
    await expect(sim.registerProject(BANK, randomBytes32(), builderKey, project.termsCommitment, 7n)).rejects.toThrow(
      'A plan has between 1 and 6 stages',
    );
  });

  it('lets only the named builder accept, once, with the approved terms', async () => {
    const { sim, projectId } = await setup({ accept: false });
    await expect(sim.acceptProject(STRANGER, projectId)).rejects.toThrow('Only the builder of this project can do this');
    await expect(sim.acceptProject(BANK, projectId)).rejects.toThrow('Only the builder of this project can do this');
    await sim.acceptProject(BUILDER, projectId);
    expect(sim.ledger.projects.lookup(projectId).accepted).toBe(true);
    await expect(sim.acceptProject(BUILDER, projectId)).rejects.toThrow('Project already accepted');
  });

  it('rejects acceptance when the builder holds different terms than the bank committed to', async () => {
    const builderSecret = randomBytes32();
    const sim = await MilestonesSimulator.create(BANK, createPrivateState());
    const approved = planProject(createPrivateState(builderSecret), PLAN);
    // The builder's local copy claims a higher limit than the bank approved.
    const inflated = planProject(createPrivateState(builderSecret), { ...PLAN, limit: EUR(900_000) }, approved.projectId);
    sim.addParty(BUILDER, inflated.state);
    await sim.registerProject(BANK, approved.projectId, pureCircuits.builderKey(builderSecret), approved.termsCommitment, 3n);
    await expect(sim.acceptProject(BUILDER, approved.projectId)).rejects.toThrow(
      'Loan terms do not match the approved commitment',
    );
  });

  it('rejects calls on an unknown project', async () => {
    const { sim } = await setup();
    await expect(sim.attestMilestone(BUILDER, randomBytes32(), 0n)).rejects.toThrow('Unknown project');
  });
});

describe('full draw schedule', () => {
  it('runs attest -> request -> release for every stage and ends within the limit', async () => {
    const s = await setup();
    const { sim, projectId } = s;
    const amounts = [EUR(110_000), EUR(95_000), EUR(80_000)];

    for (const [i, amount] of amounts.entries()) {
      const stage = BigInt(i);
      await inspectStage(s, stage, amount);
      await sim.attestMilestone(BUILDER, projectId, stage);
      expect(sim.ledger.stages.lookup(projectId).lookup(stage).status).toBe(StageStatus.Attested);

      const before = sim.ledger.projects.lookup(projectId).drawnCommitment;
      await sim.requestTranche(BUILDER, projectId, stage);
      const after = sim.ledger.projects.lookup(projectId).drawnCommitment;
      expect(bytesEqual(before, after)).toBe(false);
      expect(sim.ledger.stages.lookup(projectId).lookup(stage).status).toBe(StageStatus.TrancheRequested);

      await sim.releaseTranche(BANK, projectId, stage);
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
    const s = await setup();
    await inspectStage(s, 0n, EUR(100_000));
    await s.sim.attestMilestone(BUILDER, s.projectId, 0n);
    await s.sim.requestTranche(BUILDER, s.projectId, 0n);
    const local = Object.values(s.sim.privateState(BUILDER).projects)[0].stages['0'];
    const onChain = s.sim.ledger.stages.lookup(s.projectId).lookup(0n).trancheCommitment;
    expect(bytesEqual(pureCircuits.amountCommitment(EUR(100_000), local.trancheSalt!), onChain)).toBe(true);
    expect(bytesEqual(pureCircuits.amountCommitment(EUR(100_001), local.trancheSalt!), onChain)).toBe(false);
  });

  it('rejects release by anyone but the lender and release without a request', async () => {
    const s = await setup();
    await inspectStage(s, 0n, EUR(50_000));
    await s.sim.attestMilestone(BUILDER, s.projectId, 0n);
    await expect(s.sim.releaseTranche(BANK, s.projectId, 0n)).rejects.toThrow('No open tranche request for this stage');
    await s.sim.requestTranche(BUILDER, s.projectId, 0n);
    await expect(s.sim.releaseTranche(BUILDER, s.projectId, 0n)).rejects.toThrow('Only the lender can do this');
    await expect(s.sim.releaseTranche(BANK, s.projectId, 1n)).rejects.toThrow('Stage not attested');
    await s.sim.releaseTranche(BANK, s.projectId, 0n);
    await expect(s.sim.releaseTranche(BANK, s.projectId, 0n)).rejects.toThrow('No open tranche request for this stage');
  });
});
