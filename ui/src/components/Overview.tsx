// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Header with the connection controls, the stage table, the dual-ledger view
// and the activity record.

import { useState } from 'react';
import { StageStatus, toHex } from '@veridom/milestones-contract';
import type { Milestones } from '../useMilestones';
import { euros, short, statusLabel, time } from '../format';

export function Header({ m }: { m: Milestones }) {
  // A link such as …/?lace=preprod opens straight on the wallet path.
  const wanted = new URLSearchParams(window.location.search).get('lace');
  const [mode, setMode] = useState<'simulator' | 'lace'>(wanted === null ? 'simulator' : 'lace');
  const [network, setNetwork] = useState(wanted && ['preprod', 'preview', 'undeployed'].includes(wanted) ? wanted : 'preprod');
  const [address, setAddress] = useState(import.meta.env.VITE_CONTRACT_ADDRESS ?? '');

  return (
    <header className="titleblock">
      <div className="tb-name">
        <svg viewBox="0 0 32 32" className="mark" aria-hidden="true">
          <path d="M4 28V14L16 5l12 9v14z" />
          <path d="M11 28v-8h10v8" className="mark-door" />
        </svg>
        <div>
          <h1>Veridom Milestones</h1>
          <p>Private milestone proofs for construction-loan draws, on Midnight</p>
        </div>
      </div>

      <div className="tb-run">
        {!m.backend ? (
          <>
            <div className="segmented" role="radiogroup" aria-label="Where the contract runs">
              <button role="radio" aria-checked={mode === 'simulator'} className={mode === 'simulator' ? 'on' : ''} onClick={() => setMode('simulator')}>
                Simulator
              </button>
              <button role="radio" aria-checked={mode === 'lace'} className={mode === 'lace' ? 'on' : ''} onClick={() => setMode('lace')}>
                Lace wallet
              </button>
            </div>
            {mode === 'simulator' ? (
              <div className="inline-form">
                <button disabled={m.busy !== null} onClick={() => m.runGuided('simulator')}>
                  Run stage 1 for me
                </button>
                <button className="secondary" disabled={m.busy !== null} onClick={m.deploySimulator}>
                  Deploy contract
                </button>
              </div>
            ) : !m.lace ? (
              <div className="inline-form">
                <label>
                  Network
                  <select value={network} onChange={(e) => setNetwork(e.target.value)}>
                    <option value="preprod">Preprod</option>
                    <option value="preview">Preview</option>
                    <option value="undeployed">Local devnet</option>
                  </select>
                </label>
                <button disabled={m.busy !== null} onClick={() => m.connectWallet(network)}>
                  Connect Lace
                </button>
                <p className="hint ledger-note" role="note">
                  Built for ledger 9 (Compact 0.36.0, Midnight.js 5), the version Preprod and Preview run since
                  November 2026. Lace needs tDUST for fees: in Lace choose Generate tDUST first.
                </p>
              </div>
            ) : (
              <div className="inline-form">
                <button disabled={m.busy !== null} onClick={() => m.runGuided('lace')}>
                  Deploy and run stage 1
                </button>
                <button className="secondary" disabled={m.busy !== null} onClick={m.deployLace}>
                  Deploy contract
                </button>
                <label>
                  or join address
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="contract address" />
                </label>
                <button className="secondary" disabled={m.busy !== null || !address} onClick={() => m.joinLace(address)}>
                  Join
                </button>
              </div>
            )}
          </>
        ) : (
          <dl className="tb-meta">
            <dt>Contract</dt>
            <dd>
              <code title={m.backend.contractAddress}>{short(m.backend.contractAddress, 10)}</code>
            </dd>
            <dt>Runs in</dt>
            <dd>{m.backend.where}</dd>
          </dl>
        )}
      </div>
      {(m.busy || m.walletStatus) && (
        <p className="busy" role="status">
          {m.walletStatus ?? m.busy}
        </p>
      )}
    </header>
  );
}

const download = (name: string, text: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
};

