// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Application state. Keeps each party's secrets apart, runs every action
// through the contract backend, and records what travels off chain between the
// parties (loan terms, inspector signatures, tranche openings, disclosure
// packets) so the screen shows both halves of the protocol.

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_STAGE_NAMES,
  FactKind,
  StageStatus,
  addStageEvidence,
  bytesEqual,
  createDisclosurePacket,
  createPrivateState,
  evidenceBundleHash,
  generateInspectorKeyPair,
  planProject,
  pureCircuits,
  randomBytes32,
  setTrancheAmount,
  sha256,
  signMilestone,
  toHex,
  verifyDisclosurePacket,
  type DisclosurePacket,
  type EvidenceItem,
  type FactName,
  type Ledger,
  type PlannedProject,
  type ProvableCircuitId,
  type Schnorr_SchnorrSignature,
  type Verification,
  type VeridomPrivateState,
} from '@veridom/milestones-contract';
import { SimulatorBackend } from './backend/simulator';
import type { MilestonesBackend, Party } from './backend/types';
import { LaceBackend, connectLace, type LaceSession } from './midnight/lace';

export type Actor = Party | 'inspector';

export type LogEntry = {
  id: number;
  actor: Actor;
  action: string;
  ok: boolean;
  detail: string;
  at: Date;
  txId?: string;
};

export type Handoff = { id: number; from: Actor; to: Actor; what: string; at: Date };

export type InspectionRequest = { stage: number; items: EvidenceItem[]; evidenceHash: Uint8Array };

export type SignedInspection = { stage: number; evidenceHash: Uint8Array; signature: Schnorr_SchnorrSignature };

export type TrancheOpening = { stage: number; amount: bigint; salt: Uint8Array };

export type ReceivedPacket = { packet: DisclosurePacket; verification?: Verification };

export const INSPECTOR_ID = 7n;

const describeError = (e: unknown): string => {
  console.error('[veridom]', e);
  let raw = e instanceof Error ? e.message : String(e);
  if (!raw || raw === '[object Object]') {
    const o = e as { name?: string; code?: string | number; reason?: string; cause?: unknown; _tag?: string };
    const cause = o?.cause instanceof Error ? o.cause.message : o?.cause ? JSON.stringify(o.cause) : '';
    raw = [o?._tag, o?.name, o?.code, o?.reason, cause].filter(Boolean).join(': ');
    if (!raw) { try { raw = JSON.stringify(e); } catch { raw = 'unknown error'; } }
  }
  // compact-runtime reports failed asserts as "failed assert: <message>".
  const m = raw.match(/failed assert:\s*(.*)$/s);
  return (m ? m[1] : raw).trim();
};

