import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Phone, ShieldAlert } from 'lucide-react';
import { feedback } from '../../utils/audioHaptics';

interface SmsFallbackModalProps {
  onClose: () => void;
  patientPhone?: string;
}

export const SmsFallbackModal: React.FC<SmsFallbackModalProps> = ({ onClose, patientPhone = '+91 98765 43210' }) => {
  const [smsTriageCode, setSmsTriageCode] = useState('BED SOS ICU O+ PIN 110001');
  const [sentStatus, setSentStatus] = useState(false);

  const handleSimulateSms = () => {
    feedback.emergency();
    setSentStatus(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 text-white rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Offline SMS Emergency Triage</h3>
              <p className="text-[11px] text-slate-400">Low-connectivity & zero-internet protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            When 4G/5G mobile data drops, BedLink transmits encrypted SMS strings to National Emergency Shortcode <strong>108 / 56161</strong> to query ICU beds and dispatch ambulances without internet.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Generated Emergency SMS Payload</label>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-400 select-all">
            {smsTriageCode}
          </div>
          <p className="text-[10px] text-slate-400">
            Format: [BED] [SOS] [BED_TYPE] [BLOOD_GROUP] [PINCODE]
          </p>
        </div>

        {sentStatus ? (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1 text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>SMS Gateway ACK Received (Carrier ID #IN-AIRTEL-108)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Incoming SMS: &ldquo;BedLink: Apollo Grace held 1 ICU Bed for {patientPhone}. ALS-101 driver Rajesh (+919871100223) responding. ETA 6m.&rdquo;
            </p>
          </div>
        ) : (
          <button
            onClick={handleSimulateSms}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Cellular SMS Dispatch</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl"
        >
          Close SMS Gateway
        </button>
      </div>
    </div>
  );
};
