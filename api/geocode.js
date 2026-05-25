/* ════════════════════════════════════════════════════════════════════════════
   GEOCODING — Nominatim (OpenStreetMap) wrapper
   ──────────────────────────────────────────────────────────────────────────
   Nominatim's usage policy: 1 req/sec max, must set User-Agent header,
   no heavy commercial use. Fine for moderate chapel submission volume.
   ════════════════════════════════════════════════════════════════════════════ */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'WouldYouJoinMeForOneHour/1.0 (https://wouldyoujoinmeforonehour.org)';

/**
 * Geocode a free-text address.
 * @returns {{lat:number, lng:number, displayName:string} | null}
 */
export async function geocodeAddress(query) {
  if (!query || typeof query !== 'string') return null;
  const trimmed = query.trim();
  if (trimmed.length < 4) return null;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', trimmed);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '0');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      console.warn('[geocode] non-ok status', res.status);
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const hit = data[0];
    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, displayName: hit.display_name || trimmed };
  } catch (err) {
    console.error('[geocode] fetch failed:', err);
    return null;
  }
}
