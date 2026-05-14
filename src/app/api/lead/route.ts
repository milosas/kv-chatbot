import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  findOrCreateConversation,
  getConversationMessages,
  createLead,
  updateLeadEmailStatus,
} from '@/lib/db/queries';
import { generateLeadSummary } from '@/lib/openai/summary';
import { buildManagerEmail } from '@/lib/email/manager-email';
import { sendManagerEmail } from '@/lib/email/send';
import type { ChatMessage } from '@/lib/openai/chat';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  session_id: z.string().min(8),
  vardas: z.string().min(1).max(120),
  telefonas: z.string().min(5).max(40),
  email: z.string().email().optional().or(z.literal('')),
  miestas: z.string().max(80).optional().or(z.literal('')),
  susisiekimo_laikas: z.string().max(80).optional().or(z.literal('')),
  product_type: z.string().min(1),
  slots: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(req: Request) {
  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Neteisingi duomenys.' }, { status: 400 });
  }

  try {
    const conv = await findOrCreateConversation(body.session_id);
    const allMessages = await getConversationMessages(conv.id);
    const history: ChatMessage[] = allMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const aiSummary = await generateLeadSummary(history, body.slots);

    const lead = await createLead({
      conversationId: conv.id,
      vardas: body.vardas,
      telefonas: body.telefonas,
      email: body.email || null,
      miestas: body.miestas || null,
      susisiekimoLaikas: body.susisiekimo_laikas || null,
      productType: body.product_type,
      slots: body.slots,
      aiSummary,
      emailStatus: 'pending',
    });

    const conversationText = history
      .map((m) => `${m.role === 'user' ? 'Klientas' : 'Botas'}: ${m.content}`)
      .join('\n\n');

    const { subject, html, text } = buildManagerEmail({
      vardas: body.vardas,
      telefonas: body.telefonas,
      email: body.email || null,
      miestas: body.miestas || null,
      susisiekimoLaikas: body.susisiekimo_laikas || null,
      productType: body.product_type,
      slots: body.slots,
      aiSummary,
      conversationText,
    });

    const result = await sendManagerEmail({ subject, html, text });

    if (result.ok) {
      const note: string[] = [];
      if (result.rejected.length) note.push(`rejected: ${result.rejected.join(', ')}`);
      if (result.blacklisted.length) note.push(`blacklisted: ${result.blacklisted.join(', ')}`);
      await updateLeadEmailStatus(lead.id, 'sent', note.length ? `Partial — ${note.join('; ')}` : undefined);
    } else {
      const note: string[] = [result.error];
      if (result.blacklisted.length) note.push(`blacklisted: ${result.blacklisted.join(', ')}`);
      await updateLeadEmailStatus(lead.id, 'failed', note.join(' | '));
      console.error('Email send failed:', note.join(' | '));
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      email_status: result.ok ? 'sent' : 'failed',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('lead error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
