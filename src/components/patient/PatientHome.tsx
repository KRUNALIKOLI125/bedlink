import React, { useState, useEffect } from 'react';
import { Hospital, PatientProfile, TriageRequest } from '../../types';
import { feedback } from '../../utils/audioHaptics';
import { DigitalHealthCard } from '../onboarding/DigitalHealthCard';
import {
  HeartPulse,
  Ambulance,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  PhoneCall,
  QrCode,
  Zap,
  Phone
} from 'lucide-react';

interface PatientHomeProps {
  patient: PatientProfile;
  hospitals: Hospital[];
  onOpenNurseView?: (hospitalId: string) => void;
  onOpenDispatchView?: () => void;
  onReopenOnboarding?: () => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  patient,
  hospitals,
  onOpenNurseView,
  onOpenDispatchView,
  onReopenOnboarding
}) => {
  // Triage filter states
  const [needsIcu, setNeedsIcu] = useState(true);
  const [needsVentilator, setNeedsVentilator] = useState(false);
  const [needsOxygen, setNeedsOxygen] = useState(true);
  const [needsCardiac, setNeedsCardiac] = useState(false);
  const [needsBurns, setNeedsBurns] = useState(false);
  const [filterPmJayOnly, setFilterPmJayOnly] = useState(patient.hasGovScheme);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Modals
  const [showCardModal, setShowCardModal] = useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);

  // Active SLA Hold Request State
  const [activeRequest, setActiveRequest] = useState<TriageRequest | null>(null);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState<number>(120);
  const [reroutingAlert, setReroutingAlert] = useState<string | null>(null);

  // SLA Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeRequest && activeRequest.status === 'holding' && holdTimerSeconds > 0) {
      timer = setInterval(() => {
        setHoldTimerSeconds((prev) => {
          if (prev <= 1) {
            handleHoldTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeRequest, holdTimerSeconds]);

  const handleHoldTimeout = () => {
    feedback.emergency();
    const fallbackHosp = hospitals.find(
      (h) => h.id !== activeRequest?.selectedHospitalId && h.inventory.icuAvailable > 0
    );

    if (fallbackHosp) {
      setReroutingAlert(`2-min SLA timeout: Auto-rerouted to ${fallbackHosp.name}`);
      setActiveRequest((prev) =>
        prev
          ? {
              ...prev,
              status: 'rerouting',
              selectedHospitalId: fallbackHosp.id,
              rejectionReason: 'Hospital SLA window expired without nurse confirmation.'
            }
          : null
      );
    } else {
      setActiveRequest((prev) =>
        prev ? { ...prev, status: 'rejected', rejectionReason: 'SLA timeout. No alternate ICU bed available.' } : null
      );
    }
  };

  // Rank hospitals
  const rankedHospitals = [...hospitals]
    .filter((h) => (!filterPmJayOnly || h.acceptsPmJay))
    .sort((a, b) => {
      let scoreA = 100;
      let scoreB = 100;

      if (needsIcu && a.inventory.icuAvailable <= 0) scoreA -= 50;
      if (needsIcu && b.inventory.icuAvailable <= 0) scoreB -= 50;

      if (needsVentilator && a.inventory.ventilatorAvailable <= 0) scoreA -= 30;
      if (needsVentilator && b.inventory.ventilatorAvailable <= 0) scoreB -= 30;

      if (needsCardiac && a.inventory.cardiacCareAvailable <= 0) scoreA -= 20;
      if (needsCardiac && b.inventory.cardiacCareAvailable <= 0) scoreB -= 20;

      if (needsBurns && a.inventory.burnsUnitAvailable <= 0) scoreA -= 20;
      if (needsBurns && b.inventory.burnsUnitAvailable <= 0) scoreB -= 20;

      if (a.inventory.lastUpdatedMinutesAgo > 15) scoreA -= 25;
      if (b.inventory.lastUpdatedMinutesAgo > 15) scoreB -= 25;

      scoreA -= a.etaMinutes * 2;
      scoreB -= b.etaMinutes * 2;

      return scoreB - scoreA;
    });

  const handleInitiateBedHold = (hospital: Hospital) => {
    feedback.emergency();
    setSelectedHospital(hospital);
    setHoldTimerSeconds(120);
    setReroutingAlert(null);

    const newReq: TriageRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientAge: patient.age,
      patientGender: patient.gender,
      bloodGroup: patient.bloodGroup,
      primaryCondition: needsCardiac ? 'Cardiac Event' : needsBurns ? 'Burns' : 'Critical ICU Triage',
      needsIcu,
      needsVentilator,
      needsOxygen,
      needsCardiac,
      needsBurns,
      needsPediatric: patient.age < 16,
      selectedHospitalId: hospital.id,
      status: 'holding',
      holdExpiresAt: Date.now() + 120 * 1000,
      ambulanceAssigned: {
        id: 'amb-101',
        vehicleNumber: 'DL-01-EA-4492',
        driverName: 'Rajesh Kumar',
        driverPhone: '+91 98711 00223',
        etaMinutes: Math.max(3, hospital.etaMinutes - 3)
      }
    };

    setActiveRequest(newReq);
  };

  const handleSimulateNurseAccept = () => {
    feedback.success();
    setActiveRequest((prev) => (prev ? { ...prev, status: 'confirmed' } : null));
  };

  const handleSimulateNurseReject = () => {
    feedback.emergency();
    const fallback = hospitals.find((h) => h.id !== activeRequest?.selectedHospitalId && h.inventory.icuAvailable > 0);
    if (fallback) {
      setReroutingAlert(`ER at capacity. Auto-rerouted to ${fallback.name} (${fallback.inventory.icuAvailable} beds).`);
      setActiveRequest((prev) =>
        prev
          ? {
              ...prev,
              status: 'rerouting',
              selectedHospitalId: fallback.id,
              rejectionReason: 'ER capacity redirect.'
            }
          : null
      );
    } else {
      setActiveRequest((prev) =>
        prev ? { ...prev, status: 'rejected', rejectionReason: 'No alternate hospital open.' } : null
      );
    }
  };

  const minutes = Math.floor(holdTimerSeconds / 60);
  const seconds = holdTimerSeconds % 60;
  const timerPercent = (holdTimerSeconds / 120) * 100;

  return (
    <div className="space-y-4">
      {/* Patient Profile Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-black text-white text-base shrink-0">
            {patient.bloodGroup}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">{patient.fullName}</h2>
              {patient.hasGovScheme && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  PM-JAY Cashless
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              {patient.age} yrs · {patient.phone} · SOS Contact: {patient.emergencyContact.name} ({patient.emergencyContact.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCardModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-rose-400" />
            <span>Digital Pass</span>
          </button>

          <button
            onClick={() => setShowAdmissionForm(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Pre-Admission</span>
          </button>

          {onReopenOnboarding && (
            <button
              onClick={onReopenOnboarding}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Reroute Alert */}
      {reroutingAlert && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold">Rerouting Active:</span> {reroutingAlert}
        </div>
      )}

      {/* SLA Hold Tracker */}
      {activeRequest && (
        <div className="bg-white border-2 border-rose-500 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <h3 className="font-bold text-slate-900 text-sm">2-Minute SLA Hold Request ({activeRequest.id})</h3>
            </div>
            {activeRequest.status === 'holding' && (
              <span className="font-mono font-bold text-rose-600 text-sm">
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            )}
          </div>

          {activeRequest.status === 'holding' && (
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Awaiting hospital triage acknowledgment</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleSimulateNurseAccept}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={handleSimulateNurseReject}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Divert
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRequest.status === 'confirmed' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bed Held! Ambulance ({activeRequest.ambulanceAssigned?.vehicleNumber}) dispatched. ETA {activeRequest.ambulanceAssigned?.etaMinutes} mins.</span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${activeRequest.ambulanceAssigned?.driverPhone}`}
                  className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Driver
                </a>
                <button
                  onClick={() => setActiveRequest(null)}
                  className="px-2 py-1 bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {activeRequest.status === 'rerouting' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-950">
                <RotateCcw className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Rerouting to backup hospital with verified ICU bed.</span>
              </div>
              <button
                onClick={handleSimulateNurseAccept}
                className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg"
              >
                Confirm Hold
              </button>
            </div>
          )}
        </div>
      )}

      {/* Website 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Triage Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-600" />
                <span>Triage Requirements</span>
              </h3>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">ICU Bed</span>
                <input
                  type="checkbox"
                  checked={needsIcu}
                  onChange={(e) => setNeedsIcu(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">Ventilator</span>
                <input
                  type="checkbox"
                  checked={needsVentilator}
                  onChange={(e) => setNeedsVentilator(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">Oxygen Support</span>
                <input
                  type="checkbox"
                  checked={needsOxygen}
                  onChange={(e) => setNeedsOxygen(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">Cardiac Unit</span>
                <input
                  type="checkbox"
                  checked={needsCardiac}
                  onChange={(e) => setNeedsCardiac(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">Burns Unit</span>
                <input
                  type="checkbox"
                  checked={needsBurns}
                  onChange={(e) => setNeedsBurns(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
              </label>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer text-xs">
                  <span className="font-bold text-emerald-900">PM-JAY Cashless Only</span>
                  <input
                    type="checkbox"
                    checked={filterPmJayOnly}
                    onChange={(e) => setFilterPmJayOnly(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Quick Helpline Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-700">Emergency Numbers</span>
            <div className="flex gap-2">
              <a
                href="tel:108"
                className="flex-1 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 text-center text-xs flex items-center justify-center gap-1"
              >
                <Phone className="w-3 h-3" /> 108 Ambulance
              </a>
              <a
                href="tel:112"
                className="flex-1 py-1.5 bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-300 text-center text-xs"
              >
                112 Police
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Hospital Bed Cards */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">
              Verified Hospitals ({rankedHospitals.length})
            </span>
            <span className="text-xs text-slate-500">Sorted by bed match & ETA</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rankedHospitals.map((hospital, idx) => {
              const isIcuAvailable = hospital.inventory.icuAvailable > 0;
              const isFresh = hospital.inventory.lastUpdatedMinutesAgo <= 5;

              return (
                <div
                  key={hospital.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between ${
                    idx === 0
                      ? 'border-rose-400 ring-1 ring-rose-300/50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            {hospital.name}
                          </h4>
                          {idx === 0 && (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                              Best Match
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{hospital.distanceKm} km · {hospital.etaMinutes} min ETA</span>
                          <span>·</span>
                          <span className={isFresh ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                            {hospital.inventory.lastUpdatedMinutesAgo}m ago
                          </span>
                        </p>
                      </div>

                      {hospital.acceptsPmJay && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                          PM-JAY
                        </span>
                      )}
                    </div>

                    {/* Bed Counts Grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <div className={`p-2 rounded-xl text-center ${isIcuAvailable ? 'bg-rose-50 border border-rose-200 text-rose-900' : 'bg-slate-100 text-slate-400'}`}>
                        <span className="text-[10px] block font-semibold">ICU</span>
                        <span className="text-base font-extrabold font-mono">{hospital.inventory.icuAvailable}</span>
                      </div>

                      <div className="p-2 rounded-xl text-center bg-blue-50 border border-blue-200 text-blue-900">
                        <span className="text-[10px] block font-semibold">Vent</span>
                        <span className="text-base font-extrabold font-mono">{hospital.inventory.ventilatorAvailable}</span>
                      </div>

                      <div className="p-2 rounded-xl text-center bg-sky-50 border border-sky-200 text-sky-900">
                        <span className="text-[10px] block font-semibold">O2</span>
                        <span className="text-base font-extrabold font-mono">{hospital.inventory.oxygenAvailable}</span>
                      </div>

                      <div className="p-2 rounded-xl text-center bg-amber-50 border border-amber-200 text-amber-900">
                        <span className="text-[10px] block font-semibold">Cardiac</span>
                        <span className="text-base font-extrabold font-mono">{hospital.inventory.cardiacCareAvailable}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleInitiateBedHold(hospital)}
                      disabled={!isIcuAvailable}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                        isIcuAvailable
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isIcuAvailable ? 'Hold ICU Bed & Dispatch' : 'ICU Full'}</span>
                    </button>

                    {onOpenNurseView && (
                      <button
                        onClick={() => onOpenNurseView(hospital.id)}
                        className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                        title="Open ER Nurse Bed Desk"
                      >
                        Desk
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Digital Pass Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Emergency Digital Health Pass</h3>
              <button onClick={() => setShowCardModal(false)} className="text-slate-400 font-bold hover:text-slate-700">✕</button>
            </div>
            <DigitalHealthCard profile={patient} />
            <button
              onClick={() => setShowCardModal(false)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Pre-Admission Form Modal */}
      {showAdmissionForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">ER Pre-Admission Brief</h3>
              <button onClick={() => setShowAdmissionForm(false)} className="text-slate-400 font-bold hover:text-slate-700">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Patient:</strong> {patient.fullName} ({patient.age}y, {patient.bloodGroup})</p>
              <p><strong>ABHA ID:</strong> {patient.abhaId || '91-8821-4451-9012'}</p>
              <p><strong>Known Conditions:</strong> {patient.chronicConditions.join(', ') || 'None recorded'}</p>
              <p><strong>Known Allergies:</strong> {patient.allergies.join(', ') || 'None'}</p>
              <p><strong>Insurance:</strong> {patient.hasGovScheme ? `${patient.schemeType} (${patient.schemeId})` : 'Private / Cash'}</p>
            </div>
            <button
              onClick={() => {
                feedback.success();
                setShowAdmissionForm(false);
              }}
              className="w-full py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
            >
              Transmit to Hospital Triage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
