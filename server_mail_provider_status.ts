import { resolveMx } from 'node:dns/promises';
import type { Express } from 'express';

const CACHE_TTL_MS = 60_000;

const APPLE_DATA_URL =
  'https://www.apple.com/support/systemstatus/data/system_status_en_US.js';

const APPLE_STATUS_URL =
  'https://www.apple.com/support/systemstatus/';

const GOOGLE_INCIDENTS_URL =
  'https://www.google.com/appsstatus/dashboard/incidents.json';

const GOOGLE_STATUS_URL =
  'https://www.google.com/appsstatus/dashboard/';

const GMAIL_WEB_URL =
  'https://mail.google.com/';

const OUTLOOK_WEB_URL =
  'https://outlook.live.com/mail/0/';

const MICROSOFT_STATUS_URL =
  'https://portal.office.com/servicestatus';

const YAHOO_WEB_URL =
  'https://mail.yahoo.com/';

const YAHOO_HELP_URL =
  'https://help.yahoo.com/kb/mail';

type ProviderKey =
  | 'icloud'
  | 'gmail'
  | 'outlook'
  | 'yahoo';

type StatusKind =
  | 'operational'
  | 'reachable'
  | 'issue'
  | 'unavailable';

export interface MailProviderStatus {
  provider: ProviderKey;
  serviceName: string;
  status: StatusKind;
  statusLabel: string;
  message: string;
  detail?: string;
  checkedAt: string;
  sourceUrl: string;
  methodLabel: string;
}

interface MailProviderStatusResponse {
  checkedAt: string;
  providers: MailProviderStatus[];
}

interface CacheEntry {
  expiresAt: number;
  value: MailProviderStatusResponse;
}

interface AppleEvent {
  statusType?: unknown;
  eventStatus?: unknown;
  message?: unknown;
  usersAffected?: unknown;
  startDate?: unknown;
  endDate?: unknown;
}

interface AppleService {
  serviceName?: unknown;
  events?: unknown;
}

interface ApplePayload {
  services?: unknown;
}

interface GoogleProduct {
  title?: unknown;
}

interface GoogleUpdate {
  status?: unknown;
  text?: unknown;
}

interface GoogleIncident {
  service_name?: unknown;
  affected_products?: unknown;
  begin?: unknown;
  end?: unknown;
  modified?: unknown;
  severity?: unknown;
  external_desc?: unknown;
  most_recent_update?: GoogleUpdate;
}

interface Reachability {
  web: boolean;
  mx: boolean;
}

let cache: CacheEntry | null = null;

function stringValue(
  value: unknown,
  fallback = '',
): string {
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (
    typeof value === 'number'
    || typeof value === 'boolean'
  ) {
    return String(value);
  }

  return fallback;
}

function cleanMessage(
  value: unknown,
  fallback: string,
): string {
  const message = stringValue(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (!message) {
    return fallback;
  }

  return message.length > 260
    ? `${message.slice(0, 259).trim()}…`
    : message;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs = 10_000,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept:
          'application/json, text/javascript, text/html, */*',
        'User-Agent': 'EDQ-Dashboard/1.0',
        ...(init.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function webReachable(
  url: string,
): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      url,
      10_000,
      {
        method: 'GET',
        redirect: 'manual',
      },
    );

    return (
      response.status >= 200
      && response.status < 500
    );
  } catch {
    return false;
  }
}

async function mxReachable(
  domain: string,
): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

async function checkReachability(
  webUrl: string,
  mxDomain: string,
): Promise<Reachability> {
  const [web, mx] = await Promise.all([
    webReachable(webUrl),
    mxReachable(mxDomain),
  ]);

  return { web, mx };
}

function reachabilityDetail(
  result: Reachability,
): string {
  return [
    result.web
      ? 'Web endpoint reachable'
      : 'Web endpoint unavailable',
    result.mx
      ? 'MX records reachable'
      : 'MX records unavailable',
  ].join(' · ');
}

