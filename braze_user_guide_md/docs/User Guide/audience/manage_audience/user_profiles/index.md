# User profiles

> User profiles are a great way to find information about specific users. All persistent data associated with a user is stored in their user profile.

## Access profiles

To access a user's profile, go to the **Search Users** page and search for a user by any of the following:

- External user ID
- Braze ID
- Email
- Phone number
- Push token
- User alias with the format "[user_alias]:[alias_name]", such as "amplitude_id:user_123"

If a match is found, you can view the information you've recorded for this user with the Braze SDK. Otherwise, if your search returns multiple user profiles, you can merge each profile individually or perform a bulk user merge. For a full walkthrough, see [Merge duplicate users](https://www.braze.com/docs/user_guide/audience/manage_audience/merge_duplicate_users/).

**Important:**


When a phone number is used in the search, it is changed into [`E.164`](https://en.wikipedia.org/wiki/e.164) format. Users whose phone numbers cannot be changed into `E.164` format (for example, because the phone number has an invalid country code or area code) cannot be searched by phone number.



![Search results with a banner that reads "Multiple users match your search criteria" and two buttons labeled Previous and Next.](https://www.braze.com/docs/assets/img_archive/User_Search_Nonunique.png?3e8d565dbd2240f02df9e8fbd505e852){: style="max-width:60%;"}

## Use cases

User profiles are a great resource for troubleshooting and testing because you can easily access information about a user's engagement history, segment membership, device, and operating system.

For example, if a user reports a problem and you aren't sure what device and operating system they are using, you can use the [Overview tab](#overview-tab) to find this information (as long as you have their email or user ID). You can also view a user's language, which could be helpful if you're troubleshooting a [multi-lingual campaign](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/localization/) that didn't behave as expected.

You can use the [Engagement tab](#engagement-tab) to verify whether a certain user received a campaign. In addition, if this particular user did receive the campaign, you can see when they received it. You can also verify whether a user is in a certain segment and whether a user is opted in to push, email, or both. This information is useful for troubleshooting purposes. For example, you should check this information if a user doesn't receive a campaign that you expected them to receive or receives a campaign that you did not expect them to receive.

## Elements of user profile

There are four main sections of a user's profile.

- **Overview:** Basic information about the user, session data, custom attributes, custom events, purchases, and the most recent device that the user logged into.
- **Engagement:** Information about the user's contact settings, campaigns received, segments, communication stats, install attribution, and random bucket number.
- **Messaging History:** Recent messaging-related events for this user from the past 30 days.
- **Feature Flags Eligibility:** Validate which feature flags a user is currently eligible for across rollouts, canvas steps, and experiments. 

### Overview tab {#overview-tab}

The **Overview** tab contains basic information about a user and their interactions with your app or website.

| Overview category | Contains |
| --- | --- |
| Profile | Gender, age group, location, language, locale, time zone, and birthday. |
| Sessions overview | How many sessions they had, when their first and last sessions were, and on which apps. |
| Custom attributes | Which custom attributes are attributed to this user and their associated value, including nested custom attributes. |
| Recent devices | How many devices they logged in on, details on each device, and their associated advertising IDs (if any). |
| Custom events | Which custom events this user has performed, how many times, and when they last performed each event. |
| Purchases | Lifetime revenue attributed to this user, their last purchase, total number of purchases, and a list of each purchase. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Overview tab #overview-tab" }

For more information on this data, see [SDK data collection](https://www.braze.com/docs/user_guide/data/unification/user_data/sdk_data_collection/).

![The Overview tab of a user profile.](https://www.braze.com/docs/assets/img_archive/user_profile2.png?148abecbaafc1146a297ca95ab42d5b8)

### Engagement tab {#engagement-tab}

The **Engagement** tab contains information about a user's interactions with the messages you sent them using Braze.

| Engagement category | Contains |
| --- | --- |
| Contact settings | Subscription status for email, SMS, and push, and the subscription groups this user is associated with for these three channels. This section also includes changelog information for push tokens. Refer to [email](https://www.braze.com/docs/user_guide/channels/email/subscriptions/), [SMS](https://www.braze.com/docs/sms_rcs_subscription_groups/), and [push](https://www.braze.com/docs/user_guide/channels/push/push_setup/push_subscription_states/) for information on how subscriptions and opt-ins are set. |
| Campaigns received | **Campaigns received** reflects channel-specific send and view timing. Most channels record a send when Braze passes the message to the delivery provider, even when the message is not ultimately delivered. **Content Cards** are different: campaigns appear here only after the user views the card in the app. For a breakdown by channel, see [When campaigns appear in Campaigns received](#when-campaigns-appear-in-campaigns-received). When a message is received, opened, or clicked, Braze updates data for all profiles that share the same channel identifier as the profile that logged the interaction (for example, the same email address for email, or the same phone number for SMS or WhatsApp). Users who share an identifier with someone who received, opened, or clicked the message can match this filter even if they were not originally in the campaign or were not directly sent the message.<br><br> Select a campaign from the list to view it. |
| Segments | Segments this user is included in. Select a segment from the list to view it. |
| Communication stats | When this user last received messages from you from each channel. |
| Install attribution | Information about how and when a user installed your app. Learn more about [understanding user installs](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies/install_attribution/). |
| Miscellaneous | The user's [random bucket number](https://www.braze.com/docs/user_guide/messaging/ab_testing/concepts/random_bucket_numbers/). |
| Canvas messages received | Canvas messages this user has received and when. Send timing follows the same channel rules as **Campaigns received**; see [When campaigns appear in Campaigns received](#when-campaigns-appear-in-campaigns-received). When a message is received, opened, or clicked, Braze updates data for all profiles that share the same channel identifier as the profile that logged the interaction (for example, the same email address for email, or the same phone number for SMS or WhatsApp). Users who share an identifier with someone who received, opened, or clicked the message can match this filter even if they were not originally in the campaign or were not directly sent the message.<br><br> Select a message from the list to view it. |
| Predictions | [Churn prediction](https://www.braze.com/docs/user_guide/brazeai/predictive_suite/predictive_churn/) and [event prediction](https://www.braze.com/docs/user_guide/brazeai/predictive_suite/predictive_events/) scores for this user. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Engagement tab #engagement-tab" }

### When campaigns appear in Campaigns received {#when-campaigns-appear-in-campaigns-received}

In general, Braze lists a campaign under **Campaigns received** after it attempts to send the message. A delivery to the user's device or inbox is not required for a send to be logged. **Canvas messages received** follows the same channel-specific rules for each Canvas message type.

- **Email:** Braze logs a send when the message is handed off to your email service provider (ESP). After that handoff, the message is not aborted because of Liquid logic, rate limiting, or the user being marked as unreachable. The next events are often a delivery or a bounce.
- **Push:** Braze logs a send when the message is handed off to the push provider (for example, Apple Push Notification service (APNs) or Firebase Cloud Messaging (FCM)). The provider usually tries to deliver immediately; if the device is unavailable (for example, offline), the provider may retry until the message expires.
- **In-app messages:** Braze logs a send when the campaign is launched.
- **Content Cards:** When Braze records a _Sent_ event depends on delivery type and your **Card Creation** setting. A Content Card campaign appears under **Campaigns received** on the user profile only after the user views the card in the app. For the full breakdown, see [When sends are logged](https://www.braze.com/docs/user_guide/channels/content_cards/reporting/#when-sends-are-logged) and [Campaigns Received and retargeting filters](https://www.braze.com/docs/user_guide/channels/content_cards/reporting/#campaigns-received-and-retargeting-filters) in the Content Card reporting article.
- **SMS, WhatsApp, and webhooks:** Braze logs a send when the message enters the delivery path for that channel (for example, the SMS or WhatsApp provider, or your webhook endpoint).

**Note:**


These descriptions cover when a send is logged for **Campaigns received**. They are separate from [message aborts](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/aborting_messages/) that can stop a message before it reaches a provider.



![The Engagement tab of a user profile displaying their contact settings and communication statistics.](https://www.braze.com/docs/assets/img_archive/profiles_engagement_tab.png?308b978aab12e87f79677f25a8468038)

### Messaging History tab

The **Message History** tab of the user profile shows recent messaging-related events (about 40) for an individual user from the past 30 days. These events include the messages that the user was sent, received, interacted with, and more. 

**Note:**


The data in this tab isn't updated after a user is merged. Additionally, any events associated with messages sent through API (for example, the [/messages/send endpoint](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_messages/#creating-new-users-with-api-sends)) do not appear in this tab if there is no campaign ID specified in those sends.



![The Messaging History tab showing which campaigns and Canvases a user has received.](https://www.braze.com/docs/assets/img_archive/profiles_messaging_history_tab.png?82660adfd8ea760b065a4c3230414afe)

#### Viewing and understanding events

For each event in the **Messaging History** table, you can see the messaging channel, event type, timestamp the event occurred, the associated campaign or Canvas message, and the user's device data. To filter for specific events, click **Filters** and select events from the list.

##### Message engagement events

The following message engagement events are available for email, SMS, push, in-app messages, Content Cards, and webhooks. To learn more about how specific events are tracked, refer to the [Message engagement event glossary](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events/).

| Channel | Engagement events available |
| --- | --- |
| Email | Bounce<br>Click<br>Deferral events<br>Delivery<br>Mark as spam<br>Open (see [note on email open event](#note-on-email-open-event))<br>Send<br>Soft bounce<br>Unsubscribe |
| SMS | Carrier send<br>Delivery<br>Delivery failure<br>Inbound receive<br>Rejection<br>Send |
| Push | Bounce<br>Influenced open<br>iOS Foreground<br>Open<br>Send |
| In-app message | Click<br>Impression |
| Content Cards | Click<br>Dismiss<br>Impression<br>Send |
| Webhooks | Send |
| WhatsApp | Abort<br>Delivery<br>Failure<br>Frequency capped<br>Inbound receive<br>Read<br>Send |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Message engagement events" }

##### Message abort events

Message abort events occur when a message sent to a user was aborted due to conditional logic in [Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/aborting_messages/) or [Connected Content](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content/aborting_connected_content#aborting-messages), or from Liquid rendering timeouts.

Abort events are available for the following channels:

- Email
- SMS
- Push
- Webhooks

Abort events are currently not available for in-app messages and Content Cards.

##### Frequency cap events

A frequency cap event occurs when a user is qualified to receive a message, but doesn't actually receive it due to [frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping#frequency-capping) settings. You can customize frequency capping settings from **Settings** > **Frequency Capping Rules**.

##### Blank destinations

Some message sends may appear in the Messaging History with blank destinations (signified by "—"). This is because some channels, such as Content Cards and webhooks, do not gather device data on message send.

Content Cards sends are logged when the card is available to be viewed. Because Content Cards can be viewed on multiple devices, device data is not logged for a send. Instead, this information is logged upon impression (when the card is actually viewed). Webhooks are sent to a system endpoint (not a device) so device data is not applicable.

#### Note on email open event {#note-on-email-open-event}

Email open tracking is error-prone in any tool, including Braze. With a variety of privacy protection features offered by different email clients that either block the automatic loading of images or load them proactively on the server, email open events are susceptible to both false positives and false negatives.

While email open statistics can be useful in aggregate, for example, to compare the effectiveness of different subject lines, you should not assume an individual open event for an individual user is meaningful.

#### Why are certain fields blank in the Message History tab?

Some fields may be absent in a user's **Message History** tab in the following scenarios:

- When an event is missing data for **Message Sent**, this indicates that the campaign doesn't have any message variations.
- When an event is missing data for **Campaign/Canvas** and **Message Sent**, this indicates that this message was sent from an API campaign (not API-triggered campaigns) that didn't specify the `campaign_id` and `message_variation_id`. These fields are optional and may be left out of the request body. When these fields are specified, that information is populated into the message history logs.
   - If a particular message is missing entirely from the messaging history but appears in the **Campaigns Received** log, it's likely the user received the campaign before being identified as the current user. If an existing profile is orphaned, the **Campaigns Received** log is transferred, but the messaging history is not. 
- When data is missing for **Campaign/Canvas**, a manual test may have been sent. Manual tests are logged in the **Messaging History** tab, but the campaign or Canvas that was sent won't be logged.

## Related articles

- [User profile lifecycle](https://www.braze.com/docs/user_guide/data/unification/user_data/user_profile_lifecycle/)
- [POST: Export user profile by identifier](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_identifier/)
- [POST: Delete users](https://www.braze.com/docs/api/endpoints/user_data/post_user_delete/)

