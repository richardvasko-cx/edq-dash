# Frequently asked questions

> This article provides answers to some frequently asked questions about rate limiting and frequency capping.

### If I change a send throttle on an active Canvas, does it affect users already in the Canvas?

Yes, when you increase or decrease a Canvas rate limit, the updated limit takes effect for new messages. There may be a brief delay before the update is reflected across the Canvas.

### What happens if a user reaches a Canvas Message step but is over the global frequency cap?

The user doesn't receive that send for the capped channel, but they still follow your Message step advancement rules. Message steps advance users when a message isn't sent because of global frequency capping, so they continue to the next Canvas step. For the full list of advancement cases, see [How users advance](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/message_step/#how-users-advance).

### How can I identify users who were frequency capped in a Canvas?

Users who are frequency capped don't generate a send event for that step. To identify these users, you can use [Currents](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/) to track message aborted events where `abort_type` is `frequency_capped`. Alternatively, you can create a [Segment Extension](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/) to analyze users who entered the Canvas but didn't receive the expected message.

### How are calendar days and time zones used for "per day" global frequency caps?

Global frequency capping uses the user's time zone and counts by calendar day, not rolling 24-hour periods. For an example, see [Delivery rules](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/#delivery-rules).

### Does global frequency capping apply to triggered in-app messages?

No, global frequency capping only applies to push, email, SMS, webhook, WhatsApp, and LINE messages.

### Does frequency capping limit campaigns received or individual messages inside a send?

Frequency capping applies per dispatch—each campaign or Canvas step send counts toward your caps, not each variant or platform inside a send. For more information, see [Delivery rules](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/#delivery-rules).

### If several messages are eligible at the same time and only some fit under the cap, which messages send?

Braze sends up to the limit. When multiple sends compete in the same window, the messages that are processed first are the ones that count toward the cap. Remaining sends in that window are capped.

### Do failed webhooks count toward the global frequency cap?

No. A webhook counts toward the cap when Braze records a successful delivery. Unsuccessful webhook responses (for example, `4xx` or `5xx` status codes) don't count toward the cap.