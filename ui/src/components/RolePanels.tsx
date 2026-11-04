// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0

import { useState, type ReactNode } from 'react';
import { StageStatus, sha256, toHex, type EvidenceItem, type FactName } from '@veridom/milestones-contract';
import { INSPECTOR_ID, factLabel, type Actor, type Milestones } from '../useMilestones';
import { centsFromInput, euros, short } from '../format';

const ROLES: { id: Actor; name: string; who: string }[] = [
  { id: 'bank', name: 'Bank', who: 'Approves the loan, registers inspectors, pays tranches' },
  { id: 'builder', name: 'Builder', who: 'Holds the evidence and the amounts, proves each stage' },
  { id: 'inspector', name: 'Inspector', who: 'Visits the site, signs the evidence bundle' },
  { id: 'auditor', name: 'Auditor', who: 'Receives one fact when the builder consents' },
];

export function RolePanels({ m }: { m: Milestones }) {
  const [role, setRole] = useState<Actor>('bank');
  const pending = {
    bank: (m.application && !m.project ? 1 : 0) + m.trancheOpenings.filter((o) => m.stageRecords.get(o.stage)?.status === StageStatus.TrancheRequested).length,
    builder: m.signedInspections.filter((s) => m.stageRecords.get(s.stage) === undefined).length,
    inspector: m.inspectionRequests.length,
    auditor: m.packets.filter((p) => !p.verification).length,
  } as Record<Actor, number>;

  return (
    <section className="roles" aria-label="Parties">
      <div className="role-tabs" role="tablist">
        {ROLES.map((r) => (
          <button
            key={r.id}
            role="tab"
            aria-selected={role === r.id}
            className={role === r.id ? 'role-tab active' : 'role-tab'}
            onClick={() => setRole(r.id)}
          >
            <span>{r.name}</span>
            {pending[r.id] > 0 && <span className="badge" aria-label={`${pending[r.id]} waiting`}>{pending[r.id]}</span>}
          </button>
        ))}
      </div>
      <p className="role-who">{ROLES.find((r) => r.id === role)!.who}</p>
      <div className="role-body" role="tabpanel">
        {role === 'bank' && <BankPanel m={m} />}
        {role === 'builder' && <BuilderPanel m={m} />}
        {role === 'inspector' && <InspectorPanel m={m} />}
        {role === 'auditor' && <AuditorPanel m={m} />}
      </div>
    </section>
  );
}

function Step({ title, done, children }: { title: string; done?: boolean; children: ReactNode }) {
  return (
    <div className={done ? 'step done' : 'step'}>
      <h3>
        {done && <span className="tick" aria-hidden="true" />}
        {title}
      </h3>
      {children}
    </div>
  );
}

const disabled = (m: Milestones) => !m.backend || m.busy !== null;

// ---------------------------------------------------------------------------

