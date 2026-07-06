---
id: c8ddb3a6
title: 30 day trend  [Context — Deferred]: Deferred: 9,175
timestamp: 2026-07-06T15:15:29.517Z
preview: 30 day trend  [Context — Deferred]: Deferred: 9,175
source: pill
chips_json: [[{"label":"Deferred"}],null,null,null]
articles_json: [null,[{"path":"docs/User Guide/channels/email/best_practices/improve_deliverability/index.md","title":"Improve Deliverability","section":"improve deliverability"},{"path":"docs/User Guide/data/distribution/braze_currents/event_glossary/message_engagement_events/index.md","title":"Message Engagement Events","section":"message engagement events"},{"path":"docs/User Guide/audience/segments/segment_extension/sql_segments/sql_segments_tables/index.md","title":"Sql Segments Tables","section":"sql segments tables"}],null,[{"path":"docs/User Guide/channels/email/best_practices/improve_deliverability/index.md","title":"Improve Deliverability","section":"improve deliverability"},{"path":"docs/User Guide/data/distribution/braze_currents/event_glossary/message_engagement_events/index.md","title":"Message Engagement Events","section":"message engagement events"},{"path":"docs/User Guide/audience/segments/segment_extension/sql_segments/sql_segments_tables/index.md","title":"Sql Segments Tables","section":"sql segments tables"}]]
actions_json: [null,[{"id":"open-ip-warming","label":"IP Warming Planner","description":"Build or review the volume ramp plan.","icon":"thermostat","view":"tools","toolsTab":"ip_warming"},{"id":"open-google-dig","label":"Google Dig","description":"Check DNS records for a sending domain.","icon":"dns","view":"tools","toolsTab":"dig"},{"id":"open-ticket-authentication","label":"Authentication","description":"Review SPF, DKIM, DMARC, rDNS, and alignment.","icon":"shield","view":"investigation","ticketSection":"Authentication"},{"id":"open-ticket-email-performance","label":"Email Performance","description":"Review engagement and performance metrics.","icon":"equalizer","view":"investigation","ticketSection":"Email Performance"}],null,[{"id":"open-google-dig","label":"Google Dig","description":"Check DNS records for a sending domain.","icon":"dns","view":"tools","toolsTab":"dig"},{"id":"open-ticket-authentication","label":"Authentication","description":"Review SPF, DKIM, DMARC, rDNS, and alignment.","icon":"shield","view":"investigation","ticketSection":"Authentication"},{"id":"open-ticket-email-performance","label":"Email Performance","description":"Review engagement and performance metrics.","icon":"equalizer","view":"investigation","ticketSection":"Email Performance"},{"id":"open-ticket-support-history","label":"Support History","description":"Review prior cases and account history.","icon":"history","view":"investigation","ticketSection":"Support History"}]]
---

**User:** 30 day trend

[Context — Deferred]:
Deferred: 9,175

**Gemini:** The 30-day trend for Morrisons (Case 26060004) shows a clear correlation between increased promotional frequency and a degradation in deliverability health, specifically regarding Yahoo and AOL deferrals.

### 30-Day Metric Analysis
While the 7-day snapshot shows a 95.9% accepted rate and 4.1% bounce rate, the 30-day daily historical data reveals a significant upward trend in deferred events:

*   **Baseline (May 8 – May 20):** Deferred events remained stable, averaging approximately **2,500–3,000** per day.
*   **Escalation (May 21 – June 6):** Following the increase in promotional frequency, deferrals climbed sharply. By May 29, daily deferrals peaked at **18,714**, and the most recent data (June 5) shows **18,976** deferred events.
*   **Accepted Percentage:** This has steadily declined from a high of **98.9%** on May 10 to **98.1%** as of June 6.

### Deliverability Context
*   **Root Cause:** The doubling of promotional frequency and subsequent targeting of lower-engagement users has weakened reputation signals at Yahoo and AOL.
*   **Bounce Profile:** The deferrals are specifically categorized as `451 4.7.1` (Yahoo) and `421 4.7.0` (AOL) errors, indicating that the volume or frequency of sends is exceeding the mailbox providers' current threshold for this sender's reputation, triggering temporary throttling.
*   **Authentication:** Despite the delivery issues, authentication (SPF, DKIM, DMARC) remains healthy and is not the cause of the deferrals.

### Summary of Trend
The account is experiencing a classic "reputation throttling" pattern. The expansion into less engaged cohorts, combined with higher frequency, has caused a sustained increase in temporary deferrals. The trend indicates that the current sending volume is consistently hitting a ceiling at Yahoo and AOL, resulting in a persistent retry queue rather than successful delivery.

**Next Step:** Use the **IP Warming Planner** to model a reduced, gradual ramp-up schedule that aligns with the previous stable baseline (pre-May 21) to allow the domain reputation to recover.

```json
{
  "type": "chart",
  "allowChart": true,
  "chartType": "line",
  "title": "30-Day Deferred Events Trend",
  "xField": "x",
  "yField": "value",
  "data": [
    {
      "x": "8 May",
      "value": 3105
    },
    {
      "x": "11 May",
      "value": 2395
    },
    {
      "x": "14 May",
      "value": 3114
    },
    {
      "x": "17 May",
      "value": 2015
    },
    {
      "x": "20 May",
      "value": 3004
    },
    {
      "x": "23 May",
      "value": 5434
    },
    {
      "x": "26 May",
      "value": 10742
    },
    {
      "x": "29 May",
      "value": 18714
    },
    {
      "x": "1 Jun",
      "value": 13508
    },
    {
      "x": "4 Jun",
      "value": 17512
    },
    {
      "x": "6 Jun",
      "value": 13616
    }
  ]
}
```

**User:** What's the total of deferred in the last 30 days

**Gemini:** The total number of deferred events for Morrisons (Case 26060004) over the last 30 days is **188,443**.

This figure represents the cumulative sum of daily deferred events recorded in the account’s 30-day historical metrics from May 8 to June 6. 

The increase in these deferrals is directly tied to the issue identified in this ticket: the doubling of promotional frequency and the expansion into lower-engagement segments. This shift has triggered significant throttling from Yahoo (`451 4.7.1`) and AOL (`421 4.7.0`), as evidenced by the spike from a baseline of ~2,000–3,000 daily deferrals in early May to a peak of 18,976 on June 5. While the account's authentication (SPF/DKIM/DMARC) remains healthy, the volume of traffic is currently exceeding the reputation-based throughput thresholds established by these providers.

```json
{
  "type": "chart",
  "allowChart": true,
  "chartType": "line",
  "title": "Daily Deferred Events (Last 30 Days)",
  "xField": "x",
  "yField": "value",
  "data": [
    {
      "x": "8 May",
      "value": 3105
    },
    {
      "x": "11 May",
      "value": 2395
    },
    {
      "x": "14 May",
      "value": 3114
    },
    {
      "x": "17 May",
      "value": 2015
    },
    {
      "x": "20 May",
      "value": 3004
    },
    {
      "x": "23 May",
      "value": 5434
    },
    {
      "x": "26 May",
      "value": 10742
    },
    {
      "x": "29 May",
      "value": 18714
    },
    {
      "x": "1 Jun",
      "value": 13508
    },
    {
      "x": "4 Jun",
      "value": 17512
    },
    {
      "x": "6 Jun",
      "value": 13616
    }
  ]
}
```