# Frequently asked questions

> These are answers to frequently asked questions about Banners in Braze. For more general information, see [About Banners]().

## When do Banner updates appear for users?

Banners are refreshed with their latest data whenever you call the refresh method&#8212;there's no need to resend or update your Banner campaign.

## How many placements can I request in a session?

In a single refresh request, you can request a maximum of 10 placements. For each one you request, Braze will return the highest-priority Banner a user is eligible for. Additional requests will return an error.

For more information, see [Placement requests]().

## How many Banner campaigns can be active simultaneously?

Each workspace can support up to 200 active Banner campaigns. If this limit is reached, you'll need to [archive or deactivate](https://www.braze.com/docs/user_guide/engagement_tools/messaging_fundamentals/about_statuses/#changing-the-status) an existing campaign before creating a new one.

## For campaigns sharing a placement, which Banner is displayed first?

If a user qualifies for multiple Banner campaigns that share the same placement, the Banner with the highest priority will be displayed. For more information, see [Banner priority]().

## Can I use Banners in my existing Content Card feed?

Banners are different from Content Cards, meaning you can’t use Banners and Content Cards in the same feed. To replace existing Content Card feeds with Banners, you’ll need to [create placements in your app or website](https://www.braze.com/docs/developer_guide/banners/placements/).

## Can Banners include video?

The standard Banner composer supports images, text, and buttons. To include a video in a Banner, you could use a **Custom Code** block and render a video or embedded player in your app or website.

## Can I trigger a banner based on user actions?

While Banners do not support [action-based delivery](https://www.braze.com/docs/user_guide/engagement_tools/campaigns/building_campaigns/delivery_types/triggered_delivery), you can target users based on their past actions using segmentation and priority.

For example, to show a special Banner only to users who have completed a `purchase` event:
1. **Targeting:** In your campaign, target a segment of users who have performed the custom event `purchase` at least once.
2. **Priority:** If you have a general Banner for all users and this specific Banner for purchasers targeting the same placement, set the specific Banner's priority to **High** and the general Banner to **Medium** or **Low**.

When the user starts a new session or refreshes Banners after performing the action, Braze evaluates their eligibility. If they match the "Purchase" segment, the high-priority Banner will be displayed.


## Can users dismiss a Banner?

Yes. You can allow users to manually dismiss a Banner by enabling dismissal behavior in the Banner composer. See [Configure dismissal behavior](https://www.braze.com/docs/user_guide/channels/banners/create_a_banner/#dismiss-behavior) for details on enabling dismissal and customizing the dismiss button.

Users can manually dismiss Banners only if dismissal behavior is enabled. If dismissal isn't enabled, you can control Banner visibility by managing user segment eligibility. When a user no longer meets the targeting criteria for a Banner campaign, they won't see it again on their next session.

When a user dismisses a Banner, they're ineligible for that campaign by default. To let dismissed users see the Banner again, [configure re-eligibility](https://www.braze.com/docs/user_guide/channels/banners/create_a_banner/#re-eligibility) in the campaign's **Delivery Controls** step. Canvas Banner steps use Canvas re-entry settings to control re-eligibility instead.

**Important:**


[Banner dismissals](https://www.braze.com/docs/developer_guide/banners/placements/#log-dismissals) are currently in early access. If you're interested in participating in the early access, contact your customer success manager.



For example, if you display a promotional Banner until a user makes a purchase, logging an event such as `purchase_completed` can remove that user from the targeted segment, effectively hiding the Banner in subsequent sessions.

## Can I export Banners campaign analytics using the Braze API?

Yes. You can use the [`/campaigns/data_series` endpoint](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_analytics/) to get data on how many Banner campaigns were viewed, clicked, or converted.

## When are users segmented?

Users are segmented at the beginning of the session. If a campaign's targeted segments depend on custom attributes, custom events, or other targeting attributes, they must be present on the user at the beginning of the session.

## How can I compose Banners to ensure the lowest latency?

The simpler the messaging in your Banner, the faster it will render. It’s best to test your Banner campaign against the expected latency for your use case. For example, be sure to test Liquid attributes like `catalog_items`.

## Are all Liquid tags supported?

No. However, most Liquid tags are supported for Banner messages, except for `catalog_items` that are re-rendered using the [`:rerender` tag](https://www.braze.com/docs/user_guide/data/activation/catalogs/using_catalogs/#using-liquid).

## Can I capture click events?

Yes. How click events are captured depends on how your Banner is rendered:

- **Standard editor components:** If your Banner uses standard editor components (images, buttons, text), clicks are tracked automatically when using the SDK's insertion methods.
- **Custom Code Blocks:** If you want to track clicks for elements within a Custom Code editor block, you must call `brazeBridge.logClick()` from within your custom HTML to track clicks. This applies even when using the SDK methods to insert and render the Banner. For the full reference, see [Custom code and JavaScript bridge for Banners](https://www.braze.com/docs/user_guide/message_building_by_channel/banners/custom_code/#javascript-bridge).
- **Custom UI (headless):** If you're building a fully custom UI using the Banner's custom properties instead of rendering the Banner HTML, call `logClick()` on the Banner object from your application code.

For more information, see [Logging clicks](https://www.braze.com/docs/developer_guide/banners/placements/#logging-clicks).
