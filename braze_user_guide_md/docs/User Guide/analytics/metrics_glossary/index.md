<style>
  .calculation-line {
    color: #5B6B75;
    font-size: 14px;
  }
</style>

<div id='api_mnanilczbiyp' class='api_div' data-search-keywords='amp clicks email'>
<h2 id="amp-clicks">AMP Clicks</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_qxzbwmkrlict' class='api_div' data-search-keywords='amp opens email'>
<h2 id="amp-opens">AMP Opens</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_kobbazxcrmrq' class='api_div' data-search-keywords='audience all'>
<h2 id="audience">Audience</h2>

<div class="api_tags" data-tags="All" data-tags-lower="all"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Number of Recipients in Variant) / (Unique Recipients)</span></p>

</div>

<div id='api_xagwcqrtoiri' class='api_div' data-search-keywords='bounces email, web push, ios push'>
<h2 id="bounces">Bounces</h2>

<div class="api_tags" data-tags="Email, Web Push, iOS Push" data-tags-lower="email, web push, ios push"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This could occur because there isn’t a valid push token, the user unsubscribed after the campaign was launched, or the email address is inaccurate or deactivated.</p>

<table class="reset-td-br-1 reset-td-br-2" aria-label="Bounces">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Email</td>
      <td>An email bounce for customers using SendGrid consists of hard bounces, spam (<code class="language-plaintext highlighter-rouge">spam_report_drops</code>), and emails sent to invalid addresses (<code class="language-plaintext highlighter-rouge">invalid_emails</code>).<br /><br />For email, <em>Bounce %</em> or <em>Bounce Rate</em> is the percentage of messages that were unsuccessfully sent or designated as “returned” or “not received” from send services used or not received by the intended emailable users.</td>
    </tr>
    <tr>
      <td>Push</td>
      <td>These users have been automatically unsubscribed from all future push notifications.</td>
    </tr>
  </tbody>
</table>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Bounces</i>: Count</li>
        <li><i>Bounce %</i> or <i>Bounce Rate %</i>: (Bounces) / (Sends)</li>
    </ul>
</span>

</div>

<div id='api_teasapzvjoik' class='api_div' data-search-keywords='body click ios push, android push'>
<h2 id="body-click">Body Click</h2>

<div class="api_tags" data-tags="iOS Push, Android Push" data-tags-lower="ios push, android push"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Body Clicks) / (Impressions)</span></p>

</div>

<div id='api_ilgqgtggwywa' class='api_div' data-search-keywords='body clicks in-app message'>
<h2 id="body-clicks">Body Clicks</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Body Clicks) / (Impressions)</span></p>

</div>

<div id='api_tqexdjwrwicl' class='api_div' data-search-keywords='button 1 clicks in-app message'>
<h2 id="button-1-clicks">Button 1 Clicks</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Reporting for <em>Button 1 Clicks</em> only works when you specify the <strong>Identifier for Reporting</strong> as “0” in the in-app message.</p>

<p><span class="calculation-line">Calculation: (Button 1 Clicks) / (Impressions)</span></p>

</div>

<div id='api_aaziwsyesrwo' class='api_div' data-search-keywords='button 2 clicks in-app message'>
<h2 id="button-2-clicks">Button 2 Clicks</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Reporting for <em>Button 2 Clicks</em> only works when you specify the <strong>Identifier for Reporting</strong> as “1” in the in-app message.</p>

<p><span class="calculation-line">Calculation: (Button 2 Clicks) / (Impressions)</span></p>

</div>

<div id='api_hnnfbfrraxlz' class='api_div' data-search-keywords='campaign analytics feature flags'>
<h2 id="campaign-analytics">Campaign analytics</h2>

<div class="api_tags" data-tags="Feature Flags" data-tags-lower="feature flags"></div>

<p>The performance of the message across various channels. The metrics shown depend on the selected messaging channel, and whether the <a href="/docs/developer_guide/platform_wide/feature_flags/experiments/#campaign-analytics">Feature Flag experiment</a> is a multivariate test.</p>

</div>

<div id='api_nllgvichfqym' class='api_div' data-search-keywords='choices submitted in-app message'>
<h2 id="choices-submitted">Choices Submitted</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_qpegjxtwnphz' class='api_div' data-search-keywords='click-to-open rate email'>
<h2 id="click-to-open-rate">Click-to-Open Rate</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Unique Clicks) / (Unique Opens) (for Email)</span></p>

