// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// What an observer of the public ledger can and cannot see. The test walks the
// entire public state after a full schedule and checks that no private value
// (secrets, salts, evidence hashes, amounts, limit) appears in it.

import { describe, expect, it } from 'vitest';
import { FactKind, randomBytes32, toHex } from '../src/index.js';
import { BUILDER, EUR, inspectStage, setup } from './fixtures.js';

// The state dump prints integers as minimal-length byte strings in hex. Check
// both byte orders, with and without 8-byte padding.
const encodings = (v: bigint): string[] => {
  const hex = v.toString(16);
  const be = hex.length % 2 ? '0' + hex : hex;
  const le = be.match(/../g)!.reverse().join('');
  const be8 = be.padStart(16, '0');
  const le8 = be8.match(/../g)!.reverse().join('');
  return [be, le, be8, le8];
};

describe('public ledger privacy', () => {
  it('contains no secret, salt, evidence hash, amount or limit', async () => {
    const s = setup();
    const amounts = [EUR(111_111.11), EUR(77_777.77)];
    const evidence: string[] = [];
    for (const [i, amount] of amounts.entries()) {
      const { evidenceHash } = await inspectStage(s, BigInt(i), amount);
      evidence.push(toHex(evidenceHash));
      s.sim.attestMilestone(BUILDER, s.projectId, BigInt(i));
      s.sim.requestTranche(BUILDER, s.projectId, BigInt(i));
    }
    s.sim.discloseToAuditor(BUILDER, s.projectId, 0n, FactKind.TrancheAmount, randomBytes32(), randomBytes32());

    // Serialise the whole public contract state.
    const state = s.sim.publicStateDump().toLowerCase();
    expect(state.length).toBeGreaterThan(1000);
    // Positive control: public byte values do appear in this dump, in hex.
    expect(state.includes(toHex(s.project.termsCommitment))).toBe(true);
    expect(state.includes(toHex(s.projectId))).toBe(true);

    const local = s.sim.privateState(BUILDER).projects[toHex(s.projectId)];
    const forbidden: [string, string][] = [
      ['bank secret', toHex(s.bankSecret)],
      ['builder secret', toHex(s.builderSecret)],
      ['terms salt', toHex(local.termsSalt)],
      ['drawn salt', toHex(local.drawnSalt)],
      ...evidence.map((e, i): [string, string] => [`evidence hash ${i}`, e]),
      ...Object.values(local.stages).map((st, i): [string, string] => [`evidence salt ${i}`, toHex(st.evidenceSalt)]),
      ...[...amounts, local.drawnTotal, local.terms.limit].flatMap((v) =>
        encodings(v).map((h): [string, string] => [`amount ${v}`, h]),
      ),
    ];
    for (const [label, hex] of forbidden) {
      expect(state.includes(hex), `${label} leaked into public state`).toBe(false);
    }
  });

  it('shows the facts the bank needs: stage status, inspector, counts', async () => {
    const s = setup();
    await inspectStage(s, 0n, EUR(100_000));
    s.sim.attestMilestone(BUILDER, s.projectId, 0n);
    const p = s.sim.ledger.projects.lookup(s.projectId);
    expect(p.stagesAttested).toBe(1n);
    expect(s.sim.ledger.stages.lookup(s.projectId).lookup(0n).inspectorId).toBe(s.inspectorId);
  });
});
