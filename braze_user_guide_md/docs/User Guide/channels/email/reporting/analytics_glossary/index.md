<style>
  .calculation-line {
    color: #76848C;
    font-size: 14px;
  }
</style>

<div id='api_qlrtdctbsqza' class='api_div' data-search-keywords='count'>
<h3 id="variation">Variation</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_niugfphevhax' class='api_div' data-search-keywords='count'>
<h3 id="emailable">Emailable</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_edefgpbtwrqa' class='api_div' data-search-keywords='percentage'>
<h3 id="audience-">Audience %</h3>

<div class="api_tags" data-tags="Percentage" data-tags-lower="percentage"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Number of Recipients in Variant) / (Unique Recipients)</span></p>

</div>

<div id='api_tgymhgjxnlvf' class='api_div' data-search-keywords='count'>
<h3 id="unique-recipients">Unique Recipients</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This number is received from Braze.</p>

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_oigswygksnei' class='api_div' data-search-keywords='count'>
<h3 id="sends">Sends</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This metric is provided by Braze.</p>

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_kxraqisvzedj' class='api_div' data-search-keywords='count'>
<h3 id="messages-sent">Messages Sent</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This metric is provided by Braze.</p>

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_ywowbrveeaex' class='api_div' data-search-keywords='count'>
<h3 id="deliveries">Deliveries</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>For emails, <em>Deliveries</em> is the total number of messages (Sends) successfully sent to and received by emailable parties.</p>

<p><span class="calculation-line">Calculation: (Sends) - (Bounces) </span></p>

</div>

<div id='api_eaeooajoglem' class='api_div' data-search-keywords='percentage'>
<h3 id="deliveries-">Deliveries %</h3>

<div class="api_tags" data-tags="Percentage" data-tags-lower="percentage"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Sends - Bounces) / (Sends) </span></p>

</div>

<div id='api_axbklibrxefu' class='api_div' data-search-keywords='count, percentage'>
<h3 id="bounces">Bounces</h3>

<div class="api_tags" data-tags="Count, Percentage" data-tags-lower="count, percentage"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>For email, <em>Bounce %</em> or <em>Bounce Rate</em> is the percentage of messages that were unsuccessfully sent or designated as “returned” or “not received” from send services used or not received by the intended emailable users.</p>

<p>An email bounce for customers using SendGrid consists of hard bounces, spam (<code class="language-plaintext highlighter-rouge">spam_report_drops</code>), and emails sent to invalid addresses (<code class="language-plaintext highlighter-rouge">invalid_emails</code>).</p>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b><i>Bounces</i>:</b> Count</li>
        <li><b><i>Bounce %</i> or <i>Bounce Rate %</i>:</b> (Bounces) / (Sends)</li>
    </ul>
</span>

</div>

<div id='api_agsofpvamvqp' class='api_div' data-search-keywords='count'>
<h3 id="hard-bounce">Hard Bounce</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>When an email hard bounces or is marked as spam, Braze marks the email address as invalid but does not update the user’s <a href="/docs/user_guide/message_building_by_channel/email/managing_user_subscriptions/">subscription status</a>. Braze stops any future sends to that email address. To remove an email address from your hard bounce list, use the <a href="/docs/api/endpoints/email/post_remove_hard_bounces">Remove hard bounced emails endpoint</a>.</p>

<p><span class="calculation-line">Calculation: Count </span></p>

</div>

<div id='api_kycgwdbaufqf' class='api_div' data-search-keywords='count'>
<h3 id="soft-bounce">Soft Bounce</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>If an email receives a soft bounce, we will usually retry within 72 hours, but the number of retry attempts varies from receiver to receiver.</p>

<p>While soft bounces aren’t tracked in your campaign analytics, you can monitor the soft bounces in the <a href="/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/">Message Activity Log</a> or exclude these users from your sending with the <a href="/docs/user_guide/audience/segments/segmentation_filters#soft-bounced">Soft Bounced segment filter</a>. In the Message Activity Log, you can also see the reason for the soft bounces and understand possible discrepancies between the “sends” and “deliveries” for your email campaigns.</p>

<p><span class="calculation-line">Calculation: Count </span></p>

</div>

<div id='api_hhmxrxbdymje' class='api_div' data-search-keywords='count, percentage'>
<h3 id="spam">Spam</h3>

<div class="api_tags" data-tags="Count, Percentage" data-tags-lower="count, percentage"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b><i>Spam</i>:</b> Count</li>
        <li><b><i>Spam %</i> or <i>Spam Rate %</i>:</b> (Marked as Spam) / (Sends)</li>
    </ul>
</span>

</div>

<div id='api_luucgkslhwxb' class='api_div' data-search-keywords='count, percentage'>
<h3 id="unique-opens">Unique Opens</h3>

