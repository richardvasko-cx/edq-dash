import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import IpWarmingPlanner from './IpWarmingPlanner';
import { md3Ease, md3Enter, md3QuickEnter } from '../lib/md3Motion';
import { dnsTypeName, resolveGoogleDns, type DnsLookupResult } from '../services/googleDigAuth';

const DIG_PLACEHOLDERS = [
  'e.g., braze.com',
  'e.g., 8.8.8.8',
  'e.g., mail.google.com',
  'e.g., sendgrid.net',
  'e.g., smtp.office365.com',
];

const TOOLS_ANCHOR_OFFSET = 78;

type MxCheckStatus = 'critical' | 'warning' | 'info' | 'success';

interface MxCheck {
  id: string;
  status: MxCheckStatus;
  title: string;
  detail?: string;
  helpUrl?: string;
}

interface MxReport {
  domain: string;
  summary: string;
  checks: MxCheck[];
  mxRecords: Array<{ priority: number; host: string }>;
  hasCritical: boolean;
  hasWarnings: boolean;
}

function normaliseDomain(host: string) {
  const value = host.trim().replace(/^https?:\/\//i, '').split('/')[0].replace(/\.$/, '');
  return value.replace(/^www\./i, '');
}

function getScrollParent(element: HTMLElement | null): HTMLElement | Window {
  let parent = element?.parentElement ?? null;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function getScrollTop(scroller: HTMLElement | Window) {
  return scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
}

function scrollToTop(scroller: HTMLElement | Window, top: number) {
  if (scroller === window) {
    window.scrollTo({ top, behavior: 'smooth' });
  } else {
    (scroller as HTMLElement).scrollTo({ top, behavior: 'smooth' });
  }
}

function viewportTop(scroller: HTMLElement | Window) {
  return scroller === window ? 0 : (scroller as HTMLElement).getBoundingClientRect().top;
}

interface ToolsProps {
  activeTab: 'dig' | 'mx' | 'analyzer' | 'ip_warming';
  onTabChange: (tab: 'dig' | 'mx' | 'analyzer' | 'ip_warming') => void;
}

export interface ToolTicketContext {
  account?: string;
  caseNumber?: string;
  sendingDomains?: string[];
  sendingIps?: string[];
  ipPools?: string[];
  campaigns?: string[];
  mailboxProviders?: string[];
  subaccounts?: string[];
  issue?: string;
  rootCause?: string;
  metrics?: Record<string, number>;
}

export default function Tools({ activeTab }: ToolsProps) {
  const diagnosticsRef = useRef<HTMLDivElement | null>(null);
  const isIpWarming = activeTab === 'ip_warming';
  type DiagnosticsKey = 'dig' | 'mx' | 'analyzer';
  const diagnosticTabs: Array<{ key: DiagnosticsKey; label: string; icon: string }> = [
    { key: 'dig', label: 'Google Dig', icon: 'dns' },
    { key: 'mx', label: 'MX Tool', icon: 'mail' },
    { key: 'analyzer', label: 'Message Analyzer', icon: 'data_object' },
  ];
  const [activeToolAnchor, setActiveToolAnchor] = useState<DiagnosticsKey>('dig');
  const digRef = useRef<HTMLElement | null>(null);
  const mxRef = useRef<HTMLElement | null>(null);
  const analyzerRef = useRef<HTMLElement | null>(null);
  const refMap: Record<DiagnosticsKey, React.RefObject<HTMLElement | null>> = {
    dig: digRef,
    mx: mxRef,
    analyzer: analyzerRef,
  };
  const lockRef = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToTool = (id: DiagnosticsKey) => {
    setActiveToolAnchor(id);
    lockRef.current = true;
    if (lockTimer.current) clearTimeout(lockTimer.current);
    const target = refMap[id].current;
    if (target) {
      const scroller = getScrollParent(target);
      const top = Math.max(
        0,
        getScrollTop(scroller) + target.getBoundingClientRect().top - viewportTop(scroller) - TOOLS_ANCHOR_OFFSET,
      );
      scrollToTop(scroller, top);
    }
    lockTimer.current = setTimeout(() => { lockRef.current = false; }, 800);
  };

  const updateActiveFromPosition = () => {
    if (lockRef.current || isIpWarming) return;
    const root = diagnosticsRef.current;
    const scroller = getScrollParent(root);
    const anchorY = viewportTop(scroller) + TOOLS_ANCHOR_OFFSET;
    const nearest = (Object.entries(refMap) as Array<[DiagnosticsKey, React.RefObject<HTMLElement | null>]>)
      .map(([key, ref]) => {
        const el = ref.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const bottomDistance = rect.bottom < anchorY ? anchorY - rect.bottom + 10000 : 0;
        return { key, distance: Math.abs(rect.top - anchorY) + bottomDistance };
      })
      .filter(Boolean)
      .sort((a, b) => a!.distance - b!.distance)[0];
    if (nearest) setActiveToolAnchor(nearest.key);
  };

  useEffect(() => {
    if (activeTab === 'mx' || activeTab === 'analyzer') {
      const id = window.setTimeout(() => scrollToTool(activeTab), 80);
      return () => window.clearTimeout(id);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isIpWarming) return;
    const scroller = getScrollParent(diagnosticsRef.current);
    const target = scroller === window ? window : scroller;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActiveFromPosition);
    };
    updateActiveFromPosition();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isIpWarming]);

  // Rotating placeholder for dig input
  const [phIdx, setPhIdx] = useState(0);
  const [phVisible, setPhVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setPhVisible(false);
      setTimeout(() => {
        setPhIdx(i => (i + 1) % DIG_PLACEHOLDERS.length);
        setPhVisible(true);
      }, 250);
    }, 2800);
    return () => clearInterval(id);
  }, []);
  const [targetHost, setTargetHost] = useState('');
  const [ticketContext, setTicketContext] = useState<ToolTicketContext | null>(null);
  
  // Dig State
  const [digType, setDigType] = useState('A');
  const [digResult, setDigResult] = useState<any[] | null>(null);
  const [digLookup, setDigLookup] = useState<DnsLookupResult | null>(null);
  const [digLoading, setDigLoading] = useState(false);
  const [digError, setDigError] = useState('');

  useEffect(() => {
    const consumeGeminiAction = () => {
      try {
        const raw = sessionStorage.getItem('edq_gemini_app_action');
        if (!raw) return;
        const payload = JSON.parse(raw) as {
          action?: { view?: string; toolsTab?: string; toolPrefill?: 'sending_domain' | 'sending_ip' };
          ticket?: ToolTicketContext;
        };
        if (payload.action?.view !== 'tools') return;
        const context = payload.ticket || {};
        setTicketContext(context);
        const preferIp = payload.action.toolPrefill === 'sending_ip';
        const value = preferIp ? context.sendingIps?.[0] : context.sendingDomains?.[0];
        if (value) {
          setTargetHost(value);
          setDigType(preferIp ? 'PTR' : 'TXT');
        }
        sessionStorage.removeItem('edq_gemini_app_action');
      } catch {}
    };
    consumeGeminiAction();
    window.addEventListener('edq:gemini-app-action', consumeGeminiAction);
    return () => window.removeEventListener('edq:gemini-app-action', consumeGeminiAction);
  }, [activeTab]);

  const formatTargetForDns = (host: string, isPtr: boolean) => {
    let hostname = host.trim();
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (ipv4Regex.test(hostname)) {
      if (isPtr) {
        return hostname.split('.').reverse().join('.') + '.in-addr.arpa';
      }
      return hostname;
    }
    return hostname;
  };

  const runDig = async (type = digType) => {
    if (!targetHost) return;
    setDigLoading(true);
    setDigError('');
    setDigResult(null);
    
    // Auto-detect IP and convert to PTR for address-style lookups.
    let lookupTarget = targetHost.trim();
    // Strip http:// and https:// and paths if user pasted a URL
    try {
      if (lookupTarget.startsWith('http://') || lookupTarget.startsWith('https://')) {
        const urlObj = new URL(lookupTarget);
        lookupTarget = urlObj.hostname;
      } else if (lookupTarget.includes('/')) {
        lookupTarget = lookupTarget.split('/')[0];
      }
    } catch (e) {
      // Ignore URL parsing errors and try with the raw string
    }

    const isIP = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(lookupTarget) || lookupTarget.includes(':');
    
    let actualType = type;
    if (isIP) {
      if (type === 'A' || type === 'AAAA') {
        actualType = 'PTR';
      }
      if (actualType === 'PTR') {
        if (/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(lookupTarget)) {
           lookupTarget = lookupTarget.split('.').reverse().join('.') + '.in-addr.arpa';
        }
      }
    }

    try {
      const lookup = await resolveGoogleDns(lookupTarget, actualType);
      setDigLookup(lookup);
      const combinedResults = [
        ...(lookup.answers || []),
        ...(lookup.authority || []),
        ...(lookup.additional || []),
      ];
      if (lookup.status !== 0 && combinedResults.length === 0) {
        setDigError(`DNS resolution returned ${lookup.statusText}`);
      }
      setDigResult(combinedResults);
    } catch (e: any) {
      setDigError(e.message || 'Network Error or Invalid Request');
    } finally {
      setDigLoading(false);
    }
  };

  const getRecordTypeName = dnsTypeName;
  // MX State
  const [mxResult, setMxResult] = useState<MxReport | null>(null);
  const [mxLoading, setMxLoading] = useState(false);
  const [mxError, setMxError] = useState('');
  const [expandedMxCheck, setExpandedMxCheck] = useState<string | null>(null);

  const runMX = async () => {
    if (!targetHost) return;
    setMxLoading(true);
    setMxError('');
    setMxResult(null);
    setExpandedMxCheck(null);

    try {
      const response = await fetch(`/api/google-checkmx?domain=${encodeURIComponent(normaliseDomain(targetHost))}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Google CheckMX request failed.');
      setMxResult(data.report as MxReport);
    } catch (error: any) {
      setMxError(error?.message || 'Google CheckMX request failed.');
    } finally {
      setMxLoading(false);
    }
  };

  const [headerInput, setHeaderInput] = useState('');
  const [headerAnalysis, setHeaderAnalysis] = useState<any>(null);

  const analyzeHeaders = () => {
    const fromMatch = headerInput.match(/From:\s*(.*)/i);
    const returnPathMatch = headerInput.match(/Return-Path:\s*<(.*?)>/i);
    const subjectMatch = headerInput.match(/Subject:\s*(.*)/i);
    const dateMatch = headerInput.match(/Date:\s*(.*)/i);
    const spfMatch = headerInput.match(/Received-SPF:\s*([a-zA-Z]+)/i) || headerInput.match(/spf=([a-zA-Z]+)/i);
    const dkimMatch = headerInput.match(/dkim=([a-zA-Z]+)/i);
    const dmarcMatch = headerInput.match(/dmarc=([a-zA-Z]+)/i);

    const hopsCount = (headerInput.match(/^Received:/gm) || []).length;

    setHeaderAnalysis({
      from: fromMatch ? fromMatch[1] : 'Unknown',
      returnPath: returnPathMatch ? returnPathMatch[1] : 'Unknown',
      subject: subjectMatch ? subjectMatch[1] : 'Unknown',
      date: dateMatch ? dateMatch[1] : 'Unknown',
      spf: spfMatch ? spfMatch[1] : 'None',
      dkim: dkimMatch ? dkimMatch[1] : 'None',
      dmarc: dmarcMatch ? dmarcMatch[1] : 'None',
      hops: hopsCount
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-10">

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={isIpWarming ? 'ip_warming' : 'diagnostics'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Google Dig Module */}
            {!isIpWarming && (
              <div ref={diagnosticsRef} className="flex flex-col gap-20">
                <motion.div
                  className="sticky top-3 z-30 self-center -mb-10"
                  {...md3QuickEnter}
                  transition={{ duration: 0.34, ease: md3Ease }}
                >
                  <nav className="flex items-center gap-[3px] p-[6px] rounded-[100px] bg-white/95 dark:bg-[#28272E]/95 backdrop-blur-[12px] border border-[rgba(218,220,224,0.8)] dark:border-white/[0.08] shadow-[0_4px_20px_rgba(32,33,36,0.08),0_1px_4px_rgba(32,33,36,0.04)] overflow-x-auto no-scrollbar max-w-[calc(100vw-2rem)]">
                    {diagnosticTabs.map(item => {
                      const isActive = activeToolAnchor === item.key;
                      return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => scrollToTool(item.key)}
                        className={cn(
                          "relative flex items-center gap-1.5 px-[12px] h-8 rounded-[100px] text-[13px] font-[500] transition-all duration-200 select-none whitespace-nowrap cursor-pointer",
                          isActive
                            ? "text-[#1A73E8] dark:text-[#8AB4F8]"
                            : "text-[#5F6368] dark:text-white/70 hover:bg-[rgba(60,64,67,0.06)] hover:text-[#202124] dark:hover:bg-white/8 dark:hover:text-white"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="tools-diagnostics-active-pill"
                            className="absolute inset-0 bg-[#E8F0FE] dark:bg-[#1A73E8]/20 rounded-[100px]"
                            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                          />
                        )}
                        <span className="relative z-10 material-symbols-outlined" style={{ fontSize: '17px', fontVariationSettings: isActive ? "'FILL' 1" : '' }}>{item.icon}</span>
                        <span className="relative z-10 flex items-center gap-[4px]">
                          {item.key === 'dig' ? (
                            <>
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Google_2026_logo.svg/500px-Google_2026_logo.svg.png" 
                                alt="Google" 
                                className="h-[13px] object-contain translate-y-[1px]" 
                              />
                              <span>Dig</span>
                            </>
                          ) : (
                            item.label
                          )}
                        </span>
                      </button>
                      );
                    })}
                  </nav>
                </motion.div>

              <motion.section ref={digRef} data-key="dig" id="tool-dig" data-gem-panel data-gem-panel-label="DNS Lookup Results" data-gem-panel-content={digResult ? `DNS Lookup Results for ${targetHost}:\n${digResult.map((r: any) => `${r.name} ${r.TTL} IN ${getRecordTypeName(r.type)} ${r.data}`).join('\n')}` : 'DNS Lookup Results — run a lookup to see data'} className="scroll-mt-[78px] bg-white p-6 duration-300 dark:bg-inverse-surface md:p-8" {...md3Enter} transition={{ duration: 0.38, ease: md3Ease, delay: 0.04 }}>
                <motion.div
                  className="flex flex-col gap-6 mb-8"
                  {...md3Enter}
                  transition={{ duration: 0.32, ease: md3Ease, delay: 0.08 }}
                >
                  {ticketContext?.caseNumber && (
                    <div className="rounded-xl border border-[#1A73E8]/20 bg-[#F8FAFF] px-4 py-3 text-[12px] leading-relaxed text-on-surface-variant dark:bg-white/5 dark:text-inverse-on-surface/70">
                      <span className="font-bold text-on-surface dark:text-inverse-on-surface">Preloaded from {ticketContext.account} · {ticketContext.caseNumber}</span>
                      <span className="ml-2">IP: {ticketContext.sendingIps?.join(', ') || 'Not recorded'} · Pool: {ticketContext.ipPools?.join(', ') || 'Not recorded'} · Campaign: {ticketContext.campaigns?.join(', ') || 'Not recorded'}</span>
                    </div>
                  )}
                  <motion.div
                    className="flex flex-col md:flex-row gap-4 items-end"
                    {...md3Enter}
                    transition={{ duration: 0.32, ease: md3Ease, delay: 0.12 }}
                  >
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80 mb-2">Domain Name or IP Address</label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface dark:bg-primary/5 dark:text-inverse-on-surface border border-outline-variant dark:border-outline-variant/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base peer"
                          placeholder=" "
                          type="text"
                          value={targetHost}
                          onChange={e => setTargetHost(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && runDig(digType)}
                        />
                        {/* Animated placeholder — hidden when input has value */}
                        {!targetHost && (
                          <div className="absolute inset-0 flex items-center px-4 pointer-events-none overflow-hidden">
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={phIdx}
                                initial={{ y: 12, opacity: 0 }}
                                animate={{ y: 0, opacity: phVisible ? 1 : 0 }}
                                exit={{ y: -12, opacity: 0 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                className="text-base text-on-surface-variant/40 dark:text-inverse-on-surface/30 select-none"
                              >
                                {DIG_PLACEHOLDERS[phIdx]}
                              </motion.span>
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }} 
                      onClick={() => runDig(digType)}
                      disabled={digLoading}
                      className="w-full md:w-auto bg-primary text-white dark:text-primary-on px-8 py-3 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors h-[50px] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {digLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : 'Lookup'}
                    </motion.button>
                  </motion.div>
                  
                  {/* Dig Types List */}
                  <motion.div
                    {...md3Enter}
                    transition={{ duration: 0.32, ease: md3Ease, delay: 0.16 }}
                  >
                    <label className="block text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80 mb-3">Record Type</label>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {['A', 'AAAA', 'CAA', 'CNAME', 'DNSKEY', 'DS', 'HTTPS', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'SVCB', 'TLSA', 'TSIG', 'TXT'].map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            setDigType(t);
                            if (targetHost) runDig(t);
                          }}
                          className={cn(
                            "px-4 py-1.5 rounded-full font-medium transition-all border",
                            digType === t
                              ? "bg-primary text-white border-primary"
                              : "bg-surface dark:bg-primary/5 text-on-surface-variant dark:text-inverse-on-surface border-outline-variant/50 hover:border-primary/50"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Terminal Output */}
                <motion.div
                  className="bg-[#1E1E2E] text-[#D9DADC] p-4 rounded-lg font-mono text-sm overflow-x-auto min-h-[16rem] shadow-inner"
                  {...md3Enter}
                  transition={{ duration: 0.34, ease: md3Ease, delay: 0.2 }}
                >
                  {digResult ? (
                    digResult.length > 0 ? (
                      <>
                        <div className="opacity-50 mb-4">; &lt;&lt;&gt;&gt; DiG Copilot &lt;&lt;&gt;&gt; {targetHost} {digType}</div>
                        <div className="mb-4">;; Got answer:</div>
                        {digResult.map((ans, idx) => (
                           <div key={idx} className="flex gap-4">
                             <span className="w-48 truncate flex-shrink-0">{ans.name}</span>
                             <span className="w-12 text-right flex-shrink-0">{ans.TTL}</span>
                             <span className="w-8 text-center text-primary-fixed-dim flex-shrink-0">IN</span>
                             <span className="w-12 text-secondary-fixed flex-shrink-0">{getRecordTypeName(ans.type)}</span>
                             <span className="text-peach whitespace-pre-wrap flex-1 break-all">{ans.data}</span>
                           </div>
                        ))}
                      </>
                    ) : (
                      <div className="opacity-50">;; No records found for {targetHost}</div>
                    )
                  ) : digError ? (
                     <div className="text-heat-red">;; Error: {digError}</div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 mt-10">
                      <span className="material-symbols-outlined text-4xl mb-2">code_blocks</span>
                      <span>Ready for query</span>
                    </div>
                  )}
                </motion.div>
              </motion.section>
            

            {/* MX Tool Module */}
              <motion.section ref={mxRef} data-key="mx" id="tool-mx" data-gem-panel data-gem-panel-label="Google CheckMX report" data-gem-panel-content={mxResult ? `Google CheckMX report for ${mxResult.domain}:\n${mxResult.checks.map(check => `${check.status}: ${check.title}`).join('\n')}` : 'Google CheckMX report — enter a domain to run the Google checks'} className="scroll-mt-[78px] bg-white p-6 duration-300 dark:bg-inverse-surface md:p-8" {...md3Enter} transition={{ duration: 0.38, ease: md3Ease, delay: 0.1 }}>
                <div className="mx-auto max-w-5xl">
                  <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <label className="mb-2 block text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80">Domain name</label>
                      <input
                        className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-base text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 dark:border-outline-variant/20 dark:bg-primary/5 dark:text-inverse-on-surface"
                        type="text"
                        value={targetHost}
                        onChange={e => setTargetHost(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && runMX()}
                        placeholder="example.com"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={runMX}
                      disabled={mxLoading || !targetHost.trim()}
                      className="flex h-[50px] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      <span className={cn('material-symbols-outlined text-[18px]', mxLoading && 'animate-spin')}>{mxLoading ? 'sync' : 'search'}</span>
                      {mxLoading ? 'Checking Google CheckMX' : 'Check domain'}
                    </motion.button>
                  </div>

                  {mxError && <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{mxError}</p>}

                  {mxResult ? (
                    <div className="space-y-5">
                      <div className={cn(
                        'rounded-2xl border p-5 sm:p-6',
                        mxResult.hasCritical
                          ? 'border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20'
                          : mxResult.hasWarnings
                            ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20'
                            : 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      )}>
                        <div className="flex items-start gap-3">
                          <MxStatusIcon status={mxResult.hasCritical ? 'critical' : mxResult.hasWarnings ? 'warning' : 'success'} large />
                          <div>
                            <h2 className="text-2xl font-black tracking-tight text-on-surface dark:text-inverse-on-surface">{mxResult.domain}</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant dark:text-inverse-on-surface/70">{mxResult.summary}</p>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white dark:border-white/10 dark:bg-[#242229]">
                        <div className="border-b border-outline-variant/35 px-5 py-4 dark:border-white/10">
                          <h3 className="text-sm font-black text-on-surface dark:text-inverse-on-surface">Google CheckMX results</h3>
                          <p className="mt-1 text-xs text-on-surface-variant dark:text-inverse-on-surface/60">Live results from Google Admin Toolbox CheckMX.</p>
                        </div>
                        <div className="divide-y divide-outline-variant/30 dark:divide-white/8">
                          {mxResult.checks.map(check => {
                            const expanded = expandedMxCheck === check.id;
                            const canExpand = Boolean(check.detail);
                            return (
                              <div key={check.id}>
                                <button
                                  type="button"
                                  onClick={() => canExpand && setExpandedMxCheck(expanded ? null : check.id)}
                                  className={cn('grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 text-left', canExpand && 'transition-colors hover:bg-surface-container-low dark:hover:bg-white/[0.04]')}
                                  aria-expanded={canExpand ? expanded : undefined}
                                >
                                  <MxStatusIcon status={check.status} />
                                  <span className={cn('text-sm font-semibold leading-snug', check.status === 'critical' ? 'text-red-700 dark:text-red-300' : 'text-on-surface dark:text-inverse-on-surface')}>
                                    {check.title}
                                  </span>
                                  <span className="flex items-center gap-3">
                                    {check.helpUrl && (
                                      <a href={check.helpUrl} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()} className="hidden text-xs font-bold text-primary hover:underline sm:inline">Help article</a>
                                    )}
                                    {canExpand && <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{expanded ? 'expand_less' : 'expand_more'}</span>}
                                  </span>
                                </button>
                                {expanded && check.detail && <div className="mx-5 mb-4 rounded-xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">{check.detail}</div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {mxResult.mxRecords.length > 0 && (
                        <div className="rounded-2xl border border-outline-variant/50 p-5 dark:border-white/10">
                          <h3 className="text-sm font-black text-on-surface dark:text-inverse-on-surface">Mail exchangers</h3>
                          <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[420px] text-left text-sm">
                              <thead className="text-xs text-on-surface-variant dark:text-inverse-on-surface/60"><tr><th className="pb-2 font-bold">Priority</th><th className="pb-2 font-bold">Hostname</th></tr></thead>
                              <tbody className="divide-y divide-outline-variant/25 dark:divide-white/8">{mxResult.mxRecords.map(record => <tr key={`${record.priority}-${record.host}`}><td className="py-2.5 font-mono text-primary">{record.priority}</td><td className="py-2.5 font-medium text-on-surface dark:text-inverse-on-surface">{record.host}</td></tr>)}</tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-outline-variant/70 px-6 py-12 text-center dark:border-white/15">
                      <span className="material-symbols-outlined text-[32px] text-primary">mark_email_read</span>
                      <h3 className="mt-3 text-base font-black text-on-surface dark:text-inverse-on-surface">Run Google CheckMX</h3>
                      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-on-surface-variant dark:text-inverse-on-surface/60">Enter a domain to inspect the live Google CheckMX mail-flow, SPF, MX, DKIM, DMARC, and DNS checks.</p>
                    </div>
                  )}
                </div>
              </motion.section>

            

            {/* Analyzer Module */}
              <motion.section ref={analyzerRef} data-key="analyzer" id="tool-analyzer" data-gem-panel data-gem-panel-label="Header Analysis Results" data-gem-panel-content={headerAnalysis ? `Header Analysis:\n${JSON.stringify(headerAnalysis, null, 2).slice(0, 2000)}` : 'Header Analysis — paste and analyze a header to see data'} className="scroll-mt-[78px] bg-white p-6 duration-300 dark:bg-inverse-surface md:p-8" {...md3Enter} transition={{ duration: 0.38, ease: md3Ease, delay: 0.16 }}>
                <div className="mx-auto max-w-5xl">
                  <div className="mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>data_object</span>
                    <div>
                      <h2 className="text-lg font-black text-on-surface dark:text-inverse-on-surface">Message Header Analyzer</h2>
                      <p className="mt-0.5 text-xs text-on-surface-variant dark:text-inverse-on-surface/60">Inspect message authentication and routing signals from raw headers.</p>
                    </div>
                  </div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* Input column */}
                  <motion.div
                    className="flex flex-col gap-3"
                    {...md3Enter}
                    transition={{ duration: 0.32, ease: md3Ease, delay: 0.2 }}
                  >
                    <label className="text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80">Paste raw headers</label>
                    <textarea
                      className="min-h-[300px] w-full flex-1 resize-none rounded-2xl border border-outline-variant/60 bg-surface p-4 font-mono text-sm text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 dark:border-white/12 dark:bg-primary/5 dark:text-inverse-on-surface"
                      placeholder={"Return-Path: <bounce@example.com>\nReceived: from mail.example.com...\nX-Mailer: Braze"}
                      value={headerInput}
                      onChange={e => setHeaderInput(e.target.value)}
                    />
                    <button
                      onClick={analyzeHeaders}
                      className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[18px]">analytics</span>
                      Analyze Headers
                    </button>
                  </motion.div>

                  {/* Results column */}
                  {headerAnalysis ? (
                    <motion.div
                      className="flex flex-col gap-3"
                      {...md3Enter}
                      transition={{ duration: 0.32, ease: md3Ease, delay: 0.24 }}
                    >
                      <label className="text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80">Analysis results</label>
                      {/* Metadata rows */}
                      <motion.div
                        className="divide-y divide-outline-variant/15 rounded-2xl border border-outline-variant/50 bg-white dark:divide-white/6 dark:border-white/10 dark:bg-[#242229]"
                        {...md3Enter}
                        transition={{ duration: 0.3, ease: md3Ease, delay: 0.28 }}
                      >
                        {[
                          { label: 'From', value: headerAnalysis.from, mono: true },
                          { label: 'Subject', value: headerAnalysis.subject, mono: false },
                          { label: 'Return-Path', value: headerAnalysis.returnPath, mono: true },
                          { label: 'Date', value: headerAnalysis.date, mono: false },
                        ].map(row => (
                          <div key={row.label} className="grid grid-cols-3 px-4 py-2.5 items-start">
                            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant dark:text-white/50 pt-0.5">{row.label}</span>
                            <span className={cn("col-span-2 text-[13px] text-on-surface dark:text-inverse-on-surface break-all", row.mono ? "font-mono" : "font-medium")}>{row.value}</span>
                          </div>
                        ))}
                      </motion.div>
                      {/* Auth badges */}
                      <motion.div
                        className="grid grid-cols-3 gap-3"
                        {...md3Enter}
                        transition={{ duration: 0.3, ease: md3Ease, delay: 0.32 }}
                      >
                        {[
                          { label: 'SPF', value: headerAnalysis.spf },
                          { label: 'DKIM', value: headerAnalysis.dkim },
                          { label: 'DMARC', value: headerAnalysis.dmarc },
                        ].map(auth => {
                          const isPass = auth.value.toLowerCase() === 'pass';
                          const isNone = auth.value === 'None';
                          return (
                            <div key={auth.label} className={cn("rounded-xl border p-3 text-center", isPass ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40" : isNone ? "bg-surface-container-low dark:bg-white/5 border-outline-variant/40" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40")}>
                              <div className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1.5">{auth.label}</div>
                              <div className={cn("text-sm font-bold capitalize", isPass ? "text-green-700 dark:text-green-400" : isNone ? "text-on-surface-variant" : "text-red-600 dark:text-red-400")}>
                                {isPass && <span className="material-symbols-outlined text-[14px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                                {!isPass && !isNone && <span className="material-symbols-outlined text-[14px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>}
                                {auth.value}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                      {/* Routing hops */}
                      <motion.div
                        className="flex items-center justify-between rounded-2xl border border-outline-variant/50 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#242229]"
                        {...md3Enter}
                        transition={{ duration: 0.3, ease: md3Ease, delay: 0.36 }}
                      >
                        <div>
                          <p className="text-[13px] font-bold text-on-surface dark:text-inverse-on-surface">Routing Hops</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">Mail servers traversed</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                          {headerAnalysis.hops}
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-outline-variant/70 px-8 py-12 text-center dark:border-white/15"
                      {...md3Enter}
                      transition={{ duration: 0.32, ease: md3Ease, delay: 0.24 }}
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F0FE] dark:bg-primary/15">
                        <span className="material-symbols-outlined text-[28px] text-primary">analytics</span>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[15px] font-black text-on-surface dark:text-inverse-on-surface">Awaiting headers</h3>
                        <p className="mx-auto max-w-[260px] text-[13px] leading-relaxed text-on-surface-variant dark:text-white/50">Paste raw email headers and analyze them to extract SPF, DKIM, DMARC, and routing data.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
                </div>
              </motion.section>
              </div>
            )}
            {isIpWarming && <IpWarmingPlanner ticketContext={ticketContext} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MxStatusIcon({ status, large = false }: { status: MxCheckStatus; large?: boolean }) {
  const icon = status === 'critical' ? 'error' : status === 'warning' ? 'warning' : status === 'info' ? 'info' : 'check_circle';
  const color = status === 'critical' ? 'text-red-500' : status === 'warning' ? 'text-amber-500' : status === 'info' ? 'text-primary' : 'text-emerald-600';
  return <span className={cn('material-symbols-outlined shrink-0', large ? 'text-[28px]' : 'text-[20px]', color)} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>;
}
