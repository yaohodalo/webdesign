// api/admin/chapels.js — admin list with adoration times included
import { sql } from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const status = req.query.status || 'pending';
  if (!['pending', 'approved', 'rejected', 'all'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status filter' });
  }

  try {
    const { rows: chapels } = status === 'all'
      ? await sql`SELECT * FROM chapels ORDER BY created_at DESC`
      : await sql`SELECT * FROM chapels WHERE status = ${status} ORDER BY created_at DESC`;

    // Get all time slots for these chapels
    const ids = chapels.map(c => c.id);
    let times = [];
    if (ids.length) {
      const { rows } = await sql`
        SELECT chapel_id, id, frequency, day_of_week, start_time, end_time, various_times
        FROM adoration_times
        WHERE chapel_id = ANY(${ids})
        ORDER BY chapel_id, day_of_week, start_time
      `;
      times = rows;
    }

    const timesByChapel = new Map();
    for (const t of times) {
      if (!timesByChapel.has(t.chapel_id)) timesByChapel.set(t.chapel_id, []);
      timesByChapel.get(t.chapel_id).push(t);
    }

    const enriched = chapels.map(c => ({
      ...c,
      adoration_times: timesByChapel.get(c.id) || [],
    }));

    return res.status(200).json({ chapels: enriched });
  } catch (err) {
    console.error('[admin/chapels] error:', err);
    return res.status(500).json({ error: 'Failed to load chapels' });
  }
}
