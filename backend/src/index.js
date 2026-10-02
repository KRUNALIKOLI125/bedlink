import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { hospitals } from "./data/mock.js";

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

server.listen(4000, () => console.log("BedLink API running on port 4000"));