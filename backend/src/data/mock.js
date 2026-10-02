export const hospitals = [
  { id: 1, name: "City General", lat: 19.076, lng: 72.8777, scheme: "government",
    beds: { ICU: 2, VENTILATOR: 1, OXYGEN: 5, CARDIAC: 1, BURNS: 0 }, updatedAt: Date.now(), load: 0.7, trust: 0.9, },
  { id: 2, name: "Lifeline Hospital", lat: 19.0896, lng: 72.8656, scheme: "private",
    beds: { ICU: 1, VENTILATOR: 0, OXYGEN: 3, CARDIAC: 2, BURNS: 1 }, updatedAt: Date.now(), load: 0.4, trust: 0.6, },
  { id: 3, name: "Trust Care Centre", lat: 19.033, lng: 72.857, scheme: "charitable",
    beds: { ICU: 0, VENTILATOR: 2, OXYGEN: 4, CARDIAC: 0, BURNS: 0 }, updatedAt: Date.now(), load: 0.2, trust: 0.8, },
];