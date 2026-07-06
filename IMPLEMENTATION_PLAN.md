# EDQ Dashboard — Implementation Plan (Looker-First)

Derived from `CLAUDE_CODE_EDQ_PROJECT_BRIEF_LOOKER_WIREFRAMES.txt`, reconciled against the current
codebase. **Looker-first contract:** real Looker view + field names are used verbatim everywhere
(view models, adapters, Sheet columns). No normalized vocabulary, no `demo_*` tabs, no invented
Looker fields. Anything absent from the supplied LookML stays in the current fixture/service or
renders an explicit *unavailable* state.

---

## 0. Current state vs. target (the real gaps)

| Area | Now | Target |
|---|---|---|
| Data file | single `src/data.ts` (`ACTIVE_TICKETS`/`HISTORICAL_TICKETS`/`ALL_TICKETS`) | keep; add Looker view models + adapters alongside |
| Metrics | ticket fields are **formatted strings** (`deliveryRate: "82.1%"`) | Looker rows store **numbers / null**; rates recomputed per LookML formula |
| Sections | all 6 live inside `views/Investigation.tsx` (one file, conditional blocks) | extract to `views/investigation/<Section>View.tsx`; `Investigation.tsx` = orchestration |
| Adapters / models / api dirs | **none** | `src/adapters/googleSheets/`, `src/models/`, server provider router |
| Workflow gating | section tabs freely clickable | locked → ready → current → complete/issue_found → stale state machine |
| AI pill ↔ panel | **separate** state, manually mirrored each change | one shared `AiWorkspaceProvider` |
| Provider routing | none | `companies_all_view.email_service_provider` selects adapter |

**Preserve (do not rewrite):** `App.tsx`, `data.ts` ticket records, `Layout.tsx`, `AiPanel.tsx`,
`GeminiPromptPill.tsx`, `server.ts`, `server_ticket_memory.ts`, `sync_user_guide.py`, User Guide
corpus. GitHub stays GET-only. Every historical ticket is kept.

---

## 1. Demo data schema (YOUR NEXT ACTION)

**Delivery = local CSV export.** Build the data in a Google Sheet (one tab per Looker view), then
export each tab as a `.csv` into the repo at **`public/fixtures/looker/<view_name>.csv`** (filename =
Looker view name, e.g. `public/fixtures/looker/platform_email_aggregation.csv`). Vite serves `public/`,
so the client adapter fetches `/fixtures/looker/<view>.csv` — fully offline, no credentials, no network,
read-only. The brief's `googleSheetsClient.ts` is a **local CSV loader** (`localCsvClient`) behind a
source-agnostic `ViewClient` interface, swappable for a live Sheets/Looker fetch later.

> **Header-only templates already created** for all 9 minimum tabs — just fill in data rows.

**Column headers = Looker field names** (unqualified). Blank cell = null; never 0 for missing.
Minimum SparkPost-led demo set:

### `companies_all_view`  (account resolution + provider routing)
```
c_id · company_name · cluster · account_status · account_status_name · availability_state
company_size · contact_email · default_time_zone · email_enabled · email_service_provider
industry · self_reported_app_name · self_reported_mau · sendgrid_email_account_username · refreshed_time
```
> `email_service_provider` drives which provider tabs are queried.

### `platform_email_aggregation`  (Overview metrics/trend/breakdown)
```
cluster · app_group_id · app_group_name · company_id · company_name · esp
event_date · event_time · from_domain · ip_pool · receiver_domain · refreshed_time
total_sent · total_delivered · total_bounces · total_soft_bounces · total_dropped · total_spam
total_unique_opens · total_unique_clicks · total_opens · total_clicks · total_amp_opens · total_amp_click_count · count
delivered_percent · bounce_rate · soft_bounce_rate_new · dropped_rate · spam_rate · unique_open_rate · unique_click_rate
```