</div>

<div id='api_vorepsuywytx' class='api_div' data-search-keywords='rcs confirmed deliveries or sms confirmed deliveries sms/mms, rcs'>
<h2 id="rcs-confirmed-deliveries-or-sms-confirmed-deliveries">RCS Confirmed Deliveries or SMS Confirmed Deliveries</h2>

<div class="api_tags" data-tags="SMS/MMS, RCS" data-tags-lower="sms/mms, rcs"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>As a Braze customer, deliveries are charged toward your SMS allotment.</p>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Confirmed Deliveries</i>: Count</li>
        <li><i>Confirmed Delivery Rate</i>: (Confirmed Deliveries) / (Sends)</li>
    </ul>
</span>

</div>

<div id='api_tcmelanknswi' class='api_div' data-search-keywords='confidence content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp'>
<h2 id="confidence">Confidence</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, WhatsApp" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_cvfpuyrnftuc' class='api_div' data-search-keywords='confirmation page button in-app message'>
<h2 id="confirmation-page-button">Confirmation Page Button</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_gftuyjndcago' class='api_div' data-search-keywords='confirmation page dismissals in-app message'>
<h2 id="confirmation-page-dismissals">Confirmation Page Dismissals</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_rcpodjlifcog' class='api_div' data-search-keywords='conversions (b, c, d) content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms'>
<h2 id="conversions-b-c-d">Conversions (B, C, D)</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This defined event is determined by you when building the campaign.</p>

<table class="reset-td-br-1 reset-td-br-2" aria-label="Conversions (B, C, D)">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Email, Push, Webhooks</td>
      <td>Conversions are tracked after the initial send.</td>
    </tr>
    <tr>
      <td>Content Cards</td>
      <td>Conversions are counted when the user views a Content Card for the first time.</td>
    </tr>
    <tr>
      <td>In-app messages</td>
      <td>A conversion is counted if the user has received and viewed the in-app message campaign, and subsequently performs the specific conversion event within the defined conversion window, regardless of whether they clicked on the message or not.<br /><br />Conversions are attributed to the most recently received message. If re-eligibility is enabled, the conversion will be assigned to the latest in-app message received, provided that it occurs within the defined conversion window. However, if the in-app message has already been assigned a conversion, then the new conversion cannot be logged for that specific message. This means that each in-app message delivery is associated with only one conversion.</td>
    </tr>
  </tbody>
</table>

</div>

<div id='api_djqeuhuutumm' class='api_div' data-search-keywords='total conversions in-app message'>
<h2 id="total-conversions">Total Conversions</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>When a user views an in-app message campaign only once, only one conversion is counted, even if they perform the conversion event multiple times later on. However, if re-eligibility is turned on and the user sees the in-app message campaign multiple times, <em>Total Conversions</em> can increase once for each time the user logs an impression for a new instance of the in-app message campaign.</p>

<p>For example, if a user triggers an in-app message twice and converts after each in-app message impression (resulting in two conversions), then <em>Total Conversions</em> will increase by two. However, if there was only one in-app message impression followed by two conversion events, only one conversion will be logged, and <em>Total Conversions</em> will increase by one.</p>

</div>

<div id='api_axrswqmpqkyg' class='api_div' data-search-keywords='close message in-app message'>
<h2 id="close-message">Close Message</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_pnmodaotbmxd' class='api_div' data-search-keywords='conversion rate content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms'>
<h2 id="conversion-rate">Conversion Rate</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<table class="reset-td-br-1 reset-td-br-2" aria-label="Conversion Rate">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>In-app messages</td>
      <td>The metric of total daily <i>Unique Impressions</i> is used to calculate the <i>Conversion Rate</i> for in-app messages.<br /><br /><i>Unique Impressions</i> for in-app messages can only be counted once per calendar day in your workspace’s time zone. The number of times a user completes a desired action (a “conversion”) can increase within that same calendar day. While conversions can happen more than once per day, <i>Unique Impressions</i> cannot. Therefore, if a user completes a conversion multiple times within a day, the <i>Conversion Rate</i> can increase accordingly, but <i>Unique Impressions</i> are only counted once for that calendar day. For more details, refer to <a href="/docs/user_guide/channels/in_app_messages/reporting/">In-app message reporting</a>.</td>
    </tr>
  </tbody>
