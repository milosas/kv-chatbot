import { NextResponse } from 'next/server';
import { getConversationMessages } from '@/lib/db/queries';
import { isAdmin } from '@/lib/auth/admin';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const messages = await getConversationMessages(id);
  return NextResponse.json({ messages });
}
