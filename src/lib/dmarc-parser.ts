import { XMLParser } from 'fast-xml-parser';
import JSZip from 'jszip';
import pako from 'pako';
import type { DmarcReport, DmarcRecord } from '../types';

export class DmarcParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DmarcParserError';
  }
}

export async function parseFile(file: File): Promise<DmarcReport[]> {
  const reports: DmarcReport[] = [];

  try {
    if (file.name.endsWith('.zip')) {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      for (const [filename, fileData] of Object.entries(zipContent.files)) {
        if (!fileData.dir && filename.endsWith('.xml')) {
          const xmlContent = await fileData.async('text');
          reports.push(parseXml(xmlContent, filename));
        }
      }
    } else if (file.name.endsWith('.xml')) {
      const text = await file.text();
      reports.push(parseXml(text, file.name));
    } else if (file.name.endsWith('.gz')) {
      const buffer = await file.arrayBuffer();
      const decompressed = pako.inflate(new Uint8Array(buffer), { to: 'string' });
      reports.push(parseXml(decompressed, file.name));
    } else {
      throw new DmarcParserError('Unsupported file type. Please upload a .xml, .zip, or .gz file.');
    }
  } catch (err) {
    if (err instanceof DmarcParserError) throw err;
    throw new DmarcParserError(`Failed to process file: ${(err as Error).message}`);
  }

  return reports;
}

function normalizeArray<T>(item: any): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

export function parseXml(xmlString: string, fileName?: string): DmarcReport {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    isArray: (name) => {
      // Ensure records and reason lists are always treated as arrays
      return ['record', 'reason', 'dkim', 'spf'].includes(name);
    }
  });

  const parsed = parser.parse(xmlString);
  const feedback = parsed.feedback;

  if (!feedback) {
    throw new DmarcParserError('Invalid DMARC XML: Missing <feedback> root element.');
  }

  // Handle records
  const rawRecords = normalizeArray<any>(feedback.record);

  let totalMessages = 0;
  let passCount = 0;
  let failCount = 0;
  let spfPassCount = 0;
  let dkimPassCount = 0;

  const records: DmarcRecord[] = rawRecords.map((r: any) => {
    const row = r.row || {};
    const policyEvaluated = row.policy_evaluated || {};
    const identifiers = r.identifiers || {};
    const authResults = r.auth_results || {};

    const count = parseInt(row.count, 10) || 0;
    const dkimPass = policyEvaluated.dkim === 'pass';
    const spfPass = policyEvaluated.spf === 'pass';
    const dmarcPass = dkimPass || spfPass;

    totalMessages += count;
    if (dmarcPass) {
      passCount += count;
    } else {
      failCount += count;
    }
    if (spfPass) spfPassCount += count;
    if (dkimPass) dkimPassCount += count;

    // Parse DKIM auth results
    const rawDkim = normalizeArray<any>(authResults.dkim);
    const dkimResults = rawDkim.map((d: any) => ({
      domain: String(d.domain || ''),
      selector: d.selector ? String(d.selector) : undefined,
      result: String(d.result || 'none'),
    }));

    // Parse SPF auth results
    const rawSpf = normalizeArray<any>(authResults.spf);
    const spfResults = rawSpf.map((s: any) => ({
      domain: String(s.domain || ''),
      scope: s.scope ? String(s.scope) : undefined,
      result: String(s.result || 'none'),
    }));

    // Parse reasons
    const rawReasons = normalizeArray<any>(policyEvaluated.reason);
    const reasons = rawReasons.map((rsn: any) => ({
      type: String(rsn.type || ''),
      comment: rsn.comment ? String(rsn.comment) : undefined,
    }));

    return {
      sourceIp: String(row.source_ip || 'Unknown'),
      count,
      disposition: String(policyEvaluated.disposition || 'none'),
      dkimPass,
      spfPass,
      headerFrom: String(identifiers.header_from || ''),
      envelopeTo: identifiers.envelope_to ? String(identifiers.envelope_to) : undefined,
      envelopeFrom: identifiers.envelope_from ? String(identifiers.envelope_from) : undefined,
      reasons: reasons.length > 0 ? reasons : undefined,
      authResults: (dkimResults.length > 0 || spfResults.length > 0) ? {
        dkim: dkimResults.length > 0 ? dkimResults : undefined,
        spf: spfResults.length > 0 ? spfResults : undefined,
      } : undefined,
    };
  });

  const reportId = String(feedback.report_metadata?.report_id || `rep-${Date.now()}`);
  const domain = String(feedback.policy_published?.domain || 'unknown-domain');

  return {
    id: `${reportId}-${Math.random().toString(36).substring(2, 7)}`,
    fileName: fileName || `${domain}-report.xml`,
    uploadDate: Date.now(),
    metadata: {
      orgName: String(feedback.report_metadata?.org_name || 'Unknown Reporter Org'),
      email: String(feedback.report_metadata?.email || ''),
      reportId,
      dateRange: {
        begin: parseInt(feedback.report_metadata?.date_range?.begin, 10) || Math.floor(Date.now() / 1000) - 86400,
        end: parseInt(feedback.report_metadata?.date_range?.end, 10) || Math.floor(Date.now() / 1000),
      },
      extraContactInfo: feedback.report_metadata?.extra_contact_info ? String(feedback.report_metadata.extra_contact_info) : undefined,
    },
    policyPublished: {
      domain,
      adkim: String(feedback.policy_published?.adkim || 'r'),
      aspf: String(feedback.policy_published?.aspf || 'r'),
      p: String(feedback.policy_published?.p || 'none'),
      sp: String(feedback.policy_published?.sp || feedback.policy_published?.p || 'none'),
      pct: parseInt(feedback.policy_published?.pct, 10) || 100,
      fo: feedback.policy_published?.fo ? String(feedback.policy_published.fo) : undefined,
    },
    records,
    summary: {
      totalMessages,
      passCount,
      failCount,
      spfPassCount,
      dkimPassCount,
      passRate: totalMessages > 0 ? (passCount / totalMessages) * 100 : 0,
    }
  };
}

export function analyzeReports(reports: DmarcReport[]): import('../types').AnalyzedData {
  let totalMessages = 0;
  let fullyAligned = 0;
  let spfFail = 0;
  let dkimFail = 0;
  let dmarcFail = 0;
  const sources: Record<string, DmarcRecord[]> = {};
  const policiesMap = new Map<string, import('../types').PolicyInfo>();

  reports.forEach(report => {
    if (report.policyPublished && report.policyPublished.domain) {
      policiesMap.set(report.policyPublished.domain, report.policyPublished);
    }

    report.records.forEach(record => {
      totalMessages += record.count;
      
      const passDkim = record.dkimPass;
      const passSpf = record.spfPass;
      const passDmarc = passDkim || passSpf; // DMARC passes if either SPF or DKIM passes alignment
      
      if (passDkim && passSpf) {
        fullyAligned += record.count;
      }
      if (!passSpf) {
        spfFail += record.count;
      }
      if (!passDkim) {
        dkimFail += record.count;
      }
      if (!passDmarc) {
        dmarcFail += record.count;
      }

      if (!sources[record.sourceIp]) {
        sources[record.sourceIp] = [];
      }
      sources[record.sourceIp].push(record);
    });
  });

  return {
    totalMessages,
    fullyAligned,
    spfFail,
    dkimFail,
    dmarcFail,
    sources,
    complianceRate: totalMessages > 0 ? ((totalMessages - dmarcFail) / totalMessages) * 100 : 0,
    policies: Array.from(policiesMap.values()),
  };
}
