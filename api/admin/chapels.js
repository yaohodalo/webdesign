// api/admin/chapels.js — list chapels for moderation
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
    const { rows } = status === 'all'
      ? await sql`SELECT * FROM chapels ORDER BY created_at DESC`
      : await sql`SELECT * FROM chapels WHERE status = ${status} ORDER BY created_at DESC`;
    return res.status(200).json({ chapels: rows });
  } catch (err) {
    console.error('[admin/chapels] error:', err);
    return res.status(500).json({ error: 'Failed to load chapels' });
  }
}
