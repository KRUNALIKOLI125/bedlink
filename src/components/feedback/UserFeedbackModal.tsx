import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { feedback } from '../../utils/audioHaptics';

interface UserFeedbackModalProps {
  onClose: () => void;
  role: 'patient' | 'ambulance_crew';
}

export const UserFeedbackModal: React.FC<UserFeedbackModalProps> = ({ onClose, role }) => {
  const [rating, setRating] = useState(5);
  const [bedAccuracyRating, setBedAccuracyRating] = useState(5);
  const [slaSpeedRating, setSlaSpeedRating] = useState(5);
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedback.success();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {role === 'patient' ? 'Patient Emergency Care Feedback' : 'Ambulance Crew Handover Rating'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
            ✕
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 text-emerald-950 animate-in fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm">Thank You for Your Feedback!</h4>
            <p className="text-xs text-emerald-800">
              Your real-time review updates BedLink&apos;s hospital accuracy index and helps paramedics save lives faster.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <p className="text-slate-600">
              Help us verify hospital data freshness and emergency response speed.
            </p>

            {/* Overall Experience */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Overall Care & Booking Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      feedback.tap();
                      setRating(star);
                    }}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="font-bold text-slate-700 ml-1">{rating} / 5</span>
              </div>
            </div>

            {/* Bed Match Accuracy */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Hospital Bed Availability Accuracy</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      feedback.tap();
                      setBedAccuracyRating(star);
                    }}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        star <= bedAccuracyRating ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[11px] text-slate-500">(Was the bed ready on arrival?)</span>
              </div>
            </div>

            {/* 2-Minute SLA Speed */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">2-Minute Confirmation SLA Speed</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      feedback.tap();
                      setSlaSpeedRating(star);
                    }}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        star <= slaSpeedRating ? 'fill-blue-500 text-blue-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Comments / Critical Observations</label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. ICU staff was prepped, oxygen hooked up within 40 seconds..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Submit Post-Emergency Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