<div class="api_tags" data-tags="Count, Percentage" data-tags-lower="count, percentage"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>For email, this is tracked over a seven-day period. This means a single user who opens the same email again after seven days counts as a new unique open. As a result, dashboard unique open counts may be higher than a simple <code class="language-plaintext highlighter-rouge">DISTINCT user_id</code> query on Currents data. To match dashboard counts from Currents, filter for events where <code class="language-plaintext highlighter-rouge">is_unique</code> is <code class="language-plaintext highlighter-rouge">true</code>.</p>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b><i>Unique Opens</i>:</b> Count</li>
        <li><b><i>Unique Opens %</i> or <i>Unique Open Rate</i>:</b> (Unique Opens) / (Deliveries)</li>
    </ul>
</span>

</div>

<div id='api_sfkjsrysjofq' class='api_div' data-search-keywords='count, percentage'>
<h3 id="unique-clicks">Unique Clicks</h3>

<div class="api_tags" data-tags="Count, Percentage" data-tags-lower="count, percentage"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This is tracked over a seven-day period for email and measured by <a href="/docs/user_guide/messaging/messaging_fundamentals/dispatch_id/">dispatch_id</a>. This includes clicks on Braze-provided unsubscribe links. After seven days, another unique click can count for the same user if they click again. To match dashboard counts from Currents, filter for events where <code class="language-plaintext highlighter-rouge">is_unique</code> is <code class="language-plaintext highlighter-rouge">true</code>.</p>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b><i>Unique Clicks</i>:</b> Count</li>
        <li><b><i>Unique Clicks %</i> or <i>Click Rate</i>:</b> (Unique Clicks) / (Deliveries)</li>
    </ul>
</span>

</div>

<div id='api_wwnjisrdahpz' class='api_div' data-search-keywords='count, percentage'>
<h3 id="unsubscribers-or-unsub">Unsubscribers or Unsub</h3>

<div class="api_tags" data-tags="Count, Percentage" data-tags-lower="count, percentage"></div>

<p><em>Unsubscribes</em> reflect the standard unsubscribe link for Braze. Custom unsubscribe pages won’t increment this metric unless you update users using the API. <strong>Subscription Group Timeseries</strong> still reflects API-driven changes.</p>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b><i>Unsubscribers</i> or <i>Unsub</i>:</b> Count</li>
        <li><b><i>Unsubscribers %</i> or <i>Unsub Rate</i>:</b> (Unsubscribes) / (Deliveries)</li>
    </ul>
</span>

<h4 id="why-unsubscribes-and-unsubscribe-link-clicks-can-differ">Why <em>Unsubscribes</em> and unsubscribe-link clicks can differ</h4>

<p>On the <strong>Analytics</strong> page for an email campaign or Canvas, compare the <em>Unsubscribes</em> count to clicks on the Braze unsubscribe URL in the per-link breakdown when you expand <strong>Total Clicks</strong> or <strong>Unique Clicks</strong>. The two often match but can differ:</p>

<ul>
  <li><strong>More <em>Unsubscribes</em> than clicks on the body unsubscribe URL:</strong> <a href="/docs/user_guide/administer/global/workspace_settings/email_preferences/#list-unsubscribe">List-unsubscribe</a> is an additional unsubscribe path in the email header (not the link in your message body). When a user unsubscribes that way, it counts toward <em>Unsubscribes</em> but does not count as a click on the tracked unsubscribe URL in the body.</li>
  <li><strong>More clicks on the body unsubscribe URL than <em>Unsubscribes</em>:</strong> A user may select that link more than once. If they unsubscribe, resubscribe, and unsubscribe again, email analytics can record multiple clicks (for example, two) in the click breakdown.</li>
</ul>

<p>For more information, see <a href="/docs/user_guide/channels/email/faq/#why-am-i-seeing-a-different-number-of-unsubscribes-than-clicks-on-my-unsubscribe-link">Why am I seeing a different number of unsubscribes than clicks on my unsubscribe link?</a>.</p>

</div>

<div id='api_sthagiuvrpvg' class='api_div' data-search-keywords='count'>
<h3 id="revenue">Revenue</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: Count </span></p>

</div>

<div id='api_dgqqtatgythz' class='api_div' data-search-keywords='count, percentage'>
<h3 id="primary-conversions-a-or-primary-conversion-event">Primary Conversions (A) or Primary Conversion Event</h3>

<div class="api_tags" data-tags="Count, Percentage" data-tags-lower="count, percentage"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>For email, push, and webhooks, we start tracking conversions after the initial send.</p>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b><i>Primary Conversions (A)</i> or <i>Primary Conversion Event</i>:</b> Count</li>
        <li><b><i>Primary Conversions (A) %</i> or <i>Primary Conversion Event Rate</i>:</b> (Primary Conversions) / (Unique Recipients)</li>
    </ul>
</span>

</div>

<div id='api_fjrxakpbizkm' class='api_div' data-search-keywords='count'>
<h3 id="confidence">Confidence</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_badbdckrwocr' class='api_div' data-search-keywords=''>
<h3 id="machine-opens">Machine Opens</h3>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This metric is tracked starting November 11, 2021 for SendGrid and December 2, 2021 for SparkPost.</p>

