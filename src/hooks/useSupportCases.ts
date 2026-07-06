// Derives the At a Glance aggregates from the canonical CSV dataset (CaseRecord[]).
// The CSV is the SOLE source of truth — this hook no longer touches the Google
// Sheets adapter. It maps CaseRecord rows into the legacy-shaped rows the view
// consumes and computes open-count, priority breakdown and a real case-volume
// trend grouped by case_created_at day.

import { useMemo } from 'react';
import { useCaseDataset } from './useCaseDataset';
import { isOpenCase, type CaseRecord } from '../services/caseDataset';

// Per-case fields surfaced on the At a Glance view.
export interface GlanceCaseRow {
  id: string;            // case_number (canonical navigation key)
  case_number: string;
  account_name: string;
  subject: string;       // case_subject
  case_owner: string;
  contact_name: string;
  status: CaseRecord['case_status'];
  priority: string;      // case_priority
  issue_type: string;
  created_time: string;  // case_created_at
}

export interface SupportCasesData {
  status: 'loading' | 'available' | 'empty' | 'unavailable';
  cases: CaseRecord[];
  rows: GlanceCaseRow[];
  totalOpen: number;
  byPriority: Record<string, number>;
  volumeByDate: { date: string; count: number }[];
  error?: string;
}

function toRow(c: CaseRecord): GlanceCaseRow {
  return {
    id: c.case_number,
    case_number: c.case_number,
    account_name: c.account_name,
    subject: c.case_subject,
    case_owner: c.case_owner,
    contact_name: c.contact_name,
    status: c.case_status,
    priority: c.case_priority,
    issue_type: c.issue_type,
    created_time: c.case_created_at,
  };
}

function computeAggregates(cases: CaseRecord[]): Pick<SupportCasesData, 'totalOpen' | 'byPriority' | 'volumeByDate'> {
  let totalOpen = 0;
  const byPriority: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  const dateCounts: Record<string, number> = {};

  for (const c of cases) {
    if (isOpenCase(c)) {
      totalOpen++;
      if (c.case_priority in byPriority) byPriority[c.case_priority]++;
    }
    // Real per-case volume trend — group by case_created_at day (all cases).
    if (c.case_created_at) {
      const date = c.case_created_at.slice(0, 10);
      dateCounts[date] = (dateCounts[date] ?? 0) + 1;
    }
  }

  const volumeByDate = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { totalOpen, byPriority, volumeByDate };
}

export function useSupportCases(): SupportCasesData {
  const { cases, loading, error } = useCaseDataset();

  return useMemo(() => {
    if (loading) {
      return { status: 'loading', cases: [], rows: [], totalOpen: 0, byPriority: { High: 0, Medium: 0, Low: 0 }, volumeByDate: [] };
    }
    if (error) {
      return { status: 'unavailable', cases: [], rows: [], totalOpen: 0, byPriority: { High: 0, Medium: 0, Low: 0 }, volumeByDate: [], error };
    }
    return {
      status: cases.length === 0 ? 'empty' : 'available',
      cases,
      rows: cases.map(toRow),
      ...computeAggregates(cases),
    };
  }, [cases, loading, error]);
}
