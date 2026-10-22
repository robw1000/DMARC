import type { DmarcRecord } from '../types';

export function formatTimestamp(ts: number): string {
  if (!ts) return 'Unknown Date';
  const date = new Date(ts * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

export function formatDuration(begin: number, end: number): string {
  if (!begin || !end || end <= begin) return 'Unknown duration';
  const hours = Math.round((end - begin) / 3600);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} (${hours} hrs)`;
}

export function getPolicyExplanation(p: string, pct: number = 100): {
  level: 'none' | 'quarantine' | 'reject';
  title: string;
  description: string;
  badgeColor: string;
  actionAdvice: string;
} {
  const policy = (p || 'none').toLowerCase();
  if (policy === 'reject') {
    return {
      level: 'reject',
      title: 'Active Block (p=reject)',
      description: `Maximum protection. Recipient mail servers are instructed to completely block/drop any unauthenticated messages purporting to be from your domain (enforced on ${pct}% of traffic).`,
      badgeColor: 'bg-green-100 text-green-800 border-green-300',
      actionAdvice: 'Your policy is at maximum strength. Ensure all legitimate third-party senders remain signed with valid DKIM to avoid accidental rejections.',
    };
  }
  if (policy === 'quarantine') {
    return {
      level: 'quarantine',
      title: 'Quarantine to Spam (p=quarantine)',
      description: `Intermediate protection. Recipient mail servers are instructed to send unauthenticated messages directly to the recipient's Spam/Junk folder (enforced on ${pct}% of traffic).`,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      actionAdvice: 'Good protection against phishing reaching inboxes. Once authentication pass rates consistently exceed 99%, advance to p=reject.',
    };
  }
  return {
    level: 'none',
    title: 'Monitoring Only (p=none)',
    description: 'No enforcement. Receivers will deliver unauthenticated emails directly to the recipient inbox without filtering, but send you diagnostic reports.',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    actionAdvice: 'This mode does NOT protect your domain from spoofers or phishing. Review failing senders, fix their SPF/DKIM records, and move to quarantine soon.',
  };
}

export function getDispositionExplanation(disposition: string): {
  label: string;
  description: string;
  badgeClass: string;
} {
  const disp = (disposition || 'none').toLowerCase();
  switch (disp) {
    case 'reject':
      return {
        label: 'Blocked (Rejected)',
        description: 'Receiver dropped/rejected the email. It was not delivered.',
        badgeClass: 'bg-red-100 text-red-700 border-red-200',
      };
    case 'quarantine':
      return {
        label: 'Sent to Spam',
        description: 'Receiver accepted the message but routed it to the Spam/Junk folder.',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    case 'none':
    default:
      return {
        label: 'Delivered to Inbox',
        description: 'Delivered normally with no filtering applied by the DMARC policy.',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
  }
}

export function getRecordVerdict(record: DmarcRecord): {
  status: 'safe' | 'warning' | 'danger';
  label: string;
  summary: string;
  recommendation: string;
  badgeClass: string;
} {
  const { dkimPass, spfPass, disposition } = record;

  if (dkimPass && spfPass) {
    return {
      status: 'safe',
      label: 'Fully Authenticated',
      summary: 'Both SPF (server IP) and DKIM (digital signature) passed with proper alignment.',
      recommendation: 'Everything is healthy. This sender is fully trusted.',
      badgeClass: 'bg-green-100 text-green-700 border-green-200',
    };
  }

  if (dkimPass && !spfPass) {
    const isForwarded = record.reasons?.some(r => r.type.toLowerCase().includes('forward'));
    return {
      status: 'warning',
      label: 'DKIM Only (SPF Failed)',
      summary: isForwarded
        ? 'Passed via DKIM signature. SPF failed due to email forwarding or indirect relay.'
        : 'Passed via DKIM signature, but SPF failed for this IP address.',
      recommendation: isForwarded
        ? 'Normal behavior for forwarded mail or mailing lists. DKIM safely preserved delivery.'
        : 'If this is an official server, consider adding this IP to your SPF DNS record.',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    };
  }

  if (!dkimPass && spfPass) {
    return {
      status: 'warning',
      label: 'SPF Only (DKIM Missing/Failed)',
      summary: 'Authorized by SPF IP address, but missing an aligned DKIM signature.',
      recommendation: 'Configure DKIM signing on this sending service so authentication survives email forwarding.',
      badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    };
  }

  // Both failed
  const isBlocked = disposition === 'reject' || disposition === 'quarantine';
  return {
    status: 'danger',
    label: isBlocked ? 'Blocked Spoofing Attempt' : 'Failed Authentication',
    summary: 'Failed both SPF and DKIM authentication. The email sender could not be verified.',
    recommendation: isBlocked
      ? 'Your policy successfully protected recipients by blocking or quarantining this unauthenticated mail.'
      : 'If this was a legitimate service sending on your behalf, update your SPF/DKIM records immediately. Otherwise, it is unauthorized traffic.',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
  };
}

export function identifyKnownSender(ip: string, headerFrom?: string, authResults?: any): {
  name: string;
  category: 'cloud' | 'marketing' | 'infrastructure' | 'unknown' | 'suspicious';
  hint: string;
} {
  // Common IP prefixes or heuristics
  if (ip.startsWith('209.85.') || ip.startsWith('74.125.') || ip.startsWith('172.217.') || ip.startsWith('142.250.')) {
    return {
      name: 'Google Workspace / Gmail',
      category: 'cloud',
      hint: 'Google mail infrastructure',
    };
  }
  if (ip.startsWith('167.89.') || ip.startsWith('198.21.') || ip.startsWith('168.245.')) {
    return {
      name: 'Twilio SendGrid',
      category: 'marketing',
      hint: 'Email marketing & transactional service',
    };
  }
  if (ip.startsWith('54.240.') || ip.startsWith('52.128.') || ip.startsWith('23.249.')) {
    return {
      name: 'Amazon SES (AWS)',
      category: 'cloud',
      hint: 'Amazon Simple Email Service',
    };
  }
  if (ip.startsWith('40.92.') || ip.startsWith('40.107.') || ip.startsWith('52.100.') || ip.startsWith('104.47.')) {
    return {
      name: 'Microsoft 365 / Outlook',
      category: 'cloud',
      hint: 'Microsoft Exchange Online',
    };
  }
  if (ip.startsWith('198.51.100.') || ip.startsWith('203.0.113.')) {
    return {
      name: 'Forwarding / Relay Service',
      category: 'infrastructure',
      hint: 'Intermediary email relay or forwarder',
    };
  }
  if (ip.startsWith('185.220.') || ip.startsWith('194.26.') || ip.startsWith('91.240.')) {
    return {
      name: 'Unverified External Server',
      category: 'suspicious',
      hint: 'Potential third-party relay or spoof source',
    };
  }

  return {
    name: 'Remote Mail Server',
    category: 'unknown',
    hint: 'Host IP address',
  };
}
