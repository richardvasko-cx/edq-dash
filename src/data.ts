// Shared data models for the EDQ Dashboard.
//
// The canonical source of truth is the case dataset CSV, parsed by
// `services/caseDataset.ts` and loaded via `hooks/useCaseDataset.ts`. This module
// re-exports those types/helpers so existing imports keep a single entry point.
//
// All legacy ticket data (ACTIVE_TICKETS / HISTORICAL_TICKETS / ALL_TICKETS / TICKETS,
// the `Ticket` shape, TCK- ids, deliveryRate/Trend-style fields and the /api/tickets
// demo fallback) has been removed — see CaseRecord instead.

export type {
  CaseRecord,
  CaseThreadMessage,
  DiagnosticItem,
  BounceDetail,
  CaseMetrics,
  CaseStatus,
  CaseOwner,
  CommType,
  AuthStatus,
  WeightedMetrics,
  DatasetParseResult,
} from './services/caseDataset';

export {
  CASE_DATASET_URL,
  parseCaseDataset,
  weightedMetrics,
  isOpenCase,
  isClosedCase,
  findCase,
  uniqueAcross,
} from './services/caseDataset';

// AI assistant chat history — deliberately separate from the support case thread
// (`CaseThreadMessage`). Support communications must never be mapped to AI roles.
export interface MessageItem {
  role: 'user' | 'model';
  text: string;
}
