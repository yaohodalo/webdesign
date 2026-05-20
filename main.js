/* ===================================================
   Would You Join Me for One Hour? — main.js (v3)
   - Chapels loaded from /api/chapels (DB-backed)
   - All markers physical (green)
   - Single EWTN live stream for "Start Adoration"
   - Pledge / contact / chapel forms → /api endpoints
   - Marker clustering for performance
=================================================== */

/* ============ CONFIG ============ */
const CONFIG = {
  // Single, stable live Adoration stream — EWTN's 24/7 Eucharistic Adoration
  // (Swap this anytime if the URL ever moves: edit just this one line.)
  liveAdorationUrl: 'https://www.youtube.com/embed/SDRgXmiWkM0?autoplay=1&rel=0',
  apiBase: '', // same-origin on Vercel
};

/* ============ STATE ============ */
const state = {
  currentLang: 'en',
  map: null,
  chapels: [],
  markersGroup: null,   // clustered group
  allMarkers: [],       // for search
  music: null,
  musicBtn: null,
  hasUserGestured: false,
};

/* ============ TRANSLATIONS ============ */
const translations = {
  en: {
    start: '▶ Start Adoration',
    nearby: '📍 Nearby Chapel',
    pledge: '🕯️ Pledge 1h',
    addChapel: '＋ Add Chapel',
    musicPlay: '🎵 Play Music',
    musicPause: '⏸ Pause Music',
    contact: 'Contact Us',
    send: 'Send Message',
    sending: 'Sending…',
    mission: 'Our Mission',
    missionstatement: 'Helping people worldwide commit to an hour of Eucharistic Adoration and unite in prayer.',
    verses: [
      '"Could you not watch with me one hour?" — Matthew 26:40',
      '"Be still and know that I am God." — Psalm 46:10',
      '"I am the bread of life." — John 6:35',
      '"Remain in me, as I remain in you." — John 15:4',
      '"He who eats my flesh and drinks my blood has eternal life." — John 6:54',
    ],
    msgPledgeOk:    '✓ Your hour has been pledged.',
    msgPledgeErr:   '✗ Could not record pledge. Please try again.',
    msgContactOk:   "✓ Message sent. We'll be in touch soon.",
    msgContactErr:  '✗ Could not send. Please try again later.',
    msgChapelOk:    'Thank you! Your chapel will appear on the map after review.',
    msgChapelErr:   'Could not submit. Please check the coordinates and try again.',
    noResults:      'No results found',
    noNearby:       'No chapels found within 80 km.',
    perpetualLabel: 'Perpetual Adoration (24/7)',
    directions: 'Get Directions',
  },
  es: {
    start: '▶ Comenzar Adoración',
    nearby: '📍 Capilla Cercana',
    pledge: '🕯️ Compromiso 1h',
    addChapel: '＋ Agregar Capilla',
    musicPlay: '🎵 Reproducir música',
    musicPause: '⏸ Pausa Música',
    contact: 'Contáctanos',
    send: 'Enviar',
    sending: 'Enviando…',
    mission: 'Nuestra Misión',
    missionstatement: 'Ayudando a personas en todo el mundo a comprometerse a una hora de Adoración Eucarística y unirse en oración.',
    verses: [
      '"¿No habéis podido velar conmigo una hora?" — Mateo 26:40',
      '"Estad quietos y conoced que yo soy Dios." — Salmo 46:10',
      '"Yo soy el pan de vida." — Juan 6:35',
      '"Permaneced en mí, como yo en vosotros." — Juan 15:4',
    ],
    msgPledgeOk:    '✓ Tu hora ha sido registrada.',
    msgPledgeErr:   '✗ No se pudo registrar. Inténtalo de nuevo.',
    msgContactOk:   '✓ Mensaje enviado. Te contactaremos pronto.',
    msgContactErr:  '✗ No se pudo enviar. Inténtalo más tarde.',
    msgChapelOk:    '¡Gracias! Tu capilla aparecerá en el mapa tras revisión.',
    msgChapelErr:   'No se pudo enviar. Revisa las coordenadas.',
    noResults:      'Sin resultados',
    noNearby:       'No hay capillas en un radio de 80 km.',
    perpetualLabel: 'Adoración Perpetua (24/7)',
    directions: 'Cómo llegar',
  },
  fr: {
    start: "▶ Commencer l'Adoration",
    nearby: '📍 Chapelle Proche',
    pledge: '🕯️ Engagement 1h',
    addChapel: '＋ Ajouter une chapelle',
    musicPlay: '🎵 Jouer la musique',
    musicPause: '⏸ Pause Musique',
    contact: 'Nous contacter',
    send: 'Envoyer',
    sending: 'Envoi…',
    mission: 'Notre Mission',
    missionstatement: "Aider les gens du monde entier à s'engager pour une heure d'Adoration Eucharistique et à s'unir dans la prière.",
    verses: [
      '"N\'avez-vous pas pu veiller une heure avec moi ?" — Matthieu 26:40',
      '"Arrêtez, et sachez que je suis Dieu." — Psaume 46:10',
      '"Je suis le pain de vie." — Jean 6:35',
      '"Demeurez en moi, comme je demeure en vous." — Jean 15:4',
    ],
    msgPledgeOk:    '✓ Votre heure a été enregistrée.',
    msgPledgeErr:   "✗ Échec de l'enregistrement. Réessayez.",
    msgContactOk:   '✓ Message envoyé. À bientôt.',
    msgContactErr:  '✗ Échec. Réessayez plus tard.',
    msgChapelOk:    'Merci ! Votre chapelle apparaîtra après vérification.',
    msgChapelErr:   "Échec. Vérifiez les coordonnées.",
    noResults:      'Aucun résultat',
    noNearby:       'Aucune chapelle dans un rayon de 80 km.',
    perpetualLabel: 'Adoration Perpétuelle (24/7)',
    directions: 'Itinéraire',
  },
  it: {
    start: '▶ Inizia Adorazione',
    nearby: '📍 Cappella Vicina',
    pledge: '🕯️ Impegno 1h',
    addChapel: '＋ Aggiungi Cappella',
    musicPlay: '🎵 Riproduci musica',
    musicPause: '⏸ Metti in Pausa',
    contact: 'Contattaci',
    send: 'Invia',
    sending: 'Invio…',
    mission: 'La Nostra Missione',
    missionstatement: "Aiutare le persone in tutto il mondo a impegnarsi per un'ora di Adorazione Eucaristica e a unirsi nella preghiera.",
    verses: [
      '"Non siete riusciti a vegliare un\'ora con me?" — Matteo 26:40',
      '"Fermatevi e sappiate che io sono Dio." — Salmo 46:10',
      '"Io sono il pane della vita." — Giovanni 6:35',
      '"Rimanete in me e io in voi." — Giovanni 15:4',
    ],
    msgPledgeOk:    '✓ La tua ora è stata registrata.',
    msgPledgeErr:   '✗ Impossibile registrare. Riprova.',
    msgContactOk:   '✓ Messaggio inviato. Ti contatteremo presto.',
    msgContactErr:  '✗ Errore. Riprova più tardi.',
    msgChapelOk:    'Grazie! La cappella apparirà dopo revisione.',
    msgChapelErr:   'Errore. Controlla le coordinate.',
    noResults:      'Nessun risultato',
    noNearby:       'Nessuna cappella entro 80 km.',
    perpetualLabel: 'Adorazione Perpetua (24/7)',
    directions: 'Indicazioni',
  },
  pt: {
    start: '▶ Iniciar Adoração',
    nearby: '📍 Capela Próxima',
    pledge: '🕯️ Compromisso 1h',
    addChapel: '＋ Adicionar Capela',
    musicPlay: '🎵 Tocar música',
    musicPause: '⏸ Pausar Música',
    contact: 'Contacte-nos',
    send: 'Enviar',
    sending: 'A enviar…',
    mission: 'A Nossa Missão',
    missionstatement: 'Ajudar as pessoas de todo o mundo a comprometerem-se com uma hora de Adoração Eucarística e a unirem-se em oração.',
    verses: [
      '"Não pudestes vigiar uma hora comigo?" — Mateus 26:40',
      '"Aquietai-vos e sabei que eu sou Deus." — Salmo 46:10',
      '"Eu sou o pão da vida." — João 6:35',
      '"Permanecei em mim, e eu permanecerei em vós." — João 15:4',
    ],
    msgPledgeOk:    '✓ A sua hora foi registada.',
    msgPledgeErr:   '✗ Não foi possível registar. Tente novamente.',
    msgContactOk:   '✓ Mensagem enviada.',
    msgContactErr:  '✗ Erro ao enviar. Tente mais tarde.',
    msgChapelOk:    'Obrigado! A capela aparecerá após revisão.',
    msgChapelErr:   'Erro. Verifique as coordenadas.',
    noResults:      'Sem resultados',
    noNearby:       'Nenhuma capela num raio de 80 km.',
    perpetualLabel: 'Adoração Perpétua (24/7)',
    directions: 'Como chegar',
  },
};

