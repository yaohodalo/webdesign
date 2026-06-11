// lib/email.js — Resend email notifications
// Requires env vars: RESEND_API_KEY, NOTIFY_EMAIL, NOTIFY_FROM
//
// DIAGNOSTIC MODE: returns rich error details (status, body, etc.) so callers
// can surface them to the browser for debugging.

const RESEND_API = 'https://api.resend.com/emails';

// Send to admin (uses NOTIFY_EMAIL env var as recipient)
export async function notify({ subject, html }) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) {
    return { skipped: true, reason: 'NOTIFY_EMAIL env var not set' };
  }
  return sendEmail({ to, subject, html });
}

// Send an email to any recipient (used for pledge confirmations to users)
export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM || 'WYJMFOH <onboarding@resend.dev>';

  if (!key) {
    return { skipped: true, reason: 'RESEND_API_KEY env var not set' };
  }
  if (!to) {
    return { skipped: true, reason: 'No recipient' };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    const responseText = await res.text();
    let responseBody = null;
    try { responseBody = JSON.parse(responseText); } catch (_) { responseBody = responseText; }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        statusText: res.statusText,
        from,
        to,
        responseBody,
      };
    }
    return {
      ok: true,
      status: res.status,
      from,
      to,
      messageId: responseBody?.id || null,
    };
  } catch (err) {
    return {
      ok: false,
      thrown: true,
      error: String(err),
      name: err?.name,
      from,
      to,
    };
  }
}

// Small HTML helper to avoid messy template strings
export function row(label, value) {
  if (!value) return '';
  const safe = String(value).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  return '<tr><td style="padding:6px 12px;color:#666;font-family:Georgia,serif;">' + label + '</td><td style="padding:6px 12px;font-family:Georgia,serif;">' + safe + '</td></tr>';
}
