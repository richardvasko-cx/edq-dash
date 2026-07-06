---
id: ee4f67af
title: 30 day trend  [Context — Deferred]: Deferred: 9,175
timestamp: 2026-07-06T15:10:25.334Z
preview: 30 day trend  [Context — Deferred]: Deferred: 9,175
source: pill
chips_json: [[{"label":"Deferred"}],null]
articles_json: [null,[{"path":"docs/User Guide/channels/email/best_practices/improve_deliverability/index.md","title":"Improve Deliverability","section":"improve deliverability"},{"path":"docs/User Guide/data/distribution/braze_currents/event_glossary/message_engagement_events/index.md","title":"Message Engagement Events","section":"message engagement events"},{"path":"docs/User Guide/audience/segments/segment_extension/sql_segments/sql_segments_tables/index.md","title":"Sql Segments Tables","section":"sql segments tables"}]]
actions_json: [null,[{"id":"open-google-dig","label":"Google Dig","description":"Check DNS records for a sending domain.","icon":"dns","view":"tools","toolsTab":"dig"},{"id":"open-ticket-authentication","label":"Authentication","description":"Review SPF, DKIM, DMARC, rDNS, and alignment.","icon":"shield","view":"investigation","ticketSection":"Authentication"},{"id":"open-ticket-email-performance","label":"Email Performance","description":"Review engagement and performance metrics.","icon":"equalizer","view":"investigation","ticketSection":"Email Performance"},{"id":"open-ticket-support-history","label":"Support History","description":"Review prior cases and account history.","icon":"history","view":"investigation","ticketSection":"Support History"}]]
---

**User:** 30 day trend

[Context — Deferred]:
Deferred: 9,175

**Gemini:** The 30-day trend for ticket 26060004 shows a clear correlation between increased promotional frequency and a degradation in deliverability health, specifically regarding Yahoo/AOL deferrals.

### 30-Day Metric Analysis
*   **Early Period (8 May – 20 May):** The account maintained a stable, healthy environment with an **Accepted Rate of ~98.8%** and a **Deferred rate of ~1.5%**.
*   **Inflection Point (21 May):** Following the doubling of promotional frequency, the **Deferred rate began a steady climb**, rising from 2.0% on 21 May to a peak of **5.6% on 29 May**.
*   **Current State (31 May – 6 Jun):** The trend has plateaued at a higher risk level. While the **Accepted Rate remains at 95.9%**, the **Deferred rate persists between 5.2% and 5.5%**, reflecting a sustained struggle with Yahoo’s throughput limits.

### Deliverability & Performance Summary
| Metric | Current Status | Trend Observation |
| :--- | :--- | :--- |
| **Accepted Rate** | 95.9% | Trending downward from the 98%+ baseline. |
| **Bounce Rate** | 4.1% | Elevated, driven by temporary resource constraints at Yahoo. |
| **Deferred Volume** | 9,175 (pinned) | Significant volume currently hitting retry queues. |
| **Spam Complaint Rate** | 0.1% | Remains healthy, suggesting the issue is reputation-based throttling rather than user-reported spam. |

### Diagnostic Findings
*   **Authentication:** Remains healthy (SPF/DKIM/DMARC pass), confirming that the issue is not technical configuration but rather **reputation-based throttling**.
*   **Provider Signals:** The bounce logs for `yahoo.co.uk` (451 4.7.1) and `aol.com` (421 4.7.0) explicitly cite "Resources temporarily not available" and "Temporarily deferred due to user complaints or reputation." 

**Conclusion:** The doubling of promotional frequency has diluted engagement and triggered Yahoo’s protective throttling mechanisms. The current 30-day trend confirms that the increased cadence is exceeding the established reputation threshold, resulting in a consistent volume of deferred messages rather than successful inbox placement. 

**Next Step:** Review the current campaign cadence against the 30-day historical baseline to identify the specific segments or message types contributing most heavily to the 21 May–29 May spike in deferred volumes.

```json
{
  "type": "chart",
  "allowChart": true,
  "chartType": "line",
  "title": "30-Day Deferred Rate Trend (%)",
  "xField": "x",
  "yField": "value",
  "data": [
    {
      "x": "8 May",
      "value": 1.5
    },
    {
      "x": "12 May",
      "value": 1.5
    },
    {
      "x": "16 May",
      "value": 1.5
    },
    {
      "x": "20 May",
      "value": 1.5
    },
    {
      "x": "24 May",
      "value": 3.5
    },
    {
      "x": "28 May",
      "value": 5.1
    },
    {
      "x": "1 Jun",
      "value": 5.3
    },
    {
      "x": "6 Jun",
      "value": 5.5
    }
  ]
}
```