// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Renders deck.html to a 16:9 PDF and one PNG per slide.
//   npx playwright install chromium   (once)
//   node docs/slides/render-pdf.mjs

import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(pathToFileURL(path.join(here, 'deck.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: path.join(here, 'veridom-milestones-deck.pdf'),
  width: '1600px',
  height: '900px',
  printBackground: true,
});
const slides = await page.locator('.slide').all();
for (const [i, s] of slides.entries()) {
  await s.screenshot({ path: path.join(here, 'png', `slide-${String(i + 1).padStart(2, '0')}.png`) });
}
await browser.close();
console.log(`Rendered ${slides.length} slides`);
