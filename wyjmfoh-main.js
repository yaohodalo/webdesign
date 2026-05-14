/* ================================================
   Would You Join Me for One Hour? — main.js (v2)
   Updates: stats bar, share, better pledge,
   contact form fix, improved search, live counter
================================================ */

/* ================= STATE ================= */
const state = {
  currentLang: "en",
  map: null,
  chapelData: [],
  physicalChapels: [],
  allMarkers: [],
  virtualMarkersGroup: null,
  physicalMarkersGroup: null,
  music: null,
  musicBtn: null,
  pledgeCount: 0,
};

/* ================= TRANSLATIONS ================= */
const translations = {
  en: {
    start: "▶ Start Adoration",
    nearby: "📍 Nearby Chapel",
    pledge: "🕯️ Pledge 1h",
    addChapel: "＋ Add Chapel",
    musicPlay: "🎵 Play Music",
    musicPause: "⏸ Pause Music",
    contact: "Contact Us",
    send: "Send Message",
    mission: "Our Mission",
    missionstatement: "Helping people worldwide commit to an hour of Eucharistic Adoration and unite in prayer.",
    verses: [
      '"Could you not watch with me one hour?" — Matthew 26:40',
      '"Be still and know that I am God." — Psalm 46:10',
      '"I am the bread of life." — John 6:35',
      '"Remain in me, as I remain in you." — John 15:4',
      '"He who eats my flesh and drinks my blood has eternal life." — John 6:54',
    ]
  },
  es: {
    start: "▶ Comenzar Adoración",
    nearby: "📍 Capilla Cercana",
    pledge: "🕯️ Compromiso 1h",
    addChapel: "＋ Agregar Capilla",
    musicPlay: "🎵 Reproducir música",
    musicPause: "⏸ Pausa Música",
    contact: "Contáctanos",
    send: "Enviar",
    mission: "Nuestra Misión",
    missionstatement: "Ayudando a personas en todo el mundo a comprometerse a una hora de Adoración Eucarística y unirse en oración.",
    verses: [
      '"¿No habéis podido velar conmigo una hora?" — Mateo 26:40',
      '"Estad quietos y conoced que yo soy Dios." — Salmo 46:10',
      '"Yo soy el pan de vida." — Juan 6:35',
      '"Permaneced en mí, como yo en vosotros." — Juan 15:4',
    ]
  },
  fr: {
    start: "▶ Commencer l'Adoration",
    nearby: "📍 Chapelle Proche",
    pledge: "🕯️ Engagement 1h",
    addChapel: "＋ Ajouter une chapelle",
    musicPlay: "🎵 Jouer la musique",
    musicPause: "⏸ Pause Musique",
    contact: "Nous contacter",
    send: "Envoyer",
    mission: "Notre Mission",
    missionstatement: "Aider les gens du monde entier à s'engager pour une heure d'Adoration Eucharistique et à s'unir dans la prière.",
    verses: [
      '"N\'avez-vous pas pu veiller une heure avec moi ?" — Matthieu 26:40',
      '"Arrêtez, et sachez que je suis Dieu." — Psaume 46:10',
      '"Je suis le pain de vie." — Jean 6:35',
      '"Demeurez en moi, comme je demeure en vous." — Jean 15:4',
    ]
  },
  it: {
    start: "▶ Inizia Adorazione",
    nearby: "📍 Cappella Vicina",
    pledge: "🕯️ Impegno 1h",
    addChapel: "＋ Aggiungi Cappella",
    musicPlay: "🎵 Riproduci musica",
    musicPause: "⏸ Metti in Pausa",
    contact: "Contattaci",
    send: "Invia",
    mission: "La Nostra Missione",
    missionstatement: "Aiutare le persone in tutto il mondo a impegnarsi per un'ora di Adorazione Eucaristica e a unirsi nella preghiera.",
    verses: [
      '"Non siete riusciti a vegliare un\'ora con me?" — Matteo 26:40',
      '"Fermatevi e sappiate che io sono Dio." — Salmo 46:10',
      '"Io sono il pane della vita." — Giovanni 6:35',
      '"Rimanete in me e io in voi." — Giovanni 15:4',
    ]
  },
  pt: {
    start: "▶ Iniciar Adoração",
    nearby: "📍 Capela Próxima",
    pledge: "🕯️ Compromisso 1h",
    addChapel: "＋ Adicionar Capela",
    musicPlay: "🎵 Tocar música",
    musicPause: "⏸ Pausar Música",
    contact: "Contacte-nos",
    send: "Enviar",
    mission: "A Nossa Missão",
    missionstatement: "Ajudar as pessoas de todo o mundo a comprometerem-se com uma hora de Adoração Eucarística e a unirem-se em oração.",
    verses: [
      '"Não pudestes vigiar uma hora comigo?" — Mateus 26:40',
      '"Aquietai-vos e sabei que eu sou Deus." — Salmo 46:10',
      '"Eu sou o pão da vida." — João 6:35',
      '"Permanecei em mim, e eu permanecerei em vós." — João 15:4',
    ]
  }
};

