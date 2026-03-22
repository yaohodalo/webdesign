document.addEventListener("DOMContentLoaded", () => {
  let map;
  let chapelData = [];
  let player;
  let allMarkers = [];
  let markersGroup;

  // Initialize video.js AFTER DOM is ready
  player = videojs("adorationVideo");

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

    physicalChapels.forEach(c => {
   const marker = L.marker([c.lat, c.lng]);

  marker.chapelData = {
    name: c.name,
    city: c.city,
    country: c.country,
    type: "physical"
  };

  marker.bindPopup(`
    <b>⛪ ${c.name}</b><br>
    ${c.city}, ${c.country}<br><br>
    In-person Adoration
  `);

  allMarkers.push(marker);
  markersGroup.addLayer(marker);
});


    const nearby = allMarkers
  .filter(m => m.chapelData.type === "physical") // ✅ ONLY physical
  .slice(0, 20);

markersGroup.clearLayers();
markersGroup.addLayers(nearby);
    

    // --- CLUSTER GROUP (FIXED + IMPROVED) ---
    const markers = L.markerClusterGroup({
      maxClusterRadius: 50,
      disableClusteringAtZoom: 12,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    map.addLayer(markers);

    const markerList = [];

    // --- JITTER FUNCTION (prevents exact overlap) ---
    function jitter(val) {
      return val + (Math.random() - 0.5) * 0.0005;
    }

    // --- FEATURED CHAPELS ---
    featuredChapels.forEach(c => {
      const marker = L.marker([jitter(c.lat), jitter(c.lng)]);

      marker.bindPopup(`
        <b>🕯️ ${c.name}</b><br>
        ${c.city}, ${c.country}<br><br>
        <button onclick="playChapel('${c.stream}')">
          Watch Live Adoration
        </button>
      `);

      markerList.push(marker);
    });

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

    // --- CSV CHAPELS ---
    csvChapels.forEach(c => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const icon = c.live === "TRUE" ? "🕯️" : "⛪";

      const marker = L.marker([jitter(lat), jitter(lng)]);

      marker.bindPopup(`
        <b>${icon} ${escapeHTML(c.name)}</b><br>
        ${escapeHTML(c.city)}, ${escapeHTML(c.country)}<br><br>
        ${
          c.youtube
            ? `<button onclick="playChapel('${c.youtube}')">Watch Live</button>`
            : "No stream available"
        }
      `);

      markerList.push(marker);
    });

    // Add ALL markers to cluster
    markers.addLayers(markerList);

    // Auto-fit map to markers
    if (markerList.length) {
      const group = new L.featureGroup(markerList);
      map.fitBounds(group.getBounds());
    }
  }

  // --- VIDEO PLAYER ---
  window.playChapel = function (stream) {
    const modal = document.getElementById("videoModal");
    const video = document.getElementById("adorationVideo");
    const frame = document.getElementById("adorationFrame");

    modal.style.display = "block";
    stream = stream.trim();

    // --- YOUTUBE ---
    if (/youtube\.com|youtu\.be/.test(stream)) {
      video.style.display = "none";
      frame.style.display = "block";

      let id = "";

      if (stream.includes("watch?v=")) {
        id = stream.split("watch?v=")[1];
      } else if (stream.includes("youtu.be/")) {
        id = stream.split("youtu.be/")[1];
      }

      if (id && id.includes("&")) {
        id = id.split("&")[0];
      }

      frame.src = "https://www.youtube.com/embed/" + id + "?autoplay=1";
    }

    // --- HLS (.m3u8) ---
    else if (stream.includes(".m3u8")) {
      frame.style.display = "none";
      video.style.display = "block";

      player.src({
        src: stream,
        type: "application/x-mpegURL"
      });

      player.play();
    }

    // --- DEFAULT (iframe/embed/webcam) ---
    else {
      video.style.display = "none";
      frame.style.display = "block";
      frame.src = stream;
    }

    // --- CLOSE MODAL ---
    document.getElementById("closeModal").onclick = () => {
      modal.style.display = "none";
      frame.src = "";
      player.pause();
    };

    window.onclick = e => {
      if (e.target === modal) {
        modal.style.display = "none";
        frame.src = "";
        player.pause();
      }
    };
  };

  // --- FIND USER LOCATION ---
  document.getElementById("findChapel").addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;

      map.setView([latitude, longitude], 8);

      L.circle([latitude, longitude], {
        radius: 5000,
        color: "#B59B6A"
      }).addTo(map);
    });
  });

  // --- START ADORATION (FIRST LIVE) ---
  document.getElementById("startAdoration").addEventListener("click", () => {
    const live = chapelData.find(c => c.live === "TRUE" && c.youtube);
    if (live) playChapel(live.youtube);
    else alert("No live adoration stream available.");
  });

  // --- PLEDGE UI ---
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

  document.getElementById("searchInput").addEventListener("input", e => {
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

  // --- BASIC SANITIZER ---
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