const t = () => translations[state.currentLang] || translations.en;
const $ = id => document.getElementById(id);

/* ============ LANGUAGE ============ */
function setLanguage(lang) {
  state.currentLang = lang;
  const tr = t();
  const set = (id, text) => { const el = $(id); if (el) el.innerText = text; };

  set('startAdoration', tr.start);
  set('findChapel', tr.nearby);
  set('pledgeButton', tr.pledge);
  set('addChapelBtn', tr.addChapel);
  set('contactBtn', tr.contact);
  set('mission', tr.mission);
  set('missionstatement', tr.missionstatement);
  set('missionstatement-footer', tr.missionstatement);

  const sendBtn = document.querySelector("#contactForm button[type='submit']");
  if (sendBtn) sendBtn.innerText = tr.send;

  const verseEl = document.querySelector('.verse-track');
  if (verseEl) {
    verseEl.innerHTML = [...tr.verses, ...tr.verses]
      .join(' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ');
  }

  updateMusicButton();
}

/* ============ MUSIC ============ */
function updateMusicButton() {
  if (!state.music || !state.musicBtn) return;
  state.musicBtn.innerText = state.music.paused ? t().musicPlay : t().musicPause;
}

function stopMusic() {
  if (state.music && !state.music.paused) {
    state.music.pause();
    updateMusicButton();
  }
}

