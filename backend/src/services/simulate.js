import { hospitals } from "../data/mock.js";
import { requests } from "./hold.js";

// copy of the starting data
const seed = JSON.parse(JSON.stringify(hospitals));

export function resetDemo(io) {
  const ageMinutes = [0, 8, 20]; // fresh, a bit old, stale (shows green, yellow, red)
  seed.forEach((s, i) => {
    const h = hospitals.find((x) => x.id === s.id);
    h.beds = { ...s.beds };
    h.load = s.load;
    h.trust = s.trust;
    h.updatedAt = Date.now() - (ageMinutes[i] || 0) * 60000;
  });
  requests.forEach((r) => clearTimeout(r.timer)); // stop old timers
  requests.length = 0;
  io.emit("demo:reset");
}