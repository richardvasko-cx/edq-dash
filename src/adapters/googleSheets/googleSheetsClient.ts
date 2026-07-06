// Source-agnostic loader for Looker view data.
//
// Demo implementation: reads local CSV exports served from /fixtures/looker/<view>.csv
// (built from a Google Sheet, one tab per Looker view). Read-only, offline, no credentials.
//
// The interface is deliberately source-agnostic: a future live Google Sheets API client or a
// Looker/Snowflake query client can replace `loadViewCsv` without touching the per-view adapters.

import { parseCsv, type RawRow } from './csv';
import type { LookerViewName } from '../../models/looker';

export interface LoadResult {
  headers: string[];
  rows: RawRow[];
}

export interface ViewClient {
  loadView(view: LookerViewName): Promise<LoadResult>;
}

const FIXTURE_BASE = '/fixtures/looker';

/** Default demo client: fetches the static CSV for a view. */
export const localCsvClient: ViewClient = {
  async loadView(view: LookerViewName): Promise<LoadResult> {
    const url = `${FIXTURE_BASE}/${view}.csv`;
    let res: Response;
    try {
      res = await fetch(url, { cache: 'no-store' });
    } catch (cause) {
      throw new Error(`Failed to load Looker view "${view}" from ${url}`, { cause });
    }
    if (!res.ok) {
      throw new Error(`Looker view "${view}" unavailable (${res.status} ${res.statusText}) at ${url}`);
    }
    const text = await res.text();
    return parseCsv(text);
  },
};
