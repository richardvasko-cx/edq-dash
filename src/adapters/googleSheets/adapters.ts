// Per-Looker-view adapters: load a view's CSV, validate required columns, coerce each cell to its
// typed model (string|null / number|null / boolean|null), and return typed rows.
//
// Each adapter returns an AdapterResult so callers can distinguish loaded / empty / unavailable
// without ever zero-filling missing data (brief §16, §32).

import { bool, num, str, validateColumns, type RawRow } from './csv';
import { localCsvClient, type ViewClient } from './googleSheetsClient';
import type {
  CaseMilestoneRow,
  CompaniesAllViewRow,
  DmarcAggregatedReportRow,
  DmarcHeaderReportRow,
  LookerViewName,
  PlatformEmailAggregationRow,
  PostmasterReportRow,
  SparkpostDomainMetricsRow,
  SparkpostSendingIpMetricsRow,
  SupportCaseCommentRow,
  SupportCaseEmailMessageRow,
  SupportCaseRow,
  TicketCommunicationsRow,
} from '../../models/looker';

export type AdapterStatus = 'available' | 'empty' | 'unavailable';

export interface AdapterResult<T> {
  view: LookerViewName;
  status: AdapterStatus;
  rows: T[];
  retrievedAt: string;
  error?: string;
}

