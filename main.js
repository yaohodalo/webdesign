document.addEventListener("DOMContentLoaded", () => {
  let map;
  let chapelData = [];
  let player;

  // NEW
  let allMarkers = [];
  let markersGroup;

  // Initialize video.js AFTER DOM is ready
  player = videojs("adorationVideo");

  const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicToggle");

let musicStarted = false;
let userStopped = false;

// Start music automatically (may be blocked until interaction)
music.volume = 0.35;

music.play().then(() => {
  musicStarted = true;
  musicBtn.innerText = "⏸ Music";
}).catch(() => {
  // autoplay blocked → wait for interaction
});

// Stop music on FIRST interaction (your UX choice)
function stopOnInteraction() {
  if (musicStarted && !userStopped) {
    fadeOutMusic();
    userStopped = true;
    musicBtn.innerText = "🎵 Resume";
  }
}

["click", "scroll", "keydown"].forEach(event => {
  document.addEventListener(event, stopOnInteraction, { once: true });
});

// Toggle button
musicBtn.addEventListener("click", () => {
  if (music.paused) {
    music.volume = 0.35;
    music.play();
    musicBtn.innerText = "⏸ Music";
    userStopped = false;
  } else {
    music.pause();
    musicBtn.innerText = "🎵 Resume";
    userStopped = true;
  }
});

// Smooth fade out
function fadeOutMusic() {
  let vol = music.volume;

  const fade = setInterval(() => {
    if (vol > 0.05) {
      vol -= 0.05;
      music.volume = vol;
    } else {
      clearInterval(fade);
      music.pause();
      music.volume = 0.35; // reset for next play
    }
  }, 120);
}

  // --- FEATURED CHAPELS (NOT IN CSV) ---
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
      name: "Maria Vision",
      city: "Rome",
      country: "Italy",
      lat: 44.34934717811221,
      lng: 13.014269026323799,
      stream: "https://1601580044.rsc.cdn77.org/live/_jcn_/amlst:Mariavision/master.m3u8"
    }
  ];

  // NEW: PHYSICAL CHAPELS
  const physicalChapels = [
    {
      name: "St Mary Catholic Church",
      city: "Rockville",
      country: "USA",
      lat: 39.0839,
      lng: -77.1528
    },
    {
      name: "St Patrick Cathedral",
      city: "New York",
      country: "USA",
      lat: 40.7585,
      lng: -73.9760
    }
  ];

  // --- LOAD CSV ---
  fetch("Adorationchapels.csv")
    .then(r => r.text())
    .then(text => {
      const parsed = Papa.parse(text, { header: true }).data;
      chapelData = parsed;
      initMap(parsed);
    })
    .catch(err => console.error("CSV load error:", err));

  // --- INIT MAP ---
  function initMap(csvChapels) {
    map = L.map("map", { scrollWheelZoom: true }).setView([20, 0], 2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap & Carto",
      maxZoom: 18
    }).addTo(map);

    // NEW: use global cluster group
    markersGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      disableClusteringAtZoom: 12,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    map.addLayer(markersGroup);

    const markerList = [];

    function jitter(val) {
      return val + (Math.random() - 0.5) * 0.0005;
    }

    // --- FEATURED ---
    featuredChapels.forEach(c => {
      const marker = L.marker([jitter(c.lat), jitter(c.lng)]);

      marker.chapelData = { ...c, type: "virtual" }; // NEW

      marker.bindPopup(`
        <b>🕯️ ${c.name}</b><br>
        ${c.city}, ${c.country}<br><br>
        <button onclick="playChapel('${c.stream}')">
          Watch Live Adoration
        </button>
      `);

      allMarkers.push(marker); // NEW
      markerList.push(marker);
    });

    // --- CSV ---
    csvChapels.forEach(c => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const icon = c.live === "TRUE" ? "🕯️" : "⛪";

      const marker = L.marker([jitter(lat), jitter(lng)]);

      marker.chapelData = {
        name: c.name,
        city: c.city,
        country: c.country,
        type: "virtual"
      }; // NEW

      marker.bindPopup(`
        <b>${icon} ${escapeHTML(c.name)}</b><br>
        ${escapeHTML(c.city)}, ${escapeHTML(c.country)}<br><br>
        ${
          c.youtube
            ? `<button onclick="playChapel('${c.youtube}')">Watch Live</button>`
            : "No stream available"
        }
      `);

      allMarkers.push(marker); // NEW
      markerList.push(marker);
    });

    // --- PHYSICAL CHAPELS (NEW) ---
    physicalChapels.forEach(c => {
      const marker = L.marker([jitter(c.lat), jitter(c.lng)]);

      marker.chapelData = { ...c, type: "physical" };

      marker.bindPopup(`
        <b>⛪ ${c.name}</b><br>
        ${c.city}, ${c.country}<br><br>
        In-person Eucharistic Adoration
      `);

      allMarkers.push(marker);
      markerList.push(marker);
    });

    markersGroup.addLayers(markerList);

    if (markerList.length) {
      const group = new L.featureGroup(markerList);
      map.fitBounds(group.getBounds());
    }
  }

  // --- SEARCH (NEW) ---
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      const query = e.target.value.toLowerCase();

      const filtered = allMarkers.filter(m => {
        const d = m.chapelData;
        return (
          d.name?.toLowerCase().includes(query) ||
          d.city?.toLowerCase().includes(query) ||
          d.country?.toLowerCase().includes(query)
        );
      });

      markersGroup.clearLayers();
      markersGroup.addLayers(filtered);

      if (filtered.length) {
        const group = new L.featureGroup(filtered);
        map.fitBounds(group.getBounds());
      }
    });
  }

  // --- AUTOCOMPLETE SEARCH (NEW) ---
