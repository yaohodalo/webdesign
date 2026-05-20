// api/chapels.js — public list of approved chapels
import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { rows } = await sql`
      SELECT id, name, city, country, address, lat, lng, schedule, perpetual
      FROM chapels
      WHERE status = 'approved'
      ORDER BY country, city
    `;
    // Light caching — 60s edge cache, lets stats stay fresh-ish
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ chapels: rows });
  } catch (err) {
    console.error('[chapels] error:', err);
    return res.status(500).json({ error: 'Failed to load chapels' });
  }
}
