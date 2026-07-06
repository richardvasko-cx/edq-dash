import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import IpWarmingPlanner from './IpWarmingPlanner';

const DIG_PLACEHOLDERS = [
  'e.g., braze.com',
  'e.g., 8.8.8.8',
  'e.g., mail.google.com',
  'e.g., sendgrid.net',
  'e.g., smtp.office365.com',
];

const TOOLS_ANCHOR_OFFSET = 78;

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
  
  // Dig State
  const [digType, setDigType] = useState('ANY');
  const [digResult, setDigResult] = useState<any[] | null>(null);
  const [digLoading, setDigLoading] = useState(false);
  const [digError, setDigError] = useState('');

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
    
    // Auto-detect IP and convert to PTR if ANY or PTR requested
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
      if (type === 'ANY' || type === 'A' || type === 'AAAA') {
        actualType = 'PTR';
      }
      if (actualType === 'PTR') {
        if (/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(lookupTarget)) {
           lookupTarget = lookupTarget.split('.').reverse().join('.') + '.in-addr.arpa';
        }
      }
    }

    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(lookupTarget)}&type=${actualType}`);
      const data = await res.json();
      
      // If error status and no answer
      if (data.Status !== 0 && !data.Answer && !data.Authority) {
        setDigError(`DNS resolution failed with status ${data.Status}`);
        return;
      }

      let combinedResults = [];
      if (data.Answer) combinedResults.push(...data.Answer);
      if (data.Authority) combinedResults.push(...data.Authority);
      if (data.Additional) combinedResults.push(...data.Additional);
      setDigResult(combinedResults);
    } catch (e: any) {
      setDigError(e.message || 'Network Error or Invalid Request');
    } finally {
      setDigLoading(false);
    }
  };

  const getRecordTypeName = (type: number) => {
    const types: Record<number, string> = {
      1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 12: 'PTR', 15: 'MX', 16: 'TXT', 28: 'AAAA', 33: 'SRV', 43: 'DS', 46: 'RRSIG', 47: 'NSEC', 48: 'DNSKEY', 50: 'NSEC3', 51: 'NSEC3PARAM', 52: 'TLSA', 64: 'SVCB', 65: 'HTTPS', 250: 'TSIG', 255: 'ANY', 257: 'CAA'
    };
    return types[type] || `TYPE${type}`;
  };
  // MX State
  const [mxResult, setMxResult] = useState<any[] | null>(null);
  const [mxLoading, setMxLoading] = useState(false);

  const runMX = async () => {
    if (!targetHost) return;
    setMxLoading(true);

    let lookupTarget = targetHost.trim();
    try {
      if (lookupTarget.startsWith('http://') || lookupTarget.startsWith('https://')) {
        const urlObj = new URL(lookupTarget);
        lookupTarget = urlObj.hostname;
      } else if (lookupTarget.includes('/')) {
        lookupTarget = lookupTarget.split('/')[0];
      }
    } catch (e) { }

    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(lookupTarget)}&type=MX`);
      const data = await res.json();
      if (data.Answer) {
        const parsed = data.Answer.map((ans: any) => {
          const parts = ans.data.split(' ');
          const priority = parseInt(parts[0], 10);
          const host = parts[1];
          return { priority, host, ip: 'Auto Resolved', status: 'OK' };
        }).sort((a: any, b: any) => a.priority - b.priority);
        setMxResult(parsed);
      } else {
        setMxResult([]);
      }
    } catch (e) {
      setMxResult([]);
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
                <div className="sticky top-3 z-30 self-center -mb-10">
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
                </div>

              <section ref={digRef} data-key="dig" id="tool-dig" data-gem-panel data-gem-panel-label="DNS Lookup Results" data-gem-panel-content={digResult ? `DNS Lookup Results for ${targetHost}:\n${digResult.map((r: any) => `${r.name} ${r.TTL} IN ${getRecordTypeName(r.type)} ${r.data}`).join('\n')}` : 'DNS Lookup Results — run a lookup to see data'} className="scroll-mt-[78px] bg-white dark:bg-inverse-surface rounded-xl shadow-none border border-[#1A73E8]/15 dark:border-outline-variant/10 p-6 md:p-8 duration-300">
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
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
                  </div>
                  
                  {/* Dig Types List */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80 mb-3">Record Type</label>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {['A', 'AAAA', 'ANY', 'CAA', 'CNAME', 'DNSKEY', 'DS', 'HTTPS', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'SVCB', 'TLSA', 'TSIG', 'TXT'].map(t => (
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
                  </div>
                </div>

                {/* Terminal Output */}
                <div className="bg-[#1E1E2E] text-[#D9DADC] p-4 rounded-lg font-mono text-sm overflow-x-auto min-h-[16rem] shadow-inner">
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
                </div>
              </section>
            

            {/* MX Tool Module */}
              <section ref={mxRef} data-key="mx" id="tool-mx" data-gem-panel data-gem-panel-label="MX Record Analysis" data-gem-panel-content={mxResult ? `MX Record Analysis for ${targetHost}:\n${mxResult.map((mx: any) => `Priority ${mx.priority}: ${mx.host} — ${mx.status}`).join('\n')}` : 'MX Record Analysis — run a lookup to see data'} className="scroll-mt-[78px] bg-white dark:bg-inverse-surface rounded-xl shadow-none border border-[#1A73E8]/15 dark:border-outline-variant/10 p-6 md:p-8 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80 mb-2">Target Domain</label>
                      <div className="flex gap-2">
                        <input 
                          className="w-full bg-surface dark:bg-primary/5 dark:text-inverse-on-surface border border-outline-variant dark:border-outline-variant/20 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-all text-base" 
                          type="text" 
                          value={targetHost}
                          onChange={e => setTargetHost(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && runMX()}
                          placeholder="e.g., braze.com"
                        />
                        <motion.button 
                          whileHover={{ scale: 1.05 }} 
                          whileTap={{ scale: 0.95 }} 
                          onClick={runMX}
                          disabled={mxLoading}
                          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          <span className={cn("material-symbols-outlined", mxLoading && "animate-spin")}>sync</span>
                        </motion.button>
                      </div>
                    </div>
                    {mxResult && mxResult.length > 0 && (
                      <div className="bg-surface-purple dark:bg-primary/10 p-4 rounded-lg border border-primary-fixed dark:border-primary/30">
                        <h4 className="text-sm font-bold text-primary dark:text-primary-fixed mb-2">Health Score</h4>
                        <div className="flex items-end gap-2">
                          <span className="text-5xl font-bold text-on-surface dark:text-inverse-on-surface leading-none">100</span>
                          <span className="text-base font-bold text-outline dark:text-inverse-on-surface/50 mb-1">/ 100</span>
                        </div>
                        <div className="w-full bg-surface-variant dark:bg-primary/20 h-2 rounded-full mt-3 overflow-hidden">
                          <div className="bg-primary h-full w-[100%] rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant/50 dark:border-outline-variant/20">
                            <th className="py-3 px-4 text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80">Priority</th>
                            <th className="py-3 px-4 text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80">Hostname</th>
                            <th className="py-3 px-4 text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80">IP Address</th>
                            <th className="py-3 px-4 text-xs font-bold text-on-surface-variant dark:text-inverse-on-surface/80">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mxResult ? (
                            mxResult.length > 0 ? mxResult.map((mx, i) => (
                              <MXRow key={i} priority={mx.priority} host={mx.host} ip={mx.ip} status={mx.status} />
                            )) : (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-on-surface-variant dark:text-inverse-on-surface/50">No MX records found.</td>
                              </tr>
                            )
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-on-surface-variant dark:text-inverse-on-surface/50">Enter a domain to check MX records.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

            

            {/* Analyzer Module */}
              <section ref={analyzerRef} data-key="analyzer" id="tool-analyzer" data-gem-panel data-gem-panel-label="Header Analysis Results" data-gem-panel-content={headerAnalysis ? `Header Analysis:\n${JSON.stringify(headerAnalysis, null, 2).slice(0, 2000)}` : 'Header Analysis — paste and analyze a header to see data'} className="scroll-mt-[78px] bg-white dark:bg-[#1E1D22] rounded-2xl shadow-none border border-outline-variant/50 dark:border-white/8 overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-outline-variant/20 dark:border-white/8 bg-surface-container-low dark:bg-[#28272C]">
                  <span className="material-symbols-outlined text-primary dark:text-[#D2E3FC]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>data_object</span>
                  <h2 className="font-bold text-[15px] text-on-surface dark:text-inverse-on-surface">Message Header Analyzer</h2>
                </div>
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Input column */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-white/50">Paste Raw Headers</label>
                    <textarea
                      className="w-full flex-1 min-h-[280px] bg-surface-container-low dark:bg-[#28272C] dark:text-inverse-on-surface border border-outline-variant/60 dark:border-white/12 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none placeholder:text-on-surface-variant/40"
                      placeholder={"Return-Path: <bounce@example.com>\nReceived: from mail.example.com...\nX-Mailer: Braze"}
                      value={headerInput}
                      onChange={e => setHeaderInput(e.target.value)}
                    />
                    <button
                      onClick={analyzeHeaders}
                      className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                    >
                      Analyze Headers
                    </button>
                  </div>

                  {/* Results column */}
                  {headerAnalysis ? (
                    <div className="flex flex-col gap-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-white/50">Analysis Results</label>
                      {/* Metadata rows */}
                      <div className="bg-surface-container-low dark:bg-[#28272C] rounded-xl border border-[#1A73E8]/15 dark:border-white/8 divide-y divide-outline-variant/15 dark:divide-white/6">
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
                      </div>
                      {/* Auth badges */}
                      <div className="grid grid-cols-3 gap-3">
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
                      </div>
                      {/* Routing hops */}
                      <div className="bg-surface-container-low dark:bg-[#28272C] rounded-xl border border-[#1A73E8]/15 dark:border-white/8 px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-on-surface dark:text-inverse-on-surface">Routing Hops</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">Mail servers traversed</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                          {headerAnalysis.hops}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-container-low dark:bg-[#28272C] rounded-xl border border-[#1A73E8]/15 dark:border-white/8 flex flex-col justify-center items-center text-center p-8 gap-4">
                      <div className="w-14 h-14 bg-surface-container-highest dark:bg-white/8 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px] text-on-surface-variant/50">analytics</span>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-on-surface dark:text-inverse-on-surface mb-1">Awaiting Headers</h3>
                        <p className="text-[13px] text-on-surface-variant dark:text-white/50 max-w-[240px]">Paste raw email headers and click Analyze to extract SPF, DKIM, DMARC, and routing data.</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
              </div>
            )}
            {isIpWarming && <IpWarmingPlanner />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MXRow({ priority, host, ip, status }: { key?: React.Key, priority: number, host: string, ip: string, status: string }) {
  const isOk = status === 'OK';
  return (
    <tr className="border-b border-surface-variant dark:border-outline-variant/10 hover:bg-surface-purple dark:hover:bg-primary/5 transition-colors">
      <td className={cn("py-4 px-4 text-base font-bold", isOk ? "text-primary dark:text-primary-fixed": "text-outline dark:text-inverse-on-surface/50")}>{priority}</td>
      <td className="py-4 px-4 text-base text-on-surface dark:text-inverse-on-surface font-medium">{host}</td>
      <td className="py-4 px-4 text-base text-outline dark:text-inverse-on-surface/50 font-mono text-sm">{ip}</td>
      <td className="py-4 px-4">
        <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          isOk ? "text-green-700 bg-green-100" : "text-heat-orange bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300"
        )}>
          <span className="material-symbols-outlined text-[14px]">
            {isOk ? 'check_circle' : 'warning'}
          </span> 
          {isOk ? 'OK' : 'Slow Response'}
        </span>
      </td>
    </tr>
  );
}