/** The guided run as a checklist, and the public record of the last run on a network. */
export function GuidedRun({ m }: { m: Milestones }) {
  const [copied, setCopied] = useState(false);
  const steps = m.guided;
  const ev = m.evidence;
  if (!steps && !ev) return null;
  const failed = steps?.find((s) => s.status === 'failed');
  const done = steps?.every((s) => s.status === 'done');
  const onNetwork = ev && ev.network !== 'simulator';
  const json = ev ? JSON.stringify(ev, null, 2) : '';
  return (
    <section className="guided" aria-label="Guided run">
      {steps && (
        <>
          <h2>
            Stage 1, end to end
            <span className="guided-count">
              {steps.filter((s) => s.status === 'done').length} of {steps.length} transactions
            </span>
          </h2>
          <ol className="guided-steps">
            {steps.map((s) => (
              <li key={s.key} className={`g-${s.status}`} aria-current={s.status === 'running' ? 'step' : undefined}>
                <span className="g-mark" aria-hidden="true" />
                <div>
                  <strong>{s.label}</strong>
                  <span className="g-proves">{s.proves}</span>
                  {s.status === 'running' && <span className="g-state">{m.walletStatus ?? m.busy ?? 'Working'}</span>}
                  {s.txId && (
                    <span className="g-tx">
                      tx <code title={s.txId}>{short(s.txId, 10)}</code>
                      {s.blockHeight !== undefined && <> block {s.blockHeight}</>}
                      {s.seconds !== undefined && <>, {s.seconds} s</>}
                    </span>
                  )}
                  {s.status === 'failed' && <span className="g-error">{s.detail}</span>}
                </div>
              </li>
            ))}
          </ol>
          {failed && m.backend && (
            <button disabled={m.busy !== null} onClick={() => m.runGuided(m.backend!.mode)}>
              Try again from “{failed.label}”
            </button>
          )}
          {done && <p className="guided-done">All eight transactions are on the ledger. Keep going by hand in the role panels: stage 2 is next.</p>}
        </>
      )}
      {onNetwork && ev && (
        <div className="evidence-record">
          <h3>Public record of {steps ? 'this' : 'the last'} run on “{ev.network}”</h3>
          {ev.contractAddress && (
            <p>
              Contract <code>{ev.contractAddress}</code>
            </p>
          )}
          <p className="hint">Addresses, transaction ids and block heights only. No secret, amount or evidence hash is in this record.</p>
          <div className="inline-form">
            <button className="secondary" onClick={() => download(`veridom-milestones-${ev.network}-run.json`, json)}>
              Download the record
            </button>
            <button
              className="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(json);
                setCopied(true);
              }}
            >
              {copied ? 'Copied' : 'Copy the record'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function StageTable({ m }: { m: Milestones }) {
  if (!m.application) return null;
  const count = Number(m.application.stageCount);
  return (
    <table className="stage-table">
      <caption>Draw schedule, as anyone reading the chain sees it</caption>
      <thead>
        <tr>
          <th scope="col">Stage</th>
          <th scope="col">Status</th>
          <th scope="col">Inspector</th>
          <th scope="col">Evidence</th>
          <th scope="col">Tranche</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: count }, (_, i) => {
          const rec = m.stageRecords.get(i);
          const zero = (b: Uint8Array) => b.every((x) => x === 0);
          return (
            <tr key={i} className={rec ? `st-${rec.status}` : 'st-none'}>
              <th scope="row">
                {i + 1}. {m.stageNames[i]}
              </th>
              <td>{rec ? statusLabel[rec.status] : 'Planned'}</td>
              <td>{rec ? `#${rec.inspectorId}` : ''}</td>
              <td>{rec ? <code>{short(rec.evidenceCommitment, 6)}</code> : ''}</td>
              <td>{rec && !zero(rec.trancheCommitment) ? <code>{short(rec.trancheCommitment, 6)}</code> : ''}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function DualLedger({ m }: { m: Milestones }) {
  const [raw, setRaw] = useState(false);
  const l = m.ledger;
  const p = m.project;
  const local = m.localProject;
  return (
    <section className="dual" aria-label="Public and private state">
      <div className="pane public">
        <h2>Public ledger</h2>
        <p className="pane-note">Anyone can read this.</p>
        {!l ? (
          <p className="empty">Deploy the contract to see its state.</p>
        ) : (
          <>
            <dl className="kv">
              <dt>Lender key hash</dt>
              <dd>
                <code>{short(l.lender)}</code>
              </dd>
              <dt>Authorised inspectors</dt>
              <dd>{l.inspectors.size() === 0n ? 'none' : [...l.inspectors].map(([id]) => `#${id}`).join(', ')}</dd>
              {p && (
                <>
                  <dt>Builder key hash</dt>
                  <dd>
                    <code>{short(p.builder)}</code>
                  </dd>
                  <dt>Terms commitment</dt>
                  <dd>
                    <code>{short(p.termsCommitment)}</code>
                  </dd>
                  <dt>Drawn-total commitment</dt>
                  <dd>
                    <code>{p.accepted ? short(p.drawnCommitment) : 'not opened'}</code>
                  </dd>
                  <dt>Stages proven</dt>
                  <dd>
                    {p.stagesAttested.toString()} of {p.stageCount.toString()}
                  </dd>
                  <dt>Tranches paid</dt>
                  <dd>{p.tranchesReleased.toString()}</dd>
                </>
              )}
              <dt>Spent attestations</dt>
              <dd>{l.usedAttestations.size().toString()}</dd>
              <dt>Disclosure receipts</dt>
              <dd>{l.disclosureReceipts.size().toString()}</dd>
            </dl>
            {m.stateDump && (
              <>
                <button className="link" onClick={() => setRaw(!raw)} aria-expanded={raw}>
                  {raw ? 'Hide' : 'Show'} the raw contract state
                </button>
                {raw && <pre className="raw">{m.stateDump}</pre>}
              </>
            )}
          </>
        )}
      </div>
      <div className="pane private">
        <h2>Builder's private state</h2>
        <p className="pane-note">Only on the builder's device. Enters proofs as witnesses.</p>
        {!local ? (
          <p className="empty">The builder has not prepared loan terms yet.</p>
        ) : (
          <dl className="kv">
            <dt>Loan limit</dt>
            <dd>{euros(local.terms.limit)}</dd>
            <dt>Drawn so far</dt>
            <dd>{euros(local.drawnTotal)}</dd>
            <dt>Terms salt</dt>
            <dd>
              <code>{short(local.termsSalt)}</code>
            </dd>
            <dt>Builder secret</dt>
            <dd>
              <code>{short(toHex(m.builderState.secret))}</code>
            </dd>
            {Object.entries(local.stages).map(([k, s]) => (
              <StageSecret key={k} label={`${Number(k) + 1}. ${m.stageNames[Number(k)]}`} evidence={short(s.evidenceHash, 6)} amount={s.trancheSalt ? euros(s.trancheAmount) : `planned ${euros(s.trancheAmount)}`} />
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

function StageSecret({ label, evidence, amount }: { label: string; evidence: string; amount: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>
        evidence <code>{evidence}</code>, {amount}
      </dd>
    </>
  );
}

const ACTOR_NAME = { bank: 'Bank', builder: 'Builder', inspector: 'Inspector', auditor: 'Auditor' } as const;

export function Activity({ m }: { m: Milestones }) {
  return (
    <section className="activity" aria-label="Activity">
      <div>
        <h2>Transactions</h2>
        {m.log.length === 0 ? (
          <p className="empty">Nothing yet. Start by deploying the contract.</p>
        ) : (
          <ol className="log" reversed>
            {m.log.map((e) => (
              <li key={e.id} className={e.ok ? 'ok' : 'rejected'}>
                <span className="log-time">{time(e.at)}</span>
                <span className="log-who">{ACTOR_NAME[e.actor]}</span>
                <span className="log-what">
                  <strong>{e.action}</strong> {e.detail}
                  {e.txId && (
                    <>
                      {' '}
                      <code>{short(e.txId)}</code>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div>
        <h2>Off chain, between the parties</h2>
        {m.handoffs.length === 0 ? (
          <p className="empty">Documents, signatures and openings that never touch the chain appear here.</p>
        ) : (
          <ol className="log" reversed>
            {m.handoffs.map((h) => (
              <li key={h.id}>
                <span className="log-time">{time(h.at)}</span>
                <span className="log-who">
                  {ACTOR_NAME[h.from]} to {ACTOR_NAME[h.to].toLowerCase()}
                </span>
                <span className="log-what">{h.what}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export const statusesOf = (m: Milestones): Map<number, StageStatus> => {
  const out = new Map<number, StageStatus>();
  for (const [k, v] of m.stageRecords) out.set(k, v.status);
  return out;
};
