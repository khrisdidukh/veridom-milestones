// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0

import {
  MilestonesSimulator,
  createPrivateState,
  type Ledger,
  type ProvableCircuitId,
  type VeridomPrivateState,
} from '@veridom/milestones-contract';
import type { CallOutcome, MilestonesBackend, Party } from './types';

export class SimulatorBackend implements MilestonesBackend {
  readonly mode = 'simulator' as const;
  readonly where = 'In-process simulator (compact-runtime 0.16.0, no network, no proofs)';
  private readonly sim: MilestonesSimulator;

  /** Deploys a fresh contract in this tab; the bank is the deployer. */
  constructor(bankState: VeridomPrivateState, builderState: VeridomPrivateState, auditorState = createPrivateState()) {
    this.sim = new MilestonesSimulator('bank', bankState);
    this.sim.addParty('builder', builderState);
    this.sim.addParty('auditor', auditorState);
  }

  get contractAddress(): string {
    return this.sim.contractAddress;
  }

  get contractAddressBytes(): Uint8Array {
    return this.sim.contractAddressBytes;
  }

  async readLedger(): Promise<Ledger> {
    return this.sim.ledger;
  }

  async publicStateDump(): Promise<string> {
    return this.sim.publicStateDump();
  }

  async getPrivateState(party: Party): Promise<VeridomPrivateState> {
    return this.sim.privateState(party);
  }

  async setPrivateState(party: Party, state: VeridomPrivateState): Promise<void> {
    this.sim.setPrivateState(party, state);
  }

  async call(party: Party, circuit: ProvableCircuitId, args: unknown[]): Promise<CallOutcome> {
    this.sim.callCircuit(party, circuit, args);
    return {};
  }
}
