import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { marked } from 'marked';
import { cn } from '../App';
import GeminiIcon from './GeminiIcon';
import { AiPanelContext } from '../contexts/AiPanel';

interface GuideFile {
  githubPath: string;
  filename: string;
  section: string;
  rawUrl: string;
  isSynced: boolean;
  sha: string;
  lastSyncedAt: string;
}

function isExternalLink(href: string): boolean {
  if (!href.startsWith('http://') && !href.startsWith('https://')) return false;
  try {
    const { hostname, pathname } = new URL(href);
    if ((hostname === 'braze.com' || hostname === 'www.braze.com') && pathname.startsWith('/docs/')) return false;
  } catch {}
  return true;
}

function resolveInternalLink(href: string, files: GuideFile[]): GuideFile | null {
  let path = href.split('#')[0];
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try { path = new URL(path).pathname; } catch {}
  }
  const segments = path.replace(/\/$/, '').split('/').filter(Boolean);
  if (!segments.length) return null;

  const norm = (s: string) => s.toLowerCase().replace(/[-_]/g, '');
  const last = norm(segments[segments.length - 1]);
  const parent = segments.length > 1 ? norm(segments[segments.length - 2]) : null;

  const candidates = files.filter(f => norm(f.filename.replace(/\.md$/i, '')) === last);
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1 && parent) {
    const refined = candidates.find(f =>
      f.githubPath.toLowerCase().split('/').some(s => norm(s) === parent)
    );
    return refined ?? candidates[0];
  }
  return files.find(f =>
    f.githubPath.toLowerCase().split('/').some(s => norm(s.replace(/\.md$/i, '')) === last)
  ) ?? null;
}

const getBreadcrumbs = (path: string) => {
  let clean = path;
  if (clean.startsWith('docs/User Guide/')) {
    clean = clean.slice('docs/User Guide/'.length);
  } else if (clean.startsWith('docs/')) {
    clean = clean.slice('docs/'.length);
  }
  
  clean = clean.replace(/\/?(index|overview)?\.md$/i, '');
  
  const parts = clean.split('/').filter(p => p.trim() !== '');
  if (parts.length === 0) return ['User Guide'];
  
  const specialMappings: Record<string, string> = {
    'faq': 'FAQ',
    'sso': 'SSO',
    'saml': 'SAML',
    'dns': 'DNS',
    'spf': 'SPF',
    'dkim': 'DKIM',
    'dmarc': 'DMARC',
    'drag and drop editor': 'Drag-and-drop editor',
    'content cards': 'Content Cards',
    'sms': 'SMS'
  };

  return ['User Guide', ...parts.map(part => {
    let label = part.replace(/[-_]/g, ' ');
    const lowerKey = label.toLowerCase().trim();
    if (specialMappings[lowerKey]) {
      return specialMappings[lowerKey];
    }
    return label.replace(/\b\w/g, c => c.toUpperCase());
  })];
};

const getDocTitle = (file: GuideFile) => {
  const baseName = file.filename.replace(/\.md$/i, '');
  const pathParts = file.githubPath.split('/').filter(Boolean);
  const toTitle = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  return baseName.toLowerCase() === 'index' && pathParts.length >= 2
    ? toTitle(pathParts[pathParts.length - 2])
    : toTitle(baseName);
};