/* ============ API ============ */
async function api(path, opts = {}) {
  const res = await fetch(CONFIG.apiBase + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ============ MAP ============ */
const physicalIcon = () => L.divIcon({
  className: 'custom-marker physical',
  html: '<div class="marker-circle physical-circle"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function chapelPopupHtml(c) {
  const tr = t();
  const loc = [c.city, c.country].filter(Boolean).join(', ');
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
  return `
    <div class="popup-card">
      <strong>⛪ ${escapeHtml(c.name)}</strong>
      <div class="popup-loc">📍 ${escapeHtml(c.address || loc)}</div>
      ${c.perpetual ? `<div class="popup-perpetual">🕯️ ${tr.perpetualLabel}</div>` : ''}
      ${c.schedule ? `<div class="popup-schedule">${escapeHtml(c.schedule)}</div>` : ''}
      <a class="popup-directions" href="${directionsUrl}" target="_blank" rel="noopener">
        🧭 ${tr.directions}
      </a>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s || '').replace(/[<>&"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;',
  }[c]));
}

function addChapelMarker(c) {
  if (!Number.isFinite(+c.lat) || !Number.isFinite(+c.lng)) return null;
  const marker = L.marker([+c.lat, +c.lng], { icon: physicalIcon() });
  marker.chapelData = c;
  marker.bindPopup(chapelPopupHtml(c));
  state.markersGroup.addLayer(marker);
  state.allMarkers.push(marker);
  return marker;
}

function buildLegend() {
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div class="legend-title">CHAPELS</div>
      <div class="legend-row"><span class="legend-dot legend-physical"></span>Adoration Chapel</div>
    `;
    return div;
  };
  return legend;
}

async function initMap() {
  state.map = L.map('map', { maxZoom: 18, minZoom: 2 }).setView([20, 0], 2);
  state.map.scrollWheelZoom.disable();

  // Marker clustering (handles 1 → 10,000 markers gracefully)
  state.markersGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 50,
  });
  state.map.addLayer(state.markersGroup);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  }).addTo(state.map);

  state.map.on('click zoomstart dragstart', stopMusic);
  buildLegend().addTo(state.map);

  for (const c of state.chapels) addChapelMarker(c);

  initSearch();
}

