// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Milestone attestations: authorised inspectors only, signatures bound to
// contract / project / stage / evidence, no replay, stages in order.

import { describe, expect, it } from 'vitest';
import {
  MilestonesSimulator,
  StageStatus,
  addStageEvidence,
  bytesEqual,
  createPrivateState,
  generateInspectorKeyPair,
  planProject,
  pureCircuits,
  randomBytes32,
  signMilestone,
} from '../src/index.js';
import { BANK, BUILDER, EUR, PLAN, STRANGER, evidenceFor, inspectStage, setup } from './fixtures.js';

describe('attestMilestone: happy path', () => {
  it('records stage 0 as attested with an evidence commitment, not the evidence hash', async () => {
    const s = await setup();
    const { evidenceHash } = await inspectStage(s, 0n, EUR(100_000));
    await s.sim.attestMilestone(BUILDER, s.projectId, 0n);

    const rec = s.sim.ledger.stages.lookup(s.projectId).lookup(0n);
    expect(rec.status).toBe(StageStatus.Attested);
    expect(rec.inspectorId).toBe(s.inspectorId);
    expect(bytesEqual(rec.evidenceCommitment, evidenceHash)).toBe(false);
    const local = Object.values(s.sim.privateState(BUILDER).projects)[0].stages['0'];
    expect(bytesEqual(pureCircuits.evidenceCommitment(evidenceHash, local.evidenceSalt), rec.evidenceCommitment)).toBe(true);
    expect(s.sim.ledger.usedAttestations.size()).toBe(1n);
    expect(s.sim.ledger.projects.lookup(s.projectId).stagesAttested).toBe(1n);
  });
});

describe('attestMilestone: unauthorised inspectors', () => {
  it('rejects an inspector id the bank never registered', async () => {
    const s = await setup();
    await inspectStage(s, 0n, EUR(100_000), { signer: generateInspectorKeyPair(), inspectorId: 42n });
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 0n)).rejects.toThrow('Inspector is not authorised');
  });

  it('rejects a rogue key that claims a registered inspector id', async () => {
    const s = await setup();
    await inspectStage(s, 0n, EUR(100_000), { signer: generateInspectorKeyPair() });
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 0n)).rejects.toThrow('Invalid inspector signature');
  });

  it('rejects a signature from an inspector the bank has revoked', async () => {
    const s = await setup();
    await inspectStage(s, 0n, EUR(100_000));
    await s.sim.revokeInspector(BANK, s.inspectorId);
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 0n)).rejects.toThrow('Inspector is not authorised');
  });

  it('rejects evidence swapped after the inspector signed', async () => {
    const s = await setup();
    const { signature } = await inspectStage(s, 0n, EUR(100_000));
    const other = await evidenceFor('a-different-bundle');
    s.sim.setPrivateState(
      BUILDER,
      addStageEvidence(s.sim.privateState(BUILDER), s.projectId, 0n, {
        evidenceHash: other,
        inspectorId: s.inspectorId,
        signature,
        trancheAmount: EUR(100_000),
      }),
    );
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 0n)).rejects.toThrow('Invalid inspector signature');
  });

  it('rejects a forged challenge reduction (Schnorr quotient out of range)', async () => {
    const bankSecret = randomBytes32();
    const builderSecret = randomBytes32();
    const sim = await MilestonesSimulator.create(BANK, createPrivateState(bankSecret), {
      // A malicious prover answers the division with an out-of-range quotient.
      getSchnorrReduction: ({ privateState }, h) => [privateState, [116n, h % 2n ** 248n]],
    });
    const inspector = generateInspectorKeyPair();
    await sim.registerInspector(BANK, 1n, inspector.pk);
    const project = planProject(createPrivateState(builderSecret), PLAN);
    sim.addParty(BUILDER, project.state);
    await sim.registerProject(BANK, project.projectId, pureCircuits.builderKey(builderSecret), project.termsCommitment, 3n);
    await sim.acceptProject(BUILDER, project.projectId);
    const evidenceHash = await evidenceFor('forged');
    const signature = signMilestone(inspector.sk, sim.contractAddressBytes, project.projectId, 0n, evidenceHash);
    sim.setPrivateState(
      BUILDER,
      addStageEvidence(sim.privateState(BUILDER), project.projectId, 0n, {
        evidenceHash,
        inspectorId: 1n,
        signature,
        trancheAmount: 1n,
      }),
    );
    await expect(sim.attestMilestone(BUILDER, project.projectId, 0n)).rejects.toThrow('Schnorr quotient out of range');
  });
});

