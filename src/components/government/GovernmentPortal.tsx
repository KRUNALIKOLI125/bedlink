import React from 'react';
import { Hospital } from '../../types';
import {
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface GovernmentPortalProps {
  hospitals: Hospital[];
}

export const GovernmentPortal: React.FC<GovernmentPortalProps> = ({ hospitals }) => {
  const totalIcuBeds = hospitals.reduce((sum, h) => sum + h.inventory.icuTotal, 0);
  const availIcuBeds = hospitals.reduce((sum, h) => sum + h.inventory.icuAvailable, 0);
  const totalVentilators = hospitals.reduce((sum, h) => sum + h.inventory.ventilatorTotal, 0);
  const availVentilators = hospitals.reduce((sum, h) => sum + h.inventory.ventilatorAvailable, 0);
  const pmJayHospitals = hospitals.filter((h) => h.acceptsPmJay).length;

  const icuOccupancyRate = Math.round(((totalIcuBeds - availIcuBeds) / totalIcuBeds) * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">City Health Authority & NGO Surveillance</h2>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                National Health Grid
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live City-Wide Triage Surveillance · Emergency Surge Capacity & PM-JAY Cashless Monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-semibold">City Grid: Normal Surge</span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ICU Bed Occupancy</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900">{icuOccupancyRate}%</span>
            <span className="text-[11px] font-semibold text-rose-600 flex items-center">
              <TrendingUp className="w-3 h-3" /> +4%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {availIcuBeds} of {totalIcuBeds} ICU beds open
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">2-Min SLA Compliance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-600">96.8%</span>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center">
              <CheckCircle2 className="w-3 h-3" /> Target &gt;95%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Avg response time: 48 seconds</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Ventilators</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-blue-600">{availVentilators}</span>
            <span className="text-xs text-slate-400 font-normal">/ {totalVentilators} units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Adequate citywide inventory</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PM-JAY Cashless Network</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-600">{pmJayHospitals} / {hospitals.length}</span>
            <span className="text-[11px] font-semibold text-emerald-700">Empanelled</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Real-time cashless processing</p>
        </div>
      </div>

      {/* Hospital Network Status Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm">Hospital Network Status Table</span>
          <span className="text-xs text-slate-500">{hospitals.length} Monitored Facilities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Hospital</th>
                <th className="py-2.5 px-4">Trauma Level</th>
                <th className="py-2.5 px-4">ICU Open</th>
                <th className="py-2.5 px-4">Ventilators</th>
                <th className="py-2.5 px-4">Oxygen</th>
                <th className="py-2.5 px-4">PM-JAY</th>
                <th className="py-2.5 px-4">Freshness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {hospitals.map((h) => {
                const isFresh = h.inventory.lastUpdatedMinutesAgo <= 5;

                return (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{h.name}</span>
                      <span className="text-[11px] text-slate-400">{h.address}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">{h.traumaLevel}</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold ${h.inventory.icuAvailable > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {h.inventory.icuAvailable} / {h.inventory.icuTotal}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {h.inventory.ventilatorAvailable} / {h.inventory.ventilatorTotal}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-600">
                      {h.inventory.oxygenAvailable} / {h.inventory.oxygenTotal}
                    </td>
                    <td className="py-3 px-4">
                      {h.acceptsPmJay ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          YES
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                          NO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${isFresh ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {h.inventory.lastUpdatedMinutesAgo}m ago
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
