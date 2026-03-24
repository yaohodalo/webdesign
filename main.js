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
let currentLang = "en";

document.addEventListener("DOMContentLoaded", () => {

  let map;
  let chapelData = [];
  let physicalChapels = [];
  let allMarkers = [];
  let markersGroup;

  const player = videojs("adorationVideo");

  /* ================= MUSIC ================= */

  const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicToggle");

music.volume = 0.35;

function updateMusicButton() {
  musicBtn.innerText = music.paused
    ? translations[currentLang].playMusic
    : translations[currentLang].pauseMusic;
}

// Try autoplay
music.play().then(() => {
  updateMusicButton();
}).catch(() => {
  updateMusicButton();
});

// Toggle
musicBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
  updateMusicButton();
});

// Stop music on interaction
document.addEventListener("click", (e) => {
  if (!e.target.closest("#musicToggle") && !music.paused) {
    music.pause();
    updateMusicButton();
  }
});
  function fadeOutMusic() {
    let vol = music.volume;
    const fade = setInterval(() => {
      if (vol > 0.05) {
        vol -= 0.05;
        music.volume = vol;
      } else {
        clearInterval(fade);
        music.pause();
        music.volume = 0.35;
      }
    }, 120);
  }

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

  /* ================= FEATURED CHAPELS ================= */

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

  /* ================= LOAD DATA ================= */

  Promise.all([
    fetch("Adorationchapels.csv").then(r => r.text()),
    fetch("global_adoration_dataset_200_named.json").then(r => r.json())
  ])
  .then(([csvText, jsonData]) => {

    chapelData = Papa.parse(csvText, { header: true }).data;
    physicalChapels = jsonData;

    initMap();

  })
  .catch(err => console.error("Load error:", err));

  /* ================= MAP ================= */

  function initMap() {

    map = L.map("map").setView([20, 0], 2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png").addTo(map);

    markersGroup = L.markerClusterGroup();
    map.addLayer(markersGroup);

	map.on("click zoomstart dragstart", stopMusic);

    const markerList = [];

    function addMarker(lat, lng, data, popupHTML) {
      const marker = L.marker([lat, lng]);

      marker.chapelData = data;
      marker.bindPopup(popupHTML);

      allMarkers.push(marker);
      markerList.push(marker);
    }

    /* FEATURED */
    featuredChapels.forEach(c => {
      addMarker(c.lat, c.lng, { ...c, type: "virtual" }, `
        <b>🕯️ ${c.name}</b><br>
        ${c.city}, ${c.country}<br><br>
        <button onclick="playChapel('${c.stream}')">Watch Live Adoration</button>
      `);
    });

    /* CSV */
csvChapels.forEach(c => {
  const lat = parseFloat(c.latitude);
  const lng = parseFloat(c.longitude);
  if (isNaN(lat) || isNaN(lng)) return;

  const marker = L.marker([lat, lng]);

  marker.chapelData = {
    name: c.name,
    city: c.city,
    country: c.country,
    type: "virtual"
  };

  marker.bindPopup(`
    <b>🕯️ ${c.name}</b><br>
    ${c.city}, ${c.country}<br><br>
    ${
      c.youtube
        ? `<button onclick="playChapel('${c.youtube}')">Watch Live Adoration</button>`
        : "No stream available"
    }
  `);

  allMarkers.push(marker);
  markerList.push(marker);
});
    /* PHYSICAL */
 physicalChapels.forEach(c => {
  const marker = L.marker([c.lat, c.lng]);

  marker.chapelData = { ...c, type: "physical" };

  marker.bindPopup(`
    <b>⛪ ${c.name}</b><br>
    ${c.city}, ${c.country}<br><br>
    ${c.perpetual ? "🕯️ Perpetual Adoration (24/7)" : ""}
  `);

  allMarkers.push(marker);
  markerList.push(marker);
});

  /* ================= SEARCH ================= */

const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("suggestions");

if (searchInput && suggestionsBox) {

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      suggestionsBox.innerHTML = "";
      return;
    }

    const matches = [];

    allMarkers.forEach(m => {
      const d = m.chapelData;
      if (!d) return;

      // Chapel name
      if (d.name?.toLowerCase().includes(query)) {
        matches.push({
          label: d.name,
          type: d.type
        });
      }

      // City
      if (d.city?.toLowerCase().includes(query)) {
        matches.push({
          label: d.city,
          type: "location"
        });
      }

      // Country
      if (d.country?.toLowerCase().includes(query)) {
        matches.push({
          label: d.country,
          type: "location"
        });
      }
    });

    // Remove duplicates
    const unique = [];
    const seen = new Set();

    matches.forEach(m => {
      if (!seen.has(m.label)) {
        seen.add(m.label);
        unique.push(m);
      }
    });

    const top = unique.slice(0, 8);

    // Render with icons
    suggestionsBox.innerHTML = top.map(item => {
      let icon = "📍";

      if (item.type === "virtual") icon = "🕯️";
      if (item.type === "physical") icon = "⛪";

      return `<div class="suggestion-item">${icon} ${item.label}</div>`;
    }).join("");
  });

  // Click suggestion
  suggestionsBox.addEventListener("click", (e) => {
    if (!e.target.classList.contains("suggestion-item")) return;

    const text = e.target.innerText.replace(/^[^\s]+\s/, ""); // remove emoji

    searchInput.value = text;
    suggestionsBox.innerHTML = "";

    searchInput.dispatchEvent(new Event("input"));
  });

  // Hide on outside click
  document.addEventListener("click", e => {
    if (!e.target.closest(".header-center")) {
      suggestionsBox.innerHTML = "";
    }
  });
}

  /* ================= NEARBY ================= */

  document.getElementById("findChapel").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    // Center map
    map.setView([latitude, longitude], 10);

    // Show user radius
    L.circle([latitude, longitude], {
      radius: 10000,
      color: "#B59B6A"
    }).addTo(map);

    // --- DISTANCE FUNCTION ---
    function getDistance(lat1, lng1, lat2, lng2) {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // --- FIND NEARBY (BOTH TYPES) ---
    const nearby = allMarkers
      .map(marker => {
        const [lat, lng] = marker.getLatLng();
        const distance = getDistance(latitude, longitude, lat, lng);

        return {
          marker,
          distance
        };
      })
      .filter(item => item.marker.chapelData.type === "virtual" || item.distance <= 100)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50);

    const nearbyMarkers = nearby.map(n => n.marker);

    // Update map
    markersGroup.clearLayers();
    markersGroup.addLayers(nearbyMarkers);

    // Fit bounds nicely
    if (nearbyMarkers.length) {
      const group = new L.featureGroup(nearbyMarkers);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    } else {
      alert("No nearby chapels found.");
    }

  }, () => {
    alert("Location permission denied.");
  });
});
  /* ================= START BUTTON ================= */

