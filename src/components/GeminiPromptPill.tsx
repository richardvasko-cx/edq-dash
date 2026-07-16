import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { marked } from 'marked';
import { cn } from '../App';
import GeminiIcon from './GeminiIcon';
import { ChatSparkIcon, DocSparkIcon } from './SparkIcons';
import MarkdownContent from './MarkdownContent';
import { SourcesPill, SuggestedArticlesPill, type AnswerEvidence, type AppAction, type ChatMessage, type GuideArticle } from './AiPanel';
import type { ScreenContext } from '../contexts/AiPanel';
import { prepareGeminiAttachments, type GeminiAttachment } from '../utils/geminiAttachments';
import GoogleGIcon from './GoogleGIcon';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';

type Format = 'Standard' | 'Shorter' | 'Expand' | 'Formal' | 'Bulletize' | 'Data +';

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
  files?: Array<{ name: string }>;
  searchGrounded?: boolean;
  articles?: GuideArticle[];
  actions?: AppAction[];
  thinking?: string[];
  evidence?: AnswerEvidence[];
  // Continuity suggestions: secondary pinned panels the model set aside, surfaced
  // as clickable pills so the agent can dig into each without retyping.
  followups?: ContextChip[];
  suggestedModel?: { id: string; label: string };
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
  isDraggingFile?: boolean;
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

const FORMAT_OPTIONS: Format[] = ['Standard', 'Shorter', 'Expand', 'Formal', 'Bulletize', 'Data +'];

const FORMAT_INSTRUCTIONS: Record<Format, string> = {
  'Standard': '',
  'Shorter': 'Be concise — answer in 2-3 sentences maximum. ',
  'Expand': 'Expand the context and provide technical detail — include exact values, commands, and supporting specifics. ',
  'Formal': 'Adopt a formal tone. Make it highly technical, concise, and to the point. ',
  'Bulletize': 'Summarize the answer in a concise, highly technical bullet point format. ',
  'Data +': 'Lead with key metrics and data points before explaining. Include specific numbers where available. ',
};
const FORMAT_ICONS: Record<Format, string> = {
  'Standard': 'notes',
  'Shorter': 'compress',
  'Expand': 'expand_content',
  'Formal': 'work',
  'Bulletize': 'format_list_bulleted',
  'Data +': 'bar_chart',
};

const REFINE_DISPLAY_LABEL: Record<'shorter' | 'technical' | 'data' | 'formal' | 'bulletize' | 'standard', string> = {
  shorter: 'Shorter',
  technical: 'Expand',
  data: '+ Data',
  formal: 'Formal',
  bulletize: 'Bulletize',
  standard: 'Standard',
};

