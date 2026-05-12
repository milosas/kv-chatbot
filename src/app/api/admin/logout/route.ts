import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/auth/admin';

export const runtime = 'nodejs';

export async function POST() {
  await clearAdminCookie();
  return NextResponse.json({ success: true });
}
