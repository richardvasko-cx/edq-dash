import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { marked } from 'marked';
import { cn } from '../App';
import GeminiIcon from './GeminiIcon';
import { ChatSparkIcon, DocSparkIcon } from './SparkIcons';
import MarkdownContent from './MarkdownContent';
import type { ScreenContext } from '../contexts/AiPanel';
import type { GeminiSearchItem } from './GeminiPromptPill';

export interface GuideArticle {
  path: string;
  title: string;
  section: string;
}

export interface AnswerEvidence {
  kind: 'live' | 'selected' | 'guide' | 'history' | 'best_practice';
  label: string;
  detail?: string;
  path?: string;
}

export interface AppAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  view: 'glance' | 'investigation' | 'tools' | 'user_guide' | 'settings';
  toolsTab?: 'dig' | 'mx' | 'analyzer' | 'ip_warming';
  ticketSection?: 'Overview' | 'Authentication' | 'Deliverability' | 'Email Performance' | 'Support History' | 'Workspace';
  /** Exact panel title to reveal after opening an investigation section. */
  panelLabel?: string;
  /** Preferred case value to preload in a diagnostic tool. */
  toolPrefill?: 'sending_domain' | 'sending_ip';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** True when this user turn was produced by editing an earlier message. */
  edited?: boolean;
  /** Visual context chip labels attached to this message (display only). */
  chips?: Array<{ label: string }>;
  /** Legacy single article (kept for old chat history). */
  article?: GuideArticle | null;
  /** Up to 3 Braze User Guide articles Gemini suggests for this answer. */
  articles?: GuideArticle[];
  /** Continuity suggestions: secondary pinned panels surfaced as clickable pills. */
  followups?: Array<{ label: string; content: string; scope?: string }>;
  /** App navigation actions generated alongside Gemini's answer. */
  actions?: AppAction[];
  /** Optional display-only label shown in the chat bubble instead of `content`.
   * Useful when the API prompt is verbose but a concise title should be surfaced. */
  displayContent?: string;
  /** Gemini-provided summary of the reasoning used to prepare this answer. */
  thinking?: string[];
  /** A user-confirmed model switch offered when the selected model is unavailable. */
  suggestedModel?: { id: string; label: string };
  /** Server-derived provenance for the context used to prepare this answer. */
  evidence?: AnswerEvidence[];
}

type PanelChip = { label: string; content: string; scope?: string };
type PanelFormat = 'Standard' | 'Shorter' | 'Expand' | 'Formal' | 'Bulletize' | 'Data +';
interface ConvSummary { id: string; title: string; timestamp: string; preview: string; source: string; }

const PANEL_FORMAT_OPTIONS: PanelFormat[] = ['Standard', 'Shorter', 'Expand', 'Formal', 'Bulletize', 'Data +'];
const SETTINGS_ACTION: AppAction = {
  id: 'open-settings',
  label: 'Settings',
  description: 'Adjust app and Gemini configuration.',
  icon: 'settings',
  view: 'settings',
};
const PANEL_FORMAT_INSTRUCTIONS: Record<PanelFormat, string> = {
  'Standard': '',
  'Shorter': 'Be concise — answer in 2-3 sentences maximum. ',
  'Expand': 'Expand the context and provide technical detail — include exact values, commands, and supporting specifics. ',
  'Formal': 'Adopt a formal tone. Make it highly technical, concise, and to the point. ',
  'Bulletize': 'Summarize the answer in a concise, highly technical bullet point format. ',
  'Data +': 'Lead with key metrics and data points before explaining. Include specific numbers where available. ',
};
const PANEL_FORMAT_ICONS: Record<PanelFormat, string> = {
  'Standard': 'notes',
  'Shorter': 'compress',
  'Expand': 'expand_content',
  'Formal': 'work',
  'Bulletize': 'format_list_bulleted',
  'Data +': 'bar_chart',
};