### `sparkpost_domain_metrics` / `sparkpost_sending_ip_metrics`  (Deliverability + Performance)
```
# sparkpost_domain_metrics keys on: domain · subaccount · activity_date · report_time
# sparkpost_sending_ip_metrics keys on: sending_ip · subaccount · activity_date · report_time
sent · delivered · bounces · deferred · spam_reports · opens_total · opens_unique
clicks_total · clicks_unique · blocks · drops · count
count_targeted · count_injected · count_sent · count_accepted · count_delayed · count_delayed_first
count_delivered_first · count_delivered_subsequent · count_bounce · count_admin_bounce · count_inband_bounce
count_outofband_bounce · count_undetermined_bounce · count_policy_rejection · count_generation_rejection
count_generation_failed · count_unique_rendered
delivered_percent · opens_unique_rate · clicks_unique_rate · bounce_rate · spam_rate · block_rate · dropped_rate · deferred_rate
```

### `dmarc_header_report`  (Authentication — message results)
```
authentication_result · from_domain · spf_result · dkim_result · dmarc_result · received_time · report_time · spam_folder
count · spf_pass · spf_notpass · dkim_pass · dkim_notpass · dmarc_pass · dmarc_notpass
# expanded-evidence only (mark sensitive): delivered_to · sent_to · from_address · subject · received_alias · feedback_id · sg_eid · sg_id
```

### `dmarc_aggregated_report`  (Authentication — policy)
```
report_date · date_range_begin_date · date_range_end_date · policy_domain · identifiers_header_from
source_ip · auth_results_spf_domain · auth_results_spf_result · auth_results_dkim_domain · auth_results_dkim_result
policy_evaluated_spf · policy_evaluated_dkim · policy_evaluated_dmarc · adkim · aspf · p · pct · dmarc_count
policy_spf_pass · policy_spf_notpass · policy_dkim_pass · policy_dkim_notpass · policy_dmarc_pass · policy_dmarc_notpass
```

### `postmaster_report`  (Authentication — Gmail reputation)
```
activity_date · domain · tl_domain · domain_reputation
ip_reputations_bad_num · ip_reputations_low_num · ip_reputations_medium_num · ip_reputations_high_num
spf_success_ratio · dkim_success_ratio · dmarc_success_ratio · inbound_encryption_ratio
```

### `case_milestone`  (Support History — SLA timeline)
```
case_id · created_by_id · is_completed · is_deleted · is_violated · last_modified_by_id · milestone_type
completion_time · assigned_time · resolved_time · created_time · last_modified_time · start_time · system_modstamp_time · target_time
target_response_in_hrs · time_remaining_in_hrs · time_since_target_in_hrs · actual_elapsed_time_in_hrs
elapsed_time_in_hrs · stopped_time_in_hrs · count
```

### `ticket_communications`  (Support History — comms timeline)
```
id · case_id · comm_type · created_by_id · comm_date_time · comm_date_date · last_modified_date_time · last_modified_by_id · count
```
> `detail` is a LookML *set*, not a physical field — do not add it as a column.

### Optional SendGrid tabs (when demoing a SendGrid account)
`dashboard_company_subuser · sendgrid_stats_unique · sendgrid_subdomain · sendgrid_geo_unique ·
sendgrid_device_unique · sendgrid_client_unique · sendgrid_browser_unique · sendgrid_spf · sendgrid_dkim`
(use `last_updated`, never the legacy misspelling `last_udpated`.)

**No tabs for:** workspace, ai, user_guide, dns/PTR results, bounce reasons, unsubscribe, SES. Those
are app-generated, live-DNS, or unavailable.

---

## 2. LookML rate semantics (preserve exactly — do not re-denominate)

