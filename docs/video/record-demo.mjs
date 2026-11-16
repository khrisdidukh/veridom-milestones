// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Records the demo video's browser parts with Playwright: the deck slides and
// the app in simulator mode, with captions drawn into the page. The devnet part
// comes from the end-to-end test (RECORD_VIDEO_DIR=... npm run test:e2e), and
// build-video.sh joins them.
//
//   npm run dev -w ui                    (in one terminal)
//   node docs/slides/render-pdf.mjs      (slide PNGs)
//   node docs/video/record-demo.mjs <out-dir>

import { chromium } from 'playwright';
import { mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] ?? path.join(here, 'parts'));
const app = process.env.UI_URL ?? 'http://localhost:5173/';
// Inlined as data URLs: a page set from about:blank may not load file:// images.
const slide = (n) =>
  `data:image/png;base64,${readFileSync(path.join(here, '../slides/png', `slide-${String(n).padStart(2, '0')}.png`)).toString('base64')}`;
const size = { width: 1920, height: 1080 };
mkdirSync(out, { recursive: true });

/** Drawn into the page so the recording carries its own captions. */
export const captionScript = () => {
  const mount = () => {
    if (document.getElementById('demo-caption')) return;
    const el = document.createElement('div');
    el.id = 'demo-caption';
    el.style.cssText =
      'position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:22px 96px 26px;background:#16324b;color:#fbfcfc;' +
      "font:500 31px/1.35 'IBM Plex Sans',system-ui,sans-serif;text-align:center;min-height:42px;box-sizing:content-box;" +
      'border-top:4px solid #e3b23c;display:none';
    document.documentElement.appendChild(el);
  };
  window.__caption = (text) => {
    mount();
    const el = document.getElementById('demo-caption');
    el.textContent = text;
    el.style.display = text ? 'block' : 'none';
  };
  document.addEventListener('DOMContentLoaded', mount);
};

const browser = await chromium.launch();

const record = async (name, run) => {
  const dir = path.join(out, `tmp-${name}`);
  const context = await browser.newContext({ viewport: size, recordVideo: { dir, size }, colorScheme: 'light' });
  await context.addInitScript(captionScript);
  const page = await context.newPage();
  const t0 = Date.now();
  const marks = [];
  const cap = async (text, seconds = 0) => {
    marks.push({ at: (Date.now() - t0) / 1000, text });
    await page.evaluate((t) => window.__caption(t), text);
    if (seconds) await page.waitForTimeout(seconds * 1000);
  };
  const showSlide = async (n) => {
    await page.setContent(
      `<body style="margin:0;background:#f1f3f2;display:grid;place-items:start center;height:100vh;overflow:hidden">` +
        `<img src="${slide(n)}" style="height:calc(100vh - 94px);margin-top:0;box-shadow:0 0 0 1px #c9d1d4"></body>`,
    );
    await page.locator('img').evaluate((img) => img.decode());
  };
  await run({ page, cap, showSlide });
  await context.close();
  const file = readdirSync(dir).find((f) => f.endsWith('.webm'));
  renameSync(path.join(dir, file), path.join(out, `${name}.webm`));
  writeFileSync(path.join(out, `${name}.captions.json`), JSON.stringify(marks, null, 2));
  console.log(`${name}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
};

const role = (page, name) => page.getByRole('tab', { name: new RegExp(`^${name}`) }).click();
const click = async (page, name, pause = 900) => {
  const b = page.getByRole('button', { name, exact: true });
  await b.scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await b.click();
  await page.waitForTimeout(pause);
};
const top = (page, selector) =>
  page.locator(selector).first().evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' }));

await record('a-app', async ({ page, cap, showSlide }) => {
  await showSlide(1);
  await cap('Veridom Milestones: construction-loan draws, proven on Midnight without handing over the paperwork.', 5);
  await showSlide(2);
  await cap('A bank pays a construction loan stage by stage. For every tranche the builder hands over photos, invoices, contractors and amounts.', 6);
  await cap('The bank only needs three yes-or-no facts.', 4);
  await showSlide(5);
  await cap('A Compact contract keeps outcomes and commitments on the public ledger. Amounts, evidence and identity stay in private state.', 7);

  await page.goto(app);
  await page.getByRole('heading', { name: 'Veridom Milestones' }).waitFor();
  await cap('The live app. Four roles: bank, builder, inspector, auditor. One button runs the first stage for all of them.', 4);
  await click(page, 'Run stage 1 for me', 0);
  await page.locator('.guided-done').waitFor();
  await cap('Eight transactions, one per circuit. Each line says what its proof shows.', 6);

  await top(page, '.dual');
  await cap('Left: everything the chain holds. Key hashes, commitments, stage status. Right: what never leaves the builder’s device.', 7);

  await top(page, '.site');
  await role(page, 'Builder');
  await cap('Stage 2 by hand. The builder’s photos and invoices are hashed in the browser; nothing is uploaded.', 1);
  await page.getByRole('button', { name: 'Use a sample bundle' }).click();
  await page.waitForTimeout(1500);
  await click(page, 'Send bundle to the inspector', 1500);
  await role(page, 'Inspector');
  await cap('The inspector visits the site and signs the bundle hash for this contract, this project and this stage.', 2);
  await click(page, 'Sign stage 2', 2000);
  await role(page, 'Builder');
  await cap('The builder proves on chain that an authorised inspector signed stage 2. The shell inks in. The signature itself stays private.', 1);
  await click(page, 'Prove stage 2 complete', 4500);

  await cap('Now the money. The cap for this stage is €95,000. Ask for €120,000 and the circuit refuses: no proof, nothing published.', 1);
  const amount = page.getByLabel(/^Tranche, €/);
  await amount.scrollIntoViewIfNeeded();
  await amount.fill('120000');
  await click(page, 'Request tranche 2', 800);
  await top(page, '.activity');
  await page.waitForTimeout(4200);
  await top(page, '.site');
  await amount.fill('95000');
  await cap('A valid amount passes: within the stage cap, and the running total within the loan limit. The amount is not on the ledger.', 1);
  await click(page, 'Request tranche 2', 3500);
  await role(page, 'Bank');
  await cap('The bank receives the amount off chain, checks it against the on-chain commitment, and releases the tranche.', 2.5);
  await click(page, 'Release tranche 2', 3000);

  await role(page, 'Auditor');
  await cap('An auditor gets exactly one fact. The value opens the on-chain commitment, and the builder’s consent is on the ledger.', 6.5);
  await cap('Without that consent the contract refuses, even to someone holding a copy of the builder’s records.', 1);
  await click(page, 'Open a fact without consent', 800);
  await top(page, '.activity');
  await page.waitForTimeout(4200);
});

await record('c-close', async ({ page, cap, showSlide }) => {
  await showSlide(6);
  await cap('50 contract tests, 6 end-to-end tests with real proofs, and a browser test of the whole flow.', 6);
  await showSlide(9);
  await cap('Next: a rebuild for ledger 9 and the Preprod run through Lace, evidence straight from the Veridom diary, and a signing app for inspectors.', 7);
  await showSlide(10);
  await cap('Veridom Milestones. The bank sees the facts. The builder keeps the files.', 5);
});

await browser.close();
