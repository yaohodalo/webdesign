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

  let userStopped = false;

  music.volume = 0.35;

  music.play().catch(() => {});

  musicBtn.innerText = "⏸ Music";

  document.addEventListener("click", (e) => {
    if (e.target.closest("#musicToggle")) return;

    if (!music.paused && !userStopped) {
      fadeOutMusic();
      userStopped = true;
      musicBtn.innerText = "🎵 Resume";
    }
  }, { once: true });

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
    chapelData.forEach(c => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      addMarker(lat, lng, {
        name: c.name,
        city: c.city,
        country: c.country,
        type: "virtual"
      }, `
        <b>${c.name}</b><br>
        ${c.city}, ${c.country}<br><br>
        ${
          c.youtube
            ? `<button onclick="playChapel('${c.youtube}')">Watch Live Adoration</button>`
            : "No stream available"
        }
      `);
    });

    /* PHYSICAL */
    physicalChapels.forEach(c => {
      addMarker(c.lat, c.lng, { ...c, type: "physical" }, `
        <b>⛪ ${c.name}</b><br>
        ${c.city}, ${c.country}<br><br>
        In-person Eucharistic Adoration
      `);
    });

    markersGroup.addLayers(markerList);

    if (markerList.length) {
      map.fitBounds(new L.featureGroup(markerList).getBounds());
    }
  }

  /* ================= SEARCH ================= */

  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();

    allMarkers.forEach(m => {
      const d = m.chapelData;
      const match =
        d.name?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q) ||
        d.country?.toLowerCase().includes(q);

      m.setOpacity(match ? 1 : 0.2);
    });
  });

  /* ================= NEARBY ================= */

  document.getElementById("findChapel").onclick = () => {
    navigator.geolocation.getCurrentPosition(pos => {

      const { latitude, longitude } = pos.coords;

      map.setView([latitude, longitude], 10);

      const nearby = allMarkers.filter(m => {
        if (m.chapelData.type !== "physical") return false;

        const p = m.getLatLng();
        return getDistance(latitude, longitude, p.lat, p.lng) < 50;
      });

      markersGroup.clearLayers();
      markersGroup.addLayers(nearby);

    });
  };

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* ================= START BUTTON ================= */

  document.getElementById("startAdoration").onclick = () => {
    const streams = [
      ...featuredChapels.map(c => c.stream),
      ...chapelData.map(c => c.youtube).filter(Boolean)
    ];

    if (!streams.length) return alert("No adoration available");

    const random = streams[Math.floor(Math.random() * streams.length)];
    playChapel(random);
  };

});

/* ================= GLOBAL PLAYER ================= */

window.playChapel = function (stream) {

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