describe('attestMilestone: replay protection', () => {
  it('rejects the same attestation submitted twice', async () => {
    const s = await setup();
    await inspectStage(s, 0n, EUR(100_000));
    await s.sim.attestMilestone(BUILDER, s.projectId, 0n);
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 0n)).rejects.toThrow('Attestation already used');
    expect(s.sim.ledger.attestationCount).toBe(1n);
  });

  it('rejects a stage-0 signature reused for stage 1', async () => {
    const s = await setup();
    const { signature, evidenceHash } = await inspectStage(s, 0n, EUR(100_000));
    await s.sim.attestMilestone(BUILDER, s.projectId, 0n);
    s.sim.setPrivateState(
      BUILDER,
      addStageEvidence(s.sim.privateState(BUILDER), s.projectId, 1n, {
        evidenceHash,
        inspectorId: s.inspectorId,
        signature,
        trancheAmount: EUR(50_000),
      }),
    );
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 1n)).rejects.toThrow('Invalid inspector signature');
  });

  it('rejects a signature issued for another project', async () => {
    const s = await setup();
    await inspectStage(s, 0n, EUR(100_000), { projectId: randomBytes32() });
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 0n)).rejects.toThrow('Invalid inspector signature');
  });

  it('rejects a signature issued for another contract instance', async () => {
    const s = await setup();
    const evidenceHash = await evidenceFor('stage-0');
    const otherContract = randomBytes32();
    const signature = signMilestone(s.inspector.sk, otherContract, s.projectId, 0n, evidenceHash);
    s.sim.setPrivateState(
      BUILDER,
      addStageEvidence(s.sim.privateState(BUILDER), s.projectId, 0n, {
        evidenceHash,
        inspectorId: s.inspectorId,
        signature,
        trancheAmount: EUR(10_000),
      }),
    );
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 0n)).rejects.toThrow('Invalid inspector signature');
  });
});

describe('attestMilestone: order and roles', () => {
  it('requires stages in order and within the plan', async () => {
    const s = await setup();
    await inspectStage(s, 1n, EUR(50_000));
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 1n)).rejects.toThrow('Stages must be attested in order');
    await inspectStage(s, 0n, EUR(50_000));
    await s.sim.attestMilestone(BUILDER, s.projectId, 0n);
    await s.sim.attestMilestone(BUILDER, s.projectId, 1n);
    await inspectStage(s, 2n, EUR(50_000));
    await s.sim.attestMilestone(BUILDER, s.projectId, 2n);
    await inspectStage(s, 3n, EUR(1_000));
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 3n)).rejects.toThrow('Stage is not in the plan');
  });

  it('rejects attestation before the builder accepted the project', async () => {
    const s = await setup({ accept: false });
    await inspectStage(s, 0n, EUR(50_000));
    await expect(s.sim.attestMilestone(BUILDER, s.projectId, 0n)).rejects.toThrow(
      'The builder has not accepted this project yet',
    );
  });

  it('rejects attestation submitted by anyone but the builder', async () => {
    const s = await setup();
    await inspectStage(s, 0n, EUR(50_000));
    // The stranger even holds a copy of the builder's evidence, but not the builder secret.
    s.sim.setPrivateState(STRANGER, { ...s.sim.privateState(BUILDER), secret: randomBytes32() });
    await expect(s.sim.attestMilestone(STRANGER, s.projectId, 0n)).rejects.toThrow('Only the builder of this project can do this');
    await expect(s.sim.attestMilestone(BANK, s.projectId, 0n)).rejects.toThrow('Only the builder of this project can do this');
  });
});
