import React from 'react';
import type { AnalyzedData } from '../types';

interface KPICardsProps {
  data: AnalyzedData;
}

export function KPICards({ data }: KPICardsProps) {
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Messages */}
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Messages</span>
        <div className="flex items-baseline space-x-2 mt-4">
          <span className="text-3xl font-bold text-slate-800">
            {formatNumber(data.totalMessages)}
          </span>
        </div>
      </div>

      {/* Compliance Rate */}
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">DMARC Compliance</span>
        <div className="flex items-baseline space-x-2 mt-4">
          <span className={`text-3xl font-bold ${data.complianceRate > 90 ? 'text-blue-600' : 'text-amber-500'}`}>
            {data.complianceRate.toFixed(1)}%
          </span>
          <div className="flex-1 max-w-[80px] h-1 bg-slate-100 rounded-full overflow-hidden self-center ml-auto">
            <div className="h-full bg-blue-600" style={{ width: `${data.complianceRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* SPF Failures */}
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SPF Failures</span>
        <div className="flex items-baseline space-x-2 mt-4">
          <span className="text-3xl font-bold text-amber-500">
            {formatNumber(data.spfFail)}
          </span>
        </div>
      </div>

      {/* DKIM Failures */}
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">DKIM Failures</span>
        <div className="flex items-baseline space-x-2 mt-4">
          <span className="text-3xl font-bold text-red-500">
            {formatNumber(data.dkimFail)}
          </span>
        </div>
      </div>
    </section>
  );
}
