// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0

import { useMilestones } from './useMilestones';
import { HouseDrawing } from './components/HouseDrawing';
import { RolePanels } from './components/RolePanels';
import { Activity, DualLedger, Header, StageTable, statusesOf } from './components/Overview';

export function App() {
  const m = useMilestones();
  const stageCount = m.application ? Number(m.application.stageCount) : 6;
  return (
    <>
      <Header m={m} />
      <main>
        <div className="site">
          <section className="plan" aria-label="Construction progress">
            <HouseDrawing stageCount={stageCount} statuses={statusesOf(m)} names={m.stageNames} justProven={m.lastAttested} />
            {m.application ? (
              <StageTable m={m} />
            ) : (
              <p className="intro">
                A bank pays a construction loan in tranches, one per finished stage. Here the builder proves each stage
                is complete, signed by an authorised inspector, and that the draws stay within the loan, without
                handing over photos, invoices, contractors or amounts. Work through the roles on the right: the bank
                authorises an inspector, the builder prepares the loan terms.
              </p>
            )}
          </section>
          <RolePanels m={m} />
        </div>
        <DualLedger m={m} />
        <Activity m={m} />
      </main>
      <footer>
        <p>
          A module of <a href="https://veridom.space">Veridom</a>, the house-building control app. Contract compiled with
          Compact 0.31.1; Apache-2.0.
        </p>
      </footer>
    </>
  );
}
