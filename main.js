// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
  let map;
  let chapelData = [];

  // Load CSV and create map
  fetch("Adorationchapels.csv")
    .then(r => r.text())
    .then(text => {
      const parsed = Papa.parse(text, { header: true }).data;
      chapelData = parsed;
      initMap(parsed);
    })
    .catch(err => console.error("CSV load error:", err));

  // Initialize Leaflet map
  function initMap(chapels) {
   var map = L.map("map", { scrollWheelZoom: true }).setView([20, 0], 2);

    // Light parchment tile style
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors & Carto",
      maxZoom: 18
    }).addTo(map);

    /* MAP MARKERS */
markers.addLayer(
L.marker([51.088191,-114.196839]).bindPopup(`
<h3>Sisters of Divine Mercy, Calgary CA</h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=1OR9c5YtRco')">
Watch Live Adoration
</button>
`)
);

markers.addLayer(
L.marker([27.211164594068823, -98.12618571688884]).bindPopup(`
<h3>Shalom World, Edinburg TX, USA</h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=GlGkFWPKomU')">
Watch Live Adoration
</button>
`)
);

markers.addLayer(
L.marker([33.533602,-86.675057]).bindPopup(`
<h3>EWTN Chapel, Irondale AL, USA</h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=l30JmRRGQQI')">
Watch Live Adoration
</button>
`)
  );

markers.addLayer(
L.marker([-37.848311,145.096218]).bindPopup(`
<h3>St Benedicts Burwood, Australia</h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=qz8YE61BoXM')">
Watch Live Adoration
</button>
`)
);

markers.addLayer(
L.marker([52.202124,20.419678]).bindPopup(`
<h3>Monastery of the Immaculate Conception of the Order of Friars Minor Conventual, Paprotnia Poland</h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=bIR18Pvy11U')">
Watch Live Adoration
</button>
`)
  );

markers.addLayer(
L.marker([51.51272175784455, -0.16690941632605502]).bindPopup(`
<h3>Tyburn Convent, London UK</h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=YbxI_Vd97H4')">
Watch Live Adoration
</button>
`)
  );

markers.addLayer(
L.marker([44.34934717811221, 13.014269026323799]).bindPopup(`
<h3>Maria Vision, Rome Italy</h3>
<button onclick="playChapel('https://1601580044.rsc.cdn77.org/live/_jcn_/amlst:Mariavision/master.m3u8')">
Watch Live Adoration
</button>
`)
  );
  
markers.addLayer(
L.marker([1.2967181988001202, 103.85090453422588]).bindPopup(`
<h3>Cathedral of the Good Shepherd, Singapore</h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=g8sUK4RNIEg')">
Watch Live Adoration
</button>
`)
  );


markers.addLayer(
L.marker([39.81915886003033, -5.163416274606668]).bindPopup(`
<h3>Ermita de Nuestra Señora de Bienvenida-Alcolea, Toledo Spain </h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=YTWA-eUZzJQ')">
Watch Live Adoration
</button>
`)
  );
  
 markers.addLayer(
 L.marker([40.41343862264555, -74.10332138991909]).bindPopup(`
<h3>St Mary Mother of God Church, Middletown NJ, USA </h3>
<button onclick="playChapel('https://www.youtube.com/watch?v=TIu6DyLTWLQ')">
Watch Live Adoration
</button>
`)
);

  
markers.addLayer(
 L.marker([48.32946693286068, 18.084085010485204]).bindPopup(`
<h3>Servants of the Holy Spirit of Perpetual Adoration, Nitra Slovakia </h3>
<button onclick="playChapel('https://apps.csweb.sk/sspsap/')">
Watch Live Adoration
</button>
`)
  );


    chapels.forEach(c => {
      if (!c.latitude || !c.longitude) return;
      const icon = c.live === "TRUE" ? "🕯️" : "⛪";
      const marker = L.marker([c.latitude, c.longitude]).addTo(map);

      const popup = `
        <b>${icon} ${c.name}</b><br>
        ${c.city}, ${c.country}<br><br>
        <button class="watch" onclick="openStream('${c.youtube}')">Watch Live</button>
      `;
      marker.bindPopup(popup);
    });
  }

  // Find Chapel Near Me
  document.getElementById("findChapel").addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 8);
        L.circle([latitude, longitude], { radius: 2000, color: "#B59B6A" }).addTo(map);
      },
      () => alert("Location permission denied.")
    );
  });

  // Start Adoration Now → pick first live chapel
  document.getElementById("startAdoration").addEventListener("click", () => {
    const live = chapelData.find(c => c.live === "TRUE");
    if (live) openStream(live.youtube);
    else alert("No live adoration stream available right now.");
  });

  // Pledge Hour toggle section
  document.getElementById("pledgeButton").addEventListener("click", () => {
    document.getElementById("pledge").classList.toggle("hidden");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // Pledge form handler (Formspree placeholder)
  document.getElementById("pledgeForm").addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(e.target);
    fetch("https://formspree.io/f/yourFormIDhere", { method: "POST", body: data })
      .then(() => {
        e.target.reset();
        document.getElementById("thanks").classList.remove("hidden");
      })
      .catch(() =>
        alert("Form could not be submitted. Replace Formspree URL with your actual endpoint.")
      );
  });
});

// Global (simple) modal controls
function openStream(url) {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("adorationFrame");
  const embedUrl = url
  .replace("watch?v=", "embed/")
  .replace("youtu.be/", "www.youtube.com/embed/");
 frame.src = embedUrl + "?autoplay=1";

  modal.style.display = "flex";

  document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
    frame.src = "";
  };

  window.onclick = e => {
    if (e.target === modal) {
      modal.style.display = "none";
      frame.src = "";
    }
  };
}