</table>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b>In-App Messages</b>: (Primary Conversions) / (Unique Impressions)</li>
        <li><b>Other Channels</b>: (Primary Conversions) / (Unique Recipients)</li>
    </ul>
</span>

</div>

<div id='api_tzypbmuakibf' class='api_div' data-search-keywords='conversion window all'>
<h2 id="conversion-window">Conversion Window</h2>

<div class="api_tags" data-tags="All" data-tags-lower="all"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_syugoyaflrqn' class='api_div' data-search-keywords='deliveries email, web push, ios push, android push, whatsapp'>
<h2 id="deliveries">Deliveries</h2>

<div class="api_tags" data-tags="Email, Web Push, iOS Push, Android Push, WhatsApp" data-tags-lower="email, web push, ios push, android push, whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<table class="reset-td-br-1 reset-td-br-2" aria-label="Deliveries">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Email</td>
      <td>Refers to the total number of messages (Sends) successfully sent to and received by emailable parties.</td>
    </tr>
  </tbody>
</table>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Deliveries</i>: Count</li>
        <li><i>Deliveries %</i>: (Sends - Bounces) / (Sends)</li>
    </ul>
</span>

</div>

<div id='api_zykxenkzecpa' class='api_div' data-search-keywords='rcs delivery failures or sms delivery failures sms/mms'>
<h2 id="rcs-delivery-failures-or-sms-delivery-failures">RCS Delivery Failures or SMS Delivery Failures</h2>

<div class="api_tags" data-tags="SMS/MMS" data-tags-lower="sms/mms"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Contact <a href="/docs/braze_support/">Braze Support</a> for assistance in understanding the reasons for delivery failures.</p>

<p><span class="calculation-line">Calculation: (Sends) - (Sends to Carrier)</span></p>

</div>

<div id='api_frosjaednzsw' class='api_div' data-search-keywords='delivery failures rcs'>
<h2 id="delivery-failures">Delivery Failures</h2>

<div class="api_tags" data-tags="RCS" data-tags-lower="rcs"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Contact <a href="/docs/braze_support/">Braze Support</a> for assistance in understanding the reasons for delivery failures.</p>

<p><span class="calculation-line">Calculation: (Sends) - (Sends to Carrier)</span></p>

</div>

<div id='api_olukdfypcabb' class='api_div' data-search-keywords='failed delivery rate sms/mms'>
<h2 id="failed-delivery-rate">Failed Delivery Rate</h2>

<div class="api_tags" data-tags="SMS/MMS" data-tags-lower="sms/mms"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Contact <a href="/docs/braze_support/">Braze Support</a> for assistance in understanding the reasons for delivery failures.</p>

<p><span class="calculation-line">Calculation: (Delivery Failures) / (Sends)</span></p>

</div>

<div id='api_zewlrkfdyora' class='api_div' data-search-keywords='direct opens ios push'>
<h2 id="direct-opens">Direct Opens</h2>

<div class="api_tags" data-tags="iOS Push" data-tags-lower="ios push"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Direct Opens) / (Deliveries)</span></p>

</div>

<div id='api_dwhcoyjtzgbb' class='api_div' data-search-keywords='emailable email'>
<h2 id="emailable">Emailable</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_ratgvyrpvqvq' class='api_div' data-search-keywords='errors webhook'>
<h2 id="errors">Errors</h2>

<div class="api_tags" data-tags="Webhook" data-tags-lower="webhook"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Errors are included in the <i>Sends</i> count but are not included in the <i>Unique Recipients</i> count.</p>

</div>

<div id='api_anfzphbyokhl' class='api_div' data-search-keywords='estimated real opens email'>
<h2 id="estimated-real-opens">Estimated Real Opens</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_dyfyqotmcyjv' class='api_div' data-search-keywords='failures whatsapp'>
<h2 id="failures">Failures</h2>

<div class="api_tags" data-tags="WhatsApp" data-tags-lower="whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Failures are included in the <i>Sends</i> count but not in the <i>Deliveries</i> count.&lt;/td&gt;</p>

<p><span class="calculation-line">Calculation (<i>Failure Rate</i>): (Failures) / (Sends)</span></p>

</div>

<div id='api_zwwsqkiwzsff' class='api_div' data-search-keywords='feature flag experiment performance feature flags'>
<h2 id="feature-flag-experiment-performance">Feature flag experiment performance</h2>

