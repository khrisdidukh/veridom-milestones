import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

export var StageStatus;
(function (StageStatus) {
  StageStatus[StageStatus['Pending'] = 0] = 'Pending';
  StageStatus[StageStatus['Attested'] = 1] = 'Attested';
  StageStatus[StageStatus['TrancheRequested'] = 2] = 'TrancheRequested';
  StageStatus[StageStatus['TrancheReleased'] = 3] = 'TrancheReleased';
})(StageStatus || (StageStatus = {}));

export var FactKind;
(function (FactKind) {
  FactKind[FactKind['TrancheAmount'] = 0] = 'TrancheAmount';
  FactKind[FactKind['EvidenceBundle'] = 1] = 'EvidenceBundle';
  FactKind[FactKind['TotalDrawn'] = 2] = 'TotalDrawn';
})(FactKind || (FactKind = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_2 = new __compactRuntime.CompactTypeEnum(3, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _StageRecord_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())));
  }
  fromValue(value_0) {
    return {
      status: _descriptor_2.fromValue(value_0),
      inspectorId: _descriptor_3.fromValue(value_0),
      evidenceCommitment: _descriptor_0.fromValue(value_0),
      trancheCommitment: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.status).concat(_descriptor_3.toValue(value_0.inspectorId).concat(_descriptor_0.toValue(value_0.evidenceCommitment).concat(_descriptor_0.toValue(value_0.trancheCommitment))));
  }
}

const _descriptor_4 = new _StageRecord_0();

const _descriptor_5 = __compactRuntime.CompactTypeBoolean;

const _descriptor_6 = new __compactRuntime.CompactTypeEnum(2, 1);

class _Project_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_5.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()))))));
  }
  fromValue(value_0) {
    return {
      builder: _descriptor_0.fromValue(value_0),
      termsCommitment: _descriptor_0.fromValue(value_0),
      drawnCommitment: _descriptor_0.fromValue(value_0),
      stageCount: _descriptor_1.fromValue(value_0),
      accepted: _descriptor_5.fromValue(value_0),
      stagesAttested: _descriptor_1.fromValue(value_0),
      tranchesReleased: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.builder).concat(_descriptor_0.toValue(value_0.termsCommitment).concat(_descriptor_0.toValue(value_0.drawnCommitment).concat(_descriptor_1.toValue(value_0.stageCount).concat(_descriptor_5.toValue(value_0.accepted).concat(_descriptor_1.toValue(value_0.stagesAttested).concat(_descriptor_1.toValue(value_0.tranchesReleased)))))));
  }
}

const _descriptor_7 = new _Project_0();

const _descriptor_8 = __compactRuntime.CompactTypeJubjubPoint;

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_9 = new _ContractAddress_0();

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_11 = new __compactRuntime.CompactTypeVector(6, _descriptor_10);

class _LoanTerms_0 {
  alignment() {
    return _descriptor_10.alignment().concat(_descriptor_11.alignment());
  }
  fromValue(value_0) {
    return {
      limit: _descriptor_10.fromValue(value_0),
      stageCaps: _descriptor_11.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_10.toValue(value_0.limit).concat(_descriptor_11.toValue(value_0.stageCaps));
  }
}

const _descriptor_12 = new _LoanTerms_0();

const _descriptor_13 = __compactRuntime.CompactTypeField;

const _descriptor_14 = new __compactRuntime.CompactTypeVector(5, _descriptor_13);

class _DisclosureReceipt_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_6.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))));
  }
  fromValue(value_0) {
    return {
      projectId: _descriptor_0.fromValue(value_0),
      stage: _descriptor_1.fromValue(value_0),
      kind: _descriptor_6.fromValue(value_0),
      auditor: _descriptor_0.fromValue(value_0),
      factCommitment: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.projectId).concat(_descriptor_1.toValue(value_0.stage).concat(_descriptor_6.toValue(value_0.kind).concat(_descriptor_0.toValue(value_0.auditor).concat(_descriptor_0.toValue(value_0.factCommitment)))));
  }
}

const _descriptor_15 = new _DisclosureReceipt_0();

class _tuple_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_0.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_16 = new _tuple_0();

class _tuple_1 {
  alignment() {
    return _descriptor_10.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_10.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_10.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_17 = new _tuple_1();

class _SchnorrSignature_0 {
  alignment() {
    return _descriptor_8.alignment().concat(_descriptor_13.alignment());
  }
  fromValue(value_0) {
    return {
      announcement: _descriptor_8.fromValue(value_0),
      response: _descriptor_13.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_8.toValue(value_0.announcement).concat(_descriptor_13.toValue(value_0.response));
  }
}

const _descriptor_18 = new _SchnorrSignature_0();

class _MilestoneEvidence_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_18.alignment())));
  }
  fromValue(value_0) {
    return {
      evidenceHash: _descriptor_0.fromValue(value_0),
      evidenceSalt: _descriptor_0.fromValue(value_0),
      inspectorId: _descriptor_3.fromValue(value_0),
      signature: _descriptor_18.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.evidenceHash).concat(_descriptor_0.toValue(value_0.evidenceSalt).concat(_descriptor_3.toValue(value_0.inspectorId).concat(_descriptor_18.toValue(value_0.signature))));
  }
}

const _descriptor_19 = new _MilestoneEvidence_0();