document.getElementById("startAdoration").onclick = () => {
  stopMusic();

  const available = [
    ...featuredChapels.filter(c => c.stream),
    ...chapelData.filter(c => c.youtube)
  ];

  if (!available.length) {
    alert("No live adoration available right now.");
    return;
  }

  const random = available[Math.floor(Math.random() * available.length)];
  playChapel(random.stream || random.youtube);
};


/* ================= Pledge One Hour ================= */

const pledgeBtn = document.getElementById("pledgeButton");
const pledgeSection = document.getElementById("pledge");

if (pledgeBtn && pledgeSection) {
  pledgeBtn.addEventListener("click", () => {
    pledgeSection.classList.remove("hidden");

    pledgeSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

/* ================= Add Chapel ================= */
const addBtn = document.getElementById("addChapelBtn");
const modal = document.getElementById("addChapelModal");
const closeModal = document.getElementById("closeAddChapel");

addBtn.onclick = () => modal.style.display = "flex";
closeModal.onclick = () => modal.style.display = "none";

// SUBMIT
document.getElementById("chapelForm").addEventListener("submit", e => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(e.target));

  fetch("https://formspree.io/f/YOUR_FORM_ID", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
  .then(() => {
    alert("Thank you! Chapel submitted.");
    modal.style.display = "none";
    e.target.reset();
  })
  .catch(() => alert("Submission failed."));
});



/* ================= Languages ================= */

const verseTrack = document.querySelector(".verse-track");
document.getElementById("languageSelect").addEventListener("change", e => {

setLanguage("en");
const userLang = navigator.language.slice(0,2);
if (translations[userLang]) setLanguage(userLang);



function setLanguage(lang) {
  currentLang = lang;

  // Update verses
  document.querySelector(".verse-track").innerText =
  translations[lang].verses;

  // Update music button text
  updateMusicButton();
}
  const lang = e.target.value;
  const t = translations[lang];

  // Buttons
  document.getElementById("startAdoration").innerText = t.start;
  document.getElementById("findChapel").innerText = t.nearby;
  document.getElementById("pledgeButton").innerText = t.pledge;
  document.getElementById("addChapelBtn").innerText = t.addChapel;

  // Music button
  const musicBtn = document.getElementById("musicToggle");
  if (!music.paused) {
    musicBtn.innerText = t.musicPause;
  } else {
    musicBtn.innerText = t.musicPlay;
  }

  // Verse ticker (scrolling text)
  if (verseTrack) {
    verseTrack.innerHTML = t.verses.join(" &nbsp;&nbsp;&nbsp; ");
  }
});



/* ================= GLOBAL PLAYER ================= */

window.playChapel = function (stream) {
	stopMusic();
 const modal = document.getElementById("videoModal");
  const frame = document.getElementById("adorationFrame");
  const video = document.getElementById("adorationVideo");

  modal.style.display = "flex";

  function getYouTubeID(url) {
    const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  }

  if (/youtube|youtu\.be/.test(stream)) {
    frame.style.display = "block";
    video.style.display = "none";
    frame.src = `https://www.youtube.com/embed/${getYouTubeID(stream)}?autoplay=1`;
  }

  else if (stream.includes(".m3u8")) {
    frame.style.display = "none";
    video.style.display = "block";

    const player = videojs("adorationVideo");
    player.src({ src: stream, type: "application/x-mpegURL" });
    player.play();
  }

  else {
    frame.style.display = "block";
    video.style.display = "none";
    frame.src = stream;
  }
  document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
    frame.src = "";
  };
 };
	 };
	 });
 