<div class="api_tags" data-tags="Feature Flags" data-tags-lower="feature flags"></div>

<p>Performance metrics for the message in a Feature Flag experiment. The specific metrics shown will vary depending on the messaging channel, and whether or not the experiment was a multivariate test.</p>

</div>

<div id='api_picaflpdbpds' class='api_div' data-search-keywords='hard bounce email'>
<h2 id="hard-bounce">Hard Bounce</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>When this occurs, Braze marks the email address as invalid but does not update the user’s <a href="/docs/user_guide/channels/email/subscriptions/">subscription status</a>. If an email receives a hard bounce, Braze stops any future requests to this email address.</p>

</div>

<div id='api_yxvnlxeucbgs' class='api_div' data-search-keywords='help sms/mms, rcs'>
<h2 id="help">Help</h2>

<div class="api_tags" data-tags="SMS/MMS, RCS" data-tags-lower="sms/mms, rcs"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>A user reply is measured anytime a user sends an inbound message within four hours of receiving your message.</p>

</div>

<div id='api_requdwlcaddv' class='api_div' data-search-keywords='influenced opens ios push, android push'>
<h2 id="influenced-opens">Influenced Opens</h2>

<div class="api_tags" data-tags="iOS Push, Android Push" data-tags-lower="ios push, android push"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Influenced Opens) / (Deliveries)</span></p>

</div>

<div id='api_cisaxacdbmvs' class='api_div' data-search-keywords='lifetime revenue content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line'>
<h2 id="lifetime-revenue">Lifetime Revenue</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, LINE" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_sizsflscuehi' class='api_div' data-search-keywords='lifetime value per user content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line'>
<h2 id="lifetime-value-per-user">Lifetime Value Per User</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, LINE" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_dbwlgnpbzwxa' class='api_div' data-search-keywords='average daily revenue content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line'>
<h2 id="average-daily-revenue">Average Daily Revenue</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, LINE" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_yayyjrzywahu' class='api_div' data-search-keywords='daily purchases content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line'>
<h2 id="daily-purchases">Daily Purchases</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, LINE" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_ymgesiysmkdc' class='api_div' data-search-keywords='daily revenue per user content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line'>
<h2 id="daily-revenue-per-user">Daily Revenue Per User</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, LINE" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_ihopharcuyso' class='api_div' data-search-keywords='machine opens email'>
<h2 id="machine-opens">Machine Opens</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This metric is tracked starting November 11, 2021 for SendGrid and December 2, 2021 for SparkPost. For Amazon SES, analytics will show up as <em>Opens</em>. However, bot filtering for clicks will be supported.</p>

</div>

<div id='api_ngocxumoggii' class='api_div' data-search-keywords='opens web push, ios push, android push'>
<h2 id="opens">Opens</h2>

<div class="api_tags" data-tags="Web Push, iOS Push, Android Push" data-tags-lower="web push, ios push, android push"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_pngrzdhnuxoe' class='api_div' data-search-keywords='opt-out sms/mms, rcs'>
<h2 id="opt-out">Opt-Out</h2>

<div class="api_tags" data-tags="SMS/MMS, RCS" data-tags-lower="sms/mms, rcs"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>A user reply is measured anytime a user sends an inbound message within four hours of receiving your message.</p>

</div>

<div id='api_cxzsubzvzgrb' class='api_div' data-search-keywords='other opens email'>
<h2 id="other-opens">Other Opens</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Note that a user can also open an email (such as the open counts toward Other Opens) before a Machine Opens count is logged. If a user opens an email once (or more) after a machine open event from a non-Apple Mail inbox, then the amount of times that the user opens the email is calculated toward Other Opens and only once toward Unique Opens.</p>

</div>

<div id='api_cwrdccdtsopu' class='api_div' data-search-keywords='pending retry email'>
<h2 id="pending-retry">Pending Retry</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_uhqflzlzvsju' class='api_div' data-search-keywords='primary conversions (a) or primary conversion event content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp'>
<h2 id="primary-conversions-a-or-primary-conversion-event">Primary Conversions (A) or Primary Conversion Event</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, WhatsApp" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<table class="reset-td-br-1 reset-td-br-2" aria-label="Primary Conversions (A) or Primary Conversion Event">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Email, Push, Webhooks</td>
      <td>After the initial send.</td>
    </tr>
    <tr>
      <td>Content Cards, In-app messages</td>
      <td>When the user views the Content Card or message for the first time.</td>
    </tr>
  </tbody>
