import React, { useState } from 'react';
import { MOCK_AMBULANCES } from '../../data/mockData';
import { DriverSession, Hospital } from '../../types';
import { feedback } from '../../utils/audioHaptics';
import {
  Ambulance,
  Phone,
  Radio,
  MapPin,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Activity,
  HeartPulse,
  Send,
  CheckCircle2
} from 'lucide-react';

interface AmbulanceDispatchProps {
  activeDriverSession?: DriverSession | null;
  hospitals?: Hospital[];
  onOpenFeedback?: () => void;
}

export const AmbulanceDispatch: React.FC<AmbulanceDispatchProps> = ({
  activeDriverSession,
  hospitals = [],
  onOpenFeedback
}) => {
  const [ambulances, setAmbulances] = useState(MOCK_AMBULANCES);

  const [activeIncident, setActiveIncident] = useState({
    id: 'INC-901',
    patient: 'Ananya Sharma (34y, O+)',
    condition: 'Cardiac / Severe STEMI',
    destinationHospital: 'Apollo Grace Trauma & Multi-Specialty',
    fallbackHospital: 'City Civil Medical Institute & Heart Centre',
    goldenHourMinutesRemaining: 42,
    destinationEta: 6,
    isRerouted: false
  });

  const [vitals, setVitals] = useState({
    pulseRate: 112,
    spO2: 94,
    bloodPressure: '145/95',
    vitalsSynced: false
  });

  const [reroutingAlert, setReroutingAlert] = useState<string | null>(null);

  const handleTriggerAutomatedReroute = () => {
    feedback.emergency();
    setReroutingAlert(
      `Hospital ER at capacity. Rerouted to City Civil Heart Centre (4.5 km · 8 mins). Green corridor notified.`
    );
    setActiveIncident((prev) => ({
      ...prev,
      destinationHospital: prev.fallbackHospital,
      destinationEta: 8,
      isRerouted: true
    }));
  };

  const handleSyncVitals = () => {
    feedback.success();
    setVitals((prev) => ({ ...prev, vitalsSynced: true }));
    setTimeout(() => {
      setVitals((prev) => ({ ...prev, vitalsSynced: false }));
    }, 2500);
  };

  const toggleDispatch = (ambId: string) => {
    feedback.tap();
    setAmbulances((prev) =>
      prev.map((amb) => {
        if (amb.id === ambId) {
          const nextStatus = amb.status === 'available' ? 'dispatched' : 'available';
          return { ...amb, status: nextStatus };
        }
        return amb;
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
            <Ambulance className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">108 Ambulance Dispatch & EMT Telemetry</h2>
              <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Live GPS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Golden Hour Triage · En-Route Vitals Transmission to Destination ICU
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
            >
              Post-Run Feedback
            </button>
          )}
        </div>
      </div>

      {/* Reroute Alert */}
      {reroutingAlert && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold">Automated Reroute:</span> {reroutingAlert}
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 cols): Active Incident + Transit Vitals */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Mission Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                <span className="font-bold text-slate-900 text-sm">Active Incident: {activeIncident.id}</span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Golden Hour: {activeIncident.goldenHourMinutesRemaining}m left
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Patient</span>
                <span className="font-bold text-slate-900 text-sm">{activeIncident.patient}</span>
                <span className="text-rose-600 font-semibold block mt-0.5">{activeIncident.condition}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Destination ER</span>
                <span className="font-bold text-slate-900 text-sm leading-tight block">{activeIncident.destinationHospital}</span>
                <span className="text-emerald-600 font-semibold block mt-0.5">ETA: {activeIncident.destinationEta} mins away</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                {activeIncident.isRerouted ? 'Rerouted to backup hospital' : 'Direct primary route'}
              </span>
              <button
                onClick={handleTriggerAutomatedReroute}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulate ER Capacity Diversion</span>
              </button>
            </div>
          </div>

          {/* Real-Time Transit Vitals Telemetry */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-slate-900 text-sm">En-Route Patient Vitals</span>
              </div>
              <button
                onClick={handleSyncVitals}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Transmit to ER</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
                <span className="text-[10px] text-slate-600 font-semibold block">Pulse Rate</span>
                <span className="text-2xl font-black font-mono text-rose-700">{vitals.pulseRate}</span>
                <span className="text-[10px] text-slate-400 block">bpm</span>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <span className="text-[10px] text-slate-600 font-semibold block">Blood Oxygen</span>
                <span className="text-2xl font-black font-mono text-blue-700">{vitals.spO2}%</span>
                <span className="text-[10px] text-slate-400 block">SpO2</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-600 font-semibold block">Blood Pressure</span>
                <span className="text-xl font-black font-mono text-slate-900 mt-0.5 block">{vitals.bloodPressure}</span>
                <span className="text-[10px] text-slate-400 block">mmHg</span>
              </div>
            </div>

            {vitals.vitalsSynced && (
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vitals synced to destination hospital triage monitor!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fleet Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">108 Fleet Status ({ambulances.length})</span>
            <span className="text-xs text-slate-500">Live Telematics</span>
          </div>

          <div className="space-y-2.5">
            {ambulances.map((amb) => {
              const isAvail = amb.status === 'available';

              return (
                <div
                  key={amb.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{amb.vehicleNumber}</span>
                      <span className="text-[11px] text-slate-500 block">{amb.driverName} · {amb.type}</span>
                    </div>

                    <button
                      onClick={() => toggleDispatch(amb.id)}
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border transition-colors ${
                        isAvail
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {isAvail ? 'Available' : 'En Route'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> ETA: {amb.etaMinutes} mins
                    </span>
                    <a
                      href={`tel:${amb.driverPhone}`}
                      className="text-rose-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
