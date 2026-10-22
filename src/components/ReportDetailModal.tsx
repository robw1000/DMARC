import React, { useState, useMemo } from 'react';
import { X, Search, CheckCircle, AlertTriangle, XCircle, Info, Shield, Server, FileCode, Copy, Check, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { DmarcReport, DmarcRecord } from '../types';
import { formatTimestamp, formatDuration, getPolicyExplanation, getDispositionExplanation, getRecordVerdict, identifyKnownSender } from '../lib/explainer-utils';

interface ReportDetailModalProps {
  report: DmarcReport | null;
  onClose: () => void;
}

export function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'records' | 'policy' | 'raw'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'fail' | 'spf-fail' | 'dkim-fail'>('all');
  const [expandedRecordIdx, setExpandedRecordIdx] = useState<number | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!report) return null;

  const policyExp = getPolicyExplanation(report.policyPublished.p, report.policyPublished.pct);

  const filteredRecords = useMemo(() => {
    return report.records.filter((rec) => {
      const matchesSearch =
        rec.sourceIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.headerFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        identifyKnownSender(rec.sourceIp).name.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      const isPass = rec.dkimPass || rec.spfPass;
      if (filterStatus === 'pass') return isPass;
      if (filterStatus === 'fail') return !isPass;
      if (filterStatus === 'spf-fail') return !rec.spfPass;
      if (filterStatus === 'dkim-fail') return !rec.dkimPass;
      return true;
    });
  }, [report.records, searchTerm, filterStatus]);

  const toggleExpand = (idx: number) => {
    setExpandedRecordIdx(prev => (prev === idx ? null : idx));
  };

  const handleCopyRaw = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {report.metadata.orgName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                  DMARC Aggregate Report
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Report ID: <span className="font-mono text-slate-300">{report.metadata.reportId}</span>
                {report.fileName && ` • File: ${report.fileName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader / Tabs */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                activeTab === 'records'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sending Records ({report.records.length})
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                activeTab === 'policy'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Policy & Alignment Explained
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                activeTab === 'raw'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Data Export
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>Period:</span>
            <span className="font-semibold text-slate-800">
              {formatTimestamp(report.metadata.dateRange.begin)} to {formatTimestamp(report.metadata.dateRange.end)}
            </span>
            <span className="text-slate-400">({formatDuration(report.metadata.dateRange.begin, report.metadata.dateRange.end)})</span>
          </div>
        </div>

        {/* Executive Summary Banner (Easy for Non-Experts) */}
        <div className="px-6 py-3.5 bg-blue-50/60 border-b border-blue-100 flex items-start space-x-3 shrink-0">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Summary in Plain English: </span>
            <span>
              <strong>{report.metadata.orgName}</strong> received{' '}
              <strong>{new Intl.NumberFormat('en-US').format(report.summary.totalMessages)}</strong> emails claiming to be from{' '}
              <strong>{report.policyPublished.domain}</strong>. Of these,{' '}
              <strong className="text-blue-700">{report.summary.passRate.toFixed(1)}% ({new Intl.NumberFormat('en-US').format(report.summary.passCount)})</strong> passed authentication.
              {report.summary.failCount > 0 ? (
                <span> <strong className="text-red-600">{new Intl.NumberFormat('en-US').format(report.summary.failCount)} emails failed</strong> authentication and were handled according to your published &apos;{report.policyPublished.p}&apos; policy.</span>
              ) : (
                <span> All messages passed security checks with zero unauthorized failures!</span>
              )}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Volume</span>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {new Intl.NumberFormat('en-US').format(report.summary.totalMessages)}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DMARC Pass Rate</span>
              <p className={`text-xl font-bold mt-1 ${report.summary.passRate >= 90 ? 'text-blue-600' : 'text-amber-600'}`}>
                {report.summary.passRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SPF Pass Count</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {new Intl.NumberFormat('en-US').format(report.summary.spfPassCount)}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DKIM Pass Count</span>
              <p className="text-xl font-bold text-indigo-600 mt-1">
                {new Intl.NumberFormat('en-US').format(report.summary.dkimPassCount)}
              </p>
            </div>
          </div>

          {activeTab === 'records' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by IP, sender host, or domain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-500 mr-1">Filter:</span>
                  {(['all', 'pass', 'fail', 'spf-fail', 'dkim-fail'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterStatus(filter)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                        filterStatus === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'all' && 'All Records'}
                      {filter === 'pass' && 'Passing'}
                      {filter === 'fail' && 'Failing'}
                      {filter === 'spf-fail' && 'SPF Failed'}
                      {filter === 'dkim-fail' && 'DKIM Failed'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Records List */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Sending Server & IP</th>
                      <th className="px-4 py-3 text-right">Messages</th>
                      <th className="px-4 py-3">Evaluation Verdict</th>
                      <th className="px-4 py-3">Delivery Action</th>
                      <th className="px-4 py-3 text-right">Technical Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((record, idx) => {
                      const sender = identifyKnownSender(record.sourceIp, record.headerFrom, record.authResults);
                      const verdict = getRecordVerdict(record);
                      const disp = getDispositionExplanation(record.disposition);
                      const isExpanded = expandedRecordIdx === idx;

                      return (
                        <React.Fragment key={idx}>
                          <tr className={`hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                            <td className="px-4 py-3.5">
                              <div className="flex items-start space-x-2">
                                <Server className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                                    <span>{sender.name}</span>
                                  </div>
                                  <div className="font-mono text-slate-500 text-[11px] mt-0.5">
                                    {record.sourceIp}
                                  </div>
                                  {record.headerFrom && (
                                    <div className="text-[10px] text-slate-400">
                                      Header From: {record.headerFrom}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-right font-bold text-slate-700">
                              {new Intl.NumberFormat('en-US').format(record.count)}
                            </td>

                            <td className="px-4 py-3.5">
                              <div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${verdict.badgeClass}`}>
                                  {verdict.status === 'safe' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {verdict.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                  {verdict.status === 'danger' && <XCircle className="w-3 h-3 mr-1" />}
                                  {verdict.label}
                                </span>
                                <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-normal">
                                  {verdict.summary}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${disp.badgeClass}`}>
                                {disp.label}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {disp.description}
                              </p>
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => toggleExpand(idx)}
                                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Technical Breakdown */}
                          {isExpanded && (
                            <tr className="bg-slate-50/90 border-b border-slate-200">
                              <td colSpan={5} className="px-6 py-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                      Authentication Breakdown & Signatures
                                    </h4>
                                    <span className="text-[11px] text-slate-500 italic">
                                      Recommendation: {verdict.recommendation}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* SPF Section */}
                                    <div className="bg-white p-3 rounded border border-slate-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-700 text-xs">SPF Evaluation</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          record.spfPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                          {record.spfPass ? 'SPF ALIGNED & PASSED' : 'SPF FAILED'}
                                        </span>
                                      </div>
                                      {record.authResults?.spf && record.authResults.spf.length > 0 ? (
                                        <div className="space-y-1">
                                          {record.authResults.spf.map((s, sIdx) => (
                                            <div key={sIdx} className="text-[11px] text-slate-600 flex justify-between bg-slate-50 p-1.5 rounded">
                                              <span>Domain: <strong>{s.domain || 'N/A'}</strong> {s.scope ? `(scope: ${s.scope})` : ''}</span>
                                              <span className="font-mono font-semibold uppercase">{s.result}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-[11px] text-slate-400 italic">No detailed SPF auth result provided in XML record.</p>
                                      )}
                                      <p className="text-[10px] text-slate-400 mt-2">
                                        Checks if IP {record.sourceIp} is authorized in DNS SPF record.
                                      </p>
                                    </div>

                                    {/* DKIM Section */}
                                    <div className="bg-white p-3 rounded border border-slate-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-700 text-xs">DKIM Evaluation</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          record.dkimPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                          {record.dkimPass ? 'DKIM ALIGNED & PASSED' : 'DKIM FAILED'}
                                        </span>
                                      </div>
                                      {record.authResults?.dkim && record.authResults.dkim.length > 0 ? (
                                        <div className="space-y-1">
                                          {record.authResults.dkim.map((d, dIdx) => (
                                            <div key={dIdx} className="text-[11px] text-slate-600 flex justify-between bg-slate-50 p-1.5 rounded">
                                              <span>Domain: <strong>{d.domain || 'N/A'}</strong> {d.selector ? `(selector: ${d.selector})` : ''}</span>
                                              <span className="font-mono font-semibold uppercase">{d.result}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-[11px] text-slate-400 italic">No DKIM signature present on message.</p>
                                      )}
                                      <p className="text-[10px] text-slate-400 mt-2">
                                        Checks cryptographic digital signature attached to email headers.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Policy Override Reason if present */}
                                  {record.reasons && record.reasons.length > 0 && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                                      <strong className="font-bold">Receiver Policy Override: </strong>
                                      {record.reasons.map((r, rIdx) => (
                                        <span key={rIdx} className="ml-1">
                                          Reason: <code className="bg-amber-100 px-1 py-0.5 rounded">{r.type}</code> {r.comment ? `(${r.comment})` : ''}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No sending records matched your search or filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-6">
              <div className={`p-5 rounded border ${policyExp.badgeColor}`}>
                <div className="flex items-center space-x-2 font-bold mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wide">{policyExp.title}</span>
                </div>
                <p className="text-xs leading-relaxed font-normal">
                  {policyExp.description}
                </p>
                <div className="mt-3 text-xs font-semibold pt-3 border-t border-slate-200/60">
                  <span>Guidance: </span>
                  <span className="font-normal">{policyExp.actionAdvice}</span>
                </div>
              </div>

              {/* Policy Parameters Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Published DMARC Record Tags Explained
                  </h4>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Tag</th>
                      <th className="px-4 py-2.5">Published Value</th>
                      <th className="px-4 py-2.5">What this means in plain English</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">domain</td>
                      <td className="px-4 py-3 font-mono font-semibold">{report.policyPublished.domain}</td>
                      <td className="px-4 py-3 text-slate-600">The primary root domain covered by this policy.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">p</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-100 text-slate-800">
                          {report.policyPublished.p}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        Primary policy applied to unauthenticated emails. &apos;none&apos; monitors, &apos;quarantine&apos; sends to spam, &apos;reject&apos; drops.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">sp</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-100 text-slate-800">
                          {report.policyPublished.sp || report.policyPublished.p}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        Subdomain policy applied to subdomains (e.g. mail.domain.com).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">pct</td>
                      <td className="px-4 py-3 font-bold">{report.policyPublished.pct}%</td>
                      <td className="px-4 py-3 text-slate-600">
                        Percentage of failing emails subject to the policy (100% is standard).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">adkim</td>
                      <td className="px-4 py-3 font-semibold">
                        {report.policyPublished.adkim === 's' ? 'Strict (s)' : 'Relaxed (r)'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        DKIM alignment mode. Relaxed allows subdomains to sign for parent domains.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">aspf</td>
                      <td className="px-4 py-3 font-semibold">
                        {report.policyPublished.aspf === 's' ? 'Strict (s)' : 'Relaxed (r)'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        SPF alignment mode. Relaxed allows subdomains to authorize parent domains.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Parsed DMARC Report JSON Structure
                  </h4>
                  <p className="text-xs text-slate-500">
                    Complete representation of the XML aggregate report.
                  </p>
                </div>
                <button
                  onClick={handleCopyRaw}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center space-x-1.5 transition-colors"
                >
                  {copiedRaw ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRaw ? 'Copied to Clipboard' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-96">
                <pre>{JSON.stringify(report, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Reporter contact: <span className="font-mono text-slate-700">{report.metadata.email || 'None specified'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded transition-colors"
          >
            Close Report Details
          </button>
        </div>
      </div>
    </div>
  );
}
