import React, { useMemo } from 'react';
import type { AnalyzedData } from '../types';

export function Recommendations({ data }: { data: AnalyzedData }) {
  const recommendations = useMemo(() => {
    const recs = [];
    
    const passRate = data.complianceRate;
    const hasSpfIssues = data.spfFail > 0;
    const hasDkimIssues = data.dkimFail > 0;
    
    // Overall Health
    if (passRate >= 99) {
      recs.push({
        type: 'success',
        title: 'Excellent Compliance',
        description: 'Your email authentication is highly compliant. You are ready to enforce a strict DMARC policy (p=reject) if you haven\'t already.'
      });
    } else if (passRate >= 90) {
      recs.push({
        type: 'warning',
        title: 'Good Compliance, Room for Improvement',
        description: `Your authentication rate is ${passRate.toFixed(1)}%. Review the failing IP addresses to ensure all legitimate sending services are properly authenticated before moving to p=reject.`
      });
    } else {
      recs.push({
        type: 'error',
        title: 'Low Authentication Rate',
        description: `Only ${passRate.toFixed(1)}% of your emails are passing DMARC. Do not move to p=reject until you resolve the underlying SPF and DKIM failures, or legitimate mail will be blocked.`
      });
    }

    // SPF specific
    if (hasSpfIssues) {
      recs.push({
        type: 'info',
        title: 'SPF Failures Detected',
        description: 'Emails failed SPF checks. Ensure that all legitimate sending IPs and third-party services (like Mailchimp, Sendgrid, Zendesk) are included in your domain\'s SPF record. Note: SPF fails on forwarded emails.'
      });
    }

    // DKIM specific
    if (hasDkimIssues) {
      recs.push({
        type: 'info',
        title: 'DKIM Failures Detected',
        description: 'Emails failed DKIM signatures. Check if your third-party senders are signing emails with your domain keys. Setting up DKIM is crucial because it survives email forwarding (unlike SPF).'
      });
    }

    return recs;
  }, [data]);

  const healthInsight = recommendations[0];
  const actionList = recommendations.slice(1);

  const insightBorderColor = 
    healthInsight.type === 'error' ? 'border-l-red-500' :
    healthInsight.type === 'warning' ? 'border-l-amber-400' :
    'border-l-green-500';

  const insightTextColor = 
    healthInsight.type === 'error' ? 'text-red-600' :
    healthInsight.type === 'warning' ? 'text-amber-600' :
    'text-green-600';

  return (
    <div className="flex flex-col space-y-6 h-full">
      <div className={`bg-white border-l-4 ${insightBorderColor} border border-slate-200 p-6 rounded shadow-sm`}>
        <h4 className={`text-xs font-bold ${insightTextColor} uppercase mb-2`}>Security Insight</h4>
        <p className="text-sm text-slate-700 leading-relaxed">
          {healthInsight.description}
        </p>
      </div>

      <div className="bg-slate-800 text-white p-6 rounded shadow-lg flex-1 flex flex-col">
        <h4 className="text-xs font-bold text-blue-400 uppercase mb-4 tracking-widest">Recommended Actions</h4>
        {actionList.length > 0 ? (
          <ul className="space-y-4 flex-1">
            {actionList.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold">{rec.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
            No further actions required.
          </div>
        )}
      </div>
    </div>
  );
}
