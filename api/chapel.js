// api/chapel.js — submit a chapel for review
import { sql } from '../lib/db.js';
import { notify, row } from '../lib/email.js';
import { str, email, num, bool } from '../lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  const name      = str(body.name, { max: 200 });
  const city      = str(body.city, { max: 120 });
  const country   = str(body.country, { max: 120 });
  const lat       = num(body.lat, { min: -90, max: 90 });
  const lng       = num(body.lng, { min: -180, max: 180 });
  const address   = body.address   ? str(body.address,  { max: 300 }) : null;
  const schedule  = body.schedule  ? str(body.schedule, { max: 200 }) : null;
  const perpetual = bool(body.perpetual);
  const submitter = body.submitter_email ? email(body.submitter_email) : null;

  if (!name || !city || !country || lat === null || lng === null) {
    return res.status(400).json({
      error: 'Missing required fields: name, city, country, lat, lng'
    });
  }

  try {
    const { rows } = await sql`
      INSERT INTO chapels (name, city, country, address, lat, lng, schedule, perpetual, status, submitter_email)
      VALUES (${name}, ${city}, ${country}, ${address}, ${lat}, ${lng}, ${schedule}, ${perpetual}, 'pending', ${submitter})
      RETURNING id, created_at
    `;

    // Fire-and-forget email notification (don't block response)
    notify({
      subject: `🕯️ New chapel submission: ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;">
          <h2 style="color:#0B1F3A;border-bottom:2px solid #D4AF37;padding-bottom:8px;">New Chapel Submission</h2>
          <table style="border-collapse:collapse;width:100%;">
            ${row('Name', name)}
            ${row('Location', `${city}, ${country}`)}
            ${row('Address', address)}
            ${row('Coordinates', `${lat}, ${lng}`)}
            ${row('Schedule', schedule)}
            ${row('Perpetual', perpetual ? 'Yes — 24/7' : 'No')}
            ${row('Submitter', submitter)}
          </table>
          <p style="margin-top:24px;">
            <a href="${process.env.SITE_URL || 'https://wouldyoujoinmeforonehour.org'}/admin.html"
               style="background:#D4AF37;color:#0B1F3A;padding:10px 20px;text-decoration:none;border-radius:6px;font-weight:bold;">
              Review in admin panel →
            </a>
          </p>
        </div>
      `,
    }).catch(e => console.error('[chapel] notify failed:', e));

    return res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error('[chapel] error:', err);
    return res.status(500).json({ error: 'Failed to submit chapel' });
  }
}
