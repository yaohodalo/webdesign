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
  const name           = str(body.name,    { max: 200 });
  const city           = str(body.city,    { max: 120 });
  const country        = str(body.country, { max: 120 });
  const submitterEmail = body.submitter_email ? email(body.submitter_email) : null;
  const notes          = body.notes ? str(body.notes, { max: 1000 }) : null;

  if (!name || !city || !country) {
    return res.status(400).json({ error: 'Required fields: name, city, country' });
  }

  // ─── Coordinates: either provided directly (from mini-map drag) or geocode the address ───
  const address = body.address ? str(body.address, { max: 500 }) : null;
  let lat = num(body.lat, { min: -90,  max: 90  });
  let lng = num(body.lng, { min: -180, max: 180 });

  if (lat === null || lng === null) {
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

  const perpetual    = bool(body.perpetual);
  const codeRequired = bool(body.code_required);

  // ─── Structured time slots ───
  // Frontend shape per row: { frequency, day_from, day_to, start_time, end_time, various_times }
  // Backend expands day_from→day_to into individual day_of_week rows in the DB.
  const dbRows = [];
  if (Array.isArray(body.adoration_times)) {
    for (const raw of body.adoration_times) {
      const expanded = expandSlot(raw);
      for (const r of expanded) dbRows.push(r);
    }
  }

  try {
    const { rows } = await sql`
      INSERT INTO chapels (name, city, country, address, lat, lng,
                           perpetual, code_required, notes, status, submitter_email)
      VALUES (${name}, ${city}, ${country}, ${address}, ${lat}, ${lng},
              ${perpetual}, ${codeRequired}, ${notes}, 'pending', ${submitterEmail})
      RETURNING id
    `;
    const chapelId = rows[0].id;

    for (const slot of dbRows) {
      await sql`
        INSERT INTO adoration_times (chapel_id, frequency, day_of_week, start_time, end_time, various_times)
        VALUES (${chapelId}, ${slot.frequency}, ${slot.day_of_week},
                ${slot.start_time}, ${slot.end_time}, ${slot.various_times})
      `;
    }

    // Format for email notification — group by time-range so admin sees logical chunks
    const summaryLines = summariseForEmail(dbRows);

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
            ${summaryLines || '(none provided)'}
          </div>
          ${notes ? `
            <h3 style="color:#7a5f1f;margin-top:24px;">Notes</h3>
            <div style="font-family:Georgia,serif;font-style:italic;color:#38312B;">
              ${escapeHtml(notes)}
            </div>` : ''
          }
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

// Expand a single submission row into 1+ DB rows.
// Daily frequency → 7 rows (one per day). Weekly with day_from-day_to → that range.
// Various times → 1 row with flag set, no day.
export function expandSlot(raw) {
  if (!raw || typeof raw !== 'object') return [];

  // "Various times — contact parish" escape hatch
  if (raw.various_times) {
    return [{
      frequency: 'various',
      day_of_week: null,
      start_time: null,
      end_time: null,
      various_times: true,
    }];
  }

  const allowed = ['daily', 'weekly'];
  const frequency = allowed.includes(raw.frequency) ? raw.frequency : 'weekly';

  const startOk = /^\d{2}:\d{2}$/.test(raw.start_time || '');
  const endOk   = /^\d{2}:\d{2}$/.test(raw.end_time   || '');
  if (!startOk || !endOk) return [];

  // Daily: every day 0-6
  if (frequency === 'daily') {
    const out = [];
    for (let d = 0; d <= 6; d++) {
      out.push({
        frequency: 'daily',
        day_of_week: d,
        start_time: raw.start_time,
        end_time: raw.end_time,
        various_times: false,
      });
    }
    return out;
  }

  // Weekly: expand day_from..day_to (inclusive). Support wraparound (e.g. Fri→Mon).
  const from = parseInt(raw.day_from, 10);
  const to   = parseInt(raw.day_to,   10);
  if (!Number.isInteger(from) || from < 0 || from > 6) return [];
  if (!Number.isInteger(to)   || to   < 0 || to   > 6) return [];

  const days = [];
  if (from <= to) {
    for (let d = from; d <= to; d++) days.push(d);
  } else {
    // wraparound (e.g. Fri=5 to Mon=1 → 5,6,0,1)
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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Group consecutive days with identical times into ranges for clean display.
function summariseForEmail(rows) {
  if (!rows.length) return '';
  const various = rows.find(r => r.various_times);
  if (various) return '<div>• Various times — contact parish</div>';

  // Group by (start_time, end_time)
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.start_time}|${r.end_time}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r.day_of_week);
  }

  const lines = [];
  for (const [timeKey, days] of groups) {
    const [start, end] = timeKey.split('|');
    days.sort((a, b) => a - b);
    const range = formatDayRange(days);
    lines.push(`<div>• ${range}: ${start}–${end}</div>`);
  }
  return lines.join('');
}

function formatDayRange(days) {
  if (days.length === 7) return 'Daily';
  // Detect consecutive
  let isConsecutive = true;
  for (let i = 1; i < days.length; i++) {
    if (days[i] !== days[i - 1] + 1) { isConsecutive = false; break; }
  }
  if (isConsecutive && days.length > 1) {
    return `${DAY_NAMES[days[0]]}–${DAY_NAMES[days[days.length - 1]]}`;
  }
  return days.map(d => DAY_NAMES[d]).join(', ');
}

function escapeHtml(s) {
  return String(s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}
