import React from 'react';
import { AppRole, NurseSession, DriverSession, PatientProfile } from '../../types';
import { feedback } from '../../utils/audioHaptics';
import {
  HeartPulse,
  Monitor,
  Sparkles,
  UserCheck,
  Stethoscope,
  Ambulance,
  Building2,
  LogOut,
  MessageSquare,
  Star,
  Zap
} from 'lucide-react';

interface HeaderBarProps {
  currentRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  isSimulationActive: boolean;
  onToggleSimulation: () => void;
  showSmsFallbackDemo: boolean;
  onToggleSmsFallbackDemo: () => void;
  onOpenFeedback: () => void;
  patientProfile: PatientProfile | null;
  nurseSession: NurseSession | null;
  driverSession: DriverSession | null;
  onLogout: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentRole,
  onSelectRole,
  isMobileFrame,
  onToggleMobileFrame,
  isSimulationActive,
  onToggleSimulation,
  showSmsFallbackDemo,
  onToggleSmsFallbackDemo,
  onOpenFeedback,
  patientProfile,
  nurseSession,
  driverSession,
  onLogout
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand */}
        <button
          onClick={() => {
            feedback.tap();
            onSelectRole('gateway_auth');
          }}
          className="flex items-center gap-2.5 text-left focus-visible:outline-rose-500 rounded-lg shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
                BedLink
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Live 108
              </span>
            </div>
            <span className="text-[11px] text-slate-500 leading-tight">
              Hospital Bed & Ambulance Grid
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              feedback.tap();
              onSelectRole('gateway_auth');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentRole === 'gateway_auth'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Portal Select
          </button>

          <button
            onClick={() => {
              feedback.tap();
              onSelectRole('patient_portal');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              currentRole === 'patient_portal' || currentRole === 'patient_onboarding'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Patient Triage</span>
          </button>

          <button
            onClick={() => {
              feedback.tap();
              onSelectRole('nurse_dashboard');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              currentRole === 'nurse_dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            <span>Nurse 10s Desk</span>
          </button>

          <button
            onClick={() => {
              feedback.tap();
              onSelectRole('ambulance_dispatch');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              currentRole === 'ambulance_dispatch'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ambulance className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ambulance EMT</span>
          </button>

          <button
            onClick={() => {
              feedback.tap();
              onSelectRole('government_portal');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              currentRole === 'government_portal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-700" />
            <span>City Health Grid</span>
          </button>
        </nav>

        {/* Zone 3: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Live Simulation Toggle */}
          <button
            onClick={() => {
              feedback.tap();
              onToggleSimulation();
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all whitespace-nowrap ${
              isSimulationActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Auto-simulates bed count changes & freshness"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulationActive ? 'text-emerald-600 animate-spin' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Live Sim:</span>
            <span>{isSimulationActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Offline SMS */}
          <button
            onClick={() => {
              feedback.tap();
              onToggleSmsFallbackDemo();
            }}
            className={`p-1.5 text-xs rounded-lg border transition-colors ${
              showSmsFallbackDemo
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Offline SMS emergency tool"
          >
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </button>

          {/* Feedback */}
          <button
            onClick={() => {
              feedback.tap();
              onOpenFeedback();
            }}
            className="p-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200"
            title="Feedback & rating"
          >
            <Star className="w-4 h-4 text-amber-500" />
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              feedback.tap();
              onLogout();
            }}
            className="p-1.5 text-xs text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
            title="Switch User / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar for narrow screens */}
      <div className="md:hidden flex items-center justify-between px-3 py-1.5 border-t border-slate-100 overflow-x-auto gap-1 bg-slate-50">
        <button
          onClick={() => {
            feedback.tap();
            onSelectRole('gateway_auth');
          }}
          className={`px-2 py-1 text-xs font-semibold rounded ${
            currentRole === 'gateway_auth' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Auth
        </button>
        <button
          onClick={() => {
            feedback.tap();
            onSelectRole('patient_portal');
          }}
          className={`px-2 py-1 text-xs font-semibold rounded ${
            currentRole === 'patient_portal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Patient
        </button>
        <button
          onClick={() => {
            feedback.tap();
            onSelectRole('nurse_dashboard');
          }}
          className={`px-2 py-1 text-xs font-semibold rounded ${
            currentRole === 'nurse_dashboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Nurse
        </button>
        <button
          onClick={() => {
            feedback.tap();
            onSelectRole('ambulance_dispatch');
          }}
          className={`px-2 py-1 text-xs font-semibold rounded ${
            currentRole === 'ambulance_dispatch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Ambulance
        </button>
        <button
          onClick={() => {
            feedback.tap();
            onSelectRole('government_portal');
          }}
          className={`px-2 py-1 text-xs font-semibold rounded ${
            currentRole === 'government_portal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          City Grid
        </button>
      </div>
    </header>
  );
};
