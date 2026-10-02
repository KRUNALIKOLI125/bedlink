export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export type SchemeType = 'PM-JAY' | 'State Cashless' | 'Private Insurance' | 'None';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  notifyOnSOS: boolean;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup: BloodGroup;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: EmergencyContact;
  hasGovScheme: boolean;
  schemeType: SchemeType;
  schemeId?: string;
  abhaId?: string;
  isAbhaVerified: boolean;
  privateInsuranceProvider?: string;
  policyNumber?: string;
  consentEmergencyAccess: boolean;
  registeredAt: string;
  isEmergencyGuest?: boolean;
}

export interface HospitalBedInventory {
  icuAvailable: number;
  icuTotal: number;
  ventilatorAvailable: number;
  ventilatorTotal: number;
  oxygenAvailable: number;
  oxygenTotal: number;
  regularAvailable: number;
  regularTotal: number;
  burnsUnitAvailable: number;
  cardiacCareAvailable: number;
  lastUpdatedMinutesAgo: number; // For 🟢 <5m, 🟡 5-15m, 🔴 >15m
  lastUpdatedTimestamp: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  etaMinutes: number;
  phone: string;
  emergencyHotline: string;
  coordinates: { lat: number; lng: number };
  inventory: HospitalBedInventory;
  acceptsPmJay: boolean;
  traumaLevel: 'Level 1' | 'Level 2' | 'Level 3';
  occupancyLoad: 'Low' | 'Moderate' | 'High' | 'Critical';
  rating: number;
  onDutyDoctors: {
    specialty: string;
    count: number;
  }[];
}

export interface TriageRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  bloodGroup: BloodGroup;
  primaryCondition: string;
  needsIcu: boolean;
  needsVentilator: boolean;
  needsOxygen: boolean;
  needsCardiac: boolean;
  needsBurns: boolean;
  needsPediatric: boolean;
  selectedHospitalId?: string;
  status: 'idle' | 'searching' | 'holding' | 'confirmed' | 'rejected' | 'rerouting';
  holdExpiresAt?: number; // 2-minute SLA timestamp
  timeRemainingSeconds?: number;
  ambulanceAssigned?: {
    id: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    etaMinutes: number;
  };
  rejectionReason?: string;
}

export interface NurseSession {
  nurseId: string;
  name: string;
  badgeNumber: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  shift: 'Morning' | 'Evening' | 'Night Emergency';
}

export interface DriverSession {
  driverId: string;
  name: string;
  phone: string;
  badgeNumber: string;
  vehicleNumber: string;
  ambulanceType: string;
  baseStation: string;
  status: 'available' | 'dispatched' | 'patient_onboard' | 'arrived_hospital';
  currentEtaMinutes: number;
}

export interface UserFeedback {
  id: string;
  requestId: string;
  submittedBy: 'patient' | 'ambulance_crew';
  rating: number; // 1-5
  bedMatchAccuracy: number;
  timeToConfirmationSeconds: number;
  comments: string;
  timestamp: string;
}

export type AppRole =
  | 'gateway_auth'
  | 'patient_onboarding'
  | 'patient_portal'
  | 'nurse_dashboard'
  | 'ambulance_dispatch'
  | 'government_portal';
