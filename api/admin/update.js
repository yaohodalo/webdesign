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
          perpetual      = ${perpetual},
          code_required  = ${codeRequired}
      WHERE id = ${numId}
      RETURNING id
    `;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Chapel not found' });
    }

    // If client sent a new adoration_times array, replace the slots entirely
    if (Array.isArray(body.adoration_times)) {
      await sql`DELETE FROM adoration_times WHERE chapel_id = ${numId}`;
      for (const raw of body.adoration_times) {
        const slot = sanitizeSlot(raw);
        if (!slot) continue;
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

function sanitizeSlot(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const various = !!raw.various_times;
  const allowed = ['weekly', 'biweekly', 'monthly', 'first', 'last', 'various'];
  const frequency = allowed.includes(raw.frequency) ? raw.frequency : 'weekly';
  if (various) {
    return { frequency: 'various', day_of_week: null, start_time: null, end_time: null, various_times: true };
  }
  const dow = parseInt(raw.day_of_week, 10);
  if (!Number.isInteger(dow) || dow < 0 || dow > 6) return null;
  const startOk = /^\d{2}:\d{2}$/.test(raw.start_time || '');
  const endOk   = /^\d{2}:\d{2}$/.test(raw.end_time   || '');
  if (!startOk || !endOk) return null;
  return { frequency, day_of_week: dow, start_time: raw.start_time, end_time: raw.end_time, various_times: false };
}
