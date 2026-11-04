// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Selective disclosure, off-chain half. After `discloseToAuditor` has recorded
// the builder's consent on chain, the builder hands the auditor a packet with
// ONE fact and its opening. The auditor checks it against the public ledger with
// the contract's pure circuits; nothing else about the project is revealed.

import {
  FactKind,
  type Ledger,
  pureCircuits,
} from './managed/veridom-milestones/contract/index.js';
import { bytesEqual, fromHex, toHex } from './bytes.js';
import type { VeridomPrivateState } from './witnesses.js';

export type FactName = 'TrancheAmount' | 'EvidenceBundle' | 'TotalDrawn';

export type DisclosurePacket = {
  format: 'veridom-disclosure/1';
  contractAddress: string;
  projectId: string;
  stage: string;
  fact: FactName;
  /** Euro cents for amounts, hex SHA-256 for an evidence bundle. */
  value: string;
  /** Opening of the on-chain fact commitment. */
  salt: string;
  /** Key of the auditor this packet is addressed to. */
  auditor: string;
  /** Nonce of the on-chain consent receipt. */
  nonce: string;
};

export const factKind = (fact: FactName): FactKind => FactKind[fact];

/** Builds the packet from the builder's private state. Throws if the fact is not available yet. */
export const createDisclosurePacket = (
  ps: VeridomPrivateState,
  args: {
    contractAddress: string;
    projectId: Uint8Array;
    stage: bigint;
    fact: FactName;
    auditor: Uint8Array;
    nonce: Uint8Array;
  },
): DisclosurePacket => {
  const p = ps.projects[toHex(args.projectId)];
  if (!p) throw new Error('No private data for this project');
  let value: string;
  let salt: Uint8Array;
  if (args.fact === 'TotalDrawn') {
    value = p.drawnTotal.toString();
    salt = p.drawnSalt;
  } else {
    const s = p.stages[args.stage.toString()];
    if (!s) throw new Error(`No private data for stage ${args.stage}`);
    if (args.fact === 'EvidenceBundle') {
      value = toHex(s.evidenceHash);
      salt = s.evidenceSalt;
    } else {
      if (!s.trancheSalt) throw new Error(`No tranche requested for stage ${args.stage}`);
      value = s.trancheAmount.toString();
      salt = s.trancheSalt;
    }
  }
  return {
    format: 'veridom-disclosure/1',
    contractAddress: args.contractAddress,
    projectId: toHex(args.projectId),
    stage: args.stage.toString(),
    fact: args.fact,
    value,
    salt: toHex(salt),
    auditor: toHex(args.auditor),
    nonce: toHex(args.nonce),
  };
};

export type Check = { label: string; pass: boolean };
export type Verification = { valid: boolean; checks: Check[] };

/**
 * The auditor's check. Every step uses public ledger data and the contract's
 * pure circuits, so the auditor needs no trust in the builder's software.
 */
export const verifyDisclosurePacket = (
  ledger: Ledger,
  packet: DisclosurePacket,
  expected: { contractAddress: string; auditor: Uint8Array },
): Verification => {
  const checks: Check[] = [];
  const add = (label: string, pass: boolean) => {
    checks.push({ label, pass });
    return pass;
  };
  const done = (): Verification => ({ valid: checks.every((c) => c.pass), checks });

  if (!add('Packet format is veridom-disclosure/1', packet.format === 'veridom-disclosure/1')) return done();
  add('Packet refers to this contract', packet.contractAddress === expected.contractAddress);
  add('Packet is addressed to this auditor', packet.auditor === toHex(expected.auditor));

  let projectId: Uint8Array, salt: Uint8Array, auditor: Uint8Array, nonce: Uint8Array, stage: bigint;
  try {
    projectId = fromHex(packet.projectId);
    salt = fromHex(packet.salt);
    auditor = fromHex(packet.auditor);
    nonce = fromHex(packet.nonce);
    stage = BigInt(packet.stage);
  } catch {
    add('Packet fields are well-formed', false);
    return done();
  }
  if (!add('Project exists on the ledger', ledger.projects.member(projectId))) return done();
  const project = ledger.projects.lookup(projectId);

  let onChain: Uint8Array | undefined;
  let computed: Uint8Array | undefined;
  try {
    if (packet.fact === 'TotalDrawn') {
      onChain = project.drawnCommitment;
      computed = pureCircuits.amountCommitment(BigInt(packet.value), salt);
    } else {
      const stages = ledger.stages.lookup(projectId);
      if (!add('The stage has an on-chain record', stages.member(stage))) return done();
      const rec = stages.lookup(stage);
      if (packet.fact === 'EvidenceBundle') {
        onChain = rec.evidenceCommitment;
        computed = pureCircuits.evidenceCommitment(fromHex(packet.value), salt);
      } else {
        onChain = rec.trancheCommitment;
        computed = pureCircuits.amountCommitment(BigInt(packet.value), salt);
      }
    }
  } catch {
    add('Disclosed value is well-formed', false);
    return done();
  }
  add('Disclosed value opens the on-chain commitment', bytesEqual(onChain, computed));

  const receipt = pureCircuits.receiptCommitment(
    { projectId, stage, kind: factKind(packet.fact), auditor, factCommitment: onChain },
    nonce,
  );
  add("Builder's consent receipt is on the ledger", ledger.disclosureReceipts.member(receipt));
  return done();
};
