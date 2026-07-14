import React, { useState, useEffect, ReactNode } from 'react';

class ErrorBoundary extends React.Component<{ children: ReactNode }, { error: string | null }> {
  declare props: { children: ReactNode };
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message + '\n' + e.stack }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'red' }}>
        <strong>UserGuideView crashed:</strong>{'\n'}{this.state.error}
      </div>
    );
    return this.props.children;
  }
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "motion/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import Layout from './components/Layout';
import AtAGlance from './views/AtAGlance';
import ChartsOverview from './views/ChartsOverview';
import Investigation from './views/Investigation';
import Tools from './views/Tools';
import UserGuideView from './views/UserGuideView';
import SettingsView from './views/Settings';

export type ViewType = 'glance' | 'charts' | 'investigation' | 'tools' | 'user_guide' | 'settings';

function parseUrl() {
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  
  let view: ViewType = 'glance';
  let ticketId: string | null = null;
  let tab: 'dig' | 'mx' | 'analyzer' | 'ip_warming' = 'dig';
  let section = 'Overview';
  
  if (parts[0] === 'overview') {
    view = 'glance';
  } else if (parts[0] === 'tickets') {
    view = 'investigation';
    if (parts[1]) {
      ticketId = parts[1];
    }
    if (parts[2]) {
      const s = parts[2].toLowerCase();
      if (s === 'overview') section = 'Overview';
      else if (s === 'authentication') section = 'Authentication';
      else if (s === 'deliverability') section = 'Deliverability';
      else if (s === 'email-performance' || s === 'email_performance' || s === 'performance') section = 'Email Performance';
      else if (s === 'support-history' || s === 'support_history') section = 'Support History';
    }
  } else if (parts[0] === 'tools') {
    view = 'tools';
    if (parts[1]) {
      const t = parts[1].toLowerCase();
      if (t === 'dig') tab = 'dig';
      else if (t === 'mx') tab = 'mx';
      else if (t === 'analyzer') tab = 'analyzer';
      else if (t === 'ip-warming' || t === 'ip_warming') tab = 'ip_warming';
    }
  } else if (parts[0] === 'user-guide' || parts[0] === 'user_guide') {
    view = 'user_guide';
  } else if (parts[0] === 'settings') {
    view = 'settings';
  }
  
  return { view, ticketId, tab, section };
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>(() => parseUrl().view);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string>(() => parseUrl().section);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(() => parseUrl().ticketId);
  const [toolsTab, setToolsTab] = useState<'dig' | 'mx' | 'analyzer' | 'ip_warming'>(() => parseUrl().tab);
  const [isTicketPanelOpen, setIsTicketPanelOpen] = useState(true);
  // Suggested-article jump: which doc to open + the view to return to.
  const [guideJump, setGuideJump] = useState<{ path: string; returnView: ViewType } | null>(null);

  const openGuideArticle = (githubPath: string) => {
    setGuideJump(prev => ({
      path: githubPath,
      // If already on User Guide, preserve the original returnView so Back still
      // works; otherwise capture the current view as the destination to return to.
      returnView: currentView === 'user_guide' ? (prev?.returnView ?? 'glance') : currentView,
    }));
    setCurrentView('user_guide');
  };

  // Lifted Layout settings states
  const [hudCompact, setHudCompact] = useState<boolean>(() => {
    try { return localStorage.getItem('edq_hud_compact') === 'true'; } catch { return false; }
  });
  const [inboxType, setInboxType] = useState<string>(() => {
    try { return localStorage.getItem('edq_inbox_type') || 'default'; } catch { return 'default'; }
  });
  const [paneOption, setPaneOption] = useState<string>(() => {
    try { return localStorage.getItem('edq_pane_option') || 'right'; } catch { return 'right'; }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Keep-alive: ping server every 10 s so it knows the tab is open.
  // Server shuts itself down 30 s after the last ping (tab closed / navigated away).
  useEffect(() => {
    const ping = () => fetch('/api/heartbeat', { method: 'POST' }).catch(() => {});
    ping();
    const id = setInterval(ping, 10_000);
    return () => clearInterval(id);
  }, []);

  // Drop the article-jump (and its back button) once the user leaves the guide.
  useEffect(() => {
    if (currentView !== 'user_guide') setGuideJump(null);
  }, [currentView]);

  // Sync state changes to browser URL path to keep position on refreshes
  useEffect(() => {
    let targetPath = '/overview';
    if (currentView === 'glance') {
      targetPath = '/overview';
    } else if (currentView === 'investigation') {
      if (selectedTicketId) {
        let sectionSlug = 'overview';
        const s = activeSection.toLowerCase();
        if (s === 'overview') sectionSlug = 'overview';
        else if (s === 'authentication') sectionSlug = 'authentication';
        else if (s === 'deliverability') sectionSlug = 'deliverability';
        else if (s.includes('performance')) sectionSlug = 'email-performance';
        else if (s.includes('history')) sectionSlug = 'support-history';
        
        targetPath = `/tickets/${selectedTicketId}/${sectionSlug}`;
      } else {
        targetPath = '/tickets';
      }
    } else if (currentView === 'tools') {
      let toolSlug = 'dig/google-dig';
      if (toolsTab === 'dig') toolSlug = 'dig/google-dig';
      else if (toolsTab === 'mx') toolSlug = 'mx/mx-toolbox';
      else if (toolsTab === 'analyzer') toolSlug = 'analyzer/message-header-analyzer';
      else if (toolsTab === 'ip_warming') toolSlug = 'ip-warming/ip-warming-planner';
      
      targetPath = `/tools/${toolSlug}`;
    } else if (currentView === 'user_guide') {
      targetPath = '/user-guide';
    } else if (currentView === 'settings') {
      targetPath = '/settings';
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [currentView, selectedTicketId, toolsTab, activeSection]);

  // Listen to popstate event (browser back/forward button clicks)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrl();
      setCurrentView(parsed.view);
      setSelectedTicketId(parsed.ticketId);
      setToolsTab(parsed.tab);
      setActiveSection(parsed.section);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global scrollbar inactivity tracking (1s timeout)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const activate = () => {
      document.documentElement.classList.add('sb-active');
      clearTimeout(timer);
      timer = setTimeout(() => {
        document.documentElement.classList.remove('sb-active');
      }, 1000);
    };

    // Show scrollbars initially on mount
    activate();

    const evs = ['scroll', 'wheel', 'mousedown', 'keydown', 'touchstart'];
    evs.forEach(e => window.addEventListener(e, activate, { passive: true }));
    return () => {
      clearTimeout(timer);
      evs.forEach(e => window.removeEventListener(e, activate));
    };
  }, []);


  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const renderView = () => {
    switch (currentView) {
      case 'glance': return <AtAGlance onNavigate={setCurrentView} setGlobalSearch={setGlobalSearch} onOpenTicket={(caseNumber) => {
        setSelectedTicketId(caseNumber);
        setActiveSection('Overview');
        setCurrentView('investigation');
      }} />;
      case 'charts': return <ChartsOverview />;
      case 'investigation': return (
        <Investigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
          onOpenTicketPanel={() => setIsTicketPanelOpen(true)}
          onNavigateView={setCurrentView}
        />
      );
      case 'tools': return <Tools activeTab={toolsTab} onTabChange={setToolsTab} />;
      case 'user_guide': return (
        <ErrorBoundary>
          <UserGuideView
            jumpPath={guideJump?.path ?? null}
            returnView={guideJump?.returnView ?? null}
            onReturn={() => {
              const back = guideJump?.returnView ?? 'glance';
              setGuideJump(null);
              setCurrentView(back);
            }}
            onConsumeJump={() => setGuideJump(prev => (prev ? { ...prev, path: '' } : prev))}
          />
        </ErrorBoundary>
      );
      case 'settings': return (
        <SettingsView
          onNavigate={setCurrentView}
        />
      );
      default: return (
        <Investigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
          onOpenTicketPanel={() => setIsTicketPanelOpen(true)}
          onNavigateView={setCurrentView}
        />
      );
    }
  };

  return (
    <div className={cn("min-h-screen w-full flex flex-col font-sans transition-colors duration-300", isDarkMode ? "dark bg-surface-dim text-on-surface" : "bg-background text-on-surface")}>
      <Layout
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenGuideArticle={openGuideArticle}
        toggleTheme={toggleDarkMode}
        isDark={isDarkMode}
        globalSearch={globalSearch}
        onSearchChange={setGlobalSearch}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        selectedTicketId={selectedTicketId}
        onSelectTicket={setSelectedTicketId}
        toolsTab={toolsTab}
        onToolsTabChange={setToolsTab}
        isTicketPanelOpen={isTicketPanelOpen}
        setIsTicketPanelOpen={setIsTicketPanelOpen}
        hudCompact={hudCompact}
        setHudCompact={(v) => {
          setHudCompact(v);
          try { localStorage.setItem('edq_hud_compact', String(v)); } catch {}
        }}
        inboxType={inboxType}
        setInboxType={(v) => {
          setInboxType(v);
          try { localStorage.setItem('edq_inbox_type', v); } catch {}
        }}
        paneOption={paneOption}
        setPaneOption={(v) => {
          setPaneOption(v);
          try { localStorage.setItem('edq_pane_option', v); } catch {}
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={(currentView === 'investigation' || currentView === 'user_guide' || currentView === 'settings') ? "flex-1 h-full w-full" : "w-full min-h-full"}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </div>
  );
}