/** Shared load+map skeleton: handles errors, empties, and column validation uniformly. */
async function loadAndMap<T>(
  view: LookerViewName,
  required: readonly string[],
  map: (row: RawRow) => T,
  client: ViewClient,
): Promise<AdapterResult<T>> {
  const retrievedAt = new Date().toISOString();
  try {
    const { headers, rows } = await client.loadView(view);
    validateColumns(headers, required, view);
    return {
      view,
      status: rows.length === 0 ? 'empty' : 'available',
      rows: rows.map(map),
      retrievedAt,
    };
  } catch (err) {
    return {
      view,
      status: 'unavailable',
      rows: [],
      retrievedAt,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── companies_all_view ──────────────────────────────────────────────────────
const COMPANIES_REQUIRED = ['c_id', 'company_name', 'cluster', 'email_service_provider'] as const;

export function loadCompaniesAllView(client: ViewClient = localCsvClient) {
  return loadAndMap<CompaniesAllViewRow>('companies_all_view', COMPANIES_REQUIRED, r => ({
    c_id: str(r.c_id),
    company_name: str(r.company_name),
    cluster: str(r.cluster),
    account_status_name: str(r.account_status_name),
    email_service_provider: str(r.email_service_provider),
    region: str(r.region),
    platform_edition: str(r.platform_edition),
    contract_end_date: str(r.contract_end_date),
    macro_classification: str(r.macro_classification),
    industry_rollup: str(r.industry_rollup),
    current_carr: str(r.current_carr),
  }), client);
}

// ── platform_email_aggregation ──────────────────────────────────────────────
const PEA_REQUIRED = ['event_date', 'total_sent', 'total_delivered'] as const;

export function loadPlatformEmailAggregation(client: ViewClient = localCsvClient) {
  return loadAndMap<PlatformEmailAggregationRow>('platform_email_aggregation', PEA_REQUIRED, r => ({
    company_name: str(r.company_name),
    esp: str(r.esp),
    event_date: str(r.event_date),
    from_domain: str(r.from_domain),
    ip_pool: str(r.ip_pool),
    receiver_domain: str(r.receiver_domain),
    total_sent: num(r.total_sent),
    total_delivered: num(r.total_delivered),
    total_bounces: num(r.total_bounces),
    total_soft_bounces: num(r.total_soft_bounces),
    total_dropped: num(r.total_dropped),
    total_spam: num(r.total_spam),
    total_unique_opens: num(r.total_unique_opens),
    total_unique_clicks: num(r.total_unique_clicks),
    delivered_percent: num(r.delivered_percent),
    bounce_rate: num(r.bounce_rate),
    soft_bounce_rate_new: num(r.soft_bounce_rate_new),
    dropped_rate: num(r.dropped_rate),
    spam_rate: num(r.spam_rate),
    unique_open_rate: num(r.unique_open_rate),
    unique_click_rate: num(r.unique_click_rate),
  }), client);
}

// ── SparkPost shared mapping ─────────────────────────────────────────────────
function mapSparkpostBase(r: RawRow) {
  return {
    subaccount: str(r.subaccount),
    activity_date: str(r.activity_date),
    sent: num(r.sent),
    delivered: num(r.delivered),
    bounces: num(r.bounces),
    deferred: num(r.deferred),
    spam_reports: num(r.spam_reports),
    blocks: num(r.blocks),
    drops: num(r.drops),
    delivered_percent: num(r.delivered_percent),
    bounce_rate: num(r.bounce_rate),
    block_rate: num(r.block_rate),
    dropped_rate: num(r.dropped_rate),
    deferred_rate: num(r.deferred_rate),
    spam_rate: num(r.spam_rate),
    count_targeted: num(r.count_targeted),
    count_accepted: num(r.count_accepted),
  };
}

const SPARKPOST_DOMAIN_REQUIRED = ['domain', 'activity_date', 'sent', 'delivered'] as const;

export function loadSparkpostDomainMetrics(client: ViewClient = localCsvClient) {
  return loadAndMap<SparkpostDomainMetricsRow>('sparkpost_domain_metrics', SPARKPOST_DOMAIN_REQUIRED, r => ({
    domain: str(r.domain),
    ...mapSparkpostBase(r),
    opens_total: num(r.opens_total),
    opens_unique: num(r.opens_unique),
    clicks_total: num(r.clicks_total),
    clicks_unique: num(r.clicks_unique),
    opens_unique_rate: num(r.opens_unique_rate),
    clicks_unique_rate: num(r.clicks_unique_rate),
    count_unsubscribe: num(r.count_unsubscribe),
    unsubscribe_rate: num(r.unsubscribe_rate),
    count_clicked: num(r.count_clicked),
  }), client);
}

const SPARKPOST_IP_REQUIRED = ['sending_ip', 'activity_date', 'sent', 'delivered'] as const;

export function loadSparkpostSendingIpMetrics(client: ViewClient = localCsvClient) {
  return loadAndMap<SparkpostSendingIpMetricsRow>('sparkpost_sending_ip_metrics', SPARKPOST_IP_REQUIRED, r => ({
    sending_ip: str(r.sending_ip),
    ...mapSparkpostBase(r),
  }), client);
}

// ── dmarc_header_report ──────────────────────────────────────────────────────
const DMARC_HEADER_REQUIRED = ['from_domain', 'spf_result', 'dkim_result', 'dmarc_result'] as const;

export function loadDmarcHeaderReport(client: ViewClient = localCsvClient) {
  return loadAndMap<DmarcHeaderReportRow>('dmarc_header_report', DMARC_HEADER_REQUIRED, r => ({
    from_domain: str(r.from_domain),
    spf_result: str(r.spf_result),
    dkim_result: str(r.dkim_result),
    dmarc_result: str(r.dmarc_result),
    received_time: str(r.received_time),
    count: num(r.count),
    spf_pass: num(r.spf_pass),
    spf_notpass: num(r.spf_notpass),
    dkim_pass: num(r.dkim_pass),
    dkim_notpass: num(r.dkim_notpass),
    dmarc_pass: num(r.dmarc_pass),
    dmarc_notpass: num(r.dmarc_notpass),
  }), client);
}

// ── dmarc_aggregated_report ──────────────────────────────────────────────────
const DMARC_AGG_REQUIRED = ['policy_domain', 'source_ip'] as const;

export function loadDmarcAggregatedReport(client: ViewClient = localCsvClient) {
  return loadAndMap<DmarcAggregatedReportRow>('dmarc_aggregated_report', DMARC_AGG_REQUIRED, r => ({
    report_date: str(r.report_date),
    date_range_begin_date: str(r.date_range_begin_date),
    date_range_end_date: str(r.date_range_end_date),
    policy_domain: str(r.policy_domain),
    identifiers_header_from: str(r.identifiers_header_from),
    source_ip: str(r.source_ip),
    auth_results_spf_domain: str(r.auth_results_spf_domain),
    auth_results_spf_result: str(r.auth_results_spf_result),
    auth_results_dkim_domain: str(r.auth_results_dkim_domain),
    auth_results_dkim_result: str(r.auth_results_dkim_result),
    policy_evaluated_spf: str(r.policy_evaluated_spf),
    policy_evaluated_dkim: str(r.policy_evaluated_dkim),
    policy_evaluated_dmarc: str(r.policy_evaluated_dmarc),
    adkim: str(r.adkim),
    aspf: str(r.aspf),
    p: str(r.p),
    pct: num(r.pct),
    dmarc_count: num(r.dmarc_count),
    policy_spf_pass: num(r.policy_spf_pass),
    policy_spf_notpass: num(r.policy_spf_notpass),
    policy_dkim_pass: num(r.policy_dkim_pass),
    policy_dkim_notpass: num(r.policy_dkim_notpass),
    policy_dmarc_pass: num(r.policy_dmarc_pass),
    policy_dmarc_notpass: num(r.policy_dmarc_notpass),
  }), client);
}

// ── postmaster_report ────────────────────────────────────────────────────────
const POSTMASTER_REQUIRED = ['activity_date', 'domain'] as const;

export function loadPostmasterReport(client: ViewClient = localCsvClient) {
  return loadAndMap<PostmasterReportRow>('postmaster_report', POSTMASTER_REQUIRED, r => ({
    activity_date: str(r.activity_date),
    domain: str(r.domain),
    domain_reputation: str(r.domain_reputation),
    spf_success_ratio: num(r.spf_success_ratio),
    dkim_success_ratio: num(r.dkim_success_ratio),
    dmarc_success_ratio: num(r.dmarc_success_ratio),
    ip_reputations_bad_num: num(r.ip_reputations_bad_num),
    ip_reputations_low_num: num(r.ip_reputations_low_num),
    ip_reputations_medium_num: num(r.ip_reputations_medium_num),
    ip_reputations_high_num: num(r.ip_reputations_high_num),
  }), client);
}

// ── case_milestone ───────────────────────────────────────────────────────────
const CASE_MILESTONE_REQUIRED = ['case_id', 'milestone_type'] as const;

export function loadCaseMilestone(client: ViewClient = localCsvClient) {
  return loadAndMap<CaseMilestoneRow>('case_milestone', CASE_MILESTONE_REQUIRED, r => ({
    case_id: str(r.case_id),
    milestone_type: str(r.milestone_type),
    is_completed: bool(r.is_completed),
    is_violated: bool(r.is_violated),
    assigned_time: str(r.assigned_time),
    resolved_time: str(r.resolved_time),
    target_time: str(r.target_time),
    time_since_target_in_hrs: num(r.time_since_target_in_hrs),
    count: num(r.count),
  }), client);
}

// ── ticket_communications ────────────────────────────────────────────────────
const TICKET_COMMS_REQUIRED = ['id', 'case_id', 'comm_type'] as const;

export function loadTicketCommunications(client: ViewClient = localCsvClient) {
  return loadAndMap<TicketCommunicationsRow>('ticket_communications', TICKET_COMMS_REQUIRED, r => ({
    id: str(r.id),
    case_id: str(r.case_id),
    comm_type: str(r.comm_type),
    created_by_id: str(r.created_by_id),
    comm_date_time: str(r.comm_date_time),
    last_modified_date_time: str(r.last_modified_date_time),
  }), client);
}

// ── support_cases ────────────────────────────────────────────────────────────
const SUPPORT_CASES_REQUIRED = ['id', 'case_number', 'account_name', 'subject'] as const;

export function loadSupportCases(client: ViewClient = localCsvClient) {
  return loadAndMap<SupportCaseRow>('support_cases', SUPPORT_CASES_REQUIRED, r => ({
    id: str(r.id),
    case_number: str(r.case_number),
    contact_account_id: str(r.contact_account_id),
    account_name: str(r.account_name),
    contact_name: str(r.contact_name),
    owner_name: str(r.owner_name),
    subject: str(r.subject),
    description: str(r.description),
    status: str(r.status),
    priority: str(r.priority),
    support_category: str(r.support_category),
    escalation_path: str(r.escalation_path),
    created_time: str(r.created_time),
    resolved_time: str(r.resolved_time),
    closed_time: str(r.closed_time),
    issue_resolution: str(r.issue_resolution),
    tags: str(r.tags),
  }), client);
}

// ── support_cases_email_message ──────────────────────────────────────────────
const EMAIL_MSG_REQUIRED = ['id', 'case_id', 'from_address', 'to_address'] as const;

export function loadSupportCaseEmailMessages(client: ViewClient = localCsvClient) {
  return loadAndMap<SupportCaseEmailMessageRow>('support_cases_email_message', EMAIL_MSG_REQUIRED, r => ({
    id: str(r.id),
    case_id: str(r.case_id),
    sent_time: str(r.sent_time),
    created_time: str(r.created_time),
    from_address: str(r.from_address),
    to_address: str(r.to_address),
    subject: str(r.subject),
    text_body_cleaned: str(r.text_body_cleaned),
    text_body: str(r.text_body),
    has_attachment: bool(r.has_attachment),
    created_by_id: str(r.created_by_id),
  }), client);
}

// ── support_cases_case_comment ───────────────────────────────────────────────
const CASE_COMMENT_REQUIRED = ['id', 'case_id', 'comment_body'] as const;

export function loadSupportCaseComments(client: ViewClient = localCsvClient) {
  return loadAndMap<SupportCaseCommentRow>('support_cases_case_comment', CASE_COMMENT_REQUIRED, r => ({
    id: str(r.id),
    case_id: str(r.case_id),
    created_time: str(r.created_time),
    last_modified_time: str(r.last_modified_time),
    created_by_id: str(r.created_by_id),
    last_modified_by_id: str(r.last_modified_by_id),
    created_by_name: str(r.created_by_name),
    created_by_role: str(r.created_by_role),
    created_by_team: str(r.created_by_team),
    comment_body: str(r.comment_body),
    is_published: bool(r.is_published),
  }), client);
}
