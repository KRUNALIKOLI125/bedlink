import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { hospitals } from "./data/mock.js";
import { rankHospitals } from "./services/ranking.js";
import { resetDemo } from "./services/simulate.js";
import { startRequest, respond, requests, markArrived } from "./services/hold.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 1. Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// 2. List hospitals with "minutes old"
app.get("/api/hospitals", (req, res) => {
  const now = Date.now();
  res.json(hospitals.map(h => ({
    ...h,
    minutesOld: Math.round((now - h.updatedAt) / 60000),
  })));
});

// 3. Nurse updates a bed count
app.post("/api/beds/update", (req, res) => {
  const { hospitalId, bedType, count } = req.body;
  const h = hospitals.find(x => x.id === hospitalId);
  if (!h) return res.status(404).json({ error: "Hospital not found" });
  if (!(bedType in h.beds)) return res.status(400).json({ error: "Unknown bed type" });
  if (!Number.isInteger(count) || count < 0) return res.status(400).json({ error: "Invalid count" });

  h.beds[bedType] = count;
  h.updatedAt = Date.now();
  io.emit("beds:changed", { hospitalId, bedType, count, updatedAt: h.updatedAt });
  res.json({ ok: true, hospital: h });
});

app.post("/api/requests", (req, res) => {
  const { needs, lat, lng, schemePreferred = false } = req.body;
  if (!Array.isArray(needs) || needs.length === 0)
    return res.status(400).json({ error: "needs must be a non-empty array" });
  if (typeof lat !== "number" || typeof lng !== "number")
    return res.status(400).json({ error: "lat and lng must be numbers" });

  res.json({ ranked: rankHospitals({ needs, lat, lng, schemePreferred }, hospitals) });
});

app.post("/api/requests/start", (req, res) => {
  const { needs, lat, lng, schemePreferred = false } = req.body;
  if (!Array.isArray(needs) || needs.length === 0)
    return res.status(400).json({ error: "needs must be a non-empty array" });
  const r = startRequest(io, { needs, lat, lng, schemePreferred });
  res.json({ id: r.id, status: r.status, offer: r.offer });
});

app.get("/api/requests/:id", (req, res) => {
  const r = requests.find((x) => x.id === Number(req.params.id));
  if (!r) return res.status(404).json({ error: "Not found" });
  res.json({ id: r.id, status: r.status, offer: r.offer });
});

app.post("/api/requests/:id/accept", (req, res) => {
  const r = respond(io, Number(req.params.id), true);
  if (!r) return res.status(400).json({ error: "No open offer" });
  res.json({ id: r.id, status: r.status, offer: r.offer });
});

app.post("/api/requests/:id/reject", (req, res) => {
  const r = respond(io, Number(req.params.id), false);
  if (!r) return res.status(400).json({ error: "No open offer" });
  res.json({ id: r.id, status: r.status, offer: r.offer });
});

app.post("/api/simulate/reset", (req, res) => {
  resetDemo(io);
  res.json({ ok: true });
});

app.post("/api/simulate/request", (req, res) => {
  const needs = req.body?.needs || ["VENTILATOR"];
  const r = startRequest(io, { needs, lat: 19.07, lng: 72.87, schemePreferred: false });
  res.json({ id: r.id, status: r.status, offer: r.offer, ranked: r.ranked });
});

app.post("/api/requests/:id/arrived", (req, res) => {
  const { bedReady } = req.body;
  if (typeof bedReady !== "boolean")
    return res.status(400).json({ error: "bedReady must be true or false" });

  const result = markArrived(io, Number(req.params.id), bedReady);
  if (!result) return res.status(400).json({ error: "Request must be HELD and not already completed" });

  res.json({
    status: result.request.status,
    hospital: result.hospital.name,
    newTrust: result.hospital.trust,
  });
});

server.listen(4000, () => console.log("BedLink API running on port 4000"));