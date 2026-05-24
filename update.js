// api/admin/update.js — edit an existing chapel
import { sql } from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';
import { str, num, bool } from '../../lib/validate.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const numId = parseInt(body.id, 10);
  if (!Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({ error: 'Invalid chapel id' });
  }

  // Validate the fields the admin can change.
  const name      = str(body.name,    { max: 200 });
  const city      = str(body.city,    { max: 120 });
  const country   = str(body.country, { max: 120 });
  const lat       = num(body.lat, { min: -90, max: 90 });
  const lng       = num(body.lng, { min: -180, max: 180 });
  const address   = body.address  ? str(body.address,  { max: 300 }) : null;
  const schedule  = body.schedule ? str(body.schedule, { max: 200 }) : null;
  const perpetual = bool(body.perpetual);

  if (!name || !city || !country || lat === null || lng === null) {
    return res.status(400).json({ error: 'Required fields: name, city, country, lat, lng' });
  }

  try {
    const { rows } = await sql`
      UPDATE chapels
      SET name      = ${name},
          city      = ${city},
          country   = ${country},
          lat       = ${lat},
          lng       = ${lng},
          address   = ${address},
          schedule  = ${schedule},
          perpetual = ${perpetual}
      WHERE id = ${numId}
      RETURNING id, name, city, country, lat, lng, address, schedule, perpetual, status
    `;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Chapel not found' });
    }
    return res.status(200).json({ ok: true, chapel: rows[0] });
  } catch (err) {
    console.error('[admin/update] error:', err);
    return res.status(500).json({ error: 'Failed to update chapel' });
  }
}
