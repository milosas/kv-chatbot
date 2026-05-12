import { db } from './index';
import { conversations, messages, leads, type NewLead } from './schema';
import { eq, desc } from 'drizzle-orm';

export async function findOrCreateConversation(sessionId: string) {
  const existing = await db
    .select()
    .from(conversations)
    .where(eq(conversations.sessionId, sessionId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(conversations)
    .values({ sessionId })
    .returning();
  return created;
}

export async function getConversationMessages(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function appendMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
) {
  const [row] = await db
    .insert(messages)
    .values({ conversationId, role, content })
    .returning();
  return row;
}

export async function updateConversationState(
  conversationId: string,
  patch: Partial<{ state: string; intent: string; slotData: Record<string, unknown> }>,
) {
  await db.update(conversations).set(patch).where(eq(conversations.id, conversationId));
}

export async function createLead(data: NewLead) {
  const [row] = await db.insert(leads).values(data).returning();
  if (row && data.conversationId) {
    await db
      .update(conversations)
      .set({ leadId: row.id, state: 'done', endedAt: new Date() })
      .where(eq(conversations.id, data.conversationId));
  }
  return row;
}

export async function updateLeadEmailStatus(
  leadId: string,
  status: 'sent' | 'failed',
  error?: string,
) {
  await db
    .update(leads)
    .set({
      emailStatus: status,
      emailError: error || null,
      emailSentAt: status === 'sent' ? new Date() : null,
    })
    .where(eq(leads.id, leadId));
}

export async function listLeads() {
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function getLeadById(leadId: string) {
  const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  return rows[0] || null;
}
