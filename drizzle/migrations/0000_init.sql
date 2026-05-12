CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"state" text DEFAULT 'discovery' NOT NULL,
	"intent" text,
	"slot_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lead_id" uuid,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);

CREATE TABLE IF NOT EXISTS "messages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid,
	"vardas" text NOT NULL,
	"telefonas" text NOT NULL,
	"email" text,
	"miestas" text,
	"susisiekimo_laikas" text,
	"product_type" text NOT NULL,
	"slots" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ai_summary" text,
	"status" text DEFAULT 'new' NOT NULL,
	"email_status" text DEFAULT 'pending' NOT NULL,
	"email_error" text,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk"
   FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_conversation_id_conversations_id_fk"
   FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "messages_conv_idx" ON "messages" ("conversation_id");
CREATE INDEX IF NOT EXISTS "conv_session_idx" ON "conversations" ("session_id");
CREATE INDEX IF NOT EXISTS "leads_created_idx" ON "leads" ("created_at");
