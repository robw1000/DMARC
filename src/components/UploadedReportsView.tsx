import React, { useState, useMemo } from 'react';
import { FileText, Search, ArrowLeft, ExternalLink, Trash2, Shield, CheckCircle2, AlertTriangle, Calendar, Building, Upload, Download, Sparkles } from 'lucide-react';
import type { DmarcReport } from '../types';
import { formatTimestamp, formatDuration, getPolicyExplanation } from '../lib/explainer-utils';
import { NonExpertExplainer } from './NonExpertExplainer';

interface UploadedReportsViewProps {
  reports: DmarcReport[];
  onSelectReport: (report: DmarcReport) => void;
  onDeleteReport: (reportId: string) => void;
  onBackToDashboard: () => void;
  onLoadSamples: () => void;
}

export function UploadedReportsView({
  reports,
  onSelectReport,
  onDeleteReport,
  onBackToDashboard,
  onLoadSamples,
}: UploadedReportsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompliance, setFilterCompliance] = useState<'all' | 'perfect' | 'issues'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'volume' | 'passRate'>('date');

  const filteredReports = useMemo(() => {
    let result = reports.filter((rep) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        rep.metadata.orgName.toLowerCase().includes(query) ||
        rep.policyPublished.domain.toLowerCase().includes(query) ||
        rep.metadata.reportId.toLowerCase().includes(query) ||
        (rep.fileName && rep.fileName.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (filterCompliance === 'perfect') return rep.summary.passRate >= 100;
      if (filterCompliance === 'issues') return rep.summary.passRate < 100;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'volume') return b.summary.totalMessages - a.summary.totalMessages;
      if (sortBy === 'passRate') return a.summary.passRate - b.summary.passRate; // lowest first to see problems
      return (b.metadata.dateRange.end || 0) - (a.metadata.dateRange.end || 0);
    });

    return result;
  }, [reports, searchTerm, filterCompliance, sortBy]);

  const totalEmails = useMemo(() => reports.reduce((acc, r) => acc + r.summary.totalMessages, 0), [reports]);
  const avgPassRate = useMemo(() => {
    if (totalEmails === 0) return 0;
    const totalPass = reports.reduce((acc, r) => acc + r.summary.passCount, 0);
    return (totalPass / totalEmails) * 100;
  }, [reports, totalEmails]);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Dashboard
          </button>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Uploaded DMARC Reports ({reports.length})
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            View granular details, security records, and non-expert explanations for each uploaded receiver report.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {reports.length === 0 && (
            <button
              onClick={onLoadSamples}
              className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded flex items-center transition-colors border border-blue-200"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Load Sample Reports
            </button>
          )}
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded transition-colors"
          >
            Dashboard Overview
          </button>
        </div>
      </div>

      {/* Non-Expert Explainer Card */}
      <NonExpertExplainer defaultOpen={false} />

      {/* KPI Stats for Reports */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reports Loaded</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{reports.length}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Emails Analyzed</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {new Intl.NumberFormat('en-US').format(totalEmails)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Combined Pass Rate</span>
            <p className={`text-2xl font-bold mt-1 ${avgPassRate >= 95 ? 'text-blue-600' : 'text-amber-500'}`}>
              {avgPassRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unique Receivers</span>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {new Set(reports.map(r => r.metadata.orgName)).size} Providers
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {reports.length > 0 && (
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reports by organization, domain, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-slate-500 mr-1">Status:</span>
              <button
                onClick={() => setFilterCompliance('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  filterCompliance === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterCompliance('issues')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  filterCompliance === 'issues' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                With Failures
              </button>
              <button
                onClick={() => setFilterCompliance('perfect')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  filterCompliance === 'perfect' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                100% Pass
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-xs text-slate-500 mr-1">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 text-xs border border-slate-200 rounded bg-white text-slate-700 outline-none"
              >
                <option value="date">Date (Newest)</option>
                <option value="volume">Volume (Highest)</option>
                <option value="passRate">Compliance (Lowest first)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const policyExp = getPolicyExplanation(report.policyPublished.p, report.policyPublished.pct);
          const hasFailures = report.summary.failCount > 0;

          return (
            <div
              key={report.id}
              className="bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col space-y-4"
            >
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-800">
                        {report.metadata.orgName}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {report.policyPublished.domain}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        report.policyPublished.p === 'reject' ? 'bg-green-100 text-green-800' :
                        report.policyPublished.p === 'quarantine' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        Policy: {report.policyPublished.p}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {formatTimestamp(report.metadata.dateRange.begin)} – {formatTimestamp(report.metadata.dateRange.end)}
                      </span>
                      <span>({formatDuration(report.metadata.dateRange.begin, report.metadata.dateRange.end)})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => onSelectReport(report)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center transition-colors shadow-xs"
                  >
                    <span>View Report Details</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                  <button
                    onClick={() => onDeleteReport(report.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove report from current session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Plain English Summary Line */}
              <div className="bg-slate-50 border-l-4 border-l-blue-500 p-3 rounded text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">Receiver Feedback: </span>
                <span>
                  <strong>{report.metadata.orgName}</strong> received{' '}
                  <strong>{new Intl.NumberFormat('en-US').format(report.summary.totalMessages)}</strong> emails from this domain.{' '}
                  <strong className={report.summary.passRate >= 95 ? 'text-blue-700' : 'text-amber-700'}>
                    {report.summary.passRate.toFixed(1)}% passed authentication
                  </strong>.{' '}
                  {hasFailures ? (
                    <span className="text-red-700 font-semibold">
                      {new Intl.NumberFormat('en-US').format(report.summary.failCount)} email{report.summary.failCount !== 1 ? 's' : ''} failed security checks and triggered your &apos;{report.policyPublished.p}&apos; policy.
                    </span>
                  ) : (
                    <span className="text-green-700 font-semibold">
                      Zero authentication failures detected.
                    </span>
                  )}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50/70 p-2.5 rounded border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Messages Received</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {new Intl.NumberFormat('en-US').format(report.summary.totalMessages)}
                  </p>
                </div>
                <div className="bg-slate-50/70 p-2.5 rounded border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">DMARC Pass Rate</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <p className={`text-base font-bold ${report.summary.passRate >= 95 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {report.summary.passRate.toFixed(1)}%
                    </p>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${report.summary.passRate}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/70 p-2.5 rounded border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SPF Pass Count</span>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">
                    {new Intl.NumberFormat('en-US').format(report.summary.spfPassCount)}
                  </p>
                </div>
                <div className="bg-slate-50/70 p-2.5 rounded border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">DKIM Pass Count</span>
                  <p className="text-base font-bold text-indigo-600 mt-0.5">
                    {new Intl.NumberFormat('en-US').format(report.summary.dkimPassCount)}
                  </p>
                </div>
              </div>

              {/* Sub-bar with Report ID and File Details */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Report ID: <span className="font-mono text-slate-600">{report.metadata.reportId}</span>
                  {report.fileName && ` • Source file: ${report.fileName}`}
                </span>
                <span className="text-slate-500">
                  {report.records.length} sending IP trace{report.records.length !== 1 ? 's' : ''} recorded
                </span>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && reports.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No reports match your search criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try changing your search keywords or resetting the filters.</p>
          </div>
        )}

        {reports.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No DMARC Reports Uploaded Yet</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Upload your .xml, .zip, or .gz aggregate reports from email providers, or click below to load realistic sample reports.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onLoadSamples}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center justify-center transition-colors"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Load Sample Reports
              </button>
              <button
                onClick={onBackToDashboard}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors"
              >
                Go to File Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
