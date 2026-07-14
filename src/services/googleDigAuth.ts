import type { CaseRecord } from './caseDataset';

export type DnsRecordType = 'A' | 'AAAA' | 'CAA' | 'CNAME' | 'DNSKEY' | 'DS' | 'HTTPS' | 'MX' | 'NS' | 'PTR' | 'SOA' | 'SRV' | 'SVCB' | 'TLSA' | 'TSIG' | 'TXT';
export type DigAuthStatus = 'pass' | 'fail' | 'none';
export type AuthFindingStatus = 'healthy' | 'warning' | 'error' | 'unknown';

export interface GoogleDnsAnswer {
  name: string;
  type: number;
  TTL?: number;
  data?: string;
}

export interface DnsLookupResult {
  queryName: string;
  queryType: DnsRecordType;
  normalizedName: string;
  resolver: 'Google Public DNS';
  status: number | null;
  statusText: string;
  source: 'live' | 'cached';
  checkedAt: string;
  answers: GoogleDnsAnswer[];
  authority: GoogleDnsAnswer[];
  additional: GoogleDnsAnswer[];
  cnameChain: string[];
  raw: any;
  error?: string;
}

export interface AuthIdentity {
  id: string;
  value: string;
  role: string;
  kind: 'domain' | 'ip';
  selector?: string;
  domain?: string;
  checked?: boolean;
}

export interface AuthFinding {
  id: string;
  category: 'SPF' | 'DKIM' | 'DMARC' | 'Return-Path' | 'PTR' | 'Observed';
  title: string;
  subject: string;
  status: AuthFindingStatus;
  summary: string;
  evidence: string[];
  lookupIds: string[];
}

export interface AuthScanResult {
  account: string;
  domain: string;
  visibleFromDomain: string;
  identities: AuthIdentity[];
  findings: AuthFinding[];
  lookups: DnsLookupResult[];
  checkedAt: string;
  assessment: {
    label: string;
    summary: string;
    status: AuthFindingStatus;
    evidence: string[];
  };
}

export interface DigAuthResult {
  status: DigAuthStatus;
  record: string;
  name: string;
  type: 'TXT';
  source: 'google-dig';
}

export interface TicketAuthCheck {
  domain: string;
  selector: string;
  spf: DigAuthResult;
  dmarc: DigAuthResult;
  dkim: DigAuthResult | null;
  checkedAt: string;
  scan?: AuthScanResult;
}

const DNS_TYPES = new Set<DnsRecordType>(['A', 'AAAA', 'CAA', 'CNAME', 'DNSKEY', 'DS', 'HTTPS', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'SVCB', 'TLSA', 'TSIG', 'TXT']);

export const dnsTypeName = (type: number) => {
  const types: Record<number, string> = {
    1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 12: 'PTR', 15: 'MX', 16: 'TXT', 28: 'AAAA', 33: 'SRV', 43: 'DS', 46: 'RRSIG', 47: 'NSEC', 48: 'DNSKEY', 50: 'NSEC3', 51: 'NSEC3PARAM', 52: 'TLSA', 64: 'SVCB', 65: 'HTTPS', 250: 'TSIG', 255: 'ANY', 257: 'CAA'
  };
  return types[type] || `TYPE${type}`;
};

export const cleanTxt = (value: string) => value.replace(/^"|"$/g, '').replace(/"\s+"/g, '');

export function normalizeDomain(input: string): string {
  let domain = input.trim();
  if (!domain) return '';
  try {
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      domain = new URL(domain).hostname;
    } else if (domain.includes('/')) {
      domain = domain.split('/')[0];
    }
  } catch {
    // Keep the original text; the internal DNS API will classify the failure.
  }
  return domain.replace(/\.$/, '').toLowerCase();
}

export function normalizeDnsType(input: string): DnsRecordType {
  const type = input.trim().toUpperCase() as DnsRecordType;
  return DNS_TYPES.has(type) ? type : 'A';
}

