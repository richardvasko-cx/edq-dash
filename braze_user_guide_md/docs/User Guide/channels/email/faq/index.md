# Frequently asked questions

> This article provides answers to some frequently asked questions about emails.

### What happens when an email is sent out, and multiple profiles have the same email address?

If multiple users with matching email addresses are in a segment to receive a campaign, a single user profile with that email address is selected at send time. This way, the email is sent only once and deduplicated, ensuring it doesn't reach the same email address multiple times.

**Unique email addresses:** Braze doesn't enforce unique email addresses across profiles. If you rely on a one-to-one relationship between an email address and a profile, monitor for duplicates internally when creating users.

**Deduplication before Liquid:** For sends where Braze deduplicates by email address within one dispatch (for example, scheduled campaigns where multiple segment members with the same address are processed together), that deduplication happens before Liquid runs for the profile chosen to represent that address. If Liquid aborts for that profile (for example with [`abort_message()`](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/aborting_messages/)), that address does not receive the message on that dispatch—including profiles already skipped by deduplication. Triggered sends do not apply that same in-dispatch address deduplication; multiple profiles who share an address can all remain eligible in one batch, so this abort behavior does not apply the same way (see the next paragraph).

If multiple profiles share an email address and one profile unsubscribes, Braze updates other profiles (up to 100) with that address to the same subscription state. This applies to unsubscribes and other changes such as global subscription state and individual subscription group statuses.

