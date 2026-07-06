# Webhooks

> A webhook is an automated message from one system to another after certain criteria are met. In Braze, this criteria is usually the triggering of a custom event. Webhooks provide dynamic and flexible access to data and programmatic functionality, and empower you to set up customer journeys that streamline processes.

## Prerequisites

Webhooks availability depends on your Braze package. Contact your account manager or customer success manager to get started.

## Use cases

Webhooks are an excellent way to connect your systems together—after all, webhooks are how apps communicate. Here are some general scenarios where webhooks can be particularly useful:

- Sending data to and from Braze
- Sending messages to your customers via channels not directly supported by Braze
- Posting to Braze APIs

Some more specific use cases include the following:

- Create a [lead-scoring workflow](https://www.braze.com/docs/user_guide/get_started/b2b_use_cases/lead_scoring/) using webhooks and Canvas to qualify and route leads.
- If a user unsubscribes from email, you could have a webhook update your analytics database or CRM with that same information, ensuring a holistic view of that user's behavior.
- Send [transactional messages](https://www.braze.com/docs/api/api_campaigns/transactional_api_campaign/) to users within Facebook Messenger or Line.
- Send direct mail to customers in response to their in-app and web activity by using webhooks to communicate with third-party services like [Lob.com](https://www.braze.com/docs/partners/additional_channels_and_extensions/additional_channels/direct_mail/lob/).
- If a gamer reaches a certain level or accrues a certain number of points, use webhooks and your existing API setup to send a character upgrade or coins directly to their account. If you send the webhook as part of a multichannel messaging campaign, you can send a push or other message to let the gamer know about the reward at the same time.
- If you're an airline, you can use webhooks and your existing API setup to credit a customer's account with a discount after they've booked a certain number of flights.
- Endless "If This Then That" ([IFTTT](https://ifttt.com/about)) recipes--for instance, if a customer signs into the app through email, then that address can automatically be configured into Salesforce.

## Webhook error handling and rate limiting

Braze retries webhook delivery only for certain HTTP responses (for example, `408`, `429`, and `5XX`). Most other responses, including `401 Unauthorized` and other `4XX` errors, are not retried. Response headers such as `Retry-After` and `X-Rate-Limit-*` can influence backoff timing **when a response is already eligible for retry**; they do not cause Braze to retry errors that are outside the retriable set.

For the full response code table, retry limits, and timeout behavior, see [Response codes and retry logic](https://www.braze.com/docs/user_guide/channels/webhooks/create_a_webhook/#response-codes-and-retry-logic).

If the majority of webhook requests to a specific host are failing, Braze temporarily defers all send attempts to that host. Sending resumes after a defined cooldown period, allowing your system to recover.

## Using webhooks with Braze partners {#utilizing-webhooks}

There are many ways to use webhooks, and with our technology partners (Alloys), you can use webhooks to level up your communication directly with your customers and users.

Check out:
* [Messenger](https://www.braze.com/docs/partners/additional_channels_and_extensions/additional_channels/instant_chat/messenger/)
* [Remerge](https://www.braze.com/docs/partners/remerge/)
* [Lob.com](https://www.braze.com/docs/partners/additional_channels_and_extensions/additional_channels/direct_mail/lob/)
* And many more of our [technology partners](https://www.braze.com/docs/partners/home/)!

## Next steps

- [Create a webhook](https://www.braze.com/docs/user_guide/channels/webhooks/create_a_webhook/)
- [Create a Braze-to-Braze webhook](https://www.braze.com/docs/user_guide/channels/webhooks/use_case_create_a_braze_to_braze_webhook/)
