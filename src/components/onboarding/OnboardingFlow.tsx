import React, { useState, useEffect, useRef } from 'react';
import { PatientProfile, BloodGroup, SchemeType } from '../../types';
import { DEMO_PREFILLED_PROFILE } from '../../data/mockData';
import { feedback } from '../../utils/audioHaptics';
import { DigitalHealthCard } from './DigitalHealthCard';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Phone,
  HeartPulse,
  User,
  Sparkles,
  Zap,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (profile: PatientProfile) => void;
  onEmergencyBypass: () => void;
  existingProfile?: PatientProfile | null;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onEmergencyBypass,
  existingProfile
}) => {
  const [step, setStep] = useState<number>(existingProfile ? 5 : 0);

  // Form State
  const [phone, setPhone] = useState(existingProfile?.phone || '');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [simulatedIncomingOtp, setSimulatedIncomingOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Patient Identity
  const [fullName, setFullName] = useState(existingProfile?.fullName || '');
  const [age, setAge] = useState<number>(existingProfile?.age || 32);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(existingProfile?.gender || 'male');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(existingProfile?.bloodGroup || 'O+');

  // Medical baseline
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(existingProfile?.allergies || ['Penicillin']);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(existingProfile?.chronicConditions || ['Hypertension']);

  // Emergency SOS Contact
  const [contactName, setContactName] = useState(existingProfile?.emergencyContact.name || 'Rohan Sharma');
  const [contactRelation, setContactRelation] = useState(existingProfile?.emergencyContact.relationship || 'Spouse');
  const [contactPhone, setContactPhone] = useState(existingProfile?.emergencyContact.phone || '+91 98765 00000');

  // FinTech & Insurance
  const [hasGovScheme, setHasGovScheme] = useState(existingProfile?.hasGovScheme ?? true);
  const [schemeType, setSchemeType] = useState<SchemeType>(existingProfile?.schemeType || 'PM-JAY');
  const [schemeId, setSchemeId] = useState(existingProfile?.schemeId || 'PMJAY-DEL-2025-9921');
  const [abhaId, setAbhaId] = useState(existingProfile?.abhaId || '91-8821-4451-9012');
  const [consentGiven, setConsentGiven] = useState(existingProfile?.consentEmergencyAccess ?? true);

  // Completed Profile
  const [completedProfile, setCompletedProfile] = useState<PatientProfile | null>(existingProfile || null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      feedback.emergency();
      setOtpError('Enter a valid 10-digit mobile number');
      return;
    }
    setOtpError('');
    feedback.tap();
    const generatedOtp = '482910';
    setSimulatedIncomingOtp(generatedOtp);
    setOtpSent(true);
    setOtpTimer(30);
    setOtpCode(['4', '8', '2', '9', '1', '0']);
  };

  const handlePrefillDemo = () => {
    feedback.tap();
    setPhone(DEMO_PREFILLED_PROFILE.phone);
    setFullName(DEMO_PREFILLED_PROFILE.fullName);
    setAge(DEMO_PREFILLED_PROFILE.age);
    setGender(DEMO_PREFILLED_PROFILE.gender);
    setBloodGroup(DEMO_PREFILLED_PROFILE.bloodGroup);
    setSelectedAllergies(DEMO_PREFILLED_PROFILE.allergies);
    setSelectedConditions(DEMO_PREFILLED_PROFILE.chronicConditions);
    setContactName(DEMO_PREFILLED_PROFILE.emergencyContact.name);
    setContactRelation(DEMO_PREFILLED_PROFILE.emergencyContact.relationship);
    setContactPhone(DEMO_PREFILLED_PROFILE.emergencyContact.phone);
    setHasGovScheme(DEMO_PREFILLED_PROFILE.hasGovScheme);
    setSchemeType(DEMO_PREFILLED_PROFILE.schemeType);
    setSchemeId(DEMO_PREFILLED_PROFILE.schemeId || '');
    setAbhaId(DEMO_PREFILLED_PROFILE.abhaId || '');

    setStep(1);
    setOtpSent(true);
    setSimulatedIncomingOtp('482910');
    setOtpCode(['4', '8', '2', '9', '1', '0']);
  };

  const handleVerifyOtp = () => {
    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      feedback.emergency();
      setOtpError('Enter 6-digit verification code');
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      feedback.success();
      setStep(2);
    }, 400);
  };

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const commonAllergies = ['Penicillin', 'Sulfa', 'Aspirin', 'Latex', 'Peanuts'];
  const commonConditions = ['Hypertension', 'Diabetes', 'Cardiac Stent', 'Asthma'];

  const toggleAllergy = (item: string) => {
    feedback.tap();
    setSelectedAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const toggleCondition = (item: string) => {
    feedback.tap();
    setSelectedConditions((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleFinalizeRegistration = () => {
    if (!consentGiven) {
      feedback.emergency();
      setErrorMessage('Please check consent to proceed');
      return;
    }

    const newProfile: PatientProfile = {
      id: `pt-${Date.now().toString().slice(-6)}`,
      fullName: fullName || 'Patient ' + phone.slice(-4),
      phone: phone || '+91 98765 43210',
      age: Number(age) || 30,
      gender,
      bloodGroup,
      allergies: selectedAllergies,
      chronicConditions: selectedConditions,
      emergencyContact: {
        name: contactName || 'Primary Contact',
        relationship: contactRelation || 'Spouse',
        phone: contactPhone || phone,
        notifyOnSOS: true,
      },
      hasGovScheme,
      schemeType: hasGovScheme ? schemeType : 'None',
      schemeId: hasGovScheme ? schemeId : undefined,
      abhaId,
      isAbhaVerified: true,
      consentEmergencyAccess: true,
      registeredAt: new Date().toISOString(),
      isEmergencyGuest: false,
    };

    setCompletedProfile(newProfile);
    feedback.success();
    setStep(5);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Step Indicator Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
              {step < 5 ? step + 1 : 5}/5
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                {step === 0 && 'Patient Phone Verification'}
                {step === 1 && 'Enter OTP Code'}
                {step === 2 && 'Personal Details'}
                {step === 3 && 'Medical & Emergency Contact'}
                {step === 4 && 'PM-JAY Scheme & Consent'}
                {step === 5 && 'Digital Health Card Ready'}
              </h2>
              <span className="text-xs text-slate-500">Fast 2-minute registration</span>
            </div>
          </div>

          <button
            onClick={() => {
              feedback.emergency();
              onEmergencyBypass();
            }}
            className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            <span>Emergency Bypass</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 0: Phone Number */}
      {step === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Enter Mobile Number</label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700">
                +91
              </div>
              <input
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            {otpError && <p className="text-xs text-rose-600 mt-1">{otpError}</p>}
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                handleSendOtp();
                setStep(1);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Send OTP Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePrefillDemo}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>1-Tap Demo: Auto-Fill Ananya Sharma</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 1: OTP Entry */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs text-slate-500">Verification code sent to {phone}</span>
            {simulatedIncomingOtp && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-800 font-bold inline-block">
                Demo Code: {simulatedIncomingOtp}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpInputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const newCode = [...otpCode];
                  newCode[index] = e.target.value.slice(-1);
                  setOtpCode(newCode);
                  if (e.target.value && index < 5) {
                    otpInputRefs.current[index + 1]?.focus();
                  }
                }}
                className="w-10 h-11 text-center font-bold font-mono text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(0)}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900"
            >
              Change Phone
            </button>
            <button
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <span>Verify & Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Personal Details */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 bg-white"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 bg-white font-bold"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <span>Next: Medical & Contact</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Medical & SOS Contact */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Known Allergies</label>
              <div className="flex flex-wrap gap-1.5">
                {commonAllergies.map((allergy) => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      selectedAllergies.includes(allergy)
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Chronic Conditions</label>
              <div className="flex flex-wrap gap-1.5">
                {commonConditions.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      selectedConditions.includes(cond)
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-2">Emergency SOS Contact</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
                <input
                  type="tel"
                  placeholder="Contact Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <span>Next: Insurance & Consent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: PM-JAY & Consent */}
      {step === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer">
              <div>
                <span className="font-bold text-emerald-900 text-xs block">Ayushman Bharat (PM-JAY) Empanelled</span>
                <span className="text-[11px] text-emerald-700">Enables cashless emergency hospital holds</span>
              </div>
              <input
                type="checkbox"
                checked={hasGovScheme}
                onChange={(e) => setHasGovScheme(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
            </label>

            {hasGovScheme && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">PM-JAY Card ID</label>
                  <input
                    type="text"
                    value={schemeId}
                    onChange={(e) => setSchemeId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">ABHA Health ID</label>
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>
            )}

            <label className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
              />
              <span>I authorize BedLink to transmit blood group and vital records to destination ER during emergency triage.</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={handleFinalizeRegistration}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Generate Health Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Finished Health Pass Card */}
      {step === 5 && completedProfile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Registration Complete! Your Digital Pass is Ready.</span>
          </div>

          <div className="max-w-sm mx-auto">
            <DigitalHealthCard profile={completedProfile} />
          </div>

          <button
            onClick={() => onComplete(completedProfile)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Proceed to Emergency Triage & Bed Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
