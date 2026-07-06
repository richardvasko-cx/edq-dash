import type { CaseRecord } from './caseDataset';

export type DigAuthStatus = 'pass' | 'fail' | 'none';

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
}

interface GoogleDnsAnswer {
  data?: string;
}

const cleanTxt = (value: string) => value.replace(/^"|"$/g, '').replace(/"\s+"/g, '');

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
    // Keep the original text; Google DNS will return the failure state.
  }
  return domain.replace(/\.$/, '').toLowerCase();
}

async function digTxt(name: string): Promise<string[]> {
  const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`);
  if (!res.ok) throw new Error(`Google Dig failed for ${name}`);
  const json = await res.json();
  return ((json.Answer ?? []) as GoogleDnsAnswer[])
    .map(answer => (answer.data ? cleanTxt(answer.data) : ''))
    .filter(Boolean);
}

function result(name: string, records: string[], matcher: (record: string) => boolean, empty: string): DigAuthResult {
  const found = records.find(matcher);
  return {
    name,
    type: 'TXT',
    source: 'google-dig',
    status: found ? 'pass' : records.length ? 'fail' : 'none',
    record: found ?? (records.length ? records.join(' | ') : empty),
  };
}

export async function checkTicketAuthWithGoogleDig(input: {
  domain: string;
  selector?: string;
}): Promise<TicketAuthCheck> {
  const domain = normalizeDomain(input.domain);
  const selector = input.selector?.trim() ?? '';
  if (!domain) {
    return {
      domain,
      selector,
      checkedAt: new Date().toISOString(),
      spf: { name: '', type: 'TXT', source: 'google-dig', status: 'none', record: 'No sending domain available for Google Dig' },
      dmarc: { name: '', type: 'TXT', source: 'google-dig', status: 'none', record: 'No sending domain available for Google Dig' },
      dkim: selector
        ? { name: selector, type: 'TXT', source: 'google-dig', status: 'none', record: 'No sending domain available for Google Dig' }
        : null,
    };
  }
  const [spfRecords, dmarcRecords, dkimRecords] = await Promise.all([
    digTxt(domain),
    digTxt(`_dmarc.${domain}`),
    selector ? digTxt(`${selector}._domainkey.${domain}`) : Promise.resolve([]),
  ]);

  return {
    domain,
    selector,
    checkedAt: new Date().toISOString(),
    spf: result(domain, spfRecords, record => /(^|[\s"])v=spf1\b/i.test(record), 'No SPF TXT record found via Google Dig'),
    dmarc: result(`_dmarc.${domain}`, dmarcRecords, record => /(^|[\s"])v=DMARC1\b/i.test(record), 'No DMARC TXT record found via Google Dig'),
    dkim: selector
      ? result(`${selector}._domainkey.${domain}`, dkimRecords, record => /v=DKIM1|k=rsa|\bp=/i.test(record), 'No DKIM TXT record found via Google Dig for this selector')
      : null,
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
          name: `${selector}._domainkey.${domain}`,
          type: 'TXT',
          source: 'google-dig',
          status: ticket.dkim_status === 'PASS' ? 'pass' : ticket.dkim_status === 'FAIL' ? 'fail' : 'none',
          record: ticket.dkim_description || 'DKIM status from ticket data',
        }
      : null,
  };
}

export function authCheckSummary(check: TicketAuthCheck): string {
  const dkim = check.dkim ? ` | DKIM: ${check.dkim.status.toUpperCase()} — ${check.dkim.record}` : ' | DKIM: not checked — no selector';
  return `Google Dig Authentication Scan for ${check.domain}: SPF: ${check.spf.status.toUpperCase()} — ${check.spf.record}${dkim} | DMARC: ${check.dmarc.status.toUpperCase()} — ${check.dmarc.record}`;
}
