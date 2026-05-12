import { getTransporter, EMAIL_FROM, EMAIL_MANAGER } from './client';

type SendArgs = {
  to?: string;
  subject: string;
  html: string;
  text: string;
};

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendManagerEmail({ to, subject, html, text }: SendArgs): Promise<SendResult> {
  try {
    const info = await getTransporter().sendMail({
      from: EMAIL_FROM,
      to: to || EMAIL_MANAGER,
      subject,
      html,
      text,
    });
    return { ok: true, id: info.messageId || 'unknown' };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown send error' };
  }
}
