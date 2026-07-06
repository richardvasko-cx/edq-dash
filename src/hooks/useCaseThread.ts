// Loads the unified case thread (external emails + internal comments) for a case_id.
// Surfaces loading / empty / unavailable explicitly; never fabricates entries.

import { useEffect, useState } from 'react';
import {
  loadSupportCaseComments,
  loadSupportCaseEmailMessages,
  type AdapterStatus,
} from '../adapters/googleSheets/adapters';
import { buildCaseThread } from '../services/caseThread';
import type { CaseThreadEntry } from '../models/looker';

export interface CaseThreadData {
  status: 'loading' | AdapterStatus;
  entries: CaseThreadEntry[];
  emailCount: number;
  commentCount: number;
  error?: string;
}

export function useCaseThread(caseId: string | null | undefined): CaseThreadData {
  const [data, setData] = useState<CaseThreadData>({
    status: 'loading', entries: [], emailCount: 0, commentCount: 0,
  });

  useEffect(() => {
    let cancelled = false;
    if (!caseId) {
      setData({ status: 'empty', entries: [], emailCount: 0, commentCount: 0 });
      return;
    }

    (async () => {
      const [emails, comments] = await Promise.all([
        loadSupportCaseEmailMessages(),
        loadSupportCaseComments(),
      ]);
      if (cancelled) return;

      const entries = buildCaseThread(caseId, emails.rows, comments.rows);
      const unavailable = emails.status === 'unavailable' || comments.status === 'unavailable';
      const status: CaseThreadData['status'] = unavailable
        ? 'unavailable'
        : entries.length === 0 ? 'empty' : 'available';

      setData({
        status,
        entries,
        emailCount: entries.filter(e => e.communication_type === 'Email').length,
        commentCount: entries.filter(e => e.communication_type === 'Case Comment').length,
        error: emails.error ?? comments.error,
      });
    })();

    return () => { cancelled = true; };
  }, [caseId]);

  return data;
}
