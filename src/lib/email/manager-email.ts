type LeadPayload = {
  vardas: string;
  telefonas: string;
  email?: string | null;
  miestas?: string | null;
  susisiekimoLaikas?: string | null;
  productType: string;
  slots: Record<string, unknown>;
  aiSummary: string;
  conversationText: string;
};

function escape(s: string | undefined | null): string {
  if (!s) return '—';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildManagerEmail(lead: LeadPayload): { subject: string; html: string; text: string } {
  const productLabel = lead.productType === 'silumos_siurblys' ? 'Šilumos siurblys' : 'Kondicionierius';
  const subject = `[KV LEAD] ${lead.vardas} · ${productLabel}${lead.miestas ? ' · ' + lead.miestas : ''}`;

  const slotsHtml = Object.entries(lead.slots)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b;">${escape(k)}</td><td style="padding:4px 0;">${escape(String(v))}</td></tr>`)
    .join('');

  const html = `<!doctype html>
<html lang="lt"><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0EA5B7;color:#fff;padding:20px 28px;">
      <h2 style="margin:0;font-size:18px;">🔥 Naujas lead'as — Klimato Vektoriai</h2>
      <p style="margin:4px 0 0;opacity:.9;font-size:13px;">${productLabel}</p>
    </div>

    <div style="padding:24px 28px;">

      <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;color:#0f172a;letter-spacing:.05em;">Klientas</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;width:140px;">Vardas</td><td style="padding:4px 0;font-weight:600;">${escape(lead.vardas)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Telefonas</td><td style="padding:4px 0;"><a href="tel:${escape(lead.telefonas)}" style="color:#0EA5B7;text-decoration:none;font-weight:600;">${escape(lead.telefonas)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Email</td><td style="padding:4px 0;">${escape(lead.email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Miestas</td><td style="padding:4px 0;">${escape(lead.miestas)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Skambinti</td><td style="padding:4px 0;">${escape(lead.susisiekimoLaikas)}</td></tr>
      </table>

      <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;color:#0f172a;letter-spacing:.05em;">Surinkti poreikiai</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:24px;">
        ${slotsHtml || '<tr><td style="color:#94a3b8;">(nieko nesurinkta)</td></tr>'}
      </table>

      <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;color:#0f172a;letter-spacing:.05em;">Boto santrauka</h3>
      <div style="background:#f1f5f9;border-left:3px solid #0EA5B7;padding:12px 16px;border-radius:6px;font-size:14px;line-height:1.55;color:#334155;margin-bottom:24px;white-space:pre-wrap;">${escape(lead.aiSummary)}</div>

      <details style="margin-top:24px;">
        <summary style="cursor:pointer;color:#64748b;font-size:13px;">Pilnas pokalbis</summary>
        <pre style="font-family:'SF Mono',Menlo,monospace;font-size:12px;line-height:1.55;background:#0f172a;color:#e2e8f0;padding:14px;border-radius:8px;white-space:pre-wrap;overflow-x:auto;margin-top:12px;">${escape(lead.conversationText)}</pre>
      </details>

    </div>
    <div style="padding:14px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
      Automatinis pranešimas iš KV AI chatbot'o · ${new Date().toLocaleString('lt-LT')}
    </div>
  </div>
</body></html>`;

  const text = `🔥 NAUJAS LEAD'AS — Klimato Vektoriai

KLIENTAS
Vardas:    ${lead.vardas}
Telefonas: ${lead.telefonas}
Email:     ${lead.email || '—'}
Miestas:   ${lead.miestas || '—'}
Skambinti: ${lead.susisiekimoLaikas || '—'}

PRODUKTAS: ${productLabel}

POREIKIAI:
${Object.entries(lead.slots).map(([k, v]) => `  ${k}: ${v}`).join('\n') || '  (nesurinkta)'}

BOTO SANTRAUKA:
${lead.aiSummary}

—————————————————————
POKALBIS:
${lead.conversationText}
`;

  return { subject, html, text };
}