/* ============ DATA LOAD ============ */
async function loadChapels() {
  try {
    const data = await api('/api/chapels');
    state.chapels = Array.isArray(data?.chapels) ? data.chapels : [];
  } catch (e) {
    console.warn('[chapels] load failed, falling back to empty list:', e);
    state.chapels = [];
  }
}

async function loadStats() {
  try {
    const s = await api('/api/stats');
    animateCount('statChapels', s.chapels || 0);
    animateCount('statCountries', s.countries || 0);
    animateCount('statPledged', s.pledges || 0);
  } catch (e) {
    console.warn('[stats] load failed:', e);
    // Fall back to client-side count from already-loaded chapels
    const cs = new Set(state.chapels.map(c => c.country).filter(Boolean));
    animateCount('statChapels', state.chapels.length);
    animateCount('statCountries', cs.size);
    animateCount('statPledged', 0);
  }
}

function animateCount(id, target) {
  const el = $(id);
  if (!el) return;
  let start = 0;
  const duration = 1200;
  const step = Math.max(target / (duration / 16), 1);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString();
    if (start >= target) clearInterval(timer);
  }, 16);
}

/* ============ SEARCH ============ */
function initSearch() {
  const input = $('searchInput');
  const box = $('suggestions');
  if (!input || !box) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    box.innerHTML = '';
    if (!q) return;

    const results = state.allMarkers
      .map(m => {
        const d = m.chapelData || {};
        return {
          marker: m,
          name: d.name || '',
          sub: [d.city, d.country].filter(Boolean).join(', '),
          searchText: `${d.name || ''} ${d.city || ''} ${d.country || ''} ${d.address || ''}`.toLowerCase(),
        };
      })
      .filter(item => item.searchText.includes(q))
      .slice(0, 10);

    if (!results.length) {
      box.innerHTML = `<div class="suggestion-item" style="color:#999;">${t().noResults}</div>`;
      return;
    }

    box.innerHTML = results.map((r, i) => `
      <div class="suggestion-item" data-idx="${i}" role="option">
        ⛪ <strong>${escapeHtml(r.name)}</strong>
        ${r.sub ? `<span style="color:#999;font-size:0.85em;"> — ${escapeHtml(r.sub)}</span>` : ''}
      </div>
    `).join('');

    box.querySelectorAll('.suggestion-item').forEach((el, i) => {
      el.addEventListener('click', () => {
        const match = results[i]?.marker;
        if (!match) return;
        input.value = results[i].name;
        box.innerHTML = '';
        const { lat, lng } = match.getLatLng();
        state.map.setView([lat, lng], 13);
        match.openPopup();
      });
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#searchWrapper')) box.innerHTML = '';
  });
}

/* ============ PLAYER ============ */
function openLiveAdoration() {
  // Smooth-scroll to the embedded section instead of opening modal
  const section = $('liveAdoration');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Lazy-load the YouTube embed only when the user scrolls near it
function initLiveAdorationEmbed() {
  const frame = $('liveVideoFrame');
  if (!frame) return;

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    // muted=1 is required for autoplay; user can unmute via player controls
    // Note: we strip ?autoplay=1 from the config URL and rebuild with mute=1
    const url = new URL(CONFIG.liveAdorationUrl);
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('mute', '1');
    url.searchParams.set('rel', '0');
    frame.innerHTML = `
      <iframe
        src="${url.toString()}"
        title="Live Eucharistic Adoration — EWTN"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        loading="lazy"></iframe>
    `;
    stopMusic();
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          load();
          io.disconnect();
        }
      }
    }, { rootMargin: '200px' });
    io.observe(frame);
  } else {
    // Fallback: load after a short delay
    setTimeout(load, 1500);
  }
}

function closeLiveAdoration() {
  // Kept for backward compatibility — the modal still exists
  const modal = $('videoModal');
  const f = $('adorationFrame');
  if (modal) modal.style.display = 'none';
  if (f) f.src = '';
}

/* ============ NEARBY ============ */
function focusMarker(marker) {
  const { lat, lng } = marker.getLatLng();
  state.map.setView([lat, lng], 13);
  // Wait a tick for cluster spiderfy
  setTimeout(() => marker.openPopup(), 200);
}