class _tuple_2 {
  alignment() {
    return _descriptor_12.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_12.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_12.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_20 = new _tuple_2();

const _descriptor_21 = new __compactRuntime.CompactTypeUnsignedInteger(127n, 1);

const _descriptor_22 = new __compactRuntime.CompactTypeUnsignedInteger(452312848583266388373324160190187140051835877600158453279131187530910662655n, 31);

class _tuple_3 {
  alignment() {
    return _descriptor_21.alignment().concat(_descriptor_22.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_21.fromValue(value_0),
      _descriptor_22.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_21.toValue(value_0[0]).concat(_descriptor_22.toValue(value_0[1]));
  }
}

const _descriptor_23 = new _tuple_3();

const _descriptor_24 = new __compactRuntime.CompactTypeVector(3, _descriptor_13);

class _SchnorrHashInput_0 {
  alignment() {
    return _descriptor_13.alignment().concat(_descriptor_13.alignment().concat(_descriptor_13.alignment().concat(_descriptor_13.alignment().concat(_descriptor_14.alignment()))));
  }
  fromValue(value_0) {
    return {
      ann_x: _descriptor_13.fromValue(value_0),
      ann_y: _descriptor_13.fromValue(value_0),
      pk_x: _descriptor_13.fromValue(value_0),
      pk_y: _descriptor_13.fromValue(value_0),
      msg: _descriptor_14.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_13.toValue(value_0.ann_x).concat(_descriptor_13.toValue(value_0.ann_y).concat(_descriptor_13.toValue(value_0.pk_x).concat(_descriptor_13.toValue(value_0.pk_y).concat(_descriptor_14.toValue(value_0.msg)))));
  }
}

const _descriptor_25 = new _SchnorrHashInput_0();

class _Either_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_5.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_26 = new _Either_0();

const _descriptor_27 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.getSchnorrReduction) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getSchnorrReduction');
    }
    if (typeof(witnesses_0.localSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named localSecret');
    }
    if (typeof(witnesses_0.loanTerms) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named loanTerms');
    }
    if (typeof(witnesses_0.drawnTotal) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named drawnTotal');
    }
    if (typeof(witnesses_0.milestoneEvidence) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named milestoneEvidence');
    }
    if (typeof(witnesses_0.trancheAmount) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named trancheAmount');
    }
    if (typeof(witnesses_0.trancheOpening) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named trancheOpening');
    }
    if (typeof(witnesses_0.storeAcceptance) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named storeAcceptance');
    }
    if (typeof(witnesses_0.storeDraw) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named storeDraw');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      lenderKey(context, ...args_1) {
        return { result: pureCircuits.lenderKey(...args_1), context };
      },
      builderKey(context, ...args_1) {
        return { result: pureCircuits.builderKey(...args_1), context };
      },
      termsCommitment(context, ...args_1) {
        return { result: pureCircuits.termsCommitment(...args_1), context };
      },
      amountCommitment(context, ...args_1) {
        return { result: pureCircuits.amountCommitment(...args_1), context };
      },
      evidenceCommitment(context, ...args_1) {
        return { result: pureCircuits.evidenceCommitment(...args_1), context };
      },
      receiptCommitment(context, ...args_1) {
        return { result: pureCircuits.receiptCommitment(...args_1), context };
      },
      milestoneMessage(context, ...args_1) {
        return { result: pureCircuits.milestoneMessage(...args_1), context };
      },
      schnorrChallenge(context, ...args_1) {
        return { result: pureCircuits.schnorrChallenge(...args_1), context };
      },
      registerInspector: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`registerInspector: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const inspectorId_0 = args_1[1];
        const inspectorPk_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerInspector',
                                     'argument 1 (as invoked from Typescript)',
                                     'veridom-milestones.compact line 229 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(inspectorId_0) === 'bigint' && inspectorId_0 >= 0n && inspectorId_0 <= 65535n)) {
          __compactRuntime.typeError('registerInspector',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'veridom-milestones.compact line 229 char 1',
                                     'Uint<0..65536>',
                                     inspectorId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_3.toValue(inspectorId_0).concat(_descriptor_8.toValue(inspectorPk_0)),
            alignment: _descriptor_3.alignment().concat(_descriptor_8.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerInspector_0(context,
                                                   partialProofData,
                                                   inspectorId_0,
                                                   inspectorPk_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      revokeInspector: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`revokeInspector: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const inspectorId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('revokeInspector',
                                     'argument 1 (as invoked from Typescript)',
                                     'veridom-milestones.compact line 234 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(inspectorId_0) === 'bigint' && inspectorId_0 >= 0n && inspectorId_0 <= 65535n)) {
          __compactRuntime.typeError('revokeInspector',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'veridom-milestones.compact line 234 char 1',
                                     'Uint<0..65536>',
                                     inspectorId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_3.toValue(inspectorId_0),
            alignment: _descriptor_3.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._revokeInspector_0(context,
                                                 partialProofData,
                                                 inspectorId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      registerProject: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`registerProject: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const projectId_0 = args_1[1];
        const builder_0 = args_1[2];
        const terms_0 = args_1[3];
        const stageCount_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerProject',
                                     'argument 1 (as invoked from Typescript)',
                                     'veridom-milestones.compact line 243 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(projectId_0.buffer instanceof ArrayBuffer && projectId_0.BYTES_PER_ELEMENT === 1 && projectId_0.length === 32)) {
          __compactRuntime.typeError('registerProject',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'veridom-milestones.compact line 243 char 1',
                                     'Bytes<32>',
                                     projectId_0)
        }
        if (!(builder_0.buffer instanceof ArrayBuffer && builder_0.BYTES_PER_ELEMENT === 1 && builder_0.length === 32)) {
          __compactRuntime.typeError('registerProject',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'veridom-milestones.compact line 243 char 1',
                                     'Bytes<32>',
                                     builder_0)
        }
        if (!(terms_0.buffer instanceof ArrayBuffer && terms_0.BYTES_PER_ELEMENT === 1 && terms_0.length === 32)) {
          __compactRuntime.typeError('registerProject',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'veridom-milestones.compact line 243 char 1',
                                     'Bytes<32>',
                                     terms_0)
        }
        if (!(typeof(stageCount_0) === 'bigint' && stageCount_0 >= 0n && stageCount_0 <= 255n)) {
          __compactRuntime.typeError('registerProject',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'veridom-milestones.compact line 243 char 1',
                                     'Uint<0..256>',
                                     stageCount_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(projectId_0).concat(_descriptor_0.toValue(builder_0).concat(_descriptor_0.toValue(terms_0).concat(_descriptor_1.toValue(stageCount_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerProject_0(context,
                                                 partialProofData,
                                                 projectId_0,
                                                 builder_0,
                                                 terms_0,
                                                 stageCount_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      releaseTranche: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`releaseTranche: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const projectId_0 = args_1[1];
        const stage_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('releaseTranche',
                                     'argument 1 (as invoked from Typescript)',
                                     'veridom-milestones.compact line 266 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(projectId_0.buffer instanceof ArrayBuffer && projectId_0.BYTES_PER_ELEMENT === 1 && projectId_0.length === 32)) {
          __compactRuntime.typeError('releaseTranche',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'veridom-milestones.compact line 266 char 1',
                                     'Bytes<32>',
                                     projectId_0)
        }
        if (!(typeof(stage_0) === 'bigint' && stage_0 >= 0n && stage_0 <= 255n)) {
          __compactRuntime.typeError('releaseTranche',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'veridom-milestones.compact line 266 char 1',
                                     'Uint<0..256>',
                                     stage_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(projectId_0).concat(_descriptor_1.toValue(stage_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._releaseTranche_0(context,
                                                partialProofData,
                                                projectId_0,
                                                stage_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      acceptProject: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`acceptProject: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const projectId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('acceptProject',
                                     'argument 1 (as invoked from Typescript)',
                                     'veridom-milestones.compact line 297 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(projectId_0.buffer instanceof ArrayBuffer && projectId_0.BYTES_PER_ELEMENT === 1 && projectId_0.length === 32)) {
          __compactRuntime.typeError('acceptProject',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'veridom-milestones.compact line 297 char 1',
                                     'Bytes<32>',
                                     projectId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(projectId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._acceptProject_0(context,
                                               partialProofData,
                                               projectId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      attestMilestone: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`attestMilestone: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const projectId_0 = args_1[1];
        const stage_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('attestMilestone',
                                     'argument 1 (as invoked from Typescript)',
                                     'veridom-milestones.compact line 318 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(projectId_0.buffer instanceof ArrayBuffer && projectId_0.BYTES_PER_ELEMENT === 1 && projectId_0.length === 32)) {
          __compactRuntime.typeError('attestMilestone',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'veridom-milestones.compact line 318 char 1',
                                     'Bytes<32>',
                                     projectId_0)
        }
        if (!(typeof(stage_0) === 'bigint' && stage_0 >= 0n && stage_0 <= 255n)) {
          __compactRuntime.typeError('attestMilestone',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'veridom-milestones.compact line 318 char 1',
                                     'Uint<0..256>',
                                     stage_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(projectId_0).concat(_descriptor_1.toValue(stage_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._attestMilestone_0(context,
                                                 partialProofData,
                                                 projectId_0,
                                                 stage_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      requestTranche: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`requestTranche: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const projectId_0 = args_1[1];
        const stage_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('requestTranche',
                                     'argument 1 (as invoked from Typescript)',
                                     'veridom-milestones.compact line 364 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(projectId_0.buffer instanceof ArrayBuffer && projectId_0.BYTES_PER_ELEMENT === 1 && projectId_0.length === 32)) {
          __compactRuntime.typeError('requestTranche',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'veridom-milestones.compact line 364 char 1',
                                     'Bytes<32>',
                                     projectId_0)
        }
        if (!(typeof(stage_0) === 'bigint' && stage_0 >= 0n && stage_0 <= 255n)) {
          __compactRuntime.typeError('requestTranche',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'veridom-milestones.compact line 364 char 1',
                                     'Uint<0..256>',
                                     stage_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(projectId_0).concat(_descriptor_1.toValue(stage_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._requestTranche_0(context,
                                                partialProofData,
                                                projectId_0,
                                                stage_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      discloseToAuditor: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`discloseToAuditor: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const projectId_0 = args_1[1];
        const stage_0 = args_1[2];
        const kind_0 = args_1[3];
        const auditor_0 = args_1[4];
        const nonce_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('discloseToAuditor',
                                     'argument 1 (as invoked from Typescript)',
                                     'veridom-milestones.compact line 404 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(projectId_0.buffer instanceof ArrayBuffer && projectId_0.BYTES_PER_ELEMENT === 1 && projectId_0.length === 32)) {
          __compactRuntime.typeError('discloseToAuditor',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'veridom-milestones.compact line 404 char 1',
                                     'Bytes<32>',
                                     projectId_0)
        }
        if (!(typeof(stage_0) === 'bigint' && stage_0 >= 0n && stage_0 <= 255n)) {
          __compactRuntime.typeError('discloseToAuditor',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'veridom-milestones.compact line 404 char 1',
                                     'Uint<0..256>',
                                     stage_0)
        }
        if (!(typeof(kind_0) === 'number' && kind_0 >= 0 && kind_0 <= 2)) {
          __compactRuntime.typeError('discloseToAuditor',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'veridom-milestones.compact line 404 char 1',
                                     'Enum<FactKind, TrancheAmount, EvidenceBundle, TotalDrawn>',
                                     kind_0)
        }
        if (!(auditor_0.buffer instanceof ArrayBuffer && auditor_0.BYTES_PER_ELEMENT === 1 && auditor_0.length === 32)) {
          __compactRuntime.typeError('discloseToAuditor',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'veridom-milestones.compact line 404 char 1',
                                     'Bytes<32>',
                                     auditor_0)
        }
        if (!(nonce_0.buffer instanceof ArrayBuffer && nonce_0.BYTES_PER_ELEMENT === 1 && nonce_0.length === 32)) {
          __compactRuntime.typeError('discloseToAuditor',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'veridom-milestones.compact line 404 char 1',
                                     'Bytes<32>',
                                     nonce_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(projectId_0).concat(_descriptor_1.toValue(stage_0).concat(_descriptor_6.toValue(kind_0).concat(_descriptor_0.toValue(auditor_0).concat(_descriptor_0.toValue(nonce_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_6.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._discloseToAuditor_0(context,
                                                   partialProofData,
                                                   projectId_0,
                                                   stage_0,
                                                   kind_0,
                                                   auditor_0,
                                                   nonce_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      registerInspector: this.circuits.registerInspector,
      revokeInspector: this.circuits.revokeInspector,
      registerProject: this.circuits.registerProject,
      releaseTranche: this.circuits.releaseTranche,
      acceptProject: this.circuits.acceptProject,
      attestMilestone: this.circuits.attestMilestone,
      requestTranche: this.circuits.requestTranche,
      discloseToAuditor: this.circuits.discloseToAuditor
    };
    this.provableCircuits = {
      registerInspector: this.circuits.registerInspector,
      revokeInspector: this.circuits.revokeInspector,
      registerProject: this.circuits.registerProject,
      releaseTranche: this.circuits.releaseTranche,
      acceptProject: this.circuits.acceptProject,
      attestMilestone: this.circuits.attestMilestone,
      requestTranche: this.circuits.requestTranche,
      discloseToAuditor: this.circuits.discloseToAuditor
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('registerInspector', new __compactRuntime.ContractOperation());
    state_0.setOperation('revokeInspector', new __compactRuntime.ContractOperation());
    state_0.setOperation('registerProject', new __compactRuntime.ContractOperation());
    state_0.setOperation('releaseTranche', new __compactRuntime.ContractOperation());
    state_0.setOperation('acceptProject', new __compactRuntime.ContractOperation());
    state_0.setOperation('attestMilestone', new __compactRuntime.ContractOperation());
    state_0.setOperation('requestTranche', new __compactRuntime.ContractOperation());
    state_0.setOperation('discloseToAuditor', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(1n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(2n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(3n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(4n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(5n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(6n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(7n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = this._lenderKey_0(this._localSecret_0(context,
                                                        partialProofData));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_25, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_16, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_24, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_12,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_1(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_10,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_2(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_0,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_3(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_15,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _degradeToTransient_0(x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  _jubjubPointX_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointX(np_0);
    return result_0;
  }
  _jubjubPointY_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointY(np_0);
    return result_0;
  }
  _ecAdd_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecAdd(a_0, b_0);
    return result_0;
  }
  _ecMul_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecMul(a_0, b_0);
    return result_0;
  }
  _ecMulGenerator_0(b_0) {
    const result_0 = __compactRuntime.ecMulGenerator(b_0);
    return result_0;
  }
  _getSchnorrReduction_0(context, partialProofData, challengeHash_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getSchnorrReduction(witnessContext_0,
                                                                              challengeHash_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 2  && typeof(result_0[0]) === 'bigint' && result_0[0] >= 0n && result_0[0] <= 127n && typeof(result_0[1]) === 'bigint' && result_0[1] >= 0n && result_0[1] <= 452312848583266388373324160190187140051835877600158453279131187530910662655n)) {
      __compactRuntime.typeError('getSchnorrReduction',
                                 'return value',
                                 'schnorr.compact line 54 char 3',
                                 '[Uint<0..128>, Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_23.toValue(result_0),
      alignment: _descriptor_23.alignment()
    });
    return result_0;
  }
  _schnorrVerify_0(context, partialProofData, msg_0, signature_0, pk_0) {
    const __compact_pattern_tmp2_0 = signature_0;
    const announcement_0 = __compact_pattern_tmp2_0.announcement;
    const response_0 = __compact_pattern_tmp2_0.response;
    const cFull_0 = this._transientHash_0({ ann_x:
                                              this._jubjubPointX_0(announcement_0),
                                            ann_y:
                                              this._jubjubPointY_0(announcement_0),
                                            pk_x: this._jubjubPointX_0(pk_0),
                                            pk_y: this._jubjubPointY_0(pk_0),
                                            msg: msg_0 });
    const TWO_248_0 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
    const __compact_pattern_tmp1_0 = this._getSchnorrReduction_0(context,
                                                                 partialProofData,
                                                                 cFull_0);
    const q_0 = __compact_pattern_tmp1_0[0];
    const cTruncated_0 = __compact_pattern_tmp1_0[1];
    let t_0;
    __compactRuntime.assert((t_0 = q_0, t_0 < 116n),
                            'Schnorr quotient out of range');
    __compactRuntime.assert(__compactRuntime.addField(__compactRuntime.mulField(q_0,
                                                                                TWO_248_0),
                                                      cTruncated_0)
                            ===
                            cFull_0,
                            'Invalid challenge reduction');
    const c_0 = cTruncated_0;
    const lhs_0 = this._ecMulGenerator_0(response_0);
    const rhs_0 = this._ecAdd_0(announcement_0, this._ecMul_0(pk_0, c_0));
    __compactRuntime.assert(this._jubjubPointX_0(lhs_0)
                            ===
                            this._jubjubPointX_0(rhs_0)
                            &&
                            this._jubjubPointY_0(lhs_0)
                            ===
                            this._jubjubPointY_0(rhs_0),
                            'Invalid inspector signature');
    return [];
  }
  _schnorrChallenge_0(ann_x_0, ann_y_0, pk_x_0, pk_y_0, msg_0) {
    return this._transientHash_0({ ann_x: ann_x_0,
                                   ann_y: ann_y_0,
                                   pk_x: pk_x_0,
                                   pk_y: pk_y_0,
                                   msg: msg_0 });
  }
  _localSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.localSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('localSecret',
                                 'return value',
                                 'veridom-milestones.compact line 117 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _loanTerms_0(context, partialProofData, projectId_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.loanTerms(witnessContext_0,
                                                                    projectId_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 2  && typeof(result_0[0]) === 'object' && typeof(result_0[0].limit) === 'bigint' && result_0[0].limit >= 0n && result_0[0].limit <= 18446744073709551615n && Array.isArray(result_0[0].stageCaps) && result_0[0].stageCaps.length === 6 && result_0[0].stageCaps.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && result_0[1].buffer instanceof ArrayBuffer && result_0[1].BYTES_PER_ELEMENT === 1 && result_0[1].length === 32)) {
      __compactRuntime.typeError('loanTerms',
                                 'return value',
                                 'veridom-milestones.compact line 118 char 1',
                                 '[struct LoanTerms<limit: Uint<0..18446744073709551616>, stageCaps: Vector<6, Uint<0..18446744073709551616>>>, Bytes<32>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_20.toValue(result_0),
      alignment: _descriptor_20.alignment()
    });
    return result_0;
  }
  _drawnTotal_0(context, partialProofData, projectId_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.drawnTotal(witnessContext_0,
                                                                     projectId_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 2  && typeof(result_0[0]) === 'bigint' && result_0[0] >= 0n && result_0[0] <= 18446744073709551615n && result_0[1].buffer instanceof ArrayBuffer && result_0[1].BYTES_PER_ELEMENT === 1 && result_0[1].length === 32)) {
      __compactRuntime.typeError('drawnTotal',
                                 'return value',
                                 'veridom-milestones.compact line 119 char 1',
                                 '[Uint<0..18446744073709551616>, Bytes<32>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_17.toValue(result_0),
      alignment: _descriptor_17.alignment()
    });
    return result_0;
  }
  _milestoneEvidence_0(context, partialProofData, projectId_0, stage_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.milestoneEvidence(witnessContext_0,
                                                                            projectId_0,
                                                                            stage_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.evidenceHash.buffer instanceof ArrayBuffer && result_0.evidenceHash.BYTES_PER_ELEMENT === 1 && result_0.evidenceHash.length === 32 && result_0.evidenceSalt.buffer instanceof ArrayBuffer && result_0.evidenceSalt.BYTES_PER_ELEMENT === 1 && result_0.evidenceSalt.length === 32 && typeof(result_0.inspectorId) === 'bigint' && result_0.inspectorId >= 0n && result_0.inspectorId <= 65535n && typeof(result_0.signature) === 'object' && true && typeof(result_0.signature.response) === 'bigint' && result_0.signature.response >= 0 && result_0.signature.response <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('milestoneEvidence',
                                 'return value',
                                 'veridom-milestones.compact line 120 char 1',
                                 'struct MilestoneEvidence<evidenceHash: Bytes<32>, evidenceSalt: Bytes<32>, inspectorId: Uint<0..65536>, signature: struct SchnorrSignature<announcement: Opaque<"JubjubPoint">, response: Field>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_19.toValue(result_0),
      alignment: _descriptor_19.alignment()
    });
    return result_0;
  }
  _trancheAmount_0(context, partialProofData, projectId_0, stage_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.trancheAmount(witnessContext_0,
                                                                        projectId_0,
                                                                        stage_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('trancheAmount',
                                 'return value',
                                 'veridom-milestones.compact line 121 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_10.toValue(result_0),
      alignment: _descriptor_10.alignment()
    });
    return result_0;
  }
  _trancheOpening_0(context, partialProofData, projectId_0, stage_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.trancheOpening(witnessContext_0,
                                                                         projectId_0,
                                                                         stage_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 2  && typeof(result_0[0]) === 'bigint' && result_0[0] >= 0n && result_0[0] <= 18446744073709551615n && result_0[1].buffer instanceof ArrayBuffer && result_0[1].BYTES_PER_ELEMENT === 1 && result_0[1].length === 32)) {
      __compactRuntime.typeError('trancheOpening',
                                 'return value',
                                 'veridom-milestones.compact line 122 char 1',
                                 '[Uint<0..18446744073709551616>, Bytes<32>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_17.toValue(result_0),
      alignment: _descriptor_17.alignment()
    });
    return result_0;
  }
  _storeAcceptance_0(context, partialProofData, projectId_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.storeAcceptance(witnessContext_0,
                                                                          projectId_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('storeAcceptance',
                                 'return value',
                                 'veridom-milestones.compact line 126 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _storeDraw_0(context,
               partialProofData,
               projectId_0,
               stage_0,
               amount_0,
               newTotal_0)
  {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.storeDraw(witnessContext_0,
                                                                    projectId_0,
                                                                    stage_0,
                                                                    amount_0,
                                                                    newTotal_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 2  && result_0[0].buffer instanceof ArrayBuffer && result_0[0].BYTES_PER_ELEMENT === 1 && result_0[0].length === 32 && result_0[1].buffer instanceof ArrayBuffer && result_0[1].BYTES_PER_ELEMENT === 1 && result_0[1].length === 32)) {
      __compactRuntime.typeError('storeDraw',
                                 'return value',
                                 'veridom-milestones.compact line 127 char 1',
                                 '[Bytes<32>, Bytes<32>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_16.toValue(result_0),
      alignment: _descriptor_16.alignment()
    });
    return result_0;
  }
  _lenderKey_0(sk_0) {
    return this._persistentHash_0([new Uint8Array([118, 101, 114, 105, 100, 111, 109, 58, 108, 101, 110, 100, 101, 114, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _builderKey_0(sk_0) {
    return this._persistentHash_0([new Uint8Array([118, 101, 114, 105, 100, 111, 109, 58, 98, 117, 105, 108, 100, 101, 114, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _termsCommitment_0(terms_0, salt_0) {
    return this._persistentCommit_0(terms_0, salt_0);
  }
  _amountCommitment_0(amount_0, salt_0) {
    return this._persistentCommit_1(amount_0, salt_0);
  }
  _evidenceCommitment_0(evidenceHash_0, salt_0) {
    return this._persistentCommit_2(evidenceHash_0, salt_0);
  }
  _receiptCommitment_0(receipt_0, nonce_0) {
    return this._persistentCommit_3(receipt_0, nonce_0);
  }
  _milestoneMessage_0(contractAddress_0, projectId_0, stage_0, evidenceHash_0) {
    return [this._degradeToTransient_0(new Uint8Array([118, 101, 114, 105, 100, 111, 109, 58, 109, 105, 108, 101, 115, 116, 111, 110, 101, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
            this._degradeToTransient_0(contractAddress_0),
            this._degradeToTransient_0(projectId_0),
            stage_0,
            this._degradeToTransient_0(evidenceHash_0)];
  }
  _schnorrChallenge_1(ann_x_0, ann_y_0, pk_x_0, pk_y_0, msg_0) {
    return this._schnorrChallenge_0(ann_x_0, ann_y_0, pk_x_0, pk_y_0, msg_0);
  }
  _capForStage_0(caps_0, stage_0) {
    const indices_0 = [0n, 1n, 2n, 3n, 4n, 5n];
    return this._folder_0(((acc_0, cap_0, i_0) =>
                           {
                             if (this._equal_0(i_0, stage_0)) {
                               return cap_0;
                             } else {
                               return acc_0;
                             }
                           }),
                          0n,
                          caps_0,
                          indices_0);
  }
  _assertLender_0(context, partialProofData) {
    __compactRuntime.assert(this._equal_1(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_1.toValue(0n),
                                                                                                                                alignment: _descriptor_1.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._lenderKey_0(this._localSecret_0(context,
                                                                                partialProofData))),
                            'Only the lender can do this');
    return [];
  }
  _loadProject_0(context, partialProofData, projectId_0) {
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(2n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(projectId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Unknown project');
    return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_1.toValue(2n),
                                                                                                 alignment: _descriptor_1.alignment() } }] } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_0.toValue(projectId_0),
                                                                                                 alignment: _descriptor_0.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value);
  }
  _assertBuilder_0(context, partialProofData, p_0) {
    __compactRuntime.assert(this._equal_2(p_0.builder,
                                          this._builderKey_0(this._localSecret_0(context,
                                                                                 partialProofData))),
                            'Only the builder of this project can do this');
    return [];
  }
  _openTerms_0(context, partialProofData, projectId_0, p_0) {
    const __compact_pattern_tmp3_0 = this._loanTerms_0(context,
                                                       partialProofData,
                                                       projectId_0);
    const terms_0 = __compact_pattern_tmp3_0[0];
    const salt_0 = __compact_pattern_tmp3_0[1];
    __compactRuntime.assert(this._equal_3(this._termsCommitment_0(terms_0,
                                                                  salt_0),
                                          p_0.termsCommitment),
                            'Loan terms do not match the approved commitment');
    return terms_0;
  }
  _openDrawn_0(context, partialProofData, projectId_0, p_0) {
    const __compact_pattern_tmp4_0 = this._drawnTotal_0(context,
                                                        partialProofData,
                                                        projectId_0);
    const total_0 = __compact_pattern_tmp4_0[0];
    const salt_0 = __compact_pattern_tmp4_0[1];
    __compactRuntime.assert(this._equal_4(this._amountCommitment_0(total_0,
                                                                   salt_0),
                                          p_0.drawnCommitment),
                            'Drawn total does not match the on-chain commitment');
    return total_0;
  }
  _registerInspector_0(context, partialProofData, inspectorId_0, inspectorPk_0)
  {
    this._assertLender_0(context, partialProofData);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(inspectorId_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(inspectorPk_0),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _revokeInspector_0(context, partialProofData, inspectorId_0) {
    this._assertLender_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(1n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(inspectorId_0),
                                                                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Inspector not found');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(inspectorId_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _registerProject_0(context,
                     partialProofData,
                     projectId_0,
                     builder_0,
                     terms_0,
                     stageCount_0)
  {
    this._assertLender_0(context, partialProofData);
    const pid_0 = projectId_0;
    const count_0 = stageCount_0;
    __compactRuntime.assert(!_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(2n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pid_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Project already registered');
    __compactRuntime.assert(count_0 > 0n && count_0 <= 6n,
                            'A plan has between 1 and 6 stages');
    const tmp_0 = { builder: builder_0,
                    termsCommitment: terms_0,
                    drawnCommitment: new Uint8Array(32),
                    stageCount: count_0,
                    accepted: false,
                    stagesAttested: 0n,
                    tranchesReleased: 0n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(2n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pid_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(3n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pid_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _releaseTranche_0(context, partialProofData, projectId_0, stage_0) {
    this._assertLender_0(context, partialProofData);
    const pid_0 = projectId_0;
    const st_0 = stage_0;
    const p_0 = this._loadProject_0(context, partialProofData, pid_0);
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(3n),
                                                                                                                  alignment: _descriptor_1.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_0.toValue(pid_0),
                                                                                                                  alignment: _descriptor_0.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(st_0),
                                                                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Stage not attested');
    const rec_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                            partialProofData,
                                                                            [
                                                                             { dup: { n: 0 } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_1.toValue(3n),
                                                                                                        alignment: _descriptor_1.alignment() } },
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_0.toValue(pid_0),
                                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_1.toValue(st_0),
                                                                                                        alignment: _descriptor_1.alignment() } }] } },
                                                                             { popeq: { cached: false,
                                                                                        result: undefined } }]).value);
    __compactRuntime.assert(rec_0.status === 2,
                            'No open tranche request for this stage');
    const tmp_0 = { status: 3,
                    inspectorId: rec_0.inspectorId,
                    evidenceCommitment: rec_0.evidenceCommitment,
                    trancheCommitment: rec_0.trancheCommitment };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(3n),
                                                                  alignment: _descriptor_1.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_0.toValue(pid_0),
                                                                  alignment: _descriptor_0.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(st_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_1 = { builder: p_0.builder,
                    termsCommitment: p_0.termsCommitment,
                    drawnCommitment: p_0.drawnCommitment,
                    stageCount: p_0.stageCount,
                    accepted: p_0.accepted,
                    stagesAttested: p_0.stagesAttested,
                    tranchesReleased:
                      ((t1) => {
                        if (t1 > 255n) {
                          throw new __compactRuntime.CompactError('veridom-milestones.compact line 287 char 23: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
                        }
                        return t1;
                      })(p_0.tranchesReleased + 1n) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(2n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pid_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_1),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _acceptProject_0(context, partialProofData, projectId_0) {
    const pid_0 = projectId_0;
    const p_0 = this._loadProject_0(context, partialProofData, pid_0);
    this._assertBuilder_0(context, partialProofData, p_0);
    __compactRuntime.assert(!p_0.accepted, 'Project already accepted');
    const terms_0 = this._openTerms_0(context, partialProofData, pid_0, p_0);
    let t_0;
    __compactRuntime.assert((t_0 = terms_0.limit, t_0 > 0n),
                            'Loan limit must be positive');
    const salt_0 = this._storeAcceptance_0(context, partialProofData, pid_0);
    const tmp_0 = { builder: p_0.builder,
                    termsCommitment: p_0.termsCommitment,
                    drawnCommitment: this._amountCommitment_0(0n, salt_0),
                    stageCount: p_0.stageCount,
                    accepted: true,
                    stagesAttested: p_0.stagesAttested,
                    tranchesReleased: p_0.tranchesReleased };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(2n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pid_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _attestMilestone_0(context, partialProofData, projectId_0, stage_0) {
    const pid_0 = projectId_0;
    const st_0 = stage_0;
    const p_0 = this._loadProject_0(context, partialProofData, pid_0);
    this._assertBuilder_0(context, partialProofData, p_0);
    __compactRuntime.assert(p_0.accepted,
                            'The builder has not accepted this project yet');
    const ev_0 = this._milestoneEvidence_0(context,
                                           partialProofData,
                                           pid_0,
                                           st_0);
    const inspectorId_0 = ev_0.inspectorId;
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(1n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(inspectorId_0),
                                                                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Inspector is not authorised');
    const msg_0 = this._milestoneMessage_0(_descriptor_9.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                     partialProofData,
                                                                                                     [
                                                                                                      { dup: { n: 2 } },
                                                                                                      { idx: { cached: true,
                                                                                                               pushPath: false,
                                                                                                               path: [
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() } }] } },
                                                                                                      { popeq: { cached: true,
                                                                                                                 result: undefined } }]).value).bytes,
                                           pid_0,
                                           st_0,
                                           ev_0.evidenceHash);
    this._schnorrVerify_0(context,
                          partialProofData,
                          msg_0,
                          ev_0.signature,
                          _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                    partialProofData,
                                                                                    [
                                                                                     { dup: { n: 0 } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_1.toValue(1n),
                                                                                                                alignment: _descriptor_1.alignment() } }] } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_3.toValue(inspectorId_0),
                                                                                                                alignment: _descriptor_3.alignment() } }] } },
                                                                                     { popeq: { cached: false,
                                                                                                result: undefined } }]).value));
    const nullifier_0 = this._persistentHash_1([this._jubjubPointX_0(ev_0.signature.announcement),
                                                this._jubjubPointY_0(ev_0.signature.announcement),
                                                ev_0.signature.response]);
    __compactRuntime.assert(!_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(4n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Attestation already used');
    __compactRuntime.assert(st_0 < p_0.stageCount, 'Stage is not in the plan');
    __compactRuntime.assert(this._equal_5(st_0, p_0.stagesAttested),
                            'Stages must be attested in order');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(4n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = { status: 1,
                    inspectorId: inspectorId_0,
                    evidenceCommitment:
                      this._evidenceCommitment_0(ev_0.evidenceHash,
                                                 ev_0.evidenceSalt),
                    trancheCommitment: new Uint8Array(32) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(3n),
                                                                  alignment: _descriptor_1.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_0.toValue(pid_0),
                                                                  alignment: _descriptor_0.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(st_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_1 = { builder: p_0.builder,
                    termsCommitment: p_0.termsCommitment,
                    drawnCommitment: p_0.drawnCommitment,
                    stageCount: p_0.stageCount,
                    accepted: p_0.accepted,
                    stagesAttested:
                      ((t1) => {
                        if (t1 > 255n) {
                          throw new __compactRuntime.CompactError('veridom-milestones.compact line 356 char 21: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
                        }
                        return t1;
                      })(p_0.stagesAttested + 1n),
                    tranchesReleased: p_0.tranchesReleased };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(2n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pid_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_1),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_2 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(6n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_3.toValue(tmp_2),
                                                                alignment: _descriptor_3.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _requestTranche_0(context, partialProofData, projectId_0, stage_0) {
    const pid_0 = projectId_0;
    const st_0 = stage_0;
    const p_0 = this._loadProject_0(context, partialProofData, pid_0);
    this._assertBuilder_0(context, partialProofData, p_0);
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(3n),
                                                                                                                  alignment: _descriptor_1.alignment() } },
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_0.toValue(pid_0),
                                                                                                                  alignment: _descriptor_0.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(st_0),
                                                                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Stage not attested');
    const rec_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                            partialProofData,
                                                                            [
                                                                             { dup: { n: 0 } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_1.toValue(3n),
                                                                                                        alignment: _descriptor_1.alignment() } },
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_0.toValue(pid_0),
                                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_1.toValue(st_0),
                                                                                                        alignment: _descriptor_1.alignment() } }] } },
                                                                             { popeq: { cached: false,
                                                                                        result: undefined } }]).value);
    __compactRuntime.assert(rec_0.status === 1,
                            'A tranche was already requested for this stage');
    const terms_0 = this._openTerms_0(context, partialProofData, pid_0, p_0);
    const drawn_0 = this._openDrawn_0(context, partialProofData, pid_0, p_0);
    const amount_0 = this._trancheAmount_0(context,
                                           partialProofData,
                                           pid_0,
                                           st_0);
    __compactRuntime.assert(amount_0 > 0n, 'Tranche amount must be positive');
    __compactRuntime.assert(amount_0
                            <=
                            this._capForStage_0(terms_0.stageCaps, st_0),
                            'Tranche exceeds the cap for this stage');
    const newTotal_0 = drawn_0 + amount_0;
    __compactRuntime.assert(newTotal_0 <= terms_0.limit,
                            'Cumulative draw would exceed the approved loan limit');
    const total_0 = ((t1) => {
                      if (t1 > 18446744073709551615n) {
                        throw new __compactRuntime.CompactError('veridom-milestones.compact line 380 char 17: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                      }
                      return t1;
                    })(newTotal_0);
    const __compact_pattern_tmp2_0 = this._storeDraw_0(context,
                                                       partialProofData,
                                                       pid_0,
                                                       st_0,
                                                       amount_0,
                                                       total_0);
    const trancheSalt_0 = __compact_pattern_tmp2_0[0];
    const drawnSalt_0 = __compact_pattern_tmp2_0[1];
    const tmp_0 = { status: 2,
                    inspectorId: rec_0.inspectorId,
                    evidenceCommitment: rec_0.evidenceCommitment,
                    trancheCommitment:
                      this._amountCommitment_0(amount_0, trancheSalt_0) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(3n),
                                                                  alignment: _descriptor_1.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_0.toValue(pid_0),
                                                                  alignment: _descriptor_0.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(st_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_1 = { builder: p_0.builder,
                    termsCommitment: p_0.termsCommitment,
                    drawnCommitment:
                      this._amountCommitment_0(total_0, drawnSalt_0),
                    stageCount: p_0.stageCount,
                    accepted: p_0.accepted,
                    stagesAttested: p_0.stagesAttested,
                    tranchesReleased: p_0.tranchesReleased };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(2n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pid_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_1),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _discloseToAuditor_0(context,
                       partialProofData,
                       projectId_0,
                       stage_0,
                       kind_0,
                       auditor_0,
                       nonce_0)
  {
    const pid_0 = projectId_0;
    const st_0 = stage_0;
    const k_0 = kind_0;
    const p_0 = this._loadProject_0(context, partialProofData, pid_0);
    this._assertBuilder_0(context, partialProofData, p_0);
    const fact_0 = this._factCommitment_0(context,
                                          partialProofData,
                                          pid_0,
                                          st_0,
                                          k_0,
                                          p_0);
    const tmp_0 = this._receiptCommitment_0({ projectId: pid_0,
                                              stage: st_0,
                                              kind: k_0,
                                              auditor: auditor_0,
                                              factCommitment: fact_0 },
                                            nonce_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(5n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(7n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_3.toValue(tmp_1),
                                                                alignment: _descriptor_3.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _factCommitment_0(context, partialProofData, pid_0, st_0, k_0, p_0) {
    if (k_0 === 2) {
      this._openDrawn_0(context, partialProofData, pid_0, p_0);
      return p_0.drawnCommitment;
    } else {
      __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                        partialProofData,
                                                                                        [
                                                                                         { dup: { n: 0 } },
                                                                                         { idx: { cached: false,
                                                                                                  pushPath: false,
                                                                                                  path: [
                                                                                                         { tag: 'value',
                                                                                                           value: { value: _descriptor_1.toValue(3n),
                                                                                                                    alignment: _descriptor_1.alignment() } },
                                                                                                         { tag: 'value',
                                                                                                           value: { value: _descriptor_0.toValue(pid_0),
                                                                                                                    alignment: _descriptor_0.alignment() } }] } },
                                                                                         { push: { storage: false,
                                                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(st_0),
                                                                                                                                                alignment: _descriptor_1.alignment() }).encode() } },
                                                                                         'member',
                                                                                         { popeq: { cached: true,
                                                                                                    result: undefined } }]).value),
                              'Stage has no record yet');
      const rec_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                              partialProofData,
                                                                              [
                                                                               { dup: { n: 0 } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_1.toValue(3n),
                                                                                                          alignment: _descriptor_1.alignment() } },
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_0.toValue(pid_0),
                                                                                                          alignment: _descriptor_0.alignment() } }] } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_1.toValue(st_0),
                                                                                                          alignment: _descriptor_1.alignment() } }] } },
                                                                               { popeq: { cached: false,
                                                                                          result: undefined } }]).value);
      if (k_0 === 1) {
        const ev_0 = this._milestoneEvidence_0(context,
                                               partialProofData,
                                               pid_0,
                                               st_0);
        __compactRuntime.assert(this._equal_6(this._evidenceCommitment_0(ev_0.evidenceHash,
                                                                         ev_0.evidenceSalt),
                                              rec_0.evidenceCommitment),
                                'Evidence opening does not match the on-chain commitment');
        return rec_0.evidenceCommitment;
      } else {
        __compactRuntime.assert(rec_0.status !== 1,
                                'No tranche requested for this stage');
        const __compact_pattern_tmp1_0 = this._trancheOpening_0(context,
                                                                partialProofData,
                                                                pid_0,
                                                                st_0);
        const amount_0 = __compact_pattern_tmp1_0[0];
        const salt_0 = __compact_pattern_tmp1_0[1];
        __compactRuntime.assert(this._equal_7(this._amountCommitment_0(amount_0,
                                                                       salt_0),
                                              rec_0.trancheCommitment),
                                'Tranche opening does not match the on-chain commitment');
        return rec_0.trancheCommitment;
      }
    }
  }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_0(f, x, a0, a1) {
    for (let i = 0; i < 6; i++) { x = f(x, a0[i], a1[i]); }
    return x;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get lender() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_1.toValue(0n),
                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    inspectors: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                                                                 alignment: _descriptor_10.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(1n),
                                                                                                      alignment: _descriptor_1.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 65535n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'veridom-milestones.compact line 105 char 1',
                                     'Uint<0..65536>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(key_0),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 65535n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'veridom-milestones.compact line 105 char 1',
                                     'Uint<0..65536>',
                                     key_0)
        }
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_3.toValue(key_0),
                                                                                                     alignment: _descriptor_3.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_3.fromValue(key.value),      _descriptor_8.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    projects: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                                                                 alignment: _descriptor_10.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(2n),
                                                                                                      alignment: _descriptor_1.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'veridom-milestones.compact line 106 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'veridom-milestones.compact line 106 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_7.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    stages: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(3n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                                                                 alignment: _descriptor_10.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(3n),
                                                                                                      alignment: _descriptor_1.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'veridom-milestones.compact line 107 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(3n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'veridom-milestones.compact line 107 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        if (state.asArray()[3].asMap().get({ value: _descriptor_0.toValue(key_0),
                                             alignment: _descriptor_0.alignment() }) === undefined) {
          throw new __compactRuntime.CompactError(`Map value undefined for ${key_0}`);
        }
        return {
          isEmpty(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(3n),
                                                                                                         alignment: _descriptor_1.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(key_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              'size',
                                                                              { push: { storage: false,
                                                                                        value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                                                                     alignment: _descriptor_10.alignment() }).encode() } },
                                                                              'eq',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          size(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                              partialProofData,
                                                                              [
                                                                               { dup: { n: 0 } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_1.toValue(3n),
                                                                                                          alignment: _descriptor_1.alignment() } },
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_0.toValue(key_0),
                                                                                                          alignment: _descriptor_0.alignment() } }] } },
                                                                               'size',
                                                                               { popeq: { cached: true,
                                                                                          result: undefined } }]).value);
          },
          member(...args_1) {
            if (args_1.length !== 1) {
              throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_1.length}`);
            }
            const key_1 = args_1[0];
            if (!(typeof(key_1) === 'bigint' && key_1 >= 0n && key_1 <= 255n)) {
              __compactRuntime.typeError('member',
                                         'argument 1',
                                         'veridom-milestones.compact line 107 char 38',
                                         'Uint<0..256>',
                                         key_1)
            }
            return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(3n),
                                                                                                         alignment: _descriptor_1.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(key_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { push: { storage: false,
                                                                                        value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_1),
                                                                                                                                     alignment: _descriptor_1.alignment() }).encode() } },
                                                                              'member',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          lookup(...args_1) {
            if (args_1.length !== 1) {
              throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_1.length}`);
            }
            const key_1 = args_1[0];
            if (!(typeof(key_1) === 'bigint' && key_1 >= 0n && key_1 <= 255n)) {
              __compactRuntime.typeError('lookup',
                                         'argument 1',
                                         'veridom-milestones.compact line 107 char 38',
                                         'Uint<0..256>',
                                         key_1)
            }
            return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(3n),
                                                                                                         alignment: _descriptor_1.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(key_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(key_1),
                                                                                                         alignment: _descriptor_1.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
          },
          [Symbol.iterator](...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_1.length}`);
            }
            const self_0 = state.asArray()[3].asMap().get({ value: _descriptor_0.toValue(key_0),
                                                            alignment: _descriptor_0.alignment() });
            return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
          }
        }
      }
    },
    usedAttestations: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(4n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                                                                 alignment: _descriptor_10.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(4n),
                                                                                                      alignment: _descriptor_1.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'veridom-milestones.compact line 108 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(4n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    disclosureReceipts: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(5n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                                                                 alignment: _descriptor_10.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(5n),
                                                                                                      alignment: _descriptor_1.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'veridom-milestones.compact line 109 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(5n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[5];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    get attestationCount() {
      return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_1.toValue(6n),
                                                                                                    alignment: _descriptor_1.alignment() } }] } },
                                                                         { popeq: { cached: true,
                                                                                    result: undefined } }]).value);
    },
    get disclosureCount() {
      return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_1.toValue(7n),
                                                                                                    alignment: _descriptor_1.alignment() } }] } },
                                                                         { popeq: { cached: true,
                                                                                    result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  getSchnorrReduction: (...args) => undefined,
  localSecret: (...args) => undefined,
  loanTerms: (...args) => undefined,
  drawnTotal: (...args) => undefined,
  milestoneEvidence: (...args) => undefined,
  trancheAmount: (...args) => undefined,
  trancheOpening: (...args) => undefined,
  storeAcceptance: (...args) => undefined,
  storeDraw: (...args) => undefined
});
export const pureCircuits = {
  lenderKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`lenderKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('lenderKey',
                                 'argument 1',
                                 'veridom-milestones.compact line 134 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._lenderKey_0(sk_0);
  },
  builderKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`builderKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('builderKey',
                                 'argument 1',
                                 'veridom-milestones.compact line 138 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._builderKey_0(sk_0);
  },
  termsCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`termsCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const terms_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(typeof(terms_0) === 'object' && typeof(terms_0.limit) === 'bigint' && terms_0.limit >= 0n && terms_0.limit <= 18446744073709551615n && Array.isArray(terms_0.stageCaps) && terms_0.stageCaps.length === 6 && terms_0.stageCaps.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
      __compactRuntime.typeError('termsCommitment',
                                 'argument 1',
                                 'veridom-milestones.compact line 142 char 1',
                                 'struct LoanTerms<limit: Uint<0..18446744073709551616>, stageCaps: Vector<6, Uint<0..18446744073709551616>>>',
                                 terms_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('termsCommitment',
                                 'argument 2',
                                 'veridom-milestones.compact line 142 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._termsCommitment_0(terms_0, salt_0);
  },
  amountCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`amountCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const amount_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('amountCommitment',
                                 'argument 1',
                                 'veridom-milestones.compact line 146 char 1',
                                 'Uint<0..18446744073709551616>',
                                 amount_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('amountCommitment',
                                 'argument 2',
                                 'veridom-milestones.compact line 146 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._amountCommitment_0(amount_0, salt_0);
  },
  evidenceCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`evidenceCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const evidenceHash_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(evidenceHash_0.buffer instanceof ArrayBuffer && evidenceHash_0.BYTES_PER_ELEMENT === 1 && evidenceHash_0.length === 32)) {
      __compactRuntime.typeError('evidenceCommitment',
                                 'argument 1',
                                 'veridom-milestones.compact line 150 char 1',
                                 'Bytes<32>',
                                 evidenceHash_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('evidenceCommitment',
                                 'argument 2',
                                 'veridom-milestones.compact line 150 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._evidenceCommitment_0(evidenceHash_0, salt_0);
  },
  receiptCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`receiptCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const receipt_0 = args_0[0];
    const nonce_0 = args_0[1];
    if (!(typeof(receipt_0) === 'object' && receipt_0.projectId.buffer instanceof ArrayBuffer && receipt_0.projectId.BYTES_PER_ELEMENT === 1 && receipt_0.projectId.length === 32 && typeof(receipt_0.stage) === 'bigint' && receipt_0.stage >= 0n && receipt_0.stage <= 255n && typeof(receipt_0.kind) === 'number' && receipt_0.kind >= 0 && receipt_0.kind <= 2 && receipt_0.auditor.buffer instanceof ArrayBuffer && receipt_0.auditor.BYTES_PER_ELEMENT === 1 && receipt_0.auditor.length === 32 && receipt_0.factCommitment.buffer instanceof ArrayBuffer && receipt_0.factCommitment.BYTES_PER_ELEMENT === 1 && receipt_0.factCommitment.length === 32)) {
      __compactRuntime.typeError('receiptCommitment',
                                 'argument 1',
                                 'veridom-milestones.compact line 154 char 1',
                                 'struct DisclosureReceipt<projectId: Bytes<32>, stage: Uint<0..256>, kind: Enum<FactKind, TrancheAmount, EvidenceBundle, TotalDrawn>, auditor: Bytes<32>, factCommitment: Bytes<32>>',
                                 receipt_0)
    }
    if (!(nonce_0.buffer instanceof ArrayBuffer && nonce_0.BYTES_PER_ELEMENT === 1 && nonce_0.length === 32)) {
      __compactRuntime.typeError('receiptCommitment',
                                 'argument 2',
                                 'veridom-milestones.compact line 154 char 1',
                                 'Bytes<32>',
                                 nonce_0)
    }
    return _dummyContract._receiptCommitment_0(receipt_0, nonce_0);
  },
  milestoneMessage: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`milestoneMessage: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const contractAddress_0 = args_0[0];
    const projectId_0 = args_0[1];
    const stage_0 = args_0[2];
    const evidenceHash_0 = args_0[3];
    if (!(contractAddress_0.buffer instanceof ArrayBuffer && contractAddress_0.BYTES_PER_ELEMENT === 1 && contractAddress_0.length === 32)) {
      __compactRuntime.typeError('milestoneMessage',
                                 'argument 1',
                                 'veridom-milestones.compact line 161 char 1',
                                 'Bytes<32>',
                                 contractAddress_0)
    }
    if (!(projectId_0.buffer instanceof ArrayBuffer && projectId_0.BYTES_PER_ELEMENT === 1 && projectId_0.length === 32)) {
      __compactRuntime.typeError('milestoneMessage',
                                 'argument 2',
                                 'veridom-milestones.compact line 161 char 1',
                                 'Bytes<32>',
                                 projectId_0)
    }
    if (!(typeof(stage_0) === 'bigint' && stage_0 >= 0n && stage_0 <= 255n)) {
      __compactRuntime.typeError('milestoneMessage',
                                 'argument 3',
                                 'veridom-milestones.compact line 161 char 1',
                                 'Uint<0..256>',
                                 stage_0)
    }
    if (!(evidenceHash_0.buffer instanceof ArrayBuffer && evidenceHash_0.BYTES_PER_ELEMENT === 1 && evidenceHash_0.length === 32)) {
      __compactRuntime.typeError('milestoneMessage',
                                 'argument 4',
                                 'veridom-milestones.compact line 161 char 1',
                                 'Bytes<32>',
                                 evidenceHash_0)
    }
    return _dummyContract._milestoneMessage_0(contractAddress_0,
                                              projectId_0,
                                              stage_0,
                                              evidenceHash_0);
  },
  schnorrChallenge: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`schnorrChallenge: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const ann_x_0 = args_0[0];
    const ann_y_0 = args_0[1];
    const pk_x_0 = args_0[2];
    const pk_y_0 = args_0[3];
    const msg_0 = args_0[4];
    if (!(typeof(ann_x_0) === 'bigint' && ann_x_0 >= 0 && ann_x_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('schnorrChallenge',
                                 'argument 1',
                                 'veridom-milestones.compact line 172 char 1',
                                 'Field',
                                 ann_x_0)
    }
    if (!(typeof(ann_y_0) === 'bigint' && ann_y_0 >= 0 && ann_y_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('schnorrChallenge',
                                 'argument 2',
                                 'veridom-milestones.compact line 172 char 1',
                                 'Field',
                                 ann_y_0)
    }
    if (!(typeof(pk_x_0) === 'bigint' && pk_x_0 >= 0 && pk_x_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('schnorrChallenge',
                                 'argument 3',
                                 'veridom-milestones.compact line 172 char 1',
                                 'Field',
                                 pk_x_0)
    }
    if (!(typeof(pk_y_0) === 'bigint' && pk_y_0 >= 0 && pk_y_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('schnorrChallenge',
                                 'argument 4',
                                 'veridom-milestones.compact line 172 char 1',
                                 'Field',
                                 pk_y_0)
    }
    if (!(Array.isArray(msg_0) && msg_0.length === 5 && msg_0.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD))) {
      __compactRuntime.typeError('schnorrChallenge',
                                 'argument 5',
                                 'veridom-milestones.compact line 172 char 1',
                                 'Vector<5, Field>',
                                 msg_0)
    }
    return _dummyContract._schnorrChallenge_1(ann_x_0,
                                              ann_y_0,
                                              pk_x_0,
                                              pk_y_0,
                                              msg_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
