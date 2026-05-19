// api/contact.js — save and email a contact message
import { sql } from '../lib/db.js';
import { notify, row } from '../lib/email.js';
import { str, email } from '../lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  const name        = str(body.name, { max: 120 });
  const userEmail   = email(body.email);
  const message     = str(body.message, { min: 3, max: 5000 });

  if (!name || !userEmail || !message) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  try {
    await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name}, ${userEmail}, ${message})
    `;

    notify({
      subject: `✉ Contact: ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;">
          <h2 style="color:#0B1F3A;border-bottom:2px solid #D4AF37;padding-bottom:8px;">New Contact Message</h2>
          <table style="border-collapse:collapse;width:100%;">
            ${row('From', name)}
            ${row('Email', userEmail)}
          </table>
          <h3 style="color:#0B1F3A;margin-top:24px;">Message</h3>
          <div style="background:#FAF6F1;padding:16px;border-left:3px solid #D4AF37;white-space:pre-wrap;">
            ${message.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}
          </div>
        </div>
      `,
    }).catch(e => console.error('[contact] notify failed:', e));

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[contact] error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
