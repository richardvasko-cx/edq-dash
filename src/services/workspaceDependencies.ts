// Workspace panel model + sequential-unlock / staleness logic (brief §14).
//
// The Workspace is a mandatory linear flow: the consultant acts on one panel at a
// time, and the next panel only unlocks once the current one is Accepted / Edited /
// Excluded. Editing or excluding an upstream panel marks every downstream panel
// `stale`, so the consultant re-confirms anything that depended on the change.
//
// This module is pure UI/orchestration logic — it holds no Looker field names and
// fabricates no source data; panel content is supplied by the caller.

export type WorkspacePanelId =
  | 'gettingStarted'
  | 'customerIssue'
  | 'rootCause'
  | 'authenticationFindings'
  | 'deliverabilityFindings'
  | 'emailPerformanceFindings'
  | 'supportHistoryContext'
  | 'recommendedActions'
  | 'finalResponse';

export type WorkspacePanelStatus =
  | 'locked' // not yet reachable in the flow
  | 'current' // active panel awaiting consultant action
  | 'accepted' // AI suggestion accepted as-is
  | 'edited' // consultant replaced the wording
  | 'excluded' // dropped from the final response (with a reason)
  | 'stale'; // an upstream panel changed after this one was actioned

export interface WorkspacePanelDef {
  id: WorkspacePanelId;
  title: string;
  icon: string;
  /** Final response is assembled from upstream approved panels — it isn't free-form. */
  isFinal?: boolean;
  /** Intro/"Get started" panel — static, not AI-generated, gates the flow. */
  isIntro?: boolean;
}

// Fixed panel order from the brief. Index in this array == position in the flow.
export const WORKSPACE_PANELS: WorkspacePanelDef[] = [
  { id: 'gettingStarted', title: 'Get started', icon: 'rocket_launch', isIntro: true },
  { id: 'customerIssue', title: 'Customer Issue', icon: 'contact_support' },
  { id: 'rootCause', title: 'Root Cause', icon: 'search' },
  { id: 'authenticationFindings', title: 'Authentication', icon: 'shield' },
  { id: 'deliverabilityFindings', title: 'Deliverability', icon: 'mark_email_unread' },
  { id: 'emailPerformanceFindings', title: 'Email Performance', icon: 'equalizer' },
  { id: 'supportHistoryContext', title: 'Support History', icon: 'history' },
  { id: 'recommendedActions', title: 'Next Steps', icon: 'checklist' },
  { id: 'finalResponse', title: 'Final Ticket Response', icon: 'drafts', isFinal: true },
];

export const PANEL_ORDER: WorkspacePanelId[] = WORKSPACE_PANELS.map(p => p.id);

export interface WorkspacePanelState {
  status: WorkspacePanelStatus;
  /** Original AI-suggested content. */
  suggestion: string;
  /** Consultant's accepted/edited content (what feeds the final response). */
  content: string;
  /** Required when status === 'excluded'. */
  excludeReason?: string;
}

export type WorkspaceState = Record<WorkspacePanelId, WorkspacePanelState>;

const indexOf = (id: WorkspacePanelId) => PANEL_ORDER.indexOf(id);

/** A panel counts as "resolved" once the consultant has acted on it. */
export function isResolved(s: WorkspacePanelStatus): boolean {
  return s === 'accepted' || s === 'edited' || s === 'excluded';
}

/** The next panel awaiting action — the first one that is not yet resolved. */
export function currentPanelId(state: WorkspaceState): WorkspacePanelId | null {
  for (const id of PANEL_ORDER) {
    if (!isResolved(state[id].status)) return id;
  }
  return null;
}

/** Initialise every panel: first is `current`, the rest `locked`. */
export function initWorkspaceState(suggestions: Record<WorkspacePanelId, string>): WorkspaceState {
  const state = {} as WorkspaceState;
  PANEL_ORDER.forEach((id, i) => {
    state[id] = {
      status: i === 0 ? 'current' : 'locked',
      suggestion: suggestions[id] ?? '',
      content: suggestions[id] ?? '',
    };
  });
  return state;
}

/** Recompute current/locked after a resolution: the earliest unresolved panel
 *  becomes `current`, everything after it stays `locked`. */
function relock(state: WorkspaceState): WorkspaceState {
  const current = currentPanelId(state);
  const next = { ...state };
  PANEL_ORDER.forEach(id => {
    if (isResolved(next[id].status)) return;
    next[id] = { ...next[id], status: id === current ? 'current' : 'locked' };
  });
  return next;
}

/** Mark every downstream panel that was already resolved as `stale`. */
function markDownstreamStale(state: WorkspaceState, changed: WorkspacePanelId): WorkspaceState {
  const from = indexOf(changed);
  const next = { ...state };
  PANEL_ORDER.forEach((id, i) => {
    if (i > from && isResolved(next[id].status)) {
      next[id] = { ...next[id], status: 'stale' };
    }
  });
  return next;
}

export function acceptPanel(state: WorkspaceState, id: WorkspacePanelId): WorkspaceState {
  let next = { ...state, [id]: { ...state[id], status: 'accepted' as const, content: state[id].suggestion } };
  next = markDownstreamStale(next, id);
  return relock(next);
}

export function editPanel(state: WorkspaceState, id: WorkspacePanelId, content: string): WorkspaceState {
  let next = { ...state, [id]: { ...state[id], status: 'edited' as const, content } };
  next = markDownstreamStale(next, id);
  return relock(next);
}

export function excludePanel(state: WorkspaceState, id: WorkspacePanelId, reason: string): WorkspaceState {
  let next = { ...state, [id]: { ...state[id], status: 'excluded' as const, excludeReason: reason } };
  next = markDownstreamStale(next, id);
  return relock(next);
}

/** Approved content for the final response, in order — excluded panels omitted. */
export function approvedPanels(state: WorkspaceState): Array<{ id: WorkspacePanelId; title: string; content: string }> {
  return WORKSPACE_PANELS.filter(p => !p.isFinal && !p.isIntro)
    .filter(p => state[p.id].status === 'accepted' || state[p.id].status === 'edited')
    .map(p => ({ id: p.id, title: p.title, content: state[p.id].content }));
}
