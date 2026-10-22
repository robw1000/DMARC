import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Mail, Key, Globe, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function NonExpertExplainer({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              New to DMARC? Email Security Explained for Non-Experts
            </h3>
            <p className="text-xs text-slate-500">
              Understand what these reports mean, how SPF & DKIM work together, and what actions to take.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
          <span>{isOpen ? 'Hide Guide' : 'Read Guide'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-200 space-y-6 text-slate-700 text-sm">
          {/* The Big Picture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center space-x-2 text-blue-700 font-bold mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">1. SPF (The Guest List)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Sender Policy Framework</strong> is a list of approved mail servers published in your domain&apos;s DNS records. When a server sends an email claiming to be from you, the recipient checks if that server&apos;s IP address is on your guest list.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold mb-2">
                <Key className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">2. DKIM (The Wax Seal)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>DomainKeys Identified Mail</strong> adds an encrypted cryptographic signature to the header of every outgoing email. It proves the email was not modified in transit and truly came from your domain, even if the email was forwarded.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">3. DMARC (The Security Guard)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>DMARC</strong> ties SPF and DKIM together. It tells receiving servers (like Gmail or Outlook) what to do if an email fails both checks, and instructs them to send daily XML feedback reports back to you.
              </p>
            </div>
          </div>

          {/* Policy levels */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              The 3 DMARC Policy Levels (p=)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border border-slate-200 rounded bg-slate-50">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">p=none</span>
                  <span className="text-xs font-bold text-slate-700">Monitoring Mode</span>
                </div>
                <p className="text-xs text-slate-500">
                  Does not block anything. Receivers deliver all emails (even fake ones) and send you reports so you can see who is sending emails for your domain.
                </p>
              </div>

              <div className="p-3 border border-amber-200 rounded bg-amber-50/50">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">p=quarantine</span>
                  <span className="text-xs font-bold text-amber-900">Spam Folder Mode</span>
                </div>
                <p className="text-xs text-slate-600">
                  Receivers direct unauthenticated emails to the user&apos;s Spam/Junk folder. Protects users while allowing you to verify no legitimate mail is missed.
                </p>
              </div>

              <div className="p-3 border border-green-200 rounded bg-green-50/50">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">p=reject</span>
                  <span className="text-xs font-bold text-green-900">Maximum Protection</span>
                </div>
                <p className="text-xs text-slate-600">
                  Receivers immediately block and drop any unauthenticated messages. Attackers cannot spoof your domain to deceive your customers or employees.
                </p>
              </div>
            </div>
          </div>

          {/* What does "Disposition" mean? */}
          <div className="p-4 bg-slate-100/60 rounded border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              What does &quot;Disposition&quot; in the report mean?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">none (Delivered):</strong>
                  <p className="text-slate-500">The message was delivered to the inbox without special restrictions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">quarantine (Spam):</strong>
                  <p className="text-slate-500">The recipient inbox moved the message into the Spam or Junk folder.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">reject (Blocked):</strong>
                  <p className="text-slate-500">The message was completely dropped before reaching the mailbox.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
