import { hospitals } from "../data/mock.js";
import { rankHospitals } from "./ranking.js";

export const requests = [];
const OFFER_SECONDS = 120; // change to 120 later

export function startRequest(io, { needs, lat, lng, schemePreferred }) {
  const ranked = rankHospitals({ needs, lat, lng, schemePreferred }, hospitals);
  const request = {
    id: requests.length + 1, needs, ranked,
    nextIndex: 0, status: "SEARCHING", offer: null, timer: null,
  };
  requests.push(request);
  offerNext(io, request);
  return request;
}

function offerNext(io, request) {
  if (request.nextIndex >= request.ranked.length) {
    request.status = "NO_HOSPITAL";
    request.offer = null;
    io.emit("request:status", { requestId: request.id, status: request.status });
    return;
  }
  const h = request.ranked[request.nextIndex++];
  request.status = "OFFERED";
  request.offer = {
    hospitalId: h.id, hospitalName: h.name,
    deadline: Date.now() + OFFER_SECONDS * 1000, status: "OFFERED",
  };
  io.emit("offer:new", { requestId: request.id, ...request.offer });

  // if no answer in time, mark TIMED_OUT and offer the next hospital
  request.timer = setTimeout(() => {
    if (request.offer && request.offer.status === "OFFERED") {
      request.offer.status = "TIMED_OUT";
      io.emit("offer:update", { requestId: request.id, ...request.offer });
      offerNext(io, request);
    }
  }, OFFER_SECONDS * 1000);
}

export function respond(io, requestId, accept) {
  const request = requests.find((r) => r.id === requestId);
  if (!request || !request.offer || request.offer.status !== "OFFERED") return null;

  clearTimeout(request.timer);
  if (accept) {
    const h = hospitals.find((x) => x.id === request.offer.hospitalId);
    request.needs.forEach((n) => { if (h.beds[n] > 0) h.beds[n]--; }); // hold the bed
    h.updatedAt = Date.now();
    request.offer.status = "ACCEPTED";
    request.status = "HELD";
    io.emit("offer:update", { requestId: request.id, ...request.offer });
    io.emit("request:status", { requestId: request.id, status: request.status });
  } else {
    request.offer.status = "REJECTED";
    io.emit("offer:update", { requestId: request.id, ...request.offer });
    offerNext(io, request);
  }
  return request;
}

export function markArrived(io, requestId, bedReady) {
  const request = requests.find((r) => r.id === requestId);
  if (!request || request.status !== "HELD" || request.arrived) return null;

  const h = hospitals.find((x) => x.id === request.offer.hospitalId);
  if (bedReady) {
    h.trust = Math.min(1, Math.round((h.trust + 0.05) * 100) / 100);
  } else {
    h.trust = Math.max(0, Math.round((h.trust - 0.2) * 100) / 100);
  }
  request.arrived = true;
  request.status = "COMPLETED";
  io.emit("request:status", { requestId: request.id, status: request.status });
  return { request, hospital: h };
}