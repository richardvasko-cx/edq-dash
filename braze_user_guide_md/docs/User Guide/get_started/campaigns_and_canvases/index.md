# Get started: Campaigns and Canvases

> This article provides an overview of the different ways you can send messages with Braze. In Braze, you can send messages either through a [campaign](#campaigns) or a [Canvas](#canvas).

- For sending a single targeted message to a group of users, choose a campaign. A campaign is a single message step to connect with your users on various messaging channels.
- For sending a series of ongoing messages in an overarching customer journey, choose Canvas, our journey orchestration tool. While campaigns are good for sending simple, targeted messages, Canvases are where you take your relationships with customers to the next level.

## Campaigns

While campaigns can be built uniquely depending on the channel, there are four main types of campaigns in Braze you should be aware of:

| Campaign type        | Description                                                                                                                                                                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regular              | This is the most common type of campaign. You can target one or more channels depending on your messaging goals, and design, customize, and test your content directly in Braze with our visual editors. Learn how to [create a campaign](https://www.braze.com/docs/user_guide/messaging/campaigns/creating_campaign/). |
| A/B testing          | For campaigns targeting a single channel, you can send more than one version of the same campaign and see which one comes out on top. You can test copy, personalization, and more for up to eight different versions with a [multivariate campaign](https://www.braze.com/docs/user_guide/messaging/ab_testing/). |
| API                  | [API campaigns](https://www.braze.com/docs/api/api_campaigns/) let you send timely messages as quickly as possible. Unlike other campaign types, you don't specify the message, recipients, or schedule in the Braze dashboard. Instead, you pass these identifiers into your API calls. These are typically used for real-time transactional messaging or breaking news.  |
| Transactional Emails | Braze [Transactional Emails](https://www.braze.com/docs/user_guide/channels/email/) are purpose-built for sending automated, non-promotional email messages to facilitate an agreed-upon transaction between you and your customers. They send business-critical notifications to a single user where speed is of the utmost importance. *Available for select packages.* |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Campaigns" }

**Note:**


Regular and A/B test campaigns can be scheduled (such as informing a list of users about an upcoming event) or automated to send in response to a user's action (such as sending an email when someone subscribes to your newsletter). Learn more about [scheduling campaigns](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/).



Regardless of the type of campaign you create, your campaigns can listen to your user's needs and deliver a thoughtful, personalized response. After you've sent your campaign, use our [built-in analytics tools](https://www.braze.com/docs/user_guide/analytics/reports/) to see how it performed and how many users converted based on your [conversion events](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/).

Check out these additional resources to learn more about campaigns at Braze:

- Braze Learning: [Campaign Setup](https://learning.braze.com/campaign-setup-delivery-targeting-conversions)
- [Create a campaign](https://www.braze.com/docs/user_guide/messaging/campaigns/creating_campaign/)
- [Ideas and strategies](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies)

## Canvas

Rather than sending out sporadic messages over multiple campaigns, Canvases create an ongoing fluid conversation with users. This is because a user's journey through a Canvas can split into different paths depending on their actions (or inaction) with your brand, allowing you to automatically advance users through a specific flow in real time.

![](https://www.braze.com/docs/assets/img/getting_started/canvas_flow.png?ff6ec8d281a9055725f3a3901df29e84)

In this way, Canvases are great for casting a net to capture users who fall off the path to conversion and placing them in the most effective outreach initiatives.

When you create a Canvas, you follow many of the same steps as setting up a campaign: specifying an overall audience, entry conditions, and send settings. Your Canvas starts when someone matches your trigger condition. Then they move through a path in the Canvas until they meet your exit conditions.

Your Canvas can have any combination of [messages](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/message_step/), [delays](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/delay_step/), [experiments](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/experiment_step/), and more. You can send on any supported messaging channel, and even [integrate with social and ad platforms](https://www.braze.com/docs/partners/canvas_audience_sync/overview/) such as Facebook, Google, or TikTok.

Check out these additional resources to learn more about Canvas:

- Braze Learning: [Journey Orchestration with Canvas Flow](https://learning.braze.com/path/journey-orchestration-with-canvas-flow)
- [Create a Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/)
- [Canvas outlines](https://www.braze.com/docs/user_guide/messaging/canvas/ideas_and_strategies/canvas_outlines/)

## Messaging channels

Messaging channels are the various communication channels through which you can engage with your customers and deliver targeted messages. 

![](https://www.braze.com/docs/assets/img/getting_started/channels.png?eb6bc0b731b35124297603041fba54ed)

The following table outlines our supported channels.

| Channel                                                                                              | Description                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Email](https://www.braze.com/docs/user_guide/channels/email/)                        | Send personalized emails to your users' inboxes.                                                                                                       |
| [Mobile push](https://www.braze.com/docs/user_guide/channels/push/create_a_push_message/)                   | Deliver messages directly to users' mobile devices as notifications.                                                                                   |
| [Web push](https://www.braze.com/docs/user_guide/channels/push/platform_specific_resources/web/)                         | Deliver notifications to users' web browsers, even when they are not actively on your website.                                                         |
| [In-app messages](https://www.braze.com/docs/user_guide/channels/in_app_messages/)    | Display messages within your mobile app while users are actively using it.                                                                             |
| [SMS, MMS, and RCS](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/)*                   | Send text messages to users' mobile phones.                                                                                                            |
| [WhatsApp](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/)*              | Send messages through the popular messaging platform, WhatsApp, to reach and engage with your users.                                                   |
| [Banners](https://www.braze.com/docs/user_guide/channels/banners/)*       | Embed messages directly in your app or website. |
| [Content Cards](https://www.braze.com/docs/user_guide/channels/content_cards/)*       | Provide an inbox within your app or website where users can receive and interact with messages, or display messages in a carousel, as a banner, and more. |
| [Connected TV](https://www.braze.com/docs/developer_guide/platforms/tv_and_ott/)                           | Engage with users on connected television platforms.                                                                                                   |
| [Webhooks](https://www.braze.com/docs/user_guide/channels/webhooks/) | Enable real-time communication and integration with external systems through custom HTTP callbacks.                                                    |
| [LINE](https://www.braze.com/docs/user_guide/channels/line/) | Engage with users on LINE, the most popular messaging app in Japan.                                                    |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Messaging channels" }

<sup>**Available as an add-on feature.*</sup>

**Tip:**


For short and urgent messages that can be communicated through most channels (email, SMS, push), take advantage of the [Intelligent Channel](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_channel/) filter to automatically send the message through the best channel for each user.



