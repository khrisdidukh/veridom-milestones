import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum StageStatus { Pending = 0,
                          Attested = 1,
                          TrancheRequested = 2,
                          TrancheReleased = 3
}

export enum FactKind { TrancheAmount = 0, EvidenceBundle = 1, TotalDrawn = 2 }

export type LoanTerms = { limit: bigint; stageCaps: bigint[] };

export type Project = { builder: Uint8Array;
                        termsCommitment: Uint8Array;
                        drawnCommitment: Uint8Array;
                        stageCount: bigint;
                        accepted: boolean;
                        stagesAttested: bigint;
                        tranchesReleased: bigint
                      };

export type StageRecord = { status: StageStatus;
                            inspectorId: bigint;
                            evidenceCommitment: Uint8Array;
                            trancheCommitment: Uint8Array
                          };

export type MilestoneEvidence = { evidenceHash: Uint8Array;
                                  evidenceSalt: Uint8Array;
                                  inspectorId: bigint;
                                  signature: Schnorr_SchnorrSignature
                                };

export type DisclosureReceipt = { projectId: Uint8Array;
                                  stage: bigint;
                                  kind: FactKind;
                                  auditor: Uint8Array;
                                  factCommitment: Uint8Array
                                };

export type Schnorr_SchnorrSignature = { announcement: __compactRuntime.JubjubPoint;
                                         response: bigint
                                       };

export type Witnesses<PS> = {
  getSchnorrReduction(context: __compactRuntime.WitnessContext<Ledger, PS>,
                      challengeHash_0: bigint): [PS, [bigint, bigint]];
  localSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  loanTerms(context: __compactRuntime.WitnessContext<Ledger, PS>,
            projectId_0: Uint8Array): [PS, [LoanTerms, Uint8Array]];
  drawnTotal(context: __compactRuntime.WitnessContext<Ledger, PS>,
             projectId_0: Uint8Array): [PS, [bigint, Uint8Array]];
  milestoneEvidence(context: __compactRuntime.WitnessContext<Ledger, PS>,
                    projectId_0: Uint8Array,
                    stage_0: bigint): [PS, MilestoneEvidence];
  trancheAmount(context: __compactRuntime.WitnessContext<Ledger, PS>,
                projectId_0: Uint8Array,
                stage_0: bigint): [PS, bigint];
  trancheOpening(context: __compactRuntime.WitnessContext<Ledger, PS>,
                 projectId_0: Uint8Array,
                 stage_0: bigint): [PS, [bigint, Uint8Array]];
  storeAcceptance(context: __compactRuntime.WitnessContext<Ledger, PS>,
                  projectId_0: Uint8Array): [PS, Uint8Array];
  storeDraw(context: __compactRuntime.WitnessContext<Ledger, PS>,
            projectId_0: Uint8Array,
            stage_0: bigint,
            amount_0: bigint,
            newTotal_0: bigint): [PS, [Uint8Array, Uint8Array]];
}