// Suggested questions are an action affordance, not a summary. Keep them as
// brief as the local app even if a remote model ignores its word limit.
function compactStarterSuggestion(value: string): string {
  const cleaned = String(value || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const withoutPunctuation = cleaned.replace(/[.?!]+$/, '');
  if (/^are there\b/i.test(withoutPunctuation)) return `Check ${withoutPunctuation.replace(/^are there (?:any |other )?/i, '').split(' ').slice(0, 5).join(' ')}`;
  if (/^have you\b/i.test(withoutPunctuation)) return `Review ${withoutPunctuation.replace(/^have you (?:reviewed|checked|requested|confirmed)\s+/i, '').split(' ').slice(0, 5).join(' ')}`;
  if (/^can you\b/i.test(withoutPunctuation)) return `Check ${withoutPunctuation.replace(/^can you (?:confirm|check|review)\s+/i, '').split(' ').slice(0, 5).join(' ')}`;
  const words = withoutPunctuation.split(' ').filter(Boolean);
  const compact = words.slice(0, 6).join(' ').replace(/[,:;]+$/, '');
  return /^(how|what|why|when)\b/i.test(compact) ? `${compact}?` : compact;
}

function workspacePanelLabel(label?: string): string {
  return (label || '').split(' · ')[0].trim();
}

function displayTextIcon(label?: string): string {
  switch (workspacePanelLabel(label)) {
    case 'Customer Issue': return 'contact_support';
    case 'Root Cause': return 'search';
    case 'Authentication': return 'shield';
    case 'Deliverability': return 'mark_email_unread';
    case 'Email Performance': return 'equalizer';
    case 'Support History': return 'history';
    case 'Recommended Actions': return 'checklist';
    case 'Next Steps': return 'checklist';
    case 'Final Ticket Response': return 'drafts';
    case 'Shorter': return 'compress';
    case 'Expand': return 'expand_content';
    case '+ Data': return 'bar_chart';
    case 'Formal': return 'work';
    case 'Bulletize': return 'format_list_bulleted';
    case 'Standard': return 'notes';
    default: return 'auto_stories';
  }
}

const WORKSPACE_PROMPT_DISPLAY_LABELS = new Set([
  'Customer Issue',
  'Root Cause',
  'Authentication',
  'Deliverability',
  'Email Performance',
  'Support History',
  'Next Steps',
  'Final Ticket Response',
]);

function isWorkspacePromptEntry(entry?: ChatEntry): boolean {
  return Boolean(entry?.displayText && WORKSPACE_PROMPT_DISPLAY_LABELS.has(workspacePanelLabel(entry.displayText)));
}

function isWorkspaceDisplayTitle(title?: string): boolean {
  return Boolean(title && WORKSPACE_PROMPT_DISPLAY_LABELS.has(workspacePanelLabel(title)));
}

function conversationTitleFor(entries: ChatEntry[]): string | undefined {
  const firstWorkspacePrompt = entries.find(entry => entry.type === 'user' && isWorkspacePromptEntry(entry));
  return firstWorkspacePrompt?.displayText;
}

const SUGGESTED_PROMPTS = [
  'When should I move a domain from p=quarantine to p=reject?',
  'What SPF record patterns trigger PermError at Gmail?',
  "How do I read Microsoft's SNDS data for an IP?",
];

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
  if (ctx.guidePath) lines.push(`Active guide path: ${ctx.guidePath}`);
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
  isDraggingFile = false,
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
  const [files, setFiles] = useState<GeminiAttachment[]>([]);
  const [searchGrounding, setSearchGrounding] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filePickerOpenRef = useRef(false);

  const addMultipleFiles = async (fileList: File[]) => {
    const prepared = await prepareGeminiAttachments(fileList);
    setFiles(prev => [...prev, ...prepared.filter(file => !prev.some(existing => existing.name === file.name))]);
  };

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  const openFilePicker = () => {
    filePickerOpenRef.current = true;
    setIsExpanded(true);
    const handleReturn = () => {
      window.setTimeout(() => {
        filePickerOpenRef.current = false;
        setIsExpanded(true);
        focusInputWhenReady();
      }, 0);
    };
    window.addEventListener('focus', handleReturn, { once: true });
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const handleAddFiles = (e: Event) => {
      const customEvent = e as CustomEvent<{ files: File[] }>;
      if (customEvent.detail && customEvent.detail.files) {
        addMultipleFiles(customEvent.detail.files);
      }
    };
    window.addEventListener('gemini-pill-add-files', handleAddFiles);
    return () => window.removeEventListener('gemini-pill-add-files', handleAddFiles);
  }, []);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<Format>('Standard');
  const [moreFormatsOpen, setMoreFormatsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [openThinkingMessage, setOpenThinkingMessage] = useState<number | null>(null);
  const [inlineSuggestion, setInlineSuggestion] = useState('');
  const [activeSearchCategory, setActiveSearchCategory] = useState<GeminiSearchItem['type'] | null>(null);
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
  const [modelToast, setModelToast] = useState<string | null>(null);
  const [pillOpenGlowKey, setPillOpenGlowKey] = useState(0);
  // Pre-chat history panel (shown above pill before any chat is open)
  const [preHistoryOpen, setPreHistoryOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteAbortRef = useRef<AbortController | null>(null);
  const lastAcceptedAutocompleteRef = useRef('');
  const pillWrapperRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAiOpen = useRef(isAiPanelOpen);

  const clearPillInput = () => {
    setInputText('');
    setInlineSuggestion('');
    lastAcceptedAutocompleteRef.current = '';
    onSearchQueryChange?.('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const updatePillInput = (value: string) => {
    if (value.trimEnd().toLowerCase() !== lastAcceptedAutocompleteRef.current) {
      lastAcceptedAutocompleteRef.current = '';
    }
    setInputText(value);
    setInlineSuggestion('');
    onSearchQueryChange?.(value);
  };

  const acceptInlineSuggestion = () => {
    const cursor = inputRef.current?.selectionStart ?? inputText.length;
    const before = inputText.slice(0, cursor);
    const after = inputText.slice(cursor);
    const currentWord = before.match(/(\S+)$/)?.[1] ?? '';
    const wouldCompleteKnownToken = currentWord.length > 0 && searchResults.some(item => {
      const haystack = `${item.title} ${item.subtitle ?? ''} ${item.meta ?? ''}`.toLowerCase();
      return haystack.split(/[\s>·:;,/()[\]{}'"-]+/).some(token =>
        token.startsWith(`${currentWord}${inlineSuggestion}`.toLowerCase()),
      );
    });
    const spacer = before.length > 0
      && /\S$/.test(before)
      && /^\S/.test(inlineSuggestion)
      && !wouldCompleteKnownToken
      ? ' '
      : '';
    const nextValue = `${before}${spacer}${inlineSuggestion}${after}`;
    lastAcceptedAutocompleteRef.current = nextValue.trimEnd().toLowerCase();
    updatePillInput(nextValue);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      const nextCursor = before.length + spacer.length + inlineSuggestion.length;
      inputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  useEffect(() => {
    autocompleteAbortRef.current?.abort();
    const text = inputText.trimEnd();
    // Only complete a search/topic fragment. Questions are intentionally left to
    // Gemini on Enter so a predictive answer can never be injected into the field.
    if (!geminiEnabled || isLoading || !isExpanded || text.length < 4 || /[?.!]$/.test(text)
      || /^(how|why|what|when|where|who|which|can|could|should|would|do|does|did|is|are|will)\b/i.test(text)
      || text.toLowerCase() === lastAcceptedAutocompleteRef.current) return;
    const timer = window.setTimeout(async () => {
      const controller = new AbortController();
      autocompleteAbortRef.current = controller;
      try {
        const response = await fetch('/api/gemini/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, screen: serializeScreenContext(screenContext) }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!controller.signal.aborted && inputRef.current?.value.trimEnd() === text) {
          const suggestion = String(data.suggestion || '');
          const normalizedSuggestion = suggestion.trim().toLowerCase();
          const normalizedText = text.toLowerCase();
          if (!normalizedSuggestion || normalizedText.endsWith(normalizedSuggestion) || normalizedText === lastAcceptedAutocompleteRef.current) {
            setInlineSuggestion('');
          } else {
            setInlineSuggestion(suggestion);
          }
        }
      } catch {}
    }, 260);
    return () => { window.clearTimeout(timer); autocompleteAbortRef.current?.abort(); };
  }, [geminiEnabled, inputText, isExpanded, isLoading, screenContext]);

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

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const showModelToast = (event: Event) => {
      const label = (event as CustomEvent<{ label?: string }>).detail?.label || 'Gemini model';
      const displayLabel = label.replace(/^Gemini\s+/i, '');
      setModelToast(`Updated to ${displayLabel}`);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setModelToast(null), 1800);
    };
    window.addEventListener('edq-gemini-model-change', showModelToast);
    return () => {
      window.removeEventListener('edq-gemini-model-change', showModelToast);
      if (timeout) clearTimeout(timeout);
    };
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
        thinking: m.thinking,
        chips: m.chips?.map(c => ({ label: c.label, content: '' })),
        files: m.files,
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
        thinking: m.thinking,
        chips: m.chips?.map(c => ({ label: c.label, content: '' })),
        files: m.files,
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
    selectorActive: false, isDropdownOpen: false, isPlusMenuOpen: false, chatOpen: false, isLoading: false, chatMinimized: false, preHistoryOpen: false, historyView: false, isExpanded: false,
  });
  useEffect(() => {
    snap.current.isFocused = isFocused;
    snap.current.inputText = inputText;
    snap.current.chips = chips;
    snap.current.selectorActive = selectorActive;
    snap.current.isDropdownOpen = isDropdownOpen;
    snap.current.isPlusMenuOpen = isPlusMenuOpen;
    snap.current.chatOpen = chatOpen;
    snap.current.isLoading = isLoading;
    snap.current.chatMinimized = chatMinimized;
    snap.current.preHistoryOpen = preHistoryOpen;
    snap.current.historyView = historyView;
    snap.current.isExpanded = isExpanded;
  });

  // Expand pill immediately when context selector activates
  useEffect(() => {
    if (selectorActive) setIsExpanded(true);
  }, [selectorActive]);

  // Re-open chat only when there is a completed reply. A queued first prompt
  // remains in the pill until its answer is ready.
  useEffect(() => {
    if (isExpanded && chatHistory.some(item => item.type === 'assistant') && !chatOpen) {
      setChatOpen(true);
    }
  }, [isExpanded, chatHistory, chatOpen]);

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
      .then(d => {
        if (!cancelled) {
          setPillStarters(Array.isArray(d.suggestions)
            ? d.suggestions.map(compactStarterSuggestion).filter(Boolean).slice(0, 3)
            : []);
        }
      })
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

  useEffect(() => {
    if (!prevAiOpen.current && isAiPanelOpen) {
      setIsExpanded(false);
      setChatOpen(false);
      setIsDropdownOpen(false);
      setIsPlusMenuOpen(false);
    }
    prevAiOpen.current = isAiPanelOpen;
  }, [isAiPanelOpen]);

  useEffect(() => {
    if (isExpanded) setPillOpenGlowKey(key => key + 1);
  }, [isExpanded]);

  useEffect(() => {
    if (!pendingChip) return;
    setChips(prev => {
      if (prev.find(c => c.label === pendingChip.label)) {
        return prev.map(c => c.label === pendingChip.label ? pendingChip : c);
      }
      return [...prev, pendingChip];
    });
    setIsExpanded(true);
    onChipConsumed();
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
      // Suggestions are visually attached to the pill but live outside its
      // wrapper so they can animate independently. Treat them as inside.
      if (pillWrapperRef.current?.contains(e.target as Node) || (e.target as Element).closest?.('[data-gemini-suggestion-lane]')) return;
      // Never close pill when history panels are open — let explicit close buttons handle it.
      if (s.historyView || s.preHistoryOpen) return;
      if (s.selectorActive) return;
      if (s.isLoading) {
        // Keep generating, just minimize.
        setChatMinimized(true);
        setIsExpanded(false);
        setIsDropdownOpen(false);
        setIsPlusMenuOpen(false);
      } else if (s.chatOpen || s.isDropdownOpen || s.isPlusMenuOpen || s.isExpanded) {
        setChatMinimized(false);
        setChatOpen(false);
        setIsExpanded(false);
        setIsDropdownOpen(false);
        setIsPlusMenuOpen(false);
        setPreHistoryOpen(false);
        setHistoryOpen(false);
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
      // Streaming owns the expanded pill until the user deliberately clicks
      // outside it. In particular, unmounting suggested prompts must not make
      // their mouse-leave event collapse an in-flight request.
      if (s.isLoading) return;
      const hasContent = s.inputText.trim().length > 0 || s.chips.length > 0 || files.length > 0;
      // Never collapse when chat is open — pill stays expanded while conversation is active
      if (!filePickerOpenRef.current && !s.isPillHovered && !s.isDropdownHovered && !s.isFocused && !hasContent && !s.selectorActive && !s.isDropdownOpen && !s.chatOpen && !s.preHistoryOpen && !s.historyView) {
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

  const hasContent = inputText.trim().length > 0 || chips.length > 0 || files.length > 0;
  const chipLabelLength = chips.reduce((total, chip) => total + chip.label.length, 0);
  const composerLoad = inputText.length + Math.min(inlineSuggestion.length, 36) + chipLabelLength + Math.max(0, chips.length - 1) * 8;
  const composerWidth = isExpanded
    ? composerLoad > 82
      ? 920
      : composerLoad > 50
      ? 800
      : 680
    : 680;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '24px';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 24), 92)}px`;
  }, [inputText, inlineSuggestion, chips.length, isExpanded, composerWidth]);

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

  const switchSuggestedModel = async (model: { id: string; label: string }, failedAnswerIndex: number) => {
    const response = await fetch('/api/gemini/model', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model.id }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to update Gemini model');
    window.dispatchEvent(new CustomEvent('edq-gemini-model-change', { detail: { active: data.active, label: model.label } }));
    const historyUntilFailure = chatHistory.slice(0, failedAnswerIndex);
    const retryIndex = [...historyUntilFailure].map((entry, index) => ({ entry, index })).reverse().find(({ entry }) => entry.type === 'user')?.index;
    if (retryIndex === undefined) return;
    const retry = historyUntilFailure[retryIndex];
    setChatHistory(historyUntilFailure.slice(0, retryIndex));
    sendMessage(retry.text, undefined, historyUntilFailure.slice(0, retryIndex), retry.edited, retry.displayText);
  };

  // Edit a user prompt inline within its bubble. Clicking edit turns the bubble
  // into an editable field; approving re-runs the chat from that point and
  // discards everything generated after it.
  const editPrompt = (idx: number) => {
    if (isLoading) { abortRef.current?.abort(); abortRef.current = null; setIsLoading(false); setStreamingText(''); }
    const entry = chatHistory[idx];
    if (!entry || entry.type !== 'user') return;
    setEditingIdx(idx);
    setEditingText(isWorkspacePromptEntry(entry) ? '' : entry.text);
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
    if (isWorkspacePromptEntry(original)) {
      sendMessage(`${original.text}\n\nAdditional consultant instruction:\n${trimmed}`, [], base, true, original.displayText);
      return;
    }
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
    if (!text && activeChips.length === 0 && files.length === 0) return;

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
    const apiPrompt = contextualText || (files.length > 0 && activeChips.length === 0
      ? `Analyze the attached file${files.length === 1 ? '' : 's'}. Identify the content, summarize the important findings, and call out any risks, anomalies, or useful next actions supported by the file.`
      : pinsUnrelated
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
    const entry: ChatEntry = { type: 'user', text, chips: activeChips, files: files.map(file => ({ name: file.name })), searchGrounded: searchGrounding, edited, displayText: displayText || undefined };
    const prevHistory = baseHistoryOverride ?? chatHistory;


    if (!geminiEnabled) {
      if (baseHistoryOverride) setChatHistory([...baseHistoryOverride, entry]);
      else setChatHistory(prev => [...prev, entry]);
      setChatOpen(true);
      setPreHistoryOpen(false);
      clearPillInput();
      setChips([]);
      setFiles([]);
      setPillStartersDismissed(true);
      setTimeout(() => {
        const disabledText = '⚠️ **Gemini API is disabled in Settings.** Please enable it to chat.';
        setChatHistory(prev => [...prev, { type: 'assistant', text: disabledText, actions: ensureLocalAppActions(disabledText) }]);
      }, 300);
      return;
    }

    const snapshotFiles = [...files];
    const snapshotSearchGrounding = searchGrounding;
    if (baseHistoryOverride) setChatHistory([...baseHistoryOverride, entry]);
    else setChatHistory(prev => [...prev, entry]);
    // Keep the first request inside the glowing pill. Once a completed reply
    // exists, follow-ups retain the open conversation panel.
    setChatOpen(prevHistory.some(item => item.type === 'assistant'));
    setPreHistoryOpen(false);
    loadingStartRef.current = Date.now();
    setIsLoading(true);
    clearPillInput();
    setChips([]);
    setFiles([]);
    setSearchGrounding(false);
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
    let thinking: string[] = [];
    let evidence: AnswerEvidence[] = [];
    let suggestedModel: ChatEntry['suggestedModel'];
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
          dateRange: screenContext?.dateRange ? { from: screenContext.dateRange.from, to: screenContext.dateRange.to } : undefined,
          files: snapshotFiles.length > 0 ? snapshotFiles : undefined,
          googleSearch: snapshotSearchGrounding,
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
            else if (parsed.thought) { /* streaming status is intentionally visual-only */ }
            else if (parsed.done) {
              answer = parsed.text || answer;
              articles = Array.isArray(parsed.articles) ? parsed.articles : [];
              actions = Array.isArray(parsed.actions) ? parsed.actions : [];
              thinking = Array.isArray(parsed.thinking) ? parsed.thinking : [];
              evidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];
            }
            else if (parsed.error) {
              if (parsed.suggestedModel) suggestedModel = { id: parsed.suggestedModel, label: parsed.suggestedModelLabel || 'Gemini 3.1 Flash Lite' };
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
    setChatHistory(prev => [...prev, { type: 'assistant', text: finalAnswer, articles, actions: finalActions, followups: followups.length ? followups : undefined, thinking: thinking.length ? thinking : undefined, evidence: evidence.length ? evidence : undefined, suggestedModel }]);
    setIsLoading(false);
    setIsExpanded(true);
    setChatMinimized(false);

    // Auto-save conversation
    const allMsgs = [...prevHistory, entry, { type: 'assistant' as const, text: finalAnswer, articles, actions: finalActions, thinking: thinking.length ? thinking : undefined, evidence: evidence.length ? evidence : undefined }];
    const apiMsgs = allMsgs.map(e => ({ role: e.type === 'user' ? 'user' : 'assistant', content: e.chips?.length ? [e.text, ...e.chips.map(c => `[Context — ${c.label}]:\n${c.content}`)].filter(Boolean).join('\n\n') : e.text, displayContent: e.displayText || null, chips: e.chips?.length ? e.chips.map(c => ({ label: c.label })) : null, files: e.files?.length ? e.files : null, searchGrounded: e.searchGrounded || null, articles: e.articles?.length ? e.articles : null, actions: e.actions?.length ? e.actions : null, evidence: e.evidence?.length ? e.evidence : null }));
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: conversationIdRef.current, title: conversationTitleFor(allMsgs), messages: apiMsgs, source: 'pill' }),
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
      files: entry.files,
      searchGrounded: entry.searchGrounded,
      articles: entry.articles,
      actions: entry.actions,
      evidence: entry.evidence,
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
      const entries: ChatEntry[] = d.messages.map((m: any) => ({
        type: m.role === 'user' ? 'user' as const : 'assistant' as const,
        text: m.role === 'user' ? stripChipDump(m.content) : m.content,
        displayText: typeof m.displayContent === 'string' ? m.displayContent : undefined,
        chips: m.chips?.map((c: any) => ({ label: c.label, content: '' })),
        files: m.files?.length ? m.files : undefined,
        searchGrounded: Boolean(m.searchGrounded),
        articles: m.articles?.length ? m.articles : undefined,
        actions: m.actions?.length ? m.actions : undefined,
        evidence: m.evidence?.length ? m.evidence : undefined,
      }));
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
  // Questions are sent to Gemini on Enter; this panel is reserved for actual
  // indexed results only, never an "Ask Gemini" proxy row.
  const showSearchPanel = isExpanded && !chatOpen && !preHistoryOpen && !selectorActive && searchResults.length > 0;
  const groupedSearchResults = ([
    { type: 'guide' as const, label: 'User Guide', icon: 'menu_book' },
    { type: 'ticket' as const, label: 'Tickets', icon: 'confirmation_number' },
    { type: 'nav' as const, label: 'Navigation', icon: 'grid_view' },
  ]).map(group => ({
    ...group,
    items: searchResults.filter(item => item.type === group.type),
  })).filter(group => group.items.length > 0);
  const searchResultCount = groupedSearchResults.reduce((total, group) => total + group.items.length, 0);
  const activeSearchGroup = groupedSearchResults.find(group => group.type === activeSearchCategory) ?? groupedSearchResults[0];
  // Keep the picker calm and consistent: a single result should not shrink the
  // surface underneath the user while they are deciding what to open.
  const searchPanelHeight = Math.max(420, Math.min(470, 118 + (activeSearchGroup?.items.length ?? 0) * 62));
  const searchCrumbs = (item: GeminiSearchItem) =>
    (item.subtitle || '')
      .split('/')
      .map(part => part.trim())
      .filter(Boolean)
      .filter((part, idx) => idx !== 0 || part.toLowerCase() !== 'user guide');

  useEffect(() => {
    if (!activeSearchCategory || !groupedSearchResults.some(group => group.type === activeSearchCategory)) {
      setActiveSearchCategory(groupedSearchResults[0]?.type ?? null);
    }
  }, [activeSearchCategory, searchResultCount]);

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
          className="fixed bottom-6 inset-x-0 mx-auto z-[200] flex flex-col gap-3 pointer-events-none gemini-exclude transition-[width] duration-150"
          style={{ width: composerWidth, maxWidth: 'calc(100vw - 48px)' }}
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
                      <button type="button" onClick={() => { setHistoryView(false); setChatHistory([]); conversationIdRef.current = null; }} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')} title="New chat">
                        <span className="material-symbols-outlined text-[16px]">edit_square</span>
                      </button>
                      <button type="button" onClick={() => { setHistoryView(false); setChatOpen(false); setIsExpanded(false); }} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/8' : 'text-black/30 hover:text-black/55 hover:bg-black/5')}>
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <GeminiIcon className="w-4 h-4 shrink-0" />
                      <span className={cn('text-[15px] font-bold flex-1', isDark ? 'text-white' : 'text-[#1D192B]')}>Gemini</span>
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
                                      placeholder={isWorkspacePromptEntry(entry) ? `Add detail for ${entry.displayText}...` : undefined}
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
                                {(entry.chips?.length || entry.files?.length || entry.searchGrounded) ? (
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="flex flex-wrap gap-1 justify-end">
                                      {entry.chips?.map(c => (
                                        <span key={c.label} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A73E8]/15 text-[#1A73E8] dark:bg-[#74BBFF]/15 dark:text-[#74BBFF] border border-[#1A73E8]/20 dark:border-[#74BBFF]/20">
                                          #{c.label}
                                        </span>
                                      ))}
                                      {entry.files?.map(file => (
                                        <span key={file.name} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A73E8]/15 text-[#1A73E8] dark:bg-[#74BBFF]/15 dark:text-[#74BBFF] border border-[#1A73E8]/20 dark:border-[#74BBFF]/20">
                                          <span className="material-symbols-outlined text-[12px]">attach_file</span>{file.name}
                                        </span>
                                      ))}
                                      {entry.searchGrounded && (
                                        <span className="inline-flex h-5 items-center gap-1 rounded-full border border-[#DADCE0] bg-[#F1F3F4] px-1.5 text-[10px] font-medium text-[#3C4043]">
                                          <GoogleGIcon className="!h-[12px] !w-[12px]" /> Search
                                        </span>
                                      )}
                                    </div>
                                    {(entry.displayText || entry.text) && (
                                      <div className={cn('px-3 py-2 rounded-2xl rounded-br-sm', t.userBubble)}>
                                        <p className="text-[12px] leading-relaxed">{entry.displayText || entry.text}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : entry.displayText ? (
                                  <div className={cn('flex items-center gap-2 pl-3 pr-3.5 py-2.5 rounded-2xl rounded-br-sm', t.userBubble)}>
                                    <span className="material-symbols-outlined text-[15px] shrink-0 opacity-70">{displayTextIcon(entry.displayText)}</span>
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
                                {entry.thinking && entry.thinking.length > 0 ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={event => {
                                        event.stopPropagation();
                                        setOpenThinkingMessage(current => current === i ? null : i);
                                      }}
                                      aria-label={openThinkingMessage === i ? 'Hide Gemini thinking notes' : 'Show Gemini thinking notes'}
                                      aria-expanded={openThinkingMessage === i}
                                      className={cn('ml-1 flex h-6 items-center gap-1.5 text-[11px] font-semibold transition-colors', isDark ? 'text-white/50 hover:text-white/80' : 'text-[#7A7F87] hover:text-[#0B57D0]')}
                                    >
                                      <GeminiIcon className="h-4 w-4" />
                                      <span>Thinking</span>
                                      <span className={cn('material-symbols-outlined text-[15px] transition-transform', openThinkingMessage === i && 'rotate-180')}>expand_more</span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                      {openThinkingMessage === i && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0, y: -4 }}
                                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                                          exit={{ opacity: 0, height: 0, y: -4 }}
                                          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                                          className={cn('overflow-hidden border-b-2 border-[#1A73E8] pb-3 pt-1', isDark ? 'text-white/55' : 'text-[#7A7F87]')}
                                        >
                                          <ul className="space-y-1 text-[11px] leading-relaxed">
                                            {entry.thinking.map((note, noteIndex) => <li key={noteIndex}>{note}</li>)}
                                          </ul>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                    <MarkdownContent
                                      className={cn('mt-3 min-w-0 text-[12px] leading-relaxed ai-prose', t.prose, t.aiText)}
                                      content={entry.text}
                                      inlineActions={entry.actions}
                                      onRunAction={onRunAction}
                                      isDark={isDark}
                                    />
                                  </>
                                ) : (
                                  <div className="flex gap-2 items-start w-full">
                                    <GeminiIcon className={cn("ml-1 w-4 h-4 shrink-0 mt-0.5", isLoading && i === chatHistory.length - 1 && "gemini-twinkle")} />
                                    <MarkdownContent
                                      className={cn('flex-1 min-w-0 text-[12px] leading-relaxed ai-prose', t.prose, t.aiText)}
                                      content={entry.text}
                                      inlineActions={entry.actions}
                                      onRunAction={onRunAction}
                                      isDark={isDark}
                                    />
                                  </div>
                                )}
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
                                {entry.suggestedModel && (
                                  <button type="button" onClick={() => switchSuggestedModel(entry.suggestedModel!, i)} className="ml-[22px] mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[11px] font-bold text-[#0B57D0] transition-colors hover:bg-[#D2E3FC]">
                                    <span className="material-symbols-outlined text-[15px]">autorenew</span> Switch to {entry.suggestedModel.label}
                                  </button>
                                )}
                                <SourcesPill evidence={entry.evidence} isDark={isDark} onOpenArticle={onOpenArticle} />
                                <SuggestedArticlesPill articles={entry.articles} isDark={isDark} onOpenArticle={(path) => onOpenArticle ? onOpenArticle(path) : handleSplitscreen()} />
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
                          <div className="relative flex flex-wrap gap-1.5 pt-0.5 pl-5">
                            {([
                              { mode: 'shorter' as const, label: 'Shorter', icon: 'compress' },
                              { mode: 'technical' as const, label: 'Expand', icon: 'expand_content' },
                              { mode: 'data' as const, label: '+ Data', icon: 'bar_chart' },
                            ]).map(p => (
                              <button type="button"
                                key={p.mode}
                                onClick={() => {
                                  const labelMsg = p.mode === 'shorter' ? 'Make this shorter' : p.mode === 'technical' ? 'Expand the context and provide technical detail' : 'Show the supporting data';
                                  const prev: ChatEntry[] = [...chatHistory, { type: 'user' as const, text: labelMsg, displayText: REFINE_DISPLAY_LABEL[p.mode] }];
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
                                    const apiMsgs = finalEntries.map(e => ({ role: e.type === 'user' ? 'user' : 'assistant', content: e.chips?.length ? [e.text, ...e.chips.map(c => `[Context — ${c.label}]:\n${c.content}`)].filter(Boolean).join('\n\n') : e.text, displayContent: e.displayText || null, chips: e.chips?.length ? e.chips.map(c => ({ label: c.label })) : null }));
                                    fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: conversationIdRef.current, title: conversationTitleFor(finalEntries), messages: apiMsgs, source: 'pill' }) }).then(r => r.json()).then(d => { if (d.id) conversationIdRef.current = d.id; }).catch(() => {});
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

                            {/* More formats toggle */}
                            {(() => {
                              const MORE_FORMATS = [
                                { mode: 'formal' as const, label: 'Formal', icon: 'work' },
                                { mode: 'bulletize' as const, label: 'Bulletize', icon: 'format_list_bulleted' },
                                { mode: 'standard' as const, label: 'Standard', icon: 'notes' },
                              ];
                              return (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setMoreFormatsOpen(v => !v)}
                                    title="More formats"
                                    className={cn(
                                      'flex items-center gap-1 px-2 py-1 rounded-full text-[10.5px] font-semibold transition-colors',
                                      moreFormatsOpen
                                        ? 'bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#74BBFF] dark:bg-[#74BBFF]/20'
                                        : 'bg-[#1A73E8]/10 text-[#1A73E8] hover:bg-[#1A73E8]/20 dark:text-[#74BBFF] dark:bg-[#74BBFF]/10 dark:hover:bg-[#74BBFF]/20',
                                    )}
                                  >
                                    <span className="material-symbols-outlined text-[13px]">tune</span>
                                  </button>
                                  <AnimatePresence>
                                    {moreFormatsOpen && (
                                      <motion.div
                                        key="more-fmt"
                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                        transition={{ duration: 0.13, ease: [0.175, 0.885, 0.32, 1.15] }}
                                        className={cn(
                                          'absolute bottom-[calc(100%+6px)] left-0 w-36 rounded-xl border py-1.5 z-[130]',
                                          isDark
                                            ? 'bg-[#2C2B30] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                                            : 'bg-white border-[#E0E4EC] shadow-[0_4px_20px_rgba(0,0,0,0.12)]',
                                        )}
                                      >
                                        {MORE_FORMATS.map(mf => (
                                          <button
                                            type="button"
                                            key={mf.mode}
                                            onClick={() => {
                                              setMoreFormatsOpen(false);
                                              const labelMap: Record<string, string> = { formal: 'Make it more formal and technical', bulletize: 'Summarize as bullet points', standard: 'Rewrite in standard format' };
                                              const labelMsg = labelMap[mf.mode];
                                              const prev: ChatEntry[] = [...chatHistory, { type: 'user' as const, text: labelMsg, displayText: REFINE_DISPLAY_LABEL[mf.mode] }];
                                              setChatHistory(prev);
                                              setIsLoading(true);
                                              const screen = serializeScreenContext(screenContext);
                                              const histForApi = chatHistory.map(e => ({ role: e.type === 'user' ? 'user' as const : 'assistant' as const, content: e.chips?.length ? [e.text, ...e.chips.map(c => `[Context — ${c.label}]:\n${c.content}`)].filter(Boolean).join('\n\n') : e.text, timestamp: Date.now() }));
                                              const ticketRef2 = screenContext?.kind === 'ticket' ? { id: screenContext.recordId, account: screenContext.accountKey } : undefined;
                                              fetch('/api/user-guide/ask', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ prompt: `refine:${mf.mode}`, screen, ticketRef: ticketRef2, history: histForApi, mode: mf.mode, dateRange: screenContext?.dateRange ? { from: screenContext.dateRange.from, to: screenContext.dateRange.to } : undefined }),
                                              }).then(r => r.json()).then(d => {
                                                const ans = d.error ? `⚠️ ${d.error}` : (d.text || chatHistory[chatHistory.length - 1].text);
                                                const arts = Array.isArray(d.articles) ? d.articles : (d.article ? [d.article] : []);
                                                const finalEntries: ChatEntry[] = [...prev, { type: 'assistant' as const, text: ans, articles: arts }];
                                                setChatHistory(finalEntries);
                                                setIsLoading(false);
                                                const apiMsgs = finalEntries.map(e => ({ role: e.type === 'user' ? 'user' : 'assistant', content: e.chips?.length ? [e.text, ...e.chips.map(c => `[Context — ${c.label}]:\n${c.content}`)].filter(Boolean).join('\n\n') : e.text, displayContent: e.displayText || null, chips: e.chips?.length ? e.chips.map(c => ({ label: c.label })) : null }));
                                                fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: conversationIdRef.current, title: conversationTitleFor(finalEntries), messages: apiMsgs, source: 'pill' }) }).then(r => r.json()).then(d => { if (d.id) conversationIdRef.current = d.id; }).catch(() => {});
                                              }).catch(err => {
                                                setChatHistory([...prev, { type: 'assistant' as const, text: `⚠️ Could not reach Gemini: ${err.message}` }]);
                                                setIsLoading(false);
                                              });
                                            }}
                                            className={cn(
                                              'w-full flex items-center gap-2 px-3 py-2 text-[11.5px] font-medium transition-colors',
                                              isDark ? 'text-white/90 hover:bg-white/8' : 'text-[#1F1F1F] hover:bg-[#F1F3F4]',
                                            )}
                                          >
                                            <span className={cn('material-symbols-outlined text-[14px] shrink-0', isDark ? 'text-white/45' : 'text-[#5f6368]')}>{mf.icon}</span>
                                            {mf.label}
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })()}
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                                  <span className={cn('flex min-w-0 items-center gap-1.5 text-[12px] font-semibold', isDark ? 'text-white/90' : 'text-[#1D192B]')}>
                                    {isWorkspaceDisplayTitle(c.title) && <span className="material-symbols-outlined shrink-0 text-[15px] text-[#1A73E8]">{displayTextIcon(c.title)}</span>}
                                    <span className="truncate">{c.title}</span>
                                  </span>
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

                  {/* Scroll-down arrow is anchored to the answer viewport, not the composer. */}
                  <AnimatePresence>
                    {showScrollDown && !historyView && (
                      <motion.button type="button"
                        key="pill-scroll-down"
                        initial={{ opacity: 0, scale: 0.8, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 8 }}
                        onClick={() => scrollToBottom()}
                        className={cn(
                          'absolute right-3 bottom-3 z-20 w-7 h-7 rounded-full flex items-center justify-center border shadow-md transition-colors',
                          isDark ? 'bg-[#1E2035] border-white/10 text-white/70 hover:text-white' : 'bg-white border-[#E8EAED] text-[#5F6368] hover:text-[#1A73E8] hover:border-[#1A73E8]/30'
                        )}
                        title="Jump to latest"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

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

                  <div className="overflow-y-auto custom-scrollbar px-4 pb-4">
                    <div className={cn('flex items-end gap-5 border-b pt-2', isDark ? 'border-white/10' : 'border-outline-variant/20')}>
                      {groupedSearchResults.map(group => {
                        const active = activeSearchGroup?.type === group.type;
                        return (
                          <button
                            key={group.type}
                            type="button"
                            onClick={() => setActiveSearchCategory(group.type)}
                            className={cn(
                              'relative flex items-center gap-2 px-3 pb-3 pt-3 text-[15px] font-bold transition-colors rounded-t-xl',
                              active
                                ? 'text-[#1a73e8] dark:text-[#8AB4F8]'
                                : 'text-on-surface-variant hover:text-on-surface',
                            )}
                          >
                            <span className="material-symbols-outlined text-[25px] leading-none">{group.icon}</span>
                            <span>{group.label}</span>
                            <span className={cn('flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-black', active ? 'bg-[#5F6368] text-white' : isDark ? 'bg-white/15 text-white/70' : 'bg-[#E8EAED] text-[#5F6368]')}>
                              {group.items.length}
                            </span>
                            {active && (
                              <motion.span
                                layoutId="gemini-search-category-indicator"
                                className="absolute inset-x-0 -bottom-px h-[3px] rounded-t-full bg-[#1a73e8] dark:bg-[#8AB4F8]"
                                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {activeSearchGroup && (
                      <div className="pt-3">
                        {activeSearchGroup.items.map((item, idx) => {
                          const pathText = item.type === 'guide'
                            ? searchCrumbs(item).join(' › ')
                            : item.subtitle || '';
                          return (
                            <button
                              key={`${item.type}-${item.id}`}
                              type="button"
                              onClick={() => selectSearchResult(item)}
                              className={cn(
                                'flex w-full items-center gap-4 px-3 py-4 text-left transition-colors',
                                idx > 0 && (isDark ? 'border-t border-white/10' : 'border-t border-[#E8EAED]'),
                                isDark ? 'hover:bg-white/8' : 'hover:bg-[#F8F9FA]',
                              )}
                            >
                              <span className="min-w-0 flex-1">
                                <span className={cn('block truncate text-[15px] font-bold', isDark ? 'text-white/95' : 'text-[#202124]')}>
                                  {item.title}
                                </span>
                                {pathText && (
                                  <span className={cn('mt-0.5 block truncate text-[12px] font-medium', isDark ? 'text-white/50' : 'text-[#6B6470]')}>
                                    {pathText}
                                  </span>
                                )}
                              </span>
                              <span className={cn('material-symbols-outlined shrink-0 text-[27px]', isDark ? 'text-white/35' : 'text-[#D0D3D6]')}>arrow_forward</span>
                            </button>
                          );
                        })}
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
                              <span className={cn('flex min-w-0 items-center gap-1.5 text-[12px] font-semibold', isDark ? 'text-white/90' : 'text-[#1D192B]')}>
                                {isWorkspaceDisplayTitle(c.title) && <span className="material-symbols-outlined shrink-0 text-[15px] text-[#1A73E8]">{displayTextIcon(c.title)}</span>}
                                <span className="truncate">{c.title}</span>
                              </span>
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
              {isExpanded && !chatOpen && trimmedSearchQuery.length === 0 && !pillStartersDismissed && (
                <motion.div
                  key="pill-starters"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  onMouseEnter={handlePillMouseEnter}
                  onMouseLeave={handlePillMouseLeave}
                  data-gemini-suggestion-lane
                  className="order-last flex flex-col items-center gap-0 pointer-events-auto w-full px-1 min-h-[44px]"
                >
                  {/* invisible hover bridge — keeps pointer events alive as mouse travels from pill down to suggestions */}
                  <div className="w-full h-3 pointer-events-auto" onMouseEnter={handlePillMouseEnter} onMouseLeave={handlePillMouseLeave} />
                  <div 
                    className={cn(
                      "flex flex-row items-center justify-center gap-1.5 w-full select-none py-0.5",
                      "flex-wrap"
                    )}
                  >
                  {pillStartersLoading && pillStarters.length === 0 ? (
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
                    ).slice(0, 3).map(compactStarterSuggestion).filter(Boolean).map((s, i) => (
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
                      'w-full min-h-14 rounded-[28px] border cursor-default shadow-[0_4px_16px_rgba(60,64,67,0.15)]',
                      isDark ? 'bg-[#1E1D22] border-white/12' : 'bg-white border-[#E0E4EC]',
                    )
                  : cn(
                      'w-20 h-6 rounded-full cursor-pointer transition-colors duration-200',
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
                          'w-full flex items-center gap-2.5 justify-between px-4 py-2.5 text-[13px] font-medium transition-colors',
                          isDark ? 'text-white/90 hover:bg-white/8' : 'text-[#1F1F1F] hover:bg-[#F1F3F4]',
                          selectedFormat === fmt && 'text-[#1A73E8]',
                        )}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span className={cn('material-symbols-outlined text-[17px] shrink-0', selectedFormat === fmt ? 'text-[#1A73E8]' : isDark ? 'text-white/45' : 'text-[#5f6368]')}>{FORMAT_ICONS[fmt]}</span>
                          <span>{fmt}</span>
                        </span>
                        {selectedFormat === fmt && <span className="material-symbols-outlined text-[#1A73E8] text-[16px] shrink-0">check</span>}
                      </button>
                    ))}
	                  </motion.div>
	                )}
	              </AnimatePresence>

              {(isExpanded || isLoading || panelIsLoading) && (
                <span
                  key={isLoading || panelIsLoading ? 'pill-generating-glow' : `pill-open-glow-${pillOpenGlowKey}`}
                  aria-hidden="true"
                  className={cn(
                    'gemini-border-glow absolute inset-0',
                    isExpanded ? 'rounded-[28px]' : 'rounded-full',
                    (isLoading || panelIsLoading) ? 'gemini-border-glow-thinking' : 'gemini-border-glow-open',
                  )}
                  style={{ '--gemini-shell-surface': isDark ? '#1E1D22' : '#ffffff' } as React.CSSProperties}
                />
              )}

	              {/* Collapsed star */}
              <div className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 transition-all duration-[180ms]',
                isDark ? 'text-[#D2E3FC]' : 'text-[#041e49]',
                isExpanded ? 'opacity-0 scale-50' : 'opacity-100 scale-100',
              )}>
                <GeminiIcon className="w-4 h-4" />
              </div>

              {/* Expanded grid */}
              <div className={cn(
                'relative z-10 grid w-full min-h-14 px-4 py-2 gap-3 items-center transition-all duration-[180ms] grid-cols-[auto_1fr_auto]',
                isExpanded ? 'opacity-100 visible [transition-delay:80ms]' : 'opacity-0 invisible',
              )}>

                {/* Left toolbar */}
                <div className="flex items-center gap-1">
                  <button type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (chatOpen) {
                        setHistoryView(true);
                      } else {
                        setPreHistoryOpen(v => !v);
                        if (!preHistoryOpen) fetch('/api/conversations').then(r => r.json()).then(d => setConversations(d.conversations || [])).catch(() => {});
                      }
                    }}
                    title="History"
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-full transition-colors',
                      (preHistoryOpen || historyView)
                        ? isDark ? 'bg-white/12 text-white/90' : 'bg-black/8 text-[#1F1F1F]'
                        : isDark ? 'text-white/60 hover:bg-white/8' : 'text-[#444746] hover:bg-black/8',
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">menu</span>
                  </button>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.txt,.csv,.md,.json,.ts,.tsx,.js,.jsx,.html,.css,.docx,.xlsx"
                    onChange={e => {
                      if (e.target.files) {
                        addMultipleFiles(Array.from(e.target.files));
                        e.target.value = '';
                      }
                    }}
                  />

                  {/* + menu button / Done when selector active */}
                  <div className="relative">
                    {selectorActive ? (
                      <button type="button"
                        onClick={e => { e.stopPropagation(); onSelectorToggle(false); }}
                        title="Done adding context"
                        className={cn(
                          'h-9 flex items-center justify-center overflow-hidden rounded-full transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
                          'w-[82px] gap-1.5 px-3',
                          isDark ? 'bg-[#1A73E8]/20 text-[#D2E3FC]' : 'bg-[#E8F0FE] text-[#1A73E8]',
                        )}
                      >
                        <span className="material-symbols-outlined shrink-0 text-[17px]">close</span>
                        <span className="shrink-0 text-[12px] font-black">Done</span>
                      </button>
                    ) : (
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setIsPlusMenuOpen(v => !v); }}
                        title="Add context or files"
                        className={cn(
                          'w-9 h-9 flex items-center justify-center overflow-hidden rounded-full transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
                          isPlusMenuOpen
                            ? isDark ? 'bg-white/12 text-white/90' : 'bg-black/8 text-[#1F1F1F]'
                            : isDark ? 'text-white/60 hover:bg-white/8' : 'text-[#444746] hover:bg-black/8',
                        )}
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    )}

                    {/* Plus menu dropdown */}
                    <AnimatePresence>
                    {isPlusMenuOpen && !selectorActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.175, 0.885, 0.32, 1.15] }}
                        className={cn(
                          'absolute bottom-[calc(100%+8px)] left-0 z-[120] w-44 rounded-xl border py-1.5',
                          isDark
                            ? 'bg-[#2C2B30] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                            : 'bg-white border-[#E0E4EC] shadow-[0_4px_20px_rgba(0,0,0,0.1)]',
                        )}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setIsPlusMenuOpen(false);
                            onSelectorToggle(true);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-[13px] font-medium transition-colors',
                            isDark ? 'text-white/90 hover:bg-white/8' : 'text-[#1F1F1F] hover:bg-[#F1F3F4]',
                          )}
                        >
                          <span className="material-symbols-outlined text-[18px] shrink-0">add_box</span>
                          Add context
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setIsPlusMenuOpen(false);
                            openFilePicker();
                          }}
                          className={cn(
                            'w-full flex items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-[13px] font-medium transition-colors',
                            isDark ? 'text-white/90 hover:bg-white/8' : 'text-[#1F1F1F] hover:bg-[#F1F3F4]',
                          )}
                        >
                          <span className="material-symbols-outlined text-[18px] shrink-0">attach_file</span>
                          Add files
                        </button>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setSearchGrounding(v => !v); setIsPlusMenuOpen(false); setIsExpanded(true); }}
                          className={cn(
                            'w-full flex items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-[13px] font-medium transition-colors',
                            searchGrounding
                              ? isDark ? 'bg-white/10 text-[#D2E3FC]' : 'bg-[#E8F0FE] text-[#185ABC]'
                              : isDark ? 'text-white/90 hover:bg-white/8' : 'text-[#1F1F1F] hover:bg-[#F1F3F4]',
                          )}
                        >
                          <GoogleGIcon />
                          Search
                        </button>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>

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
                <div className="relative flex items-center min-w-0">
                  <div className="flex items-center flex-wrap gap-1 w-full">
                    {chips.map(chip => (
                      <span key={chip.label} className="inline-flex items-center gap-0.5 bg-[#D3E3FD] text-[#041e49] text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0">
                        {chip.label}
                        <button type="button" onClick={e => { e.stopPropagation(); removeChip(chip.label); }} className="opacity-50 hover:opacity-100 ml-0.5">
                          <span className="material-symbols-outlined text-[11px]">close</span>
                        </button>
                      </span>
                    ))}
                    {files.map(file => (
                      <span key={file.name} className="inline-flex items-center gap-0.5 bg-[#D3E3FD] text-[#041e49] text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0 max-w-[140px]">
                        <span className="material-symbols-outlined text-[11px] shrink-0">attach_file</span>
                        <span className="truncate">{file.name}</span>
                        <button type="button" onClick={e => { e.stopPropagation(); removeFile(file.name); }} className="opacity-50 hover:opacity-100 ml-0.5 shrink-0">
                          <span className="material-symbols-outlined text-[11px]">close</span>
                        </button>
                      </span>
                    ))}
                    {searchGrounding && (
                      <button type="button" onClick={e => { e.stopPropagation(); setSearchGrounding(false); }} aria-label="Remove Google Search grounding" className={cn('inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium shadow-sm transition-colors', isDark ? 'border-white/15 bg-white/10 text-white/90 hover:bg-white/15' : 'border-[#DADCE0] bg-[#F1F3F4] text-[#3C4043] hover:bg-[#E8EAED]')}>
                        <GoogleGIcon className="!h-[14px] !w-[14px]" />
                        Search
                        <span className="material-symbols-outlined text-[13px] leading-none text-[#5F6368]">close</span>
                      </button>
                    )}
                    <div className="relative flex-1 min-w-[220px] min-h-6 max-h-[92px] overflow-hidden">
                      {isLoading ? (
                        <span className={cn('flex h-10 items-center pl-5 text-[15px] leading-normal font-semibold', isDark ? 'text-white/75' : 'text-[#4F565E]')}>
                          <span className="thinking-shimmer">Thinking...</span>
                        </span>
                      ) : (
                        <>
                      {inlineSuggestion && (
                        <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 min-w-0 overflow-hidden whitespace-pre-wrap break-words text-[15px] leading-6', isDark ? 'text-white/35' : 'text-[#70757a]')}>
                          <span className="invisible">{inputText}</span>
                          <span>{inlineSuggestion}</span>
                          <svg
                            className="ml-1 inline-block h-[17px] w-[26px] align-[-3px]"
                            width="34"
                            height="22"
                            viewBox="0 0 34 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-label="Tab key"
                          >
                            <rect x="0.5" y="0.5" width="33" height="21" rx="4.5" fill="#929292" />
                            <text x="4" y="9.2" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontSize="7" fontWeight="700" letterSpacing="-0.15">
                              Tab
                            </text>
                            <path d="M21.5 14.25H27" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                            <path d="M25.1 12.25L27.1 14.25L25.1 16.25" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M29.25 10.5V17.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                          </svg>
                        </div>
                      )}
                      <textarea
                        ref={inputRef}
                        autoComplete="off"
                        rows={1}
                        value={inputText}
                        onChange={e => updatePillInput(e.target.value)}
                        onFocus={() => { setIsFocused(true); setIsExpanded(true); }}
                        onBlur={() => { setIsFocused(false); evaluateCollapse(); }}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => {
                          if (e.key === 'Tab' && inlineSuggestion) {
                            e.preventDefault();
                            acceptInlineSuggestion();
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            sendMessage();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            if (inlineSuggestion) setInlineSuggestion('');
                            else { clearPillInput(); setIsExpanded(false); }
                          }
                        }}
                        className={cn('relative z-10 block min-h-6 max-h-[92px] w-full min-w-0 resize-none overflow-hidden bg-transparent outline-none text-[15px] leading-6 caret-[#1A73E8]', isDark ? 'text-white' : 'text-[#1F1F1F]')}
                      />
                        </>
                      )}
                    </div>
                  </div>
                  {/* Drag-and-drop overlay inside input area */}
                  {!isLoading && !inputText && chips.length === 0 && files.length === 0 && (
                    <span className={cn(
                      'absolute left-0 text-[15px] leading-6 pointer-events-none whitespace-nowrap select-none',
                      isDraggingFile
                        ? isDark ? 'text-[#8AB4F8]/70' : 'text-[#1A73E8]/70'
                        : selectorHint
                        ? 'text-[#1A73E8]/60 text-[13px] italic'
                        : isDark ? 'text-white/35' : 'text-[#70757a]',
                    )}>
                      {isDraggingFile ? 'Drag & drop here' : (selectorHint ?? 'Ask Gemini or type to search')}
                    </span>
                  )}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleSplitscreen(e); }}
                    title="Open Gemini panel"
                    aria-label="Open Gemini panel"
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                      isDark ? 'bg-white/10 text-white/75 hover:bg-white/16' : 'bg-[#F1F3F4] text-[#5F6368] hover:bg-[#E8EAED]',
                    )}
                  >
                    <span className="relative block h-[19px] w-[21px]" aria-hidden="true">
                      <span className={cn('absolute left-0 top-0 h-[19px] w-[13px] rounded-[3px]', isDark ? 'bg-white/80' : 'bg-[#5F6368]')} />
                      <span className={cn('absolute right-0 top-[2px] h-[15px] w-[4px] rounded-full', isDark ? 'bg-white/80' : 'bg-[#5F6368]')} />
                    </span>
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
                      className="w-9 h-9 flex items-center justify-center rounded-[10px] transition-[border-radius,background-color,transform] duration-200 bg-[#0b57d0] text-white hover:bg-[#0842a0] hover:scale-105 cursor-pointer"
                      title="Stop generation"
                    >
                      <span className="h-3.5 w-3.5 rounded-[2px] bg-white" aria-hidden="true" />
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
    <AnimatePresence>
      {modelToast && (
        <motion.div
          initial={{ opacity: 0, y: 58, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 58, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className={cn('fixed bottom-[86px] left-1/2 z-[190] -translate-x-1/2 rounded-full border px-4 py-2 text-[12px] font-semibold shadow-lg', isDark ? 'border-white/10 bg-[#28272E] text-white/85' : 'border-[#DADCE0] bg-white text-[#3C4043]')}
        >
          {modelToast}
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
