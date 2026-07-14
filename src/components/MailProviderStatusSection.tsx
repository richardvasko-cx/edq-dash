import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

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

interface MailProviderStatus {
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

interface StatusResponse {
  checkedAt: string;
  providers: MailProviderStatus[];
}

const PROVIDERS: Array<{
  provider: ProviderKey;
  serviceName: string;
  sourceUrl: string;
}> = [
  {
    provider: 'icloud',
    serviceName: 'iCloud Mail',
    sourceUrl:
      'https://www.apple.com/support/systemstatus/',
  },
  {
    provider: 'gmail',
    serviceName: 'Gmail (consumer)',
    sourceUrl:
      'https://www.google.com/appsstatus/dashboard/',
  },
  {
    provider: 'outlook',
    serviceName: 'Outlook.com / Hotmail',
    sourceUrl:
      'https://portal.office.com/servicestatus',
  },
  {
    provider: 'yahoo',
    serviceName: 'Yahoo Mail',
    sourceUrl:
      'https://help.yahoo.com/kb/mail',
  },
];

function loadingStatus(
  provider: typeof PROVIDERS[number],
): MailProviderStatus {
  return {
    provider: provider.provider,
    serviceName: provider.serviceName,
    status: 'unavailable',
    statusLabel: 'Checking',
    message:
      'Checking the latest provider status…',
    checkedAt: '',
    sourceUrl: provider.sourceUrl,
    methodLabel: 'Checking provider',
  };
}

function checkedLabel(
  value: string,
): string {
  if (!value) {
    return 'Checking now';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `Checked ${date.toLocaleTimeString(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )}`;
}

function ProviderCard({
  status,
  loading,
}: {
  status: MailProviderStatus;
  loading: boolean;
}) {
  const appearance = {
    operational: {
      dot: 'bg-[#35A85B]',
      badge:
        'bg-[#E7F5EC] text-[#267C45]',
      message: 'text-[#587062]',
    },
    reachable: {
      dot: 'bg-[#2976E6]',
      badge:
        'bg-[#E7F0FF] text-[#2976E6]',
      message: 'text-[#52677F]',
    },
    issue: {
      dot: 'bg-[#E35D4F]',
      badge:
        'bg-[#FCE8E5] text-[#B44739]',
      message: 'text-[#8A5148]',
    },
    unavailable: {
      dot: 'bg-[#9AA2AA]',
      badge:
        'bg-[#EEF1F4] text-[#68717A]',
      message: 'text-[#747C84]',
    },
  }[status.status];

  return (
    <div className="rounded-[13px] bg-white px-3.5 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${appearance.dot}`}
          />

          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight text-[#30363D]">
              {status.serviceName}
            </div>

            <div className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9299A1]">
              {status.methodLabel}
            </div>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold ${appearance.badge}`}
        >
          {loading
            ? 'Checking'
            : status.statusLabel}
        </span>
      </div>

      <p
        className={`mt-2.5 text-[11.5px] font-medium leading-[1.42] ${appearance.message}`}
      >
        {status.message}
      </p>

      {status.detail && (
        <div className="mt-2 rounded-[9px] bg-[#F7F9FB] px-2.5 py-2 text-[10px] font-medium leading-snug text-[#737B84]">
          {status.detail}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-[#EDF0F3] pt-2.5">
        <span className="text-[9.5px] font-medium text-[#9299A1]">
          {checkedLabel(status.checkedAt)}
        </span>

        <a
          href={status.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[9.5px] font-semibold text-[#2976E6] hover:underline"
        >
          View source
        </a>
      </div>
    </div>
  );
}

export default function MailProviderStatusSection() {
  const [response, setResponse] =
    useState<StatusResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;
    let activeController:
      AbortController | null = null;

    const load = async () => {
      activeController?.abort();

      const controller =
        new AbortController();

      activeController = controller;

      const timeoutId =
        window.setTimeout(
          () => controller.abort(),
          15_000,
        );

      try {
        const apiResponse = await fetch(
          '/api/status/mail-providers',
          {
            cache: 'no-store',
            signal: controller.signal,
          },
        );

        if (!apiResponse.ok) {
          throw new Error(
            `Status request failed with ${apiResponse.status}.`,
          );
        }

        const payload =
          (await apiResponse.json()) as StatusResponse;

        if (mounted) {
          setResponse(payload);
        }
      } catch {
        if (
          mounted
          && !controller.signal.aborted
        ) {
          setResponse({
            checkedAt:
              new Date().toISOString(),
            providers:
              PROVIDERS.map(provider => ({
                ...loadingStatus(provider),
                statusLabel:
                  'Status unavailable',
                message:
                  'The dashboard could not retrieve this provider status. This does not confirm an outage.',
                checkedAt:
                  new Date().toISOString(),
              })),
          });
        }
      } finally {
        window.clearTimeout(timeoutId);

        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    const intervalId =
      window.setInterval(
        () => void load(),
        5 * 60_000,
      );

    return () => {
      mounted = false;
      activeController?.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const statuses = useMemo(() => {
    const returned = new Map(
      response?.providers.map(
        status => [
          status.provider,
          status,
        ],
      ) ?? [],
    );

    return PROVIDERS.map(
      provider =>
        returned.get(provider.provider)
        ?? loadingStatus(provider),
    );
  }, [response]);

  return (
    <section aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-[#858C94]">
          Mailbox Provider Status
        </h2>

        <span className="text-[9.5px] font-medium text-[#9AA1A9]">
          Auto-refreshes
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {statuses.map(status => (
          <ProviderCard
            key={status.provider}
            status={status}
            loading={loading}
          />
        ))}
      </div>

      <p className="mt-2.5 text-[9.5px] font-medium leading-snug text-[#9AA1A9]">
        Reachable indicates successful web and MX checks, not confirmed end-to-end delivery health.
      </p>
    </section>
  );
}
