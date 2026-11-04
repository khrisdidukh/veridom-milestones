// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// The inspector's side: a Jubjub Schnorr key pair and a signer for milestone
// attestations. The signature scheme mirrors the official midnight-examples
// zk-loan attestation signer (Apache-2.0); the message is built by the
// contract's own pure circuit, so the bytes match what the circuit verifies.

import { ecMulGenerator, type JubjubPoint } from '@midnight-ntwrk/compact-runtime';
import { pureCircuits, type Schnorr_SchnorrSignature } from './managed/veridom-milestones/contract/index.js';
import { TWO_248 } from './witnesses.js';
import { toHex } from './bytes.js';

export const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;

const mod = (x: bigint): bigint => ((x % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;

const randomScalar = (): bigint => {
  // 512 random bits reduced mod the ~252-bit order: the modulo bias is negligible.
  // A production inspector key would live in an HSM or a hardware wallet.
  const b = globalThis.crypto.getRandomValues(new Uint8Array(64));
  return mod(BigInt('0x' + toHex(b))) || 1n;
};

export type InspectorKeyPair = { sk: bigint; pk: JubjubPoint };

export const generateInspectorKeyPair = (): InspectorKeyPair => {
  const sk = randomScalar();
  return { sk, pk: ecMulGenerator(sk) };
};

/** Schnorr signature over a 5-field message: s*G == R + c*pk. */
export const signMessage = (sk: bigint, msg: bigint[]): Schnorr_SchnorrSignature => {
  const key = mod(sk);
  const pk = ecMulGenerator(key);
  const k = randomScalar();
  const R = ecMulGenerator(k);
  const c = pureCircuits.schnorrChallenge(R.x, R.y, pk.x, pk.y, msg) % TWO_248;
  return { announcement: R, response: mod(k + c * key) };
};

/**
 * What an inspector signs after a site visit: this contract, this project, this
 * stage and this exact evidence bundle. The inspector sees the evidence; the
 * chain never does.
 */
export const signMilestone = (
  sk: bigint,
  contractAddressBytes: Uint8Array,
  projectId: Uint8Array,
  stage: bigint,
  evidenceHash: Uint8Array,
): Schnorr_SchnorrSignature =>
  signMessage(sk, pureCircuits.milestoneMessage(contractAddressBytes, projectId, stage, evidenceHash));
