export interface AuthDkimResult {
  domain: string;
  selector?: string;
  result: string;
}

export interface AuthSpfResult {
  domain: string;
  scope?: string;
  result: string;
}

export interface PolicyOverrideReason {
  type: string;
  comment?: string;
}

export interface DmarcRecord {
  sourceIp: string;
  count: number;
  disposition: string;
  dkimPass: boolean;
  spfPass: boolean;
  headerFrom: string;
  envelopeTo?: string;
  envelopeFrom?: string;
  reasons?: PolicyOverrideReason[];
  authResults?: {
    dkim?: AuthDkimResult[];
    spf?: AuthSpfResult[];
  };
}

export interface DmarcReportSummary {
  totalMessages: number;
  passCount: number;
  failCount: number;
  spfPassCount: number;
  dkimPassCount: number;
  passRate: number;
}

export interface DmarcReport {
  id: string;
  fileName?: string;
  uploadDate?: number;
  metadata: {
    orgName: string;
    email: string;
    reportId: string;
    dateRange: {
      begin: number;
      end: number;
    };
    extraContactInfo?: string;
  };
  policyPublished: {
    domain: string;
    adkim: string;
    aspf: string;
    p: string;
    sp: string;
    pct: number;
    fo?: string;
  };
  records: DmarcRecord[];
  summary: DmarcReportSummary;
}

export interface PolicyInfo {
  domain: string;
  adkim: string;
  aspf: string;
  p: string;
  sp: string;
  pct: number;
}

export interface AnalyzedData {
  totalMessages: number;
  fullyAligned: number;
  spfFail: number;
  dkimFail: number;
  dmarcFail: number;
  sources: Record<string, DmarcRecord[]>;
  complianceRate: number;
  policies: PolicyInfo[];
}
