# Create a campaign

> Use campaigns when you want to reach consumers with a single messaging step across one or more supported channels. For multi-step journeys, use [Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/).

## Prerequisites

To create and launch a campaign, you need "Edit Campaigns" and "Launch Campaigns" permissions. For a full list of workspace permissions and how they appear in the dashboard, refer to [Permissions](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/).

### Before you begin

- Build or choose the [segments](https://www.braze.com/docs/user_guide/audience/segments/) that define who should receive your messages.
- Review [Campaign basics](https://www.braze.com/docs/user_guide/messaging/campaigns/campaign_basics/) so messaging channels, delivery types, and conversion goals align with your use case.
- For a guided walkthrough of delivery, targeting, and conversions, take the [Campaign Setup](https://learning.braze.com/campaign-setup-delivery-targeting-conversions) Braze Learning course.

## Campaign composer

The campaign composer is where you define delivery, audiences, conversions, and launch settings. Decide whether you're creating a single-channel or multichannel campaign before you continue. 




A single-channel campaign reaches users through one messaging channel per launch. 

### What's different

#### Conversions and reporting {#single-channel-conversions}

For single-channel campaigns, Braze tracks [conversion events](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/) you assign to the campaign against sends from that channel. For attribution windows and counting rules, see [Conversion tracking rules](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/#conversion-tracking-rules).

Workspace [frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/) and send limits still apply.

### Create a single-channel campaign {#create-a-single-channel-campaign}

To create a campaign:

1. Go to **Messaging** > **Campaigns**.
2. Select **Create campaign**.
3. Select the [channel](https://www.braze.com/docs/user_guide/channels/) that fits your use case. 
4. On the [Compose step](#step-1-compose-messages), write and preview copy for that channel. 

Each campaign uses one channel type at a time. Add variants when you want to compare creative splits or run [A/B testing](https://www.braze.com/docs/user_guide/messaging/ab_testing/).




A multichannel campaign reaches users through more than one messaging channel in a single launch. For example, send an email and push notification together.

**Note:**


[In-app messages](https://www.braze.com/docs/user_guide/channels/in_app_messages/) aren't available in multichannel campaigns. Create a single-channel campaign or Canvas instead.



### What's different

#### Control groups {#multichannel-control-groups}

Campaign control groups compare variants within one channel (for example, Email A versus Email B). They aren't used to compare entire channels inside one multichannel campaign. To test channels, creative, or timing together across a journey, use [Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/).

#### Conversions and reporting {#multichannel-conversions}

For multichannel campaigns, Braze tracks [conversion events](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/) per channel. When a user converts after receiving messages on more than one channel, Braze can attribute that conversion across those channels. Conversion counts may exceed *Unique Users*, and rates may exceed 100%. For full rules, see [Conversion tracking rules](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/#conversion-tracking-rules).

Rate limits for sends that span channels are described in [Multichannel campaigns and Canvases](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/#multichannel-campaigns-and-canvases). For workspace-wide rules (including how multichannel sends count toward caps), refer to [Frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/).

### Create a multichannel campaign {#create-a-multichannel-campaign}

1. Go to **Messaging** > **Campaigns**.
2. Select **Create campaign**.
3. Select **Multichannel**.
4. On the [Compose step](#step-1-compose-messages), select **Add channel** and choose each channel you need. Select the channel icons to switch between composers while you write copy for each channel.




## Step 1: Compose messages {#step-1-compose-messages}

### Campaign details

Use the following fields to record metadata that helps your team find and manage the campaign.

| Field | Purpose |
| --- | --- |
| Name | Use a clear name that reflects the campaign goal. |
| Description | Optional. Explain intent or links to briefs for collaborators. |
| Team | Optional. Assign [Teams](https://www.braze.com/docs/user_guide/administer/global/user_management/teams/) so the right groups can edit or report on this send. |
| Tags | Optional. Add [tags](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/tags/) to filter in lists and tools such as [Report Builder](https://www.braze.com/docs/user_guide/analytics/reports/report_builder/). |
| Campaign ID | Where shown in the composer or summary, copy this identifier for API calls, reporting, and integrations that reference a specific campaign. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Campaign details" }

### Channels and editors

Compose channel-specific content in this step. For detailed guidance, see [Channels](https://www.braze.com/docs/user_guide/channels/) and open the article for the channel you selected. 

### Variants

Add variants when you want to compare creative or delivery splits. For background on experiments and controls, see [Multivariate and A/B testing](https://www.braze.com/docs/user_guide/messaging/ab_testing/).

**Tip:**


When each variant uses similar body content, compose the message **before** you add extra variants. Then use **Copy from Variant** from the **Add Variant** menu to reuse work across variants or channels.



## Step 2: Schedule delivery {#step-2-schedule-delivery}

Choose when users become eligible to receive the campaign:

| Delivery type | Summary |
| --- | --- |
| [Scheduled delivery](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/scheduled_delivery/) | Send at a specified time or cadence. |
| [Action-based delivery](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/) | Send when users perform behaviors or meet conditions you define. |
| [API-triggered delivery](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/api_triggered_delivery/) | Send when your systems call Braze to trigger the campaign for eligible users. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Step 2: Schedule delivery #step-2-schedule-delivery" }

For scheduling concepts across Braze, see [Schedule your campaign](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/).

### Delivery controls

Depending on delivery type, you can adjust [re-eligibility](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/re_eligibility/) (whether users may enter the campaign again) and respect workspace [frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/) rules. You may also configure [quiet hours](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/quiet_hours/) so messages don't send during restricted windows.

## Step 3: Target audiences {#step-3-target-audiences}

On **Target Audiences**, define who is eligible to receive the campaign. For full targeting options, UI walkthroughs, and screenshots, see [Target users](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/target_users/).

### Targeting options

In this section, you can target users by choosing segments or filters to narrow down your audience. Eligible users still need to meet the trigger or criteria you define in the **Schedule Delivery** step. The target audience is like a waiting room—only people already inside can move forward when the next action happens.

Workspace [suppression lists](https://www.braze.com/docs/user_guide/audience/suppression_lists/) automatically exclude listed users unless you allow an exception for this campaign.

### Audience summary

After adding segments or filters, the **Audience Summary** gives preview of what that segment population looks like, including how many users within that segment are reachable through your selected channels. Reachable counts reflect your workspace data, channel setup, and filters. Keep in mind that exact segment membership is always calculated before the message is sent. For very large audiences, Braze may show estimates until you calculate exact statistics.

### User Lookup

After adding segments or filters, you can test if your audience is set up as expected by looking up a user to confirm if they match the segment criteria. To do so, search for a user's `external_id` or `braze_id` in the **User Lookup** section. You can't search by email address here. See [Testing segments](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/#testing-segments) for more.

When a user matches the segment, filter, and app criteria, an alert states so. When a user doesn't match part or all of the segment, filter, or app criteria, the missing criteria is listed for troubleshooting purposes.

### Send to these users

For subscription-based channels (email, SMS, and similar), use **Send to these users** to only send your campaign to users who have a specific subscription status, such as those who are subscribed and opted in to email.

### Limit send volume

You can limit the total number of users that receive your message. This serves as a check that is independent of your campaign filters. For details, refer to [Setting a maximum user cap](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping#setting-a-maximum-user-cap).

### Limit the rate at which this campaign sends

If you anticipate large campaigns driving a spike in user activity and overloading your servers, you can specify a per-minute rate limit for sending messages, which means Braze sends no more than your rate-limited setting within a minute. For details, refer to [Delivery speed rate limiting](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/#delivery-speed-rate-limiting)

### A/B testing

You can create a [multivariate or A/B test](https://www.braze.com/docs/user_guide/messaging/ab_testing/) for any campaign that targets a single channel and single device. For example, if you want to use multivariate or A/B testing for a push campaign, you can target only iOS devices or only Android devices—not both device types in the same campaign.

For push, email, and webhook campaigns scheduled to send once, you can also use an [optimization](https://www.braze.com/docs/user_guide/messaging/ab_testing/optimizations). An optimization reserves a portion of your target audience from the A/B test and holds them for a second optimized send based on the results from the first test.

## Step 4: Assign conversion events {#step-4-assign-conversion-events}

[Conversion events](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/) measure outcomes after a user receives your campaign (or enters the control group). Braze defaults to **Starts Session** within a short window (three days). You can define conversion events that match your KPIs, up to four events per campaign.

After you launch, use the [Conversions dashboard](https://www.braze.com/docs/user_guide/analytics/dashboards/conversions/) to analyze conversion trends across multiple campaigns or Canvases, compare channels, and adjust date ranges, attribution methods, and breakdowns in one place.

**Important:**


You can't add or remove conversion events after the campaign launches. Confirm events before you launch.



## Step 5: Review summary and launch {#step-5-review-summary-and-launch}

The **Review Summary** step shows scheduling, audience, variants, and messaging choices. Before you launch your campaign:

1. Confirm segments, variants, and delivery settings match your intent.
2. [Send test messages](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/sending_test_messages/) to validate rendering and behavior on your test devices or internal recipients.

When you're ready, select **Launch Campaign**.

### Approvals

If your workspace uses approvals, a teammate with permission to approve campaigns must approve before launch. For more information, see [Approvals for campaigns and Canvases](https://www.braze.com/docs/user_guide/messaging/governance/approvals/).

## Related articles

- [Design and edit](https://www.braze.com/docs/user_guide/messaging/design_and_edit/)
- [A/B tests](https://www.braze.com/docs/user_guide/messaging/ab_testing/)
- [Know before you send](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/know_before_you_send) 
- [Campaign analytics](https://www.braze.com/docs/user_guide/analytics/reports/campaign_analytics/)