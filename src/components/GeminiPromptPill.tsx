import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { marked } from 'marked';
import { cn } from '../App';
import GeminiIcon from './GeminiIcon';
import { ChatSparkIcon, DocSparkIcon } from './SparkIcons';
import MarkdownContent from './MarkdownContent';
import type { AppAction, ChatMessage, GuideArticle } from './AiPanel';
import type { ScreenContext } from '../contexts/AiPanel';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';

type Format = 'Standard' | 'Shorter' | 'Expand' | 'Data +';

export interface ContextChip { label: string; content: string; scope?: string; }

export type GeminiSearchItem = {
  type: 'ticket' | 'guide' | 'nav';
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  icon: string;
};

interface ChatEntry {
  type: 'user' | 'assistant';
  text: string;
  /** Display-only label shown in the bubble instead of `text` (hides verbose prompts). */
  displayText?: string;
  edited?: boolean;
  chips?: ContextChip[];
  articles?: GuideArticle[];
  actions?: AppAction[];
  // Continuity suggestions: secondary pinned panels the model set aside, surfaced
  // as clickable pills so the agent can dig into each without retyping.
  followups?: ContextChip[];
}

interface ConvSummary { id: string; title: string; timestamp: string; preview: string; source: string; }

const SETTINGS_ACTION: AppAction = {
  id: 'open-settings',
  label: 'Settings',
  description: 'Adjust app and Gemini configuration.',
  icon: 'settings',
  view: 'settings',
};

function ensureLocalAppActions(content: string, actions: AppAction[] = []) {
  const next = [...actions];
  if (/\b(gemini api|api key|disabled in settings|enable it to chat|not configured|\.env)\b/i.test(content)
    && !next.some(item => item.id === SETTINGS_ACTION.id)) {
    next.push(SETTINGS_ACTION);
  }
  return next;
}

interface GeminiPromptPillProps {
  isAiPanelOpen: boolean;
  onOpenAiPanel: (seedMessages?: ChatMessage[], pendingQuery?: string, pendingQueryDisplay?: string) => void;
  isDark: boolean;
  currentView: string;
  selectorActive: boolean;
  onSelectorToggle: (v: boolean) => void;
  pendingChip: ContextChip | null;
  onChipConsumed: () => void;
  screenContext: ScreenContext | null;
  onOpenArticle?: (githubPath: string) => void;
  panelChatHistory?: ChatMessage[];
  panelIsLoading?: boolean;
  panelActiveChips?: Array<{ label: string; content: string }>;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  searchResults?: GeminiSearchItem[];
  onSelectSearchResult?: (item: GeminiSearchItem, source?: 'result' | 'suggestion') => void;
  onRunAction?: (action: AppAction) => void;
  pageScrolling?: boolean;
  /** When set, opens the pill chat and fires this as the initial query. */
  pendingPillQuery?: string;
  /** Display-only label for the pending pill query bubble. */
  pendingPillQueryDisplay?: string;
  onPendingPillQueryConsumed?: () => void;
  highlightedContext?: { text: string; domContext: string } | null;
}

const FORMAT_OPTIONS: Format[] = ['Standard', 'Shorter', 'Expand', 'Data +'];

const FORMAT_INSTRUCTIONS: Record<Format, string> = {
  'Standard': '',
  'Shorter': 'Be concise — answer in 2-3 sentences maximum. ',
  'Expand': 'Expand the context and provide technical detail — include exact values, commands, and supporting specifics. ',
  'Data +': 'Lead with key metrics and data points before explaining. Include specific numbers where available. ',
};

const SUGGESTED_PROMPTS = [
  'When should I move a domain from p=quarantine to p=reject?',
  'What SPF record patterns trigger PermError at Gmail?',
  "How do I read Microsoft's SNDS data for an IP?",
];

const THINKING_WORDS = ['Let me check 👀', 'Cooking', 'Drafting ✏️', 'Final touches'];
const THINKING_STEP_MS = 3000;

