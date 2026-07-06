// Cached loader for the canonical case dataset. Fetches the CSV from public/data once,
// parses it via the pure caseDataset service, and shares the result across the app
// (module-level promise cache — no /api/tickets polling, no demo fallback).

import { useEffect, useState } from 'react';
import {
  CASE_DATASET_URL,
  parseCaseDataset,
  type CaseRecord,
  type DatasetParseResult,
} from '../services/caseDataset';

let cache: Promise<DatasetParseResult> | null = null;

export function loadCaseDataset(): Promise<DatasetParseResult> {
  if (!cache) {
    cache = fetch(CASE_DATASET_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load dataset (${res.status})`);
        return res.text();
      })
      .then(text => {
        const result = parseCaseDataset(text);
        if (result.errors.length) console.warn('[caseDataset] validation issues:', result.errors);
        return result;
      })
      .catch(err => {
        cache = null; // allow retry on next mount
        throw err;
      });
  }
  return cache;
}

export interface UseCaseDataset {
  cases: CaseRecord[];
  loading: boolean;
  error: string | null;
  validationErrors: string[];
}

export function useCaseDataset(): UseCaseDataset {
  const [state, setState] = useState<UseCaseDataset>({ cases: [], loading: true, error: null, validationErrors: [] });

  useEffect(() => {
    let alive = true;
    loadCaseDataset()
      .then(result => {
        if (alive) setState({ cases: result.records, loading: false, error: null, validationErrors: result.errors });
      })
      .catch(err => {
        if (alive) setState({ cases: [], loading: false, error: String(err?.message || err), validationErrors: [] });
      });
    return () => { alive = false; };
  }, []);

  return state;
}