</table>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Primary Conversions (A) or Primary Conversion Event</i>: Count</li>
        <li><i>Primary Conversions (A) %</i> or <i>Primary Conversion Event Rate</i>: (Primary Conversions) / (Unique Recipients)</li>
    </ul>
</span>

</div>

<div id='api_skgxllbdyrfo' class='api_div' data-search-keywords='reads whatsapp'>
<h2 id="reads">Reads</h2>

<div class="api_tags" data-tags="WhatsApp" data-tags-lower="whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_dpggcfwyvftp' class='api_div' data-search-keywords='read rate whatsapp'>
<h2 id="read-rate">Read Rate</h2>

<div class="api_tags" data-tags="WhatsApp" data-tags-lower="whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Reads with read receipts) / (Sends)</span></p>

</div>

<div id='api_bnxyraowacdr' class='api_div' data-search-keywords='received email, content cards, in-app message, web push, ios push, android push, sms/mms, whatsapp'>
<h2 id="received">Received</h2>

<div class="api_tags" data-tags="Email, Content Cards, In-App Message, Web Push, iOS Push, Android Push, SMS/MMS, WhatsApp" data-tags-lower="email, content cards, in-app message, web push, ios push, android push, sms/mms, whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<table class="reset-td-br-1 reset-td-br-2" aria-label="Received">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Content Cards</td>
      <td>Received when users view the card in the app.</td>
    </tr>
    <tr>
      <td>Push</td>
      <td>Received when messages are sent from the Braze server to the push provider.</td>
    </tr>
    <tr>
      <td>Email</td>
      <td>Received when messages are sent from the Braze server to the email service provider.</td>
    </tr>
    <tr>
      <td>SMS/MMS</td>
      <td>“Delivered” after the SMS provider receives confirmation from the upstream carrier and destination device.</td>
    </tr>
    <tr>
      <td>In-app message</td>
      <td>Received at the time of display based on the trigger action defined.</td>
    </tr>
    <tr>
      <td>WhatsApp</td>
      <td>Received at the time of display based on the trigger action defined.</td>
    </tr>
  </tbody>
</table>

</div>

<div id='api_cakbiqucnvzs' class='api_div' data-search-keywords='rcs rejections or sms rejections sms/mms, rcs'>
<h2 id="rcs-rejections-or-sms-rejections">RCS Rejections or SMS Rejections</h2>

<div class="api_tags" data-tags="SMS/MMS, RCS" data-tags-lower="sms/mms, rcs"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>As a Braze customer, rejections are charged toward your SMS allotment.</p>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Rejections</i>: Count</li>
        <li><i>Rejection Rate</i>: (Rejections) / (Sends)</li>
    </ul>
</span>

</div>

<div id='api_fuafgjritlif' class='api_div' data-search-keywords='revenue email'>
<h2 id="revenue">Revenue</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_mnjnfiiheshe' class='api_div' data-search-keywords='sent sms/mms'>
<h2 id="sent">Sent</h2>

<div class="api_tags" data-tags="SMS/MMS" data-tags-lower="sms/mms"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_zrffemdbmthx' class='api_div' data-search-keywords='sends content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, rcs, whatsapp, line'>
<h2 id="sends">Sends</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, RCS, WhatsApp, LINE" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, rcs, whatsapp, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This metric is provided by Braze. Note that upon launching a scheduled campaign, this metric will include all messages sent, regardless of whether they have been sent out yet due to rate limiting.</p>

<p><strong>Tip:</strong></p>

<p>For Content Cards, this metric is calculated differently depending on what you selected for <a href="/docs/user_guide/channels/content_cards/create_a_content_card/card_creation/">Card creation</a>:</p>

<ul>
  <li><strong>At launch or step entry:</strong> The number of cards created and available to be seen. This doesn’t count whether the users viewed the card.</li>
  <li><strong>At first impression:</strong> The number of cards displayed to users.</li>
</ul>

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_edsuclphjltg' class='api_div' data-search-keywords='messages sent content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp, line'>
<h2 id="messages-sent">Messages Sent</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, WhatsApp, LINE" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This metric is provided by Braze. Note that upon launching a scheduled campaign, this metric will include all messages sent, regardless of whether they have been sent out yet due to rate limiting.</p>

