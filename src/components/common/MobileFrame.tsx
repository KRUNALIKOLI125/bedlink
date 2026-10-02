import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  isActive: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, isActive }) => {
  if (!isActive) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
        {children}
      </div>
    );
  }

  return (
    <div className="py-4 flex justify-center items-start min-h-[calc(100vh-60px)] bg-slate-200/70 p-2 sm:p-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-300 overflow-hidden flex flex-col min-h-[720px]">
        <div className="h-7 bg-slate-900 text-white px-4 flex items-center justify-between text-[11px] font-medium shrink-0">
          <span>108 Emergency Mobile View</span>
          <span className="text-emerald-400 font-bold">LIVE</span>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50 p-3">
          {children}
        </div>
      </div>
    </div>
  );
};
