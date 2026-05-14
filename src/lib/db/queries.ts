import { db } from './index';
import { conversations, messages, leads, emailRecipientStatus, type NewLead } from './schema';
import { eq, desc, sql } from 'drizzle-orm';

const BLACKLIST_THRESHOLD = 2;

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

export async function getBlacklistedRecipients(): Promise<string[]> {
  const rows = await db
    .select({ email: emailRecipientStatus.email })
    .from(emailRecipientStatus)
    .where(eq(emailRecipientStatus.blacklisted, true));
  return rows.map((r) => r.email);
}

export async function recordRecipientFailure(email: string, error: string) {
  await db
    .insert(emailRecipientStatus)
    .values({
      email,
      failCount: 1,
      lastFailedAt: new Date(),
      lastError: error,
      blacklisted: false,
    })
    .onConflictDoUpdate({
      target: emailRecipientStatus.email,
      set: {
        failCount: sql`${emailRecipientStatus.failCount} + 1`,
        lastFailedAt: new Date(),
        lastError: error,
        blacklisted: sql`(${emailRecipientStatus.failCount} + 1) >= ${BLACKLIST_THRESHOLD}`,
        blacklistedAt: sql`CASE WHEN (${emailRecipientStatus.failCount} + 1) >= ${BLACKLIST_THRESHOLD} AND ${emailRecipientStatus.blacklisted} = false THEN NOW() ELSE ${emailRecipientStatus.blacklistedAt} END`,
        updatedAt: new Date(),
      },
    });
}

export async function recordRecipientSuccess(email: string) {
  await db
    .insert(emailRecipientStatus)
    .values({
      email,
      failCount: 0,
      blacklisted: false,
    })
    .onConflictDoUpdate({
      target: emailRecipientStatus.email,
      set: {
        failCount: 0,
        blacklisted: false,
        blacklistedAt: null,
        lastError: null,
        updatedAt: new Date(),
      },
    });
}
