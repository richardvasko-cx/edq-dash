import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { DraftSparkIcon } from '../components/SparkIcons';
import { marked } from 'marked';
import UserGuideCenter from '../components/UserGuideCenter';
import { AccountDetailsPanel } from '../components/investigation/OverviewLookerPanels';
import { DeliverabilityDiagnosticsDashboard } from '../components/investigation/DeliverabilityPanels';
import { EmailPerformanceMetricsPanel } from '../components/investigation/EmailPerformancePanels';
import HistoricalMetricsPanel from '../components/charts/HistoricalMetricsPanel';
import DateRangeControl, { type DateRange } from '../components/charts/DateRangeControl';
import MetricsFilterSheet from '../components/charts/MetricsFilterSheet';
import { EMPTY_FILTERS, type ResourceFilters, type ResourceKey } from '../components/charts/MetricsFilterTypes';
import PanelCustomizeSheet, { PanelRemoveButton, type PanelOutlineItem } from '../components/charts/PanelCustomizeSheet';
import CaseThreadPanel from '../components/investigation/CaseThreadPanel';
import WorkspacePanels from '../components/investigation/WorkspacePanels';
import NextStepsPanel from '../components/investigation/NextStepsPanel';
import RootCauseBody from '../components/investigation/RootCauseBody';
import { isClosedCase, type CaseRecord } from '../data';
import { useCaseDataset } from '../hooks/useCaseDataset';
import { useHistoricalMetrics } from '../hooks/useHistoricalMetrics';
import { rankRelevant } from '../services/historyRelevance';
import { authCheckFromTicket, authCheckSummary, checkTicketAuthWithGoogleDig, normalizeDomain, type TicketAuthCheck } from '../services/googleDigAuth';
import { providerDisplayName } from '../services/providerRouting';
import { getEnabledMetricKeysForProvider, getMetricCatalogForProvider } from '../services/metricCatalog';

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
    from: sharedMetricRange.from || metricDates[0] || '',
    to: sharedMetricRange.to || metricDates[metricDates.length - 1] || '',
  };
  const messages = (selectedTicketId ? ticketMessages[selectedTicketId] : null)
    || (currentTicket ? [{ role: 'model' as const, text: `Reviewing ${currentTicket.account_name} (${currentTicket.case_number}). ${currentTicket.root_cause_summary} Want me to pull the supporting evidence?` }] : []);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Drill-down memory: when a referenced ticket is opened from Support History we
  // remember where we came from so a Back button can restore it.
  const [drillBackId, setDrillBackId] = useState<string | null>(null);
  const drillToTicket = (id: string) => { setDrillBackId(selectedTicketId); onSelectTicket(id); };
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);
  // Contract end highlight: flag red only when the date is within 90 days from today.
  const contractEndDate = '2026-08-30';
  const contractEndSoon = (() => {
    const end = new Date(contractEndDate + 'T00:00:00');
    if (isNaN(end.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
    return days >= 0 && days <= 90;
  })();
  const [workspaceMode, setWorkspaceMode] = useState<'panels' | 'chat'>('panels');
  const [panelStates, setPanelStates] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});
  const [emailCustomizeOpen, setEmailCustomizeOpen] = useState(false);
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [hiddenEmailPanels, setHiddenEmailPanels] = useState<Set<string>>(() => new Set());

  const [emailSelectedMetrics, setEmailSelectedMetrics] = useState<string[]>([
    'count_nonprefetched_unique_confirmed_opened', 'count_unique_clicked', 'nonprefetched_open_rate', 'click_through_rate'
  ]);
  const [emailFilters, setEmailFilters] = useState<ResourceFilters>(EMPTY_FILTERS);
  const [emailMetricsOpen, setEmailMetricsOpen] = useState(false);

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

  useEffect(() => {
    setSharedMetricRange({ from: '', to: '' });
    setEmailSelectedMetrics(current => {
      const enabled = new Set(getEnabledMetricKeysForProvider(currentTicket?.email_service_provider));
      const next = current.filter(metric => enabled.has(metric));
      return next.length ? next : ['count_nonprefetched_unique_confirmed_opened', 'count_unique_clicked', 'nonprefetched_open_rate', 'click_through_rate'].filter(metric => enabled.has(metric));
    });
  }, [currentTicket?.case_number, currentTicket?.email_service_provider]);

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
          campaigns: emailFilters.campaigns,
          subaccounts: emailFilters.subaccounts,
          selectedDomain: emailFilters.sendingDomains[0] ?? '',
          selectedSendingDomain: emailFilters.sendingDomains[0] ?? '',
          selectedIp: emailFilters.sendingIps[0] ?? '',
          selectedIsp: emailFilters.mailboxProviders[0] ?? '',
          selectedCampaign: emailFilters.campaigns[0] ?? '',
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
  const [dmarcDomain, setDmarcDomain] = useState('');
  const [dkimSelector, setDkimSelector] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authResults, setAuthResults] = useState<TicketAuthCheck | null>(null);

  const ticketDomain = currentTicket?.sending_domains?.[0] ?? '';
  const ticketDkimSelector = currentTicket?.dkim_selector ?? '';
  useEffect(() => {
    setDmarcDomain(ticketDomain);
    setDkimSelector(ticketDkimSelector);
    setAuthResults(null);
  }, [selectedTicketId, ticketDomain, ticketDkimSelector]);

  const runAuthValidation = async () => {
    const domain = normalizeDomain(dmarcDomain);
    if (!domain) return;

    setAuthLoading(true);
    try {
      setAuthResults(await checkTicketAuthWithGoogleDig({ domain, selector: dkimSelector }));
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
  }, [activeSection, ticketDomain, ticketDkimSelector]); // eslint-disable-line react-hooks/exhaustive-deps

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
            history: currentMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
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
      key: 'emailTrend',
      title: 'Email performance over time',
      description: 'Engagement trend chart using the selected date window and metrics.',
      visible: emailPanelVisible('emailTrend'),
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
      key: 'engagementSummary',
      title: 'Engagement',
      description: 'Summary cards for delivered mail, opens, clicks, and engagement rates.',
      visible: emailPanelVisible('engagementSummary'),
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
  const liveAuthStatus = (status: string | undefined, fallback: string) =>
    status ? status.toUpperCase() : fallback;
  const liveSpfStatus = liveAuthStatus(liveAuth.spf.status, currentTicket.spf_status);
  const liveDkimStatus = liveAuth.dkim ? liveAuthStatus(liveAuth.dkim.status, currentTicket.dkim_status) : 'NOT CHECKED';
  const liveDmarcStatus = liveAuthStatus(liveAuth.dmarc.status, currentTicket.dmarc_status);
  const liveSpfRecord = liveAuth.spf.record || currentTicket.spf_record;
  const liveDkimRecord = liveAuth.dkim?.record || currentTicket.dkim_description;
  const liveDmarcRecord = liveAuth.dmarc.record || currentTicket.dmarc_description;
  const isAuthFail = (status: string) => status === 'FAIL' || status === 'NONE';
  const authGemContent = authCheckSummary(liveAuth) + ` | rDNS: ${currentTicket.rdns_status} — ${currentTicket.rdns_hostname}`;

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#121115] font-sans scroll-smooth">
      {/* scroll-smooth only affects programmatic scrolls (panel navigation lands smoothly);
          wheel/trackpad reading stays free — no CSS scroll-snap so long panels don't jump back. */}

      {/* Detail panel */}
      <div className="relative px-6 lg:px-10 py-2 lg:py-3 pt-2 min-h-full bg-white dark:bg-[#121115]">
        
        <AnimatePresence mode="wait" initial={false}>
          {selectedTicketId === null ? (
            /* Welcome / select ticket state */
            <motion.div
              key="welcome-pane"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center h-full text-center p-8 max-w-md mx-auto relative z-10 min-h-[350px]"
            >
              <span className="material-symbols-outlined text-[56px] text-[#1A73E8] mb-4">confirmation_number</span>
              <h3 className="text-xl font-black text-on-surface dark:text-inverse-on-surface tracking-tight">Select a ticket</h3>
            </motion.div>
          ) : (
            <motion.div
              key={`detail-pane-${selectedTicketId}`}
              initial={{ x: 16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 16, opacity: 0 }}
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
              {drillBackId && (
                <button
                  onClick={() => { onSelectTicket(drillBackId); setDrillBackId(null); }}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-[#1A73E8] dark:text-[#8AB4F8] px-3 py-1.5 rounded-full border border-[#1A73E8]/30 hover:bg-[#1A73E8]/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back to {drillBackId}
                </button>
              )}
            </div>

            {/* CONDITIONAL SECTIONS: Overview */}
            {activeSection === 'Overview' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 font-sans pb-6">

                {/* ── Ticket Info + Account Info panels ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Ticket Info Card */}
                  <div
                    data-gem-panel
                    data-gem-panel-label="Ticket Info"
                    data-gem-panel-content={`Ticket Info — Case: ${currentTicket.case_number} | Opened: ${currentTicket.case_created_at} | Owner: ${currentTicket.case_owner} | Status: ${currentTicket.case_status} | Subject: ${currentTicket.case_subject} | Detail: ${currentTicket.root_cause_summary}`}
                    className="bg-surface-bright dark:bg-inverse-surface/10 rounded-[28px] border border-outline-variant/60 shadow-none p-6 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4 select-none px-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <md-icon style={{ fontSize: '20px' }}>confirmation_number</md-icon>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-primary tracking-wider uppercase leading-none block mb-0.5">Case Info</span>
                        <h3 className="text-lg font-black text-on-surface dark:text-inverse-on-surface leading-tight">Ticket Details</h3>
                      </div>
                    </div>
                    
                    <md-list style={{ background: 'transparent' } as React.CSSProperties} className="flex-1">
                      <md-list-item>
                        <md-icon slot="start">tag</md-icon>
                        <div slot="headline">Case Number</div>
                        <div slot="supporting-text">{currentTicket.case_number}</div>
                      </md-list-item>
                      <md-divider inset />
                      
                      <md-list-item>
                        <md-icon slot="start">calendar_today</md-icon>
                        <div slot="headline">Date Opened</div>
                        <div slot="supporting-text">{currentTicket.case_created_at}</div>
                      </md-list-item>
                      <md-divider inset />
                      
                      <md-list-item>
                        <md-icon slot="start">person</md-icon>
                        <div slot="headline">Case Owner</div>
                        <div slot="supporting-text">{currentTicket.case_owner}</div>
                      </md-list-item>
                      <md-divider inset />
                      
                      <md-list-item>
                        <md-icon slot="start">info</md-icon>
                        <div slot="headline">Status</div>
                        <span
                          slot="end"
                          className={cn(
                            "px-3.5 py-1 text-white text-xs font-bold rounded-full select-none",
                            currentTicket.case_status === 'Closed' ? "bg-gray-500"
                            : currentTicket.case_status === 'In Progress' ? "bg-primary"
                            : "bg-green-600"
                          )}
                        >
                          {currentTicket.case_status || 'Open'}
                        </span>
                      </md-list-item>
                      <md-divider inset />

                      <md-list-item>
                        <md-icon slot="start">title</md-icon>
                        <div slot="headline">Subject</div>
                        <div slot="supporting-text">{currentTicket.case_subject}</div>
                      </md-list-item>
                    </md-list>

                    {/* Issue Summary Collapsible */}
                    <div className="mt-4 p-3 bg-surface-container-low dark:bg-inverse-surface/30 rounded-xl border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-on-surface-variant/80 tracking-wider">Detailed RCA Summary</span>
                        <md-text-button onClick={() => setDetailExpanded(v => !v)} style={{ '--md-text-button-label-text-size': '12px' } as React.CSSProperties}>
                          {detailExpanded ? 'Hide' : 'Expand'}
                          <md-icon slot="icon">{detailExpanded ? 'expand_less' : 'expand_more'}</md-icon>
                        </md-text-button>
                      </div>
                      <AnimatePresence initial={false}>
                        {detailExpanded && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="text-[13px] text-on-surface-variant leading-relaxed mt-2 overflow-hidden"
                          >
                            {currentTicket.root_cause_summary}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Account Info Card */}
                  <div
                    data-gem-panel
                    data-gem-panel-label="Account Info"
                    data-gem-panel-content={`Account Info — Company: ${currentTicket.account_name} | Region: eu-central-1 | Cluster: 02 | MTA: ${providerLabel} | Micro classification: Enterprise | Contract end: 2026-08-30 | Current CARR: £1,450,000`}
                    className="bg-surface-bright dark:bg-inverse-surface/10 rounded-[28px] border border-outline-variant/60 shadow-none p-6 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4 select-none px-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <md-icon style={{ fontSize: '20px' }}>domain</md-icon>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-primary tracking-wider uppercase leading-none block mb-0.5">Customer Info</span>
                        <h3 className="text-lg font-black text-on-surface dark:text-inverse-on-surface leading-tight">Account Details</h3>
                      </div>
                    </div>

                    <md-list style={{ background: 'transparent' } as React.CSSProperties} className="flex-1">
                      <md-list-item>
                        <md-icon slot="start">business</md-icon>
                        <div slot="headline">Company Name</div>
                        <div slot="supporting-text">{currentTicket.account_name}</div>
                      </md-list-item>
                      <md-divider inset />

                      <md-list-item>
                        <md-icon slot="start">account_box</md-icon>
                        <div slot="headline">Contact Person</div>
                        <div slot="supporting-text">{currentTicket.contact_name}</div>
                      </md-list-item>
                      <md-divider inset />

                      <md-list-item>
                        <md-icon slot="start">dns</md-icon>
                        <div slot="headline">Cluster & Region</div>
                        <div slot="supporting-text">Region: eu-central-1 · Cluster: 02</div>
                      </md-list-item>
                      <md-divider inset />

                      <md-list-item>
                        <md-icon slot="start">mail_outline</md-icon>
                        <div slot="headline">Email Service Provider</div>
                        <div slot="supporting-text">{providerLabel}</div>
                      </md-list-item>
                      <md-divider inset />

                      <md-list-item>
                        <md-icon slot="start">vpn_key</md-icon>
                        <div slot="headline">Contract & CARR</div>
                        <div slot="supporting-text" className="flex flex-col gap-0.5 mt-0.5 select-none">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-semibold", contractEndSoon ? "text-red-600 font-bold" : "text-on-surface-variant")}>
                              Renewal: {contractEndDate}
                            </span>
                            {contractEndSoon && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                <md-icon style={{ fontSize: '9px' } as React.CSSProperties}>warning</md-icon> Critical
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-on-surface-variant/70">Current CARR: £1,450,000 · Enterprise Segment</span>
                        </div>
                      </md-list-item>
                    </md-list>
                  </div>
                </div>

                {/* Root Cause Analysis Summary Card */}
                <div
                  data-gem-panel
                  data-gem-panel-label="Root Cause Analysis"
                  data-gem-panel-content={`Root Cause Analysis: ${currentTicket.root_cause_summary}`}
                  className="bg-surface-container dark:bg-inverse-surface/30 rounded-[28px] border-none shadow-none p-6 relative overflow-hidden flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center select-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 flex items-center justify-center">
                        <md-icon style={{ fontSize: '20px' }}>priority_high</md-icon>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-red-600 dark:text-red-400 tracking-wider uppercase leading-none block mb-0.5">Alert Level</span>
                        <h3 className="text-lg font-black text-on-surface dark:text-inverse-on-surface leading-tight">Root Cause Analysis</h3>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant/80 flex items-center gap-1">
                      <md-icon style={{ fontSize: '15px' } as React.CSSProperties}>schedule</md-icon> Updated 2h ago
                    </span>
                  </div>
                  
                  <md-divider />
                  
                  <RootCauseBody ticket={currentTicket} />
                </div>

                {/* Performance Metrics Grid */}
                {(() => {
                  const m = currentTicket.metrics;
                  const acceptedPct = (m.accepted_rate * 100).toFixed(1) + '%';
                  const bouncePct = (m.bounce_rate * 100).toFixed(1) + '%';
                  const openPct = (m.nonprefetched_open_rate * 100).toFixed(1) + '%';
                  const spamPct = (m.spam_complaint_rate * 100).toFixed(1) + '%';
                  return (
                    <div
                      data-gem-panel
                      data-gem-panel-label="Performance Metrics"
                      data-gem-panel-content={`Accepted Rate: ${acceptedPct} | Bounce Rate: ${bouncePct} | Open Rate: ${openPct} | Spam Complaint Rate: ${spamPct} | Sent: ${m.count_sent} | Accepted: ${m.count_accepted}`}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                      {/* Accepted Rate */}
                      <div className="bg-surface-container-low dark:bg-inverse-surface/10 rounded-[24px] p-5 shadow-none border border-outline-variant/65 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-extrabold text-on-surface-variant/70 dark:text-inverse-on-surface/80 uppercase tracking-wide">Accepted Rate</h4>
                          <p className="text-2xl font-black text-on-surface dark:text-inverse-on-surface mt-1">{acceptedPct}</p>
                          <p className="text-[11px] text-on-surface-variant/65 mt-1 truncate">{m.count_accepted.toLocaleString()} / {m.count_sent.toLocaleString()} sent</p>
                        </div>
                        <div className="relative shrink-0 flex items-center justify-center">
                          <md-circular-progress
                            value={m.accepted_rate}
                            style={{
                              '--md-circular-progress-size': '54px',
                              '--md-sys-color-primary': 'var(--color-primary)'
                            } as React.CSSProperties}
                          />
                          <md-icon className="absolute text-[16px] text-primary">send</md-icon>
                        </div>
                      </div>

                      {/* Bounce Rate */}
                      <div className="bg-surface-container-low dark:bg-inverse-surface/10 rounded-[24px] p-5 shadow-none border border-outline-variant/65 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-extrabold text-on-surface-variant/70 dark:text-inverse-on-surface/80 uppercase tracking-wide">Bounce Rate</h4>
                          <p className="text-2xl font-black text-red-600 dark:text-[#FF8A6E] mt-1">{bouncePct}</p>
                          <p className="text-[11px] text-on-surface-variant/65 mt-1 truncate">{m.count_bounce.toLocaleString()} bounces</p>
                        </div>
                        <div className="relative shrink-0 flex items-center justify-center">
                          <md-circular-progress
                            value={m.bounce_rate}
                            style={{
                              '--md-circular-progress-size': '54px',
                              '--md-sys-color-primary': 'var(--color-heat-red)'
                            } as React.CSSProperties}
                          />
                          <md-icon className="absolute text-[16px] text-red-600">trending_up</md-icon>
                        </div>
                      </div>

                      {/* Open Rate */}
                      <div className="bg-surface-container-low dark:bg-inverse-surface/10 rounded-[24px] p-5 shadow-none border border-outline-variant/65 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-extrabold text-on-surface-variant/70 dark:text-inverse-on-surface/80 uppercase tracking-wide">Open Rate</h4>
                          <p className="text-2xl font-black text-on-surface dark:text-inverse-on-surface mt-1">{openPct}</p>
                          <p className="text-[11px] text-on-surface-variant/65 mt-1 truncate">CTR {(m.click_through_rate * 100).toFixed(1)}%</p>
                        </div>
                        <div className="relative shrink-0 flex items-center justify-center">
                          <md-circular-progress
                            value={m.nonprefetched_open_rate}
                            style={{
                              '--md-circular-progress-size': '54px',
                              '--md-sys-color-primary': 'var(--color-primary)'
                            } as React.CSSProperties}
                          />
                          <md-icon className="absolute text-[16px] text-primary">visibility</md-icon>
                        </div>
                      </div>

                      {/* Spam Complaints */}
                      <div className="bg-surface-container-low dark:bg-inverse-surface/10 rounded-[24px] p-5 shadow-none border border-outline-variant/65 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-extrabold text-on-surface-variant/70 dark:text-inverse-on-surface/80 uppercase tracking-wide">Spam Complaints</h4>
                          <p className="text-2xl font-black text-[#FFA524] mt-1">{spamPct}</p>
                          <p className="text-[11px] text-on-surface-variant/65 mt-1 truncate">Unsub {(m.unsubscribe_rate * 100).toFixed(1)}%</p>
                        </div>
                        <div className="relative shrink-0 flex items-center justify-center">
                          <md-circular-progress
                            value={Math.min(1.0, m.spam_complaint_rate * 25)} // Scale slightly for visual prominence on very low rates
                            style={{
                              '--md-circular-progress-size': '54px',
                              '--md-sys-color-primary': 'var(--color-heat-orange)'
                            } as React.CSSProperties}
                          />
                          <md-icon className="absolute text-[16px] text-[#FFA524]">warning</md-icon>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* AI SUGGESTED NEXT STEPS — grounded in RCA + metrics + redacted precedent */}
                <NextStepsPanel ticket={currentTicket} />
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: Authentication */}
            {activeSection === 'Authentication' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 font-sans pb-10 px-4 sm:px-6">
                
                {/* Header Row (Google Store specs style) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 select-none" data-gem-panel data-gem-panel-label="Authentication Scan" data-gem-panel-content={authGemContent}>
                  <div>
                    <h2 className="text-3xl font-black text-on-surface dark:text-inverse-on-surface tracking-tight">Authentication</h2>
                    <p className="text-xs text-on-surface-variant dark:text-inverse-on-surface/65 mt-1">
                      DNS records check for <span className="font-mono text-primary dark:text-[#8AB4F8] font-bold">{ticketDomain}</span> · ISP: <span className="font-bold uppercase">{providerLabel}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <md-outlined-button onClick={() => onNavigateView?.('tools')}>
                      Open in Tools
                      <md-icon slot="icon">arrow_forward</md-icon>
                    </md-outlined-button>
                    <md-filled-button onClick={() => runAuthValidation()}>
                      {authLoading ? 'Scanning...' : 'Re-run Scan'}
                      <md-icon slot="icon" className={cn(authLoading && "animate-spin")}>
                        {authLoading ? 'progress_activity' : 'autorenew'}
                      </md-icon>
                    </md-filled-button>
                  </div>
                </div>

                {/* Provider context note */}
                <div className="text-xs leading-relaxed text-on-surface-variant/85 py-1">
                  <span className="font-extrabold text-[#1A73E8] dark:text-[#8AB4F8] uppercase tracking-wider mr-1.5">[MTA Context]</span>
                  Expectations depend on the sending platform. This account sends via <span className="font-semibold">{providerLabel}</span>, so records are checked against that provider's selectors.
                </div>

                {/* Specs Horizontal Columns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-outline-variant/30 select-none">
                  {/* SPF Check column */}
                  <div className="flex flex-col gap-1.5 pr-4 lg:border-r border-outline-variant/30">
                    <span className="text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-wider">SPF RECORD</span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-on-surface dark:text-inverse-on-surface leading-none">{liveSpfStatus}</span>
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full inline-block shrink-0",
                        isAuthFail(liveSpfStatus) ? "bg-[#C5221F]" : "bg-[#137333]"
                      )} />
                    </div>
                    <span className="text-xs font-mono text-on-surface-variant/75 truncate mt-1.5" title={liveSpfRecord}>{liveSpfRecord}</span>
                  </div>

                  {/* DKIM Check column */}
                  <div className="flex flex-col gap-1.5 px-0 lg:px-4 lg:border-r border-outline-variant/30">
                    <span className="text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-wider">DKIM KEYS</span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-on-surface dark:text-inverse-on-surface leading-none">{liveDkimStatus}</span>
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full inline-block shrink-0",
                        isAuthFail(liveDkimStatus) ? "bg-[#C5221F]" : "bg-[#137333]"
                      )} />
                    </div>
                    <span className="text-xs font-mono text-on-surface-variant/75 truncate mt-1.5" title={liveDkimRecord}>{liveDkimRecord}</span>
                  </div>

                  {/* DMARC Check column */}
                  <div className="flex flex-col gap-1.5 px-0 lg:px-4 lg:border-r border-outline-variant/30">
                    <span className="text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-wider">DMARC POLICY</span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-on-surface dark:text-inverse-on-surface leading-none">{liveDmarcStatus}</span>
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full inline-block shrink-0",
                        isAuthFail(liveDmarcStatus) ? "bg-[#C5221F]" : liveDmarcStatus === 'WARN' ? "bg-[#9A6700]" : "bg-[#137333]"
                      )} />
                    </div>
                    <span className="text-xs font-mono text-on-surface-variant/75 truncate mt-1.5" title={liveDmarcRecord}>{liveDmarcRecord}</span>
                  </div>

                  {/* PTR Check column */}
                  <div className="flex flex-col gap-1.5 pl-0 lg:pl-4">
                    <span className="text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-wider">PTR / RDNS</span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-on-surface dark:text-inverse-on-surface leading-none">Valid</span>
                      <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#137333] shrink-0" />
                    </div>
                    <button onClick={() => onNavigateView?.('tools')} className="text-xs font-bold text-primary dark:text-[#8AB4F8] hover:underline bg-transparent border-none p-0 cursor-pointer text-left mt-1.5 flex items-center gap-1 select-none">
                      Verify Reverse DNS
                      <md-icon style={{ fontSize: '13px' }}>arrow_forward</md-icon>
                    </button>
                  </div>
                </div>

                {/* Diagnostics details row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-on-surface-variant/90 mb-4">Diagnostics Details</h3>
                    <md-list style={{ background: 'transparent' } as React.CSSProperties} className="p-0">
                      {currentTicket.diagnostics.map((item, idx) => (
                        <React.Fragment key={idx}>
                          <md-list-item style={{ '--md-list-item-leading-space': '0px', '--md-list-item-trailing-space': '0px' } as React.CSSProperties}>
                            <md-icon slot="start" className={item.is_error ? "text-[#C5221F] dark:text-[#F28B82]" : "text-[#137333] dark:text-[#81C995]"}>
                              {item.is_error ? "cancel" : "check_circle"}
                            </md-icon>
                            <div slot="headline" className="font-bold text-on-surface">{item.title}</div>
                            <div slot="supporting-text" className="text-on-surface-variant/80">{item.description}</div>
                          </md-list-item>
                          {idx < currentTicket.diagnostics.length - 1 && <md-divider />}
                        </React.Fragment>
                      ))}
                    </md-list>
                  </div>

                  {/* Remediation Blueprint Card (Google Store promo style layout) */}
                  <div className="bg-surface-container-low dark:bg-inverse-surface/10 p-6 rounded-3xl border border-outline-variant/30 flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wide text-on-surface-variant/80 mb-2">Remediation Blueprint</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        {liveDmarcRecord || currentTicket.root_cause_summary}
                      </p>

                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1.5 px-1 select-none">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant/75">Correction String</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(liveSpfRecord);
                              setFixCopied(true);
                              setTimeout(() => setFixCopied(false), 2000);
                            }}
                            className="text-[10px] text-[#1A73E8] dark:text-[#8AB4F8] hover:underline flex items-center gap-0.5 font-bold bg-transparent border-none cursor-pointer"
                          >
                            <md-icon style={{ fontSize: '12px' }}>{fixCopied ? "check" : "content_copy"}</md-icon>
                            {fixCopied ? "Copied!" : "Copy Fix"}
                          </button>
                        </div>
                        <div className="bg-surface-bright dark:bg-inverse-surface p-3 rounded-2xl border border-outline-variant/45 font-mono text-xs text-on-surface dark:text-inverse-on-surface flex justify-between items-center shadow-none select-all break-all">
                          <span>{liveSpfRecord}</span>
                        </div>
                      </div>
                    </div>

                    <md-filled-button
                      onClick={() => {
                        setInput(`Draft a highly professional instructions notification email to the client (${currentTicket.contact_name}) explaining that our system detected a DNS configuration failure for domain ${ticketDomain}. Explain step-by-step how to publish the correct TXT record in their DNS control panel: "${liveSpfRecord}".`);
                        onSectionChange('Workspace');
                        setTimeout(() => document.getElementById('chat-input')?.focus(), 100);
                      }}
                      style={{ width: '100%', '--md-filled-button-container-color': '#1A73E8' } as React.CSSProperties}
                    >
                      <span slot="icon">
                        <DraftSparkIcon className="w-4 h-4 shrink-0" />
                      </span>
                      Email Fix Instructions via Copilot
                    </md-filled-button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: Deliverability — panels go here, each with data-gem-panel + data-gem-panel-label */}
            {activeSection === 'Deliverability' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <DeliverabilityDiagnosticsDashboard
                  ticket={currentTicket}
                  dateRange={effectiveMetricRange}
                  dateControl={<DateRangeControl dates={metricDates} value={effectiveMetricRange} onChange={setSharedMetricRange} />}
                  caseHistory={caseRows}
                />
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: Email Performance — panels go here, each with data-gem-panel + data-gem-panel-label */}
            {activeSection === 'Email Performance' && (() => {
              const emailActionCount = (Object.keys(emailFilters) as ResourceKey[]).reduce((n, k) => n + emailFilters[k].length, 0) + emailSelectedMetrics.length;
              return (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                  <div className="sticky top-0 z-30 py-2.5 -mt-3 flex justify-end gap-2 select-none pointer-events-none bg-transparent border-none">
                    <div className="pointer-events-auto">
                      <DateRangeControl dates={metricDates} value={effectiveMetricRange} onChange={setSharedMetricRange} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailMetricsOpen(true)}
                      className="pointer-events-auto flex h-12 items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-4 text-[13px] font-semibold text-on-surface shadow-[0_6px_18px_rgba(32,33,36,0.12)] transition-colors md3-state-layer hover:bg-[#F8FAFF] dark:bg-[#201F24] dark:text-inverse-on-surface dark:hover:bg-[#2A2930]"
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
                        setEmailEditMode(true);
                        setEmailCustomizeOpen(true);
                      }}
                      className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#D2E3FC] text-[#3C4043] transition-colors md3-state-layer hover:bg-[#C4D7F6]"
                      aria-label="Customize panels"
                    >
                      <span className="material-symbols-outlined text-[24px]">edit</span>
                    </button>
                    <MetricsFilterSheet
                      open={emailMetricsOpen}
                      onClose={() => setEmailMetricsOpen(false)}
                      selectedMetrics={emailSelectedMetrics}
                      onApplyMetrics={setEmailSelectedMetrics}
                      filters={emailFilters}
                      onApplyFilters={setEmailFilters}
                      options={emailOptions}
                      metricCatalog={emailMetricCatalog}
                      enabledMetrics={emailEnabledMetrics}
                      initialTab="metrics"
                      tabUnderlineLayoutId="email-perf-sheet-underline"
                    />
                    <PanelCustomizeSheet
                      open={emailCustomizeOpen}
                      onClose={() => {
                        setEmailCustomizeOpen(false);
                        setEmailEditMode(false);
                      }}
                      title="Customize Email Performance panels"
                      subtitle="Hide panels from this view or add them back later. They keep using the selected date range and metrics."
                      items={emailPanelOutlineItems}
                      onShow={showEmailPanel}
                      onHide={hideEmailPanel}
                    />
                  </div>
                  {/* Historical engagement (Looker-style combo) — opens/clicks volumes + unique rate lines */}
                  {emailPanelVisible('emailTrend') && (
                    <div className="relative overflow-visible">
                      {emailEditMode && <PanelRemoveButton onClick={() => hideEmailPanel('emailTrend')} />}
                      <HistoricalMetricsPanel
                        caseNumber={currentTicket.case_number}
                        title="Email performance over time"
                        defaultMetrics={['count_nonprefetched_unique_confirmed_opened', 'count_unique_clicked', 'nonprefetched_open_rate', 'click_through_rate']}
                        range={effectiveMetricRange}
                        onRangeChange={setSharedMetricRange}
                        showDateControl={false}
                        selected={emailSelectedMetrics}
                        onSelectedChange={setEmailSelectedMetrics}
                        filters={emailFilters}
                        onFiltersChange={setEmailFilters}
                        metricCatalog={emailMetricCatalog}
                        enabledMetrics={emailEnabledMetrics}
                        hideFilterButton={true}
                      />
                    </div>
                  )}
                  {emailPanelVisible('engagementSummary') && (
                    <div className="relative overflow-visible">
                      {emailEditMode && <PanelRemoveButton onClick={() => hideEmailPanel('engagementSummary')} />}
                      <EmailPerformanceMetricsPanel accountName={currentTicket.account_name} mta={mta as any} dateRange={effectiveMetricRange} caseNumber={currentTicket.case_number} />
                    </div>
                  )}
                </motion.div>
              );
            })()}

            {/* CONDITIONAL SECTIONS: Support History */}
            {activeSection === 'Support History' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <SupportHistoryView currentTicket={currentTicket} allCases={ticketsList} onDrill={drillToTicket} />
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: Workspace — panels go here, each with data-gem-panel + data-gem-panel-label */}
            {activeSection === 'Workspace' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 -mt-3">
                <WorkspacePanels ticket={currentTicket} onJumpSection={onSectionChange} />
              </motion.div>
            )}

            {/* CONDITIONAL SECTIONS: User Guide Reference inside active ticket */}
            {activeSection === 'User Guide' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 w-full">
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

            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Support History: all subsections stacked, navigated by a sticky floating
// jumplinks bar (scrollspy + smooth jump) styled like the ticket-list floating filter.
function SupportHistoryView({ currentTicket, allCases, onDrill }: { currentTicket: CaseRecord; allCases: CaseRecord[]; onDrill?: (id: string) => void }) {
  type SectionKey = 'thread' | 'timeline' | 'relevant';
  const segs: Array<{ key: SectionKey; label: string; icon: string }> = [
    { key: 'thread', label: 'Case thread', icon: 'forum' },
    { key: 'timeline', label: 'Account timeline', icon: 'history' },
    { key: 'relevant', label: 'Relevant cases', icon: 'manage_search' },
  ];
  const [active, setActive] = useState<SectionKey>('thread');
  const threadRef = useRef<HTMLElement | null>(null);
  const timelineRef = useRef<HTMLElement | null>(null);
  const relevantRef = useRef<HTMLElement | null>(null);
  const refMap: Record<SectionKey, React.RefObject<HTMLElement | null>> = { thread: threadRef, timeline: timelineRef, relevant: relevantRef };
  // While a jump is animating, ignore the scrollspy so the highlight doesn't flicker.
  const lockRef = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        if (lockRef.current) return;
        entries.forEach(e => {
          if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.key as SectionKey);
        });
      },
      { rootMargin: '-104px 0px -55% 0px', threshold: 0 },
    );
    [threadRef, timelineRef, relevantRef].forEach(r => r.current && obs.observe(r.current));
    return () => obs.disconnect();
  }, []);

  const jump = (key: SectionKey) => {
    setActive(key);
    lockRef.current = true;
    if (lockTimer.current) clearTimeout(lockTimer.current);
    refMap[key].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    lockTimer.current = setTimeout(() => { lockRef.current = false; }, 800);
  };

  return (
    <div className="flex flex-col gap-20">
      {/* Sticky floating jumplinks bar — Chrome jumplinks style matching Workspace nav */}
      <div className="sticky top-3 z-30 self-center -mb-10">
        <div className="flex items-center gap-[3px] p-[6px] rounded-[100px] bg-white/95 dark:bg-[#28272E]/95 backdrop-blur-[12px] border border-[rgba(218,220,224,0.8)] dark:border-white/[0.08] shadow-[0_4px_20px_rgba(32,33,36,0.08),0_1px_4px_rgba(32,33,36,0.04)]">
          {segs.map(s => {
            const isActive = active === s.key;
            return (
              <button
                key={s.key}
                onClick={() => jump(s.key)}
                className={cn(
                  'relative flex items-center gap-1.5 px-[12px] h-8 rounded-[100px] text-[13px] font-[500] transition-all duration-200 select-none whitespace-nowrap',
                  isActive
                    ? 'text-[#1a73e8] dark:text-[#8AB4F8]'
                    : 'text-[#5f6368] dark:text-white/60 hover:bg-[rgba(60,64,67,0.06)] hover:text-[#202124] dark:hover:text-white',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sh-active-pill"
                    className="absolute inset-0 bg-[#e8f0fe] dark:bg-[#1a73e8]/20 rounded-[100px]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative z-10 material-symbols-outlined" style={{ fontSize: '17px', fontVariationSettings: isActive ? "'FILL' 1" : '' }}>{s.icon}</span>
                <span className="relative z-10">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stacked subsections — each an anchor target for the jumplinks */}
      <section ref={threadRef} data-key="thread" className="scroll-mt-[78px]">
        <CaseThreadPanel caseId={currentTicket.case_number} accountName={currentTicket.account_name} caseNumber={currentTicket.case_number} />
      </section>
      <section ref={timelineRef} data-key="timeline" className="scroll-mt-[78px]">
        <SupportHistorySection currentTicket={currentTicket} allCases={allCases} view="timeline" onDrill={onDrill} />
      </section>
      <section ref={relevantRef} data-key="relevant" className="scroll-mt-[78px]">
        <SupportHistorySection currentTicket={currentTicket} allCases={allCases} view="relevant" onDrill={onDrill} />
      </section>
    </div>
  );
}

function SupportHistorySection({ currentTicket, allCases, view = 'all', onDrill }: { currentTicket: CaseRecord; allCases: CaseRecord[]; view?: 'all' | 'timeline' | 'relevant'; onDrill?: (id: string) => void }) {
  const account = currentTicket.account_name;
  const pastTickets = allCases.filter(c => c.account_id === currentTicket.account_id && c.case_number !== currentTicket.case_number);
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);
  const [expandedSimilar, setExpandedSimilar] = useState<string | null>(null);
  const showTimeline = view === 'all' || view === 'timeline';
  const showRelevant = view === 'all' || view === 'relevant';

  const crossAccount = allCases.filter(c => c.account_id !== currentTicket.account_id);
  const similarCases = rankRelevant(currentTicket, crossAccount).slice(0, 5);

  const pct = (v: number) => (v * 100).toFixed(1) + '%';

  const statusBadge = (s: string) => {
    if (s === 'In Progress') return 'text-[#1A73E8] bg-[#E8F0FE] border-[#D2E3FC] dark:bg-[#1A73E8]/15 dark:border-[#1A73E8]/30 dark:text-[#8AB4F8]';
    if (s === 'Open') return 'text-[#137333] bg-[#E6F4EA] border-[#C8E6C9] dark:bg-[#137333]/15 dark:border-[#137333]/30 dark:text-[#81C995]';
    return 'text-[#C5221F] bg-[#FCE8E6] border-[#F5C6C5] dark:bg-[#C5221F]/15 dark:border-[#C5221F]/30 dark:text-[#F28B82]';
  };

  return (
    <div className="flex flex-col gap-10 font-sans pb-10 px-4 sm:px-6" data-gem-panel data-gem-panel-label="Support History">

      {/* ── Timeline ── */}
      {showTimeline && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 select-none pb-2">
            <div>
              <span className="text-[10px] font-bold text-primary dark:text-[#8AB4F8] tracking-wider uppercase leading-none block mb-1">Timeline</span>
              <h2 className="text-3xl font-black text-on-surface dark:text-inverse-on-surface tracking-tight">Support Timeline</h2>
              <p className="text-xs text-on-surface-variant dark:text-inverse-on-surface/65 mt-1">History logs for {account}</p>
            </div>
          </div>
          <md-divider />

          <div className="flex flex-col gap-6 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-4 before:bottom-4 before:w-0.5 before:bg-outline-variant/30">
            {/* Pinned active case details card */}
            <div className="relative">
              {/* Timeline marker */}
              <span className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-surface bg-[#1A73E8] dark:bg-[#8AB4F8] shrink-0" />
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-primary dark:text-[#8AB4F8]">Active Case</span>
                  <span className="text-sm font-bold text-on-surface">{currentTicket.case_number}</span>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap', statusBadge(currentTicket.case_status))}>
                    {currentTicket.case_status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-on-surface leading-snug">{currentTicket.case_subject}</h4>
                <div className="bg-surface-container-low dark:bg-inverse-surface/10 border border-outline-variant/30 rounded-2xl p-5 text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface block mb-1">Current Root Cause</strong>
                  {currentTicket.root_cause_summary}
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant/85 px-1 mt-1 flex-wrap gap-2 select-none">
                  <div className="flex items-center gap-2">
                    <span>Opened {currentTicket.case_created_at}</span>
                    <span className="text-outline-variant/65">·</span>
                    <span>Owner: {currentTicket.case_owner}</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold">
                    <span>Accepted: {pct(currentTicket.metrics.accepted_rate)}</span>
                    <span>Bounce: {pct(currentTicket.metrics.bounce_rate)}</span>
                    <span>Open: {pct(currentTicket.metrics.nonprefetched_open_rate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Past cases timeline entries */}
            {pastTickets.map((t) => (
              <div key={t.case_number} className="relative">
                {/* Timeline marker */}
                <span className="absolute -left-6 top-6 w-4.5 h-4.5 rounded-full border-4 border-surface bg-outline-variant/60 shrink-0" />
                
                <ChrAccordion
                  id={t.case_number}
                  isOpen={expandedTimeline === t.case_number}
                  onToggle={(id) => setExpandedTimeline(prev => prev === id ? null : id)}
                  heading={
                    <span className="flex items-center gap-3 flex-wrap w-full pr-2 select-none text-left">
                      <span className="text-sm font-bold text-on-surface-variant">{t.case_number}</span>
                      <span className="text-outline-variant/50">·</span>
                      <span className="text-sm font-bold text-on-surface dark:text-inverse-on-surface truncate max-w-[280px] sm:max-w-md">{t.case_subject}</span>
                      <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full border ml-auto uppercase tracking-wide', statusBadge(t.case_status))}>
                        {t.case_status}
                      </span>
                    </span>
                  }
                >
                  <div className="flex flex-col gap-4 py-2">
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
                </ChrAccordion>
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
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex items-center gap-3 select-none pb-2">
            <div>
              <span className="text-[10px] font-bold text-primary dark:text-[#8AB4F8] tracking-wider uppercase leading-none block mb-1">Precedents</span>
              <h2 className="text-3xl font-black text-on-surface dark:text-inverse-on-surface tracking-tight">Similar Cases</h2>
              <p className="text-xs text-on-surface-variant dark:text-inverse-on-surface/65 mt-1">Contextually relevant diagnostic precedent from other accounts</p>
            </div>
          </div>
          <md-divider />

          <div className="flex flex-col">
            {similarCases.map(({ ticket: t, score, reasons }) => (
              <ChrAccordion
                key={t.case_number}
                id={'sim-' + t.case_number}
                isOpen={expandedSimilar === 'sim-' + t.case_number}
                onToggle={(id) => setExpandedSimilar(prev => prev === id ? null : id)}
                heading={
                  <span className="flex items-center gap-3 flex-wrap w-full pr-2 select-none text-left">
                    <span className="text-sm font-bold text-on-surface-variant">{t.case_number}</span>
                    <span className="text-outline-variant/50">·</span>
                    <span className="text-sm font-bold text-on-surface dark:text-inverse-on-surface truncate max-w-[200px] sm:max-w-xs">{t.account_name}</span>
                    <span className="text-xs font-bold text-[#1A73E8] dark:text-[#8AB4F8] select-none">• {score}% match</span>
                    <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full border ml-auto uppercase tracking-wide', statusBadge(t.case_status))}>
                      {t.case_status}
                    </span>
                  </span>
                }
              >
                <div className="flex flex-col gap-4 py-2">
                  <p className="text-[14px] font-bold text-on-surface leading-snug px-1">{t.case_subject}</p>
                  
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
