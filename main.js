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
  frame.src = url + "?autoplay=1";
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
