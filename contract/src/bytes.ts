// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0

/** 32 random bytes from the platform CSPRNG (Node 22 and browsers). */
export const randomBytes32 = (): Uint8Array => globalThis.crypto.getRandomValues(new Uint8Array(32));

export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export const fromHex = (hex: string): Uint8Array => {
  const clean = hex.replace(/^0x/, '');
  if (clean.length % 2 !== 0 || /[^0-9a-f]/i.test(clean)) throw new Error('Invalid hex string');
  return Uint8Array.from(clean.match(/.{2}/g) ?? [], (b) => parseInt(b, 16));
};

export const bytesEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/** SHA-256 via WebCrypto, available in Node 22 and in browsers. */
export const sha256 = async (data: Uint8Array | string): Promise<Uint8Array> => {
  const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  return new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', input as BufferSource));
};

/** Euro cents to a display string, e.g. 1250000n -> "12,500.00". */
export const formatCents = (cents: bigint): string => {
  const neg = cents < 0n;
  const abs = neg ? -cents : cents;
  const euros = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}${euros}.${(abs % 100n).toString().padStart(2, '0')}`;
};