function ThinkingStatus({ className, startTime }: { className?: string; startTime: number }) {
  const getIdx = () => Math.min(Math.floor((Date.now() - startTime) / THINKING_STEP_MS), THINKING_WORDS.length - 1);
  const [i, setI] = useState(getIdx);
  useEffect(() => {
    const elapsed = Date.now() - startTime;
    const cur = Math.min(Math.floor(elapsed / THINKING_STEP_MS), THINKING_WORDS.length - 1);
    setI(cur);
    const timers = THINKING_WORDS.slice(cur + 1).map((_, rel) => {
      const targetIdx = cur + 1 + rel;
      const delay = THINKING_STEP_MS * targetIdx - elapsed;
      return setTimeout(() => setI(targetIdx), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, [startTime]);
  return (
    <div className={cn('h-4 overflow-hidden', className)}>
      <span key={i} className="gemini-think-word block text-[11px] font-medium">{THINKING_WORDS[i]}</span>
    </div>
  );
}

marked.setOptions({ gfm: true, breaks: true });
function mdToHtml(md: string) { return { __html: marked.parse(md) as string }; }

function serializeScreenContext(ctx: ScreenContext | null): string {
  if (!ctx) return '';
  const lines: string[] = [];
  const viewLabel = ctx.kind === 'ticket' ? 'Support ticket'
    : ctx.kind === 'tool' ? 'Diagnostic tool'
    : ctx.kind === 'guide' ? 'User Guide article' : 'Dashboard';
  lines.push(`Currently viewing: ${viewLabel}`);
  lines.push(`Title: ${ctx.title}`);
  if (ctx.subtitle) lines.push(`Reference: ${ctx.subtitle}`);
  if (ctx.issue) lines.push(`Issue: ${ctx.issue}`);
  if (ctx.rca) lines.push(`Root cause summary: ${ctx.rca}`);
  if (ctx.data?.length) {
    lines.push('Metrics on screen:');
    ctx.data.forEach(d => {
      const dir = d.trend === 'up' ? ' (trending up)' : d.trend === 'down' ? ' (trending down)' : '';
      lines.push(`  - ${d.label}: ${d.value}${dir}`);
    });
  }
  if (ctx.raw) lines.push(`\nArticle/content excerpt:\n${ctx.raw}`);
  return lines.join('\n');
}

export default function GeminiPromptPill({
  isAiPanelOpen,
  onOpenAiPanel,
  isDark,
  currentView,
  selectorActive,
  onSelectorToggle,
  pendingChip,
  onChipConsumed,
  screenContext,
  onOpenArticle,
  panelChatHistory,
  panelIsLoading,
  panelActiveChips,
  searchQuery = '',
  onSearchQueryChange,
  searchResults = [],
  onSelectSearchResult,
  onRunAction,
  pageScrolling = false,
  pendingPillQuery,
  pendingPillQueryDisplay,
  onPendingPillQueryConsumed,
  highlightedContext,
}: GeminiPromptPillProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatHeightMode, setChatHeightMode] = useState<'default' | 'full'>('default');
  const [customChatHeight, setCustomChatHeight] = useState<number | null>(null);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const chatHeightPx = customChatHeight != null ? `${customChatHeight}px` : chatHeightMode === 'full' ? 'calc(92vh - 80px)' : 'calc(75vh - 80px)';
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState('');
  const [geminiEnabled, setGeminiEnabled] = useState(() => {
    try {
      return localStorage.getItem('edq_gemini_api_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        setGeminiEnabled(localStorage.getItem('edq_gemini_api_enabled') !== 'false');
      } catch {}
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const [chips, setChips] = useState<ContextChip[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<Format>('Standard');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [chatMinimized, setChatMinimized] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyView, setHistoryView] = useState(false);
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const conversationIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadingStartRef = useRef<number>(Date.now());
  const [pillStarters, setPillStarters] = useState<string[]>([]);
  const [pillStartersLoading, setPillStartersLoading] = useState(false);
  const [pillStartersDismissed, setPillStartersDismissed] = useState(false);
  // expandKey > 0 guards: prevents glow from playing on first mount
  const [expandKey, setExpandKey] = useState(0);
  // Pre-chat history panel (shown above pill before any chat is open)
  const [preHistoryOpen, setPreHistoryOpen] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);
  const pillWrapperRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAiOpen = useRef(isAiPanelOpen);

  const clearPillInput = () => {
    setInputText('');
    onSearchQueryChange?.('');
    if (inputRef.current) inputRef.current.innerText = '';
  };

  const updatePillInput = (value: string) => {
    setInputText(value);
    onSearchQueryChange?.(value);
  };

  useEffect(() => {
    const focusPill = () => {
      setIsExpanded(true);
      setChatOpen(false);
      setPreHistoryOpen(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    };
    window.addEventListener('edq:focus-gemini-pill', focusPill);
    return () => window.removeEventListener('edq:focus-gemini-pill', focusPill);
  }, []);

  // When the panel closes, immediately seed pill with whatever history exists
  // (may be just the user prompt mid-stream) and open the chat panel.
  // The pill will show skeleton loading while panelIsLoading remains true.
  useEffect(() => {
    if (!isAiPanelOpen && panelChatHistory && panelChatHistory.length > 0 && chatHistory.length === 0) {
      const entries: ChatEntry[] = panelChatHistory.map(m => ({
        type: m.role === 'user' ? 'user' as const : 'assistant' as const,
        text: m.content,
        displayText: m.displayContent,
        articles: m.articles,
        actions: m.actions,
        chips: m.chips?.map(c => ({ label: c.label, content: '' })),
      }));
      setChatHistory(entries);
      setChatOpen(true);
      // Restore chip selector so follow-up messages keep the same context
      if (panelActiveChips && panelActiveChips.length > 0) {
        setChips(panelActiveChips);
      }
    }
  }, [isAiPanelOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // When background generation finishes, update pill's chat with the full answer.
  // Only runs when panel is closed and pill already has a partial (user-only) history.
  useEffect(() => {
    if (!isAiPanelOpen && !panelIsLoading && panelChatHistory && panelChatHistory.length > 0) {
      const entries: ChatEntry[] = panelChatHistory.map(m => ({
        type: m.role === 'user' ? 'user' as const : 'assistant' as const,
        text: m.content,
        displayText: m.displayContent,
        articles: m.articles,
        actions: m.actions,
        chips: m.chips?.map(c => ({ label: c.label, content: '' })),
      }));
      setChatHistory(entries);
    }
  }, [panelIsLoading]); // eslint-disable-line react-hooks/exhaustive-deps
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const resizeRafRef = useRef<number | null>(null);
  const pendingResizeHeightRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (resizeRafRef.current != null) window.cancelAnimationFrame(resizeRafRef.current);
    };
  }, []);

  const snap = useRef({
    isPillHovered: false, isDropdownHovered: false,
    isFocused: false, inputText: '', chips: [] as ContextChip[],
    selectorActive: false, isDropdownOpen: false, chatOpen: false, isLoading: false, chatMinimized: false, preHistoryOpen: false, historyView: false,
  });
  useEffect(() => {
    snap.current.isFocused = isFocused;
    snap.current.inputText = inputText;
    snap.current.chips = chips;
    snap.current.selectorActive = selectorActive;
    snap.current.isDropdownOpen = isDropdownOpen;
    snap.current.chatOpen = chatOpen;
    snap.current.isLoading = isLoading;
    snap.current.chatMinimized = chatMinimized;
    snap.current.preHistoryOpen = preHistoryOpen;
    snap.current.historyView = historyView;
  });

  // Expand pill immediately when context selector activates
  useEffect(() => {
    if (selectorActive) setIsExpanded(true);
  }, [selectorActive]);

  // Re-open chat panel when pill re-expands and there's an active conversation
  useEffect(() => {
    if (isExpanded && chatHistory.length > 0 && !chatOpen) {
      setChatOpen(true);
    }
  }, [isExpanded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch contextual starter suggestions whenever the screen context changes
  useEffect(() => {
    let cancelled = false;
    setPillStarters([]);
    if (!geminiEnabled) {
      setPillStartersLoading(false);
      return;
    }
    setPillStartersLoading(true);
    const screen = serializeScreenContext(screenContext);
    fetch('/api/user-guide/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screen }),
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setPillStarters(Array.isArray(d.suggestions) ? d.suggestions.slice(0, 3) : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPillStartersLoading(false); });
    return () => { cancelled = true; };
  }, [screenContext?.title]);

  // Reset dismissed state on every new view so starters reappear
  useEffect(() => {
    setPillStartersDismissed(false);
  }, [screenContext?.title]);

  // typing dismissal is handled inline in the render condition (reversible)

  // Dismiss starters when a context chip is added (selector used)
  useEffect(() => {
    if (chips.length > 0) setPillStartersDismissed(true);
  }, [chips.length]);

  // One-shot glow only on transitions false→true, never on initial mount
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (isExpanded) setExpandKey(k => k + 1);
  }, [isExpanded]);

  useEffect(() => {
    if (!prevAiOpen.current && isAiPanelOpen) {
      setIsExpanded(false);
      setChatOpen(false);
      setIsDropdownOpen(false);
    }
    prevAiOpen.current = isAiPanelOpen;
  }, [isAiPanelOpen]);

  useEffect(() => {
    if (!pendingChip) return;
    setChips(prev => {
      if (prev.find(c => c.label === pendingChip.label)) return prev;
      return [...prev, pendingChip];
    });
    setIsExpanded(true);
    onChipConsumed();
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [pendingChip]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track scroll position for scroll-down arrow
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [chatHistory.length, chatOpen]);

  // Single capture-phase document listener handles all outside-click collapse logic.
  // Capture phase runs before any React synthetic event, so stopPropagation in children
  // can't block it — but we only act when the click is genuinely outside the pill.
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const s = snap.current;
      // Never interfere with clicks inside the pill wrapper.
      if (pillWrapperRef.current?.contains(e.target as Node)) return;
      // Never close pill when history panels are open — let explicit close buttons handle it.
      if (s.historyView || s.preHistoryOpen) return;
      if (s.isLoading) {
        // Keep generating, just minimize.
        setChatMinimized(true);
        setIsExpanded(false);
        setIsDropdownOpen(false);
      } else if (s.chatOpen || s.isDropdownOpen) {
        setChatMinimized(false);
        setChatOpen(false);
        setIsExpanded(false);
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => document.removeEventListener('mousedown', handleMouseDown, true);
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = chatScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };
  const scrollToMessage = (idx: number) => {
    chatScrollRef.current?.querySelector(`[data-pill-msg="${idx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openHistory = () => {
    if (historyCloseTimer.current) { clearTimeout(historyCloseTimer.current); historyCloseTimer.current = null; }
    setHistoryOpen(true);
  };
  const scheduleCloseHistory = () => {
    if (historyCloseTimer.current) clearTimeout(historyCloseTimer.current);
    historyCloseTimer.current = setTimeout(() => setHistoryOpen(false), 180);
  };

  const evaluateCollapse = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      const s = snap.current;
      const hasContent = s.inputText.trim().length > 0 || s.chips.length > 0;
      // Never collapse when chat is open — pill stays expanded while conversation is active
      if (!s.isPillHovered && !s.isDropdownHovered && !s.isFocused && !hasContent && !s.selectorActive && !s.isDropdownOpen && !s.chatOpen && !s.preHistoryOpen && !s.historyView) {
        setIsExpanded(false);
        setIsDropdownOpen(false);
      }
    }, 150);
  };

  const focusInputWhenReady = () => {
    window.setTimeout(() => {
      const s = snap.current;
      if (s.chatOpen || s.isDropdownOpen || s.preHistoryOpen || s.historyView || s.selectorActive) return;
      inputRef.current?.focus();
    }, 90);
  };

  const handlePillMouseEnter = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    snap.current.isPillHovered = true;
    setIsExpanded(true);
    focusInputWhenReady();
    if (snap.current.chatMinimized) setChatMinimized(false);
  };
  const handlePillMouseLeave = () => { snap.current.isPillHovered = false; evaluateCollapse(); };
  const handleDropdownMouseEnter = () => { if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current); snap.current.isDropdownHovered = true; };
  const handleDropdownMouseLeave = () => { snap.current.isDropdownHovered = false; evaluateCollapse(); };

  const removeChip = (label: string) => {
    setChips(prev => {
      const next = prev.filter(c => c.label !== label);
      if (next.length === 0 && !inputText.trim()) evaluateCollapse();
      return next;
    });
  };

  const handleFormatSelect = (fmt: Format) => {
    setSelectedFormat(fmt);
    snap.current.isDropdownOpen = false;
    setIsDropdownOpen(false);
    evaluateCollapse();
  };

  const hasContent = inputText.trim().length > 0 || chips.length > 0;

  const handleChatHeightPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const startY = e.clientY;
    const startHeight = chatPanelRef.current?.getBoundingClientRect().height ?? Math.min(window.innerHeight * 0.75, 720);
    let moved = false;
    const maxHeight = Math.max(360, window.innerHeight * 0.92 - 80);
    setIsResizingChat(true);
    const onMove = (ev: PointerEvent) => {
      const delta = startY - ev.clientY;
      if (Math.abs(delta) > 3) moved = true;
      pendingResizeHeightRef.current = Math.max(300, Math.min(maxHeight, startHeight + delta));
      if (resizeRafRef.current == null) {
        resizeRafRef.current = window.requestAnimationFrame(() => {
          resizeRafRef.current = null;
          if (pendingResizeHeightRef.current != null) {
            setCustomChatHeight(pendingResizeHeightRef.current);
          }
        });
      }
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (resizeRafRef.current != null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      if (pendingResizeHeightRef.current != null) {
        setCustomChatHeight(pendingResizeHeightRef.current);
      }
      pendingResizeHeightRef.current = null;
      setIsResizingChat(false);
      if (!moved) {
        setCustomChatHeight(null);
        setChatHeightMode(m => m === 'default' ? 'full' : 'default');
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  // Copy a user prompt to the clipboard, with brief per-message confirmation.
  const copyPrompt = (idx: number, text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(c => (c === idx ? null : c)), 1500);
    }).catch(() => {});
  };

  // Edit a user prompt inline within its bubble. Clicking edit turns the bubble
  // into an editable field; approving re-runs the chat from that point and
  // discards everything generated after it.
  const editPrompt = (idx: number) => {
    if (isLoading) { abortRef.current?.abort(); abortRef.current = null; setIsLoading(false); setStreamingText(''); }
    const entry = chatHistory[idx];
    if (!entry || entry.type !== 'user') return;
    setEditingIdx(idx);
    setEditingText(entry.text);
  };

  const cancelEdit = () => { setEditingIdx(null); setEditingText(''); };

  const submitEdit = () => {
    const idx = editingIdx;
    if (idx == null) return;
    const trimmed = editingText.trim();
    const original = chatHistory[idx];
    if (!trimmed || !original) { cancelEdit(); return; }
    const base = chatHistory.slice(0, idx);
    setEditingIdx(null);
    setEditingText('');
    // Re-send as text-only from the edited point; base history drops the old
    // turn and everything after it. (Chip panel contents aren't retained.)
    sendMessage(trimmed, [], base, true);
  };

  const sendMessage = async (
    overrideText?: string,
    overrideChips?: ContextChip[],
    baseHistoryOverride?: ChatEntry[],
    edited?: boolean,
    displayText?: string,
    selectionContext?: { text: string; domContext: string }
  ) => {
    const text = overrideText ?? inputText.trim();
    const activeChips = overrideChips ?? [...chips];
    if (!text && activeChips.length === 0) return;

    // Deterministic relatedness. Guide articles are REFERENCE material (apply to
    // the case), never a competing case. "Unrelated" only fires when 2+ non-guide
    // data panels come from different scopes (e.g. a ticket vs a global IP planner).
    const isGuideChip = (c: ContextChip) => (c.scope || '').startsWith('guide:');
    const dataChips = activeChips.filter(c => !isGuideChip(c));
    const guideChips = activeChips.filter(isGuideChip);
    const dataScopes = new Set(dataChips.map(c => c.scope || 'none'));
    const pinsUnrelated = dataScopes.size > 1;
    const hasGuideRef = guideChips.length > 0 && dataChips.length > 0;
    // Chips-only: auto-generate summary prompt for the API, display entry without text.
    const contextualText = text && screenContext?.kind === 'ticket'
      ? `For the current ticket/account shown on screen, answer this exact question: "${text}". Ground the answer in the account's full ticket context, including the case number, issue, root cause, authentication state, deliverability metrics, email performance metrics, bounce/provider signals, and support history where relevant. Treat the active tab as the immediate visual focus, but do not limit the answer to that tab. Do not answer as generic deliverability advice.`
      : text;
    const apiPrompt = contextualText || (pinsUnrelated
      ? `I've pinned ${activeChips.length} panels from DIFFERENT contexts: ${activeChips.map(c => c.label).join(', ')}. They are NOT part of the same case. Summarize the most detailed/case-specific one, briefly say why you led with it, then ask me what I want to do with the others. Do not blend their metrics or treat them as related.`
      : hasGuideRef
      ? `Using the pinned User Guide article(s) (${guideChips.map(c => c.label).join(', ')}) as best-practice reference, give specific recommendations to resolve the pinned case (${dataChips.map(c => c.label).join(', ')}). Apply the guidance to this case's data.`
      : activeChips.length > 1
      ? `Summarize these related panels together: ${activeChips.map(c => c.label).join(', ')}.`
      : `Summarize the selected context: ${activeChips.map(c => c.label).join(', ')}`);
    // When pins are unrelated, the model leads with one panel; the rest become
    // visual continuity pills. Lead = panel matching the open ticket, else first.
    const ticketScope = screenContext?.kind === 'ticket' ? `ticket:${screenContext.recordId ?? screenContext.accountKey ?? ''}` : null;
    const followups = pinsUnrelated
      ? (() => {
          const leadIdx = ticketScope ? dataChips.findIndex(c => c.scope === ticketScope) : 0;
          const lead = dataChips[leadIdx >= 0 ? leadIdx : 0];
          return activeChips.filter(c => c !== lead);
        })()
      : [];
    const entry: ChatEntry = { type: 'user', text, chips: activeChips, edited, displayText: displayText || undefined };
    const prevHistory = baseHistoryOverride ?? chatHistory;


    if (!geminiEnabled) {
      if (baseHistoryOverride) setChatHistory([...baseHistoryOverride, entry]);
      else setChatHistory(prev => [...prev, entry]);
      setChatOpen(true);
      setPreHistoryOpen(false);
      clearPillInput();
      setChips([]);
      setPillStartersDismissed(true);
      setTimeout(() => {
        const disabledText = '⚠️ **Gemini API is disabled in Settings.** Please enable it to chat.';
        setChatHistory(prev => [...prev, { type: 'assistant', text: disabledText, actions: ensureLocalAppActions(disabledText) }]);
      }, 300);
      return;
    }

    if (baseHistoryOverride) setChatHistory([...baseHistoryOverride, entry]);
    else setChatHistory(prev => [...prev, entry]);
    setChatOpen(true);
    setPreHistoryOpen(false);
    loadingStartRef.current = Date.now();
    setIsLoading(true);
    clearPillInput();
    setChips([]);
    onSelectorToggle?.(false);
    setPillStartersDismissed(true);
    setTimeout(() => scrollToBottom('instant'), 50);

    // Include chip content in history so follow-up messages retain context.
    // Refine pills ("Shorter"/"Expand"/"+ Data") only contribute the answer they
    // generate — drop the refine-trigger label so it isn't carried as a real user
    // turn on follow-ups. Also record which guide cards were shown beneath each
    // answer so the model can own/explain them instead of denying it suggested them.
    const refineLabels = new Set(['Make this shorter', 'Expand the context and provide technical detail', 'Show the supporting data']);
    const historyForApi = prevHistory
      .filter(e => !(e.type === 'user' && refineLabels.has((e.text || '').trim())))
      .map(e => ({
        role: e.type === 'user' ? 'user' as const : 'assistant' as const,
        content: e.chips?.length
          ? [e.text, ...e.chips.map(c => `[Context — ${c.label}]:\n${c.content}`)].filter(Boolean).join('\n\n')
          : e.type === 'assistant' && e.articles?.length
          ? `${e.text}\n\n[Suggested guide cards shown to the user with this answer: ${e.articles.map(a => a.title).join(', ')}]`
          : e.text,
        timestamp: Date.now(),
      }));

    const baseScreen = serializeScreenContext(screenContext);
    const relatednessNote = activeChips.length > 1
      ? (pinsUnrelated
          ? '(RELATEDNESS: these panels are from DIFFERENT contexts — treat as UNRELATED; never cross-attribute their values. Lead with the most case-specific panel and say why.)\n'
          : hasGuideRef
          ? '(RELATEDNESS: the User Guide article(s) are best-practice REFERENCE — apply their guidance to resolve the pinned case panel(s). Do not say the guide "lacks account data"; that is expected.)\n'
          : '(RELATEDNESS: these panels share the same context — safe to analyse together)\n')
      : '';
    const chipsContext = activeChips.length > 0
      ? '\n\n--- SELECTED CONTEXT ---\n' + relatednessNote + activeChips.map((c, i) => `=== PANEL ${i + 1}: ${c.label}${c.scope ? ` [scope: ${c.scope}]` : ''} ===\n${c.content}`).join('\n\n')
      : '';
    const screen = baseScreen + chipsContext;
    const fullMsg = FORMAT_INSTRUCTIONS[selectedFormat] + apiPrompt;
    const ticketRef = screenContext?.kind === 'ticket'
      ? { id: screenContext.recordId, account: screenContext.accountKey }
      : undefined;

    let answer = '';
    let articles: GuideArticle[] = [];
    let actions: AppAction[] = [];
    setStreamingText('');
    const aborter = new AbortController();
    abortRef.current = aborter;
    try {
      const res = await fetch('/api/user-guide/ask-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullMsg,
          screen,
          ticketRef,
          history: historyForApi,
          highlightedText: selectionContext?.text || highlightedContext?.text,
          highlightedContext: selectionContext?.domContext || highlightedContext?.domContext,
          dateRange: screenContext?.dateRange ? { from: screenContext.dateRange.from, to: screenContext.dateRange.to } : undefined
        }),
        signal: aborter.signal,
      });
      if (!res.ok || !res.body) throw new Error('Stream request failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          try {
            const parsed = JSON.parse(payload);
            if (parsed.token) { answer += parsed.token; setStreamingText(answer); }
            else if (parsed.done) {
              answer = parsed.text || answer;
              articles = Array.isArray(parsed.articles) ? parsed.articles : [];
              actions = Array.isArray(parsed.actions) ? parsed.actions : [];
            }
            else if (parsed.error) {
              answer = parsed.error === 'Failed to reach Gemini API'
                ? '⚠️ **Gemini API is not configured.** Please check your settings or `.env` file.'
                : `⚠️ ${parsed.error}`;
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // docked mid-generation — AiPanel takes over
      answer = `⚠️ Could not reach Gemini: ${e.message}`;
    }

    setStreamingText('');
    const finalAnswer = answer || 'No response.';
    const finalActions = ensureLocalAppActions(finalAnswer, actions);
    setChatHistory(prev => [...prev, { type: 'assistant', text: finalAnswer, articles, actions: finalActions, followups: followups.length ? followups : undefined }]);
    setIsLoading(false);
    setIsExpanded(true);
    setChatMinimized(false);

    // Auto-save conversation
    const allMsgs = [...prevHistory, entry, { type: 'assistant' as const, text: finalAnswer, articles, actions: finalActions }];
    const apiMsgs = allMsgs.map(e => ({ role: e.type === 'user' ? 'user' : 'assistant', content: e.chips?.length ? [e.text, ...e.chips.map(c => `[Context — ${c.label}]:\n${c.content}`)].filter(Boolean).join('\n\n') : e.text, chips: e.chips?.length ? e.chips.map(c => ({ label: c.label })) : null, articles: e.articles?.length ? e.articles : null, actions: e.actions?.length ? e.actions : null }));
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: conversationIdRef.current, messages: apiMsgs, source: 'pill' }),
    }).then(r => r.json()).then(d => { if (d.id) conversationIdRef.current = d.id; }).catch(() => {});
  };

  const submitSuggested = (prompt: string) => {
    setChatOpen(false);
    setTimeout(() => { setChatHistory([]); conversationIdRef.current = null; sendMessage(prompt); }, 50);
  };

  // Transfer pill thread to AiPanel — chips + articles passed as metadata
  const handleSplitscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const loadingNow = snap.current.isLoading;
    let pendingQuery: string | undefined;
    if (loadingNow) {
      // Abort the in-flight stream; AiPanel will re-send the pending user message
      abortRef.current?.abort();
      abortRef.current = null;
      setIsLoading(false);
      setStreamingText('');
      setChatMinimized(false);
      // The last chatHistory entry is the in-progress user message — exclude from seeds
      // and pass separately so AiPanel re-sends it with fresh (non-stale) state
      pendingQuery = chatHistory[chatHistory.length - 1]?.text;
    }
    const seedEntries = loadingNow ? chatHistory.slice(0, -1) : chatHistory;
    const seeds: ChatMessage[] = seedEntries.map((entry, i) => ({
      role: entry.type === 'user' ? 'user' : 'assistant',
      content: entry.text,
      displayContent: entry.displayText || undefined,
      chips: entry.chips?.map(c => ({ label: c.label })),
      articles: entry.articles,
      actions: entry.actions,
      timestamp: Date.now() + i,
    }));
    // When the last entry is still loading, pass it as pendingQuery with its display label
    const pendingDisplayText = loadingNow
      ? chatHistory[chatHistory.length - 1]?.displayText
      : undefined;
    onOpenAiPanel(seeds.length ? seeds : undefined, pendingQuery, pendingDisplayText);
    setChatOpen(false);
    setChips([]);
    clearPillInput();
  };

  useEffect(() => {
    if (!historyView) return;
    fetch('/api/conversations').then(r => r.json()).then(d => setConversations(d.conversations || [])).catch(() => {});
  }, [historyView]);

  // External query trigger — "Ask Gemini" from User Guide fires query directly
  // into the pill chat without touching the side panel.
  useEffect(() => {
    if (!pendingPillQuery) return;
    onPendingPillQueryConsumed?.();
    sendMessage(pendingPillQuery, undefined, undefined, undefined, pendingPillQueryDisplay || undefined, highlightedContext || undefined);
  }, [pendingPillQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadConversation = async (id: string) => {
    try {
      const d = await fetch(`/api/conversations/${id}`).then(r => r.json());
      // User messages were saved with chip content dumped inline (for API
      // continuity); strip that so the bubble shows only the typed text + pills,
      // never the raw "[Context — …]" block.
      const stripChipDump = (s: string) => {
        const idx = s.indexOf('[Context — ');
        return idx >= 0 ? s.slice(0, idx).trim() : s;
      };
      const entries: ChatEntry[] = d.messages.map((m: any) => ({ type: m.role === 'user' ? 'user' as const : 'assistant' as const, text: m.role === 'user' ? stripChipDump(m.content) : m.content, chips: m.chips?.map((c: any) => ({ label: c.label, content: '' })), articles: m.articles?.length ? m.articles : undefined, actions: m.actions?.length ? m.actions : undefined }));
      setChatHistory(entries);
      conversationIdRef.current = id;
      setHistoryView(false);
      setChatOpen(true);
    } catch {}
  };

  const isInvestigation = currentView === 'investigation';
  const selectorHint = selectorActive
    ? 'Select a panel to add Gemini context, then Done'
    : null;

  // Theme tokens matching AiPanel exactly
  const t = isDark
    ? {
        userBubble: 'bg-[#1A73E8]/25 border border-[#1A73E8]/30 text-white/85',
        aiText: 'text-white/75',
        prose: 'ai-prose-dark',
        chipBadge: 'bg-white/15 text-white/85',
        articleCard: 'bg-white/5 border-white/8 hover:bg-white/10',
        articleIcon: 'text-[#74BBFF]',
        articleTitle: 'text-white/85',
        articleSection: 'text-white/35',
        thinkingText: 'text-[#74BBFF]/70',
        historyPopup: 'bg-[#1E2035] border-white/10',
        historyHeader: 'bg-[#1E2035] border-white/8 text-white/30',
        historyItem: 'hover:bg-white/5',
        historyText: 'text-white/60',
      }
    : {
        userBubble: 'bg-[#1A73E8] text-white',
        aiText: 'text-[#1D192B]',
        prose: 'ai-prose-light',
        chipBadge: 'bg-white/25 text-white/90',
        articleCard: 'bg-[#F1F3F4] border-black/5 hover:bg-[#E8F0FE]',
        articleIcon: 'text-[#1A73E8]',
        articleTitle: 'text-[#1D192B]',
        articleSection: 'text-black/40',
        thinkingText: 'text-[#1A73E8]/70',
        historyPopup: 'bg-white border-[#E8EAED]',
        historyHeader: 'bg-white border-[#F1F3F4] text-[#9AA0A6]',
        historyItem: 'hover:bg-[#F8F9FA]',
        historyText: 'text-[#5F6368]',
      };

  const visible = !isAiPanelOpen;
  const trimmedSearchQuery = searchQuery.trim();
  const showSearchPanel = isExpanded && !chatOpen && !preHistoryOpen && !selectorActive && trimmedSearchQuery.length > 0;
  const groupedSearchResults = ([
    { type: 'ticket' as const, label: 'Tickets' },
    { type: 'guide' as const, label: 'User Guide' },
    { type: 'nav' as const, label: 'Everything Else' },
  ]).map(group => ({
    ...group,
    items: searchResults.filter(item => item.type === group.type),
  })).filter(group => group.items.length > 0);
  const searchResultCount = groupedSearchResults.reduce((total, group) => total + group.items.length, 0);
  const searchPanelHeight = groupedSearchResults.length > 0
    ? Math.min(420, 57 + 18 + groupedSearchResults.length * 46 + searchResultCount * 64)
    : 128;
  const searchSuggestionItems = searchResults.slice(0, 3);
  const searchSuggestionLabel = (item: GeminiSearchItem) => {
    if (item.type !== 'guide' || !item.subtitle) return item.title;
    const crumbs = item.subtitle
      .split('/')
      .map(part => part.trim())
      .filter(Boolean)
      .filter((part, idx) => idx !== 0 || part.toLowerCase() !== 'user guide');
    const category = crumbs[crumbs.length - 1];
    if (!category || category.toLowerCase() === item.title.toLowerCase()) return item.title;
    return `${item.title} · ${category}`;
  };
  const searchCrumbs = (item: GeminiSearchItem) =>
    (item.subtitle || '')
      .split('/')
      .map(part => part.trim())
      .filter(Boolean)
      .filter((part, idx) => idx !== 0 || part.toLowerCase() !== 'user guide');

  const selectSearchResult = (item: GeminiSearchItem, source: 'result' | 'suggestion' = 'result') => {
    onSelectSearchResult?.(item, source);
    clearPillInput();
    setChatOpen(false);
    setPreHistoryOpen(false);
    setIsExpanded(false);
  };

  return (
    <>
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={pillWrapperRef}
          initial={{ opacity: 0, y: 48, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.92, transition: { duration: 0.18, ease: [0.3, 0, 0.8, 0.15] } }}
          transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.9 }}
          className="fixed bottom-6 inset-x-0 mx-auto z-[200] flex flex-col gap-3 pointer-events-none gemini-exclude"
          style={{ width: 680, maxWidth: '92vw' }}
        >

          {/* ── Chat panel ── */}
          {/* CSS wrapper owns height-collapse so inner CSS @keyframes never reset */}
          <div style={{
            maxHeight: chatMinimized ? 0 : chatHeightPx,
            overflow: 'hidden',
            borderRadius: 28,
            transition: isResizingChat ? 'none' : 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: chatMinimized ? 'none' : undefined,
            willChange: isResizingChat ? 'max-height' : undefined,
          }}>
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                ref={chatPanelRef}
                key="chat-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: chatMinimized ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                  'w-full rounded-[28px] border overflow-hidden flex flex-col pointer-events-auto',
                  isDark
                    ? 'bg-[#13141F] border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                    : 'bg-white border-black/8 shadow-[0_8px_32px_rgba(60,64,67,0.12)]',
                )}
                style={{ maxHeight: chatHeightPx }}
              >
                {/* Header — switches between Gemini and History inline */}
                <div className={cn('relative flex items-center gap-2.5 px-4 py-3 border-b shrink-0', isDark ? 'border-white/8' : 'border-black/8')}>
                  {historyView ? (
                    <>
                      <button type="button" onClick={() => setHistoryView(false)} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')}>
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      </button>
                      <span className={cn('text-[15px] font-bold flex-1', isDark ? 'text-white' : 'text-[#1D192B]')}>History</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#74BBFF] rounded-full border border-[#1A73E8]/30">Alpha</span>
                      <button type="button" onClick={() => { setHistoryView(false); setChatHistory([]); conversationIdRef.current = null; }} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')} title="New chat">
                        <span className="material-symbols-outlined text-[16px]">edit_square</span>
                      </button>
                      <button type="button" onClick={() => { setHistoryView(false); setChatOpen(false); setIsExpanded(false); }} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')}>
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => setHistoryView(true)} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')}>
                        <span className="material-symbols-outlined text-[18px]">menu</span>
                      </button>
                      <GeminiIcon className="w-5 h-5 shrink-0" />
                      <span className={cn('text-[15px] font-bold flex-1', isDark ? 'text-white' : 'text-[#1D192B]')}>Gemini</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#74BBFF] rounded-full border border-[#1A73E8]/30">Alpha</span>
                      <button type="button" onClick={() => { setChatHistory([]); conversationIdRef.current = null; setChatOpen(false); setIsExpanded(true); setPillStartersDismissed(false); }} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')} title="New chat">
                        <span className="material-symbols-outlined text-[16px]">edit_square</span>
                      </button>
                      <button type="button" onClick={() => setChatOpen(false)} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')}>
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    title="Drag to resize"
                    onPointerDown={handleChatHeightPointerDown}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-8 flex items-center justify-center cursor-ns-resize group"
                  >
                    <span className={cn(
                      'block w-10 h-[4px] rounded-full transition-colors duration-150',
                      isDark ? 'bg-white/20 group-hover:bg-white/40' : 'bg-black/12 group-hover:bg-black/28'
                    )} />
                  </button>
                </div>

                {/* Body — chat always rendered; history slides in as absolute overlay */}
                <div className="relative overflow-hidden flex-1 flex flex-col min-h-0">

                  {/* ── Chat View — always rendered ── */}
                  {/* Messages */}
                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 flex flex-col min-h-0" style={{ minHeight: 200 }}>
                    {chatHistory.length === 0 && !isLoading ? (
                      <div className="flex-1 flex items-center justify-center py-4">
                        <h2 className={cn('text-[18px] font-medium text-center', isDark ? 'text-[#74BBFF]' : 'text-[#1A73E8]')}>How can I help?</h2>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {chatHistory.map((entry, i) => (
                          <div key={i} data-pill-msg={i} className={cn('flex flex-col scroll-mt-3', entry.type === 'user' ? 'items-end' : 'items-start')}>
                            {entry.type === 'user' ? (
                              // Chips-only: floating chips, no bubble
                              // Chips + text: chips above bubble
                              // Text only: plain bubble
                              <div className={cn('group flex flex-col items-end gap-0.5', editingIdx === i ? 'w-[92%]' : 'max-w-[88%]')}>
                                {editingIdx === i ? (
                                  <div className="w-full flex items-end gap-1.5 rounded-2xl rounded-br-sm border-2 border-dashed border-[#1A73E8] bg-white px-3 py-2">
                                    <textarea
                                      autoFocus
                                      value={editingText}
                                      ref={el => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; } }}
                                      onChange={e => setEditingText(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); }
                                        else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                                      }}
                                      rows={1}
                                      className="flex-1 resize-none bg-transparent outline-none text-[12px] leading-relaxed text-[#202124] max-h-40 overflow-y-auto"
                                    />
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                      title="Cancel edit"
                                      className={cn('shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-black/40 hover:text-black/70 hover:bg-black/5' : 'text-black/40 hover:text-black/70 hover:bg-black/5')}
                                    >
                                      <span className="material-symbols-outlined text-[20px]">cancel</span>
                                    </button>
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); submitEdit(); }}
                                      title="Approve edits"
                                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#1A73E8] hover:bg-[#1A73E8]/10 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    </button>
                                  </div>
                                ) : (
                                <>
                                {entry.edited && (
                                  <span className={cn('text-[9px] font-medium pr-1 pb-0.5', isDark ? 'text-white/35' : 'text-black/35')}>Edited</span>
                                )}
                                {entry.chips && entry.chips.length > 0 ? (
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="flex flex-wrap gap-1 justify-end">
                                      {entry.chips.map(c => (
                                        <span key={c.label} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A73E8]/15 text-[#1A73E8] dark:bg-[#74BBFF]/15 dark:text-[#74BBFF] border border-[#1A73E8]/20 dark:border-[#74BBFF]/20">
                                          #{c.label}
                                        </span>
                                      ))}
                                    </div>
                                    {(entry.displayText || entry.text) && (
                                      <div className={cn('px-3 py-2 rounded-2xl rounded-br-sm', t.userBubble)}>
                                        <p className="text-[12px] leading-relaxed">{entry.displayText || entry.text}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : entry.displayText ? (
                                  <div className={cn('flex items-center gap-2 pl-3 pr-3.5 py-2.5 rounded-2xl rounded-br-sm', t.userBubble)}>
                                    <span className="material-symbols-outlined text-[15px] shrink-0 opacity-70">auto_stories</span>
                                    <p className="text-[12px] leading-relaxed font-medium">{entry.displayText}</p>
                                  </div>
                                ) : (
                                  <div className={cn('px-3 py-2 rounded-2xl rounded-br-sm', t.userBubble)}>
                                    <p className="text-[12px] leading-relaxed">{entry.text}</p>
                                  </div>
                                )}
                                {entry.text && (
                                  <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); copyPrompt(i, entry.text); }}
                                      title={copiedIdx === i ? 'Copied' : 'Copy'}
                                      className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/40 hover:text-white/80 hover:bg-white/8' : 'text-black/35 hover:text-black/65 hover:bg-black/5')}
                                    >
                                      <span className="material-symbols-outlined text-[14px]">{copiedIdx === i ? 'check' : 'content_copy'}</span>
                                    </button>
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); editPrompt(i); }}
                                      title="Edit"
                                      className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/40 hover:text-white/80 hover:bg-white/8' : 'text-black/35 hover:text-black/65 hover:bg-black/5')}
                                    >
                                      <span className="material-symbols-outlined text-[14px]">edit</span>
                                    </button>
                                  </div>
                                )}
                                </>
                                )}
                              </div>
                            ) : (
                              <div className="group w-full">
                                <div className="flex gap-2 items-start w-full">
                                  <GeminiIcon className={cn("w-4 h-4 shrink-0 mt-0.5", isLoading && i === chatHistory.length - 1 && "gemini-twinkle")} />
                                  <MarkdownContent
                                    className={cn('flex-1 min-w-0 text-[12px] leading-relaxed ai-prose', t.prose, t.aiText)}
                                    content={entry.text}
                                    inlineActions={entry.actions}
                                    onRunAction={onRunAction}
                                    isDark={isDark}
                                  />
                                </div>
                                {entry.text && (
                                  <div className="ml-[22px] mt-0.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); copyPrompt(i, entry.text); }}
                                      title={copiedIdx === i ? 'Copied' : 'Copy'}
                                      className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/40 hover:text-white/80 hover:bg-white/8' : 'text-black/35 hover:text-black/65 hover:bg-black/5')}
                                    >
                                      <span className="material-symbols-outlined text-[14px]">{copiedIdx === i ? 'check' : 'content_copy'}</span>
                                    </button>
                                  </div>
                                )}
                                {entry.articles && entry.articles.length > 0 && (
                                  <div className="mt-2 ml-[22px] flex flex-col gap-1.5" style={{ width: 'calc(100% - 22px)' }}>
                                    {entry.articles.length > 1 && (
                                      <span className={cn('text-[8.5px] font-black uppercase tracking-widest pl-0.5', isDark ? 'text-white/35' : 'text-black/35')}>
                                        Suggested guides · {entry.articles.length}
                                      </span>
                                    )}
                                    {entry.articles.slice(0, 3).map((art, ci) => (
                                      <button type="button"
                                        key={ci}
                                        onClick={() => onOpenArticle ? onOpenArticle(art.path) : handleSplitscreen()}
                                        className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors group', t.articleCard)}
                                      >
                                        <DocSparkIcon className={cn('w-[18px] h-[18px] shrink-0', t.articleIcon)} />
                                        <span className="flex-1 min-w-0">
                                          <span className={cn('block text-[8.5px] font-bold uppercase tracking-wide', t.articleSection)}>
                                            {entry.articles!.length > 1 ? art.section : `Suggested guide · ${art.section}`}
                                          </span>
                                          <span className={cn('block text-[12px] font-semibold truncate', t.articleTitle)}>{art.title}</span>
                                        </span>
                                        <span className={cn('material-symbols-outlined text-[15px] shrink-0 transition-transform group-hover:translate-x-0.5', isDark ? 'text-white/40' : 'text-black/35')}>arrow_outward</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {entry.followups && entry.followups.length > 0 && (
                                  <div className="mt-2 ml-[22px] flex flex-col gap-1.5" style={{ width: 'calc(100% - 22px)' }}>
                                    <span className={cn('text-[8.5px] font-black uppercase tracking-widest pl-0.5', isDark ? 'text-white/35' : 'text-black/35')}>
                                      Continue with
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {entry.followups.slice(0, 3).map((fu, ci) => (
                                        <button type="button"
                                          key={ci}
                                          onClick={() => sendMessage('', [fu])}
                                          className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold transition-colors', t.articleCard)}
                                        >
                                          <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                          Analyze {fu.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Refine pills after last AI answer */}
                        {!isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].type === 'assistant' && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5 pl-5">
                            {([
                              { mode: 'shorter' as const, label: 'Shorter', icon: 'compress' },
                              { mode: 'technical' as const, label: 'Expand', icon: 'expand_content' },
                              { mode: 'data' as const, label: '+ Data', icon: 'bar_chart' },
                            ]).map(p => (
                              <button type="button"
                                key={p.mode}
                                onClick={() => {
                                  const labelMsg = p.mode === 'shorter' ? 'Make this shorter' : p.mode === 'technical' ? 'Expand the context and provide technical detail' : 'Show the supporting data';
                                                                const prev: ChatEntry[] = [...chatHistory, { type: 'user' as const, text: labelMsg }];
                                  setChatHistory(prev);
                                  setIsLoading(true);
                                  const screen = serializeScreenContext(screenContext);
                                  const histForApi = chatHistory.map(e => ({ role: e.type === 'user' ? 'user' as const : 'assistant' as const, content: e.chips?.length ? [e.text, ...e.chips.map(c => `[Context — ${c.label}]:\n${c.content}`)].filter(Boolean).join('\n\n') : e.text, timestamp: Date.now() }));
                                  const ticketRef2 = screenContext?.kind === 'ticket' ? { id: screenContext.recordId, account: screenContext.accountKey } : undefined;
                                  fetch('/api/user-guide/ask', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      prompt: `refine:${p.mode}`,
                                      screen,
                                      ticketRef: ticketRef2,
                                      history: histForApi,
                                      mode: p.mode,
                                      dateRange: screenContext?.dateRange ? { from: screenContext.dateRange.from, to: screenContext.dateRange.to } : undefined
                                    }),
                                  }).then(r => r.json()).then(d => {
                                    const ans = d.error ? `⚠️ ${d.error}` : (d.text || chatHistory[chatHistory.length - 1].text);
                                    const arts = Array.isArray(d.articles) ? d.articles : (d.article ? [d.article] : []);
                                    const finalEntries: ChatEntry[] = [...prev, { type: 'assistant' as const, text: ans, articles: arts }];
                                    setChatHistory(finalEntries);
                                    setIsLoading(false);
                                    // Persist refined turn back to the conversation .md
                                    const apiMsgs = finalEntries.map(e => ({ role: e.type === 'user' ? 'user' : 'assistant', content: e.chips?.length ? [e.text, ...e.chips.map(c => `[Context — ${c.label}]:\n${c.content}`)].filter(Boolean).join('\n\n') : e.text, chips: e.chips?.length ? e.chips.map(c => ({ label: c.label })) : null }));
                                    fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: conversationIdRef.current, messages: apiMsgs, source: 'pill' }) }).then(r => r.json()).then(d => { if (d.id) conversationIdRef.current = d.id; }).catch(() => {});
                                  }).catch(err => {
                                    setChatHistory([...prev, { type: 'assistant' as const, text: `⚠️ Could not reach Gemini: ${err.message}` }]);
                                    setIsLoading(false);
                                  });
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[#1A73E8]/10 text-[#1A73E8] hover:bg-[#1A73E8]/20 dark:text-[#74BBFF] dark:bg-[#74BBFF]/10 dark:hover:bg-[#74BBFF]/20 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[12px]">{p.icon}</span>
                                {p.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Loading — stream text when tokens arrive, skeleton while waiting */}
                        {(isLoading || (panelIsLoading && !isAiPanelOpen)) && (
                          <div className="flex gap-2 items-start w-full">
                            <GeminiIcon className="w-3.5 h-3.5 shrink-0 mt-0.5 gemini-twinkle" />
                            <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
                              <>
                                <div className="gemini-skel" style={{ width: '100%' }} />
                                <div className="gemini-skel" style={{ width: '100%', animationDelay: '0.18s' }} />
                                <div className="gemini-skel" style={{ width: '68%', animationDelay: '0.36s' }} />
                                <ThinkingStatus className={cn('mt-0.5', t.thinkingText)} startTime={loadingStartRef.current} />
                              </>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* History dots rail — matches AiPanel */}
                  {chatHistory.length > 1 && (
                    <div className="shrink-0 px-4 pb-1 pt-0.5">
                      <div
                        className="relative flex justify-center"
                        onMouseEnter={openHistory}
                        onMouseLeave={scheduleCloseHistory}
                      >
                        <div className="absolute bottom-0 left-0 right-0" style={{ height: historyOpen ? 260 : 14, pointerEvents: 'none' }} />
                        <div
                          onMouseEnter={openHistory}
                          onMouseLeave={scheduleCloseHistory}
                          className={cn(
                            'absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[260px] max-h-[240px] overflow-y-auto custom-scrollbar rounded-xl border shadow-xl transition-all duration-150 origin-bottom',
                            t.historyPopup,
                            historyOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1 pointer-events-none'
                          )}
                        >
                          <div className={cn('sticky top-0 px-3 py-2 border-b text-[9px] font-black uppercase tracking-widest select-none', t.historyHeader)}>
                            This conversation · {chatHistory.length}
                          </div>
                          {chatHistory.map((msg, i) => (
                            <button type="button"
                              key={i}
                              onClick={() => { scrollToMessage(i); setHistoryOpen(false); }}
                              className={cn('w-full text-left px-3 py-1.5 flex items-start gap-2 transition-colors cursor-pointer', t.historyItem)}
                            >
                              <span className={cn('text-[8.5px] font-black uppercase tracking-wide shrink-0 mt-0.5 w-5', msg.type === 'user' ? 'text-[#1A73E8]' : isDark ? 'text-[#74BBFF]/60' : 'text-[#9AA0A6]')}>
                                {msg.type === 'user' ? 'You' : 'AI'}
                              </span>
                              <span className={cn('text-[11px] truncate leading-snug', t.historyText)}>
                                {(msg.text || msg.chips?.map(c => `#${c.label}`).join(' ') || '').replace(/[#*`>]/g, '').slice(0, 60)}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 py-2 cursor-default">
                          {chatHistory.slice(-12).map((msg, i, arr) => (
                            <button type="button"
                              key={i}
                              onClick={() => scrollToMessage(chatHistory.length - arr.length + i)}
                              className={cn(
                                'h-1.5 rounded-full transition-all hover:h-2.5 cursor-pointer',
                                msg.type === 'user'
                                  ? 'w-3 bg-[#1A73E8]'
                                  : cn('w-1.5', isDark ? 'bg-white/30' : 'bg-[#C5D0DB]')
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* History overlay — slides in over chat content */}
                  <AnimatePresence>
                    {historyView && (
                      <motion.div
                        key="pill-history-overlay"
                        initial={{ x: 24, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 24, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={cn('absolute inset-0 z-10 overflow-y-auto custom-scrollbar px-3 py-3', isDark ? 'bg-[#13141F]' : 'bg-white')}
                      >
                        {conversations.length === 0 ? (
                          <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 text-center">
                            <p className={cn('text-[14px] font-bold', isDark ? 'text-white/80' : 'text-[#1D192B]')}>No results.</p>
                            <p className={cn('text-[12px]', isDark ? 'text-white/45' : 'text-[#49454F]')}>Some activity may not appear yet.</p>
                            <button type="button"
                              onClick={() => { setHistoryView(false); setChatHistory([]); conversationIdRef.current = null; setTimeout(() => inputRef.current?.focus(), 80); }}
                              className="px-6 py-2.5 rounded-full bg-[#1A73E8] text-white text-[13px] font-semibold hover:bg-[#1557B0] transition-colors shadow-sm"
                            >Start a conversation</button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1" onMouseDown={(e) => e.stopPropagation()}>
                            {conversations.map(c => (
                              <div key={c.id} className="group relative">
                                <button type="button"
                                  onClick={() => loadConversation(c.id)}
                                  className={cn('w-full text-left px-3 py-2.5 rounded-xl transition-colors flex flex-col gap-0.5 pr-8', isDark ? 'hover:bg-white/6' : 'hover:bg-black/4')}
                                >
                                  <span className={cn('text-[12px] font-semibold truncate', isDark ? 'text-white/90' : 'text-[#1D192B]')}>{c.title}</span>
                                  <span className={cn('text-[10px]', isDark ? 'text-white/35' : 'text-[#49454F]/70')}>{new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </button>
                                <button type="button"
                                  onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); fetch(`/api/conversations/${c.id}`, { method: 'DELETE' }).then(() => setConversations(prev => prev.filter(x => x.id !== c.id))).catch(() => {}); }}
                                  className={cn('absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity', isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/10' : 'text-black/30 hover:text-black/60 hover:bg-black/8')}
                                  title="Delete conversation"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Scroll-down arrow */}
                <AnimatePresence>
                  {showScrollDown && (
                    <motion.button type="button"
                      key="pill-scroll-down"
                      initial={{ opacity: 0, scale: 0.8, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 8 }}
                      onClick={() => scrollToBottom()}
                      className={cn(
                        'absolute right-3 bottom-14 z-20 w-7 h-7 rounded-full flex items-center justify-center border shadow-md transition-colors',
                        isDark ? 'bg-[#1E2035] border-white/10 text-white/70 hover:text-white' : 'bg-white border-[#E8EAED] text-[#5F6368] hover:text-[#1A73E8] hover:border-[#1A73E8]/30'
                      )}
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                    </motion.button>
                  )}
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>
          </div>{/* end CSS height-collapse wrapper */}

          {/* ── Pill + dropdown wrapper ── */}
          {/* flex-col so the starter pills (order-last) sit BELOW the pill and
              push it up; absolutely-positioned children (dropdown) are unaffected. */}
          <div className="relative pointer-events-auto flex flex-col">

            {/* ── Pre-chat history panel ── */}
            <AnimatePresence>
              {showSearchPanel && (
                <motion.div
                  key="pill-search-results"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                  onMouseEnter={handlePillMouseEnter}
                  onMouseLeave={handlePillMouseLeave}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={cn(
                    'w-full rounded-[28px] border overflow-hidden flex flex-col pointer-events-auto mb-2 backdrop-blur-md',
                    isDark
                      ? 'bg-[#13141F]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                      : 'bg-white/95 border-black/8 shadow-[0_12px_40px_rgba(60,64,67,0.15)]',
                  )}
                  style={{
                    height: searchPanelHeight,
                    maxHeight: 420,
                    transition: 'height 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'height, transform, opacity',
                  }}
                >
                  {/* Minimal Header */}
                  <div className={cn('flex items-center justify-between px-5 py-2.5 border-b shrink-0 select-none', isDark ? 'border-white/8' : 'border-black/8')}>
                    <span className={cn('text-[11px] font-black uppercase tracking-wider', isDark ? 'text-white/40' : 'text-black/40')}>Search Results</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearPillInput(); inputRef.current?.focus(); }}
                      className={cn('w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 active:scale-95', isDark ? 'text-white/35 hover:text-white/70 hover:bg-white/8' : 'text-black/35 hover:text-black/60 hover:bg-black/6')}
                      title="Clear search"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  </div>

                  <div className="overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3">
                    {groupedSearchResults.length > 0 ? (
                      groupedSearchResults.map(group => (
                        <div key={group.type} className="flex flex-col gap-2 mb-4 last:mb-0">
                          {/* Group Title Header */}
                          <div className={cn('px-4 py-1.5 flex items-center gap-2.5 text-xs font-black uppercase tracking-wider select-none', isDark ? 'text-[#FFA4FB]' : 'text-[#801ED7]')}>
                            <span className="material-symbols-outlined text-[18px] leading-none">{group.items[0]?.icon}</span>
                            <span>{group.label}</span>
                          </div>
                          
                          {/* MD3 List items in distinct panel */}
                          <md-list className={cn('p-0 rounded-2xl overflow-hidden border', isDark ? 'bg-white/[0.02] border-white/8' : 'bg-[#F9F9FA] border-black/5')}>
                            {group.items.map((item, idx) => {
                              const pathText = item.type === 'guide'
                                ? searchCrumbs(item).join(' › ')
                                : item.subtitle || '';
                              return (
                                <React.Fragment key={`${item.type}-${item.id}`}>
                                  {idx > 0 && <md-divider />}
                                  <md-list-item
                                    type="button"
                                    onClick={() => selectSearchResult(item)}
                                    style={{
                                      '--md-list-item-hover-state-layer-color': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                                      '--md-list-item-focus-state-layer-color': isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                                      '--md-list-item-headline-size': '13.5px',
                                      '--md-list-item-headline-weight': '600',
                                      '--md-list-item-supporting-text-size': '11px',
                                      '--md-list-item-supporting-text-weight': '500',
                                      '--md-list-item-leading-space': '16px',
                                      '--md-list-item-trailing-space': '16px',
                                    } as React.CSSProperties}
                                  >
                                    <div slot="headline" className={cn('font-semibold truncate', isDark ? 'text-white/95' : 'text-[#202124]')}>
                                      {item.title}
                                    </div>
                                    {pathText && (
                                      <div slot="supporting-text" className={cn('font-medium truncate', isDark ? 'text-white/44' : 'text-[#6B6470]')}>
                                        {pathText}
                                      </div>
                                    )}
                                    {item.meta && (
                                      <span slot="end" className={cn('text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full select-none', isDark ? 'bg-white/8 text-white/50' : 'bg-black/6 text-black/55')}>
                                        {item.meta}
                                      </span>
                                    )}
                                  </md-list-item>
                                </React.Fragment>
                              );
                            })}
                          </md-list>
                        </div>
                      ))
                    ) : (
                      <div className={cn('py-8 px-5 text-center text-[13px] font-medium select-none', isDark ? 'text-white/40' : 'text-[#5f6368]')}>
                        No results found.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {preHistoryOpen && !chatOpen && (
                <motion.div
                  key="pre-history"
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  onMouseEnter={handlePillMouseEnter}
                  onMouseLeave={handlePillMouseLeave}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={cn(
                    'w-full rounded-[24px] border overflow-hidden flex flex-col pointer-events-auto mb-2',
                    isDark
                      ? 'bg-[#13141F] border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                      : 'bg-white border-black/8 shadow-[0_8px_32px_rgba(60,64,67,0.12)]',
                  )}
                  style={{ maxHeight: 320 }}
                >
                  {/* Header */}
                  <div className={cn('flex items-center gap-2.5 px-4 pt-3.5 pb-3 border-b shrink-0', isDark ? 'border-white/8' : 'border-black/8')}>
                    <GeminiIcon className="w-4 h-4 shrink-0" />
                    <span className={cn('text-[14px] font-bold flex-1', isDark ? 'text-white' : 'text-[#1D192B]')}>History</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#74BBFF] rounded-full border border-[#1A73E8]/30">Alpha</span>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); setChatHistory([]); conversationIdRef.current = null; setPreHistoryOpen(false); }}
                      className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')}
                      title="New chat"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_square</span>
                    </button>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); setPreHistoryOpen(false); }}
                      className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')}
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                  {/* List */}
                  <div className="overflow-y-auto custom-scrollbar px-2 py-2">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
                        <p className={cn('text-[13px] font-bold', isDark ? 'text-white/80' : 'text-[#1D192B]')}>No history yet</p>
                        <p className={cn('text-[11px]', isDark ? 'text-white/40' : 'text-[#49454F]')}>Start a conversation and it will appear here</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
                        {conversations.map(c => (
                          <div key={c.id} className="group relative">
                            <button type="button"
                              onClick={(e) => { e.stopPropagation(); loadConversation(c.id); setPreHistoryOpen(false); }}
                              className={cn('w-full text-left px-3 py-2.5 rounded-xl transition-colors flex flex-col gap-0.5 pr-8', isDark ? 'hover:bg-white/6' : 'hover:bg-black/4')}
                            >
                              <span className={cn('text-[12px] font-semibold truncate', isDark ? 'text-white/90' : 'text-[#1D192B]')}>{c.title}</span>
                              <span className={cn('text-[10px]', isDark ? 'text-white/35' : 'text-[#49454F]/70')}>{new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </button>
                            <button type="button"
                              onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); fetch(`/api/conversations/${c.id}`, { method: 'DELETE' }).then(() => setConversations(prev => prev.filter(x => x.id !== c.id))).catch(() => {}); }}
                              className={cn('absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity', isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/10' : 'text-black/30 hover:text-black/60 hover:bg-black/8')}
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Suggestion lane (kept mounted so the expanded pill never jumps) ── */}
            <AnimatePresence>
              {isExpanded && !chatOpen && (!pillStartersDismissed || trimmedSearchQuery.length > 0) && (
                <motion.div
                  key="pill-starters"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  onMouseEnter={handlePillMouseEnter}
                  onMouseLeave={handlePillMouseLeave}
                  className="order-last flex flex-col items-center gap-0 pointer-events-auto w-full px-1 min-h-[44px]"
                >
                  {/* invisible hover bridge — keeps pointer events alive as mouse travels from pill down to suggestions */}
                  <div className="w-full h-3 pointer-events-auto" onMouseEnter={handlePillMouseEnter} onMouseLeave={handlePillMouseLeave} />
                  <div 
                    className={cn(
                      "flex flex-row items-center justify-center gap-1.5 w-full select-none py-0.5",
                      trimmedSearchQuery.length > 0
                        ? "flex-nowrap overflow-x-auto no-scrollbar"
                        : "flex-wrap"
                    )}
                  >
                  {trimmedSearchQuery.length > 0 ? (
                    searchSuggestionItems.length > 0 ? (
                      searchSuggestionItems.map(item => (
                        <button
                          type="button"
                          key={`${item.type}-${item.id}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSearchResult(item, 'suggestion');
                          }}
                          className={cn(
                            'inline-flex items-center gap-1.5 h-[29px] min-w-0 max-w-[240px] px-3.5 rounded-full text-[11px] leading-none font-semibold transition-colors whitespace-nowrap shadow-[0_1px_3px_rgba(26,115,232,0.25)] shrink',
                            isDark
                              ? 'bg-[#1A73E8]/20 text-[#74BBFF] hover:bg-[#1A73E8]/35 border border-[#1A73E8]/35'
                              : 'bg-[#1A73E8] text-white hover:bg-[#1557B0] border border-[#1A73E8]',
                          )}
                        >
                          <span className="material-symbols-outlined text-[13px] leading-none shrink-0">{item.icon}</span>
                          <span className="truncate min-w-0 flex-1">{searchSuggestionLabel(item)}</span>
                          <span className={cn('text-[8px] leading-none font-black uppercase tracking-wide shrink-0', isDark ? 'text-white/45' : 'text-white/65')}>
                            {item.type === 'ticket' ? 'Ticket' : item.type === 'guide' ? 'Guide' : 'View'}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className={cn(
                        'inline-flex items-center gap-1.5 h-[29px] px-3.5 rounded-full text-[11px] leading-none font-semibold border whitespace-nowrap',
                        isDark ? 'bg-white/6 text-white/45 border-white/10' : 'bg-[#E9EEF6] text-[#5f6368] border-[#DDE5F2]',
                      )}>
                        <span className="material-symbols-outlined text-[13px] leading-none">travel_explore</span>
                        Search "{trimmedSearchQuery}"
                      </span>
                    )
                  ) : pillStartersLoading && pillStarters.length === 0 ? (
                    [110, 138, 90].map((w, i) => (
                      <span
                        key={i}
                        className="gemini-skel rounded-full h-[29px]"
                        style={{ width: w, animationDelay: `${i * 0.12}s` }}
                        aria-hidden="true"
                      />
                    ))
                  ) : (
                    (pillStarters.length > 0
                      ? pillStarters
                      : screenContext?.suggestions?.slice(0, 3) ?? [
                          'Fix Gmail bounce rate',
                          'Check SPF/DKIM setup',
                          'IP warming guidance',
                        ]
                    ).slice(0, 3).map((s, i) => (
                      <motion.button type="button"
                        key={i}
                        initial={{ opacity: 0, y: 8, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.94, transition: { duration: 0.08 } }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: i * 0.055 }}
                        onClick={() => sendMessage(s)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap',
                          isDark
                            ? 'bg-[#1A73E8]/20 text-[#74BBFF] hover:bg-[#1A73E8]/35 border border-[#1A73E8]/35'
                            : 'bg-[#1A73E8] text-white hover:bg-[#1557B0] border border-[#1A73E8]',
                          'shadow-[0_1px_3px_rgba(26,115,232,0.25)]',
                        )}
                      >
                        {s}
                      </motion.button>
                    ))
                  )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── The pill ── */}
            <div
              className={cn(
                'relative flex items-center mx-auto transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                'shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]',
                isExpanded
                  ? cn(
                      'w-full h-14 rounded-[28px] border cursor-default shadow-[0_4px_16px_rgba(60,64,67,0.15)]',
                      isDark ? 'bg-[#1E1D22] border-white/12' : 'bg-white border-[#E0E4EC]',
                    )
                  : cn(
                      'w-20 h-7 rounded-full cursor-pointer transition-colors duration-200',
                      isDark ? 'bg-[#1E1D22] border border-white/12' : 'bg-white border border-[#E0E4EC]',
                    ),
              )}
              onMouseEnter={handlePillMouseEnter}
              onMouseLeave={handlePillMouseLeave}
              onClick={() => { if (!isExpanded) { setIsExpanded(true); focusInputWhenReady(); } }}
            >
              {/* Format dropdown — anchored to the pill so it overlays search/chat instead of moving them. */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    key="fmt-dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: [0.175, 0.885, 0.32, 1.15] }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                    onClick={e => e.stopPropagation()}
                    className={cn(
                      'absolute bottom-[calc(100%+8px)] left-[72px] w-44 rounded-xl border py-1.5 z-[120]',
                      isDark
                        ? 'bg-[#2C2B30] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                        : 'bg-white border-[#E0E4EC] shadow-[0_4px_20px_rgba(0,0,0,0.1)]',
                    )}
                  >
                    <div className="absolute bottom-[-16px] left-0 right-0 h-4" />
                    {FORMAT_OPTIONS.map(fmt => (
                      <button type="button"
                        key={fmt}
                        onClick={e => { e.stopPropagation(); handleFormatSelect(fmt); }}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-colors',
                          isDark ? 'text-white/90 hover:bg-white/8' : 'text-[#1F1F1F] hover:bg-[#F1F3F4]',
                          selectedFormat === fmt && 'text-[#1A73E8]',
                        )}
                      >
                        <span>{fmt}</span>
                        {selectedFormat === fmt && <span className="material-symbols-outlined text-[#1A73E8] text-[16px]">check</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {expandKey > 0 && (
                <span
                  key={expandKey}
                  className="gemini-pill-glow-border"
                  style={{ '--pill-glow-radius': isExpanded ? '28px' : '9999px' } as React.CSSProperties}
                  aria-hidden="true"
                />
              )}
              {/* Perimeter sweep glow while generating in background (collapsed state) */}
              {(isLoading || panelIsLoading) && !isExpanded && (
                <span className="gemini-pill-loading-glow" aria-hidden="true" />
              )}

              {/* Collapsed star */}
              <div className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 transition-all duration-[180ms]',
                isDark ? 'text-[#D2E3FC]' : 'text-[#041e49]',
                isExpanded ? 'opacity-0 scale-50' : 'opacity-100 scale-100',
              )}>
                <GeminiIcon className="w-[18px] h-[18px]" />
              </div>

              {/* Expanded grid */}
              <div className={cn(
                'grid w-full h-full px-4 gap-3 items-center transition-all duration-[180ms] grid-cols-[auto_1fr_auto]',
                isExpanded ? 'opacity-100 visible [transition-delay:80ms]' : 'opacity-0 invisible',
              )}>

                {/* Left toolbar */}
                <div className="flex items-center gap-1">
                  {!chatOpen && (
                    <button type="button"
                      onClick={e => { e.stopPropagation(); setPreHistoryOpen(v => !v); if (!preHistoryOpen) fetch('/api/conversations').then(r => r.json()).then(d => setConversations(d.conversations || [])).catch(() => {}); }}
                      title="History"
                      className={cn(
                        'w-9 h-9 flex items-center justify-center rounded-full transition-colors',
                        preHistoryOpen
                          ? isDark ? 'bg-white/12 text-white/90' : 'bg-black/8 text-[#1F1F1F]'
                          : isDark ? 'text-white/60 hover:bg-white/8' : 'text-[#444746] hover:bg-black/8',
                      )}
                    >
                      <span className="material-symbols-outlined text-[20px]">menu</span>
                    </button>
                  )}
                  <button type="button"
                    onClick={e => { e.stopPropagation(); onSelectorToggle(!selectorActive); }}
                    title={isInvestigation ? 'Click a section tab to add its ticket data as context' : 'Add context'}
                    className={cn(
                      'h-9 flex items-center justify-center overflow-hidden rounded-full transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
                      selectorActive ? 'w-[82px] gap-1.5 px-3' : 'w-9 px-0',
                      selectorActive
                        ? isDark ? 'bg-[#1A73E8]/20 text-[#D2E3FC]' : 'bg-[#E8F0FE] text-[#1A73E8]'
                        : isDark ? 'text-white/60 hover:bg-white/8' : 'text-[#444746] hover:bg-black/8',
                    )}
                  >
                    {selectorActive ? (
                      <>
                        <span className="material-symbols-outlined shrink-0 text-[17px]">close</span>
                        <span className="shrink-0 text-[12px] font-black">Done</span>
                      </>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    )}
                  </button>

                  <button type="button"
                    onClick={e => { e.stopPropagation(); snap.current.isDropdownOpen = !isDropdownOpen; setIsDropdownOpen(v => !v); }}
                    title="Response format"
                    className={cn(
                      'flex items-center justify-center rounded-full transition-all',
                      selectedFormat !== 'Standard'
                        ? 'h-9 px-3 gap-1.5 bg-[#D3E3FD] text-[#1A73E8]'
                        : cn(
                            'w-9 h-9',
                            isDropdownOpen
                              ? isDark ? 'bg-white/12 text-white/90' : 'bg-black/8 text-[#1F1F1F]'
                              : isDark ? 'text-white/60 hover:bg-white/8' : 'text-[#444746] hover:bg-black/8',
                          ),
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                    {selectedFormat !== 'Standard' && <span className="text-xs font-bold leading-none">{selectedFormat}</span>}
                  </button>
                </div>

                {/* Input */}
                <div className="relative flex items-center min-w-0 overflow-hidden">
                  <div className="flex items-center flex-wrap gap-1 w-full">
                    {chips.map(chip => (
                      <span key={chip.label} className="inline-flex items-center gap-0.5 bg-[#D3E3FD] text-[#041e49] text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0">
                        {chip.label}
                        <button type="button" onClick={e => { e.stopPropagation(); removeChip(chip.label); }} className="opacity-50 hover:opacity-100 ml-0.5">
                          <span className="material-symbols-outlined text-[11px]">close</span>
                        </button>
                      </span>
                    ))}
                    <div
                      ref={inputRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={e => updatePillInput((e.target as HTMLElement).innerText)}
                      onFocus={() => { setIsFocused(true); setIsExpanded(true); }}
                      onBlur={() => { setIsFocused(false); evaluateCollapse(); }}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          clearPillInput();
                          setIsExpanded(false);
                        }
                      }}
                      className={cn('flex-1 min-w-[60px] bg-transparent outline-none text-[15px] leading-6 caret-[#1A73E8]', isDark ? 'text-white' : 'text-[#1F1F1F]')}
                    />
                  </div>
                  {!inputText && chips.length === 0 && (
                    <span className={cn(
                      'absolute left-0 text-[15px] leading-6 pointer-events-none whitespace-nowrap select-none',
                      selectorHint
                        ? 'text-[#1A73E8]/60 text-[13px] italic'
                        : isDark ? 'text-white/35' : 'text-[#70757a]',
                    )}>
                      {selectorHint ?? 'Ask Gemini or type to search'}
                    </span>
                  )}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button"
                    onClick={e => { e.stopPropagation(); handleSplitscreen(e); }}
                    title="Open full Gemini panel"
                    className={cn('w-9 h-9 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/60 hover:bg-white/8' : 'text-[#444746] hover:bg-black/8')}
                  >
                    <span className="material-symbols-outlined text-[20px]">splitscreen</span>
                  </button>

                  {isLoading ? (
                    <button type="button"
                      onClick={e => {
                        e.stopPropagation();
                        abortRef.current?.abort();
                        abortRef.current = null;
                        setIsLoading(false);
                        setStreamingText('');
                        setChatHistory(prev => [...prev, { type: 'assistant', text: "Ok. Let's keep chatting! Your turn." }]);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full transition-all bg-[#0b57d0] text-white hover:bg-[#0842a0] hover:scale-105 cursor-pointer"
                      title="Stop generation"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="8" cy="8" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.7"/>
                        <rect x="5" y="5" width="6" height="6" rx="1"/>
                      </svg>
                    </button>
                  ) : (
                    <button type="button"
                      onClick={e => { e.stopPropagation(); sendMessage(); }}
                      disabled={!hasContent}
                      className={cn(
                        'w-9 h-9 flex items-center justify-center rounded-full transition-all',
                        hasContent
                          ? 'bg-[#0b57d0] text-white hover:bg-[#0842a0] hover:scale-105 cursor-pointer'
                          : isDark ? 'bg-white/8 text-white/20 cursor-default' : 'bg-[#F1F3F4] text-[#BFBFBF] cursor-default',
                      )}
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
