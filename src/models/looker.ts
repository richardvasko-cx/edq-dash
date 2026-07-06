export type LookerViewName =
  | 'companies_all_view'
  | 'platform_email_aggregation'
  | 'sparkpost_domain_metrics'
  | 'sparkpost_sending_ip_metrics'
  | 'dmarc_header_report'
  | 'dmarc_aggregated_report'
  | 'postmaster_report'
  | 'case_milestone'
  | 'ticket_communications'
  | 'support_cases'
  | 'support_cases_email_message'
  | 'support_cases_case_comment';

export interface CompaniesAllViewRow {
  c_id: string | null;
  company_name: string | null;
  cluster: string | null;
  account_status_name: string | null;
  email_service_provider: string | null;
  region: string | null;
  platform_edition: string | null;
  contract_end_date: string | null;
  macro_classification: string | null;
  industry_rollup: string | null;
  current_carr: string | null;
}

export interface PlatformEmailAggregationRow {
  company_name: string | null;
  esp: string | null;
  event_date: string | null;
  from_domain: string | null;
  ip_pool: string | null;
  receiver_domain: string | null;
  total_sent: number | null;
  total_delivered: number | null;
  total_bounces: number | null;
  total_soft_bounces: number | null;
  total_dropped: number | null;
  total_spam: number | null;
  total_unique_opens: number | null;
  total_unique_clicks: number | null;
  delivered_percent: number | null;
  bounce_rate: number | null;
  soft_bounce_rate_new: number | null;
  dropped_rate: number | null;
  spam_rate: number | null;
  unique_open_rate: number | null;
  unique_click_rate: number | null;
}

export interface SparkpostDomainMetricsRow {
  domain: string | null;
  subaccount: string | null;
  activity_date: string | null;
  sent: number | null;
  delivered: number | null;
  bounces: number | null;
  deferred: number | null;
  spam_reports: number | null;
  blocks: number | null;
  drops: number | null;
  delivered_percent: number | null;
  bounce_rate: number | null;
  block_rate: number | null;
  dropped_rate: number | null;
  deferred_rate: number | null;
  spam_rate: number | null;
  opens_total: number | null;
  opens_unique: number | null;
  clicks_total: number | null;
  clicks_unique: number | null;
  opens_unique_rate: number | null;
  clicks_unique_rate: number | null;
  count_targeted?: number | null;
  count_accepted?: number | null;
  count_unsubscribe?: number | null;
  unsubscribe_rate?: number | null;
  count_clicked?: number | null;
}

export interface SparkpostSendingIpMetricsRow {
  sending_ip: string | null;
  subaccount: string | null;
  activity_date: string | null;
  sent: number | null;
  delivered: number | null;
  bounces: number | null;
  deferred: number | null;
  spam_reports: number | null;
  blocks: number | null;
  drops: number | null;
  delivered_percent: number | null;
  bounce_rate: number | null;
  block_rate: number | null;
  dropped_rate: number | null;
  deferred_rate: number | null;
  spam_rate: number | null;
  count_targeted?: number | null;
  count_accepted?: number | null;
}

export interface DmarcHeaderReportRow {
  from_domain: string | null;
  spf_result: string | null;
  dkim_result: string | null;
  dmarc_result: string | null;
  received_time: string | null;
  count: number | null;
  spf_pass: number | null;
  spf_notpass: number | null;
  dkim_pass: number | null;
  dkim_notpass: number | null;
  dmarc_pass: number | null;
  dmarc_notpass: number | null;
}

export interface DmarcAggregatedReportRow {
  report_date: string | null;
  date_range_begin_date: string | null;
  date_range_end_date: string | null;
  policy_domain: string | null;
  identifiers_header_from: string | null;
  source_ip: string | null;
  auth_results_spf_domain: string | null;
  auth_results_spf_result: string | null;
  auth_results_dkim_domain: string | null;
  auth_results_dkim_result: string | null;
  policy_evaluated_spf: string | null;
  policy_evaluated_dkim: string | null;
  policy_evaluated_dmarc: string | null;
  adkim: string | null;
  aspf: string | null;
  p: string | null;
  pct: number | null;
  dmarc_count: number | null;
  policy_spf_pass: number | null;
  policy_spf_notpass: number | null;
  policy_dkim_pass: number | null;
  policy_dkim_notpass: number | null;
  policy_dmarc_pass: number | null;
  policy_dmarc_notpass: number | null;
}

export interface PostmasterReportRow {
  activity_date: string | null;
  domain: string | null;
  domain_reputation: string | null;
  spf_success_ratio: number | null;
  dkim_success_ratio: number | null;
  dmarc_success_ratio: number | null;
  ip_reputations_bad_num: number | null;
  ip_reputations_low_num: number | null;
  ip_reputations_medium_num: number | null;
  ip_reputations_high_num: number | null;
}

export interface CaseMilestoneRow {
  case_id: string | null;
  milestone_type: string | null;
  is_completed: boolean | null;
  is_violated: boolean | null;
  assigned_time: string | null;
  resolved_time: string | null;
  target_time: string | null;
  time_since_target_in_hrs: number | null;
  count: number | null;
}

export interface TicketCommunicationsRow {
  id: string | null;
  case_id: string | null;
  comm_type: string | null;
  created_by_id: string | null;
  comm_date_time: string | null;
  last_modified_date_time: string | null;
}

export interface SupportCaseRow {
  id: string | null;
  case_number: string | null;
  contact_account_id: string | null;
  account_name: string | null;
  contact_name: string | null;
  owner_name: string | null;
  subject: string | null;
  description: string | null;
  status: string | null;
  priority: string | null;
  support_category: string | null;
  escalation_path: string | null;
  created_time: string | null;
  resolved_time: string | null;
  closed_time: string | null;
  issue_resolution: string | null;
  tags: string | null;
}

export interface SupportCaseEmailMessageRow {
  id: string | null;
  case_id: string | null;
  sent_time: string | null;
  created_time: string | null;
  from_address: string | null;
  to_address: string | null;
  subject: string | null;
  text_body_cleaned: string | null;
  text_body: string | null;
  has_attachment: boolean | null;
  created_by_id: string | null;
}

export interface SupportCaseCommentRow {
  id: string | null;
  case_id: string | null;
  created_time: string | null;
  last_modified_time: string | null;
  created_by_id: string | null;
  last_modified_by_id: string | null;
  created_by_name: string | null;
  created_by_role: string | null;
  created_by_team: string | null;
  comment_body: string | null;
  is_published: boolean | null;
}

export type EmailDirection = 'inbound' | 'outbound' | 'unknown';

export interface CaseThreadEntry {
  id: string;
  case_id: string;
  communication_type: 'Email' | 'Case Comment';
  communication_at: string | null;
  created_by_id: string | null;
  direction?: EmailDirection;
  from_address?: string | null;
  to_address?: string | null;
  subject?: string | null;
  text_body_cleaned?: string | null;
  text_body?: string | null;
  has_attachment?: boolean | null;
  created_by_name?: string | null;
  created_by_role?: string | null;
  created_by_team?: string | null;
  comment_body?: string | null;
  is_published?: boolean | null;
}
