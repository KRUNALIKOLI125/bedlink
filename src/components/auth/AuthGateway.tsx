import React, { useState } from 'react';
import { Hospital, PatientProfile, NurseSession, DriverSession } from '../../types';
import { DEMO_PREFILLED_PROFILE, MOCK_AMBULANCES } from '../../data/mockData';
import { feedback } from '../../utils/audioHaptics';
import {
  HeartPulse,
  User,
  Stethoscope,
  Ambulance,
  ShieldAlert,
  Zap,
  Phone,
  ArrowRight,
  Sparkles,
  Building2,
  Lock
} from 'lucide-react';

interface AuthGatewayProps {
  hospitals: Hospital[];
  onEmergencyBypass: () => void;
  onPatientSelect: (profile?: PatientProfile) => void;
  onNurseLogin: (nurse: NurseSession) => void;
  onDriverLogin: (driver: DriverSession) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  hospitals,
  onEmergencyBypass,
  onPatientSelect,
  onNurseLogin,
  onDriverLogin
}) => {
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0].id);
  const [nurseBadge, setNurseBadge] = useState('NR-4481');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(MOCK_AMBULANCES[0].id);
  const [driverBadge, setDriverBadge] = useState('DRV-5509');

  const handleNurseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedback.success();
    const hosp = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
    const session: NurseSession = {
      nurseId: nurseBadge,
      name: nurseBadge === 'NR-4481' ? 'Sr. Priya Nair' : 'Nurse ' + nurseBadge,
      badgeNumber: nurseBadge,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      department: 'ER & ICU Desk',
      shift: 'Night Emergency'
    };
    onNurseLogin(session);
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedback.success();
    const amb = MOCK_AMBULANCES.find((a) => a.id === selectedAmbulanceId) || MOCK_AMBULANCES[0];
    const session: DriverSession = {
      driverId: driverBadge,
      name: amb.driverName || 'Driver ' + driverBadge,
      phone: amb.driverPhone,
      badgeNumber: driverBadge,
      vehicleNumber: amb.vehicleNumber,
      ambulanceType: amb.type,
      baseStation: '108 Depot Sector 11',
      status: 'available',
      currentEtaMinutes: amb.etaMinutes
    };
    onDriverLogin(session);
  };

  return (
    <div className="w-full space-y-5">
      {/* Emergency Bypass Banner */}
      <div className="bg-rose-600 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-white">Emergency Zero-Registration Bypass</h2>
              <span className="text-[10px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded">
                CRITICAL
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-1 max-w-2xl leading-normal">
              Skip authentication for cardiac, stroke, or severe trauma to instantly locate open ICU beds and dispatch nearest ambulance.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            feedback.emergency();
            onEmergencyBypass();
          }}
          className="whitespace-nowrap px-5 py-2.5 bg-white hover:bg-rose-50 text-rose-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Zap className="w-4 h-4 fill-rose-600 text-rose-600" />
          <span>Instant Emergency Bypass</span>
        </button>
      </div>

      {/* 3-Column Portal Grid - Fills desktop width cleanly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {/* Card 1: Patient Portal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Port 01</span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Patient Triage Portal</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check hospital beds, verify PM-JAY scheme, and request emergency bed hold.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-2.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                feedback.tap();
                onPatientSelect();
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Register New Patient</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                feedback.success();
                onPatientSelect(DEMO_PREFILLED_PROFILE);
              }}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>1-Tap Demo: Ananya (O+, PM-JAY)</span>
            </button>
          </div>
        </div>

        {/* Card 2: ER Nurse Triage Desk */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          <form onSubmit={handleNurseSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Port 02</span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Nurse 10-Second Desk</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update ICU & ventilator counts in real-time and review incoming ambulances.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700">Hospital</label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Badge ID</label>
                <input
                  type="text"
                  value={nurseBadge}
                  onChange={(e) => setNurseBadge(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleNurseSubmit}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Launch Nurse Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                feedback.success();
                const session: NurseSession = {
                  nurseId: 'NR-4481',
                  name: 'Sr. Priya Nair',
                  badgeNumber: 'NR-4481',
                  hospitalId: hospitals[0].id,
                  hospitalName: hospitals[0].name,
                  department: 'Emergency & Critical Care ICU',
                  shift: 'Night Emergency'
                };
                onNurseLogin(session);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>1-Tap Demo: Apollo Grace ER</span>
            </button>
          </div>
        </div>

        {/* Card 3: Ambulance EMT Crew */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          <form onSubmit={handleDriverSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Ambulance className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Port 03</span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Ambulance EMT Crew</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Golden-hour timer, route navigation, and transit vitals telemetry.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700">Ambulance Unit</label>
                <select
                  value={selectedAmbulanceId}
                  onChange={(e) => setSelectedAmbulanceId(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {MOCK_AMBULANCES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.vehicleNumber} ({a.type}) - {a.driverName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Driver Badge</label>
                <input
                  type="text"
                  value={driverBadge}
                  onChange={(e) => setDriverBadge(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDriverSubmit}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>Launch Ambulance Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                feedback.success();
                const amb = MOCK_AMBULANCES[0];
                const session: DriverSession = {
                  driverId: 'DRV-5509',
                  name: 'Rajesh Kumar',
                  phone: amb.driverPhone,
                  badgeNumber: 'DRV-5509',
                  vehicleNumber: amb.vehicleNumber,
                  ambulanceType: amb.type,
                  baseStation: 'Sector 11 Stand',
                  status: 'available',
                  currentEtaMinutes: 4
                };
                onDriverLogin(session);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Tap Demo: Unit DL-01-EA-4492</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