const suggestionsBox = document.getElementById("suggestions");

document.getElementById("searchInput").addEventListener("input", e => {
  const query = e.target.value.toLowerCase();

  if (!query) {
    suggestionsBox.innerHTML = "";
    return;
  }

  // Build suggestion list
  const matches = [];

  allMarkers.forEach(m => {
    const d = m.chapelData;

    if (d.name?.toLowerCase().includes(query)) matches.push(d.name);
    if (d.city?.toLowerCase().includes(query)) matches.push(d.city);
    if (d.country?.toLowerCase().includes(query)) matches.push(d.country);
  });

  // Remove duplicates + limit
  const unique = [...new Set(matches)].slice(0, 8);

  suggestionsBox.innerHTML = unique
    .map(item => `<div>${item}</div>`)
    .join("");

  // Click suggestion
  document.querySelectorAll(".suggestions div").forEach(el => {
    el.onclick = () => {
      document.getElementById("searchInput").value = el.innerText;
      suggestionsBox.innerHTML = "";

      // Trigger search filter
      document.getElementById("searchInput").dispatchEvent(new Event("input"));
    };
  });
});

// Hide suggestions when clicking outside
document.addEventListener("click", e => {
  if (!e.target.closest(".search-container")) {
    suggestionsBox.innerHTML = "";
  }
});

  // --- FIND USER LOCATION (UPDATED) ---
  document.getElementById("findChapel").addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;

      map.setView([latitude, longitude], 10);

      L.circle([latitude, longitude], {
        radius: 10000,
        color: "#B59B6A"
      }).addTo(map);

      // NEW: filter ONLY physical
      const nearby = allMarkers.filter(m => m.chapelData.type === "physical");

      markersGroup.clearLayers();
      markersGroup.addLayers(nearby);
    });
  });

  // --- START ADORATION (UNCHANGED) ---
  document.getElementById("startAdoration").addEventListener("click", () => {
    const live = chapelData.find(c => c.live === "TRUE" && c.youtube);
    if (live) playChapel(live.youtube);
    else alert("No live adoration stream available.");
  });

  // --- PLEDGE UI (UNCHANGED) ---
  document.getElementById("pledgeButton").addEventListener("click", () => {
    document.getElementById("pledge").classList.toggle("hidden");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  document.getElementById("pledgeForm").addEventListener("submit", e => {
    e.preventDefault();

    const data = new FormData(e.target);

    fetch("https://formspree.io/f/yourFormIDhere", {
      method: "POST",
      body: data
    })
      .then(() => {
        e.target.reset();
        document.getElementById("thanks").classList.remove("hidden");
      })
      .catch(() => alert("Form submission failed."));
  });

  function escapeHTML(str = "") {
    return str.replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m]));
  }
});
