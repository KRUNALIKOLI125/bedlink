import { Hospital, PatientProfile } from '../types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Apollo Grace Trauma & Multi-Specialty',
    address: 'Ring Road 4, Sector 12, Metro Junction',
    distanceKm: 2.8,
    etaMinutes: 8,
    phone: '+91 11 2890 4500',
    emergencyHotline: '108 / Ext 401',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    acceptsPmJay: true,
    traumaLevel: 'Level 1',
    occupancyLoad: 'Moderate',
    rating: 4.8,
    inventory: {
      icuAvailable: 4,
      icuTotal: 24,
      ventilatorAvailable: 3,
      ventilatorTotal: 16,
      oxygenAvailable: 18,
      oxygenTotal: 40,
      regularAvailable: 14,
      regularTotal: 80,
      burnsUnitAvailable: 2,
      cardiacCareAvailable: 5,
      lastUpdatedMinutesAgo: 2, // 🟢 Fresh (< 5 min)
      lastUpdatedTimestamp: Date.now() - 2 * 60 * 1000,
    },
    onDutyDoctors: [
      { specialty: 'ER Chief / Triage', count: 3 },
      { specialty: 'Interventional Cardiology', count: 2 },
      { specialty: 'Intensivist / Critical Care', count: 4 },
      { specialty: 'Neurotrauma Surgeon', count: 1 }
    ]
  },
  {
    id: 'hosp-2',
    name: 'City Civil Medical Institute & Heart Centre',
    address: 'Main Health Expressway, Block B',
    distanceKm: 4.5,
    etaMinutes: 13,
    phone: '+91 11 4567 8900',
    emergencyHotline: '108 / Ext 912',
    coordinates: { lat: 28.6250, lng: 77.2180 },
    acceptsPmJay: true,
    traumaLevel: 'Level 1',
    occupancyLoad: 'High',
    rating: 4.6,
    inventory: {
      icuAvailable: 2,
      icuTotal: 30,
      ventilatorAvailable: 1,
      ventilatorTotal: 20,
      oxygenAvailable: 24,
      oxygenTotal: 50,
      regularAvailable: 8,
      regularTotal: 120,
      burnsUnitAvailable: 0,
      cardiacCareAvailable: 3,
      lastUpdatedMinutesAgo: 4, // 🟢 Fresh
      lastUpdatedTimestamp: Date.now() - 4 * 60 * 1000,
    },
    onDutyDoctors: [
      { specialty: 'Emergency Medicine', count: 4 },
      { specialty: 'Cardiologist', count: 2 },
      { specialty: 'Pulmonologist', count: 1 }
    ]
  },
  {
    id: 'hosp-3',
    name: 'Fortis Super-Specialty Medical Hub',
    address: 'Old Cantonment Road, North Wing',
    distanceKm: 6.2,
    etaMinutes: 16,
    phone: '+91 11 3344 5566',
    emergencyHotline: '011-3344-9999',
    coordinates: { lat: 28.6380, lng: 77.2300 },
    acceptsPmJay: false,
    traumaLevel: 'Level 2',
    occupancyLoad: 'Low',
    rating: 4.9,
    inventory: {
      icuAvailable: 7,
      icuTotal: 20,
      ventilatorAvailable: 5,
      ventilatorTotal: 12,
      oxygenAvailable: 30,
      oxygenTotal: 35,
      regularAvailable: 22,
      regularTotal: 65,
      burnsUnitAvailable: 3,
      cardiacCareAvailable: 6,
      lastUpdatedMinutesAgo: 8, // 🟡 Moderate (5-15m)
      lastUpdatedTimestamp: Date.now() - 8 * 60 * 1000,
    },
    onDutyDoctors: [
      { specialty: 'Trauma Specialist', count: 2 },
      { specialty: 'Anesthesiologist', count: 3 },
      { specialty: 'Burns & Plastic Surgery', count: 2 }
    ]
  },
  {
    id: 'hosp-4',
    name: 'District Memorial Charitable Hospital',
    address: 'Old Bazaar Link Road, Crossway 3',
    distanceKm: 3.2,
    etaMinutes: 11,
    phone: '+91 11 7890 1234',
    emergencyHotline: '102 / Direct',
    coordinates: { lat: 28.6010, lng: 77.2010 },
    acceptsPmJay: true,
    traumaLevel: 'Level 3',
    occupancyLoad: 'Critical',
    rating: 4.1,
    inventory: {
      icuAvailable: 1,
      icuTotal: 15,
      ventilatorAvailable: 0,
      ventilatorTotal: 8,
      oxygenAvailable: 6,
      oxygenTotal: 25,
      regularAvailable: 4,
      regularTotal: 50,
      burnsUnitAvailable: 0,
      cardiacCareAvailable: 1,
      lastUpdatedMinutesAgo: 22, // 🔴 Stale (> 15m) - ranking penalty
      lastUpdatedTimestamp: Date.now() - 22 * 60 * 1000,
    },
    onDutyDoctors: [
      { specialty: 'General Duty Medical Officer', count: 2 },
      { specialty: 'Pediatrician', count: 1 }
    ]
  }
];

export const DEMO_PREFILLED_PROFILE: PatientProfile = {
  id: 'pt-demo-849',
  fullName: 'Ananya Sharma',
  phone: '+91 98765 43210',
  email: 'ananya.s@healthnet.org',
  age: 34,
  gender: 'female',
  bloodGroup: 'O+',
  allergies: ['Penicillin', 'Sulfa Drugs'],
  chronicConditions: ['Mild Asthma', 'Hypertension (Controlled)'],
  emergencyContact: {
    name: 'Vikram Sharma',
    relationship: 'Spouse',
    phone: '+91 98111 22334',
    notifyOnSOS: true
  },
  hasGovScheme: true,
  schemeType: 'PM-JAY',
  schemeId: 'PMJAY-DEL-2024-884920',
  abhaId: '91-4523-8890-1284',
  isAbhaVerified: true,
  privateInsuranceProvider: 'Star Health Allied',
  policyNumber: 'P/0192/MED/2025/44',
  consentEmergencyAccess: true,
  registeredAt: new Date().toISOString(),
  isEmergencyGuest: false,
};

export const MOCK_AMBULANCES = [
  {
    id: 'amb-101',
    vehicleNumber: 'DL-01-EA-4492',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98711 00223',
    type: 'Advanced Life Support (ALS - ICU On Wheels)',
    equipment: ['Ventilator', 'Defibrillator', 'Multi-para Monitor', 'Oxygen Pipeline'],
    status: 'available',
    etaMinutes: 4,
    currentLocation: 'Sector 11 Chowk (1.2 km away)'
  },
  {
    id: 'amb-102',
    vehicleNumber: 'DL-01-EA-8819',
    driverName: 'Mohd. Imran',
    driverPhone: '+91 98223 44556',
    type: 'Basic Life Support (BLS + Oxygen)',
    equipment: ['Oxygen Cylinder', 'Spine Board', 'Suction Machine'],
    status: 'available',
    etaMinutes: 7,
    currentLocation: 'Outer Ring Expressway (3.1 km away)'
  },
  {
    id: 'amb-103',
    vehicleNumber: 'DL-02-TX-1092',
    driverName: 'Sukhwinder Singh',
    driverPhone: '+91 99100 88221',
    type: 'Neonatal / Pediatric ICU Ambulance',
    equipment: ['Transport Incubator', 'Pediatric Ventilator'],
    status: 'dispatched',
    etaMinutes: 12,
    currentLocation: 'Enroute Civil Hospital'
  }
];