function BankPanel({ m }: { m: Milestones }) {
  const registered = m.ledger?.inspectors.member(INSPECTOR_ID) ?? false;
  return (
    <>
      <Step title="Authorise an inspector" done={registered}>
        <p>
          Inspector #{INSPECTOR_ID.toString()} public key{' '}
          <code>{short(m.secrets.inspector.pk.x.toString(16))}</code>. Only signatures from keys on this list count.
        </p>
        {registered ? (
          <button className="secondary" disabled={disabled(m)} onClick={() => m.revokeInspector(INSPECTOR_ID)}>
            Revoke inspector #{INSPECTOR_ID.toString()}
          </button>
        ) : (
          <button disabled={disabled(m)} onClick={m.registerInspector}>
            Register inspector #{INSPECTOR_ID.toString()}
          </button>
        )}
      </Step>

      <Step title="Register the approved loan" done={!!m.project}>
        {!m.application ? (
          <p className="empty">No loan application yet. The builder prepares the terms first.</p>
        ) : (
          <>
            <p>Terms the bank approved, from the loan agreement (off chain):</p>
            <dl className="facts">
              <dt>Loan limit</dt>
              <dd>{euros(m.application.terms.limit)}</dd>
              {m.application.terms.stageCaps.slice(0, Number(m.application.stageCount)).map((c, i) => (
                <FactRow key={i} label={`Cap, ${m.stageNames[i].toLowerCase()}`} value={euros(c)} />
              ))}
            </dl>
            <p>
              What goes on chain: project <code>{short(m.application.projectId)}</code>, terms commitment{' '}
              <code>{short(m.application.termsCommitment)}</code>.
            </p>
            {!m.project && (
              <button disabled={disabled(m)} onClick={m.registerProject}>
                Register project on chain
              </button>
            )}
          </>
        )}
      </Step>

      <Step title="Pay requested tranches">
        {m.trancheOpenings.length === 0 ? (
          <p className="empty">No tranche requests yet.</p>
        ) : (
          <ul className="list">
            {m.trancheOpenings.map((o) => {
              const status = m.stageRecords.get(o.stage)?.status;
              const matches = m.checkOpening(o);
              return (
                <li key={o.stage}>
                  <div>
                    <strong>
                      Stage {o.stage + 1}, {m.stageNames[o.stage].toLowerCase()}: {euros(o.amount)}
                    </strong>
                    <span className={matches ? 'check pass' : 'check fail'}>
                      {matches ? 'Amount matches the on-chain commitment' : 'Amount does not match the commitment'}
                    </span>
                  </div>
                  {status === StageStatus.TrancheRequested ? (
                    <button disabled={disabled(m) || !matches} onClick={() => m.releaseTranche(o.stage)}>
                      Release tranche {o.stage + 1}
                    </button>
                  ) : (
                    <span className="muted">Paid</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Step>
    </>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

// ---------------------------------------------------------------------------

const DEFAULT_CAPS = ['60000', '95000', '55000', '45000', '40000', '25000'];

const sampleBundle = async (stage: number, name: string): Promise<EvidenceItem[]> => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const nonce = toHex(globalThis.crypto.getRandomValues(new Uint8Array(8)));
  const mk = async (kind: EvidenceItem['kind'], file: string, size: number): Promise<EvidenceItem> => ({
    kind,
    name: file,
    size,
    sha256: toHex(await sha256(`${nonce}:${file}`)),
  });
  return Promise.all([
    mk('photo', `${slug}-north.jpg`, 2_314_002),
    mk('photo', `${slug}-south.jpg`, 2_198_771),
    mk('photo', `${slug}-detail.jpg`, 1_604_310),
    mk('invoice', `invoice-stage-${stage + 1}.pdf`, 84_211),
    mk('contractor', `contractor-record-stage-${stage + 1}.json`, 1_102),
  ]);
};

function BuilderPanel({ m }: { m: Milestones }) {
  const [limit, setLimit] = useState('300000');
  const [stageCount, setStageCount] = useState(6);
  const [caps, setCaps] = useState(DEFAULT_CAPS);
  const [bundles, setBundles] = useState<Record<number, EvidenceItem[]>>({});
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [fact, setFact] = useState<FactName>('TrancheAmount');
  const [factStage, setFactStage] = useState(0);

  const limitCents = centsFromInput(limit);
  const capCents = caps.slice(0, stageCount).map(centsFromInput);
  const termsValid = limitCents !== null && limitCents > 0n && capCents.every((c) => c !== null);

  if (!m.application) {
    return (
      <Step title="Prepare the loan terms">
        <p>The limit and the stage caps stay on this device. The bank receives them in the loan agreement; the chain sees a commitment.</p>
        <div className="form-grid">
          <label>
            Loan limit, €
            <input inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </label>
          <label>
            Stages
            <select value={stageCount} onChange={(e) => setStageCount(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {m.stageNames.slice(0, stageCount).map((n, i) => (
            <label key={n}>
              Cap, {n.toLowerCase()}, €
              <input inputMode="decimal" value={caps[i]} onChange={(e) => setCaps(caps.map((c, j) => (j === i ? e.target.value : c)))} />
            </label>
          ))}
        </div>
        <button disabled={disabled(m) || !termsValid} onClick={() => m.submitApplication(limitCents!, capCents as bigint[])}>
          Send loan application to the bank
        </button>
        {!m.backend && <p className="hint">Deploy the contract first (top of the page).</p>}
      </Step>
    );
  }

  const stageCountOnChain = Number(m.application.stageCount);
  const accepted = m.project?.accepted ?? false;
  const nextStage = Number(m.project?.stagesAttested ?? 0n);

  return (
    <>
      <Step title="Accept the project" done={accepted}>
        {!m.project ? (
          <p className="empty">Waiting for the bank to register the project.</p>
        ) : accepted ? (
          <p>Accepted. The contract checked these are the terms the bank committed to.</p>
        ) : (
          <button disabled={disabled(m)} onClick={m.acceptProject}>
            Accept project and prove the terms
          </button>
        )}
      </Step>

      {accepted && (
        <Step title="Prove each stage">
          <ol className="stages">
            {Array.from({ length: stageCountOnChain }, (_, i) => {
              const rec = m.stageRecords.get(i);
              const signed = m.signedInspections.find((s) => s.stage === i);
              const requested = m.inspectionRequests.some((r) => r.stage === i);
              const cap = m.application!.terms.stageCaps[i];
              const amountText = amounts[i] ?? (Number(cap) / 100).toString();
              const amount = centsFromInput(amountText);
              const name = m.stageNames[i];
              return (
                <li key={i} className={i === nextStage || rec ? 'stage-item' : 'stage-item later'}>
                  <h4>
                    {i + 1}. {name}
                  </h4>
                  {!rec && i === nextStage && !signed && (
                    <>
                      <EvidencePicker
                        items={bundles[i] ?? []}
                        onFiles={async (files) => setBundles({ ...bundles, [i]: [...(bundles[i] ?? []), ...(await Promise.all(files.map(m.hashFile)))] })}
                        onSample={async () => setBundles({ ...bundles, [i]: await sampleBundle(i, name) })}
                      />
                      <button disabled={disabled(m) || !(bundles[i]?.length) || requested} onClick={() => m.requestInspection(i, bundles[i])}>
                        {requested ? 'Waiting for the inspector' : 'Send bundle to the inspector'}
                      </button>
                    </>
                  )}
                  {!rec && signed && (
                    <button disabled={disabled(m)} onClick={() => m.submitMilestone(i)}>
                      Prove stage {i + 1} complete
                    </button>
                  )}
                  {!rec && i > nextStage && <p className="muted">After stage {i}.</p>}
                  {rec?.status === StageStatus.Attested && (
                    <div className="inline-form">
                      <label>
                        Tranche, € (cap {euros(cap)})
                        <input inputMode="decimal" value={amountText} onChange={(e) => setAmounts({ ...amounts, [i]: e.target.value })} />
                      </label>
                      <button disabled={disabled(m) || amount === null} onClick={() => m.requestTranche(i, amount!)}>
                        Request tranche {i + 1}
                      </button>
                    </div>
                  )}
                  {rec && rec.status >= StageStatus.TrancheRequested && (
                    <p className="muted">
                      Tranche of {euros(m.localProject?.stages[String(i)]?.trancheAmount ?? 0n)} {rec.status === StageStatus.TrancheReleased ? 'paid' : 'requested'}.
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
          {m.localProject && (
            <p className="running">
              Drawn so far, known only to you and the bank: <strong>{euros(m.localProject.drawnTotal)}</strong> of{' '}
              {euros(m.localProject.terms.limit)}
            </p>
          )}
        </Step>
      )}

      {accepted && m.stageRecords.size > 0 && (
        <Step title="Open one fact to an auditor">
          <p>The auditor learns the chosen value and can check it against the ledger. Nothing else is revealed.</p>
          <div className="inline-form">
            <label>
              Fact
              <select value={fact} onChange={(e) => setFact(e.target.value as FactName)}>
                <option value="TrancheAmount">Tranche amount of a stage</option>
                <option value="EvidenceBundle">Evidence-bundle hash of a stage</option>
                <option value="TotalDrawn">Total drawn so far</option>
              </select>
            </label>
            {fact !== 'TotalDrawn' && (
              <label>
                Stage
                <select value={factStage} onChange={(e) => setFactStage(Number(e.target.value))}>
                  {[...m.stageRecords.keys()].map((s) => (
                    <option key={s} value={s}>
                      {s + 1}. {m.stageNames[s]}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button disabled={disabled(m)} onClick={() => m.disclose(fact === 'TotalDrawn' ? 0 : factStage, fact)}>
              Disclose {factLabel(fact)}
            </button>
          </div>
        </Step>
      )}
    </>
  );
}

function EvidencePicker({ items, onFiles, onSample }: { items: EvidenceItem[]; onFiles: (f: File[]) => void; onSample: () => void }) {
  return (
    <div className="evidence">
      <div className="evidence-actions">
        <label className="file-button">
          Add photos and invoices
          <input type="file" multiple onChange={(e) => e.target.files && onFiles([...e.target.files])} />
        </label>
        <button type="button" className="link" onClick={onSample}>
          Use a sample bundle
        </button>
      </div>
      {items.length > 0 && (
        <ul className="evidence-list">
          {items.map((it) => (
            <li key={it.name + it.sha256}>
              <span>{it.name}</span>
              <code>{short(it.sha256, 6)}</code>
            </li>
          ))}
        </ul>
      )}
      <p className="hint">Files are hashed in this browser. They are never uploaded.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function InspectorPanel({ m }: { m: Milestones }) {
  const registered = m.ledger?.inspectors.member(INSPECTOR_ID) ?? false;
  return (
    <>
      <Step title={`Inspector #${INSPECTOR_ID}`} done={registered}>
        <p>
          {registered
            ? 'The bank has authorised this key. Signatures from it are accepted by the contract.'
            : 'Not authorised yet. The bank registers this key before signatures count.'}
        </p>
      </Step>
      <Step title="Site inspections">
        {m.inspectionRequests.length === 0 ? (
          <p className="empty">No bundles waiting. The builder sends one when a stage is finished.</p>
        ) : (
          <ul className="list">
            {m.inspectionRequests.map((r) => (
              <li key={r.stage} className="inspection">
                <div>
                  <strong>
                    Stage {r.stage + 1}, {m.stageNames[r.stage].toLowerCase()}
                  </strong>
                  <ul className="evidence-list">
                    {r.items.map((it) => (
                      <li key={it.name + it.sha256}>
                        <span>{it.name}</span>
                        <code>{short(it.sha256, 6)}</code>
                      </li>
                    ))}
                  </ul>
                  <p className="muted">
                    Bundle hash <code>{short(r.evidenceHash)}</code>
                  </p>
                </div>
                <button disabled={!m.backend || !m.application} onClick={() => m.signInspection(r.stage)}>
                  Sign stage {r.stage + 1}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Step>
    </>
  );
}

// ---------------------------------------------------------------------------

function AuditorPanel({ m }: { m: Milestones }) {
  return (
    <>
      <Step title="Disclosures received">
        <p>
          Auditor key <code>{short(m.secrets.auditorKey)}</code>
        </p>
        {m.packets.length === 0 ? (
          <p className="empty">Nothing received. Only the builder can open a fact.</p>
        ) : (
          <ul className="list">
            {m.packets.map((p, i) => (
              <li key={p.packet.nonce} className="packet">
                <div>
                  <strong>
                    {factLabel(p.packet.fact).replace(/^./, (c) => c.toUpperCase())}
                    {p.packet.fact !== 'TotalDrawn' && `, stage ${Number(p.packet.stage) + 1}`}:{' '}
                    {p.packet.fact === 'EvidenceBundle' ? <code>{short(p.packet.value)}</code> : euros(BigInt(p.packet.value))}
                  </strong>
                  {p.verification && (
                    <ul className="checks">
                      {p.verification.checks.map((c) => (
                        <li key={c.label} className={c.pass ? 'check pass' : 'check fail'}>
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button className="secondary" disabled={!m.ledger} onClick={() => m.verifyPacket(i)}>
                  {p.verification ? 'Verify again' : 'Verify against the ledger'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Step>
      <Step title="Try without consent">
        <p>Ask the contract to open a tranche amount using the auditor's own key, holding a copy of the builder's records.</p>
        <button className="secondary" disabled={disabled(m) || !m.project?.accepted || m.stageRecords.size === 0} onClick={m.discloseWithoutConsent}>
          Open a fact without consent
        </button>
      </Step>
    </>
  );
}
