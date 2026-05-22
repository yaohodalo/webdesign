// api/admin/messages.js — list contact messages for admin view
import { sql } from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rows } = await sql`
      SELECT id, name, email, message, created_at, handled
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 500
    `;
    return res.status(200).json({ messages: rows });
  } catch (err) {
    console.error('[admin/messages] error:', err);
    return res.status(500).json({ error: 'Failed to load messages' });
  }
}
