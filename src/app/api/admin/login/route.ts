import { NextResponse } from 'next/server';
import { setAdminCookie } from '@/lib/auth/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Neteisingas slaptažodis.' }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ success: true });
}