function fallbackStatus(
  provider: ProviderKey,
  serviceName: string,
  sourceUrl: string,
  methodLabel: string,
): MailProviderStatus {
  return {
    provider,
    serviceName,
    status: 'unavailable',
    statusLabel: 'Status unavailable',
    message:
      'The status check could not be completed. This does not confirm a provider outage.',
    checkedAt: new Date().toISOString(),
    sourceUrl,
    methodLabel,
  };
}

function parseApplePayload(
  rawText: string,
): ApplePayload {
  const trimmed = rawText.trim();

  if (!trimmed) {
    throw new Error(
      'Apple returned an empty response.',
    );
  }

  const jsonpMatch = trimmed.match(
    /^[A-Za-z_$][\w$.[\]]*\s*\(([\s\S]*)\)\s*;?\s*$/,
  );

  return JSON.parse(
    jsonpMatch?.[1] ?? trimmed,
  ) as ApplePayload;
}

function appleEventIsActive(
  event: AppleEvent,
): boolean {
  const status = [
    stringValue(event.statusType),
    stringValue(event.eventStatus),
  ]
    .join(' ')
    .toLowerCase();

  const resolved =
    /\b(resolved|completed|complete|closed|ended)\b/.test(
      status,
    );

  return (
    !stringValue(event.endDate)
    && !resolved
  );
}

async function getICloudStatus():
  Promise<MailProviderStatus> {
  const response = await fetchWithTimeout(
    APPLE_DATA_URL,
  );

  if (!response.ok) {
    throw new Error(
      `Apple returned HTTP ${response.status}.`,
    );
  }

  const payload = parseApplePayload(
    await response.text(),
  );

  if (!Array.isArray(payload.services)) {
    throw new Error(
      'Apple returned an invalid service list.',
    );
  }

  const service = (
    payload.services as AppleService[]
  ).find(
    item =>
      stringValue(
        item.serviceName,
      ).toLowerCase() === 'icloud mail',
  );

  if (!service) {
    throw new Error(
      'iCloud Mail was not found.',
    );
  }

  const events = Array.isArray(service.events)
    ? service.events as AppleEvent[]
    : [];

  const activeEvent =
    events.find(appleEventIsActive);

  if (!activeEvent) {
    return {
      provider: 'icloud',
      serviceName: 'iCloud Mail',
      status: 'operational',
      statusLabel: 'Operational',
      message:
        'No active iCloud Mail incident is reported by Apple.',
      checkedAt: new Date().toISOString(),
      sourceUrl: APPLE_STATUS_URL,
      methodLabel: 'Apple system status',
    };
  }

  return {
    provider: 'icloud',
    serviceName: 'iCloud Mail',
    status: 'issue',
    statusLabel: 'Issue reported',
    message: cleanMessage(
      activeEvent.message,
      'Apple is reporting an active iCloud Mail issue.',
    ),
    detail: stringValue(
      activeEvent.usersAffected,
      'Impact not specified by Apple.',
    ),
    checkedAt: new Date().toISOString(),
    sourceUrl: APPLE_STATUS_URL,
    methodLabel: 'Apple system status',
  };
}

function incidentAffectsGmail(
  incident: GoogleIncident,
): boolean {
  if (
    stringValue(
      incident.service_name,
    ).toLowerCase() === 'gmail'
  ) {
    return true;
  }

  if (
    !Array.isArray(
      incident.affected_products,
    )
  ) {
    return false;
  }

  return (
    incident.affected_products as GoogleProduct[]
  ).some(
    product =>
      stringValue(
        product.title,
      ).toLowerCase() === 'gmail',
  );
}

function incidentIsActive(
  incident: GoogleIncident,
): boolean {
  if (stringValue(incident.end)) {
    return false;
  }

  return (
    stringValue(
      incident.most_recent_update?.status,
    ).toUpperCase() !== 'AVAILABLE'
  );
}

