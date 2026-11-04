// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// Compiles the contract with the official `compact` CLI and writes a build
// record to contract/build-evidence/: tool versions, the full compiler output
// and SHA-256 hashes of every generated artifact.
//
//   node scripts/compile.mjs            full compile with proving keys
//   node scripts/compile.mjs --skip-zk  JS/TS bindings only (fast)

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = 'src/veridom-milestones.compact';
const out = 'src/managed/veridom-milestones';
const skipZk = process.argv.includes('--skip-zk');
const evidenceDir = path.join(root, 'build-evidence');

const run = (args) => {
  const r = spawnSync('compact', args, { cwd: root, encoding: 'utf8' });
  if (r.error) {
    console.error(`Could not run "compact ${args.join(' ')}": ${r.error.message}`);
    console.error('Install the toolchain: https://docs.midnight.network/getting-started/installation');
    process.exit(1);
  }
  return r;
};

const cli = run(['--version']).stdout.trim();
const compiler = run(['compile', '--version']).stdout.trim();
const language = run(['compile', '--language-version']).stdout.trim();

const args = ['compile', ...(skipZk ? ['--skip-zk'] : []), source, out];
console.log(`$ compact ${args.join(' ')}`);
const started = Date.now();
const result = run(args);
const seconds = ((Date.now() - started) / 1000).toFixed(1);
// The compiler redraws its progress bar with carriage returns; keep the last frame.
const clean = (s) => s.split('\n').map((l) => l.split('\r').pop()).join('\n').trim();
const output = [clean(result.stdout), clean(result.stderr)].filter(Boolean).join('\n');
process.stdout.write(output + '\n');
if (result.status !== 0) {
  console.error(`compact exited with status ${result.status}`);
  process.exit(result.status ?? 1);
}

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else files.push(full);
  }
};
walk(path.join(root, out));
const hashes = files.map((f) => {
  const digest = createHash('sha256').update(readFileSync(f)).digest('hex');
  return `${digest}  ${path.relative(root, f)}  (${statSync(f).size} bytes)`;
});

mkdirSync(evidenceDir, { recursive: true });
const info = JSON.parse(readFileSync(path.join(root, out, 'compiler/contract-info.json'), 'utf8'));
const log = [
  '# Veridom Milestones: compiler build record',
  `date:              ${new Date().toISOString()}`,
  `compact CLI:       ${cli}`,
  `compiler:          ${compiler}`,
  `language version:  ${language}`,
  `runtime required:  ${info['runtime-version']}`,
  `mode:              ${skipZk ? '--skip-zk (no proving keys)' : 'full (zkir + proving/verifier keys)'}`,
  `duration:          ${seconds} s`,
  '',
  `$ compact ${args.join(' ')}`,
  output || '(no output)',
  '',
  '## Circuits (from compiler/contract-info.json)',
  ...info.circuits.map((c) => `- ${c.name}${c.pure ? ' (pure)' : ''}${c.proof ? ' [proof]' : ''}`),
  '',
  '## Artifacts (sha256)',
  ...hashes,
  '',
].join('\n');
const logFile = path.join(evidenceDir, skipZk ? 'compile-fast.log' : 'compile.log');
writeFileSync(logFile, log);
console.log(`Build record written to ${path.relative(root, logFile)}`);
