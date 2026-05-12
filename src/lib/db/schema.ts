import { pgTable, uuid, text, timestamp, jsonb, bigserial } from 'drizzle-orm/pg-core';

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: text('session_id').notNull(),
  state: text('state').notNull().default('discovery'),
  intent: text('intent'),
  slotData: jsonb('slot_data').default({}).notNull(),
  leadId: uuid('lead_id'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

export const messages = pgTable('messages', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversations.id),

  vardas: text('vardas').notNull(),
  telefonas: text('telefonas').notNull(),
  email: text('email'),
  miestas: text('miestas'),
  susisiekimoLaikas: text('susisiekimo_laikas'),

  productType: text('product_type').notNull(),
  slots: jsonb('slots').default({}).notNull(),
  aiSummary: text('ai_summary'),

  status: text('status').default('new').notNull(),

  emailStatus: text('email_status').default('pending').notNull(),
  emailError: text('email_error'),
  emailSentAt: timestamp('email_sent_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
