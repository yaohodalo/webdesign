/* ================= STATE ================= */
const state = {
  currentLang: "en",
  map: null,
  chapelData: [],
  physicalChapels: [],
  allMarkers: [],
  markersGroup: null,
  music: null,
  musicBtn: null
};

/* ================= TRANSLATIONS ================= */
const translations = {  en: {
    start: "Start Adoration",
    nearby: "Nearby Chapel",
    pledge: "Pledge 1h",
    addChapel: "Add a Chapel",
    musicPlay: "🎵 Play Music",
    musicPause: "⏸ Pause Music",
	contact: "Contact Us",
    send: "Send",
	mission: "Our Mission",
	missionstatement: "Helping people worldwide commit to an hour of Eucharistic Adoration and unite in prayer.",
    verses: [
      "“Be still and know that I am God.” — Psalm 46:10",
      "“Could you not watch with me one hour?” — Matthew 26:40",
      "“I am the bread of life.” — John 6:35",
      "“Remain in me, as I remain in you.” — John 15:4"
    ]
  },
  es: {
    start: "Comenzar Adoración",
    nearby: "Capilla Cercana",
    pledge: "Compromiso 1h",
    addChapel: "Agregar Capilla",
    musicPlay: "🎵 Reproducir música",
    musicPause: "⏸ Pausa Música",
	contact: "Contáctanos",
	send: "Enviar",
	mission: "Nuestra Misión",
	missionstatement: "Ayudando a personas en todo el mundo a comprometerse a una hora de Adoración Eucarística y unirse en oración.",
    verses: [
      "“Estad quietos y conoced que yo soy Dios.” — Salmo 46:10",
      "“¿No habéis podido velar conmigo una hora?” — Mateo 26:40",
      "“Yo soy el pan de vida.” — Juan 6:35",
      "“Permaneced en mí, como yo en vosotros.” — Juan 15:4"
    ]
  },
  fr: {
    start: "Commencer l'Adoration",
    nearby: "Chapelle Proche",
    pledge: "Engagement 1h",
    addChapel: "Ajouter une chapelle",
    musicPlay: "🎵 Jouer la musique",
    musicPause: "⏸ Pause Musique",
	contact: "Contáctanos",
	send: "Enviar",
	mission: "Nuestra Misión",
	missionstatement: "Ayudando a personas en todo el mundo a comprometerse a una hora de Adoración Eucarística y unirse en oración.",
    verses: [
      "“Arrêtez, et sachez que je suis Dieu.” — Psaume 46:10",
      "“N'avez-vous pas pu veiller une heure avec moi ?” — Matthieu 26:40",
      "“Je suis le pain de vie.” — Jean 6:35",
      "“Demeurez en moi, comme je demeure en vous.” — Jean 15:4"
    ]
  },
  it: {
    start: "Inizia Adorazione",
    nearby: "Cappella Vicina",
    pledge: "Impegno 1h",
    addChapel: "Aggiungi Cappella",
    musicPlay: "🎵 Riproduci musica",
    musicPause: "⏸ Metti in Pausa",
	contact: "Contattaci",
	send: "Invia",
	mission: "La Nostra Missione",
	missionstatement: "Aiutare le persone in tutto il mondo a impegnarsi per un'ora di Adorazione Eucaristica e a unirsi nella preghiera.",

    verses: [
      "“Fermatevi e sappiate che io sono Dio.” — Salmo 46:10",
      "“Non siete riusciti a vegliare un'ora con me?” — Matteo 26:40",
      "“Io sono il pane della vita.” — Giovanni 6:35",
      "“Rimanete in me e io in voi.” — Giovanni 15:4"
    ]
  },
  pt: {
    start: "Iniciar Adoração",
    nearby: "Capela Próxima",
    pledge: "Compromisso 1h",
    addChapel: "Adicionar Capela",
    musicPlay: "🎵 Tocar música",
    musicPause: "⏸ Pausar Música",
	contact: "Contacte-nos",
	send: "Enviar",
	mission: "A Nossa Missão",
    missionstatement: "Ajudar as pessoas de todo o mundo a comprometerem-se com uma hora de Adoração Eucarística e a unirem-se em oração.",
    verses: [
      "“Aquietai-vos e sabei que eu sou Deus.” — Salmo 46:10",
      "“Não pudestes vigiar uma hora comigo?” — Mateus 26:40",
      "“Eu sou o pão da vida.” — João 6:35",
      "“Permanecei em mim, e eu permanecerei em vós.” — João 15:4"
    ]
  }
};