/* ================= FEATURED CHAPELS ================= */
const featuredChapels = [
  { name: "Sisters of Divine Mercy", city: "Calgary", country: "Canada", lat: 51.088191, lng: -114.196839, stream: "https://www.youtube.com/watch?v=1OR9c5YtRco" },
  { name: "Shalom World", city: "Edinburg TX", country: "USA", lat: 27.211164, lng: -98.126185, stream: "https://www.youtube.com/watch?v=GlGkFWPKomU" },
  { name: "EWTN Chapel", city: "Irondale AL", country: "USA", lat: 33.533602, lng: -86.675057, stream: "https://www.youtube.com/watch?v=l30JmRRGQQI" },
  { name: "St Benedicts Burwood", city: "Victoria", country: "Australia", lat: -37.848311, lng: 145.096218, stream: "https://www.youtube.com/watch?v=qz8YE61BoXM" },
  { name: "Monastery of the Immaculate Conception", city: "Paprotnia", country: "Poland", lat: 52.202124, lng: 20.419678, stream: "https://www.youtube.com/watch?v=bIR18Pvy11U" },
  { name: "Tyburn Convent", city: "London", country: "UK", lat: 51.512721, lng: -0.166909, stream: "https://www.youtube.com/watch?v=YbxI_Vd97H4" },
  { name: "Maria Vision", city: "Rome", country: "Italy", lat: 44.349347, lng: 13.014269, stream: "https://1601580044.rsc.cdn77.org/live/_jcn_/amlst:Mariavision/master.m3u8" },
  { name: "Cathedral of the Good Shepherd", city: "Singapore", country: "Singapore", lat: 1.296718, lng: 103.850904, stream: "https://www.youtube.com/watch?v=g8sUK4RNIEg" },
  { name: "Ermita de Nuestra Señora de Bienvenida", city: "Toledo", country: "Spain", lat: 39.819158, lng: -5.163416, stream: "https://www.youtube.com/watch?v=YTWA-eUZzJQ" },
  { name: "St Mary Mother of God Church", city: "Middletown NJ", country: "USA", lat: 40.413438, lng: -74.103321, stream: "https://www.youtube.com/watch?v=TIu6DyLTWLQ" },
];

/* ================= LANGUAGE ================= */
function setLanguage(lang) {
  state.currentLang = lang;
  const t = translations[lang] || translations.en;

  const set = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };

  set("startAdoration", t.start);
  set("findChapel", t.nearby);
  set("pledgeButton", t.pledge);
  set("addChapelBtn", t.addChapel);
  set("contactBtn", t.contact);
  set("mission", t.mission);
  set("missionstatement", t.missionstatement);
  set("missionstatement-footer", t.missionstatement);

  const sendBtn = document.querySelector("#contactForm button[type='submit']");
  if (sendBtn) sendBtn.innerText = t.send;

  const verseEl = document.querySelector(".verse-track");
  if (verseEl) verseEl.innerHTML = [...t.verses, ...t.verses].join(" &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ");

  updateMusicButton();
}

/* ================= MUSIC ================= */
function updateMusicButton() {
  if (!state.music || !state.musicBtn) return;
  const t = translations[state.currentLang] || translations.en;
  state.musicBtn.innerText = state.music.paused ? t.musicPlay : t.musicPause;
}

function stopMusic() {
  if (state.music && !state.music.paused) {
    state.music.pause();
    updateMusicButton();
  }
}

function fadeOutMusic() {
  if (!state.music || state.music.paused) return;
  let vol = state.music.volume;
  const fade = setInterval(() => {
    if (vol > 0.05) {
      vol = Math.max(0, vol - 0.05);
      state.music.volume = vol;
    } else {
      clearInterval(fade);
      state.music.pause();
      state.music.volume = 0.35;
      updateMusicButton();
    }
  }, 120);
}

/* ================= STATS BAR ================= */
function updateStats() {
  const chapelCount = featuredChapels.length + state.chapelData.length + state.physicalChapels.length;
  const countries = new Set([
    ...featuredChapels.map(c => c.country),
    ...state.chapelData.map(c => c.country).filter(Boolean),
    ...state.physicalChapels.map(c => c.country).filter(Boolean),
  ]).size;

  animateCount("statChapels", chapelCount);
  animateCount("statCountries", countries);
  animateCount("statPledged", state.pledgeCount + 2847); // seeded base
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const duration = 1200;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString();
    if (start >= target) clearInterval(timer);
  }, 16);
}

