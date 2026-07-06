"""
V4 data simplification.
Trims CSV fixtures to V4 field lists, computes missing rates, rebuilds the xlsx.
"""

import csv
import io
import os
import openpyxl
from pathlib import Path

FIXTURES = Path(__file__).parent.parent / "public/fixtures/looker"

# ── helpers ──────────────────────────────────────────────────────────────────

def pct(a, b, dp=4):
    try:
        v = float(a) / float(b)
        return round(v, dp) if v == v else ""
    except (TypeError, ValueError, ZeroDivisionError):
        return ""


def read_csv(name):
    path = FIXTURES / name
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write_csv(name, fieldnames, rows):
    path = FIXTURES / name
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"  wrote {name} ({len(rows)} rows, {len(fieldnames)} cols)")


# ── companies_all_view ───────────────────────────────────────────────────────

COMPANIES_KEEP = [
    "c_id", "company_name", "cluster", "account_status_name",
    "email_service_provider", "region", "platform_edition",
    "contract_end_date", "macro_classification", "industry_rollup", "current_carr",
]

# ── platform_email_aggregation ───────────────────────────────────────────────

PLATFORM_KEEP = [
    "company_name", "esp", "event_date", "from_domain", "receiver_domain", "ip_pool",
    "total_sent", "total_delivered", "total_bounces", "total_soft_bounces",
    "total_dropped", "total_spam", "total_unique_opens", "total_unique_clicks",
    "delivered_percent", "bounce_rate", "soft_bounce_rate_new", "dropped_rate",
    "spam_rate", "unique_open_rate", "unique_click_rate",
]


def enrich_platform(row):
    s = row.get("total_sent", "")
    d = row.get("total_delivered", "")
    b = row.get("total_bounces", "")
    sb = row.get("total_soft_bounces", "")
    dr = row.get("total_dropped", "")
    sp = row.get("total_spam", "")
    uo = row.get("total_unique_opens", "")
    uc = row.get("total_unique_clicks", "")
    row["delivered_percent"]    = pct(d, s)
    row["bounce_rate"]          = pct(b, d)
    row["soft_bounce_rate_new"] = pct(sb, s)
    row["dropped_rate"]         = pct(dr, s)
    row["spam_rate"]            = pct(sp, d)
    row["unique_open_rate"]     = pct(uo, d)
    row["unique_click_rate"]    = pct(uc, d)
    return row


# ── sparkpost_domain_metrics ─────────────────────────────────────────────────

SP_DOMAIN_KEEP = [
    "domain", "subaccount", "activity_date",
    "sent", "delivered", "bounces", "deferred", "blocks", "drops", "spam_reports",
    "opens_total", "opens_unique", "clicks_total", "clicks_unique",
    "delivered_percent", "opens_unique_rate", "clicks_unique_rate",
    "bounce_rate", "spam_rate", "block_rate", "dropped_rate", "deferred_rate",
]


def enrich_sp_domain(row):
    s  = row.get("sent", "")
    d  = row.get("delivered", "")
    b  = row.get("bounces", "")
    de = row.get("deferred", "")
    bl = row.get("blocks", "")
    dr = row.get("drops", "")
    sp = row.get("spam_reports", "")
    ou = row.get("opens_unique", "")
    cu = row.get("clicks_unique", "")
    row["delivered_percent"]  = pct(d, s)
    row["bounce_rate"]        = pct(b, s)
    row["deferred_rate"]      = pct(de, s)
    row["block_rate"]         = pct(bl, s)
    row["dropped_rate"]       = pct(dr, d)
    row["spam_rate"]          = pct(sp, d)
    row["opens_unique_rate"]  = pct(ou, d)
    row["clicks_unique_rate"] = pct(cu, d)
    return row


# ── sparkpost_sending_ip_metrics ─────────────────────────────────────────────

SP_IP_KEEP = [
    "sending_ip", "subaccount", "activity_date",
    "sent", "delivered", "bounces", "deferred", "blocks", "spam_reports",
]

# ── support_cases ─────────────────────────────────────────────────────────────

