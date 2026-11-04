// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Browser smoke test of the whole flow in simulator mode: every role, every
// circuit, plus the negative paths shown in the demo. Run against a dev server:
//
//   npm run dev -w ui                       (in one terminal)
//   npx playwright install chromium         (once)
//   npm run test:ui                         (screenshots go to ui/e2e/screenshots)

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.env.UI_URL ?? 'http://localhost:5173/';
const shots = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots');
mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

const role = (name) => page.getByRole('tab', { name: new RegExp(`^${name}`) }).click();
const click = async (name) => {
  const b = page.getByRole('button', { name, exact: true });
  await b.waitFor({ state: 'visible' });
  await b.click();
};
const expectLog = async (text) => page.locator('.log li').filter({ hasText: text }).first().waitFor({ timeout: 15000 });
const shot = (name) => page.screenshot({ path: path.join(shots, `${name}.png`), fullPage: true });
const step = (s) => console.log(`- ${s}`);

await page.goto(url);
await page.getByRole('heading', { name: 'Veridom Milestones' }).waitFor();
await shot('01-start');

step('bank deploys and authorises the inspector');
await click('Deploy contract');
await expectLog('Deploy contract');
await click('Register inspector #7');
await expectLog('Register inspector');

step('builder prepares terms (limit 300,000, six stages)');
await role('Builder');
await click('Send loan application to the bank');

step('bank registers the project');
await role('Bank');
await click('Register project on chain');
await expectLog('Register project');

step('builder accepts');
await role('Builder');
await click('Accept project and prove the terms');
await expectLog('Accept project');

for (const [stage, amount] of [
  [1, '58000'],
  [2, '95000'],
]) {
  step(`stage ${stage}: evidence, inspection, proof, tranche ${amount}`);
  await role('Builder');
  await page.getByRole('button', { name: 'Use a sample bundle' }).click();
  await click('Send bundle to the inspector');
  await role('Inspector');
  await click(`Sign stage ${stage}`);
  await role('Builder');
  await click(`Prove stage ${stage} complete`);
  await expectLog(`Prove stage ${stage} complete`);
  await page.getByLabel(/^Tranche, €/).fill(amount);
  await click(`Request tranche ${stage}`);
  await expectLog(`Request tranche ${stage}`);
  await role('Bank');
  await click(`Release tranche ${stage}`);
  await expectLog(`Release tranche ${stage}`);
}
await shot('02-two-stages-paid');

step('stage 3 with an over-limit tranche, then a valid one');
await role('Builder');
await page.getByRole('button', { name: 'Use a sample bundle' }).click();
await click('Send bundle to the inspector');
await role('Inspector');
await click('Sign stage 3');
await role('Builder');
await click('Prove stage 3 complete');
await expectLog('Prove stage 3 complete');
await page.getByLabel(/^Tranche, €/).fill('60000');
await click('Request tranche 3');
await page.locator('.log li.rejected').filter({ hasText: 'cap for this stage' }).first().waitFor();
await page.getByLabel(/^Tranche, €/).fill('50000');
await click('Request tranche 3');
await expectLog('fits the stage cap');

step('builder discloses one tranche amount; auditor verifies');
await page.getByLabel('Fact').selectOption('TrancheAmount');
await page.getByLabel(/^Stage/).selectOption('1');
await click('Disclose tranche amount');
await expectLog('Disclose one fact');
await role('Auditor');
await click('Verify against the ledger');
await page.locator('.check.pass').filter({ hasText: "consent receipt is on the ledger" }).waitFor();
await shot('03-auditor-verified');

step('auditor tries to open a fact without consent');
await click('Open a fact without consent');
await page.locator('.log li.rejected').filter({ hasText: 'Only the builder of this project' }).first().waitFor();

step('bank revokes the inspector');
await role('Bank');
await click('Revoke inspector #7');
await expectLog('Revoke inspector');
await shot('04-final');

await page.setViewportSize({ width: 390, height: 844 });
await shot('05-mobile');

const rejected = await page.locator('.log li.rejected').count();
const accepted = await page.locator('.log li.ok').count();
console.log(`accepted ${accepted}, rejected ${rejected} (2 rejections expected)`);
await browser.close();
if (errors.length) {
  console.error('Browser errors:\n' + errors.join('\n'));
  process.exit(1);
}
if (rejected !== 2) process.exit(1);
console.log('UI flow passed');