export function useMilestones() {
  // Each party's secrets are created once per page load and never shared.
  const secrets = useRef({
    bank: randomBytes32(),
    builder: randomBytes32(),
    auditorSecret: randomBytes32(),
    auditorKey: randomBytes32(),
    inspector: generateInspectorKeyPair(),
  }).current;

  const [backend, setBackend] = useState<MilestonesBackend | null>(null);
  const [lace, setLace] = useState<LaceSession | null>(null);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [builderState, setBuilderState] = useState<VeridomPrivateState>(() => createPrivateState(secrets.builder));
  const [stateDump, setStateDump] = useState<string | undefined>();
  const [application, setApplication] = useState<PlannedProject | null>(null);
  const [inspectionRequests, setInspectionRequests] = useState<InspectionRequest[]>([]);
  const [signedInspections, setSignedInspections] = useState<SignedInspection[]>([]);
  const [trancheOpenings, setTrancheOpenings] = useState<TrancheOpening[]>([]);
  const [packets, setPackets] = useState<ReceivedPacket[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState<string | undefined>();
  const [lastAttested, setLastAttested] = useState<number | null>(null);
  const counter = useRef(0);

  const addLog = useCallback((e: Omit<LogEntry, 'id' | 'at'>) => {
    setLog((l) => [{ ...e, id: ++counter.current, at: new Date() }, ...l].slice(0, 80));
  }, []);
  const addHandoff = useCallback((from: Actor, to: Actor, what: string) => {
    setHandoffs((h) => [{ id: ++counter.current, from, to, what, at: new Date() }, ...h].slice(0, 40));
  }, []);

  const refresh = useCallback(async (b: MilestonesBackend) => {
    setLedger(await b.readLedger());
    setBuilderState(await b.getPrivateState('builder'));
    setStateDump(await b.publicStateDump());
  }, []);

  /** Runs one circuit as one party; a failed assert is shown, not thrown. */
  const run = useCallback(
    async (actor: Party, circuit: ProvableCircuitId, args: unknown[], label: string, okDetail: string): Promise<boolean> => {
      if (!backend) return false;
      setBusy(label);
      try {
        const out = await backend.call(actor, circuit, args);
        addLog({ actor, action: label, ok: true, detail: okDetail, txId: out.txId });
        await refresh(backend);
        return true;
      } catch (e) {
        addLog({ actor, action: label, ok: false, detail: `Rejected by the contract: ${describeError(e)}` });
        await refresh(backend).catch(() => undefined);
        return false;
      } finally {
        setBusy(null);
      }
    },
    [backend, addLog, refresh],
  );

  // ---------------------------------------------------------------- deployment

  const deploySimulator = useCallback(async () => {
    const b = new SimulatorBackend(createPrivateState(secrets.bank), builderState, createPrivateState(secrets.auditorSecret));
    setBackend(b);
    await refresh(b);
    addLog({ actor: 'bank', action: 'Deploy contract', ok: true, detail: `Contract ${b.contractAddress.slice(0, 16)}… deployed in the simulator. The bank's key hash is now the lender.` });
  }, [secrets, builderState, refresh, addLog]);

  const connectWallet = useCallback(
    async (networkId: string) => {
      setBusy('Connecting to Lace');
      try {
        const session = await connectLace(networkId, setWalletStatus);
        setLace(session);
        addLog({ actor: 'bank', action: 'Connect Lace', ok: true, detail: `Connected on "${networkId}". Proofs: ${session.config.proverServerUri ?? 'in Lace (WASM)'}` });
      } catch (e) {
        addLog({ actor: 'bank', action: 'Connect Lace', ok: false, detail: describeError(e) });
      } finally {
        setBusy(null);
      }
    },
    [addLog],
  );

  const deployLace = useCallback(async () => {
    if (!lace) return;
    setBusy('Deploying contract (proof + wallet approval)');
    try {
      const b = await LaceBackend.deploy(lace, createPrivateState(secrets.bank), {
        builder: builderState,
        auditor: createPrivateState(secrets.auditorSecret),
      });
      setBackend(b);
      await refresh(b);
      addLog({ actor: 'bank', action: 'Deploy contract', ok: true, detail: `Deployed at ${b.contractAddress}` });
    } catch (e) {
      addLog({ actor: 'bank', action: 'Deploy contract', ok: false, detail: describeError(e) });
    } finally {
      setBusy(null);
    }
  }, [lace, secrets, builderState, refresh, addLog]);

  const joinLace = useCallback(
    async (address: string) => {
      if (!lace) return;
      setBusy('Joining contract');
      try {
        const b = await LaceBackend.join(lace, address.trim(), {
          bank: createPrivateState(secrets.bank),
          builder: builderState,
          auditor: createPrivateState(secrets.auditorSecret),
        });
        setBackend(b);
        await refresh(b);
        addLog({ actor: 'bank', action: 'Join contract', ok: true, detail: `Joined ${b.contractAddress}. Only contracts deployed from this tab accept this tab's bank key.` });
      } catch (e) {
        addLog({ actor: 'bank', action: 'Join contract', ok: false, detail: describeError(e) });
      } finally {
        setBusy(null);
      }
    },
    [lace, secrets, builderState, refresh, addLog],
  );

  // --------------------------------------------------------------------- bank

  const registerInspector = () =>
    run('bank', 'registerInspector', [INSPECTOR_ID, secrets.inspector.pk], 'Register inspector', `Inspector #${INSPECTOR_ID} may now sign milestones.`);

  const revokeInspector = (id: bigint) =>
    run('bank', 'revokeInspector', [id], 'Revoke inspector', `Inspector #${id} can no longer sign milestones.`);

  const registerProject = async () => {
    if (!application) return;
    await run(
      'bank',
      'registerProject',
      [application.projectId, pureCircuits.builderKey(secrets.builder), application.termsCommitment, application.stageCount],
      'Register project',
      'The project is on chain with a commitment to the loan terms. The terms themselves stay in the loan agreement.',
    );
  };

  const releaseTranche = (stage: number) => {
    if (!application) return Promise.resolve(false);
    return run('bank', 'releaseTranche', [application.projectId, BigInt(stage)], `Release tranche ${stage + 1}`, `Tranche for stage ${stage + 1} marked as paid out.`);
  };

  /** The bank checks the amount it received off chain against the public commitment. */
  const checkOpening = (o: TrancheOpening): boolean | null => {
    if (!ledger || !application) return null;
    const stages = ledger.stages.member(application.projectId) ? ledger.stages.lookup(application.projectId) : null;
    if (!stages?.member(BigInt(o.stage))) return null;
    return bytesEqual(pureCircuits.amountCommitment(o.amount, o.salt), stages.lookup(BigInt(o.stage)).trancheCommitment);
  };

  // ------------------------------------------------------------------ builder

  const submitApplication = async (limit: bigint, caps: bigint[]) => {
    if (!backend) return;
    const planned = planProject(await backend.getPrivateState('builder'), { limit, stageCaps: caps });
    await backend.setPrivateState('builder', planned.state);
    setApplication(planned);
    await refresh(backend);
    addHandoff('builder', 'bank', 'Loan application: project id, builder key, terms commitment and the terms with their salt');
    addLog({ actor: 'builder', action: 'Prepare loan terms', ok: true, detail: 'Terms and salt stored on this device. The bank gets them inside the loan agreement.' });
  };

  const acceptProject = () =>
    application
      ? run('builder', 'acceptProject', [application.projectId], 'Accept project', 'Proved that the builder holds the exact terms the bank committed to. Running total opened at zero, privately.')
      : Promise.resolve(false);

  const requestInspection = async (stage: number, items: EvidenceItem[]) => {
    const evidenceHash = await evidenceBundleHash(items);
    setInspectionRequests((r) => [...r.filter((x) => x.stage !== stage), { stage, items, evidenceHash }]);
    addHandoff('builder', 'inspector', `Evidence bundle for stage ${stage + 1} (${items.length} items) for the site inspection`);
  };

  const submitMilestone = async (stage: number) => {
    if (!backend || !application) return;
    const signed = signedInspections.find((s) => s.stage === stage);
    if (!signed) return;
    const cap = application.terms.stageCaps[stage];
    const ps = addStageEvidence(await backend.getPrivateState('builder'), application.projectId, BigInt(stage), {
      evidenceHash: signed.evidenceHash,
      inspectorId: INSPECTOR_ID,
      signature: signed.signature,
      trancheAmount: cap,
    });
    await backend.setPrivateState('builder', ps);
    const ok = await run(
      'builder',
      'attestMilestone',
      [application.projectId, BigInt(stage)],
      `Prove stage ${stage + 1} complete`,
      `Stage ${stage + 1} attested. The ledger shows the stage and the inspector, not the evidence.`,
    );
    if (ok) setLastAttested(stage);
  };

  const requestTranche = async (stage: number, amount: bigint) => {
    if (!backend || !application) return;
    await backend.setPrivateState('builder', setTrancheAmount(await backend.getPrivateState('builder'), application.projectId, BigInt(stage), amount));
    const ok = await run(
      'builder',
      'requestTranche',
      [application.projectId, BigInt(stage)],
      `Request tranche ${stage + 1}`,
      `Proved: the tranche fits the stage cap and the total stays within the loan limit. No amount was published.`,
    );
    if (ok) {
      const ps = await backend.getPrivateState('builder');
      const s = ps.projects[toHex(application.projectId)].stages[String(stage)];
      setTrancheOpenings((o) => [...o.filter((x) => x.stage !== stage), { stage, amount: s.trancheAmount, salt: s.trancheSalt! }]);
      addHandoff('builder', 'bank', `Tranche ${stage + 1}: amount and salt, so the bank can check the commitment and pay`);
    }
  };

  const disclose = async (stage: number, fact: FactName) => {
    if (!backend || !application) return;
    const nonce = randomBytes32();
    const ok = await run(
      'builder',
      'discloseToAuditor',
      [application.projectId, BigInt(stage), FactKind[fact], secrets.auditorKey, nonce],
      'Disclose one fact',
      'Consent recorded on chain as a salted receipt. The value goes to the auditor off chain.',
    );
    if (!ok) return;
    const packet = createDisclosurePacket(await backend.getPrivateState('builder'), {
      contractAddress: backend.contractAddress,
      projectId: application.projectId,
      stage: BigInt(stage),
      fact,
      auditor: secrets.auditorKey,
      nonce,
    });
    setPackets((p) => [{ packet }, ...p]);
    addHandoff('builder', 'auditor', `Disclosure packet: ${factLabel(fact)}${fact === 'TotalDrawn' ? '' : `, stage ${stage + 1}`}`);
  };

  // ---------------------------------------------------------------- inspector

  const signInspection = (stage: number) => {
    if (!backend || !application) return;
    const req = inspectionRequests.find((r) => r.stage === stage);
    if (!req) return;
    const signature = signMilestone(secrets.inspector.sk, backend.contractAddressBytes, application.projectId, BigInt(stage), req.evidenceHash);
    setSignedInspections((s) => [...s.filter((x) => x.stage !== stage), { stage, evidenceHash: req.evidenceHash, signature }]);
    setInspectionRequests((r) => r.filter((x) => x.stage !== stage));
    addHandoff('inspector', 'builder', `Signed attestation for stage ${stage + 1}`);
    addLog({ actor: 'inspector', action: `Sign stage ${stage + 1}`, ok: true, detail: 'Schnorr signature over contract, project, stage and evidence hash. Signed off chain.' });
  };

  // ------------------------------------------------------------------ auditor

  const verifyPacket = (index: number) => {
    if (!ledger || !backend) return;
    setPackets((all) =>
      all.map((p, i) =>
        i === index
          ? { ...p, verification: verifyDisclosurePacket(ledger, p.packet, { contractAddress: backend.contractAddress, auditor: secrets.auditorKey }) }
          : p,
      ),
    );
  };

  /** The auditor tries to open a fact without the builder's consent. The contract refuses. */
  const discloseWithoutConsent = async () => {
    if (!backend || !application) return;
    // Worst case: the auditor even obtained a copy of the builder's records.
    await backend.setPrivateState('auditor', { ...(await backend.getPrivateState('builder')), secret: secrets.auditorSecret });
    await run('auditor', 'discloseToAuditor', [application.projectId, 0n, FactKind.TrancheAmount, secrets.auditorKey, randomBytes32()], 'Open a fact without consent', 'Unexpected: accepted');
    await backend.setPrivateState('auditor', createPrivateState(secrets.auditorSecret));
  };

  // ------------------------------------------------------------------ derived

  const project = useMemo(() => {
    if (!ledger || !application || !ledger.projects.member(application.projectId)) return null;
    return ledger.projects.lookup(application.projectId);
  }, [ledger, application]);

  const stageRecords = useMemo(() => {
    const out = new Map<number, { status: StageStatus; inspectorId: bigint; evidenceCommitment: Uint8Array; trancheCommitment: Uint8Array }>();
    if (!ledger || !application || !ledger.stages.member(application.projectId)) return out;
    for (const [k, v] of ledger.stages.lookup(application.projectId)) out.set(Number(k), v);
    return out;
  }, [ledger, application]);

  const localProject = application ? builderState.projects[toHex(application.projectId)] : undefined;

  return {
    secrets,
    backend,
    lace,
    ledger,
    stateDump,
    builderState,
    localProject,
    application,
    project,
    stageRecords,
    stageNames: DEFAULT_STAGE_NAMES,
    inspectionRequests,
    signedInspections,
    trancheOpenings,
    packets,
    log,
    handoffs,
    busy,
    walletStatus,
    lastAttested,
    deploySimulator,
    connectWallet,
    deployLace,
    joinLace,
    registerInspector,
    revokeInspector,
    registerProject,
    releaseTranche,
    checkOpening,
    submitApplication,
    acceptProject,
    requestInspection,
    submitMilestone,
    requestTranche,
    disclose,
    signInspection,
    verifyPacket,
    discloseWithoutConsent,
    hashFile: async (f: File): Promise<EvidenceItem> => ({
      kind: f.type.startsWith('image/') ? 'photo' : f.type === 'application/pdf' ? 'invoice' : 'other',
      name: f.name,
      sha256: toHex(await sha256(new Uint8Array(await f.arrayBuffer()))),
      size: f.size,
    }),
  };
}

export type Milestones = ReturnType<typeof useMilestones>;

export const factLabel = (f: FactName): string =>
  f === 'TrancheAmount' ? 'tranche amount' : f === 'EvidenceBundle' ? 'evidence-bundle hash' : 'total drawn';
