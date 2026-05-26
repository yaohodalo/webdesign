// api/chapels.js — public list of approved chapels with their structured adoration times
import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { rows: chapels } = await sql`
      SELECT id, name, city, country, address, lat, lng, schedule, perpetual, code_required, notes
      FROM chapels
      WHERE status = 'approved'
      ORDER BY country, city
    `;

    // Fetch all adoration times for approved chapels in one query
    const { rows: times } = await sql`
      SELECT chapel_id, frequency, day_of_week, start_time, end_time, various_times
      FROM adoration_times
      WHERE chapel_id IN (
        SELECT id FROM chapels WHERE status = 'approved'
      )
      ORDER BY chapel_id, day_of_week, start_time
    `;

    // Group times by chapel_id
    const timesByChapel = new Map();
    for (const t of times) {
      if (!timesByChapel.has(t.chapel_id)) timesByChapel.set(t.chapel_id, []);
      timesByChapel.get(t.chapel_id).push({
        frequency: t.frequency,
        day_of_week: t.day_of_week,
        start_time: t.start_time,
        end_time: t.end_time,
        various_times: t.various_times,
      });
    }

    // Attach times array to each chapel
    const enriched = chapels.map(c => ({
      ...c,
      adoration_times: timesByChapel.get(c.id) || [],
    }));

    // Light caching at the edge
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ chapels: enriched });
  } catch (err) {
    console.error('[chapels] error:', err);
    return res.status(500).json({ error: 'Failed to load chapels' });
  }
}
