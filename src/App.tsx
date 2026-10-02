import React, { useState, useEffect } from 'react';
import {
  PatientProfile,
  Hospital,
  AppRole,
  HospitalBedInventory,
  NurseSession,
  DriverSession
} from './types';
import { INITIAL_HOSPITALS, DEMO_PREFILLED_PROFILE, MOCK_AMBULANCES } from './data/mockData';
import { AuthGateway } from './components/auth/AuthGateway';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { PatientHome } from './components/patient/PatientHome';
import { NurseDashboard } from './components/nurse/NurseDashboard';
import { AmbulanceDispatch } from './components/ambulance/AmbulanceDispatch';
import { GovernmentPortal } from './components/government/GovernmentPortal';
import { HeaderBar } from './components/common/HeaderBar';
import { MobileFrame } from './components/common/MobileFrame';
import { SmsFallbackModal } from './components/common/SmsFallbackModal';
import { UserFeedbackModal } from './components/feedback/UserFeedbackModal';
import { feedback } from './utils/audioHaptics';
import { CheckCircle2, AlertTriangle, Phone, ShieldCheck, HeartPulse } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<AppRole>('gateway_auth');

  // Sessions
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [nurseSession, setNurseSession] = useState<NurseSession | null>(null);
  const [driverSession, setDriverSession] = useState<DriverSession | null>(null);

  // Hospital state
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedNurseHospitalId, setSelectedNurseHospitalId] = useState<string>(INITIAL_HOSPITALS[0].id);

  // UI Modes - default to full responsive website view
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [showSmsModal, setShowSmsModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Live Simulation Interval (shifts bed availability and freshness every 7s)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulationActive) {
      interval = setInterval(() => {
        setHospitals((prev) =>
          prev.map((h) => {
            const delta = Math.random() > 0.5 ? 1 : -1;
            const newIcu = Math.max(0, Math.min(h.inventory.icuTotal, h.inventory.icuAvailable + delta));
            return {
              ...h,
              inventory: {
                ...h.inventory,
                icuAvailable: newIcu,
                lastUpdatedMinutesAgo: Math.max(1, (h.inventory.lastUpdatedMinutesAgo + 1) % 25)
              }
            };
          })
        );
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isSimulationActive]);

  // USE CASE 0: Emergency Golden-Hour Bypass (Life-Saving Zero Registration)
  const handleEmergencyBypass = () => {
    feedback.emergency();
    const guestProfile: PatientProfile = {
      id: 'pt-guest-sos',
      fullName: 'Emergency Patient (Bypass)',
      phone: '+91 99999 00000',
      age: 48,
      gender: 'other',
      bloodGroup: 'O+',
      allergies: [],
      chronicConditions: ['Acute Golden-Hour Emergency Bypass'],
      emergencyContact: {
        name: 'Nearby Bystander / Good Samaritan',
        relationship: 'Caregiver',
        phone: '+91 98765 00000',
        notifyOnSOS: true
      },
      hasGovScheme: true,
      schemeType: 'PM-JAY',
      schemeId: 'PM-JAY-EMERGENCY-BYPASS',
      isAbhaVerified: false,
      consentEmergencyAccess: true,
      registeredAt: new Date().toISOString(),
      isEmergencyGuest: true
    };

    setPatientProfile(guestProfile);
    setCurrentRole('patient_portal');
    showToast('Emergency bypass activated: Instant ICU bed booking enabled.', 'alert');
  };

  // USE CASE 1: Patient Selection / Login
  const handlePatientSelect = (existing?: PatientProfile) => {
    if (existing) {
      setPatientProfile(existing);
      setCurrentRole('patient_portal');
      showToast(`Signed in as ${existing.fullName}`);
    } else {
      setCurrentRole('patient_onboarding');
    }
  };

  const handlePatientOnboardingComplete = (profile: PatientProfile) => {
    setPatientProfile(profile);
    setCurrentRole('patient_portal');
    showToast('Health card created. Triage portal active.');
  };

  // USE CASE 2: Nurse Login
  const handleNurseLogin = (nurse: NurseSession) => {
    setNurseSession(nurse);
    setSelectedNurseHospitalId(nurse.hospitalId);
    setCurrentRole('nurse_dashboard');
    showToast(`Signed in to ${nurse.hospitalName}`);
  };

  // USE CASE 3: Driver Login
  const handleDriverLogin = (driver: DriverSession) => {
    setDriverSession(driver);
    setCurrentRole('ambulance_dispatch');
    showToast(`Ambulance ${driver.vehicleNumber} ready`);
  };

  // Nurse updates bed inventory
  const handleUpdateInventory = (hospitalId: string, updated: HospitalBedInventory) => {
    setHospitals((prev) =>
      prev.map((h) => (h.id === hospitalId ? { ...h, inventory: updated } : h))
    );
  };

  const handleLogout = () => {
    feedback.tap();
    setCurrentRole('gateway_auth');
    showToast('Returned to Portal Selection');
  };

  const currentNurseHospital =
    hospitals.find((h) => h.id === (nurseSession?.hospitalId || selectedNurseHospitalId)) ||
    hospitals[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-14 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              notification.type === 'alert'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            {notification.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Universal Top Header Bar */}
      <HeaderBar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame((prev) => !prev)}
        isSimulationActive={isSimulationActive}
        onToggleSimulation={() => {
          setIsSimulationActive((prev) => !prev);
          feedback.tap();
        }}
        showSmsFallbackDemo={showSmsModal}
        onToggleSmsFallbackDemo={() => setShowSmsModal((prev) => !prev)}
        onOpenFeedback={() => setShowFeedbackModal(true)}
        patientProfile={patientProfile}
        nurseSession={nurseSession}
        driverSession={driverSession}
        onLogout={handleLogout}
      />

      {/* Main Website Container */}
      <main className="flex-1 flex flex-col">
        <MobileFrame isActive={isMobileFrame}>
          {/* GATEWAY AUTH */}
          {currentRole === 'gateway_auth' && (
            <AuthGateway
              hospitals={hospitals}
              onEmergencyBypass={handleEmergencyBypass}
              onPatientSelect={handlePatientSelect}
              onNurseLogin={handleNurseLogin}
              onDriverLogin={handleDriverLogin}
            />
          )}

          {/* 1. PATIENT: Onboarding */}
          {currentRole === 'patient_onboarding' && (
            <OnboardingFlow
              onComplete={handlePatientOnboardingComplete}
              onEmergencyBypass={handleEmergencyBypass}
              existingProfile={patientProfile}
            />
          )}

          {/* 1. PATIENT: Triage & Bed Hold */}
          {currentRole === 'patient_portal' && (
            <PatientHome
              patient={patientProfile || DEMO_PREFILLED_PROFILE}
              hospitals={hospitals}
              onOpenNurseView={(hospId) => {
                setSelectedNurseHospitalId(hospId);
                setCurrentRole('nurse_dashboard');
              }}
              onOpenDispatchView={() => setCurrentRole('ambulance_dispatch')}
              onReopenOnboarding={() => setCurrentRole('patient_onboarding')}
            />
          )}

          {/* 2. NURSE: 10-Second Bed Updates */}
          {currentRole === 'nurse_dashboard' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Hospital Desk:</span>
                  <select
                    value={currentNurseHospital.id}
                    onChange={(e) => {
                      setSelectedNurseHospitalId(e.target.value);
                      if (nurseSession) {
                        setNurseSession({ ...nurseSession, hospitalId: e.target.value });
                      }
                      feedback.tap();
                    }}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-slate-500">
                  {currentNurseHospital.inventory.icuAvailable} ICU Beds Available
                </span>
              </div>

              <NurseDashboard
                hospital={currentNurseHospital}
                onUpdateInventory={handleUpdateInventory}
                onAcceptIncoming={() => {
                  feedback.success();
                  showToast('Ambulance arrival accepted! ICU bed reserved.');
                }}
                onRejectIncoming={() => {
                  feedback.emergency();
                  showToast('Ambulance diverted to backup hospital.', 'alert');
                }}
              />
            </div>
          )}

          {/* 3. DRIVER: Ambulance Dispatch */}
          {currentRole === 'ambulance_dispatch' && (
            <AmbulanceDispatch
              activeDriverSession={driverSession}
              hospitals={hospitals}
              onOpenFeedback={() => setShowFeedbackModal(true)}
            />
          )}

          {/* 4. GOV / NGO PORTAL */}
          {currentRole === 'government_portal' && (
            <GovernmentPortal hospitals={hospitals} />
          )}
        </MobileFrame>
      </main>

      {/* Website Clean Compact Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              BedLink Care Grid
            </span>
            <span>Emergency: <strong className="text-rose-600">108</strong> / <strong className="text-slate-700">112</strong></span>
            <span className="hidden sm:inline">Ambulance: <strong className="text-slate-700">102</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> All {hospitals.length} Hospitals Synced
            </span>
            <span className="text-slate-300">|</span>
            <span>2-Min SLA Engine Active</span>
          </div>
        </div>
      </footer>

      {/* Offline SMS Modal */}
      {showSmsModal && (
        <SmsFallbackModal
          onClose={() => setShowSmsModal(false)}
          patientPhone={patientProfile?.phone}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <UserFeedbackModal
          role={currentRole === 'ambulance_dispatch' ? 'ambulance_crew' : 'patient'}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
}