// Add or move a "You are here" marker
let userLocationMarker = null;
function showUserLocation(lat, lng) {
  if (userLocationMarker) state.map.removeLayer(userLocationMarker);
  const icon = L.divIcon({
    className: 'user-location-marker',
    html: '<div class="user-pulse"></div><div class="user-dot"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  userLocationMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(state.map);
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  if (meters < 100000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters / 1000).toLocaleString()} km`;
}

function initNearby() {
  $('findChapel')?.addEventListener('click', () => {
    const panel = $('nearbyPanel');
    const list = $('nearbyList');

    if (!navigator.geolocation) {
      panel.classList.remove('hidden');
      list.innerHTML = `<div class="nearby-empty">Geolocation is not supported by your browser.</div>`;
      panel.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Show loading state immediately
    panel.classList.remove('hidden');
    list.innerHTML = `<div class="nearby-empty">📍 Finding your location…</div>`;
    panel.scrollIntoView({ behavior: 'smooth' });

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        showUserLocation(lat, lng);

        if (!state.allMarkers.length) {
          list.innerHTML = `<div class="nearby-empty">No chapels are on the map yet.</div>`;
          return;
        }

        // Compute distance to every chapel, sort, take top 5 — no distance cap
        const sorted = state.allMarkers
          .map(m => {
            const ll = m.getLatLng();
            const dist = state.map.distance([lat, lng], [ll.lat, ll.lng]);
            return { m, dist, data: m.chapelData || {} };
          })
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 5);

        const nearest = sorted[0];
        const isClose = nearest.dist < 80000; // 80 km

        // Frame the map: if nearest is close, fit both; otherwise just center on user
        if (isClose) {
          const userLL = L.latLng(lat, lng);
          const nearestLL = nearest.m.getLatLng();
          state.map.fitBounds(L.latLngBounds(userLL, nearestLL).pad(0.4), { maxZoom: 12 });
        } else {
          state.map.setView([lat, lng], 4);
        }

        // Build the list — header explains the result
        const header = isClose
          ? `<div class="nearby-header">📍 Showing the ${sorted.length} closest chapels to you</div>`
          : `<div class="nearby-header">📍 The nearest chapel is ${formatDistance(nearest.dist)} away. Showing the ${sorted.length} closest:</div>`;

        list.innerHTML = header;
        sorted.forEach(({ m, dist, data }) => {
          const item = document.createElement('div');
          item.className = 'nearby-item';
          const loc = [data.city, data.country].filter(Boolean).join(', ');
          item.innerHTML = `
            <div class="nearby-name">⛪ <strong>${escapeHtml(data.name || 'Chapel')}</strong></div>
            ${loc ? `<div class="nearby-loc">${escapeHtml(loc)}</div>` : ''}
            <div class="nearby-dist">${formatDistance(dist)} away${data.perpetual ? ' · 24/7' : ''}</div>
          `;
          item.addEventListener('click', () => focusMarker(m));
          list.appendChild(item);
        });
      },
      err => {
        const messages = {
          1: 'Location access was denied. Please enable location in your browser settings and try again.',
          2: 'Your location could not be determined. Please check your internet connection.',
          3: 'Location request timed out. Please try again.',
        };
        list.innerHTML = `<div class="nearby-empty">${messages[err.code] || 'Could not get your location.'}</div>`;
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
}

/* ============ FORM HANDLERS ============ */
function showStatus(el, kind, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = kind === 'ok' ? '#a8d8a8' : kind === 'err' ? '#f08080' : '';
  el.hidden = !msg;
}

function initPledgeForm() {
  $('pledgeButton')?.addEventListener('click', () => {
    const section = $('pledge');
    section.classList.remove('hidden');
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
  });

  $('pledgeForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('pledgeError');
    const data = Object.fromEntries(new FormData(e.target));

    try {
      await api('/api/pledge', { method: 'POST', body: JSON.stringify(data) });
      e.target.style.display = 'none';
      $('thanks').classList.remove('hidden');
      // Refresh stats so the pledge count ticks up
      loadStats();
    } catch (ex) {
      showStatus(err, 'err', t().msgPledgeErr);
    }
  });
}

function initContactForm() {
  $('contactBtn')?.addEventListener('click', e => {
    e.preventDefault();
    $('contactSection').scrollIntoView({ behavior: 'smooth' });
  });

  $('contactForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const msg = $('contactMsg');
    const btn = $('contactSubmitBtn');
    const originalLabel = t().send;

    btn.disabled = true;
    btn.innerText = t().sending;
    showStatus(msg, null, '');

    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(data) });
      showStatus(msg, 'ok', t().msgContactOk);
      e.target.reset();
    } catch (ex) {
      showStatus(msg, 'err', t().msgContactErr);
    } finally {
      btn.disabled = false;
      btn.innerText = originalLabel;
    }
  });
}

function initAddChapelForm() {
  const addBtn = $('addChapelBtn');
  const modal = $('addChapelModal');
  const closeBtn = $('closeAddChapel');
  const footerAdd = $('footerAddChapel');

  const open = () => { modal.style.display = 'flex'; };
  const close = () => { modal.style.display = 'none'; };

  addBtn?.addEventListener('click', open);
  footerAdd?.addEventListener('click', e => { e.preventDefault(); open(); });
  closeBtn?.addEventListener('click', close);

  $('chapelForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('chapelError');
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get('name'),
      city: fd.get('city'),
      country: fd.get('country'),
      address: fd.get('address') || null,
      schedule: fd.get('schedule') || null,
      submitter_email: fd.get('submitter_email') || null,
      lat: parseFloat(fd.get('lat')),
      lng: parseFloat(fd.get('lng')),
      perpetual: fd.get('perpetual') === 'yes',
    };

    if (!payload.name || !payload.city || !payload.country ||
        !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
      showStatus(err, 'err', 'Please fill all required fields and valid coordinates.');
      return;
    }

    try {
      await api('/api/chapel', { method: 'POST', body: JSON.stringify(payload) });
      close();
      e.target.reset();
      alert(t().msgChapelOk);
    } catch (ex) {
      showStatus(err, 'err', t().msgChapelErr);
    }
  });

  // Close on backdrop click
  window.addEventListener('click', e => {
    if (e.target === modal) close();
  });
}

/* ============ SHARE ============ */
function initShare() {
  $('shareBtn')?.addEventListener('click', async () => {
    const data = {
      title: 'Would You Join Me for One Hour?',
      text: 'Find Eucharistic Adoration chapels near you and unite with adorers worldwide.',
      url: 'https://wouldyoujoinmeforonehour.org',
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(data.url);
        alert('Link copied to clipboard!');
      } catch {
        prompt('Copy this link:', data.url);
      }
    }
  });
}

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', async () => {
  // Music
  state.music = $('bgMusic');
  state.musicBtn = $('musicToggle');

  if (state.music) {
    state.music.volume = 0.35;
    state.music.addEventListener('error', () => {
      console.warn('[music] Audio file failed to load. Check that "204-stay with me.mp3" exists at the site root.');
    });
  }

  state.musicBtn?.addEventListener('click', e => {
    e.stopPropagation();
    if (!state.music) return;
    if (state.music.paused) {
      state.music.play()
        .then(() => updateMusicButton())
        .catch(err => {
          console.error('[music] play failed:', err);
          alert('Could not start music. The audio file may be missing — check that "204-stay with me.mp3" is uploaded.');
        });
    } else {
      state.music.pause();
      updateMusicButton();
    }
  });

  // Language
  setLanguage('en');
  $('languageSelect')?.addEventListener('change', e => setLanguage(e.target.value));

  // Start Adoration → single EWTN stream
  $('startAdoration')?.addEventListener('click', openLiveAdoration);
  $('closeModal')?.addEventListener('click', closeLiveAdoration);
  window.addEventListener('click', e => {
    if (e.target === $('videoModal')) closeLiveAdoration();
  });

  // Forms
  initPledgeForm();
  initContactForm();
  initAddChapelForm();
  initShare();

  // Live Adoration embed (lazy-loaded when scrolled into view)
  initLiveAdorationEmbed();

  // Load data, then build map and stats in parallel
  await loadChapels();
  await initMap();
  initNearby();
  loadStats();
});