/* ================= FEATURED ================= */
const featuredChapels = [
	{
    name: "Sisters of Divine Mercy",
    city: "Calgary",
    country: "Canada",
    lat: 51.088191,
    lng: -114.196839,
    stream: "https://www.youtube.com/watch?v=1OR9c5YtRco"
  },
  {
    name: "Shalom World",
    city: "Edinburg TX",
    country: "USA",
    lat: 27.211164594068823,
    lng: -98.12618571688884,
    stream: "https://www.youtube.com/watch?v=GlGkFWPKomU"
  },
  {
    name: "EWTN Chapel",
    city: "Irondale AL",
    country: "USA",
    lat: 33.533602,
    lng: -86.675057,
    stream: "https://www.youtube.com/watch?v=l30JmRRGQQI"
  },
  {
    name: "St Benedicts Burwood",
    city: "Australia",
    country: "Australia",
    lat: -37.848311,
    lng: 145.096218,
    stream: "https://www.youtube.com/watch?v=qz8YE61BoXM"
  },
  {
    name: "Monastery of the Immaculate Conception",
    city: "Paprotnia",
    country: "Poland",
    lat: 52.202124,
    lng: 20.419678,
    stream: "https://www.youtube.com/watch?v=bIR18Pvy11U"
  },
  {
    name: "Tyburn Convent",
    city: "London",
    country: "UK",
    lat: 51.51272175784455,
    lng: -0.16690941632605502,
    stream: "https://www.youtube.com/watch?v=YbxI_Vd97H4"
  },
  {
    name: "Maria Vision",
    city: "Rome",
    country: "Italy",
    lat: 44.34934717811221,
    lng: 13.014269026323799,
    stream: "https://1601580044.rsc.cdn77.org/live/_jcn_/amlst:Mariavision/master.m3u8"
  },
  {
    name: "Cathedral of the Good Shepherd",
    city: "Singapore",
    country: "Singapore",
    lat: 1.2967181988001202,
    lng: 103.85090453422588,
    stream: "https://www.youtube.com/watch?v=g8sUK4RNIEg"
  },
  {
    name: "Ermita de Nuestra Señora de Bienvenida-Alcolea",
    city: "Toledo",
    country: "Spain",
    lat: 39.81915886003033,
    lng: -5.163416274606668,
    stream: "https://www.youtube.com/watch?v=YTWA-eUZzJQ"
  },
  {
    name: "St Mary Mother of God Church",
    city: "Middletown NJ",
    country: "USA",
    lat: 40.41343862264555,
    lng: -74.10332138991909,
    stream: "https://www.youtube.com/watch?v=TIu6DyLTWLQ"
  },
 ];

/* ================= LANGUAGE ================= */
function setLanguage(lang) {
  state.currentLang = lang;
  const t = translations[lang];

  document.getElementById("startAdoration").innerText = t.start;
  document.getElementById("findChapel").innerText = t.nearby;
  document.getElementById("pledgeButton").innerText = t.pledge;
  document.getElementById("addChapelBtn").innerText = t.addChapel;

  const contactBtn = document.getElementById("contactBtn");
  if (contactBtn) contactBtn.innerText = t.contact;

  const sendBtn = document.querySelector("#contactForm button");
  if (sendBtn) sendBtn.innerText = t.send;

  const mission = document.getElementById("mission");
  if (mission) mission.innerText = t.mission;

  const missionText = document.getElementById("missionstatement");
  if (missionText) missionText.innerText = t.missionstatement;

  const verseEl = document.querySelector(".verse-track");
  if (verseEl) {
    verseEl.innerHTML = t.verses.join(" &nbsp;&nbsp;&nbsp; ");
  }

  updateMusicButton();
}

/* ================= MUSIC ================= */
function updateMusicButton() {
  if (!state.music || !state.musicBtn) return;
	
	const t = translations[state.currentLang];

  state.musicBtn.innerText = state.music.paused
    ? t.musicPlay
    : t.musicPause;
}

function stopMusic() {
  if (state.music && !state.music.paused) {
    state.music.pause();
    updateMusicButton();
  }
}

function fadeOutMusic() {
  if (!state.music || !state.musicBtn) return;

  let vol = state.music.volume;
  const fade = setInterval(() => {
    if (vol > 0.05) {
      vol -= 0.05;
      state.music.volume = vol;
    } else {
      clearInterval(fade);
      state.music.pause();
      state.music.volume = 0.35;
      updateMusicButton();
    }
  }, 120);
}

const virtualIcon = L.divIcon({
  className: "custom-marker virtual",
  html: `<div class="marker-circle virtual-circle"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const physicalIcon = L.divIcon({
  className: "custom-marker physical",
  html: `<div class="marker-circle physical-circle"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  state.music = document.getElementById("bgMusic");
  state.musicBtn = document.getElementById("musicToggle");

  // 🔥 FIX: toggle button ONLY (not whole page)
  state.musicBtn?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (state.music.paused) {
      state.music.play().catch(() => {});
    } else {
      state.music.pause();
    }

    if (state.musicBtn) updateMusicButton();
  });

  // autoplay once
  document.addEventListener("click", () => {
    if (state.music && state.music.paused) {
      state.music.play().catch(() => {});
      updateMusicButton();
    }
  }, { once: true });

  // fade out on interaction
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#musicToggle") && !state.music.paused) {
      fadeOutMusic();
    }
  });


