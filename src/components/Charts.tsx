import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { AnalyzedData } from '../types';

interface ChartsProps {
  data: AnalyzedData;
}

const COLORS = {
  pass: '#2563eb', // blue-600
  fail: '#cbd5e1', // slate-300
};

export function Charts({ data }: ChartsProps) {
  const pieData = useMemo(() => {
    const passed = data.totalMessages - data.dmarcFail;
    return [
      { name: 'DMARC Pass', value: passed },
      { name: 'DMARC Fail', value: data.dmarcFail },
    ].filter(d => d.value > 0);
  }, [data]);

  const topSourcesData = useMemo(() => {
    // Aggregate by IP
    const aggregated = Object.entries(data.sources).map(([ip, records]) => {
      let total = 0;
      let dmarcPass = 0;
      let dmarcFail = 0;
      
      records.forEach(r => {
        total += r.count;
        if (r.dkimPass || r.spfPass) {
          dmarcPass += r.count;
        } else {
          dmarcFail += r.count;
        }
      });

      return {
        ip,
        total,
        Pass: dmarcPass,
        Fail: dmarcFail
      };
    });

    // Sort by total volume and take top 10
    return aggregated.sort((a, b) => b.total - a.total).slice(0, 10);
  }, [data]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Compliance Pie Chart */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700">Overall Authentication Status</h3>
        </div>
        <div className="p-4 flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name.includes('Pass') ? COLORS.pass : COLORS.fail} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
                contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Sources Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700">Top 10 Sending Sources</h3>
        </div>
        <div className="p-4 flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSourcesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="ip" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)} tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              <Bar dataKey="Pass" stackId="a" fill={COLORS.pass} radius={[0, 0, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Fail" stackId="a" fill={COLORS.fail} radius={[2, 2, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