/* ================= SHARE ================= */
window.shareApp = function () {
  const data = {
    title: "Would You Join Me for One Hour?",
    text: "Find Eucharistic Adoration chapels near you and unite with adorers worldwide.",
    url: "https://wouldyoujoinmeforonehour.org"
  };
  if (navigator.share) {
    navigator.share(data).catch(() => {});
  } else {
    navigator.clipboard.writeText(data.url).then(() => {
      alert("Link copied to clipboard!");
    }).catch(() => {
      prompt("Copy this link:", data.url);
    });
  }
};

/* ================= MAP ICONS ================= */
const goldIcon = L.divIcon({
  className: "custom-marker gold",
  html: `<div class="marker-circle gold-circle"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const physicalIcon = L.divIcon({
  className: "custom-marker physical",
  html: `<div class="marker-circle physical-circle"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

async function checkStreamLive(url) {
  return true; // treat all as live — real check needs server-side
}

async function addMarker(lat, lng, data, html) {
  let icon, group;

  if (data.type === "physical") {
    icon = physicalIcon;
    group = state.physicalMarkersGroup;
  } else if (data.type === "virtual") {
    const url = data.stream || data.youtube;
    if (!url) return;
    icon = goldIcon;
    group = state.virtualMarkersGroup;
    if (icon === goldIcon) {
      // Add flashing on add
    }
  } else {
    return;
  }

  const marker = L.marker([lat, lng], { icon });
  marker.streamUrl = data.stream || data.youtube;
  marker.chapelData = data;
  marker.bindPopup(html);
  group.addLayer(marker);
  state.allMarkers.push(marker);
}

/* ================= MAP INIT ================= */
async function initMap() {
  state.map = L.map("map", { maxZoom: 18, minZoom: 2 }).setView([20, 0], 2);
  state.map.scrollWheelZoom.disable();

  state.virtualMarkersGroup  = L.layerGroup().addTo(state.map);
  state.physicalMarkersGroup = L.layerGroup().addTo(state.map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  }).addTo(state.map);

  state.map.on("click zoomstart dragstart", stopMusic);

  // Legend
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "map-legend");
    div.style.cssText = "background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);font-size:12px;line-height:1.8;";
    div.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.1em;color:#0B1F3A;margin-bottom:6px;">LEGEND</div>
      <div><span style="display:inline-block;width:12px;height:12px;background:gold;border-radius:50%;margin-right:6px;vertical-align:middle;"></span>Live Stream</div>
      <div><span style="display:inline-block;width:12px;height:12px;background:#2d7d46;border-radius:50%;margin-right:6px;vertical-align:middle;"></span>Physical Chapel</div>
    `;
    return div;
  };
  legend.addTo(state.map);

  // Featured virtual chapels
  for (const c of featuredChapels) {
    await addMarker(c.lat, c.lng, { ...c, type: "virtual" }, `
      <div style="font-family:serif;min-width:180px;">
        <strong style="font-size:15px;">🕯️ ${c.name}</strong>
        <div style="color:#666;font-size:13px;margin:4px 0;">${c.city}, ${c.country}</div>
        <button onclick="playChapel('${c.stream}')"
          style="margin-top:8px;background:#D4AF37;color:#0B1F3A;border:none;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:13px;font-weight:bold;">
          ▶ Watch Live Adoration
        </button>
      </div>
    `);
  }

  // CSV virtual chapels
  for (const c of state.chapelData) {
    const lat = parseFloat(c.latitude);
    const lng = parseFloat(c.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;
    await addMarker(lat, lng, { ...c, type: "virtual" }, `
      <div style="font-family:serif;">
        <strong>🕯️ ${c.name || "Adoration Chapel"}</strong>
        <div style="color:#666;font-size:13px;">${c.city || ""}, ${c.country || ""}</div>
        ${c.youtube ? `<button onclick="playChapel('${c.youtube}')" style="margin-top:8px;background:#D4AF37;color:#0B1F3A;border:none;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:13px;">▶ Watch Live</button>` : ""}
      </div>
    `);
  }

  // JSON physical chapels
  for (const c of state.physicalChapels) {
    await addMarker(c.lat, c.lng, { ...c, type: "physical" }, `
      <div style="font-family:serif;">
        <strong>⛪ ${c.name}</strong>
        <div style="color:#666;font-size:13px;">📍 ${c.address || c.city || "Location available"}</div>
        ${c.perpetual ? `<div style="color:#2d7d46;font-size:12px;margin-top:4px;">🕯️ Perpetual Adoration (24/7)</div>` : ""}
        ${c.schedule ? `<div style="font-size:12px;margin-top:4px;">${c.schedule}</div>` : ""}
      </div>
    `);
  }

  initSearch();
  updateStats();
}

/* ================= DATA LOAD ================= */
(async function loadDataAndInitMap() {
  try {
    const [csvText, jsonData] = await Promise.all([
      fetch("Adorationchapels.csv").then(r => r.ok ? r.text() : ""),
      fetch("adoration_chapels_20_verified.json").then(r => r.ok ? r.json() : []),
    ]);
    if (csvText) state.chapelData = Papa.parse(csvText, { header: true }).data;
    if (Array.isArray(jsonData)) state.physicalChapels = jsonData;
  } catch (e) {
    console.warn("Data load error:", e);
  }
  await initMap();
})();

/* ================= SEARCH ================= */
function initSearch() {
  const input = document.getElementById("searchInput");
  const box   = document.getElementById("suggestions");
  if (!input || !box) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    box.innerHTML = "";
    if (!q) return;

    const results = state.allMarkers
      .map(m => {
        const d = m.chapelData || {};
        return {
          marker: m,
          name: d.name || "",
          sub: [d.city, d.country].filter(Boolean).join(", "),
          searchText: `${d.name || ""} ${d.city || ""} ${d.country || ""} ${d.address || ""}`.toLowerCase(),
        };
      })
      .filter(item => item.searchText.includes(q))
      .slice(0, 10);

    if (!results.length) {
      box.innerHTML = `<div class="suggestion-item" style="color:#999;">No results found</div>`;
      return;
    }

    box.innerHTML = results.map((r, i) => `
      <div class="suggestion-item" data-idx="${i}">
        ${r.marker.chapelData?.type === "virtual" ? "🕯️" : "⛪"} <strong>${r.name}</strong>
        ${r.sub ? `<span style="color:#999;font-size:0.85em;"> — ${r.sub}</span>` : ""}
      </div>
    `).join("");

    box.querySelectorAll(".suggestion-item").forEach((el, i) => {
      el.addEventListener("click", () => {
        const match = results[i]?.marker;
        if (!match) return;
        input.value = results[i].name;
        box.innerHTML = "";
        const { lat, lng } = match.getLatLng();
        state.map.setView([lat, lng], 13);
        match.openPopup();
      });
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#searchWrapper")) box.innerHTML = "";
  });
}

/* ================= PLAYER ================= */
window.playChapel = function (stream) {
  stopMusic();
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("adorationFrame");
  modal.style.display = "flex";

  const yt = stream.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);
  frame.src = yt
    ? `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`
    : stream;

  document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
    frame.src = "";
  };
};

function handleDeadStream(stream) {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("adorationFrame");
  modal.style.display = "none";
  frame.src = "";
  const marker = state.allMarkers.find(m => m.streamUrl === stream);
  if (marker) {
    state.virtualMarkersGroup.removeLayer(marker);
    state.allMarkers = state.allMarkers.filter(m => m !== marker);
  }
}

/* ================= NEARBY ================= */
function initNearby() {
  document.getElementById("findChapel")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      state.map.setView([lat, lng], 11);

      const nearby = state.allMarkers
        .map(m => {
          const ll = m.getLatLng();
          const dist = state.map.distance([lat, lng], [ll.lat, ll.lng]);
          return { m, dist, data: m.chapelData || {} };
        })
        .filter(x => x.dist < 80000)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 8);

      const panel = document.getElementById("nearbyPanel");
      const list  = document.getElementById("nearbyList");
      panel.classList.remove("hidden");

      if (!nearby.length) {
        list.innerHTML = `<div style="padding:1rem;color:#999;font-style:italic;">No chapels found within 80 km.</div>`;
      } else {
        list.innerHTML = nearby.map(({ m, dist, data }) => `
          <div class="nearby-item" style="cursor:pointer;" onclick="
            state.map.setView([${m.getLatLng().lat},${m.getLatLng().lng}],14);
            state.allMarkers.find(mk=>mk===arguments[0]||true);
          ">
            ${data.type === "virtual" ? "🕯️" : "⛪"}
            <strong>${data.name || "Chapel"}</strong>
            <span style="color:#999;font-size:0.85em;"> — ${(dist/1000).toFixed(1)} km away</span>
            ${data.stream ? `<button onclick="playChapel('${data.stream}')" style="margin-left:8px;font-size:0.75rem;padding:3px 10px;">Watch</button>` : ""}
          </div>
        `).join("");
      }

      panel.scrollIntoView({ behavior: "smooth" });
    }, () => {
      alert("Could not get your location. Please allow location access.");
    });
  });
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  // Music
  state.music    = document.getElementById("bgMusic");
  state.musicBtn = document.getElementById("musicToggle");

  state.musicBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (state.music.paused) {
      state.music.play().catch(() => {});
    } else {
      state.music.pause();
    }
    updateMusicButton();
  });

  // Autoplay on first interaction
  document.addEventListener("click", () => {
    if (state.music && state.music.paused) {
      state.music.volume = 0.35;
      state.music.play().catch(() => {});
      updateMusicButton();
    }
  }, { once: true });

  // Language
  setLanguage("en");
  document.getElementById("languageSelect")?.addEventListener("change", e => {
    const map = { English: "en", Español: "es", Français: "fr", Italiano: "it", Português: "pt" };
    setLanguage(e.target.value in map ? map[e.target.value] : e.target.value);
  });

  // Start Adoration — random chapel
  document.getElementById("startAdoration")?.addEventListener("click", () => {
    stopMusic();
    const available = [
      ...featuredChapels.filter(c => c.stream),
      ...state.chapelData.filter(c => c.youtube),
    ];
    if (!available.length) { alert("No live streams available."); return; }
    const random = available[Math.floor(Math.random() * available.length)];
    playChapel(random.stream || random.youtube);
  });

  // Pledge button
  document.getElementById("pledgeButton")?.addEventListener("click", () => {
    const section = document.getElementById("pledge");
    section.classList.remove("hidden");
    section.style.display = "block";
    section.scrollIntoView({ behavior: "smooth" });
  });

  // Pledge form submit
  document.getElementById("pledgeForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    state.pledgeCount++;
    updateStats();

    // Try Formspree — replace REAL_ID_HERE with actual ID
    try {
      await fetch("https://formspree.io/f/REAL_ID_HERE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, _subject: "New Adoration Pledge" }),
      });
    } catch (_) {}

    e.target.style.display = "none";
    document.getElementById("thanks").classList.remove("hidden");
  });

  // Add Chapel modal
  const addBtn     = document.getElementById("addChapelBtn");
  const addModal   = document.getElementById("addChapelModal");
  const closeAdd   = document.getElementById("closeAddChapel");
  const footerAdd  = document.getElementById("footerAddChapel");

  const openAddModal = () => { addModal.style.display = "flex"; };
  addBtn?.addEventListener("click", openAddModal);
  footerAdd?.addEventListener("click", (e) => { e.preventDefault(); openAddModal(); });
  closeAdd?.addEventListener("click", () => { addModal.style.display = "none"; });

  // Chapel form submit
  document.getElementById("chapelForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    try {
      await fetch("https://formspree.io/f/REAL_ID_HERE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, _subject: "New Chapel Submission" }),
      });
    } catch (_) {}

    addModal.style.display = "none";
    e.target.reset();
    alert("Thank you! Your chapel submission will be reviewed.");
  });

  // Video modal close
  document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("videoModal").style.display = "none";
    document.getElementById("adorationFrame").src = "";
  });

  // Close modals on backdrop click
  window.addEventListener("click", (e) => {
    if (e.target === addModal) addModal.style.display = "none";
    if (e.target === document.getElementById("videoModal")) {
      document.getElementById("videoModal").style.display = "none";
      document.getElementById("adorationFrame").src = "";
    }
  });

  // Contact form
  document.getElementById("contactBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    const section = document.getElementById("contactSection");
    section.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("contactForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const msg  = document.getElementById("contactMsg");
    const btn  = document.getElementById("contactSubmitBtn");

    btn.disabled = true;
    btn.innerText = "Sending…";

    try {
      const res = await fetch("https://formspree.io/f/REAL_ID_HERE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, _subject: "Contact: WouldYouJoinMeForOneHour" }),
      });

      if (res.ok) {
        msg.style.color = "#a8d8a8";
        msg.innerText = "✓ Message sent. We'll be in touch soon.";
        e.target.reset();
      } else {
        throw new Error("Failed");
      }
    } catch (_) {
      msg.style.color = "#f08080";
      msg.innerText = "✗ Could not send. Please email us directly.";
    }

    btn.disabled = false;
    btn.innerText = translations[state.currentLang]?.send || "Send Message";
  });

  // Nearby
  initNearby();

  // Footer language select (value is language code now)
  document.getElementById("languageSelect")?.addEventListener("change", e => {
    setLanguage(e.target.value);
  });

});
