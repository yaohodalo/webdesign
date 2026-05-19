// api/stats.js — public stats for the stats bar
import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [chapels, pledges, countries] = await Promise.all([
      sql`SELECT COUNT(*)::int AS n FROM chapels WHERE status = 'approved'`,
      sql`SELECT COUNT(*)::int AS n FROM pledges`,
      sql`SELECT COUNT(DISTINCT country)::int AS n FROM chapels WHERE status = 'approved'`,
    ]);

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    return res.status(200).json({
      chapels:   chapels.rows[0].n,
      pledges:   pledges.rows[0].n,
      countries: countries.rows[0].n,
    });
  } catch (err) {
    console.error('[stats] error:', err);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
}
