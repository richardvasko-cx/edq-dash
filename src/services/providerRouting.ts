// Provider routing: every Braze account sends through one Braze-managed sending
// infrastructure provider: SparkPost, SendGrid, or Amazon SES.
// SparkPost has live demo fixtures; SendGrid and Amazon SES can be wired later and
// must render explicit unavailable states until a source exists, never fabricated data.

export type Mta = 'sparkpost' | 'sendgrid' | 'ses' | undefined;
export type MtaKey = Exclude<Mta, undefined>;

export const BRAZE_INFRASTRUCTURE_PROVIDERS: Array<{
  key: MtaKey;
  label: string;
  shortLabel: string;
  sourceView: string | null;
  available: boolean;
  spfInclude: string;
  icon: string;
}> = [
  {
    key: 'sparkpost',
    label: 'SparkPost',
    shortLabel: 'SparkPost',
    sourceView: 'sparkpost_domain_metrics',
    available: true,
    spfInclude: 'sparkpostmail.com',
    icon: 'bolt',
  },
  {
    key: 'sendgrid',
    label: 'SendGrid',
    shortLabel: 'SendGrid',
    sourceView: 'sendgrid_stats_unique',
    available: false,
    spfInclude: 'sendgrid.net',
    icon: 'send',
  },
  {
    key: 'ses',
    label: 'Amazon SES',
    shortLabel: 'SES',
    sourceView: null,
    available: false,
    spfInclude: 'amazonses.com',
    icon: 'cloud',
  },
];

export interface ProviderRoute {
  /** Display name for the sending platform. */
  label: string;
  /** Primary Looker view backing this provider's metrics. */
  sourceView: string | null;
  /** Whether a data source is wired for this provider in the prototype. */
  available: boolean;
}

export function normalizeMta(value: string | null | undefined): Mta {
  const raw = (value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (!raw) return undefined;
  if (raw === 'sparkpost' || raw === 'sparkpostmail') return 'sparkpost';
  if (raw === 'sendgrid') return 'sendgrid';
  if (raw === 'ses' || raw === 'amazonses' || raw === 'simpleemailservice' || raw === 'amazonsimpleemailservice') return 'ses';
  return undefined;
}

export function providerConfig(value: string | null | undefined) {
  const key = normalizeMta(value);
  return BRAZE_INFRASTRUCTURE_PROVIDERS.find(provider => provider.key === key);
}

export function providerDisplayName(value: string | null | undefined, fallback = 'Sending platform'): string {
  return providerConfig(value)?.label ?? fallback;
}

export function providerShortName(value: string | null | undefined, fallback = 'Platform'): string {
  return providerConfig(value)?.shortLabel ?? fallback;
}

export function providerSpfInclude(value: string | null | undefined): string | null {
  return providerConfig(value)?.spfInclude ?? null;
}

export function providerIcon(value: string | null | undefined): string {
  return providerConfig(value)?.icon ?? 'cloud';
}

export function routeProvider(mta: string | null | undefined): ProviderRoute {
  const provider = providerConfig(mta);
  if (!provider) return { label: 'Sending platform', sourceView: null, available: false };
  return { label: provider.label, sourceView: provider.sourceView, available: provider.available };
}
