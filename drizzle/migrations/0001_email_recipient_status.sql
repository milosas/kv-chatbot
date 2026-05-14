CREATE TABLE IF NOT EXISTS "email_recipient_status" (
	"email" text PRIMARY KEY NOT NULL,
	"fail_count" integer DEFAULT 0 NOT NULL,
	"last_failed_at" timestamp,
	"last_error" text,
	"blacklisted" boolean DEFAULT false NOT NULL,
	"blacklisted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
