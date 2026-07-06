---
id: 0d9fcef5
title: Read Microsoft SNDS for an IP?
timestamp: 2026-06-20T00:53:36.634Z
preview: Read Microsoft SNDS for an IP?
source: pill
chips_json: [null,null,[{"label":"Key Plan Metrics"}],null]
---

**User:** Read Microsoft SNDS for an IP?

**Gemini:** Microsoft SNDS (Smart Network Data Services) provides feedback on the deliverability of your emails to Microsoft Exchange Online and Outlook. It is not a system you "read" directly within Braze, but rather a service you monitor to understand how Microsoft's filtering systems are treating your sending IP address.

To utilize SNDS data for troubleshooting, you must:

1.  **Submit your sending IP address** to the Microsoft SNDS portal.
2.  **Monitor the responses** sent by Microsoft back to your submitted IP.

SNDS feedback will indicate:

*   **Delivery status:** Whether your emails are being delivered, rejected, or flagged.
*   **Filtering results:** If your email is being caught by spam filters, and the specific reason (e.g., poor sender reputation, missing authentication).

**Actionable Steps:**

*   **Verify Authentication:** Ensure your sending domain has correctly configured **SPF, DKIM, and DMARC** records, as these are the primary factors SNDS will check.
*   **Check Braze IP Reputation:** If you are using a dedicated IP, check the reputation of that IP within your DNS provider or hosting environment.
*   **Analyze Feedback:** If SNDS reports a high rejection rate or flagging, you need to review the specific reasons provided in the SNDS portal and correlate them with your recent Braze sending volume and content.

[Suggested guide cards shown to the user with this answer:
*   Setting up SPF, DKIM, and DMARC
*   Troubleshooting Email Deliverability
*   Managing Sender Reputation]

**User:** [Context — Key Plan Metrics]:
IP Warming Key Metrics: Time to Target: 13 days | Recommended Start Volume: 50 | Applied Strategy: Moderate | Final Daily Volume: 100,000 | Total Emails: 316,650

**Gemini:** The IP Warming Planner indicates a planned ramp schedule for a sending IP. The strategy applied is **Moderate**, targeting a **Total Emails** volume of **316,650**. The schedule requires **13 days** to reach the **Time to Target** volume, which is set at a **Final Daily Volume** of **100,000**. The plan begins with a **Recommended Start Volume** of **50**.