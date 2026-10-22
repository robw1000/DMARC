import React, { useState, useMemo } from 'react';
import { Shield, FileText, RefreshCw, AlertCircle, LayoutDashboard, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { KPICards } from './components/KPICards';
import { Charts } from './components/Charts';
import { Recommendations } from './components/Recommendations';
import { SourceTable } from './components/SourceTable';
import { DomainPolicies } from './components/DomainPolicies';
import { NonExpertExplainer } from './components/NonExpertExplainer';
import { UploadedReportsView } from './components/UploadedReportsView';
import { ReportDetailModal } from './components/ReportDetailModal';
import { parseFile, analyzeReports } from './lib/dmarc-parser';
import { SAMPLE_REPORTS } from './lib/sample-data';
import type { DmarcReport } from './types';

export default function App() {
  const [reports, setReports] = useState<DmarcReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'reports'>('dashboard');
  const [selectedReport, setSelectedReport] = useState<DmarcReport | null>(null);

  const analyzedData = useMemo(() => {
    if (reports.length === 0) return null;
    return analyzeReports(reports);
  }, [reports]);

  const handleFilesSelected = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const newReports: DmarcReport[] = [];
      for (const file of files) {
        const parsed = await parseFile(file);
        newReports.push(...parsed);
      }
      setReports(prev => [...prev, ...newReports]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSamples = () => {
    setReports(SAMPLE_REPORTS);
    setError(null);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  const handleReset = () => {
    setReports([]);
    setError(null);
    setSelectedReport(null);
    setCurrentView('dashboard');
  };

  const primaryPolicy = analyzedData?.policies?.[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex flex-col border-8 border-slate-200">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold">D</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              DMARC Analyzer
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 border-l border-slate-200 pl-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-slate-100 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('reports')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                currentView === 'reports'
                  ? 'bg-slate-100 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Uploaded Reports</span>
              {reports.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {reports.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {primaryPolicy && (
            <div className="hidden lg:flex space-x-2">
              <span className="px-3 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600 uppercase">
                DOMAIN: {primaryPolicy.domain}
              </span>
              <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                primaryPolicy.p === 'reject' ? 'bg-green-100 text-green-700' :
                primaryPolicy.p === 'quarantine' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                POLICY: {primaryPolicy.p || 'none'}
              </span>
            </div>
          )}

          {reports.length === 0 ? (
            <button
              onClick={handleLoadSamples}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded transition-colors flex items-center border border-blue-200"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Sample Reports
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded hover:bg-slate-200 transition-colors flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset Data
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6 sm:p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded bg-red-50 border-l-4 border-l-red-500 border border-red-200 shadow-xs flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {currentView === 'reports' ? (
            <UploadedReportsView
              reports={reports}
              onSelectReport={(rep) => setSelectedReport(rep)}
              onDeleteReport={handleDeleteReport}
              onBackToDashboard={() => setCurrentView('dashboard')}
              onLoadSamples={handleLoadSamples}
            />
          ) : !analyzedData ? (
            /* Empty State / Initial Upload View */
            <div className="max-w-3xl mx-auto mt-6 space-y-6">
              <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-xs text-center space-y-4">
                <div className="w-12 h-12 rounded bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                    DMARC Aggregate Report Analyzer
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
                    Upload your raw <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">.xml</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">.zip</code>, or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">.gz</code> aggregate reports to decode email authentication results, investigate sender IP traces, and get plain-English recommendations.
                  </p>
                </div>

                <div className="pt-2">
                  <FileUpload onFilesSelected={handleFilesSelected} isLoading={isLoading} />
                </div>

                <div className="pt-2 flex items-center justify-center space-x-3 text-xs text-slate-400">
                  <span>Don&apos;t have a report on hand?</span>
                  <button
                    onClick={handleLoadSamples}
                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Load Sample Google, Yahoo & Outlook Reports
                  </button>
                </div>
              </div>

              {/* Beginner Guide on empty state */}
              <NonExpertExplainer defaultOpen={true} />
            </div>
          ) : (
            /* Dashboard View */
            <div className="space-y-6">
              {/* Dashboard Subheader with Uploaded Reports Link Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">Authentication Dashboard</h2>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                      {reports.length} Report{reports.length !== 1 ? 's' : ''} Loaded
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Analyzing <span className="font-semibold text-slate-700">{new Intl.NumberFormat('en-US').format(analyzedData.totalMessages)}</span> total messages across {reports.length} aggregate report file{reports.length !== 1 ? 's' : ''}.
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentView('reports')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Uploaded Reports & Records ({reports.length})</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>

              {/* Collapsible Non-Expert Guide */}
              <NonExpertExplainer defaultOpen={false} />

              <KPICards data={analyzedData} />

              <Charts data={analyzedData} />

              <DomainPolicies data={analyzedData} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <SourceTable data={analyzedData} />
                </div>
                <div className="lg:col-span-4">
                  <Recommendations data={analyzedData} />
                </div>
              </div>

              {/* Bottom Quick-Access Banner to Uploaded Reports */}
              <div className="bg-slate-900 text-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Inspect Individual Provider Reports & Auth Traces</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      View report headers from Google, Yahoo, Microsoft, examine raw DKIM selectors, and read non-expert explanations.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('reports')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center justify-center space-x-1.5 transition-colors shrink-0"
                >
                  <span>Open Uploaded Reports</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
