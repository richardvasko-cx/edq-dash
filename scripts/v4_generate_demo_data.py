"""
Generate complete demo data for all 18 support tickets.
Each ticket gets scenario-matched metrics that visually tell the right story.
Overwrites all CSV fixtures and rebuilds the xlsx.
"""

import csv
import math
import openpyxl
from pathlib import Path
from datetime import date, timedelta, datetime

FIXTURES = Path(__file__).parent.parent / "public/fixtures/looker"

# ── helpers ──────────────────────────────────────────────────────────────────

def r4(v): return round(v, 4)

def derived(sent, delivered, bounces, deferred, blocks, drops, spam, opens_u, clicks_u):
    """Compute all derived rates from raw counts."""
    dp  = r4(delivered / sent)     if sent  else ""
    br  = r4(bounces   / sent)     if sent  else ""
    dr_ = r4(deferred  / sent)     if sent  else ""
    blk = r4(blocks    / sent)     if sent  else ""
    drp = r4(drops     / delivered) if delivered else ""
    spr = r4(spam      / delivered) if delivered else ""
    our = r4(opens_u   / delivered) if delivered else ""
    cur = r4(clicks_u  / delivered) if delivered else ""
    return dp, br, dr_, blk, drp, spr, our, cur

def write_csv(name, fieldnames, rows):
    path = FIXTURES / name
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"  {name}: {len(rows)} rows")

def dt(d, hour=7):
    return f"{d.isoformat()}T{hour:02d}:00:00Z"

def prev_days(d, n=3):
    return [d - timedelta(days=i) for i in range(n-1, -1, -1)]

# ── Account config ────────────────────────────────────────────────────────────

# company -> (c_id, Braze sending infrastructure provider, domain, sending_ip, subaccount_label)
# Braze accounts route through SparkPost, SendGrid, or Amazon SES. Only SparkPost
# has provider-specific demo source views in this generator; the other providers
# still appear in platform-level data and should not be rewritten to SparkPost.
ACCOUNTS = {
    "Tesco":       ("ACC-TESC-001", "sparkpost", "mail.tesco.com",          "185.12.40.11", "brazeTesco"),
    "Morrisons":   ("ACC-MORR-002", "sparkpost", "email.morrisons.com",     "185.12.40.22", "brazeMorrisons"),
    "Waitrose":    ("ACC-WAIT-003", "sparkpost", "mail.waitrose.com",        "185.12.40.33", "brazeWaitrose"),
    "Sainsbury's": ("ACC-SAIN-004", "ses",       "mail.sainsburys.co.uk",   "54.240.0.44",  "brazeSainsburys"),
    "Asda":        ("ACC-ASDA-005", "sendgrid",  None,                       None,           "brazeAsda"),
    "Co-op":       ("ACC-COOP-006", "sparkpost", "mail.coop.co.uk",         "185.12.40.55", "brazeCoop"),
    "Aldi":        ("ACC-ALDI-007", "sendgrid",  None,                       None,           "brazeAldi"),
    "Lidl":        ("ACC-LIDL-008", "ses",       "mail.lidl.co.uk",         "54.240.0.88",  "brazeLidlGB"),
    "M&S":         ("ACC-MS-009",   "sparkpost", "mail.marksandspencer.com","185.12.40.99", "brazeMSFood"),
    "Boots":       ("ACC-BOOT-010", "sendgrid",  None,                       None,           "brazeBoots"),
    "Greggs":      ("ACC-GREG-011", "ses",       "mail.greggs.co.uk",       "54.240.0.66",  "brazeGreggs"),
    "Iceland":     ("ACC-ICEL-012", "sparkpost", "mail.iceland.co.uk",      "185.12.40.77", "brazeIcelandFoods"),
}

# Base sending volume per company (daily)
BASE_VOL = {
    "Tesco": 930000, "Morrisons": 620000, "Waitrose": 420000,
    "Sainsbury's": 760000, "Asda": 650000, "Co-op": 285000,
    "Aldi": 315000, "Lidl": 255000, "M&S": 425000,
    "Boots": 525000, "Greggs": 185000, "Iceland": 325000,
}

