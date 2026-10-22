import React from 'react';
import type { AnalyzedData } from '../types';

export function DomainPolicies({ data }: { data: AnalyzedData }) {
  if (!data.policies || data.policies.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-700">Domain DMARC Policies Published</h3>
          <p className="text-xs text-slate-400 mt-0.5">DNS TXT record instructions telling email receivers how to treat unauthorized emails</p>
        </div>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-3 border-b border-slate-200">Domain</th>
              <th className="px-6 py-3 border-b border-slate-200">Policy (p)</th>
              <th className="px-6 py-3 border-b border-slate-200">Subdomain Policy (sp)</th>
              <th className="px-6 py-3 border-b border-slate-200">DKIM Alignment (adkim)</th>
              <th className="px-6 py-3 border-b border-slate-200">SPF Alignment (aspf)</th>
              <th className="px-6 py-3 border-b border-slate-200">Percentage (pct)</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {data.policies.map((policy, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                  {policy.domain}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    policy.p === 'reject' ? 'bg-green-100 text-green-700' :
                    policy.p === 'quarantine' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {policy.p || 'none'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    policy.sp === 'reject' ? 'bg-green-100 text-green-700' :
                    policy.sp === 'quarantine' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {policy.sp || 'none'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">
                    {policy.adkim === 's' ? 'Strict' : 'Relaxed'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">
                    {policy.aspf === 's' ? 'Strict' : 'Relaxed'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {policy.pct || 100}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>💡 <strong>Quick Guide:</strong></span>
        <span><code>p=none</code>: Monitoring only (no mail is blocked)</span>
        <span><code>p=quarantine</code>: Sends fake emails to Spam</span>
        <span><code>p=reject</code>: Blocks fake emails entirely</span>
        <span><code>Relaxed</code>: Allows matching subdomains</span>
      </div>
    </div>
  );
}