export type ImpureCircuits<PS> = {
  registerInspector(context: __compactRuntime.CircuitContext<PS>,
                    inspectorId_0: bigint,
                    inspectorPk_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, []>;
  revokeInspector(context: __compactRuntime.CircuitContext<PS>,
                  inspectorId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerProject(context: __compactRuntime.CircuitContext<PS>,
                  projectId_0: Uint8Array,
                  builder_0: Uint8Array,
                  terms_0: Uint8Array,
                  stageCount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  releaseTranche(context: __compactRuntime.CircuitContext<PS>,
                 projectId_0: Uint8Array,
                 stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  acceptProject(context: __compactRuntime.CircuitContext<PS>,
                projectId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  attestMilestone(context: __compactRuntime.CircuitContext<PS>,
                  projectId_0: Uint8Array,
                  stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  requestTranche(context: __compactRuntime.CircuitContext<PS>,
                 projectId_0: Uint8Array,
                 stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  discloseToAuditor(context: __compactRuntime.CircuitContext<PS>,
                    projectId_0: Uint8Array,
                    stage_0: bigint,
                    kind_0: FactKind,
                    auditor_0: Uint8Array,
                    nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  registerInspector(context: __compactRuntime.CircuitContext<PS>,
                    inspectorId_0: bigint,
                    inspectorPk_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, []>;
  revokeInspector(context: __compactRuntime.CircuitContext<PS>,
                  inspectorId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerProject(context: __compactRuntime.CircuitContext<PS>,
                  projectId_0: Uint8Array,
                  builder_0: Uint8Array,
                  terms_0: Uint8Array,
                  stageCount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  releaseTranche(context: __compactRuntime.CircuitContext<PS>,
                 projectId_0: Uint8Array,
                 stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  acceptProject(context: __compactRuntime.CircuitContext<PS>,
                projectId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  attestMilestone(context: __compactRuntime.CircuitContext<PS>,
                  projectId_0: Uint8Array,
                  stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  requestTranche(context: __compactRuntime.CircuitContext<PS>,
                 projectId_0: Uint8Array,
                 stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  discloseToAuditor(context: __compactRuntime.CircuitContext<PS>,
                    projectId_0: Uint8Array,
                    stage_0: bigint,
                    kind_0: FactKind,
                    auditor_0: Uint8Array,
                    nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  lenderKey(sk_0: Uint8Array): Uint8Array;
  builderKey(sk_0: Uint8Array): Uint8Array;
  termsCommitment(terms_0: LoanTerms, salt_0: Uint8Array): Uint8Array;
  amountCommitment(amount_0: bigint, salt_0: Uint8Array): Uint8Array;
  evidenceCommitment(evidenceHash_0: Uint8Array, salt_0: Uint8Array): Uint8Array;
  receiptCommitment(receipt_0: DisclosureReceipt, nonce_0: Uint8Array): Uint8Array;
  milestoneMessage(contractAddress_0: Uint8Array,
                   projectId_0: Uint8Array,
                   stage_0: bigint,
                   evidenceHash_0: Uint8Array): bigint[];
  schnorrChallenge(ann_x_0: bigint,
                   ann_y_0: bigint,
                   pk_x_0: bigint,
                   pk_y_0: bigint,
                   msg_0: bigint[]): bigint;
}

export type Circuits<PS> = {
  lenderKey(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  builderKey(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  termsCommitment(context: __compactRuntime.CircuitContext<PS>,
                  terms_0: LoanTerms,
                  salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  amountCommitment(context: __compactRuntime.CircuitContext<PS>,
                   amount_0: bigint,
                   salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  evidenceCommitment(context: __compactRuntime.CircuitContext<PS>,
                     evidenceHash_0: Uint8Array,
                     salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  receiptCommitment(context: __compactRuntime.CircuitContext<PS>,
                    receipt_0: DisclosureReceipt,
                    nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  milestoneMessage(context: __compactRuntime.CircuitContext<PS>,
                   contractAddress_0: Uint8Array,
                   projectId_0: Uint8Array,
                   stage_0: bigint,
                   evidenceHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint[]>;
  schnorrChallenge(context: __compactRuntime.CircuitContext<PS>,
                   ann_x_0: bigint,
                   ann_y_0: bigint,
                   pk_x_0: bigint,
                   pk_y_0: bigint,
                   msg_0: bigint[]): __compactRuntime.CircuitResults<PS, bigint>;
  registerInspector(context: __compactRuntime.CircuitContext<PS>,
                    inspectorId_0: bigint,
                    inspectorPk_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, []>;
  revokeInspector(context: __compactRuntime.CircuitContext<PS>,
                  inspectorId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerProject(context: __compactRuntime.CircuitContext<PS>,
                  projectId_0: Uint8Array,
                  builder_0: Uint8Array,
                  terms_0: Uint8Array,
                  stageCount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  releaseTranche(context: __compactRuntime.CircuitContext<PS>,
                 projectId_0: Uint8Array,
                 stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  acceptProject(context: __compactRuntime.CircuitContext<PS>,
                projectId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  attestMilestone(context: __compactRuntime.CircuitContext<PS>,
                  projectId_0: Uint8Array,
                  stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  requestTranche(context: __compactRuntime.CircuitContext<PS>,
                 projectId_0: Uint8Array,
                 stage_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  discloseToAuditor(context: __compactRuntime.CircuitContext<PS>,
                    projectId_0: Uint8Array,
                    stage_0: bigint,
                    kind_0: FactKind,
                    auditor_0: Uint8Array,
                    nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly lender: Uint8Array;
  inspectors: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): __compactRuntime.JubjubPoint;
    [Symbol.iterator](): Iterator<[bigint, __compactRuntime.JubjubPoint]>
  };
  projects: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Project;
    [Symbol.iterator](): Iterator<[Uint8Array, Project]>
  };
  stages: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): {
      isEmpty(): boolean;
      size(): bigint;
      member(key_1: bigint): boolean;
      lookup(key_1: bigint): StageRecord;
      [Symbol.iterator](): Iterator<[bigint, StageRecord]>
    }
  };
  usedAttestations: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  disclosureReceipts: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly attestationCount: bigint;
  readonly disclosureCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
