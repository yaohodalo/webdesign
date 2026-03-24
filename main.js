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
const translations = {
  en: {
    start: "Start",
    nearby: "Nearby",
    pledge: "Pledge",
    addChapel: "Add a Chapel",
    musicPlay: "🎵 Play Music",
    musicPause: "⏸ Pause Music",
    verses: [
      "“Be still and know that I am God.” — Psalm 46:10",
      "“Could you not watch with me one hour?” — Matthew 26:40",
      "“I am the bread of life.” — John 6:35",
      "“Remain in me, as I remain in you.” — John 15:4"
    ]
  },
  es: {
    start: "Comenzar",
    nearby: "Cercanos",
    pledge: "Compromiso",
    addChapel: "Agregar Capilla",
    musicPlay: "🎵 Reproducir música",
    musicPause: "⏸ Pausa Música",
    verses: [
      "“Estad quietos y conoced que yo soy Dios.” — Salmo 46:10",
      "“¿No habéis podido velar conmigo una hora?” — Mateo 26:40",
      "“Yo soy el pan de vida.” — Juan 6:35",
      "“Permaneced en mí, como yo en vosotros.” — Juan 15:4"
    ]
  },
  fr: {
    start: "Commencer",
    nearby: "À proximité",
    pledge: "Engagement",
    addChapel: "Ajouter une chapelle",
    musicPlay: "🎵 Jouer la musique",
    musicPause: "⏸ Pause Musique",
    verses: [
      "“Arrêtez, et sachez que je suis Dieu.” — Psaume 46:10",
      "“N'avez-vous pas pu veiller une heure avec moi ?” — Matthieu 26:40",
      "“Je suis le pain de vie.” — Jean 6:35",
      "“Demeurez en moi, comme je demeure en vous.” — Jean 15:4"
    ]
  },
  it: {
    start: "Inizia",
    nearby: "Vicino a me",
    pledge: "Impegno",
    addChapel: "Aggiungi Cappella",
    musicPlay: "🎵 Riproduci musica",
    musicPause: "⏸ Metti in Pausa",
    verses: [
      "“Fermatevi e sappiate che io sono Dio.” — Salmo 46:10",
      "“Non siete riusciti a vegliare un'ora con me?” — Matteo 26:40",
      "“Io sono il pane della vita.” — Giovanni 6:35",
      "“Rimanete in me e io in voi.” — Giovanni 15:4"
    ]
  },
  pt: {
    start: "Iniciar",
    nearby: "Perto de mim",
    pledge: "Compromisso",
    addChapel: "Adicionar Capela",
    musicPlay: "🎵 Tocar música",
    musicPause: "⏸ Pausar Música",
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
  {
    name: "Servants of the Holy Spirit of Perpetual Adoration",
    city: "Nitra",
    country: "Slovakia",
    lat: 48.32946693286068,
    lng: 18.084085010485204,
    stream: "https://apps.csweb.sk/sspsap/"
  }
	];

/* ================= LANGUAGE ================= */
function setLanguage(lang) {
  state.currentLang = lang;
  const t = translations[lang];

  document.getElementById("startAdoration").innerText = t.start;
  document.getElementById("findChapel").innerText = t.nearby;
  document.getElementById("pledgeButton").innerText = t.pledge;
  document.getElementById("addChapelBtn").innerText = t.addChapel;

  const verseEl = document.querySelector(".verse-track");
  if (verseEl) {
    verseEl.innerHTML = t.verses.join(" &nbsp;&nbsp;&nbsp; ");
  }

  updateMusicButton();
}

/* ================= MUSIC ================= */
function updateMusicButton() {
  if (!state.music || !state.musicBtn) return;

  state.musicBtn.innerText = state.music.paused
    ? translations[state.currentLang].musicPlay
    : translations[state.currentLang].musicPause;
}

function stopMusic() {
  if (state.music && !state.music.paused) {
    state.music.pause();
    updateMusicButton();
  }
}

function fadeOutMusic() {
  if (!state.music) return;

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

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  state.music = document.getElementById("bgMusic");
  state.musicBtn = document.getElementById("musicToggle");

  // autoplay on first interaction
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

  // load data
  Promise.all([
    fetch("Adorationchapels.csv").then(r => r.text()),
    fetch("global_adoration_dataset_200_named.json").then(r => r.json())
  ])
  .then(([csvText, jsonData]) => {
    state.chapelData = Papa.parse(csvText, { header: true }).data;
    state.physicalChapels = jsonData;
    initMap();
  });

});

