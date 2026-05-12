import { createHmac, timingSafeEqual } from 'crypto';
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

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function makeAdminToken(): string {
  const issued = Date.now().toString();
  const sig = sign(issued);
  return `${issued}.${sig}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedStr, sig] = token.split('.');
  if (!issuedStr || !sig) return false;

  const expected = sign(issuedStr);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  try {
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const issued = Number(issuedStr);
  if (!Number.isFinite(issued)) return false;
  const ageMs = Date.now() - issued;
  return ageMs < TTL_DAYS * 24 * 60 * 60 * 1000;
}

export async function setAdminCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, makeAdminToken(), {
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