function displayContentIcon(label?: string): string {
  switch ((label || '').trim()) {
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

interface AiPanelProps {
  isDark: boolean;
  screenContext: ScreenContext | null;
  chatHistory: ChatMessage[];
  onUpdateHistory: (msgs: ChatMessage[]) => void;
  onClose: () => void;
  onOpenArticle: (githubPath: string) => void;
  selectorActive?: boolean;
  onSelectorToggle?: (v: boolean) => void;
  pendingChip?: PanelChip | null;
  onChipConsumed?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onChipsChange?: (chips: PanelChip[]) => void;
  pendingQuery?: string;
  /** Optional display label for the pending query bubble; hides the raw prompt. */
  pendingQueryDisplay?: string;
  onPendingQueryConsumed?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  searchResults?: GeminiSearchItem[];
  onSelectSearchResult?: (item: GeminiSearchItem, source?: 'result' | 'suggestion') => void;
  onRunAction?: (action: AppAction) => void;
}

marked.setOptions({ gfm: true, breaks: true });

function mdToHtml(md: string) {
  return { __html: marked.parse(md) as string };
}

function evidenceIcon(item: AnswerEvidence): string {
  if (item.kind === 'guide') return 'menu_book';
  if (item.kind === 'selected') return 'query_stats';
  if (item.kind === 'history') return 'history';
  if (item.kind === 'best_practice') return 'school';
  return /ticket|case/i.test(item.label) ? 'confirmation_number' : 'dashboard';
}

/** A compact provenance control. Evidence comes from the server's grounding plan,
 * not a second model call, so opening this never adds latency or quota cost. */
export function SourcesPill({ evidence, isDark, onOpenArticle }: { evidence?: AnswerEvidence[]; isDark: boolean; onOpenArticle?: (path: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!evidence?.length) return null;
  return (
    <div className="relative mt-2 ml-[22px]" style={{ width: 'calc(100% - 22px)' }}>
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}
        className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors', isDark ? 'border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80' : 'border-black/8 bg-[#F8F9FA] text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#0B57D0]')}>
        <span className="material-symbols-outlined text-[13px]">verified</span>
        <span>Sources</span>
        <span className={cn('material-symbols-outlined text-[13px] transition-transform', open && 'rotate-180')}>expand_more</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -4, height: 0 }} transition={{ duration: 0.16 }} className="mt-2 overflow-hidden">
            <div className="border-t border-dashed border-[#1A73E8]/60">
              {evidence.map((item, index) => item.path && onOpenArticle ? (
                <button key={`${item.kind}-${item.label}-${index}`} type="button" onClick={() => onOpenArticle(item.path!)} className={cn('flex w-full items-center gap-2 border-b border-dashed border-[#1A73E8]/45 px-2 py-2.5 text-left transition-colors', isDark ? 'hover:bg-white/5' : 'hover:bg-[#E8F0FE]/45')}>
                  <span className="material-symbols-outlined text-[14px] text-[#1A73E8]">{evidenceIcon(item)}</span><span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{item.label}</span>
                </button>
              ) : (
                <div key={`${item.kind}-${item.label}-${index}`} className="flex items-center gap-2 border-b border-dashed border-[#1A73E8]/45 px-2 py-2.5"><span className="material-symbols-outlined text-[14px] text-[#1A73E8]">{evidenceIcon(item)}</span><span className="min-w-0 flex-1 text-[11px] font-semibold">{item.label}</span></div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SuggestedArticlesPill({ articles, isDark, onOpenArticle }: { articles?: GuideArticle[]; isDark: boolean; onOpenArticle: (path: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!articles?.length) return null;
  return (
    <div className="relative mt-1.5 ml-[22px]" style={{ width: 'calc(100% - 22px)' }}>
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}
        className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors', isDark ? 'border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80' : 'border-black/8 bg-[#F8F9FA] text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#0B57D0]')}>
        <span className="material-symbols-outlined text-[14px]">menu_book</span>
        <span>Suggested articles · {articles.length}</span>
        <span className={cn('material-symbols-outlined text-[13px] transition-transform', open && 'rotate-180')}>expand_more</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -4, height: 0 }} transition={{ duration: 0.16 }} className="mt-2 overflow-hidden border-t border-dashed border-[#1A73E8]/60">
            {articles.slice(0, 3).map(article => (
              <button key={article.path} type="button" onClick={() => onOpenArticle(article.path)} className={cn('flex w-full items-center gap-2 border-b border-dashed border-[#1A73E8]/45 px-2 py-2.5 text-left transition-colors', isDark ? 'hover:bg-white/5' : 'hover:bg-[#E8F0FE]/45')}>
                <span className="material-symbols-outlined shrink-0 text-[14px] text-[#1A73E8]">menu_book</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{article.title}</span><span className={cn('block truncate text-[9px]', isDark ? 'text-white/40' : 'text-black/40')}>{article.section}</span></span>
                <span className="material-symbols-outlined text-[14px] text-[#1A73E8]">arrow_outward</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ensureLocalAppActions(content: string, actions: AppAction[] = []) {
  const next = [...actions];
  const add = (action: AppAction) => {
    if (!next.some(item => item.id === action.id)) next.push(action);
  };
  if (/\b(gemini api|api key|disabled in settings|enable it to chat|not configured|\.env)\b/i.test(content)) {
    add(SETTINGS_ACTION);
  }
  return next;
}

/** Flatten the live screen context into a readable block the model can reason over. */
function serializeScreenContext(ctx: ScreenContext | null): string {
  if (!ctx) return '';
  const lines: string[] = [];
  const viewLabel = ctx.kind === 'ticket' ? 'Support ticket'
    : ctx.kind === 'tool' ? 'Diagnostic tool'
    : ctx.kind === 'guide' ? 'User Guide article'
    : 'Dashboard';
  lines.push(`Currently viewing: ${viewLabel}`);
  lines.push(`Title: ${ctx.title}`);
  if (ctx.subtitle) lines.push(`Reference: ${ctx.subtitle}`);
  if (ctx.guidePath) lines.push(`Active guide path: ${ctx.guidePath}`);
  if (ctx.issue) lines.push(`Issue: ${ctx.issue}`);
  if (ctx.rca) lines.push(`Root cause summary: ${ctx.rca}`);
  if (ctx.data && ctx.data.length) {
    lines.push('Metrics on screen:');
    ctx.data.forEach(d => {
      const dir = d.trend === 'up' ? ' (trending up)' : d.trend === 'down' ? ' (trending down)' : '';
      lines.push(`  - ${d.label}: ${d.value}${dir}`);
    });
  }
  if (ctx.raw) lines.push(`\nArticle/content excerpt:\n${ctx.raw}`);
  return lines.join('\n');
}

export default function AiPanel({ isDark, screenContext, chatHistory, onUpdateHistory, onClose, onOpenArticle, selectorActive, onSelectorToggle, pendingChip, onChipConsumed, onLoadingChange, onChipsChange, pendingQuery, pendingQueryDisplay, onPendingQueryConsumed, searchQuery = '', onSearchQueryChange, searchResults = [], onSelectSearchResult, onRunAction }: AiPanelProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [openThinkingMessage, setOpenThinkingMessage] = useState<number | null>(null);
  const [inlineSuggestion, setInlineSuggestion] = useState('');
  const [panelChips, setPanelChips] = useState<PanelChip[]>([]);
  const [panelFormat, setPanelFormat] = useState<PanelFormat>('Standard');
  const [moreFormatsOpen, setMoreFormatsOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [starters, setStarters] = useState<string[]>([]);
  const [startersLoading, setStartersLoading] = useState(false);
  const [inputExpanded, setInputExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
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
  // History popup is React-controlled (not CSS :hover) so it stays open while
  // the user moves between the dot rail and the popup itself.
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyView, setHistoryView] = useState(false);
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const conversationIdRef = useRef<string | null>(null);
  const loadingStartRef = useRef<number>(Date.now());
  const abortRef = useRef<AbortController | null>(null);
  const autocompleteAbortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastAcceptedAutocompleteRef = useRef('');
  const historyCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openHistory = () => {
    if (historyCloseTimer.current) { clearTimeout(historyCloseTimer.current); historyCloseTimer.current = null; }
    setHistoryOpen(true);
  };
  const scheduleCloseHistory = () => {
    if (historyCloseTimer.current) clearTimeout(historyCloseTimer.current);
    historyCloseTimer.current = setTimeout(() => setHistoryOpen(false), 180);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = chatScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };
  const scrollToMessage = (idx: number) => {
    chatScrollRef.current?.querySelector(`[data-gem-msg="${idx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Consume a pending context chip pushed from Layout
  useEffect(() => {
    if (!pendingChip) return;
    setPanelChips(prev => {
      if (prev.find(c => c.label === pendingChip.label)) return prev;
      return [...prev, pendingChip];
    });
    onChipConsumed?.();
  }, [pendingChip]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify Layout whenever chips change so pill can show them on panel→pill handoff
  useEffect(() => { onChipsChange?.(panelChips); }, [panelChips]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track scroll position to toggle the "jump to latest" arrow. We intentionally
  // do NOT auto-scroll when an answer streams in — only when the user sends.
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollDown(distanceFromBottom > 120);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [chatHistory.length]);

  // When the user moves to a different screen, drop the previous answer's
  // follow-ups and fetch fresh, model-generated starter prompts for the new
  // screen (no static templates).
  useEffect(() => {
    let cancelled = false;
    setStarters([]);
    if (!geminiEnabled) {
      setStartersLoading(false);
      return;
    }
    setStartersLoading(true);
    const screen = serializeScreenContext(screenContext);
    fetch('/api/user-guide/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screen }),
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setStarters(Array.isArray(d.suggestions) ? d.suggestions : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setStartersLoading(false); });
    return () => { cancelled = true; };
  }, [screenContext?.title]);

  // Generic last-resort prompts only if the model can't generate any.
  const fallbackSuggestions = screenContext?.suggestions?.length
    ? screenContext.suggestions
    : [
        'How can I improve my email deliverability?',
        'What are best practices for email authentication?',
        'How do I monitor my sender reputation?',
      ];
  const suggestions = starters.length ? starters : fallbackSuggestions;
  const isEmpty = chatHistory.length === 0 && !isLoading;
  const trimmedSearchQuery = searchQuery.trim();
  const showSearchResults = isEmpty && trimmedSearchQuery.length > 0;
  // GeminiPromptPill and AiPanel intentionally mirror search behavior; adapt
  // layout here, but keep routing and suggestion semantics in sync.
  const groupedSearchResults = ([
    { type: 'ticket' as const, label: 'Tickets' },
    { type: 'guide' as const, label: 'User Guide' },
    { type: 'nav' as const, label: 'Everything Else' },
  ]).map(group => ({
    ...group,
    items: searchResults.filter(item => item.type === group.type),
  })).filter(group => group.items.length > 0);
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

  const updateInput = (value: string) => {
    if (value.trimEnd().toLowerCase() !== lastAcceptedAutocompleteRef.current) {
      lastAcceptedAutocompleteRef.current = '';
    }
    setInput(value);
    setInlineSuggestion('');
    onSearchQueryChange?.(value);
  };

  const clearInput = () => {
    setInput('');
    setInlineSuggestion('');
    lastAcceptedAutocompleteRef.current = '';
    onSearchQueryChange?.('');
  };

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const singleLineHeight = 20;
    const visibleText = `${input}${inlineSuggestion}`;
    if (!visibleText) {
      el.style.height = `${singleLineHeight}px`;
      el.style.overflowY = 'hidden';
      setInputExpanded(false);
      return;
    }

    const availableWidth = Math.max(1, el.clientWidth);
    const approximateCharacterWidth = 7.2;
    const approximateLines = Math.max(1, Math.ceil((visibleText.length * approximateCharacterWidth) / availableWidth));
    const nextHeight = Math.min(singleLineHeight * approximateLines, 92);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = nextHeight >= 92 ? 'auto' : 'hidden';
    setInputExpanded(approximateLines > 1);
  }, [input, inlineSuggestion]);

  useEffect(() => {
    autocompleteAbortRef.current?.abort();
    const textAtRequest = input.trimEnd();
    if (!geminiEnabled || isLoading || textAtRequest.length < 4 || /[?.!]$/.test(textAtRequest)
      || /^(how|why|what|when|where|who|which|can|could|should|would|do|does|did|is|are|will)\b/i.test(textAtRequest)
      || textAtRequest.toLowerCase() === lastAcceptedAutocompleteRef.current) return;
    let aborter: AbortController | null = null;
    const timer = window.setTimeout(async () => {
      aborter = new AbortController();
      autocompleteAbortRef.current = aborter;
      try {
        const response = await fetch('/api/gemini/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textAtRequest,
            screen: serializeScreenContext(screenContext),
            ticketRef: screenContext?.kind === 'ticket'
              ? { id: screenContext.recordId, account: screenContext.accountKey }
              : undefined,
          }),
          signal: aborter.signal,
        });
        const data = await response.json();
        if (!aborter.signal.aborted && input.trimEnd() === textAtRequest) {
          const suggestion = String(data.suggestion || '');
          const normalizedSuggestion = suggestion.trim().toLowerCase();
          const normalizedText = textAtRequest.toLowerCase();
          if (!normalizedSuggestion || normalizedText.endsWith(normalizedSuggestion) || normalizedText === lastAcceptedAutocompleteRef.current) {
            setInlineSuggestion('');
          } else {
            setInlineSuggestion(suggestion);
          }
        }
      } catch {}
    }, 300);
    return () => {
      window.clearTimeout(timer);
      aborter?.abort();
    };
  }, [geminiEnabled, input, isLoading, screenContext]);

  const selectSearchResult = (item: GeminiSearchItem, source: 'result' | 'suggestion' = 'result') => {
    onSelectSearchResult?.(item, source);
    clearInput();
  };

  const ticketRef = screenContext?.kind === 'ticket'
    ? { id: screenContext.recordId, account: screenContext.accountKey }
    : undefined;

  // Refine pills — generate a NEW answer below (the previous one is kept).
  // The user's selection is logged as a chat entry first.
  const REFINE_LABEL: Record<'shorter' | 'technical' | 'data' | 'formal' | 'bulletize' | 'standard', string> = {
    shorter: 'Make this shorter',
    technical: 'Expand the context and provide technical detail',
    data: 'Show the supporting data',
    formal: 'Make it more formal and technical',
    bulletize: 'Summarize as bullet points',
    standard: 'Rewrite in standard format',
  };
  const REFINE_DISPLAY_LABEL: Record<'shorter' | 'technical' | 'data' | 'formal' | 'bulletize' | 'standard', string> = {
    shorter: 'Shorter',
    technical: 'Expand',
    data: '+ Data',
    formal: 'Formal',
    bulletize: 'Bulletize',
    standard: 'Standard',
  };
  const refineLast = async (
    refineMode: 'shorter' | 'technical' | 'data' | 'formal' | 'bulletize' | 'standard',
    displayContent?: string,
  ) => {
    if (isLoading) return;
    const lastIdx = chatHistory.length - 1;
    if (lastIdx < 0 || chatHistory[lastIdx].role !== 'assistant') return;
    // Log what the user selected, then generate beneath it.
    const selectionMsg: ChatMessage = {
      role: 'user',
      content: REFINE_LABEL[refineMode],
      displayContent: displayContent || REFINE_DISPLAY_LABEL[refineMode],
      timestamp: Date.now()
    };
    const next = [...chatHistory, selectionMsg];
    onUpdateHistory(next);
    setTimeout(() => scrollToBottom(), 50);
    loadingStartRef.current = Date.now(); setIsLoading(true); onLoadingChange?.(true);
    const screen = serializeScreenContext(screenContext);
    let answer: string;
    let articles: GuideArticle[] = [];
    try {
      const res = await fetch('/api/user-guide/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `refine:${refineMode}`,
          screen,
          ticketRef,
          history: chatHistory,
          mode: refineMode,
          dateRange: screenContext?.dateRange ? { from: screenContext.dateRange.from, to: screenContext.dateRange.to } : undefined
        }),
      });
      const data = await res.json();
      if (data.error === 'Failed to reach Gemini API') {
        answer = "⚠️ **Gemini API is not configured.** Please check your settings or `.env` file.";
      } else if (data.error) {
        answer = `⚠️ ${data.error}`;
      } else {
        answer = data.text || chatHistory[lastIdx].content;
        articles = Array.isArray(data.articles) ? data.articles : (data.article ? [data.article] : []);
      }
    } catch (e: any) {
      answer = `⚠️ Could not reach Gemini: ${e.message}`;
    }
    const refinedActions = ensureLocalAppActions(answer);
    const finalHistory: ChatMessage[] = [...next, { role: 'assistant' as const, content: answer, timestamp: Date.now(), articles, article: articles[0] ?? null, actions: refinedActions, }];
    onUpdateHistory(finalHistory);
    setIsLoading(false); onLoadingChange?.(false);
    // Persist refined turn back to the conversation .md
    const apiMsgs = finalHistory.map((m: ChatMessage) => ({ role: m.role, content: m.content, displayContent: m.displayContent || null, chips: m.chips?.length ? m.chips : null, articles: m.articles?.length ? m.articles : null, actions: m.actions?.length ? m.actions : null }));
    fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: conversationIdRef.current, messages: apiMsgs, source: 'panel' }) }).then(r => r.json()).then(d => { if (d.id) conversationIdRef.current = d.id; }).catch(() => {});
  };

  // When docked mid-generation from pill, re-send the pending user message.
  // pendingQuery and chatHistory (seeds) update in the same React batch so
  // sendMessage here sees the correct fresh history — no stale-closure duplicates.
  useEffect(() => {
    if (!pendingQuery) return;
    onPendingQueryConsumed?.();
    sendMessage(pendingQuery, undefined, undefined, undefined, pendingQueryDisplay || undefined);
  }, [pendingQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const heading = screenContext && screenContext.kind !== 'generic' && screenContext.kind !== 'dashboard'
    ? `Ask about ${screenContext.title}`
    : 'How can I help?';

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
    const retryIndex = [...historyUntilFailure].map((message, index) => ({ message, index })).reverse().find(({ message }) => message.role === 'user')?.index;
    if (retryIndex === undefined) return;
    const retry = historyUntilFailure[retryIndex];
    sendMessage(retry.content, undefined, historyUntilFailure.slice(0, retryIndex), retry.edited, retry.displayContent);
  };

  // Edit a user prompt inline within its bubble. Clicking edit turns the bubble
  // into an editable field; approving re-runs the chat from that point and
  // discards everything generated after it.
  const editPrompt = (idx: number) => {
    if (isLoading) {
      abortRef.current?.abort();
      abortRef.current = null;
      setIsLoading(false);
      setStreamingContent('');
      onLoadingChange?.(false);
    }
    const msg = chatHistory[idx];
    if (!msg || msg.role !== 'user') return;
    setEditingIdx(idx);
    setEditingText(msg.content);
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
    // Re-send as text-only: chip panel contents aren't retained in history.
    sendMessage(trimmed, [], base, true);
  };

  const sendMessage = async (query?: string, overrideChips?: PanelChip[], baseHistoryOverride?: ChatMessage[], edited?: boolean, displayContent?: string) => {
    const msg = (query || input).trim();
    const activeChips = overrideChips ?? panelChips;
    if ((!msg && activeChips.length === 0) || isLoading) return;
    const baseHistory = baseHistoryOverride ?? chatHistory;
    clearInput();
    onSelectorToggle?.(false);
    // Deterministic relatedness. Guide articles are REFERENCE material (apply to
    // the case), never a competing case. "Unrelated" only fires when 2+ non-guide
    // data panels come from different scopes (e.g. a ticket vs a global IP planner).
    const isGuideChip = (c: PanelChip) => (c.scope || '').startsWith('guide:');
    const dataChips = activeChips.filter(c => !isGuideChip(c));
    const guideChips = activeChips.filter(isGuideChip);
    const dataScopes = new Set(dataChips.map(c => c.scope || 'none'));
    const pinsUnrelated = dataScopes.size > 1;
    const hasGuideRef = guideChips.length > 0 && dataChips.length > 0;
    // Chips-only: auto-generate summary prompt; display entry without text bubble.
    const contextualMsg = msg && screenContext?.kind === 'ticket'
      ? `For the current ticket/account shown on screen, answer this exact question: "${msg}". Ground the answer in the account's full ticket context, including the case number, issue, root cause, authentication state, deliverability metrics, email performance metrics, bounce/provider signals, and support history where relevant. Treat the active tab as the immediate visual focus, but do not limit the answer to that tab. Do not answer as generic deliverability advice.`
      : msg;
    const apiText = contextualMsg || (pinsUnrelated
      ? `I've pinned ${activeChips.length} panels from DIFFERENT contexts: ${activeChips.map(c => c.label).join(', ')}. They are NOT part of the same case. Summarize the most detailed/case-specific one, briefly say why you led with it, then ask me what I want to do with the others. Do not blend their metrics or treat them as related.`
      : hasGuideRef
      ? `Using the pinned User Guide article(s) (${guideChips.map(c => c.label).join(', ')}) as best-practice reference, give specific recommendations to resolve the pinned case (${dataChips.map(c => c.label).join(', ')}). Apply the guidance to this case's data.`
      : activeChips.length > 1
      ? `Summarize these related panels together: ${activeChips.map(c => c.label).join(', ')}.`
      : `Summarize the selected context: ${activeChips.map(c => c.label).join(', ')}`);
    // Unrelated pins: lead with the panel matching the open ticket (else first);
    // the rest become visual continuity pills on the answer.
    const ticketScope = screenContext?.kind === 'ticket' ? `ticket:${screenContext.recordId ?? screenContext.accountKey ?? ''}` : null;
    const followups = pinsUnrelated
      ? (() => {
          const leadIdx = ticketScope ? dataChips.findIndex(c => c.scope === ticketScope) : 0;
          const lead = dataChips[leadIdx >= 0 ? leadIdx : 0];
          return activeChips.filter(c => c !== lead);
        })()
      : [];
    const formatPrefix = PANEL_FORMAT_INSTRUCTIONS[panelFormat];
    const fullMsg = formatPrefix + apiText;
    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: Date.now(), edited, chips: activeChips.length > 0 ? activeChips.map(c => ({ label: c.label })) : undefined, displayContent: displayContent || undefined };
    const next = [...baseHistory, userMsg];
    onUpdateHistory(next);
    setTimeout(() => scrollToBottom(), 50);

    if (!geminiEnabled) {
      setTimeout(() => {
        const content = '⚠️ **Gemini API is disabled in Settings.** Please enable it to chat.';
        onUpdateHistory([...next, { role: 'assistant', content, timestamp: Date.now() + 1, actions: ensureLocalAppActions(content) }]);
      }, 300);
      return;
    }

    loadingStartRef.current = Date.now(); setIsLoading(true); onLoadingChange?.(true);
    setStreamingContent('');
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
    const screen = serializeScreenContext(screenContext) + chipsContext;
    let answer = '';
    let articles: GuideArticle[] = [];
    let actions: AppAction[] = [];
    let thinking: string[] = [];
    let evidence: AnswerEvidence[] = [];
    let suggestedModel: ChatMessage['suggestedModel'];
    // Refine pills ("Shorter"/"Expand"/"+ Data") only contribute the answer they
    // generate — drop the refine-trigger label so it isn't carried as a real user
    // turn on follow-ups. Also record which guide cards were shown beneath each
    // answer so the model can own/explain them instead of denying it suggested them.
    const refineLabels = new Set(Object.values(REFINE_LABEL));
    const historyForApi = baseHistory
      .filter(m => !(m.role === 'user' && refineLabels.has(m.content.trim())))
      .map(m => {
        const arts = m.articles?.length ? m.articles : (m.article ? [m.article] : []);
        return m.role === 'assistant' && arts.length
          ? { ...m, content: `${m.content}\n\n[Suggested guide cards shown to the user with this answer: ${arts.map(a => a!.title).join(', ')}]` }
          : m;
      });
    try {
      const aborter = new AbortController();
      abortRef.current = aborter;
      const res = await fetch('/api/user-guide/ask-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullMsg,
          screen,
          ticketRef,
          history: historyForApi,
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
            if (parsed.token) {
              answer += parsed.token;
              setStreamingContent(answer);
            } else if (parsed.thought) {
              // Streaming status is intentionally visual-only.
            } else if (parsed.done) {
              answer = parsed.text || answer;
              articles = Array.isArray(parsed.articles) ? parsed.articles : [];
              actions = Array.isArray(parsed.actions) ? parsed.actions : [];
              thinking = Array.isArray(parsed.thinking) ? parsed.thinking : [];
              evidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];
            } else if (parsed.error) {
              if (parsed.suggestedModel) suggestedModel = { id: parsed.suggestedModel, label: parsed.suggestedModelLabel || 'Gemini 3.1 Flash Lite' };
              answer = parsed.error === 'Failed to reach Gemini API'
                ? "⚠️ **Gemini API is not configured.** Please check your settings or `.env` file."
                : `⚠️ ${parsed.error}`;
            }
          } catch {}
        }
      }
    } catch (e: any) {
      answer = `⚠️ Could not reach Gemini: ${e.message}`;
    }
    setStreamingContent('');
    const finalAnswer = answer || 'No response.';
    const finalHistory: ChatMessage[] = [...next, { role: 'assistant' as const, content: finalAnswer, timestamp: Date.now(), articles, article: articles[0] ?? null, actions: ensureLocalAppActions(finalAnswer, actions), followups: followups.length ? followups : undefined, thinking: thinking.length ? thinking : undefined, evidence: evidence.length ? evidence : undefined, suggestedModel }];
    onUpdateHistory(finalHistory);
    setIsLoading(false); onLoadingChange?.(false);

    // Auto-save conversation
    const apiMsgs = finalHistory.map((m: ChatMessage) => ({ role: m.role, content: m.content, displayContent: m.displayContent || null, chips: m.chips?.length ? m.chips : null, thinking: m.thinking?.length ? m.thinking : null, evidence: m.evidence?.length ? m.evidence : null }));
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: conversationIdRef.current, messages: apiMsgs, source: 'panel' }),
    }).then(r => r.json()).then(d => { if (d.id) conversationIdRef.current = d.id; }).catch(() => {});
  };

  useEffect(() => {
    if (!historyView) return;
    fetch('/api/conversations').then(r => r.json()).then(d => setConversations(d.conversations || [])).catch(() => {});
  }, [historyView]);

  const loadConversation = async (id: string) => {
    try {
      const d = await fetch(`/api/conversations/${id}`).then(r => r.json());
      // Strip inline chip-context dumps from user messages so the bubble shows
      // only the typed text + pills, never the raw "[Context — …]" block.
      const stripChipDump = (s: string) => {
        const idx = s.indexOf('[Context — ');
        return idx >= 0 ? s.slice(0, idx).trim() : s;
      };
      const entries: ChatMessage[] = d.messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.role === 'user' ? stripChipDump(m.content) : m.content,
        displayContent: typeof m.displayContent === 'string' ? m.displayContent : undefined,
        timestamp: Date.now(),
        chips: m.chips?.length ? m.chips : undefined,
        articles: m.articles?.length ? m.articles : undefined,
        actions: m.actions?.length ? m.actions : undefined,
        evidence: m.evidence?.length ? m.evidence : undefined,
      }));
      onUpdateHistory(entries);
      conversationIdRef.current = id;
      setHistoryView(false);
    } catch {}
  };

  // ── Theme tokens ──
  const t = isDark
    ? {
        shell: 'bg-[#13141F]',
        border: 'border-white/5',
        headTitle: 'text-white',
        subtle: 'text-white/30',
        subtleHover: 'hover:text-white/60 hover:bg-white/8',
        heading: 'text-[#74BBFF]',
        suggestText: 'text-white/55 hover:text-white/85 hover:bg-white/5',
        suggestIcon: 'text-white/25 group-hover:text-white/45',
        userBubble: 'bg-[#1A73E8]/25 border border-[#1A73E8]/30 text-white/85',
        aiText: 'text-white/75',
        prose: 'ai-prose-dark',
        banner: 'bg-white/5 text-white/45 border-white/8',
        inputWrap: 'bg-[#1E2035] border-white/8',
        inputText: 'text-white/80 placeholder:text-white/30',
        footer: 'text-white/20 hover:text-white/35',
      }
    : {
        shell: 'bg-white',
        border: 'border-black/8',
        headTitle: 'text-[#1D192B]',
        subtle: 'text-black/30',
        subtleHover: 'hover:text-black/55 hover:bg-black/5',
        heading: 'text-[#1A73E8]',
        suggestText: 'text-[#49454F] hover:text-[#1D192B] hover:bg-black/4',
        suggestIcon: 'text-black/25 group-hover:text-black/45',
        userBubble: 'bg-[#1A73E8] text-white',
        aiText: 'text-[#1D192B]',
        prose: 'ai-prose-light',
        banner: 'bg-[#F1F3F4] text-[#49454F] border-black/5',
        inputWrap: 'bg-white border-[#DADCE0]',
        inputText: 'text-[#1D192B] placeholder:text-black/35',
        footer: 'text-black/25 hover:text-black/45',
      };

  const showBanner = screenContext && screenContext.kind !== 'generic' && screenContext.kind !== 'dashboard';

  return (
    <div className="relative flex h-full min-h-0 w-full shrink-0 flex-col">
      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px]',
          t.shell,
          isDark ? 'border border-white/8' : 'border border-black/8',
        )}
      >
        {/* Header — switches between Gemini and History inline */}
        <div className={cn('flex items-center gap-2.5 px-4 pt-4 pb-3 border-b shrink-0', t.border)}>
          {historyView ? (
            <>
              <button type="button" onClick={() => setHistoryView(false)} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)}>
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <span className={cn('text-[15px] font-bold flex-1', t.headTitle)}>History</span>
              <button type="button" onClick={() => { setHistoryView(false); onUpdateHistory([]); conversationIdRef.current = null; }} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)} title="New chat">
                <span className="material-symbols-outlined text-[16px]">edit_square</span>
              </button>
              <button type="button" onClick={() => { setHistoryView(false); onClose(); }} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)}>
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setHistoryView(true)} className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)}>
                <span className="material-symbols-outlined text-[18px]">menu</span>
              </button>
              <GeminiIcon className="w-4 h-4 shrink-0" />
              <span className={cn('text-[15px] font-bold shrink-0 whitespace-nowrap', t.headTitle)}>Gemini</span>
              <div className="ml-auto flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => { onUpdateHistory([]); conversationIdRef.current = null; }} className={cn('h-7 w-7 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)} title="New chat">
                <span className="material-symbols-outlined text-[16px]">edit_square</span>
              </button>
              <button type="button" onClick={onClose} className={cn('h-7 w-7 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)} title="Close Gemini">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
              </div>
            </>
          )}
        </div>

        {/* Content area wrapper — history slides over chat as absolute overlay */}
        <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Chat body — scroll area */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 flex flex-col min-h-0">
            {isEmpty ? (
              <div className={cn('flex-1 flex flex-col py-4', showSearchResults ? 'justify-start' : 'items-center justify-center gap-4')}>
                {showSearchResults ? (
                  <div className="w-full">
                    <div className="flex items-center justify-end px-1 pb-2">
                      <button
                        type="button"
                        onClick={() => clearInput()}
                        className={cn('w-7 h-7 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)}
                        title="Clear search"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </div>
                    {groupedSearchResults.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {groupedSearchResults.map(group => (
                          <div key={group.type} className={cn('rounded-[22px] py-2 overflow-hidden', isDark ? 'bg-white/[0.045]' : 'bg-[#F5F6F7]')}>
                            <div className={cn('px-5 pt-1.5 pb-2 flex items-center gap-2 text-[13px] font-bold select-none', isDark ? 'text-white/62' : 'text-[#3F3A45]')}>
                              <span className="material-symbols-outlined text-[20px] leading-none">{group.items[0]?.icon}</span>
                              <span>{group.label}</span>
                            </div>
                            {group.items.map((item, idx) => (
                              <div key={`${item.type}-${item.id}`} className={cn(idx < group.items.length - 1 && (isDark ? 'border-b border-white/8' : 'border-b border-[#E1E4E8]'))}>
                                <button
                                  type="button"
                                  onClick={() => selectSearchResult(item)}
                                  className={cn('w-full flex items-start gap-3 px-5 py-3 rounded-none text-left transition-colors', isDark ? 'hover:bg-white/10' : 'hover:bg-[#E8EAED]')}
                                >
                                  <span className="flex flex-col min-w-0 flex-1 gap-0.5">
                                    <span className={cn('text-[13.5px] font-semibold truncate', isDark ? 'text-white/90' : 'text-[#202124]')}>{item.title}</span>
                                    {item.subtitle && item.type === 'guide' ? (
                                      <span className="flex items-center gap-1 min-w-0 text-[10.5px] font-semibold truncate">
                                        {searchCrumbs(item).map((part, partIdx, arr) => (
                                          <React.Fragment key={`${item.id}-${part}-${partIdx}`}>
                                            {partIdx > 0 && <span className={cn('material-symbols-outlined text-[13px] shrink-0', isDark ? 'text-white/28' : 'text-[#8B8490]')}>chevron_right</span>}
                                            <span className={cn('truncate', partIdx === arr.length - 1 ? 'text-[#1A73E8] dark:text-[#74BBFF]' : isDark ? 'text-white/48' : 'text-[#6B6470]')}>{part}</span>
                                          </React.Fragment>
                                        ))}
                                      </span>
                                    ) : item.subtitle && <span className={cn('text-[10.5px] font-semibold uppercase tracking-wide truncate', isDark ? 'text-white/44' : 'text-[#6B6470]')}>{item.subtitle}</span>}
                                  </span>
                                  {item.meta && <span className={cn('mt-0.5 text-[9px] font-black uppercase tracking-wide shrink-0 px-2 py-1 rounded-full', isDark ? 'bg-white/8 text-white/50' : 'bg-white/80 text-[#5F6368]')}>{item.meta}</span>}
                                </button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={cn('py-12 px-5 text-center text-[13px]', isDark ? 'text-white/40' : 'text-[#5f6368]')}>
                        No results found.
                      </div>
                    )}
                  </div>
                ) : (
                  <h2 className={cn('text-[18px] font-medium text-center leading-tight px-2', t.heading)}>{heading}</h2>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {chatHistory.map((msg, i) => (
                  <div key={i} data-gem-msg={i} className={cn('flex flex-col scroll-mt-3', msg.role === 'user' ? 'items-end' : 'items-start')}>
                    {msg.role === 'user' ? (
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
                              onClick={cancelEdit}
                              title="Cancel edit"
                              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-black/40 hover:text-black/70 hover:bg-black/5 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">cancel</span>
                            </button>
                            <button type="button"
                              onClick={submitEdit}
                              title="Approve edits"
                              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#1A73E8] hover:bg-[#1A73E8]/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </button>
                          </div>
                        ) : (
                        <>
                        {msg.edited && (
                          <span className={cn('text-[9px] font-medium pr-1 pb-0.5', isDark ? 'text-white/35' : 'text-black/35')}>Edited</span>
                        )}
                        {msg.chips && msg.chips.length > 0 ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {msg.chips.map(c => (
                                <span key={c.label} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A73E8]/15 text-[#1A73E8] dark:bg-[#74BBFF]/15 dark:text-[#74BBFF] border border-[#1A73E8]/20 dark:border-[#74BBFF]/20">
                                  #{c.label}
                                </span>
                              ))}
                            </div>
                            {(msg.displayContent || msg.content) && (
                              <div className={cn('px-3 py-2 rounded-2xl rounded-br-sm', t.userBubble)}>
                                <p className="text-[12px] leading-relaxed">{msg.displayContent || msg.content}</p>
                              </div>
                            )}
                          </div>
                        ) : msg.displayContent ? (
                          <div className={cn('flex items-center gap-2 pl-3 pr-3.5 py-2.5 rounded-2xl rounded-br-sm', t.userBubble)}>
                            <span className="material-symbols-outlined text-[15px] shrink-0 opacity-70">{displayContentIcon(msg.displayContent)}</span>
                            <p className="text-[12px] leading-relaxed font-medium">{msg.displayContent}</p>
                          </div>
                        ) : (
                          <div className={cn('px-3 py-2 rounded-2xl rounded-br-sm', t.userBubble)}>
                            <p className="text-[12px] leading-relaxed">{msg.content}</p>
                          </div>
                        )}
                        {msg.content && (
                          <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button"
                              onClick={() => copyPrompt(i, msg.content)}
                              title={copiedIdx === i ? 'Copied' : 'Copy'}
                              className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)}
                            >
                              <span className="material-symbols-outlined text-[14px]">{copiedIdx === i ? 'check' : 'content_copy'}</span>
                            </button>
                            <button type="button"
                              onClick={() => editPrompt(i)}
                              title="Edit"
                              className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)}
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
                        {msg.thinking && msg.thinking.length > 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={event => {
                                event.stopPropagation();
                                setOpenThinkingMessage(current => current === i ? null : i);
                              }}
                              aria-label={openThinkingMessage === i ? 'Hide Gemini thinking notes' : 'Show Gemini thinking notes'}
                              aria-expanded={openThinkingMessage === i}
                              className={cn('flex h-6 items-center gap-1.5 text-[11px] font-semibold transition-colors', isDark ? 'text-white/50 hover:text-white/80' : 'text-[#7A7F87] hover:text-[#0B57D0]')}
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
                                    {msg.thinking.map((note, noteIndex) => <li key={noteIndex}>{note}</li>)}
                                  </ul>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <MarkdownContent
                              className={cn('mt-3 min-w-0 text-[12px] leading-relaxed ai-prose', t.prose, t.aiText)}
                              content={msg.content}
                              inlineActions={msg.actions}
                              onRunAction={onRunAction}
                              isDark={isDark}
                            />
                          </>
                        ) : (
                          <div className="flex gap-2 items-start w-full">
                            <GeminiIcon className={cn("w-4 h-4 shrink-0 mt-0.5", isLoading && i === chatHistory.length - 1 && "gemini-twinkle")} />
                            <MarkdownContent
                              className={cn('flex-1 min-w-0 text-[12px] leading-relaxed ai-prose', t.prose, t.aiText)}
                              content={msg.content}
                              inlineActions={msg.actions}
                              onRunAction={onRunAction}
                              isDark={isDark}
                            />
                          </div>
                        )}
                        {msg.content && (
                          <div className="ml-[22px] mt-0.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button"
                              onClick={() => copyPrompt(i, msg.content)}
                              title={copiedIdx === i ? 'Copied' : 'Copy'}
                              className={cn('w-6 h-6 flex items-center justify-center rounded-full transition-colors', t.subtle, t.subtleHover)}
                            >
                              <span className="material-symbols-outlined text-[14px]">{copiedIdx === i ? 'check' : 'content_copy'}</span>
                            </button>
                          </div>
                        )}
                        {msg.suggestedModel && (
                          <button type="button" onClick={() => switchSuggestedModel(msg.suggestedModel!, i)} className="ml-[22px] mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[11px] font-bold text-[#0B57D0] transition-colors hover:bg-[#D2E3FC]">
                            <span className="material-symbols-outlined text-[15px]">autorenew</span> Switch to {msg.suggestedModel.label}
                          </button>
                        )}
                        <SourcesPill evidence={msg.evidence} isDark={isDark} onOpenArticle={onOpenArticle} />
                        <SuggestedArticlesPill articles={(msg.articles?.length ? msg.articles : (msg.article ? [msg.article] : [])).slice(0, 3)} isDark={isDark} onOpenArticle={onOpenArticle} />
                        {msg.followups && msg.followups.length > 0 && (
                          <div className="mt-2 ml-[22px] flex flex-col gap-1.5" style={{ width: 'calc(100% - 22px)' }}>
                            <span className={cn('text-[8.5px] font-black uppercase tracking-widest pl-0.5', isDark ? 'text-white/35' : 'text-black/35')}>
                              Continue with
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.followups.slice(0, 3).map((fu, ci) => (
                                <button type="button"
                                  key={ci}
                                  onClick={() => sendMessage('', [fu])}
                                  className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold transition-colors',
                                    isDark ? 'bg-white/5 border-white/8 hover:bg-white/8 text-white/85' : 'bg-[#F1F3F4] border-black/5 hover:bg-[#E8F0FE] text-[#1D192B]'
                                  )}
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

                {/* Refine pills — recast the most recent answer */}
                {!isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'assistant' && (
                  <div className="relative flex flex-wrap gap-1.5 pt-0.5 pl-5">
                    {([
                      { mode: 'shorter', label: 'Shorter', icon: 'compress' },
                      { mode: 'technical', label: 'Expand', icon: 'expand_content' },
                      { mode: 'data', label: '+ Data', icon: 'bar_chart' },
                    ] as const).map(p => (
                      <button type="button"
                        key={p.mode}
                        onClick={() => refineLast(p.mode)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[#1A73E8]/10 text-[#1A73E8] hover:bg-[#1A73E8]/20 dark:text-[#74BBFF] dark:bg-[#74BBFF]/10 dark:hover:bg-[#74BBFF]/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[12px]">{p.icon}</span>
                        {p.label}
                      </button>
                    ))}

                    {/* More formats toggle */}
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
                            key="panel-more-fmt"
                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                            transition={{ duration: 0.13, ease: [0.175, 0.885, 0.32, 1.15] }}
                            className={cn(
                              'absolute bottom-[calc(100%+6px)] left-0 w-36 rounded-xl border py-1.5 z-50',
                              isDark
                                ? 'bg-[#2C2B30] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                                : 'bg-white border-[#E0E4EC] shadow-[0_4px_20px_rgba(0,0,0,0.12)]',
                            )}
                          >
                            {([
                              { mode: 'formal' as const, label: 'Formal', icon: 'work' },
                              { mode: 'bulletize' as const, label: 'Bulletize', icon: 'format_list_bulleted' },
                              { mode: 'standard' as const, label: 'Standard', icon: 'notes' },
                            ]).map(mf => (
                              <button
                                type="button"
                                key={mf.mode}
                                onClick={() => {
                                  setMoreFormatsOpen(false);
                                  refineLast(mf.mode, mf.label);
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
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Horizontal chronological history — a single line of dots sitting just
              above the input. Hover the line OR the popup to keep it open; a small
              close-debounce stops the popup from flickering when the cursor crosses
              the gap. The popup is anchored to a wide invisible "bridge" so the
              hover hit-box is continuous between dots and popup. */}
          {!historyView && !isEmpty && chatHistory.length > 1 && (
            <div className="shrink-0 px-4 pb-1 pt-0.5">
              <div
                className="relative flex justify-center"
                onMouseEnter={openHistory}
                onMouseLeave={scheduleCloseHistory}
              >
                {/* Invisible hover bridge that spans the full panel width and the
                    vertical area above the dot rail. Keeps the wrapper "hovered"
                    while the cursor moves toward the popup. */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: historyOpen ? 280 : 14, pointerEvents: 'none' }}
                />

                {/* Popup — always rendered, visibility/scale toggled by state. */}
                <div
                  onMouseEnter={openHistory}
                  onMouseLeave={scheduleCloseHistory}
                  className={cn(
                    'absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[280px] max-h-[260px] overflow-y-auto custom-scrollbar rounded-xl border shadow-xl transition-all duration-150 origin-bottom',
                    isDark ? 'bg-[#1E2035] border-white/10' : 'bg-white border-[#E8EAED]',
                    historyOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1 pointer-events-none'
                  )}
                >
                  <div className={cn('sticky top-0 px-3 py-2 border-b text-[9px] font-black uppercase tracking-widest select-none', isDark ? 'bg-[#1E2035] border-white/8 text-white/30' : 'bg-white border-[#F1F3F4] text-[#9AA0A6]')}>
                    This conversation · {chatHistory.length}
                  </div>
                  {chatHistory.map((msg, i) => (
                    <button type="button"
                      key={i}
                      onClick={() => { scrollToMessage(i); setHistoryOpen(false); }}
                      className={cn('w-full text-left px-3 py-1.5 flex items-start gap-2 transition-colors cursor-pointer', isDark ? 'hover:bg-white/5' : 'hover:bg-[#F8F9FA]')}
                    >
                      <span className={cn('text-[8.5px] font-black uppercase tracking-wide shrink-0 mt-0.5 w-5', msg.role === 'user' ? 'text-[#1A73E8]' : isDark ? 'text-[#74BBFF]/60' : 'text-[#9AA0A6]')}>
                        {msg.role === 'user' ? 'You' : 'AI'}
                      </span>
                      <span className={cn('text-[11px] truncate leading-snug', isDark ? 'text-white/60' : 'text-[#5F6368]')}>
                        {(() => {
                          const preview = (msg.content || msg.chips?.map(c => `#${c.label}`).join(' ') || '').replace(/[#*`>]/g, '').slice(0, 64);
                          return `${preview}${(msg.content || '').length > 64 ? '…' : ''}`;
                        })()}
                      </span>
                    </button>
                  ))}
                </div>

                {/* The dot line — compact and stable. */}
                <div className="flex items-center justify-center gap-1.5 py-2 cursor-default">
                  {chatHistory.slice(-12).map((msg, i, arr) => (
                    <button type="button"
                      key={i}
                      onClick={() => scrollToMessage(chatHistory.length - arr.length + i)}
                      title={(msg.content || msg.chips?.map(c => `#${c.label}`).join(' ') || '').slice(0, 60)}
                      className={cn(
                        'h-1.5 rounded-full transition-all hover:h-2.5 cursor-pointer',
                        msg.role === 'user'
                          ? 'w-3 bg-[#1A73E8]'
                          : cn('w-1.5', isDark ? 'bg-white/30' : 'bg-[#C5D0DB]')
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Floating "jump to latest" arrow — appears in the lower-right of the chat
              scroll area whenever the user has scrolled up. */}
          <AnimatePresence>
            {!historyView && !isEmpty && showScrollDown && (
              <motion.button type="button"
                key="scroll-down"
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 8 }}
                onClick={() => scrollToBottom()}
                title="Jump to latest"
                className={cn(
                  'absolute right-3 bottom-[54px] z-20 w-8 h-8 rounded-full flex items-center justify-center border shadow-md transition-colors',
                  isDark ? 'bg-[#1E2035] border-white/10 text-white/70 hover:text-white' : 'bg-white border-[#E8EAED] text-[#5F6368] hover:text-[#1A73E8] hover:border-[#1A73E8]/30'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* History panel — slides in from right as absolute overlay */}
          <AnimatePresence>
            {historyView && (
              <motion.div
                key="history-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn('absolute inset-0 z-20 overflow-y-auto custom-scrollbar rounded-b-[16px] px-3 py-3 pb-6', isDark ? 'bg-[#13141F]' : 'bg-white')}
              >
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 text-center h-full">
                    <p className={cn('text-[14px] font-bold', isDark ? 'text-white/80' : 'text-[#1D192B]')}>No results.</p>
                    <p className={cn('text-[12px]', isDark ? 'text-white/45' : 'text-[#49454F]')}>Some activity may not appear yet.</p>
                    <button type="button"
                      onClick={() => { setHistoryView(false); onUpdateHistory([]); conversationIdRef.current = null; }}
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

        {/* Starter suggestion pills — only when chat is empty, bottom-left above input.
            Wait for the model to read the on-screen content and generate grounded
            suggestions; show a shimmer "generating" animation while it streams.
            Only fall back to generic prompts if the model returns nothing. */}
        {!historyView && isEmpty && !isLoading && (
          <div className="px-4 pb-1 pt-0.5 flex flex-wrap items-center gap-1.5 shrink-0 min-h-[34px]">
            {trimmedSearchQuery.length > 0 ? (
              searchSuggestionItems.length > 0 ? (
                searchSuggestionItems.map(item => (
                  <button
                    type="button"
                    key={`${item.type}-${item.id}`}
                    onClick={() => selectSearchResult(item, 'suggestion')}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-[27px] max-w-full px-3.5 rounded-full text-[11px] leading-none font-semibold transition-colors whitespace-nowrap shadow-[0_1px_3px_rgba(26,115,232,0.22)]',
                      isDark
                        ? 'bg-[#1A73E8]/20 text-[#74BBFF] hover:bg-[#1A73E8]/35 border border-[#1A73E8]/35'
                        : 'bg-[#1A73E8] text-white hover:bg-[#1557B0] border border-[#1A73E8]',
                    )}
                  >
                    <span className="material-symbols-outlined text-[13px] leading-none shrink-0">{item.icon}</span>
                    <span className="truncate">{searchSuggestionLabel(item)}</span>
                    <span className={cn('text-[8px] leading-none font-black uppercase tracking-wide shrink-0', isDark ? 'text-white/45' : 'text-white/65')}>
                      {item.type === 'ticket' ? 'Ticket' : item.type === 'guide' ? 'Guide' : 'View'}
                    </span>
                  </button>
                ))
              ) : (
                <span className={cn(
                  'inline-flex items-center gap-1.5 h-[27px] px-3.5 rounded-full text-[11px] leading-none font-semibold border whitespace-nowrap',
                  isDark ? 'bg-white/6 text-white/45 border-white/10' : 'bg-[#E9EEF6] text-[#5f6368] border-[#DDE5F2]',
                )}>
                  <span className="material-symbols-outlined text-[13px] leading-none">travel_explore</span>
                  Search "{trimmedSearchQuery}"
                </span>
              )
            ) : startersLoading ? (
              [120, 150, 96].map((w, i) => (
                <span
                  key={i}
                  className="gemini-skel rounded-full h-[27px]"
                  style={{ width: w, animationDelay: `${i * 0.12}s` }}
                  aria-hidden="true"
                />
              ))
            ) : suggestions.length > 0 ? (
              suggestions.slice(0, 3).map((s, i) => (
                <button type="button"
                  key={i}
                  onClick={() => sendMessage(s)}
                className={cn(
                    'inline-flex items-center h-[27px] px-3.5 rounded-full text-[11px] leading-none font-semibold transition-colors whitespace-nowrap shadow-[0_1px_3px_rgba(26,115,232,0.22)]',
                    isDark
                      ? 'bg-[#1A73E8]/20 text-[#74BBFF] hover:bg-[#1A73E8]/35 border border-[#1A73E8]/35'
                      : 'bg-[#1A73E8] text-white hover:bg-[#1557B0] border border-[#1A73E8]',
                  )}
                >
                  {s}
                </button>
              ))
            ) : null}
          </div>
        )}

        {/* Input */}
        {!historyView && <div className={cn('px-4 pb-4 pt-2 shrink-0 border-t', t.border)}>
          {/* Chips row */}
          {panelChips.length > 0 && (
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              {panelChips.map(chip => (
                <span key={chip.label} className="inline-flex items-center gap-0.5 bg-[#D3E3FD] text-[#041e49] text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                  {chip.label}
                  <button type="button" onClick={() => setPanelChips(prev => prev.filter(c => c.label !== chip.label))} className="opacity-50 hover:opacity-100 ml-0.5">
                    <span className="material-symbols-outlined text-[10px]">close</span>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Format dropdown */}
          <div className="relative">
            <AnimatePresence>
              {formatOpen && (
                <motion.div
                  key="panel-fmt-dropdown"
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.175, 0.885, 0.32, 1.15] }}
                  className={cn(
                    'absolute bottom-full left-0 mb-2 w-44 rounded-xl border py-1.5 z-50',
                    isDark
                      ? 'bg-[#2C2B30] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                      : 'bg-white border-[#E0E4EC] shadow-[0_4px_20px_rgba(0,0,0,0.1)]',
                  )}
                >
                  {PANEL_FORMAT_OPTIONS.map(fmt => (
                    <button type="button"
                      key={fmt}
                      onClick={() => { setPanelFormat(fmt); setFormatOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-2.5 justify-between px-4 py-2 text-[12px] font-medium transition-colors',
                        isDark ? 'text-white/90 hover:bg-white/8' : 'text-[#1F1F1F] hover:bg-[#F1F3F4]',
                        panelFormat === fmt && 'text-[#1A73E8]',
                      )}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className={cn('material-symbols-outlined text-[16px] shrink-0', panelFormat === fmt ? 'text-[#1A73E8]' : isDark ? 'text-white/45' : 'text-[#5f6368]')}>{PANEL_FORMAT_ICONS[fmt]}</span>
                        <span>{fmt}</span>
                      </span>
                      {panelFormat === fmt && <span className="material-symbols-outlined text-[#1A73E8] text-[14px] shrink-0">check</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn('relative isolate min-w-0 rounded-[28px]', isLoading && 'overflow-visible')}>
              {isLoading && (
                <span
                  aria-hidden="true"
                  className="gemini-border-glow gemini-border-glow-thinking absolute inset-0 rounded-[28px]"
                  style={{ '--gemini-shell-surface': isDark ? '#13141F' : '#ffffff' } as React.CSSProperties}
                />
              )}
              <div className={cn('relative z-10 flex gap-1 rounded-[28px] px-2.5 py-1.5 border min-w-0', inputExpanded ? 'items-end' : 'items-center', t.inputWrap)}>
              {/* + context button — matches pill exactly */}
              <button type="button"
                onClick={() => onSelectorToggle?.(!selectorActive)}
                title="Add context from a section tab"
                className={cn(
                  'h-9 flex items-center justify-center overflow-hidden rounded-full transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] shrink-0',
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

              {/* Format button — matches pill chip style */}
              <button type="button"
                onClick={() => setFormatOpen(v => !v)}
                title="Response format"
                className={cn(
                  'flex items-center justify-center rounded-full shrink-0 transition-all',
                  panelFormat !== 'Standard'
                    ? 'h-9 px-3 gap-1.5 bg-[#D3E3FD] text-[#1A73E8]'
                    : cn('w-9 h-9', formatOpen
                        ? isDark ? 'bg-white/12 text-white/90' : 'bg-black/8 text-[#1F1F1F]'
                        : isDark ? 'text-white/60 hover:bg-white/8' : 'text-[#444746] hover:bg-black/8'),
                )}
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                {panelFormat !== 'Standard' && <span className="text-xs font-bold leading-none">{panelFormat}</span>}
              </button>

              <div className="relative flex-1 min-w-0 flex items-center">
                {isLoading ? (
                  <span className={cn('flex h-10 items-center pl-5 text-[15px] leading-normal font-semibold', isDark ? 'text-white/75' : 'text-[#4F565E]')}>
                    <span className="thinking-shimmer">Thinking...</span>
                  </span>
                ) : (
                  <>
                {inlineSuggestion && (
                  <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 min-w-0 overflow-hidden whitespace-pre-wrap break-words text-[13px] leading-5', isDark ? 'text-white/35' : 'text-[#70757a]')}>
                    <span className="invisible">{input}</span>
                    <span>{inlineSuggestion}</span>
                    <svg
                      className="ml-1 inline-block h-[15px] w-[23px] align-[-3px]"
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
                  rows={1}
                  autoComplete="off"
                  className={cn('relative z-10 block h-5 min-h-5 max-h-[92px] w-full min-w-0 resize-none overflow-hidden bg-transparent outline-none text-[13px] leading-5 caret-[#1A73E8]', t.inputText)}
                  placeholder="Ask Gemini or type to search"
                  value={input}
                  onChange={e => updateInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Tab' && inlineSuggestion) {
                      e.preventDefault();
                      const cursor = inputRef.current?.selectionStart ?? input.length;
                      const before = input.slice(0, cursor);
                      const after = input.slice(cursor);
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
                      updateInput(nextValue);
                      setInlineSuggestion('');
                      window.requestAnimationFrame(() => {
                        inputRef.current?.focus();
                        const nextCursor = before.length + spacer.length + inlineSuggestion.length;
                        inputRef.current?.setSelectionRange(nextCursor, nextCursor);
                      });
                    } else if (e.key === 'Enter' && !isLoading && (input.trim() || panelChips.length > 0)) {
                      e.preventDefault();
                      sendMessage();
                    } else if (e.key === 'Escape' && inlineSuggestion) {
                      e.preventDefault();
                      setInlineSuggestion('');
                    }
                  }}
                />
                  </>
                )}
              </div>
              {isLoading ? (
                <button type="button"
                  onClick={() => {
                    abortRef.current?.abort();
                    abortRef.current = null;
                    setIsLoading(false);
                    setStreamingContent('');
                    onLoadingChange?.(false);
                    onUpdateHistory([...chatHistory, { role: 'assistant', content: "Ok. Let's keep chatting! Your turn.", timestamp: Date.now() }]);
                  }}
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-[border-radius,background-color,transform] duration-200 bg-[#0b57d0] text-white hover:bg-[#0842a0] hover:scale-105"
                  title="Stop generation"
                >
                  <span className="h-3.5 w-3.5 rounded-[2px] bg-white" aria-hidden="true" />
                </button>
              ) : (
                <button type="button"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() && panelChips.length === 0}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all',
                    (input.trim() || panelChips.length > 0)
                      ? 'bg-[#0b57d0] text-white hover:bg-[#0842a0] hover:scale-105'
                      : cn(isDark ? 'bg-white/8 text-white/20' : 'bg-[#F1F3F4] text-[#BFBFBF]', 'cursor-not-allowed')
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
              )}
              </div>
            </div>
          </div>

        </div>}

      </div>
    </div>
  );
}
