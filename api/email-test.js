// api/email-test.js — visit /api/email-test?to=youremail@gmail.com in your browser
// to test the email system directly. Returns full diagnostics as JSON.
//
// This is a TEMPORARY diagnostic endpoint. Remove after emails are working.

import { sendEmail } from '../lib/email.js';

export default async function handler(req, res) {
  const to = req.query.to || process.env.NOTIFY_EMAIL || 'test@example.com';

  // Pre-flight env check
  const envCheck = {
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(0, 8) + '...' : 'MISSING',
    resendKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
    notifyEmail: process.env.NOTIFY_EMAIL || 'MISSING',
    notifyFrom: process.env.NOTIFY_FROM || '(using default WYJMFOH <onboarding@resend.dev>)',
    nodeVersion: process.version,
  };

  // Attempt to send a test email
  let sendResult;
  try {
    sendResult = await sendEmail({
      to,
      subject: 'WYJMFOH Email System Test',
      html: '<div style="font-family:Georgia,serif;padding:20px;"><h1 style="color:#7a5f1f;">Email system test</h1><p>If you received this, your Resend integration is working correctly.</p><p style="font-size:13px;color:#888;">Sent ' + new Date().toISOString() + '</p></div>',
    });
  } catch (err) {
    sendResult = {
      thrown: true,
      error: String(err),
      name: err?.name,
      stack: err?.stack?.slice(0, 800),
    };
  }

  // Return everything as nicely formatted JSON
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    timestamp: new Date().toISOString(),
    sentTo: to,
    env: envCheck,
    sendResult,
    nextSteps: sendResult?.ok
      ? '✓ Email API call succeeded. Check ' + to + ' inbox AND spam folder.'
      : '✗ Email failed. See sendResult above for the exact error from Resend.',
  });
}
