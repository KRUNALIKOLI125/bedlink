import React, { useState } from 'react';
import { Hospital, HospitalBedInventory } from '../../types';
import { feedback } from '../../utils/audioHaptics';
import {
  Plus,
  Minus,
  Check,
  BellRing,
  Activity,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface NurseDashboardProps {
  hospital: Hospital;
  onUpdateInventory: (hospitalId: string, updated: HospitalBedInventory) => void;
  onAcceptIncoming?: () => void;
  onRejectIncoming?: () => void;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({
  hospital,
  onUpdateInventory,
  onAcceptIncoming,
  onRejectIncoming
}) => {
  const [inventory, setInventory] = useState<HospitalBedInventory>(hospital.inventory);
  const [justSaved, setJustSaved] = useState(false);
  const [incomingEmergency, setIncomingEmergency] = useState<{
    reqId: string;
    patientName: string;
    age: number;
    bloodGroup: string;
    condition: string;
    secondsLeft: number;
  } | null>({
    reqId: 'REQ-4492',
    patientName: 'Ananya Sharma',
    age: 34,
    bloodGroup: 'O+',
    condition: 'Cardiac / Severe Chest Pain (Needs ICU)',
    secondsLeft: 98
  });

  const updateCount = (key: keyof HospitalBedInventory, delta: number) => {
    feedback.tap();
    setInventory((prev) => {
      const current = (prev[key] as number) || 0;
      const nextVal = Math.max(0, current + delta);
      const updated = {
        ...prev,
        [key]: nextVal,
        lastUpdatedMinutesAgo: 0,
        lastUpdatedTimestamp: Date.now()
      };
      onUpdateInventory(hospital.id, updated);
      return updated;
    });

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleAcceptAlert = () => {
    feedback.success();
    if (onAcceptIncoming) onAcceptIncoming();
    updateCount('icuAvailable', -1);
    setIncomingEmergency(null);
  };

  const handleRejectAlert = () => {
    feedback.emergency();
    if (onRejectIncoming) onRejectIncoming();
    setIncomingEmergency(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Console Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{hospital.name}</h2>
            <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
              ER Triage Desk
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            10-Second Bed Updates · National 108 Emergency Network
          </p>
        </div>

        <div className="flex items-center gap-2">
          {justSaved ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Synced</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Real-time Sync Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Ambulance 2-Min Alert Banner */}
      {incomingEmergency && (
        <div className="bg-white border-2 border-rose-500 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Incoming Ambulance Request ({incomingEmergency.reqId})</span>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {incomingEmergency.secondsLeft}s left
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                <strong>{incomingEmergency.patientName}</strong> ({incomingEmergency.age}y, {incomingEmergency.bloodGroup}) · {incomingEmergency.condition}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAcceptAlert}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Hold ICU Bed</span>
            </button>
            <button
              onClick={handleRejectAlert}
              className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Divert</span>
            </button>
          </div>
        </div>
      )}

      {/* 4-Column Bed Inventory Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ICU Beds */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">ICU Beds</span>
            <span className="text-[11px] text-slate-400 font-mono">Total {inventory.icuTotal}</span>
          </div>

          <div className="text-center py-2">
            <span className="text-4xl font-black font-mono text-rose-600">
              {inventory.icuAvailable}
            </span>
            <span className="block text-[11px] text-slate-500 mt-1">Available Now</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateCount('icuAvailable', -1)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm rounded-xl flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateCount('icuAvailable', 1)}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-xl flex items-center justify-center shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ventilator Units */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Ventilators</span>
            <span className="text-[11px] text-slate-400 font-mono">Total {inventory.ventilatorTotal}</span>
          </div>

          <div className="text-center py-2">
            <span className="text-4xl font-black font-mono text-blue-600">
              {inventory.ventilatorAvailable}
            </span>
            <span className="block text-[11px] text-slate-500 mt-1">Available Now</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateCount('ventilatorAvailable', -1)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm rounded-xl flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateCount('ventilatorAvailable', 1)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl flex items-center justify-center shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Oxygen Beds */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Oxygen Beds</span>
            <span className="text-[11px] text-slate-400 font-mono">Total {inventory.oxygenTotal}</span>
          </div>

          <div className="text-center py-2">
            <span className="text-4xl font-black font-mono text-sky-600">
              {inventory.oxygenAvailable}
            </span>
            <span className="block text-[11px] text-slate-500 mt-1">Available Now</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateCount('oxygenAvailable', -1)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm rounded-xl flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateCount('oxygenAvailable', 1)}
              className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl flex items-center justify-center shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cardiac & Burns */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Specialty Units</span>
            <span className="text-[11px] text-slate-400 font-mono">Cardiac / Burns</span>
          </div>

          <div className="flex items-center justify-around py-2">
            <div className="text-center">
              <span className="text-3xl font-black font-mono text-amber-600">
                {inventory.cardiacCareAvailable}
              </span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Cardiac</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-3xl font-black font-mono text-orange-600">
                {inventory.burnsUnitAvailable}
              </span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Burns</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateCount('cardiacCareAvailable', -1)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl flex items-center justify-center"
            >
              - Card
            </button>
            <button
              onClick={() => updateCount('cardiacCareAvailable', 1)}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center justify-center shadow-xs"
            >
              + Card
            </button>
          </div>
        </div>
      </div>

      {/* ER On-Duty Specialists & Triage Roster */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800">ER Triage Team On Duty</span>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> All Stations Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {hospital.onDutyDoctors.map((doc, i) => (
            <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 block truncate">{doc.specialty}</span>
              <span className="text-slate-500 text-[11px]">{doc.count} Specialists on shift</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
