// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Selective disclosure: only the builder can consent; the auditor can verify one
// fact against the ledger and learns nothing else; tampered or unconsented
// packets fail.

import { describe, expect, it } from 'vitest';
import {
  FactKind,
  createDisclosurePacket,
  randomBytes32,
  toHex,
  verifyDisclosurePacket,
  type DisclosurePacket,
  type FactName,
} from '../src/index.js';
import { BANK, BUILDER, EUR, STRANGER, inspectStage, setup, type Scenario } from './fixtures.js';

const auditor = randomBytes32();

const prepared = async () => {
  const s = setup();
  await inspectStage(s, 0n, EUR(110_000));
  s.sim.attestMilestone(BUILDER, s.projectId, 0n);
  s.sim.requestTranche(BUILDER, s.projectId, 0n);
  await inspectStage(s, 1n, EUR(60_000));
  s.sim.attestMilestone(BUILDER, s.projectId, 1n);
  return s;
};

const disclose = (s: Scenario, fact: FactName, stage: bigint, to = auditor): DisclosurePacket => {
  const nonce = randomBytes32();
  s.sim.discloseToAuditor(BUILDER, s.projectId, stage, FactKind[fact], to, nonce);
  return createDisclosurePacket(s.sim.privateState(BUILDER), {
    contractAddress: s.sim.contractAddress,
    projectId: s.projectId,
    stage,
    fact,
    auditor: to,
    nonce,
  });
};

const verify = (s: Scenario, packet: DisclosurePacket, as = auditor) =>
  verifyDisclosurePacket(s.sim.ledger, packet, { contractAddress: s.sim.contractAddress, auditor: as });

describe('discloseToAuditor: consented disclosure', () => {
  it('opens exactly one tranche amount to the auditor', async () => {
    const s = await prepared();
    const packet = disclose(s, 'TrancheAmount', 0n);
    expect(packet.value).toBe(EUR(110_000).toString());
    const result = verify(s, packet);
    expect(result.valid).toBe(true);
    expect(s.sim.ledger.disclosureReceipts.size()).toBe(1n);
    expect(s.sim.ledger.disclosureCount).toBe(1n);
    // The packet carries one value; nothing about other stages, the limit or the total.
    expect(Object.keys(packet).sort()).toEqual(
      ['auditor', 'contractAddress', 'fact', 'format', 'nonce', 'projectId', 'salt', 'stage', 'value'].sort(),
    );
  });

  it('opens the evidence-bundle hash of a stage', async () => {
    const s = await prepared();
    const packet = disclose(s, 'EvidenceBundle', 1n);
    expect(packet.value).toBe(toHex(s.sim.privateState(BUILDER).projects[toHex(s.projectId)].stages['1'].evidenceHash));
    expect(verify(s, packet).valid).toBe(true);
  });

  it('opens the cumulative amount drawn', async () => {
    const s = await prepared();
    const packet = disclose(s, 'TotalDrawn', 0n);
    expect(packet.value).toBe(EUR(110_000).toString());
    expect(verify(s, packet).valid).toBe(true);
  });

  it('keeps the receipt unlinkable: the ledger stores a salted commitment only', async () => {
    const s = await prepared();
    disclose(s, 'TrancheAmount', 0n);
    disclose(s, 'TrancheAmount', 0n);
    const receipts = [...s.sim.ledger.disclosureReceipts].map(toHex);
    expect(receipts).toHaveLength(2);
    expect(receipts[0]).not.toBe(receipts[1]);
    expect(receipts.some((r) => r.includes(toHex(auditor)))).toBe(false);
  });
});

describe('discloseToAuditor: disclosure without consent', () => {
  it('rejects a disclosure transaction from the bank', async () => {
    const s = await prepared();
    expect(() => s.sim.discloseToAuditor(BANK, s.projectId, 0n, FactKind.TrancheAmount, auditor, randomBytes32())).toThrow(
      'Only the builder of this project can do this',
    );
  });

  it('rejects a disclosure transaction from the auditor, even holding a copy of the data', async () => {
    const s = await prepared();
    s.sim.setPrivateState(STRANGER, { ...s.sim.privateState(BUILDER), secret: randomBytes32() });
    expect(() =>
      s.sim.discloseToAuditor(STRANGER, s.projectId, 0n, FactKind.TrancheAmount, auditor, randomBytes32()),
    ).toThrow('Only the builder of this project can do this');
    expect(s.sim.ledger.disclosureReceipts.size()).toBe(0n);
  });

  it('fails verification for a leaked packet with no consent receipt on chain', async () => {
    const s = await prepared();
    const leaked = createDisclosurePacket(s.sim.privateState(BUILDER), {
      contractAddress: s.sim.contractAddress,
      projectId: s.projectId,
      stage: 0n,
      fact: 'TrancheAmount',
      auditor,
      nonce: randomBytes32(),
    });
    const result = verify(s, leaked);
    expect(result.valid).toBe(false);
    expect(result.checks.find((c) => c.label.includes('consent'))?.pass).toBe(false);
    // The value itself is correct, which is exactly why consent must be checked separately.
    expect(result.checks.find((c) => c.label.includes('opens the on-chain commitment'))?.pass).toBe(true);
  });

  it('fails verification for a packet addressed to another auditor', async () => {
    const s = await prepared();
    const packet = disclose(s, 'TrancheAmount', 0n);
    expect(verify(s, packet, randomBytes32()).valid).toBe(false);
  });

  it('fails verification when the disclosed value is altered', async () => {
    const s = await prepared();
    const packet = disclose(s, 'TrancheAmount', 0n);
    const tampered = { ...packet, value: EUR(10_000).toString() };
    const result = verify(s, tampered);
    expect(result.valid).toBe(false);
    expect(result.checks.find((c) => c.label.includes('opens the on-chain commitment'))?.pass).toBe(false);
  });

  it('rejects disclosing a tranche that was never requested', async () => {
    const s = await prepared();
    expect(() => s.sim.discloseToAuditor(BUILDER, s.projectId, 1n, FactKind.TrancheAmount, auditor, randomBytes32())).toThrow(
      'No tranche requested for this stage',
    );
    expect(() => s.sim.discloseToAuditor(BUILDER, s.projectId, 2n, FactKind.EvidenceBundle, auditor, randomBytes32())).toThrow(
      'Stage has no record yet',
    );
  });

  it('rejects a builder whose local evidence does not open the on-chain commitment', async () => {
    const s = await prepared();
    const ps = s.sim.privateState(BUILDER);
    const key = toHex(s.projectId);
    const p = ps.projects[key];
    s.sim.setPrivateState(BUILDER, {
      ...ps,
      projects: { ...ps.projects, [key]: { ...p, stages: { ...p.stages, '0': { ...p.stages['0'], evidenceSalt: randomBytes32() } } } },
    });
    expect(() => s.sim.discloseToAuditor(BUILDER, s.projectId, 0n, FactKind.EvidenceBundle, auditor, randomBytes32())).toThrow(
      'Evidence opening does not match the on-chain commitment',
    );
  });
});
