import type { DmarcReport } from '../types';

export const SAMPLE_REPORTS: DmarcReport[] = [
  {
    id: 'google-2026-0928-1001',
    fileName: 'google.com!example-corp.com!1727481600!1727568000.xml',
    uploadDate: Date.now() - 3600000 * 2,
    metadata: {
      orgName: 'Google LLC',
      email: 'noreply-dmarc-support@google.com',
      reportId: '9827361829371629831',
      dateRange: {
        begin: 1727481600, // Sept 28, 2026 00:00:00 UTC
        end: 1727568000,   // Sept 29, 2026 00:00:00 UTC
      },
      extraContactInfo: 'https://support.google.com/a/answer/2466580',
    },
    policyPublished: {
      domain: 'example-corp.com',
      adkim: 'r',
      aspf: 'r',
      p: 'quarantine',
      sp: 'quarantine',
      pct: 100,
    },
    records: [
      {
        sourceIp: '209.85.220.41',
        count: 12450,
        disposition: 'none',
        dkimPass: true,
        spfPass: true,
        headerFrom: 'example-corp.com',
        envelopeTo: 'gmail.com',
        envelopeFrom: 'example-corp.com',
        authResults: {
          dkim: [
            { domain: 'example-corp.com', selector: 'google', result: 'pass' }
          ],
          spf: [
            { domain: 'example-corp.com', scope: 'mfrom', result: 'pass' }
          ]
        }
      },
      {
        sourceIp: '167.89.112.54',
        count: 3200,
        disposition: 'none',
        dkimPass: true,
        spfPass: true,
        headerFrom: 'example-corp.com',
        envelopeTo: 'gmail.com',
        envelopeFrom: 'bounces.example-corp.com',
        authResults: {
          dkim: [
            { domain: 'example-corp.com', selector: 's1', result: 'pass' }
          ],
          spf: [
            { domain: 'bounces.example-corp.com', scope: 'mfrom', result: 'pass' }
          ]
        }
      },
      {
        sourceIp: '198.51.100.78',
        count: 140,
        disposition: 'none',
        dkimPass: true,
        spfPass: false,
        headerFrom: 'example-corp.com',
        envelopeTo: 'gmail.com',
        envelopeFrom: 'forwarder.alumni-network.org',
        reasons: [
          { type: 'forwarded', comment: 'Message passed through alumni forwarding service' }
        ],
        authResults: {
          dkim: [
            { domain: 'example-corp.com', selector: 'google', result: 'pass' }
          ],
          spf: [
            { domain: 'forwarder.alumni-network.org', scope: 'mfrom', result: 'softfail' }
          ]
        }
      },
      {
        sourceIp: '185.220.101.5',
        count: 38,
        disposition: 'quarantine',
        dkimPass: false,
        spfPass: false,
        headerFrom: 'example-corp.com',
        envelopeTo: 'gmail.com',
        envelopeFrom: 'phish-attack@spoof-net.biz',
        authResults: {
          dkim: [],
          spf: [
            { domain: 'spoof-net.biz', scope: 'mfrom', result: 'fail' }
          ]
        }
      }
    ],
    summary: {
      totalMessages: 15828,
      passCount: 15790,
      failCount: 38,
      spfPassCount: 15650,
      dkimPassCount: 15790,
      passRate: 99.76,
    }
  },
  {
    id: 'yahoo-2026-0928-1002',
    fileName: 'yahoo.com!example-corp.com!1727481600!1727568000.xml',
    uploadDate: Date.now() - 3600000,
    metadata: {
      orgName: 'Yahoo! Inc.',
      email: 'postmaster@yahoo.com',
      reportId: 'sbc-dmarc-1727568000',
      dateRange: {
        begin: 1727481600,
        end: 1727568000,
      },
    },
    policyPublished: {
      domain: 'example-corp.com',
      adkim: 'r',
      aspf: 'r',
      p: 'quarantine',
      sp: 'quarantine',
      pct: 100,
    },
    records: [
      {
        sourceIp: '209.85.220.42',
        count: 4180,
        disposition: 'none',
        dkimPass: true,
        spfPass: true,
        headerFrom: 'example-corp.com',
        envelopeTo: 'yahoo.com',
        envelopeFrom: 'example-corp.com',
        authResults: {
          dkim: [{ domain: 'example-corp.com', selector: 'google', result: 'pass' }],
          spf: [{ domain: 'example-corp.com', scope: 'mfrom', result: 'pass' }]
        }
      },
      {
        sourceIp: '167.89.112.55',
        count: 980,
        disposition: 'none',
        dkimPass: true,
        spfPass: true,
        headerFrom: 'example-corp.com',
        envelopeTo: 'yahoo.com',
        envelopeFrom: 'bounces.example-corp.com',
        authResults: {
          dkim: [{ domain: 'example-corp.com', selector: 's1', result: 'pass' }],
          spf: [{ domain: 'bounces.example-corp.com', scope: 'mfrom', result: 'pass' }]
        }
      },
      {
        sourceIp: '194.26.29.11',
        count: 22,
        disposition: 'quarantine',
        dkimPass: false,
        spfPass: false,
        headerFrom: 'example-corp.com',
        envelopeTo: 'yahoo.com',
        envelopeFrom: 'spammer@unverified-relay.ru',
        authResults: {
          dkim: [],
          spf: [{ domain: 'unverified-relay.ru', scope: 'mfrom', result: 'fail' }]
        }
      }
    ],
    summary: {
      totalMessages: 5182,
      passCount: 5160,
      failCount: 22,
      spfPassCount: 5160,
      dkimPassCount: 5160,
      passRate: 99.58,
    }
  },
  {
    id: 'msft-2026-0928-1003',
    fileName: 'outlook.com!example-corp.com!1727481600!1727568000.xml',
    uploadDate: Date.now() - 1800000,
    metadata: {
      orgName: 'Microsoft Corporation',
      email: 'dmarcreport@microsoft.com',
      reportId: 'msft-dmarc-rep-847291',
      dateRange: {
        begin: 1727481600,
        end: 1727568000,
      },
    },
    policyPublished: {
      domain: 'example-corp.com',
      adkim: 'r',
      aspf: 'r',
      p: 'quarantine',
      sp: 'quarantine',
      pct: 100,
    },
    records: [
      {
        sourceIp: '209.85.220.43',
        count: 6840,
        disposition: 'none',
        dkimPass: true,
        spfPass: true,
        headerFrom: 'example-corp.com',
        envelopeTo: 'outlook.com',
        envelopeFrom: 'example-corp.com',
        authResults: {
          dkim: [{ domain: 'example-corp.com', selector: 'google', result: 'pass' }],
          spf: [{ domain: 'example-corp.com', scope: 'mfrom', result: 'pass' }]
        }
      },
      {
        sourceIp: '54.240.27.4',
        count: 1420,
        disposition: 'none',
        dkimPass: false,
        spfPass: true,
        headerFrom: 'example-corp.com',
        envelopeTo: 'outlook.com',
        envelopeFrom: 'notifications.example-corp.com',
        authResults: {
          dkim: [{ domain: 'amazonses.com', selector: 'ses-key', result: 'pass' }], // DKIM signed by SES but unaligned with example-corp.com
          spf: [{ domain: 'notifications.example-corp.com', scope: 'mfrom', result: 'pass' }]
        }
      },
      {
        sourceIp: '91.240.118.12',
        count: 15,
        disposition: 'quarantine',
        dkimPass: false,
        spfPass: false,
        headerFrom: 'example-corp.com',
        envelopeTo: 'outlook.com',
        envelopeFrom: 'malicious-server@unknown.xyz',
        authResults: {
          dkim: [],
          spf: [{ domain: 'unknown.xyz', scope: 'mfrom', result: 'fail' }]
        }
      }
    ],
    summary: {
      totalMessages: 8275,
      passCount: 8260,
      failCount: 15,
      spfPassCount: 8260,
      dkimPassCount: 6840,
      passRate: 99.82,
    }
  }
];