<p><strong>Tip:</strong></p>

<p>For Content Cards, this metric is calculated differently depending on what you selected for <a href="/docs/user_guide/channels/content_cards/create_a_content_card/card_creation/">Card creation</a>:</p>

<ul>
  <li><strong>At launch or step entry:</strong> The number of cards created and available to be seen. This doesn’t count whether the users viewed the card.</li>
  <li><strong>At first impression:</strong> The number of cards displayed to users.</li>
</ul>

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_qoorpkbpbekx' class='api_div' data-search-keywords='sends to carrier sms/mms'>
<h2 id="sends-to-carrier">Sends to Carrier</h2>

<div class="api_tags" data-tags="SMS/MMS" data-tags-lower="sms/mms"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Sends to Carrier</i>: Count</li>
        <li><i>Sends to Carrier Rate</i>: (Sends to Carrier) / (Sends)</li>
    </ul>
</span>

</div>

<div id='api_wagkfoynbvtu' class='api_div' data-search-keywords='soft bounce email'>
<h2 id="soft-bounce">Soft Bounce</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>If an email receives a soft bounce, we will usually retry within 72 hours, but the number of retry attempts varies from receiver to receiver.</p>

<p>Note that <em>Soft Bounces</em> differ from <em>Deferrals</em>. If no email is successfully delivered during this retry period, Braze sends one soft bounce event per attempted campaign send. Before February 25, 2025, these retries were counted as multiple soft bounces for one campaign send.</p>

<p>While soft bounces aren’t tracked in your campaign analytics, you can monitor the soft bounces in the <a href="/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/">Message Activity Log</a>. You can also exclude these users from your sending or look back at the amount of soft bounces from the last 30 days with the <a href="/docs/user_guide/audience/segments/segmentation_filters#soft-bounced">Soft Bounced segment filter</a>. In the Message Activity Log, you can also see the reason for the soft bounces and understand possible discrepancies between the “sends” and “deliveries” for your email campaigns.</p>

</div>

<div id='api_xobvhjdjwdrn' class='api_div' data-search-keywords='spam email'>
<h2 id="spam">Spam</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><strong>Note:</strong></p>

<p>Spam complaints are handled directly by email service providers and then relayed to Braze through a feedback loop. Most feedback loops only report a portion of the actual complaints, so the <em>Spam</em> metric often represents a fraction of the actual total. Only email service providers can view the true volume of spam complaints, which means <em>Spam</em> should be viewed as an indicative, not exhaustive, metric.</p>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Spam</i>: Count</li>
        <li><i>Spam %</i> or <i>Spam Rate %</i>: (Marked as Spam) / (Sends)</li>
    </ul>
</span>

</div>

<div id='api_ywkftgdhodao' class='api_div' data-search-keywords='survey page dismissals in-app message'>
<h2 id="survey-page-dismissals">Survey Page Dismissals</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_ahlapgvmawvz' class='api_div' data-search-keywords='survey submissions in-app message'>
<h2 id="survey-submissions">Survey Submissions</h2>

<div class="api_tags" data-tags="In-App Message" data-tags-lower="in-app message"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

</div>

<div id='api_dzgcdwallxac' class='api_div' data-search-keywords='total clicks email, content cards, sms/mms, line'>
<h2 id="total-clicks">Total Clicks</h2>

<div class="api_tags" data-tags="Email, Content Cards, SMS/MMS, LINE" data-tags-lower="email, content cards, sms/mms, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<table class="reset-td-br-1 reset-td-br-2" aria-label="Total Clicks">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>LINE</td>
      <td>Tracked after a minimum threshold of 20 messages per day has been reached. AMP emails include clicks recorded in both HTML and plaintext versions. This number may be artificially inflated by anti-spam tools.</td>
    </tr>
    <tr>
      <td>Banners</td>
      <td>The total number (and percentage) of users who clicked within the delivered message, regardless of whether the same user clicks multiple times.</td>
    </tr>
  </tbody>
</table>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b>Email:</b> (Total Clicks) / (Deliveries)</li>
        <li><b>Content Cards:</b> (Total Clicks) / (Total Impressions)</li>
        <li><b>SMS:</b> (Click Opens) / (Deliveries)</li>
    </ul>
</span>

</div>