# ── Ticket definitions ────────────────────────────────────────────────────────
# (id, company, issue, ticket_date, status, receiver_domain)
TICKETS = [
    # Active
    ("TCK-9001", "Tesco",       "gmail_throttle",   date(2026,6,16),  "In Progress", "gmail.com"),
    ("TCK-9002", "Morrisons",   "microsoft_block",  date(2026,6,17),  "Open",        "outlook.com"),
    ("TCK-9003", "Waitrose",    "spf_quarantine",   date(2026,6,18),  "In Progress", "gmail.com"),
    ("TCK-9004", "Sainsbury's", "gmail_throttle",   date(2026,6,18),  "In Progress", "gmail.com"),
    ("TCK-9005", "Asda",        "microsoft_block",  date(2026,6,19),  "Open",        "outlook.com"),
    ("TCK-9006", "Boots",       "dkim_fail",        date(2026,6,19),  "Open",        "gmail.com"),
    ("TCK-9007", "Greggs",      "yahoo_complaint",  date(2026,6,20),  "In Progress", "yahoo.com"),
    ("TCK-9008", "Co-op",       "dkim_fail",        date(2026,6,20),  "Open",        "gmail.com"),
    ("TCK-9009", "Iceland",     "hard_bounce",      date(2026,6,21),  "Open",        "gmail.com"),
    # Historical closed
    ("TCK-8801", "Tesco",       "gmail_throttle",   date(2025,11,24), "Closed",      "gmail.com"),
    ("TCK-8802", "Morrisons",   "microsoft_block",  date(2026,3,11),  "Closed",      "outlook.com"),
    ("TCK-8803", "Waitrose",    "spf_quarantine",   date(2026,1,20),  "Closed",      "gmail.com"),
    ("TCK-8804", "Sainsbury's", "gmail_throttle",   date(2026,2,14),  "Closed",      "gmail.com"),
    ("TCK-8805", "Asda",        "microsoft_block",  date(2026,4,2),   "Closed",      "outlook.com"),
    ("TCK-8806", "Co-op",       "spf_quarantine",   date(2026,5,5),   "Closed",      "gmail.com"),
    ("TCK-8807", "Aldi",        "dkim_fail",        date(2026,5,18),  "Closed",      "outlook.com"),
    ("TCK-8808", "Lidl",        "yahoo_complaint",  date(2026,5,28),  "Closed",      "yahoo.com"),
    ("TCK-8809", "M&S",         "ip_warmup",        date(2026,6,3),   "Closed",      "gmail.com"),
]

# Issue → metric parameters
# (del_pct, bounce_frac, deferred_frac, block_frac, drop_frac, spam_frac, opens_u_rate, clicks_u_rate)
ISSUE_METRICS = {
    "gmail_throttle":   (0.953, 0.010, 0.030, 0.0015, 0.0035, 0.0012, 0.115, 0.024),
    "microsoft_block":  (0.882, 0.089, 0.015, 0.025,  0.0090, 0.0007, 0.220, 0.051),
    "spf_quarantine":   (0.716, 0.031, 0.018, 0.0014, 0.0100, 0.0020, 0.162, 0.032),
    "dkim_fail":        (0.851, 0.048, 0.022, 0.0090, 0.0070, 0.0028, 0.180, 0.038),
    "yahoo_complaint":  (0.944, 0.013, 0.010, 0.0040, 0.0030, 0.0065, 0.214, 0.053),
    "hard_bounce":      (0.810, 0.172, 0.009, 0.0018, 0.0028, 0.0010, 0.231, 0.058),
    "ip_warmup":        (0.873, 0.021, 0.052, 0.0095, 0.0060, 0.0019, 0.148, 0.031),
}

# ── sparkpost_domain_metrics ──────────────────────────────────────────────────

SP_DOM_FIELDS = [
    "domain","subaccount","activity_date",
    "sent","delivered","bounces","deferred","blocks","drops","spam_reports",
    "opens_total","opens_unique","clicks_total","clicks_unique",
    "delivered_percent","opens_unique_rate","clicks_unique_rate",
    "bounce_rate","spam_rate","block_rate","dropped_rate","deferred_rate",
]

def sp_domain_rows():
    rows = []
    for tid, company, issue, tdate, _status, _rdomain in TICKETS:
        _, esp, domain, _, sub = ACCOUNTS[company]
        if esp != "sparkpost": continue
        vol = BASE_VOL[company]
        dp, br, dfr, blk, drp, spr, our, cur = ISSUE_METRICS[issue]
        # 3 days ending on ticket date; volume ramps up day-over-day slightly
        for i, d in enumerate(prev_days(tdate, 3)):
            # Volume: slight increase toward ticket date for most issues
            v = int(vol * (0.93 + 0.035 * i))
            delivered    = int(v * dp)
            bounces      = int(v * br)
            deferred     = int(v * dfr)
            blocks       = int(v * blk)
            drops        = int(delivered * drp) if drp else 0
            spam_reports = int(delivered * spr) if spr else 0
            opens_u      = int(delivered * our)
            clicks_u     = int(delivered * cur)
            opens_total  = int(opens_u * 1.25)
            clicks_total = int(clicks_u * 1.18)
            dp2, br2, dr2, blk2, drp2, spr2, our2, cur2 = derived(
                v, delivered, bounces, deferred, blocks, drops, spam_reports, opens_u, clicks_u)
            rows.append({
                "domain": domain, "subaccount": sub, "activity_date": d.isoformat(),
                "sent": v, "delivered": delivered, "bounces": bounces,
                "deferred": deferred, "blocks": blocks, "drops": drops,
                "spam_reports": spam_reports,
                "opens_total": opens_total, "opens_unique": opens_u,
                "clicks_total": clicks_total, "clicks_unique": clicks_u,
                "delivered_percent": dp2, "opens_unique_rate": our2,
                "clicks_unique_rate": cur2, "bounce_rate": br2,
                "spam_rate": spr2, "block_rate": blk2,
                "dropped_rate": drp2, "deferred_rate": dr2,
            })
    return rows