async function getGmailStatus():
  Promise<MailProviderStatus> {
  const reachabilityPromise =
    checkReachability(
      GMAIL_WEB_URL,
      'gmail.com',
    );

  let incidents:
    GoogleIncident[] | null = null;

  try {
    const response = await fetchWithTimeout(
      GOOGLE_INCIDENTS_URL,
    );

    if (response.ok) {
      const payload = await response.json();

      if (Array.isArray(payload)) {
        incidents =
          payload as GoogleIncident[];
      }
    }
  } catch {
    incidents = null;
  }

  const reachability =
    await reachabilityPromise;

  const activeIncident = incidents
    ?.filter(incidentAffectsGmail)
    .filter(incidentIsActive)
    .sort((left, right) => {
      const leftTime = Date.parse(
        stringValue(left.modified)
        || stringValue(left.begin),
      );

      const rightTime = Date.parse(
        stringValue(right.modified)
        || stringValue(right.begin),
      );

      return (
        (Number.isNaN(rightTime)
          ? 0
          : rightTime)
        -
        (Number.isNaN(leftTime)
          ? 0
          : leftTime)
      );
    })[0];

  if (activeIncident) {
    return {
      provider: 'gmail',
      serviceName: 'Gmail (consumer)',
      status: 'issue',
      statusLabel: 'Issue reported',
      message: cleanMessage(
        activeIncident
          .most_recent_update?.text
        || activeIncident.external_desc,
        'Google is reporting an active incident affecting Gmail.',
      ),
      detail: [
        `Severity: ${stringValue(
          activeIncident.severity,
          'unspecified',
        )}`,
        reachabilityDetail(reachability),
      ].join(' · '),
      checkedAt: new Date().toISOString(),
      sourceUrl: GOOGLE_STATUS_URL,
      methodLabel:
        'Gmail incident and endpoint check',
    };
  }

  if (
    incidents
    && reachability.web
    && reachability.mx
  ) {
    return {
      provider: 'gmail',
      serviceName: 'Gmail (consumer)',
      status: 'operational',
      statusLabel: 'Operational',
      message:
        'No active Gmail incident is reported, and consumer Gmail endpoints are reachable.',
      detail:
        reachabilityDetail(reachability),
      checkedAt: new Date().toISOString(),
      sourceUrl: GOOGLE_STATUS_URL,
      methodLabel:
        'Gmail incident and endpoint check',
    };
  }

  if (
    reachability.web
    && reachability.mx
  ) {
    return {
      provider: 'gmail',
      serviceName: 'Gmail (consumer)',
      status: 'reachable',
      statusLabel: 'Reachable',
      message:
        'Consumer Gmail endpoints are reachable, but the public incident signal could not be verified.',
      detail:
        reachabilityDetail(reachability),
      checkedAt: new Date().toISOString(),
      sourceUrl: GOOGLE_STATUS_URL,
      methodLabel:
        'Consumer endpoint check',
    };
  }

  return {
    provider: 'gmail',
    serviceName: 'Gmail (consumer)',
    status: 'unavailable',
    statusLabel: 'Check unavailable',
    message:
      'One or more Gmail checks failed. This alone does not confirm a Gmail outage.',
    detail:
      reachabilityDetail(reachability),
    checkedAt: new Date().toISOString(),
    sourceUrl: GOOGLE_STATUS_URL,
    methodLabel:
      'Consumer endpoint check',
  };
}

