// api/admin/pledges.js — list pledges for admin view
import { sql } from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rows } = await sql`
      SELECT id, name, email, pledge_time, intention, created_at
      FROM pledges
      ORDER BY pledge_time DESC
      LIMIT 500
    `;
    return res.status(200).json({ pledges: rows });
  } catch (err) {
    console.error('[admin/pledges] error:', err);
    return res.status(500).json({ error: 'Failed to load pledges' });
  }
}
