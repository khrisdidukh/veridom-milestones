// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0

import { StageStatus, toHex } from '@veridom/milestones-contract';

const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

export const euros = (cents: bigint): string => eur.format(Number(cents) / 100);

export const centsFromInput = (value: string): bigint | null => {
  const clean = value.replace(/[\s,€]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const [whole, frac = ''] = clean.split('.');
  return BigInt(whole) * 100n + BigInt(frac.padEnd(2, '0'));
};

export const short = (bytes: Uint8Array | string, n = 8): string => {
  const hex = typeof bytes === 'string' ? bytes : toHex(bytes);
  return hex.length <= n * 2 ? hex : `${hex.slice(0, n)}…${hex.slice(-4)}`;
};

export const statusLabel: Record<StageStatus, string> = {
  [StageStatus.Pending]: 'Not started',
  [StageStatus.Attested]: 'Proven complete',
  [StageStatus.TrancheRequested]: 'Tranche requested',
  [StageStatus.TrancheReleased]: 'Tranche paid',
};

export const time = (d: Date): string => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
