// api/admin/moderate.js — approve, reject, or delete a chapel
import { sql } from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, action } = req.body || {};
  const numId = parseInt(id, 10);
  if (!Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({ error: 'Invalid chapel id' });
  }
  if (!['approve', 'reject', 'delete'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    if (action === 'delete') {
      await sql`DELETE FROM chapels WHERE id = ${numId}`;
    } else if (action === 'approve') {
      await sql`UPDATE chapels SET status = 'approved', approved_at = NOW() WHERE id = ${numId}`;
    } else {
      await sql`UPDATE chapels SET status = 'rejected' WHERE id = ${numId}`;
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[admin/moderate] error:', err);
    return res.status(500).json({ error: 'Failed to update chapel' });
  }
}