# ── sparkpost_sending_ip_metrics ──────────────────────────────────────────────

SP_IP_FIELDS = [
    "sending_ip","subaccount","activity_date",
    "sent","delivered","bounces","deferred","blocks","spam_reports",
]

def sp_ip_rows():
    rows = []
    for tid, company, issue, tdate, _status, _rdomain in TICKETS:
        _, esp, _, ip, sub = ACCOUNTS[company]
        if esp != "sparkpost" or ip is None: continue
        vol = BASE_VOL[company]
        dp, br, dfr, blk, _drp, spr, _our, _cur = ISSUE_METRICS[issue]
        # one row per ticket on the ticket date
        v = vol
        rows.append({
            "sending_ip": ip, "subaccount": sub,
            "activity_date": tdate.isoformat(),
            "sent": v, "delivered": int(v * dp),
            "bounces": int(v * br), "deferred": int(v * dfr),
            "blocks": int(v * blk),
            "spam_reports": int(int(v * dp) * spr),
        })
    return rows

# ── platform_email_aggregation ────────────────────────────────────────────────

PEA_FIELDS = [
    "company_name","esp","event_date","from_domain","receiver_domain","ip_pool",
    "total_sent","total_delivered","total_bounces","total_soft_bounces",
    "total_dropped","total_spam","total_unique_opens","total_unique_clicks",
    "delivered_percent","bounce_rate","soft_bounce_rate_new","dropped_rate",
    "spam_rate","unique_open_rate","unique_click_rate",
]

def pea_rows():
    rows = []
    for tid, company, issue, tdate, _status, rdomain in TICKETS:
        _, esp, from_dom, _, sub = ACCOUNTS[company]
        from_domain = from_dom or f"mail.{company.lower().replace(' ','').replace('&','')}.com"
        vol = BASE_VOL[company]
        dp, br, _dfr, _blk, drp, spr, our, cur = ISSUE_METRICS[issue]
        ip_pool = f"pool-{company[:3].lower()}"

        # 3 date rows: split across receiver_domain (primary issue domain + other)
        for i, d in enumerate(prev_days(tdate, 3)):
            v = int(vol * (0.93 + 0.035 * i))
            # 60% to the affected receiver domain, 40% to 'other'
            for frac, recv in [(0.60, rdomain), (0.40, "other.com")]:
                sv = int(v * frac)
                del_ = int(sv * dp)
                bn   = int(sv * br)
                sbn  = int(sv * br * 0.35)   # ~35% of bounces are soft
                drp_ = int(del_ * drp)
                sp_  = int(del_ * spr)
                uo   = int(del_ * our)
                uc   = int(del_ * cur)
                d_pct  = r4(del_ / sv)   if sv   else ""
                b_rate = r4(bn  / del_)  if del_ else ""
                sb_rate= r4(sbn / sv)    if sv   else ""
                dr_rate= r4(drp_ / sv)   if sv   else ""
                sp_rate= r4(sp_  / del_) if del_ else ""
                u_or   = r4(uo   / del_) if del_ else ""
                u_cr   = r4(uc   / del_) if del_ else ""
                rows.append({
                    "company_name": company, "esp": esp,
                    "event_date": d.isoformat(),
                    "from_domain": from_domain, "receiver_domain": recv,
                    "ip_pool": ip_pool,
                    "total_sent": sv, "total_delivered": del_,
                    "total_bounces": bn, "total_soft_bounces": sbn,
                    "total_dropped": drp_, "total_spam": sp_,
                    "total_unique_opens": uo, "total_unique_clicks": uc,
                    "delivered_percent": d_pct, "bounce_rate": b_rate,
                    "soft_bounce_rate_new": sb_rate, "dropped_rate": dr_rate,
                    "spam_rate": sp_rate, "unique_open_rate": u_or,
                    "unique_click_rate": u_cr,
                })
    return rows

# ── dmarc_header_report ───────────────────────────────────────────────────────

DMARC_HDR_FIELDS = [
    "from_domain","spf_result","dkim_result","dmarc_result",
    "received_time","count",
    "spf_pass","spf_notpass","dkim_pass","dkim_notpass","dmarc_pass","dmarc_notpass",
]

# issue -> (spf_result, dkim_result, dmarc_result, spf_pass_pct, dkim_pass_pct, dmarc_pass_pct)
DMARC_SIGS = {
    "gmail_throttle":  ("pass",      "pass",  "pass",  0.99, 0.99, 0.99),
    "microsoft_block": ("fail",      "pass",  "fail",  0.87, 0.99, 0.88),
    "spf_quarantine":  ("permerror", "pass",  "fail",  0.52, 0.99, 0.53),
    "dkim_fail":       ("pass",      "fail",  "fail",  0.99, 0.02, 0.02),
    "yahoo_complaint": ("pass",      "pass",  "pass",  0.99, 0.99, 0.99),
    "hard_bounce":     ("pass",      "pass",  "pass",  0.99, 0.99, 0.99),
    "ip_warmup":       ("pass",      "pass",  "pass",  0.99, 0.99, 0.99),
}

