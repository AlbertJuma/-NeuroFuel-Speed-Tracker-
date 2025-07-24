// Constants and Variables
let watchId = null;
let positions = [];
let totalDistance = 0; // in meters
let startTime = null;
let elapsedTime = 0; // in seconds
let kmSplits = [];
let distanceUnit = "km"; // "km" or "m"
let map, polyline;

// DOM Elements
const distanceElem = document.getElementById("distance");
const currentSpeedElem = document.getElementById("current-speed");
const totalTimeElem = document.getElementById("total-time");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const saveSessionBtn = document.getElementById("save-session-btn");
const sessionNotesElem = document.getElementById("session-notes");
const sessionHistoryElem = document.getElementById("session-history");
const unitToggleBtn = document.getElementById("unit-toggle");
const mapElem = document.getElementById("map");

// Utility Functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const calculateDistance = (pos1, pos2) => {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(pos2.latitude - pos1.latitude);
  const dLon = toRad(pos2.longitude - pos1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pos1.latitude)) *
      Math.cos(toRad(pos2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const updateDisplay = () => {
  const dist = distanceUnit === "km" ? (totalDistance / 1000).toFixed(2) : totalDistance.toFixed(0);
  distanceElem.textContent = `${dist} ${distanceUnit}`;
  totalTimeElem.textContent = formatTime(elapsedTime);
};

const playBeep = () => {
  const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
  audio.play();
};

// Geolocation Handling
const onPositionUpdate = (pos) => {
  const { latitude, longitude, speed } = pos.coords;

  if (positions.length > 0) {
    const prevPos = positions[positions.length - 1];
    const distance = calculateDistance(prevPos, pos.coords);

    if (distance > 1) { // Filter small GPS drift
      totalDistance += distance;
      positions.push(pos.coords);

      // Update map
      const latLng = [latitude, longitude];
      polyline.addLatLng(latLng);
      map.setView(latLng, 16);

      // Handle 1 km split
      if (Math.floor(totalDistance / 1000) > kmSplits.length) {
        const splitTime = elapsedTime;
        const avgSpeed = ((1000 / (splitTime - (kmSplits[kmSplits.length - 1] || 0))) * 3.6).toFixed(2);
        playBeep();
        alert(`1 km completed! Time: ${formatTime(splitTime)}, Avg Speed: ${avgSpeed} km/h`);
        kmSplits.push(splitTime);
      }
    }
  } else {
    positions.push(pos.coords);
  }

  currentSpeedElem.textContent = `${(speed * 3.6 || 0).toFixed(2)} km/h`;
  updateDisplay();
};

const onError = (err) => {
  console.error("Geolocation error:", err);
  alert("Error accessing geolocation. Please ensure GPS is enabled.");
};

// Start Tracking
const startTracking = () => {
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(onPositionUpdate, onError, {
      enableHighAccuracy: true,
    });
    startTime = Date.now();
    elapsedTime = 0;
    totalDistance = 0;
    positions = [];
    kmSplits = [];
    polyline.setLatLngs([]);
    startBtn.disabled = true;
    stopBtn.disabled = false;
    saveSessionBtn.disabled = true;

    // Timer
    const timer = setInterval(() => {
      if (!watchId) clearInterval(timer);
      elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      updateDisplay();
    }, 1000);
  } else {
    alert("Geolocation is not supported by your browser.");
  }
};

// Stop Tracking
const stopTracking = () => {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    saveSessionBtn.disabled = false;
  }
};

// Save Session
const saveSession = () => {
  const sessionData = {
    date: new Date().toLocaleString(),
    distance: totalDistance,
    time: elapsedTime,
    splits: kmSplits,
    notes: sessionNotesElem.value,
    path: positions,
  };

  const history = JSON.parse(localStorage.getItem("neurofuel_sessions")) || [];
  history.push(sessionData);
  localStorage.setItem("neurofuel_sessions", JSON.stringify(history));

  loadHistory();
  alert("Session saved!");
};

// Load History
const loadHistory = () => {
  const history = JSON.parse(localStorage.getItem("neurofuel_sessions")) || [];
  sessionHistoryElem.innerHTML = history
    .map(
      (session, idx) =>
        `<li>Session #${idx + 1} — ${session.date} — ${(
          session.distance / 1000
        ).toFixed(2)} km in ${formatTime(session.time)}</li>`
    )
    .join("");
};

// Clear History
const clearHistory = () => {
  localStorage.removeItem("neurofuel_sessions");
  loadHistory();
};

// Initialize Map
const initMap = () => {
  map = L.map("map").setView([51.505, -0.09], 13); // Default center
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  polyline = L.polyline([], { color: "blue" }).addTo(map);
};

// Event Listeners
startBtn.addEventListener("click", startTracking);
stopBtn.addEventListener("click", stopTracking);
saveSessionBtn.addEventListener("click", saveSession);
unitToggleBtn.addEventListener("click", () => {
  distanceUnit = distanceUnit === "km" ? "m" : "km";
  unitToggleBtn.textContent = `Switch to ${distanceUnit === "km" ? "meters" : "kilometers"}`;
  updateDisplay();
});
document.getElementById("clear-history-btn").addEventListener("click", clearHistory);

// Initialize App
window.addEventListener("load", () => {
  initMap();
  loadHistory();
});