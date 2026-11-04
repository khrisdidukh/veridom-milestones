// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const here = path.dirname(fileURLToPath(import.meta.url));

// Targets ES2022, which has native top-level await (used by the WASM runtime),
// so vite-plugin-top-level-await is not needed.
export default defineConfig(({ mode }) => ({
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    global: 'globalThis',
  },
  // Lace mode: FetchZkConfigProvider requests <origin>/keys/<circuit>.prover|verifier
  // and <origin>/zkir/<circuit>.bzkir, which is exactly the compiler output layout.
  // Run `npm run compile` (full, with proving keys) before using Lace mode.
  publicDir: path.resolve(here, '../contract/src/managed/veridom-milestones'),
  plugins: [
    nodePolyfills({ include: ['buffer', 'process'], globals: { Buffer: true, process: true } }),
    wasm(),
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: { define: { global: 'globalThis' }, target: 'es2022' },
    // The on-chain runtime is a WASM package and must not be pre-bundled.
    exclude: ['@midnight-ntwrk/onchain-runtime-v3'],
  },
  build: {
    target: 'es2022',
    commonjsOptions: { transformMixedEsModules: true },
    chunkSizeWarningLimit: 8000,
  },
  server: {
    fs: { allow: [path.resolve(here, '..')] },
  },
}));
