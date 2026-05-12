import { cookies } from 'next/headers';

const COOKIE_NAME = 'kv_admin';
const TTL_DAYS = 30;

function getSecret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET;
  if (!s || s.length < 16) {
    throw new Error('ADMIN_COOKIE_SECRET must be set (min 16 chars)');
  }
  return s;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function importKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function sign(payload: string): Promise<string> {
  const key = await importKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toHex(sig);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function makeAdminToken(): Promise<string> {
  const issued = Date.now().toString();
  const sig = await sign(issued);
  return `${issued}.${sig}`;
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [issuedStr, sig] = token.split('.');
  if (!issuedStr || !sig) return false;

  const expected = await sign(issuedStr);
  if (!timingSafeEqualHex(sig, expected)) return false;

  const issued = Number(issuedStr);
  if (!Number.isFinite(issued)) return false;
  const ageMs = Date.now() - issued;
  return ageMs < TTL_DAYS * 24 * 60 * 60 * 1000;
}

export async function setAdminCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, await makeAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