def dmarc_hdr_rows():
    # one row per unique (company, issue) — use latest ticket date
    seen = {}
    for tid, company, issue, tdate, _status, _rd in TICKETS:
        _, esp, domain, _, _ = ACCOUNTS[company]
        if esp != "sparkpost" or domain is None: continue
        # keep the most recent date per domain
        if domain not in seen or tdate > seen[domain][0]:
            seen[domain] = (tdate, issue)
    rows = []
    for domain, (tdate, issue) in seen.items():
        spf_r, dkim_r, dmarc_r, spf_pp, dkim_pp, dmarc_pp = DMARC_SIGS[issue]
        n = 50000 + hash(domain) % 80000
        rows.append({
            "from_domain": domain,
            "spf_result": spf_r, "dkim_result": dkim_r, "dmarc_result": dmarc_r,
            "received_time": dt(tdate, 6),
            "count": n,
            "spf_pass":    int(n * spf_pp),
            "spf_notpass": int(n * (1 - spf_pp)),
            "dkim_pass":   int(n * dkim_pp),
            "dkim_notpass":int(n * (1 - dkim_pp)),
            "dmarc_pass":  int(n * dmarc_pp),
            "dmarc_notpass":int(n * (1 - dmarc_pp)),
        })
    return rows

# ── postmaster_report ─────────────────────────────────────────────────────────

PM_FIELDS = [
    "activity_date","domain","domain_reputation",
    "spf_success_ratio","dkim_success_ratio","dmarc_success_ratio",
    "ip_reputations_bad_num","ip_reputations_low_num",
    "ip_reputations_medium_num","ip_reputations_high_num",
]

# issue -> (reputation, spf_ratio, dkim_ratio, dmarc_ratio, bad, low, med, high)
PM_SIGS = {
    "gmail_throttle":  ("MEDIUM", 0.99, 0.99, 0.99, 1, 2, 2, 2),
    "spf_quarantine":  ("BAD",    0.54, 0.99, 0.55, 3, 2, 0, 0),
    "dkim_fail":       ("LOW",    0.99, 0.04, 0.04, 2, 3, 1, 0),
    "yahoo_complaint": ("HIGH",   0.99, 0.99, 0.99, 0, 1, 1, 5),
    "hard_bounce":     ("HIGH",   0.99, 0.99, 0.99, 0, 0, 1, 6),
    "ip_warmup":       ("LOW",    0.99, 0.99, 0.99, 1, 3, 2, 1),
    "microsoft_block": ("MEDIUM", 0.99, 0.99, 0.99, 0, 1, 2, 3),
}

def pm_rows():
    seen = {}
    for tid, company, issue, tdate, _status, _rd in TICKETS:
        _, esp, domain, _, _ = ACCOUNTS[company]
        if esp != "sparkpost" or domain is None: continue
        if domain not in seen or tdate > seen[domain][0]:
            seen[domain] = (tdate, issue)
    rows = []
    for domain, (tdate, issue) in seen.items():
        rep, spf_r, dkim_r, dmarc_r, bad, low, med, high = PM_SIGS.get(issue, PM_SIGS["gmail_throttle"])
        rows.append({
            "activity_date": tdate.isoformat(), "domain": domain,
            "domain_reputation": rep,
            "spf_success_ratio": spf_r, "dkim_success_ratio": dkim_r,
            "dmarc_success_ratio": dmarc_r,
            "ip_reputations_bad_num": bad, "ip_reputations_low_num": low,
            "ip_reputations_medium_num": med, "ip_reputations_high_num": high,
        })
    return rows

# ── case_milestone ─────────────────────────────────────────────────────────────

MILESTONE_FIELDS = [
    "case_id","milestone_type","is_completed","is_violated",
    "assigned_time","resolved_time","target_time","time_since_target_in_hrs","count",
]

def milestone_rows():
    rows = []
    for tid, company, issue, tdate, status, _rd in TICKETS:
        # Assigned milestone — always created at ticket open (+30min)
        assign_t = dt(tdate, 9)
        assign_target = dt(tdate, 13)
        resolved_t = ""
        resolve_target_t = dt(tdate + timedelta(days=2), 9)
        resolve_violated = "no"
        resolve_completed = "no"

        if status == "Closed":
            resolved_t = dt(tdate + timedelta(days=3), 15)
            resolve_completed = "yes"
        elif status == "In Progress":
            resolve_violated = "no"

        rows.append({
            "case_id": tid, "milestone_type": "Assigned",
            "is_completed": "yes", "is_violated": "no",
            "assigned_time": assign_t, "resolved_time": "",
            "target_time": assign_target, "time_since_target_in_hrs": 0, "count": 1,
        })
        rows.append({
            "case_id": tid, "milestone_type": "Resolved",
            "is_completed": resolve_completed, "is_violated": resolve_violated,
            "assigned_time": assign_t, "resolved_time": resolved_t,
            "target_time": resolve_target_t, "time_since_target_in_hrs": 0, "count": 1,
        })
    return rows

