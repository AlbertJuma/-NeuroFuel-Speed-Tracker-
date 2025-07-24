// Variables
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
const speedElem = document.getElementById("speed");
const timeElem = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const saveBtn = document.getElementById("save-btn");
const notesElem = document.getElementById("notes");
const historyList = document.getElementById("history-list");
const unitToggle = document.getElementById("unit-toggle");

// Utility Functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const calculateDistance = (pos1, pos2) => {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(pos2.latitude - pos1.latitude);
  const dLon = toRad(pos2.longitude - pos1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pos1.latitude)) *
      Math.cos(toRad(pos2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const playBeep = () => {
  const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
  audio.play();
};

// Initialize Map
const initMap = () => {
  map = L.map("map").setView([0, 0], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
  polyline = L.polyline([], { color: "blue" }).addTo(map);
};

// Start Tracking
const startTracking = () => {
  // Your implementation here
};

// Stop Tracking
const stopTracking = () => {
  // Your implementation here
};

// Save Session
const saveSession = () => {
  // Your implementation here
};

// Clear History
const clearHistory = () => {
  localStorage.removeItem("neurofuel_sessions");
  loadHistory();
};

// Load History
const loadHistory = () => {
  // Your implementation here
};

// Event Listeners
startBtn.addEventListener("click", startTracking);
stopBtn.addEventListener("click", stopTracking);
saveBtn.addEventListener("click", saveSession);
unitToggle.addEventListener("click", () => {
  distanceUnit = distanceUnit === "km" ? "m" : "km";
  unitToggle.textContent = `Switch to ${distanceUnit === "km" ? "meters" : "kilometers"}`;
});

// Initialize App
window.addEventListener("load", () => {
  initMap();
  loadHistory();
});
