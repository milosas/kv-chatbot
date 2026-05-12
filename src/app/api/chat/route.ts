import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  findOrCreateConversation,
  getConversationMessages,
  appendMessage,
  updateConversationState,
} from '@/lib/db/queries';
import { generateReply, extractSlots, type ChatMessage } from '@/lib/openai/chat';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  session_id: z.string().min(8),
  message: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { session_id, message } = body;

  try {
    const conv = await findOrCreateConversation(session_id);

    const prior = await getConversationMessages(conv.id);
    const history: ChatMessage[] = prior.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    await appendMessage(conv.id, 'user', message);
    history.push({ role: 'user', content: message });

    const reply = await generateReply(history);
    await appendMessage(conv.id, 'assistant', reply);
    history.push({ role: 'assistant', content: reply });

    const slotUpdate = await extractSlots(
      history,
      conv.intent,
      (conv.slotData as Record<string, unknown>) || {},
    );

    const mergedSlots = { ...(conv.slotData as Record<string, unknown>), ...(slotUpdate.slots || {}) };
    await updateConversationState(conv.id, {
      intent: slotUpdate.intent || conv.intent || undefined,
      state: slotUpdate.state || conv.state,
      slotData: mergedSlots,
    });

    const showLeadForm = Boolean(slotUpdate.ready_for_contact) && slotUpdate.state !== 'done';

    return NextResponse.json({
      message: reply,
      state: slotUpdate.state || conv.state,
      intent: slotUpdate.intent || conv.intent,
      slots: mergedSlots,
      show_lead_form: showLeadForm,
      conversation_id: conv.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('chat error:', msg);
    return NextResponse.json(
      {
        message:
          'Atsiprašau, įvyko techninė klaida. Galite skambinti tiesiogiai: Vilnius +370 620 460 40 arba Kaunas +370 602 55955.',
        error: msg,
      },
      { status: 500 },
    );
  }
}
