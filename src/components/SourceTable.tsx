import React, { useState, useMemo } from 'react';
import type { AnalyzedData } from '../types';
import { identifyKnownSender } from '../lib/explainer-utils';
import { Server } from 'lucide-react';

export function SourceTable({ data }: { data: AnalyzedData }) {
  const [searchTerm, setSearchTerm] = useState('');

  const tableData = useMemo(() => {
    return Object.entries(data.sources).map(([ip, records]) => {
      let total = 0;
      let dkimPasses = 0;
      let spfPasses = 0;
      let dmarcPasses = 0;

      records.forEach(r => {
        total += r.count;
        if (r.dkimPass) dkimPasses += r.count;
        if (r.spfPass) spfPasses += r.count;
        if (r.dkimPass || r.spfPass) dmarcPasses += r.count;
      });

      const senderInfo = identifyKnownSender(ip);

      return {
        ip,
        senderName: senderInfo.name,
        category: senderInfo.category,
        total,
        dkimPassRate: (dkimPasses / total) * 100,
        spfPassRate: (spfPasses / total) * 100,
        dmarcPassRate: (dmarcPasses / total) * 100,
      };
    }).sort((a, b) => b.total - a.total);
  }, [data]);

  const filteredData = tableData.filter(row => 
    row.ip.includes(searchTerm) || 
    row.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden h-full">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-700">Source Servers & Sending IPs</h3>
          <p className="text-xs text-slate-400 mt-0.5">Identified email transmission servers evaluated in reports</p>
        </div>
        <div className="relative">
          <input
            type="text"
            className="block w-full sm:w-60 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Search IP or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
            <tr>
              <th className="px-6 py-3 border-b border-slate-200 bg-slate-50">Sending Server / IP</th>
              <th className="px-6 py-3 border-b border-slate-200 bg-slate-50 text-right">Volume</th>
              <th className="px-6 py-3 border-b border-slate-200 bg-slate-50">DMARC Pass</th>
              <th className="px-6 py-3 border-b border-slate-200 bg-slate-50">SPF Pass</th>
              <th className="px-6 py-3 border-b border-slate-200 bg-slate-50">DKIM Pass</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filteredData.map((row) => (
              <tr key={row.ip} className="hover:bg-slate-50/50">
                <td className="px-6 py-3.5">
                  <div className="flex items-center space-x-2">
                    <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-slate-800">{row.senderName}</div>
                      <div className="font-mono text-slate-500 text-[11px]">{row.ip}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5 font-semibold text-right text-xs">
                  {new Intl.NumberFormat('en-US').format(row.total)}
                </td>
                <td className="px-6 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    row.dmarcPassRate >= 90 ? 'bg-green-100 text-green-700' : 
                    row.dmarcPassRate >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {row.dmarcPassRate.toFixed(1)}%
                  </span>
                </td>
                <td className={`px-6 py-3.5 text-xs font-semibold ${row.spfPassRate >= 90 ? 'text-green-600' : row.spfPassRate >= 50 ? 'text-amber-500' : 'text-red-600'}`}>
                  {row.spfPassRate.toFixed(1)}%
                </td>
                <td className={`px-6 py-3.5 text-xs font-semibold ${row.dkimPassRate >= 90 ? 'text-green-600' : row.dkimPassRate >= 50 ? 'text-amber-500' : 'text-red-600'}`}>
                  {row.dkimPassRate.toFixed(1)}%
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs">
                  No source servers found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
