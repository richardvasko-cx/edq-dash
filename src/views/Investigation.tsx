import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { DraftSparkIcon } from '../components/SparkIcons';
import { marked } from 'marked';
import UserGuideCenter from '../components/UserGuideCenter';
import { AccountDetailsPanel } from '../components/investigation/OverviewLookerPanels';
import { DeliverabilityDiagnosticsDashboard } from '../components/investigation/DeliverabilityPanels';
import { EMAIL_PANEL_METRICS, EMAIL_PANEL_TITLES, EmailPerformanceDashboard, type EmailPerformancePanelKey } from '../components/investigation/EmailPerformancePanels';
import DateRangeControl, { type DateRange } from '../components/charts/DateRangeControl';
import MetricsFilterSheet from '../components/charts/MetricsFilterSheet';
import { EMPTY_FILTERS, type ResourceFilters, type ResourceKey } from '../components/charts/MetricsFilterTypes';
import PanelCustomizeSheet, { type PanelOutlineItem } from '../components/charts/PanelCustomizeSheet';
import CaseThreadPanel from '../components/investigation/CaseThreadPanel';
import WorkspacePanels from '../components/investigation/WorkspacePanels';
import NextStepsPanel from '../components/investigation/NextStepsPanel';
import RootCauseBody from '../components/investigation/RootCauseBody';
import GeminiIcon from '../components/GeminiIcon';
import { isClosedCase, type CaseRecord } from '../data';
import { useCaseDataset } from '../hooks/useCaseDataset';
import { useHistoricalMetrics } from '../hooks/useHistoricalMetrics';
import { rankRelevant } from '../services/historyRelevance';
import { authCheckFromTicket, authCheckSummary, dnsTypeName, runTicketAuthScan, type AuthFindingStatus, type AuthScanResult, type DigAuthStatus, type DnsRecordType, type TicketAuthCheck } from '../services/googleDigAuth';
import { providerDisplayName } from '../services/providerRouting';
import { getEnabledMetricKeysForProvider, getMetricCatalogForProvider } from '../services/metricCatalog';
import { md3Ease, md3Enter } from '../lib/md3Motion';

// Register @material/web elements
import '@material/web/progress/circular-progress.js';
import '@material/web/divider/divider.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';

