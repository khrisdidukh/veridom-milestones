// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Tranche requests: the cumulative draw stays within the approved limit and each
// tranche within its stage cap, all proven over private values.

import { describe, expect, it } from 'vitest';
import {
  StageStatus,
  bytesEqual,
  setTrancheAmount,
  toHex,
  type VeridomPrivateState,
} from '../src/index.js';
import { BUILDER, EUR, inspectStage, setup, type Scenario } from './fixtures.js';

const attest = async (s: Scenario, stage: bigint, amount: bigint) => {
  await inspectStage(s, stage, amount);
  s.sim.attestMilestone(BUILDER, s.projectId, stage);
};

const localProject = (s: Scenario) => s.sim.privateState(BUILDER).projects[toHex(s.projectId)];

describe('requestTranche: within limit', () => {
  it('accepts a tranche exactly at the stage cap', async () => {
    const s = setup();
    await attest(s, 0n, EUR(120_000));
    s.sim.requestTranche(BUILDER, s.projectId, 0n);
    expect(localProject(s).drawnTotal).toBe(EUR(120_000));
  });

  it('accepts a cumulative draw exactly at the loan limit', async () => {
    // Caps add up to more than the limit; the limit is the binding constraint.
    const s = setup({ plan: { limit: EUR(200_000), stageCaps: [EUR(150_000), EUR(150_000)] } });
    await attest(s, 0n, EUR(150_000));
    s.sim.requestTranche(BUILDER, s.projectId, 0n);
    await attest(s, 1n, EUR(50_000));
    s.sim.requestTranche(BUILDER, s.projectId, 1n);
    expect(localProject(s).drawnTotal).toBe(EUR(200_000));
  });
});

describe('requestTranche: negative cases', () => {
  it('rejects a tranche that pushes the cumulative draw over the limit, leaving all state unchanged', async () => {
    const s = setup({ plan: { limit: EUR(200_000), stageCaps: [EUR(150_000), EUR(150_000)] } });
    await attest(s, 0n, EUR(150_000));
    s.sim.requestTranche(BUILDER, s.projectId, 0n);
    await attest(s, 1n, EUR(50_000) + 1n); // one cent over

    const publicBefore = s.sim.ledger.projects.lookup(s.projectId).drawnCommitment;
    const privateBefore: VeridomPrivateState = s.sim.privateState(BUILDER);
    expect(() => s.sim.requestTranche(BUILDER, s.projectId, 1n)).toThrow(
      'Cumulative draw would exceed the approved loan limit',
    );
    expect(bytesEqual(s.sim.ledger.projects.lookup(s.projectId).drawnCommitment, publicBefore)).toBe(true);
    expect(s.sim.privateState(BUILDER)).toBe(privateBefore);
    expect(s.sim.ledger.stages.lookup(s.projectId).lookup(1n).status).toBe(StageStatus.Attested);

    // The builder corrects the amount and the same stage goes through.
    s.sim.setPrivateState(BUILDER, setTrancheAmount(s.sim.privateState(BUILDER), s.projectId, 1n, EUR(50_000)));
    s.sim.requestTranche(BUILDER, s.projectId, 1n);
  });

  it('rejects a tranche above the cap for its stage', async () => {
    const s = setup();
    await attest(s, 0n, EUR(120_000) + 1n);
    expect(() => s.sim.requestTranche(BUILDER, s.projectId, 0n)).toThrow('Tranche exceeds the cap for this stage');
  });

  it('rejects a zero tranche', async () => {
    const s = setup();
    await attest(s, 0n, 0n);
    expect(() => s.sim.requestTranche(BUILDER, s.projectId, 0n)).toThrow('Tranche amount must be positive');
  });

  it('rejects a tranche for a stage that is not attested', async () => {
    const s = setup();
    await inspectStage(s, 0n, EUR(10_000));
    expect(() => s.sim.requestTranche(BUILDER, s.projectId, 0n)).toThrow('Stage not attested');
  });

  it('rejects a second tranche for the same stage', async () => {
    const s = setup();
    await attest(s, 0n, EUR(10_000));
    s.sim.requestTranche(BUILDER, s.projectId, 0n);
    expect(() => s.sim.requestTranche(BUILDER, s.projectId, 0n)).toThrow(
      'A tranche was already requested for this stage',
    );
  });

  it('rejects a builder who understates the amount already drawn', async () => {
    const s = setup();
    await attest(s, 0n, EUR(100_000));
    s.sim.requestTranche(BUILDER, s.projectId, 0n);
    await attest(s, 1n, EUR(100_000));
    const ps = s.sim.privateState(BUILDER);
    const key = toHex(s.projectId);
    s.sim.setPrivateState(BUILDER, {
      ...ps,
      projects: { ...ps.projects, [key]: { ...ps.projects[key], drawnTotal: 0n } },
    });
    expect(() => s.sim.requestTranche(BUILDER, s.projectId, 1n)).toThrow(
      'Drawn total does not match the on-chain commitment',
    );
  });

  it('rejects a builder who inflates the loan limit locally', async () => {
    const s = setup();
    await attest(s, 0n, EUR(100_000));
    const ps = s.sim.privateState(BUILDER);
    const key = toHex(s.projectId);
    const p = ps.projects[key];
    s.sim.setPrivateState(BUILDER, {
      ...ps,
      projects: { ...ps.projects, [key]: { ...p, terms: { ...p.terms, limit: EUR(9_000_000) } } },
    });
    expect(() => s.sim.requestTranche(BUILDER, s.projectId, 0n)).toThrow(
      'Loan terms do not match the approved commitment',
    );
  });

  it('rejects a tranche request by anyone but the builder', async () => {
    const s = setup();
    await attest(s, 0n, EUR(10_000));
    expect(() => s.sim.requestTranche('bank', s.projectId, 0n)).toThrow('Only the builder of this project can do this');
  });
});

describe('requestTranche: randomised schedules', () => {
  // Deterministic pseudo-random generator so failures are reproducible.
  const rng = (seed: number) => () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  it('accepts a draw exactly when it fits both the stage cap and the remaining limit', async () => {
    const rand = rng(20261104);
    for (let round = 0; round < 6; round++) {
      const stageCount = 1 + Math.floor(rand() * 6);
      const caps = Array.from({ length: stageCount }, () => EUR(20_000 + Math.floor(rand() * 80_000)));
      const limit = EUR(50_000 + Math.floor(rand() * 250_000));
      const s = setup({ plan: { limit, stageCaps: caps } });
      let total = 0n;
      for (let stage = 0; stage < stageCount; stage++) {
        const amount = EUR(1 + Math.floor(rand() * 110_000));
        await attest(s, BigInt(stage), amount);
        const fits = amount <= caps[stage] && total + amount <= limit;
        if (fits) {
          s.sim.requestTranche(BUILDER, s.projectId, BigInt(stage));
          total += amount;
        } else {
          expect(() => s.sim.requestTranche(BUILDER, s.projectId, BigInt(stage))).toThrow();
        }
        expect(localProject(s).drawnTotal).toBe(total);
      }
    }
  });
});