<div id='api_dudychbxwpdz' class='api_div' data-search-keywords='total dismissals content cards'>
<h2 id="total-dismissals">Total Dismissals</h2>

<div class="api_tags" data-tags="Content Cards" data-tags-lower="content cards"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>If a user receives two different cards from the same campaign and dismisses both, this count will increase by two. Re-eligibility allows you to increment <em>Total Dismissals</em> once every time a user receives a card; each card is a different message.</p>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Total Dismissals:</i> Count</li>
        <li><i>Total Dismissal Rate:</i> Total Dismissals / Total Impressions</li>
    </ul>
</span>

</div>

<div id='api_zzpeyeerfwve' class='api_div' data-search-keywords='total impressions in-app message, content cards'>
<h2 id="total-impressions">Total Impressions</h2>

<div class="api_tags" data-tags="In-App Message, Content Cards" data-tags-lower="in-app message, content cards"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This number is a sum of the number of impression events that Braze receives from the SDKs.</p>

<table class="reset-td-br-1 reset-td-br-2" aria-label="Total Impressions">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Content Cards</td>
      <td>The total count of impressions logged for a given Content Card. This can increment multiple times for the same user.</td>
    </tr>
    <tr>
      <td>In-app messages</td>
      <td>If there are multiple devices and re-eligibility is off, the user should only see the in-app message once. Even if the user uses multiple devices, they will only see it on the first device that is targeted. This assumes that the profile has consolidated devices and a user has one user ID that they are logged into across devices. If re-eligibility is on, an impression is logged for every time that user sees the in-app message. For more details, refer to <a href="/docs/user_guide/channels/in_app_messages/reporting/">In-app message reporting</a>.</td>
    </tr>
  </tbody>
</table>

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_gdcqpbrwnnom' class='api_div' data-search-keywords='total opens email, ios push, android push, web push, line'>
<h2 id="total-opens">Total Opens</h2>

<div class="api_tags" data-tags="Email, iOS Push, Android Push, Web Push, LINE" data-tags-lower="email, ios push, android push, web push, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<table class="reset-td-br-1 reset-td-br-2" aria-label="Total Opens">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>LINE</td>
      <td>Tracked after a minimum threshold of 20 messages per day has been reached.</td>
    </tr>
    <tr>
      <td>AMP emails</td>
      <td>The total opens for the HTML and plaintext versions.</td>
    </tr>
  </tbody>
</table>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><b>Email <i>Total Opens</i>:</b> Count</li>
        <li><b>Email <i>Total Open Rate</i>:</b> (Opens) / (Deliveries)</li>
        <li><b>Web push <i>Total Opens</i>:</b> <i>Direct Opens</i> count</li>
        <li><b>Web push <i>Total Open Rate</i>:</b> (Total Opens) / (Deliveries)</li>
        <li><b>iOS, Android, and Kindle push <i>Total Opens</i>:</b> (Direct Opens) + (Influenced Opens)</li>
        <li><b>iOS, Android, and Kindle push <i>Total Open Rate</i>:</b> (Total Opens) / (Deliveries)</li>
    </ul>
</span>

</div>

<div id='api_lgitnrbueukr' class='api_div' data-search-keywords='total revenue content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp'>
<h2 id="total-revenue">Total Revenue</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, WhatsApp" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This metric is only available on Campaign Comparison Reports through the <a href="/docs/user_guide/analytics/reports/report_builder">Report Builder</a>.</p>

</div>

<div id='api_frkmoxejakvt' class='api_div' data-search-keywords='unique clicks email, content cards, line'>
<h2 id="unique-clicks">Unique Clicks</h2>

<div class="api_tags" data-tags="Email, Content Cards, LINE" data-tags-lower="email, content cards, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>This includes clicks on Braze-provided unsubscribe links.</p>

<table class="reset-td-br-1 reset-td-br-2" aria-label="Unique Clicks">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Email</td>
      <td>Tracked over a seven-day period.</td>
    </tr>
    <tr>
      <td>LINE</td>
      <td>Tracked after a minimum threshold of 20 messages per day has been reached.</td>
    </tr>
  </tbody>
</table>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Unique Clicks</i>: Count</li>
        <li><b>Content Cards</b> <i>Unique Clicks %</i> or <i>Unique Clicks Rate</i>: (Unique Clicks) / (Unique Impressions)</li>
        <li><b>Email</b> <i>Unique Clicks %</i> or <i>Unique Clicks Rate</i>: (Unique Clicks) / (Deliveries)</li>
    </ul>