<p><span class="calculation-line">Calculation: Count </span></p>

</div>

<div id='api_ofuvcplpvpzk' class='api_div' data-search-keywords='count'>
<h3 id="other-opens">Other Opens</h3>

<div class="api_tags" data-tags="Count" data-tags-lower="count"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Note that a user can also open an email (such as the open counts toward <i>Other Opens</i>) before a <i>Machine Opens</i> count is logged. If a user opens an email once (or more) after a machine open event from a non-Apple Mail inbox, then the amount of times that the user opens the email is calculated toward <i>Other Opens</i> and only once toward <i>Unique Opens</i>.</p>

<p><span class="calculation-line">Calculation: Count </span></p>

</div>

<div id='api_ocmrkazpxeps' class='api_div' data-search-keywords='percentage'>
<h3 id="click-to-open-rate">Click-to-Open Rate</h3>

<div class="api_tags" data-tags="Percentage" data-tags-lower="percentage"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Unique Clicks) / (Unique Opens) (for Email)</span></p>

</div>

## Email reporting troubleshooting and FAQs

### Unsubscribe links and Unique Clicks

When a recipient clicks an unsubscribe link, Braze counts it as a click because the action uses a URL. This applies to Braze-provided unsubscribe links and custom unsubscribe links in your message body. Those clicks contribute to *Unique Clicks* and *Total Clicks* alongside other link clicks. For metric definitions, see [Unique Clicks](#unique-clicks) above and [Why am I seeing a different number of unsubscribes than clicks on my unsubscribe link?](https://www.braze.com/docs/user_guide/channels/email/faq/#why-am-i-seeing-a-different-number-of-unsubscribes-than-clicks-on-my-unsubscribe-link).

### View in browser

Braze does not include a built-in "View this email in a browser" feature. Host the email content on an external landing page (such as your website) and add a link from the message using the email editor **Link** tool. For more information, see [Can I add a "view this email in a browser" link to my emails?](https://www.braze.com/docs/user_guide/channels/email/faq/#can-i-add-a-view-this-email-in-a-browser-link-to-my-emails).

### Over-quota and full mailbox bounces

An over-quota or mailbox-full bounce means the recipient's mailbox cannot accept new mail. You may see these addresses among new sign-ups with invalid or risky addresses, or among long-inactive profiles whose inboxes filled while they were dormant.

Review bounce rates by segment and source, remove or sunset addresses that repeatedly hard-bounce, and use confirmed or double opt-in for new subscribers. For list hygiene practices, see [Deliverability pitfalls and spam traps](https://www.braze.com/docs/user_guide/channels/email/email_setup/deliverability_pitfalls_and_spam_traps/) and [Email reporting](https://www.braze.com/docs/user_guide/channels/email/reporting/#troubleshooting).

### 550 5.7.1 unsolicited mail

A `550 5.7.1` response such as "Our system has detected that this message is likely unsolicited mail" often comes from strict mailbox providers (for example, Gmail) when reputation or engagement signals look poor. Common contributors include spam complaints, low engagement, purchased or rented lists, and sudden volume spikes.

Focus on consent-based list growth, sunset inactive subscribers, and monitor complaint and bounce rates. For more information, see [Deliverability pitfalls and spam traps](https://www.braze.com/docs/user_guide/channels/email/email_setup/deliverability_pitfalls_and_spam_traps/).

### Good email deliverability rates

**Delivery** is whether the receiving server accepts your message; you can measure it with metrics such as *Deliveries* and bounce rate. **Deliverability** (inbox placement) depends on provider filtering and isn't shown as a single Braze metric.

As a general guide, aim for delivery near 99% with hard bounces under about 1%, and watch opens and clicks for engagement trends. Exact targets vary by industry and sending pattern. For practices that support reputation, see [Improve email deliverability](https://www.braze.com/docs/user_guide/channels/email/best_practices/improve_deliverability/) and [Deliverability pitfalls and spam traps](https://www.braze.com/docs/user_guide/channels/email/email_setup/deliverability_pitfalls_and_spam_traps/).

### "Campaign is already in delay window, so not enqueueing another"

In message activity or diagnostic logs for [action-based campaigns](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/), this processing outcome means Braze blocked a duplicate send while an earlier trigger for the same user is still within the campaign's delivery window. A debounce lock prevents multiple enqueues for the same trigger burst.

You can see this outcome even when the campaign shows **Send immediately** if any of the following apply:

- The campaign uses an [exception event](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/exit_criteria/#exception-events) or a send-time delay that affects timing.
- Users have a [re-eligibility](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/re_eligibility/) period, so they can't receive the message again until that window passes.
- Another campaign or Canvas message step with higher priority consumed the send slot when triggers overlap.

If a user should have received the message but did not, check earlier outcomes for the same trigger (for example, email bounce or not enabled for the channel). Another message in the same workflow may have prevented this send.
