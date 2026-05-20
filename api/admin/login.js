// api/admin/login.js — validate password
// For MVP, the password IS the bearer token (no JWT yet).
// Frontend stores it in sessionStorage after successful login.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD env var not configured' });
  }
  const { password } = req.body || {};
  if (typeof password !== 'string' || password !== expected) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  return res.status(200).json({ ok: true });
}