# ── ticket_communications ──────────────────────────────────────────────────────

TC_FIELDS = ["id","case_id","comm_type","created_by_id","comm_date_time","last_modified_date_time"]

def tc_rows():
    rows = []
    for tid, company, issue, tdate, status, _rd in TICKETS:
        # Customer email in
        em1_t = dt(tdate, 9)
        rows.append({"id": f"EM-{tid[4:]}-01", "case_id": tid, "comm_type": "Email",
                     "created_by_id": "USR-CUST", "comm_date_time": em1_t, "last_modified_date_time": em1_t})
        # Consultant reply
        em2_t = dt(tdate, 13)
        rows.append({"id": f"EM-{tid[4:]}-02", "case_id": tid, "comm_type": "Email",
                     "created_by_id": "USR-CONS", "comm_date_time": em2_t, "last_modified_date_time": em2_t})
        # Internal comment
        cmt1_t = dt(tdate, 14)
        rows.append({"id": f"CMT-{tid[4:]}-01", "case_id": tid, "comm_type": "Case Comment",
                     "created_by_id": "USR-CONS", "comm_date_time": cmt1_t, "last_modified_date_time": cmt1_t})
        # Second internal comment for complex tickets
        cmt2_t = dt(tdate, 16)
        rows.append({"id": f"CMT-{tid[4:]}-02", "case_id": tid, "comm_type": "Case Comment",
                     "created_by_id": "USR-ENG", "comm_date_time": cmt2_t, "last_modified_date_time": cmt2_t})
        # For closed tickets: resolution email
        if status == "Closed":
            em3_t = dt(tdate + timedelta(days=3), 10)
            rows.append({"id": f"EM-{tid[4:]}-03", "case_id": tid, "comm_type": "Email",
                         "created_by_id": "USR-CONS", "comm_date_time": em3_t, "last_modified_date_time": em3_t})
    return rows

# ── email messages ─────────────────────────────────────────────────────────────

EMAIL_FIELDS = [
    "id","case_id","sent_time","created_time",
    "from_address","to_address","subject",
    "text_body_cleaned","text_body","has_attachment","created_by_id",
]

# issue -> (customer subject, customer body, consultant subject, consultant body)
EMAIL_SCRIPTS = {
    "gmail_throttle": (
        "Open rates collapsed at Gmail",
        "Our {campaign} open rate at Gmail has dropped from ~32% to around 11% over the past five days. Deliverability reporting still looks normal so we are unsure of the cause. Please investigate urgently.",
        "RE: Open rates collapsed at Gmail",
        "Thanks for reaching out. Authentication is fully aligned so this is a reputation/throttling signal at Gmail rather than an auth issue. We are seeing rising deferrals on your IP pool. Pulling Postmaster data now and will follow up shortly.",
    ),
    "microsoft_block": (
        "Emails bouncing at Outlook and Hotmail",
        "Our {campaign} emails are bouncing at Outlook and Hotmail with S3140 errors. This started {when}. Please help urgently as this is affecting {audience}.",
        "RE: Emails bouncing at Outlook and Hotmail",
        "We have confirmed elevated Microsoft S3140 blocks on your sending IP. This indicates IP reputation throttling. Return-Path alignment also needs review. We are comparing bounce volume by IP and will come back with findings.",
    ),
    "spf_quarantine": (
        "Emails going to spam after DNS change",
        "After our team updated the SPF record, {campaign} emails are going to spam or being quarantined at Gmail and Yahoo. The campaign launched yesterday and we need this resolved quickly.",
        "RE: Emails going to spam after DNS change",
        "Your SPF record now exceeds 10 DNS lookups which causes a PermError. With your DMARC policy at p=quarantine, receiving servers are quarantining the mail. We will send a flattened SPF record that reduces lookups and restores alignment.",
    ),
    "dkim_fail": (
        "Authentication failure after key rotation",
        "We rotated our DKIM keys {when} as part of a routine update. Since then our {campaign} emails are showing authentication failures and we believe some are bouncing. Can you help?",
        "RE: Authentication failure after key rotation",
        "We can see DKIM signature verification is failing. This usually means the new public key is not correctly published in DNS or the signing selector has not been updated in the ESP settings. We are checking both sides now.",
    ),
    "yahoo_complaint": (
        "Emails landing in Yahoo spam folder",
        "We are receiving complaints from Yahoo users that our {campaign} messages are landing in spam. Our complaint rate in Braze reporting looks elevated above the usual threshold. Please advise.",
        "RE: Emails landing in Yahoo spam folder",
        "Your spam complaint rate has exceeded Yahoo's threshold which has triggered their spam filter placement. The main lever here is list hygiene and one-click unsubscribe. We will review your engagement segments and suppression list.",
    ),
    "hard_bounce": (
        "Significant bounce spike - invalid recipients",
        "We are seeing a large spike in hard bounces on our {campaign} campaign. Many recipients appear to be invalid. Is this a data quality issue or something on the sending side?",
        "RE: Significant bounce spike - invalid recipients",
        "The bounce classification confirms these are 5.1.1 invalid recipient errors, meaning the email addresses do not exist at the receiving domain. This is a list hygiene issue. We recommend suppressing all bounced addresses immediately and reviewing your sign-up source data.",
    ),
    "ip_warmup": (
        "Declining inbox placement on new IP",
        "We recently started warming up a new dedicated IP. After the first two weeks reputation looks to have dipped and Gmail placement has fallen. Is this expected or is there a problem?",
        "RE: Declining inbox placement on new IP",
        "Some reputation dip mid-warmup is normal but your volume ramp may be slightly aggressive for this audience mix. We recommend slowing the ramp and ensuring you are only sending to highly engaged contacts during warmup weeks 3 and 4. We will share a revised warmup schedule.",
    ),
}

