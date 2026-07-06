# Frequently asked questions

> This article provides answers to some frequently asked questions about campaigns.

### How do I create a multichannel campaign?

See [Multichannel campaigns](https://www.braze.com/docs/user_guide/messaging/campaigns/creating_campaign/#multichannel-campaigns) in **Create a campaign** for setup steps and supported channels.

### Can I add a control group to my multichannel campaign?

See [Control groups](https://www.braze.com/docs/user_guide/messaging/campaigns/creating_campaign/#multichannel-control-groups) in **Create a campaign**. For cross-channel testing, use [Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/).

### What are some ways I can start testing and optimizing campaigns?

Multivariate campaigns and running Canvases with multiple variants are a great way to start! For example, you can run a [multivariate campaign](https://www.braze.com/docs/user_guide/messaging/ab_testing/) to test out one message that has different copies or subject lines. Canvases with multiple variants can help test entire workflows.

### Why did the open rate for my campaign decrease?

Low open rates aren't always correlated to a technical issue. There may be issues with email clipping, which results in a missing tracking pixel. However, it's also possible that fewer users are opening their emails due to the content or changes in audience size. 

### How are campaign audiences evaluated?

By default, campaigns check audience filters at entry time. For action-based campaigns with a delay, there is an option to re-evaluate segment criteria at the send time to ensure users are still part of the target audience when the message is sent. 

### Why is there a difference between the number of unique recipients and the number of sends for a given campaign or Canvas?

One potential explanation could be the campaign or Canvas has re-eligibility turned on, which means users who qualify for the segment and delivery settings will be able to receive the message more than once. If re-eligibility is not turned on, then the probable explanation for the difference between sends and unique recipients may be due to users having multiple devices, across platforms, associated with their profiles. 

For example, should you have a Canvas that has both iOS and web push notifications, a given user with both mobile and desktop devices could receive more than one message.

### Why is _Unique Recipients_ higher than the number of users I targeted?

_Unique Recipients_ can be higher than the audience you expected because Braze tracks unique daily recipients for reporting. That lets Braze attribute conversions inside the conversion window each time a user receives the message, instead of collapsing multiple receives into one lifetime count (which would skew conversion math).

For example, if a user receives a campaign on Monday and again on Friday and converts after each send, Braze can report that as two receives and two conversions. If Braze only counted one lifetime "unique" across both sends, you'd either drop a valid conversion or double-count against one recipient, which makes campaign performance harder to read.

The same pattern applies to recurring campaigns and to re-eligibility: if two users each receive a recurring send today and again tomorrow, _Unique Recipients_ counts four daily recipient rows, not two profiles.

### Why can the number of conversions exceed the number of unique users for multichannel campaigns?

See [Conversions and reporting](https://www.braze.com/docs/user_guide/messaging/campaigns/creating_campaign/#multichannel-conversions) in **Create a campaign** and [Conversion tracking rules](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/#conversion-tracking-rules) in **Conversion events**.

### Why does my campaign have a smaller reachable user base than the segment that I'm using for the campaign?

If you have a [Global Control Group](https://www.braze.com/docs/user_guide/audience/global_control_group/) set up, this will prevent a percentage of your reachable audience from receiving campaigns. This means that the number of reachable users for your segment can sometimes be larger than the number of reachable users for your campaign, even if the campaign is using that same segment.

### What does local time zone delivery offer?

Local time zone delivery allows you to deliver messaging campaigns to a segment based on a user's individual time zone. Without local time zone delivery, campaigns will be scheduled based on your company's time zone settings in Braze. 

For example, a London-based company sending a campaign at 12 pm will reach users on the west coast of America at 4 am. If your app is only available in certain countries, this may not be a risk for you. Otherwise, we highly recommend avoiding sending early morning push notifications to your user base.

### How does Braze recognize a user's time zone?

Braze will automatically determine a user's time zone from their device. This ensures time zone accuracy and full coverage of your users. Users created through the User API or otherwise without a time zone will have your company's time zone as their default time zone until they are recognized in your app by the SDK. 

You can check your company's time zone in your [company settings](https://www.braze.com/docs/user_guide/administer/global/admin_settings/) on the dashboard.

### When does Braze evaluate users for local time zone delivery?

Braze evaluates users for their entry eligibility at:

- Samoa time (UTC+13) on the scheduled day
- The local time of the scheduled day

For a user to be eligible for entry, they must be eligible for both checks. For example, if a Canvas is scheduled to launch on August 7, 2021 at 2 pm local time zone, then targeting a user located in New York would require the following checks for eligibility:

- New York on August 6, 2021 at 9 pm
- New York on August 7, 2021 at 2 pm

To enter, a user must match your audience and filters at both evaluation times. If the user is not eligible at the first check, Braze does not run the second check. There is no minimum length of time that a user must have been in the segment before launch. Only eligibility at each check matters.

This evaluation behavior is separate from [how far in advance you schedule the campaign in the dashboard](#how-do-i-schedule-a-local-time-zone-campaign). Scheduling at least 24 hours ahead is a recommendation because it helps messages deliver throughout the full 24-hour local time zone window, not a requirement that each user has been in the audience for 24 hours.

#### Examples

For example, if a campaign is scheduled to be delivered at 7 pm UTC, we start queuing the campaign sends as soon as a time zone is identified (such as Samoa). This means we're getting ready to send the message, not sending the campaign. If users don't match any filters when we check eligibility, they won't fall into the target audience.

As another example, say you want to create two campaigns scheduled to send on the same day—one in the morning and one in the evening—and add a filter that users can only receive the second campaign if they've already received the first. With local time zone delivery, some users may not receive the second campaign. This is because we check eligibility when the user's time zone is identified, so if the scheduled time hasn't occurred in their time zone yet, they haven't received the first campaign, meaning they won't be eligible for the second campaign.

The following timeline assumes a segment definition that includes a time-limited membership window. In this example, users exit the segment 24 hours after they join. That filter behavior is one reason a user can pass the first check and fail the second.

![Timeline of a user entering the segment before the first check, then leaving before the second.](https://www.braze.com/docs/assets/img/local_time_zone_diagram.png?1cffbe31e55ccd8e4a4e2b1762fba5a5)

**Timeline description**



1. User A enters the segment at 6:59 PST (4:59 Samoan).
2. Braze checks for segment membership at 7 Samoan to determine which users are eligible to receive the campaign in the next 24 hours. User A is in the segment at this point.
3. The segment has a 24 hour window, so User A exits the segment 24 hours after they joined: 6:59 PST (4:59 Samoan).
4. The local time campaign sends at 7 PST, but User A has already exited the segment.




### How do I schedule a local time zone campaign?

The previous section describes when Braze evaluates eligibility for local time zone delivery (the two checks). This section describes when you set the campaign schedule in the dashboard (scheduling lead time) and which users still receive the message if you schedule with less than 24 hours' notice.

When scheduling a campaign, choose to send it at a designated time and then select **Send campaign to users in their local time zone**.

Braze highly recommends that all local time zone campaigns be scheduled 24 hours in advance. Since such a campaign needs to send over an entire day, scheduling it 24 hours in advance ensures that your message will reach your entire segment. However, you can schedule these campaigns less than 24 hours in advance if necessary. Keep in mind that Braze will not send messages to any users who have missed the send time by more than 1 hour. 

For example, if it is 1 pm and you schedule a local time zone campaign for 3 pm, then the campaign will immediately send to all users whose local time is between 3 pm and 4 pm, but not to users whose local time is 5 pm. In addition, the send time you choose for your campaign needs to have not yet occurred in your company's time zone.

Editing a local time zone campaign that is scheduled less than 24 hours in advance will not alter the message's schedule. If you decide to edit a local time zone campaign to send at a later time (for instance, 7 pm instead of 6 pm), users who were in the targeted segment when the original send time was chosen will still receive the message at the original time (6 pm). If you edit a local time zone to send at an earlier time (for instance, 4 pm instead of 5 pm), then the campaign will still send to all segment members at the original time (5 pm). 

**Note:**


For Canvas components, users do not need to be in the component for 24 hours to receive the next component in the user journey for local time zone delivery. 



If you have allowed users to become re-eligible for the campaign, then they will receive it again at the original time (5 pm). For all subsequent occurrences of your campaign, however, your messages are only sent at your updated time.

### When do changes to local time zone campaigns take effect?

Target segments for local time zone campaigns should include at least a 48-hour window for any time-based filters to guarantee delivery to the entire segment. For example, consider a segment targeting users on their second day with the following filters:

- First used app more than 1 day ago
- First used app less than 2 days ago

Local time zone delivery may miss users in this segment based on the delivery time and the users' local time zone. This is because a user can leave the segment by the time their time zone triggers delivery.

### What changes can I make to scheduled campaigns ahead of launch?

When the campaign is scheduled, you must make edits to anything other than the message composition before we enqueue the messages to send. As per all campaigns, you can't edit conversion events after launch.

### I updated my scheduled campaign. Why didn't it launch?

This can happen when a campaign is scheduled to launch at the exact time that it was updated. For example, if it's currently 3:10 pm and you changed the campaign to launch at 3:10 pm and selected **Update campaign**, it's now past 3:10 pm, meaning the scheduled time for launch has passed. Instead of scheduling the campaign for the same time, select **Send as soon as campaign launch**.

### What is the "safe zone" before messages on a scheduled campaign are enqueued?

We recommend making changes to messages within the following times:

- **One-time scheduled campaigns:** Edit up until the scheduled send time.
- **Recurring scheduled campaigns:** Edit up until the scheduled send time.
- **Local send time campaigns:** Edit up to 24 hours before the scheduled send time.
- **Optimal send time campaigns:** Edit up to 24 hours before the day the campaign is scheduled to send.

If you make changes to your message outside of these recommendations, you may not see the updates reflected in the message sent. For example, if you edit the send time three hours before a campaign is scheduled to send at 12 pm local time, the following may occur:

- Braze does not send messages to any users who have missed the send time by more than one hour.
- Pre-enqueued messages may still be sent at the originally enqueued time, rather than the adjusted time.

If you need to make changes, we recommend stopping the current campaign (this cancels any enqueued messages). You can then duplicate the campaign, make the changes as necessary, and launch the new campaign. You may need to exclude users from this campaign who have already received the first campaign. Make sure to re-adjust campaign schedule times to allow for time zone sending.

### Why did no users enter my daily scheduled campaign on Daylight Saving Time day?

On Daylight Saving Time (DST) transition days, daily scheduled campaigns can run up to one hour earlier or later than usual, depending on whether clocks spring forward or fall back. If your segment relies on custom attributes or events with timestamps that fall within one hour of the scheduled send time, those users may not yet qualify when the campaign evaluates eligibility on DST day.

For example, suppose users typically receive a custom attribute update at 3 pm UTC, and your campaign runs daily at 10:30 am in New York (Eastern Time). While New York is on standard time (UTC-5), 10:30 am ET corresponds to 3:30 pm UTC, so the campaign runs after the attribute is logged. When New York moves to daylight time (UTC-4), 10:30 am ET corresponds to 2:30 pm UTC, so on the spring-forward DST day the campaign can run before the 3 pm UTC attribute update. Because the qualifying attribute doesn't exist yet, those users are filtered out. If re-eligibility is turned off, users who entered on previous days can't re-enter, resulting in zero entries for that day.

To avoid this, ensure your custom attribute or event updates occur more than one hour before the campaign's scheduled send time.

### Why does the number of users entering a campaign not match the expected number?

The number of users entering a campaign may differ from your expected number because of how audiences and triggers are evaluated. In Braze, an audience is evaluated before the trigger (unless using a [change in attribute](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/attribute_triggers#change-custom-attribute-value) trigger). This will cause users to drop out of the campaign if they're not initially part of your selected audience before any trigger actions are evaluated.

**Tip:**


For further assistance with campaign troubleshooting, be sure to contact Braze Support within 30 days of your issue's occurrence, as we only have the last 30 days of diagnostic logs.



### What is the difference between the CSV Export User Data and CSV Export Email Address options on my campaign analytics page?

Selecting the **CSV Export Email Addresses** option downloads data for only users with email addresses. For example, if you have a segment of 100,000 users, but only 50,000 of those users have email addresses, and you click **CSV Export Email Addresses**, the export contains only 50,000 rows of data. In comparison, selecting **CSV Export User Data** exports all user data.

### Can I search for a campaign by its API identifier?

Yes, use the filter `api_id:YOUR_API_ID` on the **Campaigns** page to search for a campaign by its API identifier. Refer to [searching for campaigns](https://www.braze.com/docs/user_guide/messaging/campaigns/manage_campaigns/search_campaigns/) to learn more.

### Why does whitespace appear differently in input fields versus displayed text? 

Whitespace handling differs between input fields and displayed text components because of CSS styling. In text components with the default `white-space: normal` CSS, multiple consecutive spaces collapse into a single space when displayed. This is standard HTML behavior for rendered text. 

Input fields preserve multiple spaces exactly as you enter them, because you need to see and edit the exact spacing for accurate data entry. This means that text with multiple spaces may appear differently when viewed in an input field (where all spaces are preserved) versus when displayed in other parts of the dashboard (where CSS may collapse multiple spaces). 

For example, if you enter a campaign name or UTM parameter with multiple spaces in an input field, you see all spaces preserved. However, when that same text appears in search results, campaign lists, or other text components, multiple spaces may appear as a single space because of CSS whitespace handling. 

### What is the difference between API campaigns and API-triggered campaigns?

API-triggered campaigns allow you to manage campaign copy, multivariate testing, and re-eligibility rules within the Braze dashboard while triggering the delivery of that content from your own servers and systems. These messages can also include additional data to be templated into the messages in real time.

API campaigns are used to track the messages sent using the API. Unlike most campaigns, you don't specify the message, recipients, or schedule but instead pass the identifiers into your API calls. 

### How can I confirm if my users received an API-triggered campaign?

You can [create a segment](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/) using the **Received Campaign** filter, then select the specific API-triggered campaign you want to verify. After you save the segment, use the [`/users/export/segment` endpoint](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_segment/) to export the users in that segment.

### Can I delete a campaign?

No, but you can [archive a campaign](https://www.braze.com/docs/user_guide/messaging/governance/archiving/).

### What is the difference between action-based and API-triggered campaigns?

<style>
table th:nth-child(1) {
    width: 50%;
}
table th:nth-child(3) {
    width: 50%;
}
</style>

#### Action-based

Action-based delivery campaigns or event-triggered campaigns are very effective for transactional or achievement-based messages and allow you to trigger them to send after a user completes a certain event. 

| Pros | Cons | 
| ---- | ---- |
| • Visibility of incoming JSON payloads into the platform (if event triggered by test user) via the **Message Activity Log**<br><br>• Personalization elements are included in the custom event properties<br><br>• Custom event can be used to create Segments of users eligible for the message | • Consumes data points |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Action-based" }

#### API-triggered

API-triggered and server-triggered campaigns are ideal for handling more advanced transactions, allowing you to trigger the delivery of campaign content from your own servers and systems. The API request to trigger the message can also include additional data to be templated into the message in real time.

| Benefits | Considerations | 
| ---- | ---- |
| • Does not log data points<br><br>• Personalization elements are included in the JSON payload properties | • Does not allow you to create a segment of users eligible for the message in the JSON payload properties<br><br>• Not able to see incoming JSON payloads with the **Message Activity Log**|
{: .reset-td-br-1 .reset-td-br-2 aria-label="API-triggered" }

### What should I include when submitting a support ticket for a "Request Timed Out" error?

If you encounter a "Request Timed Out" error while creating or editing a campaign or Canvas and need to contact [Braze Support](https://www.braze.com/docs/braze_support/), include the following information to help speed up resolution:

- **Screen recording:** A recording of the steps you took before seeing the error, including any page transitions.
- **Timestamp and time zone:** The exact time the error occurred and your time zone.
- **Browser and version:** The browser you're using (for example, Chrome 120, Safari 17) and whether you've tried reproducing the error in a different browser.
- **Steps to reproduce:** A clear description of the actions that trigger the error, including any specific campaign or Canvas settings involved.
- **Network logs (optional):** Open your browser developer tools (**Network** tab), reproduce the error, and export the network log as a HAR (HTTP Archive) log. This helps the support team identify which API call is timing out.

### Why don't my send analytics match the maximum recipient limit I set?

If you add or change a maximum recipient limit on an active campaign, the limit may not be reflected in your send analytics for the following reasons:

- **Limit added post-launch:** If the maximum recipient limit is not set when the campaign launches, messages that are already enqueued before you apply the limit are still sent. The limit only takes effect for sends that you queue after you save the change.
- **Rate limiting interaction:** If a campaign is also rate-limited, messages may be distributed over a longer time window. The maximum recipient limit is evaluated when messages are enqueued, not when they are delivered. If the limit is changed while messages are already in the queue, the original limit applies to those messages.
- **Recurring campaigns:** For recurring campaigns, each scheduled send evaluates the maximum recipient limit independently. Changing the limit between sends does not retroactively adjust previous send counts.

To avoid misalignment, set the maximum recipient limit before launching the campaign and avoid modifying it while sends are in progress.

### Why are sends lower than the estimated audience size?

Several factors can cause the number of sends to be lower than the estimated audience size:

- **Action-based delivery:** Users only generate sends after they perform the trigger, so sends accumulate over time and can trail the upfront estimate shown when you first built the campaign.
- **Audience edits after launch:** Changing entry or target filters after launch can leave the **Estimated audience** snapshot out of sync with who still qualifies on later sends (for example, when users aren't eligible to re-enter).
- **Audience Paths step:** For Canvas, an [Audience Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/audience_paths/) step only messages users who match the highest-priority branch they qualify for, which can reduce sends versus a flat segment count.
- **Control groups:** If a [Global Control Group](https://www.braze.com/docs/user_guide/audience/global_control_group/) or campaign-level control group is in use, a portion of the audience is withheld from delivery.
- **Delivery timing and windows:** For local time zone or scheduled campaigns, users must qualify at both entry and send time; users in certain time zones may fall outside the delivery window.
- **Email deduplication:** Your campaign or Canvas targets multiple users with matching emails, so a random user with that email address is chosen at the time of send. The message only sends once and is deduplicated so that it doesn’t send to the same email multiple times, but your estimated audience size includes all users.
- **Email deliverability filters:** For email campaigns, Braze excludes users who have hard-bounced, unsubscribed from emails, been marked as spam, have no email address on their profile, or are not subscribed to a required subscription group. These checks run at send time, so a user present in your segment can still be excluded from the actual send count.
- **Global frequency capping:** Workspace-level caps can prevent eligible users from receiving another message in the same window, which lowers realized sends.
- **Newly imported users:** Profiles that just became eligible may not receive until the next evaluation or send pass, so counts catch up on a later run.
- **Push reachability:** For push campaigns, confirm the audience is push-enabled for the correct app. If you don't filter for push-enabled users, the estimated audience can include profiles that can't receive push. Check **Reachable users** in the **Target Users** step for a closer operational estimate.
- **Rate limiting:** If rate limiting is applied, messages are distributed over time and some sends may be deferred or not yet reflected in the count.
- **Re-eligibility windows:** Users who aren't re-eligible yet won't receive again during the cooldown, so sends fall below the estimated audience size for that period.
- **Reporting window:** The analytics time range may not include every send.
- **Segment re-evaluation:** For action-based or scheduled campaigns that re-evaluate at send time, users who were in the segment when the campaign was enqueued may no longer qualify when the message is actually sent.
- **Send caps:** A Maximum number of users (or similar cap) in **Target Audiences** stops delivery when the cap is hit.
- **Strict device or browser filters:** Filters that only match the newest app versions or browsers shrink the reachable set at send time compared to a broad segment preview.

### Where are frequently asked questions about global frequency capping?

For questions about calendar days, silent push, webhooks, Canvas behavior, and related topics, see the [Frequently asked questions](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/faq/) for [Rate limiting and frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/).

