# Banners

> With Banners, you can create personalized messaging for your users, all while extending the reach of your other channels, such as email or push notifications. You can embed Banners directly in your app or website, which lets you engage with users through an experience that feels natural.

## Prerequisites

Banners availability depends on your Braze package. Contact your account manager or customer success manager to get started.

Before you start, make sure you have [Banner placements](https://www.braze.com/docs/developer_guide/banners/placements/) created in your app or website.

![An example Banner rendered on a device.](https://www.braze.com/docs/assets/img/banners/sample_banner.png?c7f37292fa4f239707f73a88139a4685)

## Why use Banners?

Banners allow marketing and product teams to personalize app or website content dynamically, reflecting real-time user eligibility and behavior. They persistently display messages inline, providing non-intrusive, contextually relevant experiences that can be refreshed at the start of a session or mid-session when your app or website explicitly requests it.

After Banners are integrated into an app or website, marketers can design and launch Banners using a simple drag-and-drop editor, eliminating the need for ongoing developer assistance, reducing complexity, and improving efficiency.

| Use case | Explanation |
| --- | --- |
| Announcements | Keep announcements like upcoming events or policy changes at the forefront of your app experience. |
| Personalizing offers | Show personalized promotions and incentives based on each user’s browsing history, cart content, subscription tier, and loyalty status. |
| Targeting new user engagement | Guide new users through onboarding flows and account setup. |
| Sales and promotions | Highlight featured content, trending products, and ongoing brand campaigns persistently and directly on your homepage without disrupting the user experience. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Why use Banners?" }

## Features

Features for Banners include:

- **Easy content building:** Create and preview your Banner using a visual, drag-and-drop editor with support for images, text, buttons, email capture forms, custom code, and more.
- **Flexible placements:** Define multiple locations within your application or website where Banners can appear, enabling precise targeting to specific contexts or user experiences.
- **Dynamic personalization:** Banners can be refreshed either during an active session when your app explicitly calls `requestBannersRefresh()`, or automatically at the start of a new session when `subscribeToBannersUpdates()` has been implemented and `requestBannersRefresh()` has previously been called at least once for the relevant placement IDs.
- **Native prioritization:** Set the display priority for when multiple Banners target the same placement, ensuring the right message reaches users at the right time.
- **Custom Code editor block:** Use the Custom Code editor block to add custom HTML for advanced customization or seamless integration with your existing web styles.

## About Banners {#about-banners}

### Placement IDs {#placement-id}

Banner placements are specific locations in your app or website [you create with the Braze SDK](https://www.braze.com/docs/developer_guide/banners/placements/) that designate where Banners can appear.

Common locations include the top of your homepage, product detail pages, and checkout flows. After placements are created, Banners can be [assigned in your Banner campaign](https://www.braze.com/docs/user_guide/channels/banners/create_a_banner/).

There is no fixed limit on the number of placements you can create per workspace, and you can create as many placement IDs as your experience requires. Each placement must be unique within a workspace. A single placement ID can be referenced by up to 25 active messages at the same time.

**Important:**


Avoid modifying placement IDs after launching a Banner campaign.



### Banner priority {#priority}

When multiple Banner messages reference the same placement ID, Banners are displayed in order of priority: high, medium, or low. By default, Banners are set to medium, but you can [manually set the priority](https://www.braze.com/docs/user_guide/channels/banners/create_a_banner/#set-banner-priority-optional) when you create or edit your Banner campaign. 

If multiple Banners are set to the same priority, the newest Banner that the user is eligible for is displayed first.

### Placement requests {#requests}

When you [create placements in your app or website](https://www.braze.com/docs/developer_guide/banners/placements/#requestBannersRefresh), your app sends a request to Braze to fetch Banner messages for each placement.  

- You can request up to **10 placements per refresh request**.  
- For each placement, Braze returns the **highest-priority Banner** the user is eligible to receive.  
- If more than 10 placements are requested in a refresh, only the first 10 are returned; the rest are dropped.  

For example, an app might request three placements in a refresh request: `homepage_promo`, `cart_abandonment`, and `seasonal_offer`. Each request returns the most relevant Banner for that placement.

#### Rate limiting for refresh requests

If you're on older SDK versions (before Swift 13.1.0, Android 38.0.0, Web 6.1.0, React Native 17.0.0, and Flutter 15.0.0), only one refresh request is permitted per user session.

If you're on newer minimum SDK versions (Swift 13.1.0+, Android 38.0.0+, Web 6.1.0+, React Native 17.0.0+, and Flutter 15.0.0+), refresh requests are controlled by a token bucket algorithm to prevent excessive polling:

- Each user session begins with five refresh tokens.
- Tokens refill at a rate of one token every 180 seconds (3 minutes).

Each call to `requestBannersRefresh` consumes one token. If you attempt a refresh when no tokens are available, the SDK doesn't make the request and logs an error until a token refills. This is important for mid-session and event-triggered updates. To implement dynamic updates (for example, after a user completes an action on the same page), call the refresh method after the custom event is logged, but note the necessary delay for Braze to ingest and process the event before the user qualifies for a different Banner campaign.


### Message delivery

Banner messages are delivered to your app or website as HTML content, typically rendered inside an iframe. This ensures that your Banners render consistently across devices, and helps you keep their styles and scripts separate from the rest of your code.

Iframes allow for dynamic and personalized content updates that don't require changes to your codebase. Each iframe retrieves and displays the HTML for each user session using campaign targeting and personalization logic.









































### Dimensions and sizing

Here's what you need to know about Banner dimensions and sizing:

- While the composer allows you to preview Banners in different dimensions, that information isn't saved or sent to the SDK.
- The HTML takes up the full width of the container it's rendered in.
- We recommend making a fixed dimension element and testing those dimensions in composer.

## Limitations

Each workspace can support up to 200 active Banner campaigns. If this limit is reached, you'll need to [archive or deactivate](https://www.braze.com/docs/user_guide/messaging/governance/statuses/#changing-the-status) an existing campaign before creating a new one.

Additionally, Banner messages do not support the following features:

- API-triggered and action-based campaigns
- Connected Content
- Promotional codes
- `catalog_items` using the [`:rerender` tag](https://www.braze.com/docs/user_guide/data/activation/catalogs/using_catalogs/#using-liquid)
- User-controlled dismissals (early access only)

**Important:**


Allowing users to manually dismiss a Banner is in early access. See [Configure dismissal behavior](https://www.braze.com/docs/user_guide/channels/banners/create_a_banner/#dismiss-behavior) for more details. If you're interested in participating in the early access, contact your customer success manager.



## Next steps

- [Create Banner placements in your app or website](https://www.braze.com/docs/developer_guide/banners/placements/)
- [Create a Banner campaign in Braze](https://www.braze.com/docs/user_guide/channels/banners/create_a_banner/)
- [Tutorial: Displaying a Banner by Placement ID](https://www.braze.com/docs/developer_guide/banners/tutorial_displaying_banners)

**Tip:**


Want to help prioritize what's next? Contact [banners-feedback@braze.com](mailto:banners-feedback@braze.com).