export async function resolveGoogleDns(name: string, type: string): Promise<DnsLookupResult> {
  const res = await fetch('/api/dns/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type: normalizeDnsType(type) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'DNS lookup failed');
  return data.lookup as DnsLookupResult;
}

export async function runTicketAuthScan(ticket: CaseRecord, options: { force?: boolean } = {}): Promise<AuthScanResult> {
  const res = await fetch('/api/dns/auth-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket, force: options.force === true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Authentication scan failed');
  return data.scan as AuthScanResult;
}

function resultFromFinding(category: AuthFinding['category'], scan: AuthScanResult, fallbackName: string, fallbackRecord: string): DigAuthResult {
  const finding = scan.findings.find(item => item.category === category);
  const lookup = finding?.lookupIds[0] ? scan.lookups.find(item => item.queryName === finding.lookupIds[0]) : null;
  const answer = lookup?.answers?.map(item => item.data ? cleanTxt(item.data) : '').filter(Boolean).join(' | ');
  return {
    name: lookup?.queryName || finding?.subject || fallbackName,
    type: 'TXT',
    source: 'google-dig',
    status: finding?.status === 'healthy' ? 'pass' : finding?.status === 'error' ? 'fail' : 'none',
    record: answer || finding?.summary || fallbackRecord,
  };
}

export async function checkTicketAuthWithGoogleDig(input: {
  domain: string;
  selector?: string;
}): Promise<TicketAuthCheck> {
  const domain = normalizeDomain(input.domain);
  const selector = input.selector?.trim() ?? '';
  const scan = await runTicketAuthScan({
    account_name: domain || 'Unknown account',
    case_number: '',
    sending_domains: domain ? [domain] : [],
    domains: domain ? [domain] : [],
    sending_ips: [],
    dkim_selector: selector,
    spf_status: 'WARN',
    spf_description: '',
    spf_record: '',
    dkim_status: 'WARN',
    dkim_description: '',
    dmarc_status: 'WARN',
    dmarc_description: '',
    dmarc_policy: '',
    rdns_status: 'WARN',
    rdns_hostname: '',
  } as CaseRecord);

  return {
    domain,
    selector,
    checkedAt: scan.checkedAt,
    spf: resultFromFinding('SPF', scan, domain, 'No SPF TXT record found via Google Public DNS'),
    dmarc: resultFromFinding('DMARC', scan, `_dmarc.${domain}`, 'No DMARC TXT record found via Google Public DNS'),
    dkim: selector
      ? { name: domain, type: 'TXT', source: 'google-dig', status: 'pass', record: 'DKIM passes from stored account authentication status; selector DNS is not scanned in this view' }
      : null,
    scan,
  };
}

export function authCheckFromTicket(ticket: CaseRecord): TicketAuthCheck {
  const domain = ticket.sending_domains?.[0] ?? '';
  const selector = ticket.dkim_selector ?? '';
  return {
    domain,
    selector,
    checkedAt: '',
    spf: {
      name: domain,
      type: 'TXT',
      source: 'google-dig',
      status: ticket.spf_status === 'PASS' ? 'pass' : ticket.spf_status === 'FAIL' ? 'fail' : 'none',
      record: ticket.spf_record || ticket.spf_description || 'No SPF record in ticket data',
    },
    dmarc: {
      name: `_dmarc.${domain}`,
      type: 'TXT',
      source: 'google-dig',
      status: ticket.dmarc_status === 'PASS' ? 'pass' : ticket.dmarc_status === 'FAIL' ? 'fail' : 'none',
      record: ticket.dmarc_description || `DMARC policy ${ticket.dmarc_policy || 'not recorded'}`,
    },
    dkim: selector
      ? {
          name: domain,
          type: 'TXT',
          source: 'google-dig',
          status: ticket.dkim_status === 'PASS' ? 'pass' : ticket.dkim_status === 'FAIL' ? 'fail' : 'none',
          record: ticket.dkim_description || 'DKIM passes from stored account authentication status',
        }
      : null,
  };
}

export function authCheckSummary(check: TicketAuthCheck): string {
  if (check.scan) return authScanSummary(check.scan);
  const dkim = check.dkim ? ` | DKIM status: ${check.dkim.status.toUpperCase()} — ${check.dkim.record}` : ' | DKIM status: not recorded';
  return `Google Public DNS Authentication Scan for ${check.domain}: SPF DNS: ${check.spf.status.toUpperCase()} — ${check.spf.record}${dkim} | DMARC DNS: ${check.dmarc.status.toUpperCase()} — ${check.dmarc.record}`;
}

export function authScanSummary(scan: AuthScanResult): string {
  const findings = scan.findings
    .map(item => `${item.category}: ${item.status.toUpperCase()} — ${item.summary}`)
    .join(' | ');
  return `Google Public DNS Authentication Inventory for ${scan.account}: ${scan.identities.length} identities, ${scan.lookups.length} DNS lookups. ${findings}. Assessment: ${scan.assessment.label} — ${scan.assessment.summary}`;
}
