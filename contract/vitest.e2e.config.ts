// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['e2e/**/*.e2e.test.ts'],
    testTimeout: 15 * 60_000,
    hookTimeout: 15 * 60_000,
    sequence: { concurrent: false },
    fileParallelism: false,
    disableConsoleIntercept: true,
  },
});
