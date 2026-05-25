// api/chapel.js — submit a new chapel with structured adoration times
import { sql } from '../lib/db.js';
import { notify, row } from '../lib/email.js';
import { str, email, num, bool } from '../lib/validate.js';
import { geocodeAddress } from '../lib/geocode.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // ─── Validate required text fields ───
  const name        = str(body.name,    { max: 200 });
  const city        = str(body.city,    { max: 120 });
  const country     = str(body.country, { max: 120 });
  const submitterEmail = body.submitter_email ? email(body.submitter_email) : null;

  if (!name || !city || !country) {
    return res.status(400).json({ error: 'Required fields: name, city, country' });
  }

  // ─── Coordinates: either provided directly (from mini-map drag) or geocode the address ───
  const address = body.address ? str(body.address, { max: 500 }) : null;
  let lat = num(body.lat, { min: -90,  max: 90  });
  let lng = num(body.lng, { min: -180, max: 180 });

  if (lat === null || lng === null) {
    // No coords provided; try to geocode the address (or fall back to "name, city, country")
    const query = address || `${name}, ${city}, ${country}`;
    const geocoded = await geocodeAddress(query);
    if (!geocoded) {
      return res.status(400).json({
        error: 'Could not find that location on the map. Please check the address or try a more specific one.',
      });
    }
    lat = geocoded.lat;
    lng = geocoded.lng;
  }

  // ─── Flags ───
  const perpetual    = bool(body.perpetual);
  const codeRequired = bool(body.code_required);

  // ─── Structured time slots ───
  // Expected shape: [{ frequency, day_of_week, start_time, end_time, various_times }, ...]
  let timeSlots = [];
  if (Array.isArray(body.adoration_times)) {
    timeSlots = body.adoration_times
      .map(slot => sanitizeSlot(slot))
      .filter(Boolean);
  }

  try {
    // Insert chapel
    const { rows } = await sql`
      INSERT INTO chapels (name, city, country, address, lat, lng,
                           perpetual, code_required, status, submitter_email)
      VALUES (${name}, ${city}, ${country}, ${address}, ${lat}, ${lng},
              ${perpetual}, ${codeRequired}, 'pending', ${submitterEmail})
      RETURNING id
    `;
    const chapelId = rows[0].id;

    // Insert time slots
    for (const slot of timeSlots) {
      await sql`
        INSERT INTO adoration_times (chapel_id, frequency, day_of_week, start_time, end_time, various_times)
        VALUES (${chapelId}, ${slot.frequency}, ${slot.day_of_week},
                ${slot.start_time}, ${slot.end_time}, ${slot.various_times})
      `;
    }

    // Notify admin
    const slotsLines = timeSlots.length
      ? timeSlots.map(formatSlotForEmail).join('<br/>')
      : '(none provided)';

    notify({
      subject: `🛐 New chapel submitted: ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;">
          <h2 style="color:#7a5f1f;border-bottom:2px solid #b8923a;padding-bottom:8px;">New Chapel Submission</h2>
          <table style="border-collapse:collapse;width:100%;">
            ${row('Name', name)}
            ${row('Location', `${city}, ${country}`)}
            ${row('Address', address || '(none)')}
            ${row('Coordinates', `${lat}, ${lng}`)}
            ${row('Perpetual (24/7)', perpetual ? 'Yes' : 'No')}
            ${row('Code Required', codeRequired ? 'Yes — visitors must contact parish' : 'No')}
            ${row('Submitter', submitterEmail || '(not provided)')}
          </table>
          <h3 style="color:#7a5f1f;margin-top:24px;">Adoration Times</h3>
          <div style="font-family:Georgia,serif;line-height:1.7;color:#38312B;">
            ${slotsLines}
          </div>
          <p style="margin-top:20px;">
            <a href="https://wouldyoujoinmeforonehour.org/admin.html"
               style="color:#7a5f1f;font-weight:600;">Review in Admin →</a>
          </p>
        </div>
      `,
    }).catch(e => console.error('[chapel] notify failed:', e));

    return res.status(201).json({ ok: true, id: chapelId, lat, lng });
  } catch (err) {
    console.error('[chapel] error:', err);
    return res.status(500).json({ error: 'Failed to save chapel' });
  }
}

// ─── Helpers ───
function sanitizeSlot(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const various = !!raw.various_times;
  const allowed = ['weekly', 'biweekly', 'monthly', 'first', 'last', 'various'];
  const frequency = allowed.includes(raw.frequency) ? raw.frequency : 'weekly';

  if (various) {
    return {
      frequency: 'various',
      day_of_week: null,
      start_time: null,
      end_time: null,
      various_times: true,
    };
  }

  const dow = parseInt(raw.day_of_week, 10);
  if (!Number.isInteger(dow) || dow < 0 || dow > 6) return null;

  // Times stored as 'HH:MM' strings (e.g. '07:00', '19:30')
  const startOk = /^\d{2}:\d{2}$/.test(raw.start_time || '');
  const endOk   = /^\d{2}:\d{2}$/.test(raw.end_time   || '');
  if (!startOk || !endOk) return null;

  return {
    frequency,
    day_of_week: dow,
    start_time: raw.start_time,
    end_time: raw.end_time,
    various_times: false,
  };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function formatSlotForEmail(slot) {
  if (slot.various_times) return `• Various times — contact parish`;
  const day = DAY_NAMES[slot.day_of_week] || '?';
  const freq = slot.frequency !== 'weekly' ? ` (${slot.frequency})` : '';
  return `• ${day} ${slot.start_time}–${slot.end_time}${freq}`;
}