CAMPAIGNS = {
    "Tesco": "Clubcard promo", "Morrisons": "More Card", "Waitrose": "myWaitrose",
    "Sainsbury's": "Nectar", "Asda": "Asda Rewards", "Co-op": "Co-op membership",
    "Aldi": "Aldi Specialbuys", "Lidl": "Lidl Plus", "M&S": "M&S Sparks",
    "Boots": "Advantage Card", "Greggs": "Greggs Rewards", "Iceland": "Bonus Card",
}

CONTACT_EMAILS = {
    "Tesco": "example@tesco.com", "Morrisons": "example@morrisons.com",
    "Waitrose": "example@waitrose.com", "Sainsbury's": "example@sainsburys.co.uk",
    "Asda": "example@asda.com", "Co-op": "example@coop.co.uk",
    "Aldi": "example@aldi.co.uk", "Lidl": "example@lidl.co.uk",
    "M&S": "example@marksandspencer.com", "Boots": "example@boots.com",
    "Greggs": "example@greggs.co.uk", "Iceland": "example@iceland.co.uk",
}

CONTACTS = {
    "Tesco": "Priya Nair", "Morrisons": "Liam Hughes", "Waitrose": "Eleanor Page",
    "Sainsbury's": "Rohan Patel", "Asda": "Megan Clarke", "Co-op": "Tom Bennett",
    "Aldi": "Hannah Lewis", "Lidl": "Jakub Nowak", "M&S": "Olivia Reed",
    "Boots": "Daniel Foster", "Greggs": "Chloe Adams", "Iceland": "Marcus Hill",
}

CONSULTANTS = {
    "Tesco": ("Sarah J.", "example@braze.com"), "Morrisons": ("Dave K.", "example@braze.com"),
    "Waitrose": ("Sarah J.", "example@braze.com"), "Sainsbury's": ("Sarah J.", "example@braze.com"),
    "Asda": ("Dave K.", "example@braze.com"), "Co-op": ("Dave K.", "example@braze.com"),
    "Aldi": ("Dave K.", "example@braze.com"), "Lidl": ("Sarah J.", "example@braze.com"),
    "M&S": ("Dave K.", "example@braze.com"), "Boots": ("Dave K.", "example@braze.com"),
    "Greggs": ("Sarah J.", "example@braze.com"), "Iceland": ("Sarah J.", "example@braze.com"),
}

WHEN_PHRASES = {
    "TCK-9001": "over the past five days", "TCK-9002": "since we changed the sending domain",
    "TCK-9003": "after our DNS team edited the SPF record", "TCK-9004": "over the past week",
    "TCK-9005": "since our last campaign send", "TCK-9006": "after a routine key rotation",
    "TCK-9007": "this week", "TCK-9008": "after a recent migration",
    "TCK-9009": "on the last campaign", "TCK-8801": "after Black Friday volume",
    "TCK-8802": "after the sending-domain change", "TCK-8803": "after the SPF edit",
    "TCK-8804": "at high send volume", "TCK-8805": "since last week",
    "TCK-8806": "after our DNS update", "TCK-8807": "after the migration",
    "TCK-8808": "this month", "TCK-8809": "during warmup week 3",
}

AUDIENCES = {
    "gmail_throttle": "Gmail subscribers", "microsoft_block": "Outlook and Hotmail recipients",
    "spf_quarantine": "Gmail and Yahoo recipients", "dkim_fail": "all recipients",
    "yahoo_complaint": "Yahoo subscribers", "hard_bounce": "our full list",
    "ip_warmup": "Gmail subscribers",
}

