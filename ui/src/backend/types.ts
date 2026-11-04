// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// One interface, two ways to run the contract:
//   simulator: the compiled circuits run in this browser tab on the official
//              compact-runtime; no network, no proofs, no wallet needed.
//   lace:      real transactions with ZK proofs, through the Lace wallet, on a
//              Midnight network (local devnet, Preview or Preprod).

import type { Ledger, ProvableCircuitId, VeridomPrivateState } from '@veridom/milestones-contract';

/** Each party proves with its own private state, keyed by this name. */
export type Party = 'bank' | 'builder' | 'auditor';

export type CallOutcome = { txId?: string; blockHeight?: number };

export interface MilestonesBackend {
  readonly mode: 'simulator' | 'lace';
  /** Short description of where the contract runs. */
  readonly where: string;
  readonly contractAddress: string;
  /** The bytes the contract sees as kernel.self(); inspectors sign over them. */
  readonly contractAddressBytes: Uint8Array;
  readLedger(): Promise<Ledger>;
  /** The full public contract state as text, when the backend can provide it. */
  publicStateDump(): Promise<string | undefined>;
  getPrivateState(party: Party): Promise<VeridomPrivateState>;
  setPrivateState(party: Party, state: VeridomPrivateState): Promise<void>;
  call(party: Party, circuit: ProvableCircuitId, args: unknown[]): Promise<CallOutcome>;
}