</span>

</div>

<div id='api_krjjwyzbbnou' class='api_div' data-search-keywords='unique dismissals content cards'>
<h2 id="unique-dismissals">Unique Dismissals</h2>

<div class="api_tags" data-tags="Content Cards" data-tags-lower="content cards"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Unique Dismissals) / (Unique Impressions)</span></p>

</div>

<div id='api_utpmbndzbgbl' class='api_div' data-search-keywords='unique impressions in-app message, content cards'>
<h2 id="unique-impressions">Unique Impressions</h2>

<div class="api_tags" data-tags="In-App Message, Content Cards" data-tags-lower="in-app message, content cards"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<table class="reset-td-br-1 reset-td-br-2" aria-label="Unique Impressions">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>In-app messages</td>
      <td>Unique impressions can be incremented again on a new calendar day in your workspace’s time zone if re-eligibility is on and a user performs the trigger action. If re-eligibility is on, <i>Unique Impressions</i> = <i>Unique Recipients</i>. For more details, refer to <a href="/docs/user_guide/channels/in_app_messages/reporting/">In-app message reporting</a>.</td>
    </tr>
    <tr>
      <td>Content Cards</td>
      <td>The count should not increment the second time a user views a card.</td>
    </tr>
  </tbody>
</table>

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_pnkkqguvyser' class='api_div' data-search-keywords='unique opens email, line'>
<h2 id="unique-opens">Unique Opens</h2>

<div class="api_tags" data-tags="Email, LINE" data-tags-lower="email, line"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<table class="reset-td-br-1 reset-td-br-2" aria-label="Unique Opens">
  <thead>
    <tr>
      <th>Channel</th>
      <th>Additional information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Email</td>
      <td>Tracked over a 7 day period.</td>
    </tr>
    <tr>
      <td>LINE</td>
      <td>Tracked after a minimum threshold of 20 messages per day has been reached.</td>
    </tr>
  </tbody>
</table>

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Unique Opens</i>: Count</li>
        <li><i>Unique Opens %</i> or <i>Unique Open Rate</i>: (Unique Opens) / (Deliveries)</li>
    </ul>
</span>

</div>

<div id='api_ujwezzonfsnx' class='api_div' data-search-keywords='unique recipients all'>
<h2 id="unique-recipients">Unique Recipients</h2>

<div class="api_tags" data-tags="All" data-tags-lower="all"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p>Because a viewer can be a unique recipient every day, you should expect this to be higher than <i>Unique Impressions</i>. For Content Cards, each Content Card can only be received once, so viewing the same Content Card a second time, regardless of the day, will not increment this count.<br /><br />This number is received from Braze and is based on the <code class="language-plaintext highlighter-rouge">user_id</code>. Unique recipients are counted at the campaign or Canvas step level, not the <a href="https://braze.com/docs/api/identifier_types/#send-identifier">send identifier</a> level.</p>

<p><span class="calculation-line">Calculation: Count</span></p>

</div>

<div id='api_oozcozmllrof' class='api_div' data-search-keywords='unsubscribers or unsub email'>
<h2 id="unsubscribers-or-unsub">Unsubscribers or Unsub</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<span class="calculation-line">
    Calculation:
    <ul>
        <li><i>Unsubscribers</i> or <i>Unsub</i>: Count</li>
        <li><i>Unsubscribers %</i> or <i>Unsub Rate</i>: (Unsubscribes) / (Deliveries)</li>
    </ul>
</span>

</div>

<div id='api_gzestzyfdvxl' class='api_div' data-search-keywords='unsubscribes email'>
<h2 id="unsubscribes">Unsubscribes</h2>

<div class="api_tags" data-tags="Email" data-tags-lower="email"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: (Unsubscribes) / (Deliveries)</span></p>

</div>

<div id='api_cufhxlygqixd' class='api_div' data-search-keywords='variation content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp'>
<h2 id="variation">Variation</h2>

<div class="api_tags" data-tags="Content Cards, Email, In-App Message, Web Push, iOS Push, Android Push, Webhook, SMS/MMS, WhatsApp" data-tags-lower="content cards, email, in-app message, web push, ios push, android push, webhook, sms/mms, whatsapp"></div>

<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->

<p><span class="calculation-line">Calculation: Count</span></p>

</div>