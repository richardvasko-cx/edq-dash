import { createContext } from 'react';

export interface ScreenContextDatum {
  label: string;
  value: string;
  /** optional trend hint derived from a +/- prefixed string */
  trend?: 'up' | 'down' | 'flat';
}

export interface ScreenContext {
  view: string;
  /** coarse type used to pick a response template */
  kind: 'ticket' | 'tool' | 'guide' | 'dashboard' | 'generic';
  /** primary heading, e.g. account name or article title */
  title: string;
  /** secondary line, e.g. "TCK-8924 · In Progress" */
  subtitle?: string;
  /** the headline problem being looked at */
  issue?: string;
  /** root-cause analysis summary text */
  rca?: string;
  /** structured supporting data shown as a table */
  data?: ScreenContextDatum[];
  /** free-form blob used to ground free-text answers */
  raw?: string;
  /** identity of the focused record — drives historical-ticket retrieval */
  recordId?: string;
  accountKey?: string;
  /** active date range filter */
  dateRange?: { from: string; to: string };
  /** 3 contextual follow-up questions */
  suggestions: string[];
}

export const AiPanelContext = createContext<{
  openPanel: (seedMessages?: any[], pendingQuery?: string, pendingQueryDisplay?: string) => void;
  /** Open the Gemini pill chat with a query (and optional display-only label). */
  openPill: (query: string, queryDisplay?: string, selectionContext?: { text: string; domContext: string }) => void;
  setScreenContext: (ctx: ScreenContext | null) => void;
  /** Navigate to the User Guide and open a specific article by githubPath. */
  openGuideArticle: (githubPath: string) => void;
}>({ openPanel: () => {}, openPill: () => {}, setScreenContext: () => {}, openGuideArticle: () => {} });