async function getOutlookStatus():
  Promise<MailProviderStatus> {
  const reachability =
    await checkReachability(
      OUTLOOK_WEB_URL,
      'outlook.com',
    );

  if (
    reachability.web
    && reachability.mx
  ) {
    return {
      provider: 'outlook',
      serviceName: 'Outlook.com / Hotmail',
      status: 'reachable',
      statusLabel: 'Reachable',
      message:
        'Outlook.com web and MX endpoints are reachable.',
      detail:
        reachabilityDetail(reachability),
      checkedAt: new Date().toISOString(),
      sourceUrl: MICROSOFT_STATUS_URL,
      methodLabel:
        'Consumer endpoint check',
    };
  }

  return {
    provider: 'outlook',
    serviceName: 'Outlook.com / Hotmail',
    status: 'unavailable',
    statusLabel: 'Check unavailable',
    message:
      'One or more Outlook.com checks failed. This alone does not confirm a Microsoft outage.',
    detail:
      reachabilityDetail(reachability),
    checkedAt: new Date().toISOString(),
    sourceUrl: MICROSOFT_STATUS_URL,
    methodLabel:
      'Consumer endpoint check',
  };
}

async function getYahooStatus():
  Promise<MailProviderStatus> {
  const reachability =
    await checkReachability(
      YAHOO_WEB_URL,
      'yahoo.com',
    );

  if (
    reachability.web
    && reachability.mx
  ) {
    return {
      provider: 'yahoo',
      serviceName: 'Yahoo Mail',
      status: 'reachable',
      statusLabel: 'Reachable',
      message:
        'Yahoo Mail web and MX endpoints are reachable.',
      detail:
        reachabilityDetail(reachability),
      checkedAt: new Date().toISOString(),
      sourceUrl: YAHOO_HELP_URL,
      methodLabel:
        'Consumer endpoint check',
    };
  }

  return {
    provider: 'yahoo',
    serviceName: 'Yahoo Mail',
    status: 'unavailable',
    statusLabel: 'Check unavailable',
    message:
      'One or more Yahoo Mail checks failed. This alone does not confirm a Yahoo Mail outage.',
    detail:
      reachabilityDetail(reachability),
    checkedAt: new Date().toISOString(),
    sourceUrl: YAHOO_HELP_URL,
    methodLabel:
      'Consumer endpoint check',
  };
}

async function safeStatus(
  loader: () =>
    Promise<MailProviderStatus>,
  fallback: MailProviderStatus,
): Promise<MailProviderStatus> {
  try {
    return await loader();
  } catch (error) {
    console.error(
      `[Mailbox Status] ${fallback.serviceName}:`,
      error instanceof Error
        ? error.message
        : error,
    );

    return fallback;
  }
}

async function loadStatuses():
  Promise<MailProviderStatusResponse> {
  if (
    cache
    && cache.expiresAt > Date.now()
  ) {
    return cache.value;
  }

  const providers = await Promise.all([
    safeStatus(
      getICloudStatus,
      fallbackStatus(
        'icloud',
        'iCloud Mail',
        APPLE_STATUS_URL,
        'Apple system status',
      ),
    ),

    safeStatus(
      getGmailStatus,
      fallbackStatus(
        'gmail',
        'Gmail (consumer)',
        GOOGLE_STATUS_URL,
        'Consumer Gmail status',
      ),
    ),

    safeStatus(
      getOutlookStatus,
      fallbackStatus(
        'outlook',
        'Outlook.com / Hotmail',
        MICROSOFT_STATUS_URL,
        'Consumer endpoint check',
      ),
    ),

    safeStatus(
      getYahooStatus,
      fallbackStatus(
        'yahoo',
        'Yahoo Mail',
        YAHOO_HELP_URL,
        'Consumer endpoint check',
      ),
    ),
  ]);

  const value: MailProviderStatusResponse = {
    checkedAt: new Date().toISOString(),
    providers,
  };

  cache = {
    value,
    expiresAt:
      Date.now() + CACHE_TTL_MS,
  };

  return value;
}

export function registerMailProviderStatusRoute(
  app: Express,
): void {
  app.get(
    '/api/status/mail-providers',
    async (_request, response) => {
      const result = await loadStatuses();

      response.setHeader(
        'Cache-Control',
        'private, max-age=30, stale-while-revalidate=60',
      );

      response.json(result);
    },
  );
}
