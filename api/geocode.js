// api/geocode.js — public geocoding for the Add Chapel mini-map confirmation
// Uses Nominatim under the hood. Caches results for 24 hours via edge cache.
import { geocodeAddress } from '../lib/geocode.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = req.query.q;
  if (!q || typeof q !== 'string' || q.length < 4) {
    return res.status(400).json({ error: 'Query parameter "q" is required (min 4 chars)' });
  }

  try {
    const result = await geocodeAddress(q);
    if (!result) {
      return res.status(404).json({ error: 'No location found for that address' });
    }
    // Edge cache for 24 hours since geocoding the same address rarely changes
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[api/geocode] error:', err);
    return res.status(500).json({ error: 'Geocoding failed' });
  }
}