```
platform_email_aggregation
  delivered_percent      = total_delivered / total_sent
  bounce_rate            = total_bounces  / total_delivered
  soft_bounce_rate_new   = total_soft_bounces / total_sent
  dropped_rate           = total_dropped  / total_delivered
  spam_rate              = total_spam     / total_delivered
  unique_open_rate       = total_unique_opens  / total_delivered
  unique_click_rate      = total_unique_clicks / total_delivered

sparkpost_domain_metrics / sparkpost_sending_ip_metrics
  delivered_percent  = delivered / sent
  bounce_rate        = bounces   / sent
  deferred_rate      = deferred  / delivered
  block_rate         = blocks    / sent
  dropped_rate       = drops     / delivered
  spam_rate          = spam_reports / delivered
  opens_unique_rate  = opens_unique  / delivered
  clicks_unique_rate = clicks_unique / delivered

dmarc_header_report fallback rates
  spf_pass_rate   = spf_pass   / (spf_pass + spf_notpass)
  dkim_pass_rate  = dkim_pass  / (dkim_pass + dkim_notpass)
  dmarc_pass_rate = dmarc_pass / (dmarc_pass + dmarc_notpass)
```
Calculate a rate only when its measure is absent from the result. Never average rate rows.

---

## 3. Phased build (each phase ends with `npm run lint && npm run build`)

### Phase 1 — Data contracts & adapters
- `src/models/looker/`: one interface per view (`PlatformEmailAggregationRow`, `SparkpostDomainMetricsRow`,
  `CompaniesAllViewRow`, `DmarcHeaderReportRow`, `DmarcAggregatedReportRow`, `PostmasterReportRow`,
  `CaseMilestoneRow`, `TicketCommunicationsRow`, + SendGrid). All fields `string|null` / `number|null`, native names.
- `src/adapters/googleSheets/`: `googleSheetsClient.ts` (local CSV loader — reads `fixtures/looker/<view>.csv`)
  + one adapter per view. Each: load tab CSV → parse safely → validate required columns → cast numbers,
  blanks→null, yes/no & true/false explicit → return typed rows → surface errors without zero-filling.
  Interface stays source-agnostic so a live Sheets/Looker client can replace the loader later.
- `src/services/lookerRates.ts`: pure rate calculators encoding §2 formulas.
- Keep `data.ts` TICKETS untouched. **Do not** refactor ticket metric strings yet — Looker rows are the numeric source going forward; ticket fixtures remain for subject/desc/status/RCA only.

### Phase 2 — Workflow state machine
- `src/state/investigation*`: reducer + actions; states locked/ready/current/complete/issue_found/stale.
- `useInvestigationProgress` hook; review acknowledgements; per-`case_id` localStorage persistence.
- `SectionReviewFooter` ("Mark X reviewed" + acknowledge-unavailable). Gate the section tabs in `Layout.tsx`.

### Phase 3 — View extraction (no behavior change)
- Create `src/views/investigation/{Overview,Authentication,Deliverability,EmailPerformance,SupportHistory,Workspace}View.tsx`,
  moving the existing conditional blocks out of `Investigation.tsx` one at a time. Wire each to its Looker view model.
  Reuse the already-built Support History timeline. `Investigation.tsx` becomes orchestration only.

### Phase 4 — Provider routing
- `accountResolver` (companies_all_view) → `providerRouter` keyed on `email_service_provider`.
- SparkPost adapters live; SendGrid adapters optional; **SES = transparent unavailable state** (no LookML).

### Phase 5 — Shared AI layer (retires the pill↔panel mirroring burden)
- `AiWorkspaceProvider` owning conversation/messages/input/format/streaming/selectedPanels/screenContext/
  starterPrompts/articles/model. Pill + panel become thin views. Context picker registers **structured**
  panel content (no DOM scraping); same-account scope only. Answer formats Standard/Shorter/Expand/Data+.

### Phase 6 — Workspace
- Sequential cards (customerIssue → … → finalResponse) with Accept/Edit/Exclude, dependency invalidation,
  final-response from approved content only, 0–3 User Guide articles (paths from local matcher), manual AI-down fallback.

---

## 4. Standing rules (enforced every phase)
No `any` in new code · native Looker names in contracts · source logic stays in adapters/services ·
never fabricate to fill a panel — use unavailable states · keep every historical ticket · GitHub GET-only ·
no second UI framework (MD3 via Tailwind + tokens + `Md3*` primitives) · report changed files + gaps + assumptions.
