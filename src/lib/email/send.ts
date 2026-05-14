import { getTransporter, EMAIL_FROM, EMAIL_MANAGER } from './client';
import {
  getBlacklistedRecipients,
  recordRecipientFailure,
  recordRecipientSuccess,
} from '../db/queries';

type SendArgs = {
  to?: string;
  subject: string;
  html: string;
  text: string;
};

export type SendResult =
  | { ok: true; id: string; accepted: string[]; rejected: string[]; blacklisted: string[] }
  | { ok: false; error: string; accepted: string[]; rejected: string[]; blacklisted: string[] };

function parseRecipients(raw: string | undefined): string[] {
  return (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeAddress(addr: unknown): string {
  if (typeof addr === 'string') return addr.toLowerCase();
  if (addr && typeof addr === 'object' && 'address' in (addr as Record<string, unknown>)) {
    const a = (addr as { address?: string }).address;
    return (a || '').toLowerCase();
  }
  return '';
}

export async function sendManagerEmail({ to, subject, html, text }: SendArgs): Promise<SendResult> {
  const allRecipients = parseRecipients(to || EMAIL_MANAGER);
  if (allRecipients.length === 0) {
    return { ok: false, error: 'No recipients configured', accepted: [], rejected: [], blacklisted: [] };
  }

  let blacklistedAll: Set<string>;
  try {
    blacklistedAll = new Set((await getBlacklistedRecipients()).map((e) => e.toLowerCase()));
  } catch (e) {
    console.error('Failed to load blacklist, proceeding without filter:', e);
    blacklistedAll = new Set();
  }

  const blacklistedHits = allRecipients.filter((r) => blacklistedAll.has(r.toLowerCase()));
  const toTry = allRecipients.filter((r) => !blacklistedAll.has(r.toLowerCase()));

  if (toTry.length === 0) {
    return {
      ok: false,
      error: 'All recipients blacklisted',
      accepted: [],
      rejected: [],
      blacklisted: blacklistedHits,
    };
  }

  try {
    const info = await getTransporter().sendMail({
      from: EMAIL_FROM,
      to: toTry.join(', '),
      subject,
      html,
      text,
    });

    const accepted = ((info.accepted as unknown[]) || []).map(normalizeAddress).filter(Boolean);
    const rejected = ((info.rejected as unknown[]) || []).map(normalizeAddress).filter(Boolean);

    // Fallback: if neither list populated, assume all toTry accepted (some SMTPs don't report)
    const acceptedSet = new Set(accepted);
    const rejectedSet = new Set(rejected);
    const effectiveAccepted =
      accepted.length === 0 && rejected.length === 0
        ? toTry.map((r) => r.toLowerCase())
        : toTry.filter((r) => acceptedSet.has(r.toLowerCase())).map((r) => r.toLowerCase());
    const effectiveRejected = toTry
      .filter((r) => rejectedSet.has(r.toLowerCase()))
      .map((r) => r.toLowerCase());

    for (const r of effectiveAccepted) {
      try {
        await recordRecipientSuccess(r);
      } catch (e) {
        console.error('recordRecipientSuccess failed:', r, e);
      }
    }
    for (const r of effectiveRejected) {
      try {
        await recordRecipientFailure(r, 'Rejected by remote MTA');
      } catch (e) {
        console.error('recordRecipientFailure failed:', r, e);
      }
    }

    return {
      ok: effectiveAccepted.length > 0,
      id: info.messageId || 'unknown',
      accepted: effectiveAccepted,
      rejected: effectiveRejected,
      blacklisted: blacklistedHits,
    };
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'Unknown send error';
    for (const r of toTry) {
      try {
        await recordRecipientFailure(r, errMsg);
      } catch (dbErr) {
        console.error('recordRecipientFailure failed:', r, dbErr);
      }
    }
    return {
      ok: false,
      error: errMsg,
      accepted: [],
      rejected: toTry,
      blacklisted: blacklistedHits,
    };
  }
}