def email_rows():
    rows = []
    for tid, company, issue, tdate, status, _rd in TICKETS:
        campaign = CAMPAIGNS[company]
        when = WHEN_PHRASES.get(tid, "recently")
        audience = AUDIENCES.get(issue, "subscribers")
        cust_email = CONTACT_EMAILS[company]
        cons_name, cons_email = CONSULTANTS[company]

        scripts = EMAIL_SCRIPTS[issue]
        cust_subj = scripts[0]
        cust_body = scripts[1].format(campaign=campaign, when=when, audience=audience)
        cons_subj = scripts[2]
        cons_body = scripts[3]

        t1 = dt(tdate, 9)
        t2 = dt(tdate, 13)

        rows.append({
            "id": f"EM-{tid[4:]}-01", "case_id": tid,
            "sent_time": t1, "created_time": t1,
            "from_address": cust_email, "to_address": "support@braze.com",
            "subject": cust_subj,
            "text_body_cleaned": cust_body,
            "text_body": cust_body,
            "has_attachment": "no", "created_by_id": "USR-CUST",
        })
        rows.append({
            "id": f"EM-{tid[4:]}-02", "case_id": tid,
            "sent_time": t2, "created_time": t2,
            "from_address": cons_email, "to_address": cust_email,
            "subject": cons_subj,
            "text_body_cleaned": cons_body,
            "text_body": f"{cons_body}\n\n> {cust_body[:120]}...",
            "has_attachment": "no", "created_by_id": "USR-CONS",
        })
        if status == "Closed":
            res_t = dt(tdate + timedelta(days=3), 10)
            rows.append({
                "id": f"EM-{tid[4:]}-03", "case_id": tid,
                "sent_time": res_t, "created_time": res_t,
                "from_address": cons_email, "to_address": cust_email,
                "subject": f"RE: {cust_subj} — Resolved",
                "text_body_cleaned": f"Hi {CONTACTS[company].split()[0]}, the issue has been resolved. "
                    "Please monitor sending over the next 24 hours and let us know if anything reoccurs. "
                    "Happy to jump on a call if helpful.",
                "text_body": f"Hi {CONTACTS[company].split()[0]}, the issue has been resolved. "
                    "Please monitor sending over the next 24 hours and let us know if anything reoccurs. "
                    "Happy to jump on a call if helpful.",
                "has_attachment": "no", "created_by_id": "USR-CONS",
            })
    return rows

# ── case comments ─────────────────────────────────────────────────────────────

COMMENT_FIELDS = [
    "id","case_id","created_time","last_modified_time",
    "created_by_id","last_modified_by_id",
    "created_by_name","created_by_role","created_by_team",
    "comment_body","is_published",
]

# issue -> (internal investigation note, engineering note, resolution note if closed)
COMMENT_SCRIPTS = {
    "gmail_throttle": (
        "Postmaster shows domain reputation declined to MEDIUM. Increased send volume preceded the open-rate drop. Escalating to Deliverability Ops to review the deferral pattern on this IP pool.",
        "Send cadence spiked before the drop. Recommend smoothing volume and prioritising 30-day engagers. Reducing daily cap by 30% should recover Gmail reputation within 5–7 days.",
        "Guidance relayed to customer: reducing daily volume and prioritising engaged subscribers. Will monitor Postmaster trend.",
    ),
    "microsoft_block": (
        "Microsoft S3140 indicates IP reputation throttling. Return-Path alignment looks off. Checking if the current IP is shared with another high-volume sender.",
        "Confirmed shared IP pool issue. Noisy co-tenant triggered the Microsoft throttle. Migrating account to a dedicated IP; warmup schedule required before full volume resumes.",
        "Customer advised: corrected Return-Path alignment guidance sent. Pausing Microsoft segment for 24h while reputation recovers.",
    ),
    "spf_quarantine": (
        "SPF has exceeded 10 DNS lookups — PermError confirmed. With DMARC at p=quarantine, receiving servers quarantine unaligned mail. DNS team to identify which includes can be safely flattened.",
        "Legacy include (obsolete third-party ESP) and one redundant MX include identified as safe to remove. Flattened SPF record prepared for customer review.",
        "Flattened SPF record published by customer. Alignment confirmed via DMARC aggregate report. Mail delivery restored.",
    ),
    "dkim_fail": (
        "DKIM signature verification failing. Either the new public key is not published in DNS or the selector in the ESP configuration has not been updated. Checking both.",
        "ESP is still signing with the old selector. New DKIM TXT record is correctly published in DNS but the signing selector in the platform has not been switched over. Customer needs to update the selector in settings.",
        "Selector updated. DKIM verification passing. DMARC aggregate report confirms alignment restored.",
    ),
    "yahoo_complaint": (
        "Spam complaint rate is above Yahoo's FBL threshold. Message content and list hygiene are the primary vectors. Reviewing engagement segmentation and suppression list coverage.",
        "A large non-engaged segment (last open >180 days) was included in this campaign. This cohort has high complaint propensity. Recommending hard suppression of >180-day non-openers and adding RFC 8058 one-click unsubscribe.",
        "One-click unsubscribe added. Non-opener suppression implemented. Complaint rate back below threshold.",
    ),
    "hard_bounce": (
        "Bounce classification confirms 5.1.1 invalid recipient errors. List source needs review — likely stale data from a legacy acquisition. Advising immediate suppression of bounced addresses.",
        "Bounce spike traced to a batch of emails from a 2-year-old imported list that was not run through list validation before import. Recommending zero-bounce or NeverBounce validation before any re-engagement send.",
        "Bounced addresses suppressed. List validation completed. Bounce rate returned to baseline.",
    ),
    "ip_warmup": (
        "Reputation dip mid-warmup. Volume ramp may be slightly aggressive for the audience mix available. Checking engagement rates by cohort on the warmup schedule.",
        "Week-3 volume exceeded recommended ceiling for this domain's engagement ratio. Recommend restarting warmup from week 2 with engagers-only cohort and slowing ramp by 15% per day.",
        "Warmup restarted with revised schedule. Gmail reputation trending upward on Postmaster.",
    ),
}