CASES_KEEP = [
    "id", "case_number", "contact_account_id", "account_name",
    "contact_name", "owner_name",
    "subject", "description", "status", "priority",
    "support_category", "escalation_path",
    "created_time", "resolved_time", "closed_time",
    "issue_resolution", "tags",
]

# ── case_milestone ────────────────────────────────────────────────────────────

MILESTONE_KEEP = [
    "case_id", "milestone_type", "is_completed", "is_violated",
    "assigned_time", "resolved_time", "target_time",
    "time_since_target_in_hrs", "count",
]

# ── ticket_communications ─────────────────────────────────────────────────────

COMMS_KEEP = [
    "id", "case_id", "comm_type", "created_by_id",
    "comm_date_time", "last_modified_date_time",
]

# ── support_cases_email_message (keep all) ────────────────────────────────────

EMAIL_KEEP = [
    "id", "case_id", "sent_time", "created_time",
    "from_address", "to_address", "subject",
    "text_body_cleaned", "text_body", "has_attachment", "created_by_id",
]

# ── support_cases_case_comment (keep all) ─────────────────────────────────────

COMMENT_KEEP = [
    "id", "case_id", "created_time", "last_modified_time",
    "created_by_id", "last_modified_by_id",
    "created_by_name", "created_by_role", "created_by_team",
    "comment_body", "is_published",
]

# ── dmarc_header_report ───────────────────────────────────────────────────────

DMARC_HDR_KEEP = [
    "from_domain", "spf_result", "dkim_result", "dmarc_result",
    "received_time", "count",
    "spf_pass", "spf_notpass", "dkim_pass", "dkim_notpass",
    "dmarc_pass", "dmarc_notpass",
]

# ── dmarc_aggregated_report (unchanged — not in V4 required but keep small) ───

DMARC_AGG_KEEP = None  # None = keep all

# ── postmaster_report ─────────────────────────────────────────────────────────

POSTMASTER_KEEP = [
    "activity_date", "domain", "domain_reputation",
    "spf_success_ratio", "dkim_success_ratio", "dmarc_success_ratio",
    "ip_reputations_bad_num", "ip_reputations_low_num",
    "ip_reputations_medium_num", "ip_reputations_high_num",
]

# ── main ──────────────────────────────────────────────────────────────────────

TRANSFORMS = [
    ("companies_all_view.csv",           COMPANIES_KEEP,   None),
    ("platform_email_aggregation.csv",   PLATFORM_KEEP,    enrich_platform),
    ("sparkpost_domain_metrics.csv",     SP_DOMAIN_KEEP,   enrich_sp_domain),
    ("sparkpost_sending_ip_metrics.csv", SP_IP_KEEP,       None),
    ("support_cases.csv",                CASES_KEEP,       None),
    ("case_milestone.csv",               MILESTONE_KEEP,   None),
    ("ticket_communications.csv",        COMMS_KEEP,       None),
    ("support_cases_email_message.csv",  EMAIL_KEEP,       None),
    ("support_cases_case_comment.csv",   COMMENT_KEEP,     None),
    ("dmarc_header_report.csv",          DMARC_HDR_KEEP,   None),
    ("postmaster_report.csv",            POSTMASTER_KEEP,  None),
]

print("── trimming CSVs ──")
all_data = {}
for filename, keep, enrich_fn in TRANSFORMS:
    rows = read_csv(filename)
    if enrich_fn:
        rows = [enrich_fn(r) for r in rows]
    write_csv(filename, keep, rows)
    all_data[filename.replace(".csv", "")] = (keep, rows)

# ── rebuild xlsx ─────────────────────────────────────────────────────────────

print("\n── rebuilding xlsx ──")
xlsx_path = FIXTURES / "EDQ_demo_data.xlsx"
wb = openpyxl.Workbook()
wb.remove(wb.active)  # remove default empty sheet

for tab_name, (fieldnames, rows) in all_data.items():
    ws = wb.create_sheet(title=tab_name)
    ws.append(fieldnames)
    for row in rows:
        ws.append([row.get(f, "") for f in fieldnames])

wb.save(xlsx_path)
print(f"  wrote EDQ_demo_data.xlsx ({len(all_data)} sheets)")
print("\nDone.")
