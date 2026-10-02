import React from 'react';
import { PatientProfile } from '../../types';
import { ShieldCheck, Heart, AlertTriangle, Phone, QrCode, CheckCircle2 } from 'lucide-react';

interface DigitalHealthCardProps {
  profile: PatientProfile;
  compact?: boolean;
  onClose?: () => void;
}

export const DigitalHealthCard: React.FC<DigitalHealthCardProps> = ({ profile, compact = false, onClose }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl ${compact ? 'p-4' : 'p-6 border border-slate-700/60'}`}>
      {/* Background watermark cross / wave */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-start justify-between border-b border-slate-700/60 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-500 flex items-center justify-center font-black text-white text-xs">
              +
            </div>
            <span className="font-bold tracking-tight text-sm">BedLink Emergency Pass</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            ID: BL-{profile.id.replace('pt-', '').toUpperCase()} · NDHM Compliant
          </p>
        </div>

        {profile.hasGovScheme && (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              PM-JAY Cashless
            </span>
          </div>
        )}
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="col-span-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Patient Name</p>
          <p className="text-base font-bold text-white truncate">{profile.fullName}</p>
          <p className="text-xs text-slate-300 mt-0.5">
            {profile.age} yrs · {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} · {profile.phone}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center bg-rose-500/10 border border-rose-500/30 rounded-xl p-2 text-center">
          <p className="text-[10px] uppercase tracking-wider text-rose-300 font-semibold">Blood Group</p>
          <p className="text-2xl font-black text-rose-400 font-mono tracking-tight">{profile.bloodGroup}</p>
        </div>
      </div>

      {/* Medical Alert Flags */}
      <div className="space-y-2 border-t border-slate-700/60 pt-3 text-xs">
        {profile.allergies.length > 0 && (
          <div className="flex items-start gap-1.5 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
            <div className="text-[11px]">
              <span className="font-semibold text-amber-200">Allergies: </span>
              <span className="text-amber-300/90">{profile.allergies.join(', ')}</span>
            </div>
          </div>
        )}

        {profile.chronicConditions.length > 0 && (
          <div className="flex items-start gap-1.5 text-sky-200">
            <Heart className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
            <div className="text-[11px]">
              <span className="font-semibold text-sky-200">Conditions: </span>
              <span className="text-slate-300">{profile.chronicConditions.join(', ')}</span>
            </div>
          </div>
        )}

        {profile.emergencyContact && profile.emergencyContact.name && (
          <div className="flex items-center justify-between bg-slate-800/80 rounded-lg p-2 mt-2 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-400">Emergency SOS Contact ({profile.emergencyContact.relationship})</p>
                <p className="text-xs font-semibold text-white">{profile.emergencyContact.name}</p>
              </div>
            </div>
            <a
              href={`tel:${profile.emergencyContact.phone}`}
              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition-colors"
            >
              {profile.emergencyContact.phone}
            </a>
          </div>
        )}
      </div>

      {/* Card Footer: ABHA / QR */}
      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ABHA ID: {profile.abhaId || 'Pending ABHA link'}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <QrCode className="w-4 h-4 text-white" />
          <span>ER Triage Scannable</span>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors border border-slate-700"
        >
          Close Card Preview
        </button>
      )}
    </div>
  );
};
