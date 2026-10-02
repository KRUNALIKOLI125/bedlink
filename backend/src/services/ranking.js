export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function rankHospitals({ needs, lat, lng, schemePreferred }, hospitals) {
  const now = Date.now();

  return hospitals
    // 1. Hard filter: must have every needed bed type
    .filter((h) => needs.every((n) => (h.beds[n] || 0) > 0))
    .map((h) => {
      const km = distanceKm(lat, lng, h.lat, h.lng);
      const etaMin = Math.round((km / 30) * 60); // assumes 30 km/h in the city
      const minutesOld = Math.round((now - h.updatedAt) / 60000);

      // each factor is 0 to 1 (higher is better)
      const bedScore = Math.min(1, Math.min(...needs.map((n) => h.beds[n])) / 2);
      const etaScore = Math.max(0, 1 - etaMin / 60);
      const freshScore = Math.max(0.1, 1 - minutesOld / 30);
      const loadScore = 1 - h.load;

      let score =
        100 *
        (0.25 * bedScore +
          0.3 * etaScore +
          0.2 * freshScore +
          0.1 * loadScore +
          0.15 * h.trust);

      // soft boost only, never hides other hospitals
      if (schemePreferred && ["government", "charitable"].includes(h.scheme)) {
        score += 8;
      }

      return {
        id: h.id,
        name: h.name,
        scheme: h.scheme,
        beds: h.beds,
        etaMin,
        distanceKm: Math.round(km * 10) / 10,
        minutesOld,
        freshness: minutesOld < 5 ? "green" : minutesOld <= 15 ? "yellow" : "red",
        load: h.load,
        trust: h.trust,
        score: Math.round(score * 10) / 10,
      };
    })
    .sort((a, b) => b.score - a.score);
}