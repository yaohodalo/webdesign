// lib/email.js — Resend email notifications
// Requires env var: RESEND_API_KEY, NOTIFY_EMAIL

const RESEND_API = 'https://api.resend.com/emails';

// Send to admin (uses NOTIFY_EMAIL env var)
export async function notify({ subject, html }) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) {
    console.warn('[email] NOTIFY_EMAIL not set — skipping notify');
    return { skipped: true };
  }
  return sendEmail({ to, subject, html });
}

// Send to any recipient (used for pledge confirmations)
export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM || 'WYJMFOH <onboarding@resend.dev>';

  if (!key || !to) {
    console.warn('[email] RESEND_API_KEY or recipient missing — skipping');
    return { skipped: true };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[email] Resend error:', res.status, text);
      return { ok: false, error: text };
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] fetch failed:', err);
    return { ok: false, error: String(err) };
  }
}

// Small HTML helper to avoid messy template strings
export function row(label, value) {
  if (!value) return '';
  const safe = String(value).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  return `<tr><td style="padding:6px 12px;color:#666;font-family:Georgia,serif;">${label}</td><td style="padding:6px 12px;font-family:Georgia,serif;">${safe}</td></tr>`;
}
