// api/pledge.js — record a prayer-hour pledge
import { sql } from '../lib/db.js';
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
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[pledge] error:', err);
    return res.status(500).json({ error: 'Failed to record pledge' });
  }
}