def comment_rows():
    rows = []
    for tid, company, issue, tdate, status, _rd in TICKETS:
        cons_name, _ = CONSULTANTS[company]
        scripts = COMMENT_SCRIPTS[issue]

        t1 = dt(tdate, 14)
        t2 = dt(tdate, 16)

        rows.append({
            "id": f"CMT-{tid[4:]}-01", "case_id": tid,
            "created_time": t1, "last_modified_time": t1,
            "created_by_id": "USR-CONS", "last_modified_by_id": "USR-CONS",
            "created_by_name": cons_name, "created_by_role": "Support Consultant",
            "created_by_team": "GSS Support",
            "comment_body": scripts[0], "is_published": "false",
        })
        rows.append({
            "id": f"CMT-{tid[4:]}-02", "case_id": tid,
            "created_time": t2, "last_modified_time": t2,
            "created_by_id": "USR-ENG", "last_modified_by_id": "USR-ENG",
            "created_by_name": "Engineering Ops", "created_by_role": "Platform Engineer",
            "created_by_team": "Support Engineering",
            "comment_body": scripts[1], "is_published": "false",
        })
        if status == "Closed":
            t3 = dt(tdate + timedelta(days=2), 11)
            rows.append({
                "id": f"CMT-{tid[4:]}-03", "case_id": tid,
                "created_time": t3, "last_modified_time": t3,
                "created_by_id": "USR-CONS", "last_modified_by_id": "USR-CONS",
                "created_by_name": cons_name, "created_by_role": "Support Consultant",
                "created_by_team": "GSS Support",
                "comment_body": scripts[2], "is_published": "true",
            })
    return rows

# ── main ──────────────────────────────────────────────────────────────────────

print("── generating demo data for all 18 tickets ──")

DATA = {
    "sparkpost_domain_metrics":     (SP_DOM_FIELDS,     sp_domain_rows()),
    "sparkpost_sending_ip_metrics": (SP_IP_FIELDS,      sp_ip_rows()),
    "platform_email_aggregation":   (PEA_FIELDS,        pea_rows()),
    "dmarc_header_report":          (DMARC_HDR_FIELDS,  dmarc_hdr_rows()),
    "postmaster_report":            (PM_FIELDS,         pm_rows()),
    "case_milestone":               (MILESTONE_FIELDS,  milestone_rows()),
    "ticket_communications":        (TC_FIELDS,         tc_rows()),
    "support_cases_email_message":  (EMAIL_FIELDS,      email_rows()),
    "support_cases_case_comment":   (COMMENT_FIELDS,    comment_rows()),
}

for name, (fields, rows) in DATA.items():
    write_csv(f"{name}.csv", fields, rows)

# Reload unchanged CSVs for xlsx
def read_csv(name):
    path = FIXTURES / name
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

STATIC = {
    "companies_all_view": read_csv("companies_all_view.csv"),
    "support_cases":      read_csv("support_cases.csv"),
    "dmarc_aggregated_report": read_csv("dmarc_aggregated_report.csv"),
}

# Build full xlsx
print("\n── rebuilding xlsx ──")
wb = openpyxl.Workbook()
wb.remove(wb.active)

# Define tab order matching V4 §19
TAB_ORDER = [
    "support_cases", "support_cases_email_message", "support_cases_case_comment",
    "ticket_communications", "case_milestone", "companies_all_view",
    "platform_email_aggregation", "sparkpost_domain_metrics",
    "sparkpost_sending_ip_metrics", "dmarc_header_report", "postmaster_report",
    "dmarc_aggregated_report",
]

all_data = {}
all_data.update({k: (list(v[0]), v[1]) for k, v in DATA.items()})
for name, rows in STATIC.items():
    if rows:
        all_data[name] = (list(rows[0].keys()), rows)

for tab in TAB_ORDER:
    if tab not in all_data: continue
    fields, rows = all_data[tab]
    ws = wb.create_sheet(title=tab)
    ws.append(fields)
    for row in rows:
        ws.append([row.get(f, "") for f in fields])

wb.save(FIXTURES / "EDQ_demo_data.xlsx")
print(f"  EDQ_demo_data.xlsx: {len(TAB_ORDER)} sheets")
print("\nDone.")
