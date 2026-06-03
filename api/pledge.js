// api/pledge.js — record a prayer-hour pledge
import { sql } from '../lib/db.js';
import { notify, row } from '../lib/email.js';
import { str, email, isoDate } from '../lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  const name       = str(body.name, { max: 120 });
  const userEmail  = body.email ? email(body.email) : null;
  const pledgeTime = isoDate(body.time);
  const intention  = body.intention ? str(body.intention, { max: 1000 }) : null;

  if (!name || !pledgeTime) {
    return res.status(400).json({ error: 'Missing required fields: name, time' });
  }

  try {
    await sql`
      INSERT INTO pledges (name, email, pledge_time, intention)
      VALUES (${name}, ${userEmail}, ${pledgeTime}, ${intention})
    `;

    notify({
      subject: `🙏 New Pledge: ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;">
          <h2 style="color:#0B1F3A;border-bottom:2px solid #D4AF37;padding-bottom:8px;">New Prayer Hour Pledge</h2>
          <table style="border-collapse:collapse;width:100%;">
            ${row('Name', name)}
            ${row('Email', userEmail)}
            ${row('Time', pledgeTime)}
            ${row('Intention', intention)}
          </table>
        </div>
      `,
    }).catch(e => console.error('[pledge] notify failed:', e));

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[pledge] error:', err);
    return res.status(500).json({ error: 'Failed to record pledge' });
  }
}