**Seed Groups:** For campaigns with [Seed Groups](https://www.braze.com/docs/user_guide/administer/global/user_management/internal_groups/#seed-groups), Braze selects one profile for primary delivery when several profiles share an address. That primary recipient might not be in your Seed Group, even when another profile with the same address is.

The following scenarios can make it seem like a user received an email twice:

- **An error occurred during campaign or Canvas creation:** The user may not receive the same send twice, but may receive two separate emails with the same subject line. When a campaign or Canvas is duplicated, check email configuration details such as images or subject lines. You can also refer to changelogs to see if the campaign or Canvas was modified after launch—a duplicate may share the same subject line as the original when the user received it.
- **Multiple user profiles have email forwarding:** If a user has multiple accounts in a given app but one account forwards mail, the user receives the campaign once per inbox; mail can appear twice in the inbox where messages are forwarded. Only some providers indicate when an email was forwarded from another account.
- **Email configuration at the recipient:** Some clients merge inboxes ("universal inbox"). If the same campaign targets multiple accounts that share one inbox, it can look like one person got the campaign twice when two distinct profiles were actually messaged. The recipient can confirm whether multiple accounts are combined in one inbox.

This deduplication applies when targeted users are in the same dispatch. Re-eligibility is evaluated per profile, not per email address. 

Email campaign and Canvas step re-eligibility uses each user's profile—not the inbox—so multiple profiles can qualify for separate sends while that logic is satisfied. Combined with triggers, this can deliver more than one message to the same inbox even when you're trying to honor a single ineligibility period at the address level. Triggered campaigns (excluding API-triggered campaigns) and Canvases can also send twice to one address when different profiles with matching email addresses meet the trigger at different times—for example if user A and user B share `johndoe@example.com` but sit in different time zones while the delivery uses local time zones.

Users are not deduped by email on Canvas entry, so they may not be deduped beyond the first step of a Canvas if they progress at slightly different times due to rate-limited entry. When a user associated with a given email address opens or clicks an email, all user profiles that share that email address are marked as having opened or clicked the campaign.

#### Exception: API-triggered campaigns

API-triggered campaigns will deduplicate or send deduplicates depending on where the audience is defined. Duplicate emails must be targeted separately in the API call using distinct `user_ids` to receive multiple deliveries. Here are three possible scenarios for API-triggered campaigns:

- **Scenario 1: Duplicate emails in target segment:** If the same email appears in multiple user profiles that are grouped in the dashboard's audience filters for an API-triggered campaign, only one of the profiles receives the email.
- **Scenario 2: Duplicate emails in different `user_ids` within recipients object:** If the same email appears within multiple `external_user_id` values referenced by the `recipients` object, the email is sent twice.
- **Scenario 3: Duplicate emails due to duplicate `user_ids` within the recipients object:** If you try to add the same user profile twice, only one of the profiles receives the email.

**Important:**


If you send an API campaign through an API call (excluding API-triggered campaigns), and multiple users are specified in the segment audience with the same email address, it sends to that address as many times as listed in the call. This is because API calls are assumed to be purposefully constructed.



### What happens to the subscription state when a user's email address changes to one shared by another user?

If you set or update the email address for user A to another email address that's shared by an existing user B, user A inherits the subscription state that already exists from user B unless the **Resubscribe users when they update their email** setting is turned on.

### Will updates to my outbound email settings apply retroactively?

No. Updates made to the outbound email settings do not retroactively affect existing sends. For example, changing your default display name in the email settings will not automatically replace the existing default display name in your active campaigns or Canvases. 

### What is a "good" email delivery rate?

Typically, the "magic number" is around 98% of messages delivered with a bounce rate no higher than 3%. If your delivery dips below that, there is usually cause for concern.

However, a rate above 98% can still have deliverability issues. For example, if all your bounces come from a single domain, that is a clear signal of a reputation issue with that provider.

Additionally, messages may be getting delivered and ending up in Spam, indicating potentially serious reputation issues. It's important to monitor not just the number of messages being delivered, but also open and click rates to determine whether users are actually seeing the messages in their inboxes. Because providers usually don't report every spam instance, a spam rate of even 1% could be cause for concern and further analysis.

Finally, your business and the types of emails you send may also affect delivery. For example, someone sending mostly [transactional emails](https://www.braze.com/docs/api/api_campaigns/transactional_api_campaign) should expect to see a better rate than someone sending many marketing messages.

### Why are my email delivery metrics not adding up to 100%?

Email delivery metrics (deliveries, bounces, and spam rate) may not add up to 100% because of emails that are soft bounced and then not delivered after the retry period of up to 72 hours.

Soft bounces are emails that bounce due to a temporary or transient issue, such as "mailbox full," "server temporarily not available," and more. If a soft-bounced email is still not delivered after 72 hours, this email will not be accounted for in the campaign delivery metrics.

### What is an email feedback loop?

An email feedback loop (FBL) allows senders to monitor their reputation by identifying campaigns that receive a high volume of complaints. For steps to implement a Gmail feedback loop, see [Google's Feedback Loop](https://support.google.com/a/answer/6254652) article.

### What are open tracking pixels?

[Open tracking pixels](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/email_preferences#changing-location-of-tracking-pixel) leverage a sender's email click tracking domain to track email open events. The pixel is an image tag appended to the email's HTML. It is most commonly the last HTML element within the body tag. When a user loads their email, a request is made to populate the image from the branded tracking domain, which logs an open event.

### What happens when an email campaign or Canvas is stopped?

Users are prevented from entering the Canvas, and no further messages are sent out. 

For email campaigns and Canvases, the stop button does not immediately stop the send. When the send requests are sent, they cannot be stopped from being delivered to the user, which may happen after some delay. 

While Braze won't send further requests once the campaign or Canvas is stopped, analytics may still increase while the ESP finishes processing requests already in flight.

### Why am I seeing more _Total Clicks_ than _Total Opens_ in my email analytics?

_Total Opens_ is the count of how many times the email was opened by users, whereas _Total Clicks_ is the count of how many times users clicked within the delivered email, including any type of clicks such as link clicks. You may be seeing more clicks than opens for any of the following reasons:

- Users are performing multiple clicks on the body of the email within a single open.
- Users click on some email links within the preview pane of their phones. In this case, Braze logs this email as being clicked but not opened.
- Users reopen an email that they previewed earlier.

### Why am I seeing zero email opens and clicks?

You may see no email opens or clicks if there's a misconfiguration in your tracking domain. This can be due to any of the following reasons:
- There is an SSL issue where tracking URLs are `http` instead of `https`.
- There is an issue with your CDN where the user agent string on the open events, click events, or both aren't populating.

### What are the potential risks of triggering server clicks?

Certain elements of an email message, such as overly long messages or too many exclamation marks, can trigger email security responses. These responses can affect reporting and IP reputation and lead users to unsubscribe.

For best practices on how to handle these responses, refer to [Handling increases in click rates](https://www.braze.com/docs/user_guide/channels/email/reporting/).

### Can Braze track unsubscribe links counted toward the "Unsubscribe" metric?

Braze tracks unsubscribe links if the following Liquid is used within emails: `${set_user_to_unsubscribed_url}`

### Why am I seeing a different number of unsubscribes than clicks on my unsubscribe link?

If there are more _Unsubscribes_ than users who clicked the unsubscribe link in the email body, [**List-unsubscribe**](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/email_preferences/#list-unsubscribe) often explains the gap. List-unsubscribe is an additional unsubscribe path in the email header (not the link in your message body). When a user unsubscribes that way, it counts toward _Unsubscribes_ but does not count as a click on the tracked unsubscribe URL in the body.

If the total number of clicks on the body unsubscribe link is greater than the number of _Unsubscribes_, users may have clicked the link more than once—for example, if they unsubscribe, resubscribe, and unsubscribe again, email analytics can record multiple clicks in the click breakdown.

If a user clicks the unsubscribe link twice (for example, if they unsubscribed, subscribed again, then unsubscribed again), this counts twice in email analytics.

### Can I add a "view this email in a browser" link to my emails?

No. Braze does not offer this functionality. This is because a growing majority of email is opened on mobile devices and in modern email clients, which render images and content without issues.

**Workaround:** To achieve this same result, you can host the content of your email on an external landing page (such as your website), which can then be linked to from the email campaign you are building using the **Link** tool when editing the email body.

### Does Braze automatically turn plain text URLs or "www." text into links?

No. Braze does not scan your message and convert plain text, such as text that starts with `www.` or looks like a URL, into hyperlinks. Only links you define with HTML anchor tags (`<a href="...">`) are processed through normal rendering and link features in Braze.

If a recipient sees plain text shown as a clickable link, that behavior usually comes from their email client (for example, Gmail, Outlook, or Apple Mail). Many clients detect URL-like strings after the message is delivered and turn them into links on the recipient's device. Braze does not control that behavior and cannot turn it off for the recipient.

For predictable link appearance, tracking, and styling, use explicit `<a href>` tags instead of plain text URLs.

### Why are my users being auto-unsubscribed by email security software?

Some corporate email security tools (such as Barracuda, Proofpoint, and similar services) pre-fetch or scan all URLs in incoming emails, including unsubscribe links. This can cause unintended unsubscribes when the security tool follows the one-click list-unsubscribe link.

To mitigate this:

- **Recommend recipients allowlist your sending domain:** Work with the affected recipients' IT teams to add your sending domain and Braze tracking domains to their email security allow list.
- **Use a preference center:** Instead of a direct unsubscribe link, use a [preference center](https://www.braze.com/docs/user_guide/channels/email/subscriptions/) that requires user interaction to confirm the unsubscribe action. Security scanners typically won't complete multi-step forms.
- **Review unsubscribe logs:** Check the `User-Agent` header and IP address in your Currents unsubscribe event data to identify patterns consistent with automated scanning (such as consistent `User-Agent` headers across multiple unsubscribes).

For more details on how server-side scanning can affect email metrics, refer to [Handling increases in click rates](https://www.braze.com/docs/user_guide/channels/email/reporting/#handling-increases-in-click-rates).

### Why has my machine open rate changed unexpectedly?

[Machine opens](https://www.braze.com/docs/user_guide/analytics/metrics_glossary#machine-opens) are triggered by email security features such as Apple Mail Privacy Protection (MPP), which pre-loads email content (including the tracking pixel) without the user physically opening the email. Machine open rates can fluctuate based on:

- Changes in the proportion of your audience using Apple Mail or other privacy-enabled email clients.
- Updates to email provider privacy features or bot detection behaviors.
- Changes in your audience segmentation or targeting.

Machine open percentages are not a reliable measure of actual engagement. For a more accurate view of email performance, focus on *Other Opens* (non-machine opens) and *Unique Clicks*. You can also compare these metrics over time using the [Email Performance Dashboard](https://www.braze.com/docs/user_guide/analytics/dashboards/channel_performance/).

### Why are my deep links not working in Gmail?

Gmail strips all non-HTTP/HTTPS links from email messages. If your deep link uses a custom scheme (such as `myapp://path/to/content`), Gmail will remove it, and the link won't function for recipients reading the email in Gmail. This is a Gmail limitation, not a Braze limitation.

To work around this:

- **Use Universal Links (iOS) or App Links (Android).** These use standard `https://` URLs that open your app when installed and fall back to a web page otherwise. Refer to [Universal Links and App Links](https://www.braze.com/docs/user_guide/channels/email/customize/universal_links_and_app_links/) for setup instructions.
- **Use a deep linking provider.** Services like [Branch](https://www.branch.io/) generate HTTP-formatted deep links that are compatible with email clients, including Gmail.
- **Set up a redirect endpoint.** Host an `https://` endpoint on your server that redirects to your app's custom-scheme URL. Email clients will preserve the `https://` link, and the redirect handles opening the app.

### Does the *Unique Opens* metric include *Machine Opens*?

Yes. *Unique Opens* include *Machine Opens*. You can view both metrics in the **Campaign Analytics** view and **Report Builder**.

### Why does my email delivery volume not match my send volume?

After an email is sent, the recipient's inbox decides when it is delivered. Messages can be deferred for hours or days because of a full mailbox, ESP throttling from a given IP, and similar reasons.

When deferred messages are delivered on a different calendar day than the send day, _Deliveries_ can exceed _Sends_ for the same date range. When many deferrals land on one day, _Sends_ can exceed _Deliveries_ for that range.

### Why am I seeing a warning to include an unsubscribe link when my email already has one?

This warning can persist for campaigns duplicated from a campaign that did not have an unsubscribe link. To clear it:

- For HTML emails, go to the **Plaintext** tab, then select **Regenerate from HTML**.
- After duplicating, duplicate the variant, then remove the original variant. **Do not** select the original variant, or the warning can carry over.

### Why hasn't a user received my email message?

There are several reasons why a user does not receive an email that you expected them to get, including:

- They weren't eligible to receive the email.
- Their email address is invalid or doesn't exist.
- They may have missed or deleted the message.
- The message may be in their spam folder.

**Tip:**


A delivery event in Braze means the email was accepted by the mailbox provider's server. However, this does not guarantee that the message appears in the user's inbox. The mailbox provider may route the message to spam or, in rare cases, silently prevent display of the message.



Use the following tables to narrow down the cause.

#### The email wasn't sent

| Possible cause | What to check |
|---|---|
| The user wasn't eligible for the campaign or Canvas | Check the **Target Audiences** (for campaigns) or **Target Audience** (for Canvas) [settings](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/target_users/) to confirm the user met all audience filters, segment criteria, and delivery rules at the time of send. |
| The message was aborted | Check the [Message Activity Log](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/) for abort reasons, such as Liquid errors or missing required fields. |
| The user's email address was invalid or missing | In **User Search**, check the user's profile to verify that a valid email address was on file at the time of send. |
| The user's email address previously hard bounced | A hard bounce marks the email address as invalid and prevents future sends to that address. Similarly, if a recipient marks your email as spam, Braze sends only transactional emails to that user, not standard campaigns. Check the user's **Engagement** tab in their profile. For more information, see [Unsubscribed email addresses](https://www.braze.com/docs/user_guide/channels/email/subscriptions/#unsubscribed-email-addresses) and [Bounces and invalid emails](https://www.braze.com/docs/user_guide/channels/email/subscriptions/#bounces-and-invalid-emails). |
| The user is unsubscribed from email | Check the user's subscription status under **Contact Settings** on the **Engagement** tab. Braze does not send emails to users who are unsubscribed. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Cause for email not sent" }

#### The email was sent, but didn't arrive in their inbox

| Possible cause | What to check |
|---|---|
| The mailbox provider (MBP) was unreachable | A temporary issue prevented the email from reaching the recipient's MBP. This typically resolves itself with retries. Email service providers retry soft bounces for up to 72 hours. |
| The MBP bounced the email | The recipient's mail server rejected the email. Review the [Message Activity Log](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/) for bounce details. |
| The MBP silently dropped the email | The MBP accepted the email but didn't display it to the user and didn't return a bounce. This is outside of Braze's control and cannot be detected in Braze logs. |
| The email went to the spam folder | The MBP identified the message as spam and routed it to the user's spam or junk folder. Ask the user to check their spam folder. |
| The recipient has custom mail filtering | The user or their IT administrator may have configured mailbox rules that filter, redirect, or delete incoming messages. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Cause for email not in inbox" }

### How can I optimize images in Outlook?

Outlook often uses Microsoft Word–style rendering, which can add a border around images. You can wrap content so it hides in Office clients using standard conditional comments, for example:

```html
<!--[if !mso]><!-- -->
<span>Content hidden in Outlook desktop</span>
<!--<![endif]-->
```

### Can I use SVG or WEBP images in my email messages?

SVG images won't render in Gmail web or Gmail iOS. WEBP is not consistently supported across clients. Instead, use widely supported formats such as PNG or JPEG so images render reliably.

### Can Liquid variables assigned in one part of the message composer be used in another?

No. Each part of the email (subject, body, headers, buttons, and so on) is generated separately, so Liquid assigned in one field is not available in another. Assign variables in each field that needs them.

### My email template is missing. Where is it?

First, confirm you have the [user permissions](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/) to view templates. To view saved email templates, go to **Content** > **Email**. You can filter templates by status and type (HTML or drag-and-drop).

### Do I need to register domains for relay or masked emails?

[Apple’s Private Email Relay](https://www.braze.com/docs/user_guide/channels/email/best_practices/apple_mail/email_private_relay_apple_SSO/) requires you to register your sending domains in the Apple Developer Portal to prevent bounces. Google Shielded Email does not require a manual domain registration or allowlisting process.

### What does the bounce reason `unable to get mx info` or `failed to get IPs from PTR record` mean?

In the [Message Activity Log](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/), a bounce reason similar to the following indicates a problem resolving the receiving domain's mail setup (the domain after the `@` in the address), not to Braze message composition:

Typical causes include:

- Missing, incorrect, or unreachable **MX records** for that domain
- Inbound mail hostnames that don't resolve or that fail **PTR (reverse DNS)** checks expected by receiving infrastructure
- Invalid or mistyped domains in the email address

**Next steps:**

- Confirm the address and domain spelling.
- If the address is correct, contact the mailbox owner or IT team for that domain.
- Ask them to audit MX and related DNS records, including PTR records for their mail servers, with their DNS provider.

Other recipients are usually unaffected. For how soft bounces appear in reporting, see [Soft Bounce](https://www.braze.com/docs/user_guide/channels/email/reporting/analytics_glossary/#soft-bounce).