const parseMarkdownIntoSections = (markdownText: string) => {
  const lines = markdownText.split('\n');
  const sections: { title: string; level: number; content: string }[] = [];
  
  let currentTitle = '';
  let currentLevel = 0;
  let currentLines: string[] = [];
  let inCodeBlock = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }
    
    const headingMatch = !inCodeBlock ? line.match(/^(#{1,3})\s+(.*)$/) : null;
    
    if (headingMatch) {
      if (currentLines.length > 0 || currentTitle) {
        sections.push({
          title: currentTitle,
          level: currentLevel,
          content: currentLines.join('\n')
        });
      }
      currentLevel = headingMatch[1].length;
      currentTitle = headingMatch[2].replace(/[#\s]+$/, '').trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  
  if (currentLines.length > 0 || currentTitle) {
    sections.push({
      title: currentTitle,
      level: currentLevel,
      content: currentLines.join('\n')
    });
  }
  
  if (sections.length === 0) {
    sections.push({
      title: '',
      level: 0,
      content: markdownText
    });
  }
  
  return sections;
};

interface UserGuideCenterProps {
  selectedFile: GuideFile | null;
  onSelectFile: (file: GuideFile | null) => void;
  files: GuideFile[];
  onRefresh: () => void;
}

export default function UserGuideCenter({ selectedFile, onSelectFile, files, onRefresh }: UserGuideCenterProps) {
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Navigation history for back button (only populated by internal link clicks, not sidebar)
  const [navHistory, setNavHistory] = useState<GuideFile[]>([]);
  const navigationSource = useRef<'link' | 'back' | null>(null);

  // Detect external navigation (sidebar clicks) and clear history
  useEffect(() => {
    const src = navigationSource.current;
    navigationSource.current = null;
    if (src === null) {
      // File changed from outside (sidebar) — clear history
      setNavHistory([]);
    }
  }, [selectedFile?.githubPath]);

  const handleBack = () => {
    const prev = navHistory[navHistory.length - 1];
    if (!prev) return;
    navigationSource.current = 'back';
    setNavHistory(h => h.slice(0, -1));
    onSelectFile(prev);
  };

  const { openPanel: openAiPanel, openPill, setScreenContext } = useContext(AiPanelContext);

  // Custom states matching requested doc view formatting & interaction
  const [isRawMarkdown, setIsRawMarkdown] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleBreadcrumbClick = (clickedIndex: number) => {
    if (!selectedFile) return;
    if (clickedIndex === 0) {
      // Root breadcrumb → Get Started landing page.
      const getStarted = files.find(f => f.githubPath.toLowerCase() === 'docs/user guide/get_started/index.md')
        ?? files.find(f => f.section === 'get_started' && /index\.md$/i.test(f.filename));
      if (getStarted) onSelectFile(getStarted);
      return;
    }

    let clean = selectedFile.githubPath;
    const pathPrefix = clean.startsWith('docs/User Guide/') ? 'docs/User Guide/'
      : clean.startsWith('docs/') ? 'docs/'
      : '';
    clean = pathPrefix ? clean.slice(pathPrefix.length) : clean;
    const fullParts = clean.split('/').filter(p => p.trim() !== '');

    // The clicked segment index corresponds to fullParts[clickedIndex - 1] since index 0 is "User Guide"
    if (clickedIndex - 1 >= fullParts.length) return;

    const targetSubParts = fullParts.slice(0, clickedIndex);
    const targetPrefix = pathPrefix + targetSubParts.join('/');
    const targetLc = targetPrefix.toLowerCase();

    // Prefer the EXACT folder index for this breadcrumb level. (A plain
    // startsWith match wrongly returns the first nested child index — often the
    // page you're already on — so the breadcrumb appears to do nothing.)
    let match = files.find(f =>
      f.githubPath.toLowerCase() === targetLc + '/index.md' ||
      f.githubPath.toLowerCase() === targetLc + '/overview.md'
    );

    // Next best: any index/overview directly under this folder.
    if (!match) {
      match = files.find(f =>
        f.githubPath.toLowerCase().startsWith(targetLc + '/') &&
        (f.filename.toLowerCase() === 'index.md' || f.filename.toLowerCase() === 'overview.md')
      );
    }

    // Fallback search: starts with targetPrefix
    if (!match) {
      match = files.find(f => f.githubPath.toLowerCase().startsWith(targetLc + '/'));
    }

    if (!match) {
      match = files.find(f => f.githubPath.toLowerCase().includes('/' + targetSubParts[targetSubParts.length - 1].toLowerCase() + '/'));
    }

    if (match) {
      onSelectFile(match);
      // We can also trigger storage sync to let UserGuideView expand it
      try {
        const sectionName = match.section;
        const savedCategories = localStorage.getItem('edq_guide_expanded_categories');
        const categories = savedCategories ? JSON.parse(savedCategories) : {};
        // Find category key associated with this section
        const categoryKeys: Record<string, string> = {
          'get_started': 'get_started', 'root': 'get_started',
          'administer': 'administer',
          'data': 'data',
          'audience': 'audience',
          'messaging': 'messaging',
          'channels': 'channels',
          'analytics': 'analytics',
          'brazeai': 'brazeai', 'braze_ai': 'brazeai'
        };
        const catKey = categoryKeys[sectionName];
        if (catKey) {
          categories[catKey] = true;
          localStorage.setItem('edq_guide_expanded_categories', JSON.stringify(categories));
        }
      } catch (err) {}
    }
  };

  const handleCopyContent = () => {
    if (!docContent) return;
    navigator.clipboard.writeText(docContent);
    setShowCopyNotification(true);
    setTimeout(() => {
      setShowCopyNotification(false);
    }, 2000);
  };
  
  // Doc Viewer state
  const [docContent, setDocContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Syncing states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<string>('');
  const [syncLogsVisible, setSyncLogsVisible] = useState(false);

  // Stats
  const syncedCount = files.filter(f => f.isSynced).length;
  const totalCount = files.length;
  const syncProgress = totalCount ? Math.round((syncedCount / totalCount) * 100) : 0;

  // Load content whenever selected file changes
  useEffect(() => {
    if (selectedFile) {
      setIsLoadingContent(true);
      setContentError(null);

      if (selectedFile.isSynced) {
        fetch(`/api/user-guide/content?path=${encodeURIComponent(selectedFile.githubPath)}`)
          .then(res => {
            if (!res.ok) throw new Error("Failed to load cached content. Triggering raw sync...");
            return res.json();
          })
          .then(data => {
            setDocContent(data.content || '');
            setIsLoadingContent(false);
          })
          .catch(err => {
            console.log("Cached load failed or file missing, attempting on-demand raw direct sync:", err.message);
            fetch('/api/user-guide/sync-single', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: selectedFile.githubPath })
            })
              .then(syncRes => {
                if (!syncRes.ok) throw new Error("Failed to download raw document content from GitHub.");
                return syncRes.json();
              })
              .then(syncData => {
                setDocContent(syncData.content || '');
                setIsLoadingContent(false);
                onRefresh();
              })
              .catch(syncErr => {
                console.error(syncErr);
                setDocContent('');
                setContentError(syncErr.message);
                setIsLoadingContent(false);
              });
          });
      } else {
        // If file is not synced, perform seamless auto-sync on selection!
        fetch('/api/user-guide/sync-single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: selectedFile.githubPath })
        })
          .then(res => {
            if (!res.ok) throw new Error("Failed to download document content from raw GitHub.");
            return res.json();
          })
          .then(data => {
            setDocContent(data.content || '');
            setIsLoadingContent(false);
            onRefresh();
          })
          .catch(err => {
            console.error(err);
            setDocContent('');
            setContentError(err.message);
            setIsLoadingContent(false);
          });
      }
    }
  }, [selectedFile]);

  // Publish the current article to Gemini so its context + suggestions track the screen.
  useEffect(() => {
    if (!selectedFile) {
      setScreenContext({
        view: 'user_guide', kind: 'guide', title: 'User Guide',
        suggestions: [
          'How do I configure email authentication in Braze?',
          'What are Braze Canvas best practices?',
          'How do Content Cards differ from in-app messages?',
        ],
      });
      return;
    }
    const title = getDocTitle(selectedFile);
    setScreenContext({
      view: 'user_guide', kind: 'guide',
      title,
      subtitle: 'User Guide Article',
      raw: docContent ? docContent.slice(0, 3000) : undefined,
      suggestions: [
        'Summarize this article',
        'What are the key concepts here?',
        'Walk me through the basics',
      ],
    });
  }, [selectedFile, docContent, setScreenContext]);

  // Intercept clicks on rendered markdown links
  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      e.preventDefault();

      if (isExternalLink(href)) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        const file = resolveInternalLink(href, files);
        if (file) {
          navigationSource.current = 'link';
          setNavHistory(prev => selectedFile ? [...prev, selectedFile] : prev);
          onSelectFile(file);
        } else {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [files, onSelectFile, selectedFile]);

  // Helper trigger sync script
  const triggerSync = async () => {
    setIsSyncing(true);
    setSyncLog('Starting read-only Python Sync Agent: python sync_user_guide.py...\nConnecting to public GitHub API tree...\n');
    setSyncLogsVisible(true);

    try {
      const res = await fetch('/api/user-guide/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncLog(prev => prev + `\n--- PROCESS OUTPUT ---\n${data.stdout || ""}\nSync completed successfully!\n`);
        onRefresh();
      } else {
        setSyncLog(prev => prev + `\n--- RUNTIME ERROR ---\n${data.error || "Process failed."}\nStderr: ${data.stderr || ""}\nStdout: ${data.stdout || ""}\n`);
      }
    } catch (e: any) {
      setSyncLog(prev => prev + `\nFailed to spawn python sync environment: ${e.message}\n`);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncSingleFile = async (githubPath: string) => {
    setIsSyncing(true);
    setSyncLog(`Running fast sync download for: ${githubPath} from raw GitHub...\n`);
    setSyncLogsVisible(true);

    try {
      const res = await fetch('/api/user-guide/sync-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: githubPath })
      });
      if (res.ok) {
        const data = await res.json();
        setDocContent(data.content || '');
        setSyncLog(prev => prev + `\nSuccessfully downloaded and written locally to disk!\nUpdating index...\n`);
        onRefresh();
        setTimeout(() => {
          onSelectFile({
            ...selectedFile!,
            isSynced: true
          });
        }, 500);
      } else {
        const errData = await res.json();
        setSyncLog(prev => prev + `\nError syncing file on demand: ${errData.error || 'Server error'}\n`);
      }
    } catch (err: any) {
      console.error(err);
      setSyncLog(prev => prev + `\nNetwork error syncing file: ${err.message}\n`);
    } finally {
      setIsSyncing(false);
    }
  };

  const preprocessMarkdown = (text: string): string => {
    return text
      // Strip Kramdown inline attribute lists: {: .class}, {: style="..."}, {:.foo}, etc.
      .replace(/\{:[^}\n]*\}/g, '')
      // Strip Liquid block tags: {% ... %}
      .replace(/\{%-?\s[\s\S]*?-?%\}/g, '')
      // Strip Liquid output tags: {{ ... }}
      .replace(/\{\{[^}]*\}\}/g, '')
      // Collapse runs of spaces left behind (but not newlines)
      .replace(/[ \t]{2,}/g, ' ');
  };

  const getCleanMarkdownHtml = (text: string) => {
    try {
      return { __html: marked(preprocessMarkdown(text), { async: false }) as string };
    } catch (_) {
      return { __html: `<p class="whitespace-pre-wrap">${text}</p>` };
    }
  };

  const handleAskGemini = () => {
    if (!selectedFile) return;
    const title = getDocTitle(selectedFile);
    const articleText = docContent ?? '';
    const contentSnippet = articleText ? articleText.slice(0, 4000) : '';
    const richPrompt = [
      `Please provide a clear, structured response for the article titled "${title}".`,
      `Your response should include:`,
      `1. **Summary** — A concise 2–3 sentence overview of what this article covers and why it matters.`,
      `2. **Key Best Practices** — Bullet-point list of the most actionable takeaways and recommendations from the article.`,
      `3. **Common Pitfalls** — Brief callout of any warnings or things to avoid that the article highlights.`,
      contentSnippet ? `\n\nArticle content for grounding:\n${contentSnippet}` : '',
    ].join('\n');
    // Fire the rich prompt directly into the pill chat; only the article title shows in the bubble
    openPill(richPrompt, title);
  };

  // Scroll detection for sticky compact header
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 30);
    };

    setIsScrolled(false);
    container.scrollTop = 0;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedFile]);

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden relative fade-in bg-white dark:bg-[#151419]">
      {selectedFile ? (
        <div ref={contentContainerRef} className="flex-1 overflow-y-auto custom-scrollbar select-text relative">
          
          {/* Header / Breadcrumbs & Title Block — Sticky & Compact on Scroll */}
          <div 
            className={cn(
              "sticky top-0 z-30 w-full transition-all duration-300 select-none",
              isScrolled 
                ? "bg-white/95 dark:bg-[#151419]/95 backdrop-blur-md border-b border-neutral-200/60 dark:border-outline-variant/15 shadow-xs py-2 px-6" 
                : "bg-white dark:bg-[#151419] py-8 px-6 md:px-10"
            )}
          >
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
              {/* Breadcrumbs — always visible */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-neutral-400 dark:text-inverse-on-surface/50">
                {getBreadcrumbs(selectedFile.githubPath).map((part, index, arr) => (
                  <React.Fragment key={index}>
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className={cn(
                        "text-[11px] font-bold transition-all text-left cursor-pointer",
                        index === arr.length - 1
                          ? "text-primary dark:text-primary-fixed font-black cursor-default pointer-events-none"
                          : "text-neutral-400 dark:text-inverse-on-surface/50 font-semibold hover:text-[#1A73E8] dark:hover:text-[#D2E3FC] hover:underline"
                      )}
                    >
                      {part}
                    </button>
                    {index < arr.length - 1 && (
                      <span className="material-symbols-outlined text-[12px] text-neutral-300">chevron_right</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Title & Toolbar Row - switches layout based on scroll */}
              <div className={cn(
                "flex transition-all duration-300 gap-3",
                isScrolled ? "flex-row items-center justify-between gap-8" : "flex-col"
              )}>
                {/* Title */}
                <h1 className={cn(
                  "font-black text-on-surface dark:text-inverse-on-surface tracking-tight m-0 leading-tight transition-all duration-300",
                  isScrolled ? "text-xl md:text-2xl truncate max-w-[280px] md:max-w-[420px]" : "text-4xl md:text-5xl"
                )}>
                  {getBreadcrumbs(selectedFile.githubPath)[getBreadcrumbs(selectedFile.githubPath).length - 1]}
                </h1>

                {/* Action Toolbar — tonal pill buttons with no dividers */}
                <div className="flex items-center gap-2 shrink-0 w-fit">
                  {/* Copy for LLM — light blue tonal */}
                  <button
                    onClick={handleCopyContent}
                    className="relative flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-[600] transition-all select-none whitespace-nowrap shrink-0 bg-[#E8F0FE] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#D2E3FC] hover:bg-[#D2E3FC] dark:hover:bg-[#1A73E8]/30 active:scale-[0.97] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>content_copy</span>
                    <span>Copy for LLM</span>
                    <AnimatePresence>
                      {showCopyNotification && (
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-9 left-1/2 -translate-x-1/2 p-1.5 px-2.5 bg-neutral-950 text-white rounded text-[10px] font-black z-50 shadow-md flex items-center gap-1 whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-[12px] text-emerald-400">check_circle</span>
                          Raw Content Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* View as Markdown — light blue tonal */}
                  <button
                    onClick={() => setIsRawMarkdown(!isRawMarkdown)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-[600] transition-all select-none whitespace-nowrap shrink-0 active:scale-[0.97] cursor-pointer",
                      isRawMarkdown
                        ? "bg-[#1A73E8] dark:bg-[#8AB4F8] text-white dark:text-[#202124] hover:bg-[#1557B0] dark:hover:bg-[#93B9FA]"
                        : "bg-[#E8F0FE] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#D2E3FC] hover:bg-[#D2E3FC] dark:hover:bg-[#1A73E8]/30"
                    )}
                  >
                    <span
                      className="material-symbols-outlined text-[15px]"
                      style={{ fontVariationSettings: isRawMarkdown ? "'FILL' 1" : "" }}
                    >code</span>
                    <span>{isRawMarkdown ? "View Rendered" : "View as Markdown"}</span>
                  </button>

                  {/* Ask Gemini — light blue tonal */}
                  <button
                    onClick={handleAskGemini}
                    className="relative flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-[600] transition-all select-none whitespace-nowrap shrink-0 bg-[#E8F0FE] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#D2E3FC] hover:bg-[#D2E3FC] dark:hover:bg-[#1A73E8]/30 active:scale-[0.97] cursor-pointer"
                  >
                    <GeminiIcon className="w-[15px] h-[15px]" />
                    <span>Ask Gemini</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto w-full px-6 pb-16 pt-4 flex flex-col gap-6">
              {isLoadingContent ? (
                <div className="py-32 text-center flex flex-col items-center justify-center gap-3 select-none">
                  <span className="animate-spin material-symbols-outlined text-primary text-[32px]">progress_activity</span>
                  <span className="text-xs font-bold text-on-surface-variant font-mono">Loading document content...</span>
                </div>
              ) : contentError ? (
                <div className="py-16 text-center max-w-sm mx-auto flex flex-col items-center justify-center gap-4 border border-outline-variant/20 rounded-3xl p-6 bg-[#FAF9FC] dark:bg-white/5 select-none">
                  <span className="material-symbols-outlined text-amber-600 text-[36px]">warning</span>
                  <p className="text-xs font-bold text-on-surface dark:text-inverse-on-surface">{contentError}</p>
                  {!selectedFile.isSynced && (
                    <button
                      onClick={() => syncSingleFile(selectedFile.githubPath)}
                      disabled={isSyncing}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                    >
                      Download & Index Document Now
                    </button>
                  )}
                </div>
              ) : isRawMarkdown ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 select-none">
                    <span className="text-xs font-bold text-on-surface-variant font-mono">Raw Markdown Viewer</span>
                    <button
                      onClick={() => setIsRawMarkdown(false)}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[11px] font-black rounded-lg transition-all cursor-pointer"
                    >
                      Switch to Rendered
                    </button>
                  </div>
                  <pre className="font-mono text-xs p-5 bg-neutral-900 text-neutral-100 rounded-3xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px] custom-scrollbar shadow-inner select-text">
                    {docContent}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {parseMarkdownIntoSections(docContent).map((section, idx) => (
                    <div key={idx} className="flex flex-col">
                      {section.title && (
                        <div className="pt-6 pb-2.5 flex items-center gap-3 border-b border-outline-variant/15 mb-4 select-none">
                          <span className={cn(
                            "w-1.5 h-6 rounded-full",
                            section.level === 1 ? "bg-[#1A73E8]" : "bg-primary/50"
                          )}></span>
                          <h2 className={cn(
                            "font-black text-on-surface dark:text-inverse-on-surface tracking-tight m-0",
                            section.level === 1 ? "text-xl md:text-2xl text-[#212123] dark:text-white" : section.level === 2 ? "text-lg text-[#212123] dark:text-white" : "text-sm md:text-base font-bold text-[#212123] dark:text-white"
                          )}>
                            {section.title}
                          </h2>
                        </div>
                      )}
                      <div className="py-2">
                        <div 
                          className="prose dark:prose-invert max-w-none text-[13.5px] text-on-surface dark:text-inverse-on-surface markdown-style leading-relaxed"
                          dangerouslySetInnerHTML={getCleanMarkdownHtml(section.content)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      ) : (
        <div className="py-32 text-center max-w-md mx-auto flex flex-col items-center justify-center gap-4 select-none">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-[28px]">chrome_reader_mode</span>
          </div>
          <h3 className="text-sm font-black text-on-surface dark:text-inverse-on-surface font-mono">Loading guide index...</h3>
        </div>
      )}

      {/* Floating Back navigation bar — shown only when navigated via internal link */}
      <AnimatePresence>
        {navHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <button
              onClick={handleBack}
              className="pointer-events-auto flex items-center gap-2 pl-4 pr-5 py-2.5 bg-white dark:bg-[#1E1D22] rounded-full shadow-2xl border border-outline-variant/20 dark:border-outline-variant/15 text-sm font-bold text-on-surface dark:text-inverse-on-surface hover:bg-[#E8F0FE] dark:hover:bg-[#1A73E8]/20 hover:text-[#1A73E8] dark:hover:text-[#D2E3FC] transition-all select-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}