function DetailField({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0 border-b border-dotted border-[#DDE1E7] bg-[#FBFCFD] px-4 py-3 dark:border-outline-variant/30 dark:bg-inverse-surface/15", className)}>
      <div className="text-[12px] font-medium text-on-surface-variant">{label}</div>
      <div className={cn("mt-0.5 truncate text-[15px] font-bold leading-snug text-on-surface dark:text-inverse-on-surface", valueClassName)}>{value}</div>
    </div>
  );
}

export default function Investigation({
  activeSection,
  onSectionChange,
  selectedTicketId,
  onSelectTicket,
  onOpenTicketPanel,
  onNavigateView,
}: {
  activeSection: string;
  onSectionChange: (s: string) => void;
  selectedTicketId: string | null;
  onSelectTicket: (id: string | null) => void;
  onOpenTicketPanel?: () => void;
  onNavigateView?: (v: any) => void;
}) {
  // Canonical case dataset — sole source of truth (no /api/tickets polling).
  const { cases: ticketsList } = useCaseDataset();

  // Session persistent AI-assistant messages map per case_number (kept SEPARATE from
  // the support case thread — support comms are never mapped to AI roles).
  const [ticketMessages, setTicketMessages] = useState<Record<string, {role: 'user' | 'model', text: string}[]>>({});

  const currentTicket: CaseRecord | undefined =
    ticketsList.find(t => t.case_number === selectedTicketId) || ticketsList[0];
  const historicalMetrics = useHistoricalMetrics();
  const metricDates = React.useMemo(
    () => currentTicket
      ? [...new Set(historicalMetrics.forCase(currentTicket.case_number).map(row => row.metric_date))].sort()
      : [],
    [currentTicket?.case_number, historicalMetrics],
  );
  const [sharedMetricRange, setSharedMetricRange] = useState<DateRange>({ from: '', to: '' });
  const effectiveMetricRange: DateRange = {
    from: sharedMetricRange.from || metricDates[Math.max(0, metricDates.length - 7)] || '',
    to: sharedMetricRange.to || metricDates[metricDates.length - 1] || '',
  };
  const messages = (selectedTicketId ? ticketMessages[selectedTicketId] : null)
    || (currentTicket ? [{ role: 'model' as const, text: `Reviewing ${currentTicket.account_name} (${currentTicket.case_number}). ${currentTicket.root_cause_summary} Want me to pull the supporting evidence?` }] : []);
  // The embedded investigation chat previously sent only the typed message, unlike
  // the global Gemini pill. Keep it grounded in the same active case and tab so
  // it can inspect evidence rather than asking the consultant to fetch it.
  const investigationChatScreen = React.useMemo(() => {
    if (!currentTicket) return `Currently viewing: ${activeSection}`;
    const metrics = currentTicket.metrics;
    const topBounce = currentTicket.bounces?.[0];
    return [
      `Currently viewing: Support ticket · ${activeSection}`,
      `Account: ${currentTicket.account_name}`,
      `Reference: ${currentTicket.case_number}`,
      `Issue: ${currentTicket.case_subject}`,
      `Root cause on record: ${currentTicket.root_cause_summary}`,
      `Authentication: SPF ${currentTicket.spf_status}; DKIM ${currentTicket.dkim_status}; DMARC ${currentTicket.dmarc_status}`,
      `Metrics: accepted ${(metrics.accepted_rate * 100).toFixed(1)}%; bounce ${(metrics.bounce_rate * 100).toFixed(1)}%; delayed ${(metrics.delayed_rate * 100).toFixed(1)}%; open ${(metrics.nonprefetched_open_rate * 100).toFixed(1)}%; complaints ${(metrics.spam_complaint_rate * 100).toFixed(2)}%`,
      topBounce ? `Dominant delivery signal: ${topBounce.classification} at ${topBounce.domain} — ${topBounce.reason}` : '',
    ].filter(Boolean).join('\n');
  }, [activeSection, currentTicket?.case_number]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rootCauseUpdatedAt, setRootCauseUpdatedAt] = useState<Record<string, number>>({});
  // Drill-down memory: when a referenced ticket is opened from Support History we
  // remember where we came from so a Back button can restore it.
  const [drillBackId, setDrillBackId] = useState<string | null>(null);
  const drillToTicket = (id: string) => {
    setDrillBackId(selectedTicketId);
    onSelectTicket(id);
    onSectionChange('Overview');
  };
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [ticketStatusOverrides, setTicketStatusOverrides] = useState<Record<string, string>>({});
  const ticketStatusOptions = ['Open', 'In Progress', 'Closed'];
  const displayedTicketStatus = currentTicket
    ? ticketStatusOverrides[currentTicket.case_number] ?? currentTicket.case_status ?? 'Open'
    : 'Open';
  const updateTicketStatus = (status: string) => {
    if (!currentTicket) return;
    setTicketStatusOverrides(current => ({ ...current, [currentTicket.case_number]: status }));
  };
  // Contract end highlight: flag the renewal only when it is within 90 days.
  const contractEndDate = currentTicket?.contract_end_date || '2026-08-30';
  const contractRenewalDate = new Date(`${contractEndDate}T00:00:00`);
  const contractDaysRemaining = (() => {
    if (Number.isNaN(contractRenewalDate.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((contractRenewalDate.getTime() - today.getTime()) / 86_400_000);
  })();
  const contractEndSoon = (() => {
    const end = new Date(contractEndDate + 'T00:00:00');
    if (isNaN(end.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
    return days >= 0 && days <= 90;
  })();
  const contractRenewalLabel = Number.isNaN(contractRenewalDate.getTime())
    ? contractEndDate
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(contractRenewalDate);
  const currentCarrLabel = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(currentTicket?.current_carr_usd ?? 1_450_000);
  const [workspaceMode, setWorkspaceMode] = useState<'panels' | 'chat'>('panels');
  const [panelStates, setPanelStates] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});
  const [emailCustomizeOpen, setEmailCustomizeOpen] = useState(false);
  const [hiddenEmailPanels, setHiddenEmailPanels] = useState<Set<string>>(() => new Set());
  const [pendingWorkspaceJump, setPendingWorkspaceJump] = useState<{ section: string; panelLabel: string } | null>(null);
  const [workspaceReviewBack, setWorkspaceReviewBack] = useState<{ section: string; panelLabel: string } | null>(null);

  const [emailSelectedMetrics, setEmailSelectedMetrics] = useState<string[]>([
    'count_nonprefetched_unique_confirmed_opened', 'count_unique_clicked', 'nonprefetched_open_rate', 'click_through_rate'
  ]);
  const [emailFilters, setEmailFilters] = useState<ResourceFilters>(EMPTY_FILTERS);
  const [emailMetricsOpen, setEmailMetricsOpen] = useState(false);
  const [emailMetricContext, setEmailMetricContext] = useState<EmailPerformancePanelKey | null>(null);
  const [emailSubview, setEmailSubview] = useState<'overview' | 'audience' | 'campaigns'>('overview');
  const [deliverabilityScope, setDeliverabilityScope] = useState<ResourceFilters | undefined>();

  const caseRows = React.useMemo(
    () => currentTicket ? historicalMetrics.forCase(currentTicket.case_number) : [],
    [currentTicket?.case_number, historicalMetrics]
  );
  const emailMetricCatalog = React.useMemo(
    () => getMetricCatalogForProvider(currentTicket?.email_service_provider),
    [currentTicket?.email_service_provider]
  );
  const emailEnabledMetrics = React.useMemo(
    () => getEnabledMetricKeysForProvider(currentTicket?.email_service_provider),
    [currentTicket?.email_service_provider]
  );

  const emailOptions = React.useMemo<Record<ResourceKey, string[]>>(() => {
    const uniq = (rows: any[], k: string) => [...new Set(rows.map(r => r[k]).filter(Boolean) as string[])].sort();
    return {
      recipientDomains: uniq(caseRows, 'recipient_domain'),
      sendingIps: uniq(caseRows, 'sending_ip'),
      ipPools: uniq(caseRows, 'ip_pool'),
      campaigns: uniq(caseRows, 'campaign'),
      mailboxProviders: uniq(caseRows, 'mailbox_provider'),
      mailboxProviderRegions: [],
      sendingDomains: uniq(caseRows, 'sending_domain'),
      subaccounts: uniq(caseRows, 'subaccount'),
    };
  }, [caseRows]);

  // General Email Performance panels begin with the full account scope. Provider
  // selection is applied only within receiver-specific panels.
  useEffect(() => {
    if (!currentTicket) return;
    setEmailFilters({
      recipientDomains: [],
      sendingIps: [],
      ipPools: [],
      campaigns: [],
      mailboxProviders: [],
      mailboxProviderRegions: [],
      sendingDomains: [],
      subaccounts: [],
    });
  }, [currentTicket?.case_number]);

  useEffect(() => {
    setEmailSelectedMetrics(current => {
      const enabled = new Set(getEnabledMetricKeysForProvider(currentTicket?.email_service_provider));
      const next = current.filter(metric => enabled.has(metric));
      return next.length ? next : ['count_nonprefetched_unique_confirmed_opened', 'count_unique_clicked', 'nonprefetched_open_rate', 'click_through_rate'].filter(metric => enabled.has(metric));
    });
  }, [currentTicket?.case_number, currentTicket?.email_service_provider]);

  // New ticket views start with the newest week of CSV metrics. This avoids
  // treating missing older demo rows as a 30-day reporting window.
  useEffect(() => {
    if (!metricDates.length) return;
    setSharedMetricRange({
      from: metricDates[Math.max(0, metricDates.length - 7)],
      to: metricDates[metricDates.length - 1],
    });
  }, [currentTicket?.case_number, metricDates]);

  useEffect(() => {
    if (activeSection === 'Email Performance') {
      window.dispatchEvent(new CustomEvent('edq:active-filters-changed', {
        detail: {
          dateRange: effectiveMetricRange,
          sendingIps: emailFilters.sendingIps,
          sendingDomains: emailFilters.sendingDomains,
          recipientDomains: emailFilters.recipientDomains,
          ipPools: emailFilters.ipPools,
          mailboxProviders: emailFilters.mailboxProviders,
          subaccounts: emailFilters.subaccounts,
          selectedDomain: emailFilters.sendingDomains[0] ?? '',
          selectedSendingDomain: emailFilters.sendingDomains[0] ?? '',
          selectedIp: emailFilters.sendingIps[0] ?? '',
          selectedIsp: emailFilters.mailboxProviders[0] ?? '',
          selectedSubaccount: emailFilters.subaccounts[0] ?? '',
        }
      }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent('edq:active-filters-changed', { detail: null }));
    };
  }, [activeSection, emailFilters, effectiveMetricRange]);

  // User Guide States
  const leftPanelTab = 'tickets';
  const [userGuideFiles, setUserGuideFiles] = useState<any[]>([]);
  const [userGuideSearch, setUserGuideSearch] = useState('');
  const [userGuideCategory, setUserGuideCategory] = useState('All');
  const [selectedGuideFile, setSelectedGuideFile] = useState<any>(null);

  // Load User Guide Files on mount
  useEffect(() => {
    fetch('/api/user-guide/files')
      .then(res => res.json())
      .then(data => {
        if (data && data.files) {
          setUserGuideFiles(data.files);
        }
      })
      .catch(err => console.error("Error fetching user guide files:", err));
  }, []);

  const refreshUserGuide = () => {
    fetch('/api/user-guide/files')
      .then(res => res.json())
      .then(data => {
        if (data && data.files) {
          setUserGuideFiles(data.files);
        }
      })
      .catch(err => console.error("Error refreshing files:", err));
  };

  const filteredGuideFiles = userGuideFiles.filter(f => {
    const matchesSearch = f.filename.toLowerCase().includes(userGuideSearch.toLowerCase()) || 
                          f.githubPath.toLowerCase().includes(userGuideSearch.toLowerCase());
    const matchesCategory = userGuideCategory === 'All' || f.section === userGuideCategory;
    return matchesSearch && matchesCategory;
  });

  const syncedCount = userGuideFiles.filter(f => f.isSynced).length;
  const totalCount = userGuideFiles.length;

  // Table Filters State
  const [bounceFilter, setBounceFilter] = useState<'All' | 'Hard' | 'Soft' | 'Block'>('All');
  const [searchDomain, setSearchDomain] = useState('');
  const [searchReason, setSearchReason] = useState('');

  // Ticket Authentication Clipboard States
  const [spfCopied, setSpfCopied] = useState(false);
  const [fixCopied, setFixCopied] = useState(false);

  const filteredBounces = (currentTicket?.bounces ?? []).filter(item => {
    if (bounceFilter !== 'All' && item.category !== bounceFilter) return false;
    if (searchDomain.trim() && !item.domain.toLowerCase().includes(searchDomain.toLowerCase().trim())) return false;
    if (searchReason.trim() && !item.reason.toLowerCase().includes(searchReason.toLowerCase().trim())) return false;
    return true;
  });


  // Authentication Validator State
  const [authLoading, setAuthLoading] = useState(false);
  const [authResults, setAuthResults] = useState<TicketAuthCheck | null>(null);
  const [authScan, setAuthScan] = useState<AuthScanResult | null>(null);
  const [authViewMode, setAuthViewMode] = useState<'smart' | 'raw'>('raw');
  const [authScopeOpen, setAuthScopeOpen] = useState(false);
  const [authScopeTab, setAuthScopeTab] = useState<'domains' | 'ips'>('domains');
  const [selectedAuthLookup, setSelectedAuthLookup] = useState<string>('');
  const [selectedAuthScope, setSelectedAuthScope] = useState('all');
  const [authRecordType, setAuthRecordType] = useState<DnsRecordType>('TXT');

  const ticketDomain = currentTicket?.sending_domains?.[0] ?? '';
  useEffect(() => {
    setAuthResults(null);
    setAuthScan(null);
    setSelectedAuthLookup('');
    setSelectedAuthScope('all');
    setAuthRecordType('TXT');
    setAuthViewMode('raw');
  }, [selectedTicketId, ticketDomain]);

  const runAuthValidation = async (force = false) => {
    if (!currentTicket) return;

    setAuthLoading(true);
    if (force) {
      setAuthScan(null);
      setAuthResults(null);
      setSelectedAuthLookup('');
    }
    try {
      const scan = await runTicketAuthScan(currentTicket, { force });
      setAuthScan(scan);
      setSelectedAuthLookup(scan.lookups[0]?.queryName || '');
      setAuthResults({
        ...authCheckFromTicket(currentTicket),
        checkedAt: scan.checkedAt,
        scan,
      });
    } catch (e: any) {
      console.error(e);
      if (currentTicket) setAuthResults(authCheckFromTicket(currentTicket));
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection !== 'Authentication' || !ticketDomain || authResults || authLoading) return;
    runAuthValidation();
  }, [activeSection, ticketDomain]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pendingWorkspaceJump || activeSection !== pendingWorkspaceJump.section) return;
    let cancelled = false;
    let attempts = 0;
    const tryScroll = () => {
      if (cancelled) return;
      const selector = `[data-gem-panel-label="${pendingWorkspaceJump.panelLabel.replace(/"/g, '\\"')}"]`;
      const panel = document.querySelector(selector) as HTMLElement | null;
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setPendingWorkspaceJump(null);
        return;
      }
      attempts += 1;
      if (attempts < 12) window.setTimeout(tryScroll, 120);
    };
    window.setTimeout(tryScroll, 0);
    return () => { cancelled = true; };
  }, [activeSection, pendingWorkspaceJump]);

  // Gemini navigation chips persist their exact destination across the route
  // transition. This lets a chip land on supporting evidence, not just the tab.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('edq_gemini_app_action');
      if (!raw) return;
      const payload = JSON.parse(raw) as { action?: { view?: string; ticketSection?: string; panelLabel?: string } };
      if (payload.action?.view !== 'investigation' || !payload.action.ticketSection) return;
      sessionStorage.removeItem('edq_gemini_app_action');
      if (payload.action.panelLabel) {
        setPendingWorkspaceJump({ section: payload.action.ticketSection, panelLabel: payload.action.panelLabel });
      }
      onSectionChange(payload.action.ticketSection);
    } catch {}
  }, []); // Route transition only; later section changes must not replay a chip.

  useEffect(() => {
    if (activeSection === 'Workspace' && workspaceReviewBack) {
      setWorkspaceReviewBack(null);
    }
  }, [activeSection, workspaceReviewBack]);

  useEffect(() => {
    setWorkspaceReviewBack(null);
    setPendingWorkspaceJump(null);
  }, [selectedTicketId]);

  const jumpFromWorkspace = (section: string, panelLabel: string) => {
    setWorkspaceReviewBack({ section, panelLabel });
    setPendingWorkspaceJump({ section, panelLabel });
    onSectionChange(section);
  };

  const sendMessage = async () => {
    if (!selectedTicketId || !input.trim() || isLoading) return;
    
    const userMessage = { role: 'user' as const, text: input };
    const currentMessages = messages;
    const updatedWithUser = [...currentMessages, userMessage];

    setTicketMessages(prev => ({
      ...prev,
      [selectedTicketId]: updatedWithUser
    }));
    setInput('');
    setIsLoading(true);

    try {
      if (localStorage.getItem('edq_gemini_api_enabled') === 'false') {
        setTicketMessages(prev => ({
          ...prev,
          [selectedTicketId]: [...updatedWithUser, { role: 'model' as const, text: '⚠️ **Gemini API is disabled in Settings.** Please enable it to chat.' }]
        }));
        setIsLoading(false);
        return;
      }

      let response: Response;
      try {
        response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage.text,
            history: currentMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
            screen: investigationChatScreen,
            ticketRef: currentTicket ? { id: currentTicket.case_number, account: currentTicket.account_name } : undefined,
          })
        });
      } catch {
        throw new Error('Failed to reach Gemini API');
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setTicketMessages(prev => ({
        ...prev,
        [selectedTicketId]: [...updatedWithUser, { role: 'model' as const, text: data.text }]
      }));
    } catch (e: any) {
      const isDown = e.message === 'Failed to reach Gemini API'
        || e.message === 'fetch failed'
        || e.message?.includes('ECONNREFUSED')
        || e.message?.includes('Failed to fetch');
      const errorText = isDown 
        ? "⚠️ **Gemini API is not configured.** Please check your settings or `.env` file." 
        : `**Error:** ${e.message}`;
      setTicketMessages(prev => ({
        ...prev,
        [selectedTicketId]: [...updatedWithUser, { role: 'model' as const, text: errorText }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const emailPanelVisible = (key: string) => !hiddenEmailPanels.has(key);
  const hideEmailPanel = (key: string) => {
    setHiddenEmailPanels(current => {
      const next = new Set(current);
      next.add(key);
      return next;
    });
  };
  const showEmailPanel = (key: string) => {
    setHiddenEmailPanels(current => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  };
  const emailPanelOutlineItems: PanelOutlineItem[] = [
    {
      key: 'performanceTrend',
      title: 'Email performance over time',
      description: 'Engagement trend chart using the selected date window and metrics.',
      visible: emailPanelVisible('performanceTrend'),
      preview: (
        <div className="flex h-full flex-col justify-end gap-3">
          <div className="flex h-20 items-end gap-2">
            {[54, 38, 46, 50, 57, 41, 49, 55, 61, 45].map((height, index) => (
              <span key={index} className="flex-1 rounded-t-[5px] bg-[#FFA524]" style={{ height: `${height}%` }} />
            ))}
            {[12, 8, 10, 11, 12, 9, 10, 12, 13, 9].map((height, index) => (
              <span key={`click-${index}`} className="flex-1 rounded-t-[5px] bg-[#7B1FEA]" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-[#A61B79]" />
        </div>
      ),
    },
    {
      key: 'funnel',
      title: 'Reach and engagement',
      description: 'Funnel from targeted volume through confirmed opens and clicks.',
      visible: emailPanelVisible('funnel'),
      preview: (
        <div className="grid h-full grid-cols-2 gap-2">
          {[
            ['Delivered', '3.1M'],
            ['Opens', '870k'],
            ['Clicks', '696k'],
            ['CTR', '22.4%'],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col justify-center rounded-xl bg-[#E8F0FE] px-2 text-center">
              <span className="truncate text-[15px] font-black text-[#1a73e8]">{value}</span>
              <span className="truncate text-[9px] font-black text-[#5F6368]">{label}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'assessment',
      title: 'Performance assessment',
      description: 'Structured interpretation of delivery, placement, engagement and receiver evidence.',
      visible: emailPanelVisible('assessment'),
    },
    {
      key: 'recipientResponse',
      title: 'Recipient response over time',
      description: 'Clicks, unsubscribes, complaints and moved-to-spam trend signals.',
      visible: emailPanelVisible('recipientResponse'),
    },
    {
      key: 'placement',
      title: 'Placement summary',
      description: 'Inbox, spam and moved-folder placement signals where measured data exists.',
      visible: emailPanelVisible('placement'),
    },
    {
      key: 'engagementTrend',
      title: 'Engagement quality over time',
      description: 'Audience & Engagement trend view for opens, clicks, CTR and CTO.',
      visible: emailPanelVisible('engagementTrend'),
    },
    {
      key: 'responseBalance',
      title: 'Positive versus negative response',
      description: 'Audience response comparison across positive and negative recipient behaviour.',
      visible: emailPanelVisible('responseBalance'),
    },
    {
      key: 'receiverCards',
      title: 'Receiver overview cards',
      description: 'Compact mailbox-provider summaries now shown under Audience & Engagement.',
      visible: emailPanelVisible('receiverCards'),
    },
    {
      key: 'receiverTrend',
      title: 'Receiver trend comparison',
      description: 'Mailbox-provider trend comparison against account performance.',
      visible: emailPanelVisible('receiverTrend'),
    },
    {
      key: 'receiverTable',
      title: 'Mailbox-provider performance',
      description: 'Tabular receiver drill-down with delivery and engagement metrics.',
      visible: emailPanelVisible('receiverTable'),
    },
    {
      key: 'deliveryBridge',
      title: 'Delivery-to-engagement bridge',
      description: 'Connects weak receiver performance to related Deliverability evidence.',
      visible: emailPanelVisible('deliveryBridge'),
    },
    {
      key: 'keyContributors',
      title: 'Key Contributors',
      description: 'Campaign, Canvas, audience and content contribution analysis requires data not available in this prototype.',
      visible: true,
      disabled: true,
      disabledLabel: 'Coming soon',
    },
  ];

  if (!currentTicket) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#121115] font-sans">
        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          Loading case data…
        </div>
      </div>
    );
  }

  // mta alias for provider routing / display (CaseRecord uses email_service_provider)
  const mta = currentTicket.email_service_provider;
  const providerLabel = providerDisplayName(mta);
  const liveAuth = authResults ?? authCheckFromTicket(currentTicket);
  const authGemContent = authCheckSummary(liveAuth) + ` | rDNS: ${currentTicket.rdns_status} — ${currentTicket.rdns_hostname}`;
  const activeAuthScan = authScan ?? liveAuth.scan ?? null;
  const statusColor = (status: AuthFindingStatus) => (
    status === 'healthy' ? 'text-[#137333] bg-[#E6F4EA] border-[#CEEAD6]'
    : status === 'warning' ? 'text-[#9A6700] bg-[#FEF7E0] border-[#FEEFC3]'
    : status === 'error' ? 'text-[#B3261E] bg-[#FCE8E6] border-[#FAD2CF]'
    : 'text-[#5F6368] bg-[#F1F3F4] border-[#E8EAED]'
  );
  const statusDot = (status: AuthFindingStatus) => (
    status === 'healthy' ? 'bg-[#34A853]'
    : status === 'warning' ? 'bg-[#F9AB00]'
    : status === 'error' ? 'bg-[#EA4335]'
    : 'bg-[#9AA0A6]'
  );
  const byCategory = (category: string) => activeAuthScan?.findings.filter(item => item.category === category) ?? [];
  const countHealthy = (category?: string) => (category ? byCategory(category) : activeAuthScan?.findings ?? []).filter(item => item.status === 'healthy').length;
  const countIssues = (category?: string) => (category ? byCategory(category) : activeAuthScan?.findings ?? []).filter(item => item.status === 'warning' || item.status === 'error').length;
  const authRecordTypes: DnsRecordType[] = ['A', 'AAAA', 'CAA', 'CNAME', 'DNSKEY', 'DS', 'HTTPS', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'SVCB', 'TLSA', 'TSIG', 'TXT'];
  const authScopes = [
    { id: 'all', value: 'All domains', role: 'Full scan', kind: 'all' as const },
    ...(activeAuthScan?.identities ?? []),
  ];
  const selectedScope = authScopes.find(item => item.id === selectedAuthScope) ?? authScopes[0];
  const scopeMatchesText = (text: string) => {
    if (!selectedScope || selectedScope.id === 'all') return true;
    const value = selectedScope.value.toLowerCase();
    const normalizedText = text.toLowerCase();
    if (normalizedText.includes(value)) return true;
    if ('kind' in selectedScope && selectedScope.kind === 'ip') return normalizedText.includes(value.split('.').reverse().join('.'));
    return false;
  };
  const visibleAuthFindings = (activeAuthScan?.findings ?? []).filter(item =>
    selectedAuthScope === 'all'
      || scopeMatchesText(`${item.subject} ${item.lookupIds.join(' ')} ${item.evidence.join(' ')}`)
  );
  const visibleLookups = (activeAuthScan?.lookups ?? []).filter(item =>
    item.queryType === authRecordType && (selectedAuthScope === 'all' || scopeMatchesText(`${item.queryName} ${item.answers.map(a => a.data || '').join(' ')}`))
  );
  const rawLookup = visibleLookups.find(item => item.queryName === selectedAuthLookup) ?? visibleLookups[0] ?? null;
  const authVisualStatus = (status: AuthFindingStatus | DigAuthStatus | string | undefined, policy?: string): AuthFindingStatus => {
    const normalized = `${status || ''}`.toLowerCase();
    if (policy && policy.toLowerCase() === 'none') return 'warning';
    if (normalized === 'healthy' || normalized === 'pass' || normalized === 'passed') return 'healthy';
    if (normalized === 'error' || normalized === 'fail' || normalized === 'failed') return 'error';
    if (normalized === 'warning' || normalized === 'warn' || normalized === 'none') return 'warning';
    return 'unknown';
  };
  const firstFinding = (category: string) => byCategory(category)[0];
  const spfFinding = firstFinding('SPF');
  const dmarcFinding = firstFinding('DMARC');
  const dkimStoredStatus = currentTicket.dkim_status === 'PASS' ? 'healthy' : currentTicket.dkim_status === 'FAIL' ? 'error' : 'warning';
  const authVisualCards = [
    {
      id: 'spf',
      label: 'SPF',
      status: authVisualStatus(spfFinding?.status ?? liveAuth.spf.status),
      info: spfFinding?.summary || liveAuth.spf.record || currentTicket.spf_description || 'Sender domain SPF status from account authentication data.',
      scope: currentTicket.sending_domains?.[0] || ticketDomain,
      lookup: activeAuthScan?.lookups.find(item => item.queryType === 'TXT' && item.queryName.replace(/\.$/, '') === (currentTicket.sending_domains?.[0] || ticketDomain)),
    },
    {
      id: 'dkim',
      label: 'DKIM',
      status: authVisualStatus(dkimStoredStatus),
      info: currentTicket.dkim_description || 'DKIM passes from stored account authentication status; selector DNS is not scanned in this view.',
      scope: currentTicket.sending_domains?.[0] || ticketDomain,
      lookup: null,
    },
    {
      id: 'dmarc',
      label: 'DMARC',
      status: authVisualStatus(dmarcFinding?.status ?? liveAuth.dmarc.status, currentTicket.dmarc_policy),
      info: dmarcFinding?.summary || currentTicket.dmarc_description || `DMARC policy ${currentTicket.dmarc_policy || 'not recorded'}.`,
      scope: `_dmarc.${currentTicket.sending_domains?.[0] || ticketDomain}`,
      lookup: activeAuthScan?.lookups.find(item => item.queryType === 'TXT' && item.queryName.replace(/\.$/, '') === `_dmarc.${currentTicket.sending_domains?.[0] || ticketDomain}`),
    },
  ];
  const openAuthVisualCard = (card: typeof authVisualCards[number]) => {
    setAuthViewMode('raw');
    if (card.lookup) {
      setAuthRecordType(card.lookup.queryType);
      setSelectedAuthLookup(card.lookup.queryName);
      return;
    }
    if (card.id === 'spf' || card.id === 'dmarc') {
      setAuthRecordType('TXT');
      setSelectedAuthLookup(card.scope);
    }
  };

  return (
    <div className={cn(
      'h-full w-full overflow-x-auto overflow-y-auto custom-scrollbar bg-white font-sans scroll-smooth dark:bg-[#121115]',
      (activeSection === 'Deliverability' || activeSection === 'Email Performance') && 'min-w-[545px]'
    )}>
      {/* scroll-smooth only affects programmatic scrolls (panel navigation lands smoothly);
          wheel/trackpad reading stays free — no CSS scroll-snap so long panels don't jump back. */}

      {/* Detail panel */}
      <div className="relative px-6 lg:px-10 py-2 lg:py-3 pt-2 min-h-full bg-white dark:bg-[#121115]">
        
        <AnimatePresence mode="wait" initial={false}>
          {selectedTicketId === null ? (
            /* Welcome / select ticket state */
            <motion.div
              key="welcome-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center h-full text-center p-8 max-w-md mx-auto relative z-10 min-h-[350px]"
            >
              <span className="material-symbols-outlined text-[56px] text-[#1A73E8] mb-4">confirmation_number</span>
              <h3 className="text-xl font-black text-on-surface dark:text-inverse-on-surface tracking-tight">Select a ticket</h3>
            </motion.div>
          ) : (
            <motion.div
              key={`detail-pane-${selectedTicketId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="max-w-[1400px] mx-auto relative z-10 w-full"
            >
          
          <div className="flex flex-col gap-6">
 
            {/* Breadcrumb Header Row */}
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2 mb-0 select-none">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#8a8b9f]">
                <span className="cursor-pointer hover:text-[#1A73E8] transition-colors" onClick={() => { onSelectTicket(null); onOpenTicketPanel?.(); }}>Tickets</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-[#1A73E8] font-bold">{currentTicket.case_number}</span>
              </div>
              <div />
            </div>

            {/* CONDITIONAL SECTIONS: Overview */}
            {activeSection === 'Overview' && (
              <motion.div {...md3Enter} transition={{ duration: 0.36, ease: md3Ease }} className="flex flex-col gap-6 font-sans pb-6">

                {/* ── Ticket Info + Account Info panels ── */}
                <motion.div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2" {...md3Enter} transition={{ duration: 0.36, ease: md3Ease, delay: 0.04 }}>

                  {/* Ticket Info Card */}
                  <motion.div
                    data-gem-panel
                    data-gem-panel-label="Ticket Info"
                    data-gem-panel-content={`Ticket Info — Case: ${currentTicket.case_number} | Opened: ${currentTicket.case_created_at} | Owner: ${currentTicket.case_owner} | Status: ${displayedTicketStatus} | Subject: ${currentTicket.case_subject} | Detail: ${currentTicket.root_cause_summary}`}
                    className="bg-transparent"
                    {...md3Enter}
                    transition={{ duration: 0.34, ease: md3Ease, delay: 0.06 }}
                  >
                    <div className="mb-2 select-none">
                      <h3 className="text-[20px] font-black tracking-tight text-on-surface dark:text-inverse-on-surface">Ticket Details</h3>
                    </div>
                    <div className="overflow-hidden rounded-md border border-[#D2D7DE] bg-[#FBFCFD] dark:border-outline-variant/40 dark:bg-inverse-surface/15">
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                      <DetailField className="sm:border-r" label="Case number" value={currentTicket.case_number} />
                      <DetailField label="Date opened" value={new Date(currentTicket.case_created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
                      <DetailField className="sm:border-r" label="Case owner" value={currentTicket.case_owner} />
                      <div className="min-w-0 border-b border-dotted border-[#DDE1E7] bg-[#FBFCFD] px-4 py-3 dark:border-outline-variant/30 dark:bg-inverse-surface/15">
                          <div className="text-[12px] font-medium text-on-surface-variant">Status</div>
                          <div className="mt-0.5 relative inline-flex">
                          <select
                            aria-label="Ticket status"
                            value={displayedTicketStatus}
                            onChange={(event) => updateTicketStatus(event.target.value)}
                            className={cn(
                              "h-8 appearance-none rounded-full py-0 pl-3 pr-8 text-xs font-bold text-white outline-none",
                              displayedTicketStatus === 'Closed' ? "bg-gray-500" : displayedTicketStatus === 'In Progress' ? "bg-[#FFCE18]" : "bg-[#188038]"
                            )}
                          >
                            {ticketStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                          </select>
                          <md-icon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white" style={{ fontSize: '15px' } as React.CSSProperties}>expand_more</md-icon>
                        </div>
                      </div>
                      <div className="border-b border-dotted border-[#DDE1E7] bg-[#FBFCFD] px-4 py-3 sm:col-span-2 dark:border-outline-variant/30 dark:bg-inverse-surface/15">
                          <div className="text-[12px] font-medium text-on-surface-variant">Subject</div>
                          <div className="mt-0.5 text-[15px] font-bold leading-snug text-on-surface dark:text-inverse-on-surface">{currentTicket.case_subject}</div>
                      </div>
                      <div className="bg-[#FBFCFD] px-4 sm:col-span-2 dark:bg-inverse-surface/15">
                      <button
                        type="button"
                        onClick={() => setDetailExpanded(v => !v)}
                        aria-expanded={detailExpanded}
                        className="flex min-h-[50px] w-full items-center justify-between gap-3 text-left"
                      >
                        <span className="text-[13px] font-medium text-on-surface-variant">Detailed RCA summary</span>
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={cn('h-7 w-7 shrink-0 text-[#1A73E8] transition-transform duration-300 ease-out', detailExpanded && 'rotate-45')}>
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', detailExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                        <div className="overflow-hidden">
                          <p className="border-t border-dotted border-[#DDE1E7] pb-3 pt-3 text-[12px] leading-relaxed text-on-surface-variant dark:border-outline-variant/30">
                            {currentTicket.root_cause_summary}
                          </p>
                        </div>
                      </div>
                      </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Account Info Card */}
                  <motion.div
                    data-gem-panel
                    data-gem-panel-label="Account Info"
                    data-gem-panel-content={`Account Info — Company: ${currentTicket.account_name} | Region: ${currentTicket.region} | Cluster: ${currentTicket.cluster} | MTA: ${providerLabel} | Classification: ${currentTicket.macro_classification || 'Enterprise'} | Contract renewal: ${contractRenewalLabel} | Current CARR: ${currentCarrLabel}`}
                    className="bg-transparent"
                    {...md3Enter}
                    transition={{ duration: 0.34, ease: md3Ease, delay: 0.1 }}
                  >
                    <div className="mb-2 select-none">
                      <h3 className="text-[20px] font-black tracking-tight text-on-surface dark:text-inverse-on-surface">Account Details</h3>
                    </div>
                    <div className="grid grid-cols-1 overflow-hidden rounded-md border border-[#D2D7DE] bg-[#FBFCFD] sm:grid-cols-2 dark:border-outline-variant/40 dark:bg-inverse-surface/15">
                      <DetailField className="sm:border-r" label="Company" value={currentTicket.account_name} />
                      <DetailField label="Contact" value={currentTicket.contact_name} />
                      <DetailField className="sm:border-r" label="Region" value={currentTicket.region} />
                      <DetailField label="Cluster" value={currentTicket.cluster} />
                      <DetailField className="sm:border-r" label="Email service provider" value={providerLabel} />
                      <DetailField
                        label="Contract renewal"
                        value={`${contractRenewalLabel}${contractEndSoon && contractDaysRemaining !== null ? ` · ${contractDaysRemaining} days remaining` : ''}`}
                        className={cn(contractEndSoon && "outline outline-1 -outline-offset-1 outline-[#B3261E]/40")}
                        valueClassName={cn(contractEndSoon && "text-[#B3261E] dark:text-red-300")}
                      />
                      <DetailField className="border-b-0 sm:border-r" label="Current CARR" value={currentCarrLabel} />
                      <DetailField className="border-b-0" label="Account category" value={`${currentTicket.macro_classification || 'Enterprise'} segment`} />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Root Cause Analysis Summary Card */}
                <motion.div
                  data-gem-panel
                  data-gem-panel-label="Root Cause Analysis"
                  data-gem-panel-content={`Root Cause Analysis: ${currentTicket.root_cause_summary}`}
                  className="rounded-[28px] border border-outline-variant/35 bg-[#F3F5F9] p-6 shadow-none dark:bg-inverse-surface/30"
                  {...md3Enter}
                  transition={{ duration: 0.36, ease: md3Ease, delay: 0.12 }}
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4 select-none">
                    <div>
                      <h3 className="text-[28px] font-black tracking-tight text-on-surface dark:text-inverse-on-surface">Root Cause Summary</h3>
                      <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
                        <span>powered by</span>
                        <GeminiIcon className="h-5 w-5" />
                        <span className="font-bold text-on-surface dark:text-inverse-on-surface">Gemini</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 pt-1 text-sm font-medium text-on-surface-variant/80">
                      <md-icon style={{ fontSize: '18px' } as React.CSSProperties}>schedule</md-icon>
                      {rootCauseUpdatedAt[currentTicket.case_number]
                        ? `Updated ${new Date(rootCauseUpdatedAt[currentTicket.case_number]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Generating analysis'}
                    </span>
                  </div>
                  <RootCauseBody
                    ticket={currentTicket}
                    onUpdatedAt={updatedAt => setRootCauseUpdatedAt(current => ({ ...current, [currentTicket.case_number]: updatedAt }))}
                  />
                </motion.div>

                {/* Performance Metrics Grid */}
                {(() => {
                  const m = currentTicket.metrics;
                  const acceptedPct = (m.accepted_rate * 100).toFixed(1) + '%';
                  const bouncePct = (m.bounce_rate * 100).toFixed(1) + '%';
                  const openPct = (m.nonprefetched_open_rate * 100).toFixed(1) + '%';
                  const spamPct = (m.spam_complaint_rate * 100).toFixed(1) + '%';
                  return (
                    <motion.div
                      data-gem-panel
                      data-gem-panel-label="Performance Metrics"
                      data-gem-panel-content={`Accepted Rate: ${acceptedPct} | Bounce Rate: ${bouncePct} | Open Rate: ${openPct} | Spam Complaint Rate: ${spamPct} | Sent: ${m.count_sent} | Accepted: ${m.count_accepted}`}
                      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                      {...md3Enter}
                      transition={{ duration: 0.36, ease: md3Ease, delay: 0.16 }}
                    >
                      {[
                        { label: 'Accepted Rate', value: acceptedPct, detail: `${m.count_accepted.toLocaleString()} accepted of sends` },
                        { label: 'Bounce Rate', value: bouncePct, detail: `${m.count_bounce.toLocaleString()} bounces of sends` },
                        { label: 'Confirmed Open Rate', value: openPct, detail: `${m.count_nonprefetched_unique_confirmed_opened?.toLocaleString?.() ?? '—'} confirmed opens` },
                        { label: 'Spam Complaint Rate', value: spamPct, detail: `${m.count_spam_complaint?.toLocaleString?.() ?? '0'} complaints of sends` },
                      ].map(metric => (
                        <div key={metric.label} className="flex min-h-[142px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-purple-300/10 bg-[#300266] px-3 py-4 text-center shadow-none">
                          <p className="text-[40px] font-black leading-none tracking-normal text-[#F5A3E3]">{metric.value}</p>
                          <h4 className="mt-3 text-[16px] font-black text-[#FFD4BC]">{metric.label}</h4>
                          <p className="mt-2 truncate text-[11px] font-bold text-purple-100/70">{metric.detail}</p>
                        </div>
                      ))}
                    </motion.div>
                  );
                })()}

                {/* AI SUGGESTED NEXT STEPS — grounded in RCA + metrics + redacted precedent */}
                <motion.div {...md3Enter} transition={{ duration: 0.34, ease: md3Ease, delay: 0.2 }}>
                  <NextStepsPanel ticket={currentTicket} />
                </motion.div>
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: Authentication */}
            {activeSection === 'Authentication' && (
              <motion.div {...md3Enter} transition={{ duration: 0.36, ease: md3Ease }} className="flex flex-col gap-6 font-sans pb-10 px-4 sm:px-6" data-gem-panel data-gem-panel-label="Authentication Scan" data-gem-panel-content={authGemContent}>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className="mr-auto text-xs font-black text-[#5F6368]">
                    {activeAuthScan ? `Last checked ${new Date(activeAuthScan.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Stored account data'}
                  </span>
                  <div className="flex rounded-full border border-[#DADCE0] bg-white p-1 shadow-[0_2px_8px_rgba(32,33,36,0.06)]">
                    <button
                      type="button"
                      disabled
                      title="Smart view paused for review"
                      className="h-9 cursor-not-allowed rounded-full px-4 text-sm font-black text-[#9AA0A6] opacity-55"
                    >
                      Smart view
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthViewMode('raw')}
                      className="h-9 rounded-full bg-[#1A73E8] px-4 text-sm font-black text-white transition-colors"
                    >
                      Raw DNS
                    </button>
                  </div>
                  <button onClick={() => setAuthScopeOpen(true)} className="h-11 rounded-full border border-[#DADCE0] bg-white px-4 text-sm font-black text-[#3C4043] hover:bg-[#F8F9FA] flex items-center gap-2 shadow-[0_2px_8px_rgba(32,33,36,0.06)]">
                    <md-icon style={{ fontSize: '18px' }}>tune</md-icon>
                    Select scope
                  </button>
                  <button onClick={() => runAuthValidation(true)} disabled={authLoading} className="h-11 rounded-full bg-[#1A73E8] text-white px-4 text-sm font-black hover:bg-[#1967D2] disabled:opacity-60 flex items-center gap-2 shadow-[0_2px_8px_rgba(32,33,36,0.10)]">
                    <md-icon className={cn(authLoading && "animate-spin")} style={{ fontSize: '18px' }}>{authLoading ? 'progress_activity' : 'autorenew'}</md-icon>
                    {authLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {authScopes.map(scope => {
                    const active = selectedAuthScope === scope.id;
                    const icon = scope.id === 'all' ? 'check' : scope.kind === 'ip' ? 'dns' : 'dns';
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => {
                          setSelectedAuthScope(scope.id);
                          const next = (activeAuthScan?.lookups ?? []).find(item => {
                            const text = `${item.queryName} ${item.answers.map(a => a.data || '').join(' ')}`.toLowerCase();
                            return item.queryType === authRecordType && (scope.id === 'all' || text.includes(scope.value.toLowerCase()) || (scope.kind === 'ip' && text.includes(scope.value.split('.').reverse().join('.'))));
                          });
                          setSelectedAuthLookup(next?.queryName || '');
                        }}
                        className={cn(
                          "h-12 rounded-full px-5 flex items-center gap-3 border text-[15px] font-black whitespace-nowrap transition-colors",
                          active ? "bg-[#D2E3FC] border-[#D2E3FC] text-[#202124]" : "bg-white border-[#E8EAED] text-[#5F6368] hover:bg-[#F8F9FA]"
                        )}
                      >
                        <span className="material-symbols-outlined text-[22px]">{icon}</span>
                        {scope.value}
                      </button>
                    );
                  })}
                </div>

                {authViewMode === 'smart' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {[
                        ['DNS configuration', `${countHealthy()} healthy`, `${countIssues()} warnings / errors`, 'dns'],
                        ['Alignment readiness', byCategory('DKIM')[0]?.summary || 'DKIM selector not checked yet', activeAuthScan?.visibleFromDomain || ticketDomain, 'hub'],
                        ['DMARC policy', byCategory('DMARC')[0]?.summary || currentTicket.dmarc_description, 'Policy published is not DMARC pass', 'policy'],
                        ['IP identity', `${countHealthy('PTR')} of ${byCategory('PTR').length || currentTicket.sending_ips.length} valid`, 'PTR plus forward confirmation', 'settings_ethernet'],
                      ].map(([title, value, sub, icon]) => (
                        <button key={title} className="text-left rounded-2xl bg-white dark:bg-inverse-surface/10 border border-outline-variant/40 p-4 hover:border-[#1A73E8]/40 hover:shadow-sm transition">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] uppercase tracking-wide font-black text-[#5F6368]">{title}</span>
                            <md-icon className="text-[#1A73E8]" style={{ fontSize: '20px' }}>{icon}</md-icon>
                          </div>
                          <div className="mt-3 text-xl font-black text-on-surface dark:text-inverse-on-surface">{value}</div>
                          <div className="mt-1 text-xs font-semibold text-on-surface-variant line-clamp-2">{sub}</div>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
                      <div className="rounded-[28px] bg-white dark:bg-inverse-surface/10 border border-outline-variant/40 p-5 md:p-6">
                        <div className="flex items-center justify-between gap-3 mb-5">
                          <div>
                            <h3 className="text-lg font-black text-on-surface dark:text-inverse-on-surface">Authentication relationship map</h3>
                            <p className="text-xs font-semibold text-on-surface-variant">DNS configuration is separate from observed message pass/fail.</p>
                          </div>
                          <span className="text-xs font-black text-[#1A73E8]">{providerLabel}</span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
                          <div className="rounded-2xl border border-[#DADCE0] bg-[#F8F9FA] p-4">
                            <span className="text-[10px] uppercase font-black text-[#5F6368]">Visible From</span>
                            <div className="mt-2 font-black text-[#202124] break-all">{activeAuthScan?.visibleFromDomain || ticketDomain}</div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {['DKIM', 'SPF', 'DMARC'].map(category => {
                              const item = byCategory(category)[0];
                              return (
                                <div key={category} className="rounded-2xl border border-[#DADCE0] bg-white p-4 relative overflow-hidden">
                                  <div className={cn("absolute left-0 top-0 h-full w-1", statusDot(item?.status || 'unknown'))} />
                                  <span className="text-[10px] uppercase font-black text-[#5F6368]">{category}</span>
                                  <div className="mt-2 text-sm font-black text-[#202124]">{item?.title || 'Not checked'}</div>
                                  <div className="mt-1 text-xs text-[#5F6368] line-clamp-3">{item?.summary || 'Run the scan to inspect this relationship.'}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {!!byCategory('PTR').length && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {byCategory('PTR').map(item => (
                              <div key={item.id} className="rounded-2xl border border-[#DADCE0] bg-[#FBFCFF] p-4">
                                <span className="text-[10px] uppercase font-black text-[#5F6368]">Sending IP</span>
                                <div className="mt-1 font-black text-[#202124]">{item.subject}</div>
                                <div className="mt-1 text-xs text-[#5F6368]">{item.summary}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-[28px] bg-white dark:bg-inverse-surface/10 border border-outline-variant/40 p-5">
                        <div className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-black", statusColor(activeAuthScan?.assessment.status || 'unknown'))}>
                          {activeAuthScan?.assessment.label || 'Waiting for live scan'}
                        </div>
                        <p className="mt-4 text-sm font-semibold leading-relaxed text-on-surface-variant">
                          {activeAuthScan?.assessment.summary || 'Run the authentication scan to compare live DNS configuration, identity relationships, and available message-level evidence.'}
                        </p>
                        <div className="mt-4 space-y-2">
                          {(activeAuthScan?.assessment.evidence || [`Stored ticket statuses: SPF ${currentTicket.spf_status}, DKIM ${currentTicket.dkim_status}, DMARC ${currentTicket.dmarc_status}`]).map(item => (
                            <div key={item} className="flex gap-2 text-xs font-semibold text-[#5F6368]">
                              <span className="material-symbols-outlined text-[#1A73E8] text-[16px]">check_circle</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-white dark:bg-inverse-surface/10 border border-outline-variant/40 overflow-hidden">
                      {visibleAuthFindings.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setAuthViewMode('raw');
                            const lookup = activeAuthScan?.lookups.find(row => item.lookupIds.includes(row.queryName));
                            if (lookup) {
                              setAuthRecordType(lookup.queryType);
                              setSelectedAuthLookup(lookup.queryName);
                            }
                          }}
                          className={cn("w-full p-4 grid grid-cols-[120px_1fr_auto] gap-3 items-center text-left hover:bg-[#F8F9FA] transition-colors", idx > 0 && "border-t border-[#E8EAED]")}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2.5 w-2.5 rounded-full", statusDot(item.status))} />
                            <span className="text-xs font-black uppercase text-[#5F6368]">{item.category}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-[#202124] dark:text-inverse-on-surface truncate">{item.subject}</div>
                            <div className="text-sm text-on-surface-variant truncate">{item.summary}</div>
                          </div>
                          <span className={cn("rounded-full border px-3 py-1 text-[11px] font-black", statusColor(item.status))}>
                            {item.status === 'healthy' ? 'OK' : item.status === 'warning' ? 'Review' : item.status === 'error' ? 'Issue' : 'Unverified'}
                          </span>
                        </button>
                      ))}
                      {!activeAuthScan && (
                        <div className="p-6 text-sm font-semibold text-on-surface-variant">Run the live scan to populate account authentication findings.</div>
                      )}
                      {activeAuthScan && !visibleAuthFindings.length && (
                        <div className="p-6 text-sm font-semibold text-on-surface-variant">No findings match the selected identity.</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {authVisualCards.map(card => {
                        const healthy = card.status === 'healthy';
                        const warning = card.status === 'warning' || card.status === 'unknown';
                        const error = card.status === 'error';
                        const statusText = healthy ? 'Passed' : error ? 'Issue found' : 'Review';
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => openAuthVisualCard(card)}
                            className="group min-h-[178px] rounded-[28px] bg-[#F4F7FB] border border-[#E8EAED] px-8 py-7 text-left shadow-[0_1px_0_rgba(60,64,67,0.06)] transition hover:border-[#D2E3FC] hover:shadow-[0_4px_16px_rgba(60,64,67,0.10)]"
                          >
                            <div className="flex h-full min-h-[124px] flex-col justify-between">
                              <div className="flex items-start justify-between gap-5">
                                <div className="min-w-0">
                                  <div className="whitespace-nowrap text-[clamp(34px,3.1vw,42px)] leading-none font-[500] tracking-[0.01em] text-[#5F6368]">{card.label}</div>
                                  <div className={cn(
                                    "mt-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-black",
                                    healthy ? "border-[#CEEAD6] bg-[#E6F4EA] text-[#137333]" :
                                    error ? "border-[#FAD2CF] bg-[#FCE8E6] text-[#B3261E]" :
                                    "border-[#FEEFC3] bg-[#FEF7E0] text-[#9A6700]"
                                  )}>
                                    {statusText}
                                  </div>
                                </div>
                                <div className="flex h-[104px] w-[104px] shrink-0 items-center justify-center pt-2" aria-label={`${card.label} ${statusText}`}>
                                  {healthy ? (
                                    <span className="material-symbols-outlined text-[88px] leading-none text-[#4285F4]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 200, 'opsz' 48" }}>verified_user</span>
                                  ) : (
                                    <span className={cn("material-symbols-outlined text-[88px] leading-none", error ? "text-[#F9AB00]" : "text-[#F9AB00]")} style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 48" }} aria-hidden="true">warning</span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 min-w-0">
                                <div className="truncate text-[13px] font-black text-[#3C4043]">{card.scope}</div>
                                <div className="mt-1 line-clamp-2 text-[12px] font-semibold leading-snug text-[#6F7479]">{card.info}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <div className="text-sm font-black text-[#5F6368] mb-3">Record Type</div>
                      <div className="flex flex-wrap gap-3">
                        {authRecordTypes.map(type => {
                          const active = authRecordType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setAuthRecordType(type);
                                const next = (activeAuthScan?.lookups ?? []).find(item =>
                                  item.queryType === type && (selectedAuthScope === 'all' || scopeMatchesText(`${item.queryName} ${item.answers.map(a => a.data || '').join(' ')}`))
                                );
                                setSelectedAuthLookup(next?.queryName || '');
                              }}
                              className={cn(
                                "h-11 rounded-full px-6 border text-[15px] font-black transition-colors",
                                active ? "bg-[#1A73E8] border-[#1A73E8] text-white" : "bg-[#F5F7FB] border-[#E8EAED] text-[#5F6368] hover:bg-white"
                              )}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {visibleLookups.map(item => (
                        <button key={`${item.queryName}-${item.queryType}`} onClick={() => setSelectedAuthLookup(item.queryName)} className={cn("rounded-full px-4 py-2 text-xs font-black border transition-colors", selectedAuthLookup === item.queryName ? "bg-[#D2E3FC] border-[#D2E3FC] text-[#202124]" : "bg-white border-[#E8EAED] text-[#5F6368] hover:bg-[#F8F9FA]")}>
                          {item.queryName}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-[28px] bg-[#1E1E2E] text-[#D9DADC] p-6 font-mono text-xs overflow-auto min-h-[440px]">
                      {rawLookup ? (
                        <>
                          <div className="text-[#8AB4F8]">;; Google Public DNS · {rawLookup.source} · {new Date(rawLookup.checkedAt).toLocaleString()}</div>
                          <div className="mt-3">;; QUESTION: {rawLookup.queryName} {rawLookup.queryType}</div>
                          <div>;; DNS STATUS: {rawLookup.statusText}</div>
                          {rawLookup.error && <div className="text-[#F28B82]">;; ERROR: {rawLookup.error}</div>}
                          <div className="mt-4 text-[#FDD663]">;; ANSWER SECTION</div>
                          {(rawLookup.answers || []).length ? rawLookup.answers.map((ans, idx) => (
                            <div key={idx} className="grid grid-cols-[minmax(160px,1fr)_60px_36px_70px_minmax(220px,2fr)] gap-3 py-1">
                              <span className="break-all">{ans.name}</span>
                              <span>{ans.TTL ?? ''}</span>
                              <span>IN</span>
                              <span>{dnsTypeName(ans.type)}</span>
                              <span className="text-[#F9AB00] break-all">{ans.data}</span>
                            </div>
                          )) : <div className="opacity-60">;; no answers</div>}
                          <pre className="mt-5 whitespace-pre-wrap break-all text-[#BFC4D4]">{JSON.stringify(rawLookup.raw, null, 2)}</pre>
                        </>
                      ) : (
                        <div className="h-[360px] flex flex-col items-center justify-center opacity-35">
                          <span className="material-symbols-outlined text-4xl mb-2">code_blocks</span>
                          <span>Ready for query</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {createPortal(
                  <AnimatePresence>
                    {authScopeOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="fixed inset-0 z-[120] bg-black/20"
                          onClick={() => setAuthScopeOpen(false)}
                        />
                        <motion.aside
                          initial={{ x: 'calc(100% + 24px)' }}
                          animate={{ x: 0 }}
                          exit={{ x: 'calc(100% + 24px)' }}
                          transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
                          style={{ willChange: 'transform' }}
                          className="fixed bottom-4 right-4 top-[88px] z-[121] flex w-[min(500px,calc(100vw-32px))] max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-[24px] border border-outline-variant/10 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.16)] dark:bg-[#1E1D22]"
                          role="dialog"
                          aria-modal="true"
                        >
                          <div className="relative flex shrink-0 items-center justify-between border-b border-outline-variant/20 px-5">
                            <div className="relative flex self-stretch pt-2">
                              {([
                                ['domains', 'Domains'],
                                ['ips', 'IPs'],
                              ] as const).map(([tab, label]) => (
                                <button
                                  key={tab}
                                  onClick={() => setAuthScopeTab(tab)}
                                  className={cn(
                                    'relative z-10 w-28 rounded-t-xl pb-3 pt-3 text-center text-[15px] font-bold transition-colors',
                                    authScopeTab === tab ? 'text-[#1a73e8] dark:text-[#8AB4F8]' : 'text-on-surface-variant hover:text-on-surface',
                                  )}
                                >
                                  {label}
                                </button>
                              ))}
                              <div
                                className="absolute bottom-0 h-[3px] w-28 rounded-t-full bg-[#1a73e8] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] dark:bg-[#8AB4F8]"
                                style={{
                                  transform: authScopeTab === 'domains' ? 'translateX(0)' : 'translateX(100%)',
                                }}
                              />
                            </div>
                            <button onClick={() => setAuthScopeOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full text-outline transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                              <span className="material-symbols-outlined text-[24px]">close</span>
                            </button>
                          </div>
                          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
                            <div className="mb-4 rounded-xl border border-outline-variant/20 bg-surface-variant/5 p-4 text-[13px] font-semibold text-on-surface-variant">
                              Authentication scope is limited to company sender identities: sending domains and sending IPs. Mailbox providers and DKIM domain-key selectors are not scanned here.
                            </div>
                            {(authScopeTab === 'domains'
                              ? (activeAuthScan?.identities || []).filter(item => item.kind === 'domain')
                              : (activeAuthScan?.identities || []).filter(item => item.kind === 'ip')
                            ).map(item => {
                              const active = selectedAuthScope === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedAuthScope(item.id);
                                    setAuthScopeOpen(false);
                                    const next = (activeAuthScan?.lookups ?? []).find(row => {
                                      const text = `${row.queryName} ${row.answers.map(a => a.data || '').join(' ')}`.toLowerCase();
                                      return row.queryType === authRecordType && (text.includes(item.value.toLowerCase()) || (item.kind === 'ip' && text.includes(item.value.split('.').reverse().join('.'))));
                                    });
                                    setSelectedAuthLookup(next?.queryName || '');
                                  }}
                                  className={cn(
                                    'mb-3 flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors',
                                    active ? 'border-[#1a73e8] bg-[#E8F0FE]' : 'border-outline-variant/20 bg-surface-variant/5 hover:bg-[#F8FAFF]'
                                  )}
                                >
                                  <span className="material-symbols-outlined text-[22px] text-[#1A73E8]">{item.kind === 'ip' ? 'dns' : 'storage'}</span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[15px] font-black text-on-surface dark:text-inverse-on-surface">{item.value}</span>
                                    <span className="block text-[12px] font-semibold text-on-surface-variant">{item.role}</span>
                                  </span>
                                  {active && <span className="material-symbols-outlined text-[20px] text-[#1A73E8]">check</span>}
                                </button>
                              );
                            })}
                            {!(activeAuthScan?.identities || []).some(item =>
                              authScopeTab === 'domains' ? item.kind === 'domain' : item.kind === 'ip'
                            ) && (
                              <div className="rounded-xl border border-outline-variant/20 p-4 text-sm font-semibold text-on-surface-variant">
                                No identities available in this category.
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center justify-between border-t border-outline-variant/20 p-4">
                            <button onClick={() => { setSelectedAuthScope('all'); setAuthScopeOpen(false); }} className="rounded-full px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-black/5">All domains</button>
                            <button onClick={() => { setAuthScopeOpen(false); runAuthValidation(true); }} className="rounded-full bg-[#1A73E8] px-5 py-2.5 text-sm font-black text-white hover:bg-[#1967D2]">Refresh</button>
                          </div>
                        </motion.aside>
                      </>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: Deliverability — panels go here, each with data-gem-panel + data-gem-panel-label */}
            {activeSection === 'Deliverability' && (
              <motion.div {...md3Enter} transition={{ duration: 0.36, ease: md3Ease }} className="flex min-w-[545px] flex-col gap-6">
                <DeliverabilityDiagnosticsDashboard
                  ticket={currentTicket}
                  dateRange={effectiveMetricRange}
                  dateControl={<DateRangeControl dates={metricDates} value={effectiveMetricRange} onChange={setSharedMetricRange} />}
                  caseHistory={caseRows}
                  initialResourceFilters={deliverabilityScope}
                />
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: Email Performance — panels go here, each with data-gem-panel + data-gem-panel-label */}
            {activeSection === 'Email Performance' && (() => {
              const emailActionCount = (Object.keys(emailFilters) as ResourceKey[]).filter(key => key !== 'campaigns').reduce((n, k) => n + emailFilters[k].length, 0) + emailSelectedMetrics.length;
              const contextMetricSet = emailMetricContext ? new Set(EMAIL_PANEL_METRICS[emailMetricContext]) : null;
              const emailSheetEnabledMetrics = contextMetricSet
                ? emailEnabledMetrics.filter(metric => contextMetricSet.has(metric))
                : emailEnabledMetrics;
              const emailSheetSelectedMetrics = contextMetricSet
                ? emailSelectedMetrics.filter(metric => contextMetricSet.has(metric))
                : emailSelectedMetrics;
              const applyEmailSheetMetrics = (metrics: string[]) => {
                if (!contextMetricSet) {
                  setEmailSelectedMetrics(metrics);
                  return;
                }
                setEmailSelectedMetrics(current => {
                  const outsidePanel = current.filter(metric => !contextMetricSet.has(metric));
                  const insidePanel = metrics.filter(metric => contextMetricSet.has(metric) && emailEnabledMetrics.includes(metric));
                  return [...outsidePanel, ...insidePanel];
                });
              };
              return (
                <motion.div {...md3Enter} transition={{ duration: 0.36, ease: md3Ease }} className="flex min-w-[545px] flex-col gap-6">
                  <EmailPerformanceDashboard
                    rows={caseRows}
                    range={effectiveMetricRange}
                    filters={emailFilters}
                    selectedMetrics={emailSelectedMetrics}
                    hiddenPanels={hiddenEmailPanels}
                    view={emailSubview}
                    onViewChange={setEmailSubview}
                    onOpenMetrics={(panelKey) => {
                      setEmailMetricContext(panelKey);
                      setEmailMetricsOpen(true);
                    }}
                    toolbar={(
                      <div className="flex shrink-0 items-center justify-end gap-2">
                        <DateRangeControl dates={metricDates} value={effectiveMetricRange} onChange={setSharedMetricRange} />
                        <button
                          type="button"
                          onClick={() => {
                            setEmailMetricContext(null);
                            setEmailMetricsOpen(true);
                          }}
                          className="flex h-12 items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-4 text-[13px] font-semibold text-on-surface shadow-[0_6px_18px_rgba(32,33,36,0.12)] transition-colors md3-state-layer hover:bg-[#F8FAFF] dark:bg-[#201F24] dark:text-inverse-on-surface dark:hover:bg-[#2A2930]"
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
                          <span className="shrink-0">Metrics &amp; filters</span>
                          {emailActionCount > 0 && (
                            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#801ED7] px-1.5 text-[10px] font-black leading-none text-white">
                              {emailActionCount}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailCustomizeOpen(true);
                          }}
                          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#D2E3FC] text-[#3C4043] transition-colors md3-state-layer hover:bg-[#C4D7F6]"
                          aria-label="Customize panels"
                        >
                          <span className="material-symbols-outlined text-[24px]">edit</span>
                        </button>
                      </div>
                    )}
                  />
                  <MetricsFilterSheet
                    key={emailMetricContext ?? 'global-email-performance'}
                    open={emailMetricsOpen}
                    onClose={() => {
                      setEmailMetricsOpen(false);
                      setEmailMetricContext(null);
                    }}
                    selectedMetrics={emailSheetSelectedMetrics}
                    onApplyMetrics={applyEmailSheetMetrics}
                    filters={emailFilters}
                    onApplyFilters={setEmailFilters}
                    options={emailOptions}
                    metricCatalog={emailMetricCatalog}
                    enabledMetrics={emailSheetEnabledMetrics}
                    highlightedMetrics={emailMetricContext ? emailSheetSelectedMetrics : undefined}
                    highlightLabel={emailMetricContext ? `Active for ${EMAIL_PANEL_TITLES[emailMetricContext]}` : 'Active in Email Performance'}
                    disabledResources={['campaigns']}
                    initialTab="metrics"
                    tabUnderlineLayoutId="email-perf-sheet-underline"
                  />
                  <PanelCustomizeSheet
                    open={emailCustomizeOpen}
                    onClose={() => {
                      setEmailCustomizeOpen(false);
                    }}
                    title="Customize Email Performance panels"
                    subtitle="Hide panels from this view or add them back later. They keep using the selected date range and filters."
                    items={emailPanelOutlineItems}
                    onShow={showEmailPanel}
                    onHide={hideEmailPanel}
                  />
                </motion.div>
              );
            })()}

            {/* CONDITIONAL SECTIONS: Support History */}
            {activeSection === 'Support History' && (
              <motion.div {...md3Enter} transition={{ duration: 0.36, ease: md3Ease }} className="flex flex-col gap-6">
                <SupportHistoryView currentTicket={currentTicket} allCases={ticketsList} onDrill={drillToTicket} />
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: Workspace — panels go here, each with data-gem-panel + data-gem-panel-label */}
            {activeSection === 'Workspace' && (
              <motion.div {...md3Enter} transition={{ duration: 0.36, ease: md3Ease }} className="flex flex-col gap-2 -mt-3">
                <WorkspacePanels ticket={currentTicket} onJumpSection={onSectionChange} onJumpPanel={jumpFromWorkspace} />
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: User Guide Reference inside active ticket */}
            {activeSection === 'User Guide' && (
              <motion.div {...md3Enter} transition={{ duration: 0.36, ease: md3Ease }} className="flex flex-col gap-6 w-full">
                <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-xl shadow-none border border-outline-variant/15 p-1 md:p-4">
                  <UserGuideCenter 
                    selectedFile={selectedGuideFile} 
                    onSelectFile={setSelectedGuideFile} 
                    files={userGuideFiles} 
                    onRefresh={refreshUserGuide} 
                  />
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {drillBackId && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="pointer-events-none fixed bottom-6 left-6 z-[60] md:left-[116px]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTicket(drillBackId);
                      onSectionChange('Support History');
                      setDrillBackId(null);
                    }}
                    className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#0B57D0] py-3 pl-4 pr-5 text-sm font-bold text-white shadow-[0_3px_8px_3px_rgba(32,33,36,0.18)]"
                    aria-label={`Back to case ${drillBackId}`}
                  >
                    <span className="material-symbols-outlined text-[19px]">arrow_back</span>
                    Back to {drillBackId}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {workspaceReviewBack && activeSection !== 'Workspace' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="pointer-events-none fixed bottom-6 left-6 z-50 md:left-[116px]"
                >
                  <button
                    onClick={() => {
                      setPendingWorkspaceJump(null);
                      onSectionChange('Workspace');
                    }}
                    className="pointer-events-auto flex items-center gap-2 rounded-full border border-outline-variant/20 bg-white py-2.5 pr-5 pl-4 text-sm font-bold text-on-surface shadow-2xl transition-all select-none hover:bg-[#E8F0FE] hover:text-[#1A73E8] dark:border-outline-variant/15 dark:bg-[#1E1D22] dark:text-inverse-on-surface dark:hover:bg-[#1A73E8]/20 dark:hover:text-[#74BBFF]"
                    aria-label="Back to Workspace"
                    title={`Back to Workspace from ${workspaceReviewBack.section}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Support History: stacked, left-aligned sections with a floating scrollspy navigator.
function SupportHistoryView({ currentTicket, allCases, onDrill }: { currentTicket: CaseRecord; allCases: CaseRecord[]; onDrill?: (id: string) => void }) {
  type SectionKey = 'thread' | 'timeline' | 'relevant';
  const sections: Array<{ key: SectionKey; label: string; icon: string }> = [
    { key: 'thread', label: 'Case thread', icon: 'forum' },
    { key: 'timeline', label: 'Account timeline', icon: 'history' },
    { key: 'relevant', label: 'Relevant cases', icon: 'manage_search' },
  ];
  const [active, setActive] = useState<SectionKey>('thread');
  const threadRef = useRef<HTMLElement | null>(null);
  const timelineRef = useRef<HTMLElement | null>(null);
  const relevantRef = useRef<HTMLElement | null>(null);
  const refs: Record<SectionKey, React.RefObject<HTMLElement | null>> = { thread: threadRef, timeline: timelineRef, relevant: relevantRef };
  const jumpLock = useRef(false);
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (jumpLock.current) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.key as SectionKey);
      });
    }, { rootMargin: '-104px 0px -55% 0px', threshold: 0 });
    [threadRef, timelineRef, relevantRef].forEach(ref => ref.current && observer.observe(ref.current));
    return () => observer.disconnect();
  }, []);

  const jump = (key: SectionKey) => {
    setActive(key);
    jumpLock.current = true;
    if (jumpTimer.current) clearTimeout(jumpTimer.current);
    refs[key].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    jumpTimer.current = setTimeout(() => { jumpLock.current = false; }, 800);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-20 pb-16">
      <div className="sticky top-3 z-30 self-center -mb-10">
        <div className="flex items-center gap-[3px] rounded-[100px] border border-[rgba(218,220,224,0.8)] bg-white/95 p-[6px] shadow-[0_4px_20px_rgba(32,33,36,0.08),0_1px_4px_rgba(32,33,36,0.04)] backdrop-blur-[12px] dark:border-white/[0.08] dark:bg-[#28272E]/95">
          {sections.map(section => {
            const selected = active === section.key;
            return (
              <button key={section.key} type="button" onClick={() => jump(section.key)} className={cn('relative flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[100px] px-3 text-[13px] font-medium transition-colors', selected ? 'text-[#1A73E8] dark:text-[#8AB4F8]' : 'text-[#5F6368] hover:bg-[#3C4043]/[0.06] dark:text-white/60')}>
                {selected && <motion.span layoutId="support-history-nav" className="absolute inset-0 rounded-[100px] bg-[#E8F0FE] dark:bg-[#1A73E8]/20" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <span className="material-symbols-outlined relative z-10 text-[17px]" style={{ fontVariationSettings: selected ? "'FILL' 1" : '' }}>{section.icon}</span>
                <span className="relative z-10">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.section ref={threadRef} data-key="thread" className="scroll-mt-[78px]" {...md3Enter} transition={{ duration: 0.34, ease: md3Ease, delay: 0.04 }}>
        <h2 className="mb-7 text-left text-[35px] font-black tracking-tight text-[#202124] dark:text-inverse-on-surface">Case Thread</h2>
        <div className="w-full">
          <CaseThreadPanel caseId={currentTicket.case_number} accountName={currentTicket.account_name} caseNumber={currentTicket.case_number} messages={currentTicket.case_thread} />
        </div>
      </motion.section>

      <motion.section ref={timelineRef} data-key="timeline" className="scroll-mt-[78px]" {...md3Enter} transition={{ duration: 0.34, ease: md3Ease, delay: 0.08 }}>
        <h2 className="mb-7 text-left text-[35px] font-black tracking-tight text-[#202124] dark:text-inverse-on-surface">Account Timeline</h2>
        <div className="w-full">
          <AccountTimelinePanel currentTicket={currentTicket} allCases={allCases} onDrill={onDrill} />
        </div>
      </motion.section>

      <motion.section ref={relevantRef} data-key="relevant" className="scroll-mt-[78px]" {...md3Enter} transition={{ duration: 0.34, ease: md3Ease, delay: 0.12 }}>
        <h2 className="mb-7 text-left text-[35px] font-black tracking-tight text-[#202124] dark:text-inverse-on-surface">Relevant Cases</h2>
        <div className="w-full">
          <RelevantCasesPanel currentTicket={currentTicket} allCases={allCases} onDrill={onDrill} />
        </div>
      </motion.section>
    </div>
  );
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function TimelineCaseAccordion({ ticket, active, index, open, onToggle, onDrill }: { ticket: CaseRecord; active: boolean; index: number; open: boolean; onToggle: () => void; onDrill?: (id: string) => void }) {
  const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#E4E8F0] bg-[#FCFDFE] dark:border-white/10 dark:bg-inverse-surface/15">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 p-5 text-left">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{active ? 'Current case' : `Previous case ${index}`}</span>
            <span className="text-xs font-medium text-on-surface-variant">{ticket.case_number}</span>
            <span className="rounded-lg bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{ticket.case_status}</span>
          </span>
          <span className="mt-1 block truncate text-[15px] font-bold text-on-surface dark:text-inverse-on-surface">{ticket.case_subject}</span>
          <time className="mt-1 block text-[11px] text-on-surface-variant/75">{formatHistoryDate(ticket.case_created_at)}</time>
        </span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={cn('h-7 w-7 shrink-0 text-primary transition-transform duration-300 ease-out', open && 'rotate-45')}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="border-t border-[#E4E8F0] bg-[#F8FAFD] p-5 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[20px] border border-[#E9ECF2] bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-bold text-on-surface">Root cause</p>
                <p className="mt-2 text-[13px] leading-relaxed text-on-surface-variant">{ticket.root_cause_summary}</p>
              </div>
              <div className="rounded-[20px] border border-[#E9ECF2] bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-bold text-on-surface">Resolution</p>
                <p className="mt-2 text-[13px] leading-relaxed text-on-surface-variant">{ticket.resolution_summary || 'Resolution still in progress.'}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/50 pt-4 text-[11px] font-semibold text-on-surface-variant">
              <div className="flex flex-wrap gap-4"><span>Accepted {pct(ticket.metrics.accepted_rate)}</span><span>Bounce {pct(ticket.metrics.bounce_rate)}</span><span>Open {pct(ticket.metrics.nonprefetched_open_rate)}</span></div>
              {!active && onDrill && <md-text-button onClick={() => onDrill(ticket.case_number)}>Open case<md-icon slot="icon">arrow_forward</md-icon></md-text-button>}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AccountTimelinePanel({ currentTicket, allCases, onDrill }: { currentTicket: CaseRecord; allCases: CaseRecord[]; onDrill?: (id: string) => void }) {
  const events = [currentTicket, ...allCases.filter(ticket => ticket.account_id === currentTicket.account_id && ticket.case_number !== currentTicket.case_number)]
    .sort((a, b) => new Date(b.case_created_at).getTime() - new Date(a.case_created_at).getTime());
  const [openCaseNumber, setOpenCaseNumber] = useState<string | null>(currentTicket.case_number);

  useEffect(() => {
    setOpenCaseNumber(currentTicket.case_number);
  }, [currentTicket.case_number]);

  return (
    <div data-gem-panel data-gem-panel-label="Account Timeline" className="overflow-hidden rounded-[28px] border border-[#E4E8F0] bg-[#F8FAFD] p-5 dark:border-white/10 dark:bg-inverse-surface/20 sm:p-6">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[28px] font-black tracking-tight text-on-surface dark:text-inverse-on-surface">Case History Summary</h3>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">Root-cause history for <span className="font-bold text-on-surface dark:text-inverse-on-surface">{currentTicket.account_name}</span></p>
        </div>
        <span className="rounded-full border border-outline-variant/40 bg-white/70 px-3 py-1.5 text-xs font-bold text-on-surface-variant dark:bg-white/5">{events.length} {events.length === 1 ? 'case' : 'cases'}</span>
      </div>

      <div className="relative space-y-5">
        <span className="absolute -bottom-6 left-[9px] top-8 border-l-2 border-dotted border-[#1A73E8]" aria-hidden="true" />
        {events.map((ticket, index) => {
          const active = ticket.case_number === currentTicket.case_number;
          return (
            <div key={ticket.case_number} className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-4">
              <span className="relative z-10 mt-7 h-5 w-5 rounded-full border-4 border-[#F8FAFD] bg-[#1A73E8] dark:border-[#343139]" />
              <TimelineCaseAccordion
                ticket={ticket}
                active={active}
                index={index}
                open={openCaseNumber === ticket.case_number}
                onToggle={() => setOpenCaseNumber(current => current === ticket.case_number ? null : ticket.case_number)}
                onDrill={onDrill}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RelevantCasesPanel({ currentTicket, allCases, onDrill }: { currentTicket: CaseRecord; allCases: CaseRecord[]; onDrill?: (id: string) => void }) {
  const cases = rankRelevant(currentTicket, allCases.filter(ticket => ticket.account_id !== currentTicket.account_id)).slice(0, 5);
  const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div data-gem-panel data-gem-panel-label="Relevant Cases" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cases.map(({ ticket, score, reasons }) => (
        <article key={ticket.case_number} className="flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-[#E4E8F0] bg-[#F8FAFD] shadow-[0_1px_2px_rgba(32,33,36,0.08)] dark:border-white/10 dark:bg-inverse-surface/15">
          <div className="flex items-start gap-4 p-5 pb-4">
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[16px] font-bold leading-tight text-on-surface dark:text-inverse-on-surface">{ticket.account_name}</h3>
                  <p className="mt-1 text-[12px] font-medium text-on-surface-variant">Case {ticket.case_number}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary-container px-2.5 py-1 text-[11px] font-bold text-on-primary-container">{score}% match</span>
              </div>
              <p className="mt-3 text-[14px] font-medium leading-snug text-on-surface">{ticket.case_subject}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 px-5 pb-4">
            {reasons.map(reason => (
              <span key={reason} className="inline-flex min-h-8 items-center rounded-lg border border-[#E1E5EC] bg-white px-3 py-1 text-[11px] font-medium text-on-surface-variant dark:border-white/10 dark:bg-white/5">{reason}</span>
            ))}
          </div>

          <div className="mx-5 flex-1 rounded-[20px] border border-[#E9ECF2] bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-bold text-on-surface">Root cause</p>
              <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{ticket.case_status}</span>
            </div>
            <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-on-surface-variant">{ticket.root_cause_summary}</p>
          </div>

          {ticket.case_status === 'Closed' && ticket.resolution_summary && (
            <div className="mx-5 mt-3 rounded-[20px] border border-[#DCE8E0] bg-[#F7FBF8] p-4 dark:border-green-900/40 dark:bg-green-950/10">
              <p className="text-[12px] font-bold text-on-surface">Resolution</p>
              <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-on-surface-variant">{ticket.resolution_summary}</p>
            </div>
          )}

          <div className="mx-5 mt-4 grid grid-cols-3 divide-x divide-outline-variant/60 border-y border-outline-variant/60 py-3 text-center">
            <div><p className="text-[10px] font-medium text-on-surface-variant">Accepted</p><p className="mt-1 text-[14px] font-bold text-on-surface">{pct(ticket.metrics.accepted_rate)}</p></div>
            <div><p className="text-[10px] font-medium text-on-surface-variant">Bounce</p><p className="mt-1 text-[14px] font-bold text-on-surface">{pct(ticket.metrics.bounce_rate)}</p></div>
            <div><p className="text-[10px] font-medium text-on-surface-variant">Open</p><p className="mt-1 text-[14px] font-bold text-on-surface">{pct(ticket.metrics.nonprefetched_open_rate)}</p></div>
          </div>

          <div className="flex min-h-16 items-center px-5 py-3">
            {onDrill && (
              <md-filled-button
                onClick={() => onDrill(ticket.case_number)}
                style={{
                  width: '100%',
                  '--md-filled-button-container-color': '#0B57D0',
                  '--md-filled-button-label-text-color': '#FFFFFF',
                  '--md-filled-button-icon-color': '#FFFFFF',
                } as React.CSSProperties}
              >
                View case
                <md-icon slot="icon">arrow_forward</md-icon>
              </md-filled-button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function SupportHistorySection({ currentTicket, allCases, view = 'all', onDrill }: { currentTicket: CaseRecord; allCases: CaseRecord[]; view?: 'all' | 'timeline' | 'relevant'; onDrill?: (id: string) => void }) {
  const account = currentTicket.account_name;
  const pastTickets = allCases.filter(c => c.account_id === currentTicket.account_id && c.case_number !== currentTicket.case_number);
  const showTimeline = view === 'all' || view === 'timeline';
  const showRelevant = view === 'all' || view === 'relevant';
  const [expandedRelevant, setExpandedRelevant] = useState<string | null>(null);

  const crossAccount = allCases.filter(c => c.account_id !== currentTicket.account_id);
  const similarCases = rankRelevant(currentTicket, crossAccount).slice(0, 5);

  const pct = (v: number) => (v * 100).toFixed(1) + '%';

  const statusBadge = (s: string) => {
    if (s === 'In Progress') return 'text-[#1A73E8] bg-[#E8F0FE] border-[#D2E3FC] dark:bg-[#1A73E8]/15 dark:border-[#1A73E8]/30 dark:text-[#8AB4F8]';
    if (s === 'Open') return 'text-[#137333] bg-[#E6F4EA] border-[#C8E6C9] dark:bg-[#137333]/15 dark:border-[#137333]/30 dark:text-[#81C995]';
    return 'text-[#C5221F] bg-[#FCE8E6] border-[#F5C6C5] dark:bg-[#C5221F]/15 dark:border-[#C5221F]/30 dark:text-[#F28B82]';
  };

  return (
    <div className="flex flex-col gap-6 font-sans pb-10" data-gem-panel data-gem-panel-label="Support History">

      {/* ── Timeline ── */}
      {showTimeline && (
        <div className="rounded-[28px] border border-outline-variant/35 bg-[#F3F5F9] p-5 shadow-none dark:bg-inverse-surface/30 sm:p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 select-none">
            <div>
              <h3 className="text-[28px] font-black tracking-tight text-on-surface dark:text-inverse-on-surface">Case History Summary</h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
                <span>root-cause context for</span>
                <span className="font-bold text-on-surface dark:text-inverse-on-surface">{account}</span>
              </div>
            </div>
            <span className="flex items-center gap-1.5 pt-1 text-sm font-medium text-on-surface-variant/80">
              <md-icon style={{ fontSize: '18px' } as React.CSSProperties}>history</md-icon>
              {pastTickets.length + 1} recorded {pastTickets.length === 0 ? 'event' : 'events'}
            </span>
          </div>
          <div className={cn('relative flex flex-col gap-10 pl-0 before:absolute before:bottom-[42px] before:left-2 before:top-7 before:border-l-2 before:border-dotted before:border-[#5F6368] sm:pl-12', pastTickets.length === 0 && 'before:hidden')}>
            {/* Pinned active case details card */}
            <div className="relative">
              {/* Timeline marker */}
              <span className="absolute -left-[3px] top-7 h-[18px] w-[18px] rounded-full border-[3px] border-white bg-[#3478D8] dark:border-[#202124] sm:-left-[39px]" />
              
              <div className="rounded-[20px] bg-[#F4F6F9] px-7 py-5 dark:bg-inverse-surface/25">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="text-[17px] font-black text-[#8C9197]">Active Case</span>
                    <span className="truncate text-[16px] font-medium text-[#5F6368]">{currentTicket.case_number} | {currentTicket.case_subject}</span>
                  </div>
                  <span className="material-symbols-outlined shrink-0 text-[31px] text-[#92979C]">expand_more</span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <span className={cn('inline-flex min-w-[128px] justify-center rounded-full bg-[#9DA1A3] px-4 py-1 text-[14px] font-black leading-none text-white', currentTicket.case_status === 'Closed' && 'bg-[#6E747A]')}>{currentTicket.case_status}</span>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-[#777C82]">
                    <span>Accepted: {pct(currentTicket.metrics.accepted_rate)}</span>
                    <span>Bounce: {pct(currentTicket.metrics.bounce_rate)}</span>
                    <span>Open: {pct(currentTicket.metrics.nonprefetched_open_rate)}</span>
                  </div>
                </div>
                <p className="mt-3 line-clamp-1 text-[15px] font-medium text-[#5F6368]">{currentTicket.root_cause_summary}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-on-surface-variant/85 px-1 flex-wrap gap-2 select-none">
                  <div className="flex items-center gap-2">
                    <span>Opened {currentTicket.case_created_at}</span>
                    <span className="text-outline-variant/65">·</span>
                    <span>Owner: {currentTicket.case_owner}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Past cases timeline entries */}
            {pastTickets.map((t) => (
              <div key={t.case_number} className="relative">
                {/* Timeline marker */}
                <span className="absolute -left-[3px] top-7 h-[18px] w-[18px] rounded-full border-[3px] border-white bg-[#3478D8] dark:border-[#202124] sm:-left-[39px]" />
                
                <div className="rounded-[20px] bg-[#F4F6F9] px-7 py-5 dark:bg-inverse-surface/25">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-primary">Case {t.case_number}</p>
                      <h3 className="mt-1 text-[15px] font-black leading-snug text-on-surface dark:text-inverse-on-surface">{t.case_subject}</h3>
                    </div>
                    <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide', statusBadge(t.case_status))}>{t.case_status}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant/75 select-none px-1">
                      <span>Opened: {t.case_created_at}</span>
                      <md-icon style={{ fontSize: '13px' }}>arrow_forward</md-icon>
                      <span>Closed: {t.case_closed_at || '—'}</span>
                      <span className="text-outline-variant/50">·</span>
                      <span>Owner: {t.case_owner}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-surface-container-low dark:bg-inverse-surface/30 border border-outline-variant/30 rounded-2xl p-4">
                        <p className="text-[11px] font-extrabold text-[#1A73E8] dark:text-[#8AB4F8] uppercase tracking-wider mb-1.5">Root Cause Summary</p>
                        <p className="text-[13px] leading-relaxed text-on-surface-variant">{t.root_cause_summary}</p>
                      </div>
                      <div className="bg-surface-container-low dark:bg-inverse-surface/30 border border-outline-variant/30 rounded-2xl p-4">
                        <p className="text-[11px] font-extrabold text-[#1A73E8] dark:text-[#8AB4F8] uppercase tracking-wider mb-1.5">Resolution Blueprint</p>
                        <p className="text-[13px] leading-relaxed text-on-surface-variant">{t.resolution_summary}</p>
                      </div>
                    </div>

                    {t.recommended_actions && t.recommended_actions.length > 0 && (
                      <div className="bg-surface-container-low dark:bg-inverse-surface/20 border border-outline-variant/30 rounded-2xl p-4">
                        <p className="text-[11px] font-extrabold text-[#1A73E8] dark:text-[#8AB4F8] uppercase tracking-wider mb-2">Actions Completed</p>
                        <ul className="flex flex-col gap-2">
                          {t.recommended_actions.map((action: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-[13px] text-on-surface-variant leading-relaxed">
                              <md-icon style={{ fontSize: '15px' }} className="text-[#1A73E8] dark:text-[#8AB4F8] mt-0.5 shrink-0">check_circle</md-icon>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant/80 px-1 mt-1 select-none">
                      <div className="flex items-center gap-3">
                        <span>Accepted: {pct(t.metrics.accepted_rate)}</span>
                        <span>Bounce: {pct(t.metrics.bounce_rate)}</span>
                        <span>Open: {pct(t.metrics.nonprefetched_open_rate)}</span>
                      </div>
                      {onDrill && (
                        <md-text-button onClick={() => onDrill(t.case_number)} style={{ '--md-text-button-label-text-size': '11px' } as React.CSSProperties}>
                          Drill Into Ticket
                          <md-icon slot="icon">arrow_forward</md-icon>
                        </md-text-button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pastTickets.length === 0 && (
            <p className="text-[13px] text-on-surface-variant/70 py-4 px-1 select-none">No previous support tickets recorded for this account.</p>
          )}
        </div>
      )}

      {/* ── Similar Cases ── */}
      {showRelevant && similarCases.length > 0 && (
        <div>
          <div className="flex flex-col">
            {similarCases.map(({ ticket: t, score, reasons }) => (
              <ChrAccordion
                key={t.case_number}
                id={`relevant-${t.case_number}`}
                isOpen={expandedRelevant === t.case_number}
                onToggle={() => setExpandedRelevant(current => current === t.case_number ? null : t.case_number)}
                heading={
                  <span className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 pr-2">
                    <span className="font-medium text-[#202124] dark:text-inverse-on-surface">{t.account_name}</span>
                    <span className="text-[13px] text-[#5F6368] dark:text-inverse-on-surface/65">Case {t.case_number}</span>
                    <span className="text-[13px] text-[#1A73E8]">{score}% match</span>
                    <span className={cn('ml-auto text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide', statusBadge(t.case_status))}>{t.case_status}</span>
                  </span>
                }
              >
              <div className="rounded-[20px] bg-[#F4F6F9] px-7 py-5 dark:bg-inverse-surface/25">
                <div className="mt-4 flex flex-col gap-4">
                  <p className="text-[14px] font-bold text-on-surface leading-snug">{t.case_subject}</p>
                  
                  <div className="flex items-center gap-1.5 flex-wrap px-1">
                    {reasons.map((reason: string) => (
                      <span key={reason} className="text-[9px] font-black text-on-surface-variant bg-surface-container dark:bg-inverse-surface/40 px-2 py-0.5 rounded border border-outline-variant/40 uppercase tracking-wider">{reason}</span>
                    ))}
                  </div>

                  <div className="bg-surface-container-low dark:bg-inverse-surface/30 border border-outline-variant/35 rounded-2xl p-4">
                    <p className="text-[11px] font-extrabold text-[#1A73E8] dark:text-[#8AB4F8] uppercase tracking-wider mb-1.5">Root Cause Summary</p>
                    <p className="text-[13px] leading-relaxed text-on-surface-variant">{t.root_cause_summary}</p>
                  </div>
                  
                  {t.resolution_summary && (
                    <div className="bg-surface-container-low dark:bg-inverse-surface/30 border border-outline-variant/35 rounded-2xl p-4">
                      <p className="text-[11px] font-extrabold text-[#1A73E8] dark:text-[#8AB4F8] uppercase tracking-wider mb-1.5">Resolution Blueprint</p>
                      <p className="text-[13px] leading-relaxed text-on-surface-variant">{t.resolution_summary}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant/80 px-1 mt-1 select-none">
                    <div className="flex items-center gap-3">
                      <span>Accepted: {pct(t.metrics.accepted_rate)}</span>
                      <span>Bounce: {pct(t.metrics.bounce_rate)}</span>
                      <span>Open: {pct(t.metrics.nonprefetched_open_rate)}</span>
                    </div>
                    {onDrill && (
                      <md-text-button onClick={() => onDrill(t.case_number)} style={{ '--md-text-button-label-text-size': '11px' } as React.CSSProperties}>
                        Drill Into Ticket
                        <md-icon slot="icon">arrow_forward</md-icon>
                      </md-text-button>
                    )}
                  </div>
                </div>
              </div>
              </ChrAccordion>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Chrome-style FAQ Accordion — exact match to Google chrome.com accordion.
   - SVG plus icon → rotates 45° to become ×
   - Smooth height transition via ref measurement
   - Single-open per group (parent manages which ID is open)
   - Flat horizontal dividers, no card wrapping
   ═══════════════════════════════════════════════════════════════════════════ */
function ChrAccordion({
  id, isOpen, onToggle, heading, children,
}: {
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    if (isOpen) {
      const targetHeight = content.offsetHeight;
      panel.style.height = `${targetHeight}px`;
      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'height') {
          panel.style.height = 'auto';
          panel.removeEventListener('transitionend', onEnd);
        }
      };
      panel.addEventListener('transitionend', onEnd);
    } else {
      const currentHeight = content.offsetHeight;
      panel.style.height = `${currentHeight}px`;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      panel.offsetHeight; // force reflow
      panel.style.height = '0px';
    }
  }, [isOpen]);

  return (
    <div className="border-b border-[#dadce0] dark:border-white/10 first:border-t">
      <button
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="w-full cursor-pointer py-6 px-2 flex items-center justify-between bg-transparent border-none text-left outline-none focus-visible:outline-2 focus-visible:outline-[#1a73e8] focus-visible:bg-[#1a73e8]/[0.04] transition-colors"
      >
        <span className="flex-1 min-w-0">
          <span className="text-[18px] leading-snug font-medium text-[#1a73e8] dark:text-[#8AB4F8]">{heading}</span>
        </span>
        <svg
          className="w-6 h-6 text-[#1a73e8] dark:text-[#8AB4F8] shrink-0 ml-4 transition-transform duration-[280ms]"
          style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div
        ref={panelRef}
        className="overflow-hidden"
        style={{ height: 0, transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)' }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="px-2 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function AuthCard({ title, status, record }: { title: string, status: 'pass' | 'fail' | 'none', record: string }) {
  const isPass = status === 'pass';
  const isFail = status === 'fail';

  return (
    <div className={cn("p-4 rounded-xl border relative overflow-hidden shadow-none", 
      isPass ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800/40" : 
      isFail ? "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/40" : 
      "border-outline-variant/40 bg-surface text-on-surface-variant")}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className={cn("text-sm font-bold flex items-center gap-1.5", 
          isPass ? "text-green-800 dark:text-green-400" : 
          isFail ? "text-red-800 dark:text-red-400" : 
          "text-on-surface-variant dark:text-inverse-on-surface"
        )}>
          {isPass && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
          {isFail && <span className="material-symbols-outlined text-[16px]">error</span>}
          {!isPass && !isFail && <span className="material-symbols-outlined text-[16px] opacity-60">help</span>}
          {title}
        </h4>
        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
            isPass ? "border-green-300 text-green-700 bg-green-100 dark:border-green-700 dark:text-green-300 dark:bg-green-900/50" : 
            isFail ? "border-red-300 text-red-700 bg-red-100 dark:border-red-700 dark:text-red-300 dark:bg-red-900/50" : 
            "border-outline-variant text-outline bg-surface-variant"
        )}>
          {status === 'pass' ? 'Found' : status === 'none' ? 'Missing' : 'Invalid'}
        </span>
      </div>
      <p className="text-xs font-mono break-all line-clamp-4 leading-relaxed opacity-90">{record}</p>
    </div>
  )
}

function TicketDiagnosticItem({ icon, title, desc, isError }: { key?: React.Key, icon: string, title: string, desc: React.ReactNode, isError: boolean }) {
  return (
    <li className="flex gap-3 items-start">
      <span className={cn(
        "material-symbols-outlined text-[18px] mt-0.5",
        isError ? "text-error" : "text-[rgb(20,108,46)] dark:text-green-400"
      )}>
        {icon}
      </span>
      <div>
        <h5 className="text-xs font-bold text-on-surface dark:text-inverse-on-surface">{title}</h5>
        <p className="text-xs text-on-surface-variant dark:text-inverse-on-surface/70 leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

function NavItem({
  icon,
  label,
  isActive = false,
  onClick,
  collapsed = false
}: {
  icon: string,
  label: string,
  isActive?: boolean,
  onClick?: () => void,
  collapsed?: boolean
}) {
  if (collapsed) {
    return (
      <li className="w-full list-none" title={label}>
        <div onClick={onClick} className={cn(
          "flex items-center justify-center h-10 border-l-4 transition-all duration-150 cursor-pointer",
          isActive
            ? "border-[#1A73E8] text-[#1A73E8] dark:text-[#D2E3FC]"
            : "border-transparent text-on-surface-variant/60 dark:text-inverse-on-surface/50 hover:text-on-surface hover:bg-neutral-100/50 dark:hover:bg-inverse-surface/20"
        )}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{icon}</span>
        </div>
      </li>
    );
  }
  return (
    <li className="w-full list-none">
      <div onClick={onClick} className={cn(
        "flex items-center gap-3 px-4 py-2.5 border-l-4 transition-all duration-150 cursor-pointer select-none",
        isActive
          ? "border-[#1A73E8] bg-purple-50/50 dark:bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#D2E3FC]"
          : "border-transparent text-on-surface-variant dark:text-inverse-on-surface/60 hover:bg-neutral-100/80 dark:hover:bg-inverse-surface/20 hover:text-on-surface dark:hover:text-inverse-on-surface"
      )}>
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{icon}</span>
        <span className="text-xs font-semibold">{label}</span>
      </div>
    </li>
  );
}