/* ================= MAP ================= */
function initMap() {
  state.map = L.map("map").setView([20, 0], 2);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png")
    .addTo(state.map);

  state.markersGroup = L.markerClusterGroup();
  state.map.addLayer(state.markersGroup);

  map.on("click zoomstart dragstart", () => {
  stopMusic();

  const el = document.getElementById("musicFloating");
  if (el) el.style.opacity = "0.5";
});

document.addEventListener("mousemove", () => {
  const el = document.getElementById("musicFloating");
  if (el) el.style.opacity = "1";
});
	
  function addMarker(lat, lng, data, html) {
    const m = L.marker([lat, lng]);
    m.chapelData = data;
    m.bindPopup(html);

    state.allMarkers.push(m);
    state.markersGroup.addLayer(m);
  }

  // FEATURED
  featuredChapels.forEach(c => {
    addMarker(c.lat, c.lng, { ...c, type: "virtual" }, `
      <b>🕯️ ${c.name}</b><br>
      ${c.city}, ${c.country}<br><br>
      <button onclick="playChapel('${c.stream}')">Watch Live Adoration</button>
    `);
  });

  // CSV
  state.chapelData.forEach(c => {
    const lat = parseFloat(c.latitude);
    const lng = parseFloat(c.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    addMarker(lat, lng, {
      name: c.name,
      city: c.city,
      country: c.country,
      type: "virtual"
    }, `
      <b>🕯️ ${c.name}</b><br>
      ${c.city}, ${c.country}<br><br>
      ${
        c.youtube
          ? `<button onclick="playChapel('${c.youtube}')">Watch Live Adoration</button>`
          : "No stream available"
      }
    `);
  });

  // PHYSICAL
  state.physicalChapels.forEach(c => {
    addMarker(c.lat, c.lng, { ...c, type: "physical" }, `
      <b>⛪ ${c.name}</b><br>
      ${c.city}, ${c.country}<br><br>
      ${c.perpetual ? "🕯️ Perpetual Adoration (24/7)" : ""}
    `);
  });

  initSearch();
 loadSaintOfDay();
  initNearby();
}

/* ================= SEARCH ================= */
function initSearch() {
  const input = document.getElementById("searchInput");
  const box = document.getElementById("suggestions");

  let timeout;

  input.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {

      const q = input.value.toLowerCase().trim();
      if (!q) return box.innerHTML = "";

      const matches = [];

      state.allMarkers.forEach(m => {
        const d = m.chapelData;
        if (!d) return;

        if (d.name?.toLowerCase().includes(q)) matches.push(d.name);
        if (d.city?.toLowerCase().includes(q)) matches.push(d.city);
        if (d.country?.toLowerCase().includes(q)) matches.push(d.country);
      });

      const unique = [...new Set(matches)].slice(0, 8);

      box.innerHTML = unique.map(t =>
        `<div class="suggestion-item">📍 ${t}</div>`
      ).join("");

    }, 200);
  });
}

/* ================= NEARBY ================= */
function initNearby() {
  document.getElementById("findChapel").addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;

      const nearby = state.allMarkers
        .map(m => {
          const { lat, lng } = m.getLatLng();
          const d = Math.hypot(lat - latitude, lng - longitude);
          return { marker: m, d };
        })
		.filter(item => item.distance <= 100)
        .sort((a, b) => a.d - b.d)
        .slice(0, 50);

      state.markersGroup.clearLayers();
      state.markersGroup.addLayers(nearby.map(n => n.marker));

      state.map.setView([latitude, longitude], 10);

    }, () => alert("Location denied"));
  });
}

async function loadSaintOfDay() {
  try {
    const res = await fetch("https://calapi.inadiutorium.cz/api/v0/en/calendars/default/today");
    const data = await res.json();

    const saintName = data.celebrations?.[0]?.title || "Saint of the Day";
    const liturgicalColor = data.celebrations?.[0]?.colour || "green";

    applyLiturgicalTheme(saintName, liturgicalColor);

  } catch (err) {
    console.warn("Liturgical API failed, using fallback.");
    applyLiturgicalTheme("Catholic Saint of the Day", "green");
  }
}
function applyLiturgicalTheme(name, color) {
  const searchWrapper = document.getElementById("searchWrapper");

  const colorMap = {
    green: "#2e7d32",
    red: "#b71c1c",
    white: "#f5f5f5",
    violet: "#6a1b9a",
    purple: "#6a1b9a",
    rose: "#ff8a80",
    black: "#222"
  };

  const bg = colorMap[color?.toLowerCase()] || "#2e7d32";

  if (searchWrapper) {
    searchWrapper.style.background = bg;
    searchWrapper.title = name;

    searchWrapper.onclick = () => {
      const query = encodeURIComponent(name);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    };
  }
}

const pledgeBtn = document.getElementById("pledgeButton");
const pledgeSection = document.getElementById("pledge");

if (pledgeBtn && pledgeSection) {
  pledgeBtn.addEventListener("click", () => {
    pledgeSection.style.display = "block"; // stronger than class toggle

    pledgeSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

/* ================= PLAYER ================= */
window.playChapel = function (stream) {
  stopMusic();

  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("adorationFrame");
  const video = document.getElementById("adorationVideo");

 if (addBtn && modal && closeModal) {
  addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  const yt = stream.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);

  if (yt) {
    frame.style.display = "block";
    video.style.display = "none";
    frame.src = `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  } else if (stream.includes(".m3u8")) {
    frame.style.display = "none";
    video.style.display = "block";

    const player = videojs("adorationVideo");
    player.src({ src: stream, type: "application/x-mpegURL" });
    player.play();
  } else {
    frame.style.display = "block";
    video.style.display = "none";
    frame.src = stream;
  }



  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
}
};
