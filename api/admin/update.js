// api/admin/update.js — edit an existing chapel + replace its time slots
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

  const name      = str(body.name,    { max: 200 });
  const city      = str(body.city,    { max: 120 });
  const country   = str(body.country, { max: 120 });
  const lat       = num(body.lat, { min: -90,  max: 90  });
  const lng       = num(body.lng, { min: -180, max: 180 });
  const address   = body.address  ? str(body.address,  { max: 500 }) : null;
  const schedule  = body.schedule ? str(body.schedule, { max: 200 }) : null;
  const notes     = body.notes    ? str(body.notes,    { max: 1000 }) : null;
  const perpetual    = bool(body.perpetual);
  const codeRequired = bool(body.code_required);

  if (!name || !city || !country || lat === null || lng === null) {
    return res.status(400).json({ error: 'Required fields: name, city, country, lat, lng' });
  }

  try {
    const { rows } = await sql`
      UPDATE chapels
      SET name           = ${name},
          city           = ${city},
          country        = ${country},
          lat            = ${lat},
          lng            = ${lng},
          address        = ${address},
          schedule       = ${schedule},
          notes          = ${notes},
          perpetual      = ${perpetual},
          code_required  = ${codeRequired}
      WHERE id = ${numId}
      RETURNING id
    `;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Chapel not found' });
    }

    // Replace adoration_times if a new set was sent
    if (Array.isArray(body.adoration_times)) {
      await sql`DELETE FROM adoration_times WHERE chapel_id = ${numId}`;
      const dbRows = [];
      for (const raw of body.adoration_times) {
        const expanded = expandSlot(raw);
        for (const r of expanded) dbRows.push(r);
      }
      for (const slot of dbRows) {
        await sql`
          INSERT INTO adoration_times (chapel_id, frequency, day_of_week, start_time, end_time, various_times)
          VALUES (${numId}, ${slot.frequency}, ${slot.day_of_week},
                  ${slot.start_time}, ${slot.end_time}, ${slot.various_times})
        `;
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[admin/update] error:', err);
    return res.status(500).json({ error: 'Failed to update chapel' });
  }
}

function expandSlot(raw) {
  if (!raw || typeof raw !== 'object') return [];

  if (raw.various_times) {
    return [{ frequency: 'various', day_of_week: null, start_time: null, end_time: null, various_times: true }];
  }

  const allowed = ['daily', 'weekly'];
  const frequency = allowed.includes(raw.frequency) ? raw.frequency : 'weekly';

  const startOk = /^\d{2}:\d{2}$/.test(raw.start_time || '');
  const endOk   = /^\d{2}:\d{2}$/.test(raw.end_time   || '');
  if (!startOk || !endOk) return [];

  if (frequency === 'daily') {
    const out = [];
    for (let d = 0; d <= 6; d++) {
      out.push({ frequency: 'daily', day_of_week: d, start_time: raw.start_time, end_time: raw.end_time, various_times: false });
    }
    return out;
  }

  const from = parseInt(raw.day_from, 10);
  const to   = parseInt(raw.day_to,   10);
  if (!Number.isInteger(from) || from < 0 || from > 6) return [];
  if (!Number.isInteger(to)   || to   < 0 || to   > 6) return [];

  const days = [];
  if (from <= to) {
    for (let d = from; d <= to; d++) days.push(d);
  } else {
    for (let d = from; d <= 6; d++) days.push(d);
    for (let d = 0; d <= to; d++) days.push(d);
  }

  return days.map(d => ({
    frequency: 'weekly',
    day_of_week: d,
    start_time: raw.start_time,
    end_time: raw.end_time,
    various_times: false,
  }));
}