const contactBtn = document.getElementById("contactBtn");
const contactSection = document.getElementById("contactSection");


if (contactBtn && contactSection) {
  contactBtn?.addEventListener("click", () => {
  contactSection.style.display = "block";
  contactSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});
  };

  // language
  setLanguage("en");
  document.getElementById("languageSelect")
    .addEventListener("change", e => setLanguage(e.target.value));

  // start button
  document.getElementById("startAdoration").addEventListener("click", () => {
    stopMusic();

    const available = [
      ...featuredChapels.filter(c => c.stream),
      ...state.chapelData.filter(c => c.youtube)
    ];

    if (!available.length) {
      alert("No live adoration available.");
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    playChapel(random.stream || random.youtube);
  });

  // 🔥 FIX: Add Chapel button (WAS MISSING)
  const addBtn = document.getElementById("addChapelBtn");
  const modal = document.getElementById("addChapelModal");
  const closeAdd = document.getElementById("closeAddChapel");

  addBtn?.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  closeAdd?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // 🔥 FIX: Pledge button (moved inside DOMContentLoaded)
  const pledgeBtn = document.getElementById("pledgeButton");
  const pledgeSection = document.getElementById("pledge");

  pledgeBtn?.addEventListener("click", () => {
    pledgeSection.style.display = "block";
    pledgeSection.scrollIntoView({ behavior: "smooth" });
  });



// ✅ CONTACT FORM (FIXED + SAFER)
contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(contactForm));

  try {
    const res = await fetch("https://formspree.io/f/REAL_ID_HERE", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Message sent successfully!");
      contactForm.reset();
    } else {
      alert("Failed to send message.");
    }

  } catch (err) {
    alert("Network error.");
  }
});

  /* ================= YOUTUBE API ================= */

  const API_KEY = "AIzaSyBx63zE887NDnhEKQBnfVkS_baF9rG0mIE";

  async function getChannelIdFromVideo(url) {
    try {
      const videoId = url.split("v=")[1]?.split("&")[0];
      if (!videoId) return null;

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
      );

      const data = await res.json();
      return data.items?.[0]?.snippet?.channelId || null;
    } catch {
      return null;
    }
  }

  async function getLiveStream(channelId) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${API_KEY}`
      );

      const data = await res.json();

      if (data.items?.length) {
        return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
      }

      return null;
    } catch {
      return null;
    }
  }


	
  // load data
  Promise.all([
    fetch("Adorationchapels.csv").then(r => r.text()),
    fetch("adoration_chapels_20_verified.json").then(r => r.json())
  ])
  .then(([csvText, jsonData]) => {
    state.chapelData = Papa.parse(csvText, { header: true }).data;
    state.physicalChapels = jsonData;
    initMap();
  });

});

/* ================= SAINT OF THE DAY ================= */

async function loadSaintOfDay() {
  try {
    const res = await fetch("https://calapi.inadiutorium.cz/api/v0/en/calendars/default/today");
    const data = await res.json();

    const saintName = data.celebrations?.[0]?.title || "Saint of the Day";
    const color = data.celebrations?.[0]?.colour || "green";

    applyLiturgicalTheme(saintName, color);

  } catch (err) {
    console.warn("Saint API failed");
    applyLiturgicalTheme("Saint of the Day", "green");
  }
}

function setLiturgicalTheme() {
  const now = new Date();
  const year = now.getFullYear();

  // Simple seasonal approximation
  const lentStart = new Date(year, 1, 15);   // approx Feb 15
  const easter = new Date(year, 3, 20);      // approx April
  const adventStart = new Date(year, 10, 30); // approx Nov 30
  const christmas = new Date(year, 11, 25);

  let color = "#2e7d32"; // default green

  if (now >= lentStart && now <= easter) {
    color = "#5b2c6f"; // purple
  }
  else if (now >= adventStart && now < christmas) {
    color = "#5b2c6f"; // purple
  }
  else if (
    (now >= christmas) ||
    (now <= new Date(year, 0, 10))
  ) {
    color = "#d4af37"; // gold
  }

  document.documentElement.style.setProperty("--liturgical-color", color);
}

setLiturgicalTheme();

/* ================= MAP ================= */
async function addMarker(lat, lng, data, html) {
  let icon = virtualIcon;
  let group = state.virtualMarkersGroup;

  if (data.type === "physical") {
    icon = physicalIcon;
    group = state.physicalMarkersGroup;
  }

  if (data.type === "virtual") {
    const isLive = await checkStreamLive(data.stream || data.youtube);
    if (!isLive) return; // skip offline streams
    icon = goldIcon; // gold for live
  }

  const marker = L.marker([lat, lng], { icon });
  marker.chapelData = data;
  marker.bindPopup(html);

  if (data.type === "virtual" && icon === goldIcon) {
    marker.on("add", () => {
      const el = marker.getElement();
      if (el) el.querySelector("div").classList.add("marker-flash");
    });
    marker.on("remove", () => {
      const el = marker.getElement();
      if (el) el.querySelector("div").classList.remove("marker-flash");
    });
  }

  group.addLayer(marker);
  state.allMarkers.push(marker);
}

async function initMap() {
  state.map = L.map("map", { maxZoom: 18, minZoom: 2 }).setView([20, 0], 2);
  state.virtualMarkersGroup = L.layerGroup().addTo(state.map);
  state.physicalMarkersGroup = L.layerGroup().addTo(state.map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(state.map);

  for (const c of featuredChapels) {
    await addMarker(c.lat, c.lng, { ...c, type: "virtual" }, `
      <b>🕯️ ${c.name}</b><br>${c.city}, ${c.country}<br><br>
      <button onclick="playChapel('${c.stream}')">Watch Live Adoration</button>
    `);
  }

  for (const c of state.chapelData) {
    const lat = parseFloat(c.latitude);
    const lng = parseFloat(c.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;

    await addMarker(lat, lng, { ...c, type: "virtual" }, `
      <b>🕯️ ${c.name}</b><br>${c.city}, ${c.country}<br><br>
      ${c.youtube ? `<button onclick="playChapel('${c.youtube}')">Watch Live Adoration</button>` : "No stream"}
    `);
  }

  for (const c of state.physicalChapels) {
    await addMarker(c.lat, c.lng, { ...c, type: "physical" }, `
      <b>⛪ ${c.name}</b><br>📍 ${c.address || "Location available"}<br><br>
      ${c.perpetual ? "🕯️ Perpetual Adoration (24/7)" : ""}
    `);
  }

  initSearch();
  initNearby();
  loadSaintOfDay();
}


/* ================= SEARCH ================= */
box.addEventListener("click", (e) => {
  const item = e.target.closest(".suggestion-item");
  if (!item) return;

  const text = item.innerText.replace(/^[^\s]+\s/, "");

  document.getElementById("searchInput").value = text;
  box.innerHTML = "";

  const match = state.allMarkers.find(m =>
    m.chapelData?.name === text ||
    m.chapelData?.city === text ||
    m.chapelData?.country === text
  );

  if (match) {
    const { lat, lng } = match.getLatLng();
    state.map.setView([lat, lng], 10);
    match.openPopup();
  }
});

box.addEventListener("click", (e) => {
  const item = e.target.closest(".suggestion-item");
  if (!item) return;

  const text = item.innerText.replace(/^[^\s]+\s/, "");

  document.getElementById("searchInput").value = text;
  box.innerHTML = "";

  const match = state.allMarkers.find(m =>
    m.chapelData?.name === text ||
    m.chapelData?.city === text ||
    m.chapelData?.country === text
  );

  if (match) {
    const { lat, lng } = match.getLatLng();
    state.map.setView([lat, lng], 10);
    match.openPopup();
  }
});

document.addEventListener("DOMContentLoaded", () => {

const box = document.getElementById("suggestions");

if (box) {
  box.addEventListener("click", (e) => {
    if (!e.target.classList.contains("suggestion-item")) return;

    const text = e.target.innerText.replace(/^[^\s]+\s/, "");

    document.getElementById("searchInput").value = text;

    box.innerHTML = "";

    // OPTIONAL: move map to match
    const match = state.allMarkers.find(m =>
      m.chapelData?.name === text ||
      m.chapelData?.city === text ||
      m.chapelData?.country === text
    );

    if (match) {
      const { lat, lng } = match.getLatLng();
      state.map.setView([lat, lng], 10);
      match.openPopup();
    }
  });
}
});
/* ================= NEARBY ================= */
function initNearby() {
  document.getElementById("findChapel").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;

      const nearby = state.allMarkers.slice(0, 30);

      state.physicalMarkersGroup.clearLayers();
      state.physicalMarkersGroup.addLayers(nearby);

      state.map.setView([latitude, longitude], 10);
    });
  });
}

/* ================= PLAYER ================= */
window.playChapel = function (stream) {
  stopMusic();

  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("adorationFrame");
  const video = document.getElementById("adorationVideo");

  modal.style.display = "flex";

  const yt = stream.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);

  if (yt) {
    frame.style.display = "block";
    video.style.display = "none";
    frame.src = `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  } else {
    frame.src = stream;
  }

  document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
    frame.src = "";
  };
};
