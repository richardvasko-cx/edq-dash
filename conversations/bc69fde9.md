---
id: bc69fde9
title: Explain this selection: "Banner campaign"
timestamp: 2026-07-06T15:57:28.085Z
preview: Explain this selection: "Banner campaign"
source: pill
chips_json: [null,null,null,null]
articles_json: [null,null,null,[{"path":"docs/User Guide/channels/email/email_setup/authentication/index.md","title":"Authentication","section":"authentication"},{"path":"docs/User Guide/data/distribution/braze_currents/event_glossary/message_engagement_events/index.md","title":"Message Engagement Events","section":"message engagement events"},{"path":"docs/User Guide/audience/segments/segment_extension/sql_segments/sql_segments_tables/index.md","title":"Sql Segments Tables","section":"sql segments tables"}]]
actions_json: [null,null,null,[{"id":"open-ticket-email-performance","label":"Email Performance","description":"Review engagement and performance metrics.","icon":"equalizer","view":"investigation","ticketSection":"Email Performance"},{"id":"open-user-guide","label":"User Guide","description":"Browse Braze deliverability guidance.","icon":"menu_book","view":"user_guide"}]]
---

**User:** Explain this selection: "Banner campaign"

**Gemini:** A **Banner campaign** is a specific type of messaging campaign in Braze designed to display non-intrusive, persistent, or temporary messages within a designated area of your mobile app or website. Unlike push notifications or emails, which are delivered to a user's device or inbox, Banners are embedded directly into your application's UI.

### Key Characteristics
*   **Placement-Based:** Banners are not "sent" in the traditional sense; they are rendered by your application based on **Placement IDs** configured in your Braze settings. Your development team must define these placements in your app or website code before a campaign can successfully display content.
*   **Contextual Delivery:** Because they live within the UI, they are ideal for contextual messaging, such as promotional banners for a seasonal sale, account alerts, or feature announcements, without interrupting the user's current flow.
*   **Campaign vs. Canvas:** As noted in the guide, you can build Banners as either a standalone **Campaign** (best for single, targeted messages) or as a step within a **Canvas** (best for multi-step user journeys).

### Implementation Workflow
1.  **Configure Placements:** Navigate to **Settings** > **Banners Placements** to define your placement names and IDs.
2.  **Development Setup:** Ensure your engineering team has integrated these placements into the application code.
3.  **Create Campaign:** Choose **Banner** when creating your campaign in the **Messaging** section.
4.  **Targeting:** Because Banners rely on the user being active in your app or on your site to see them, ensure your targeting and scheduling are aligned with periods of expected user activity.

**Next Step:** Consult with your development team to confirm that the specific **Placement ID** you intend to use for your campaign has been correctly implemented in the app or website code, as the campaign will not render content if the placement is missing or mismatched.

**User:** What's best practice for this t increase revenue and increase engeagmanet

**Gemini:** To increase revenue and engagement using Banner campaigns, focus on **relevance, timing, and UI integration**. Because Banners live within your app or site's native experience, they are most effective when they feel like part of the product rather than an external ad.

### 1. Optimize for Conversion (Revenue)
*   **Contextual Alignment:** Use Banners to surface offers that match the user’s current page or activity. For example, show a "Free Shipping" banner only when a user is in the checkout flow or viewing their cart.
*   **Clear Call-to-Action (CTA):** Keep the copy punchy and the button high-contrast. Since Banners have limited real estate, the value proposition (e.g., "Get 20% off your first order") should be immediately visible.
*   **Personalization:** Leverage Braze’s Liquid templating to pull in user-specific data, such as their name, loyalty tier, or items recently added to their cart, to make the offer feel exclusive.

### 2. Maximize Engagement
*   **Prioritize Placement:** Work with your developers to identify "high-intent" areas of your app. Banners placed at the top of the home screen or within the search results page often see higher interaction rates than those tucked into the footer.
*   **Test and Iterate:** Use **Multivariate Testing** to compare different banner copy, imagery, and button colors. Small tweaks to the creative can significantly impact click-through rates (CTR).
*   **Frequency Capping:** Avoid "banner fatigue." Ensure your campaigns have frequency caps so that users aren't bombarded with the same message every time they navigate between pages.
*   **Dynamic Content:** Use Banners to drive users toward specific app features (e.g., "Try our new dark mode") to increase overall session depth and time-in-app.

### 3. Strategic Best Practices
*   **Use Canvases for Journeys:** Instead of a static, one-off campaign, integrate Banners into a multi-step **Canvas**. For example, if a user ignores an email about a sale, trigger a Banner in their next app session to reinforce the message.
*   **Monitor Performance:** Use the **Campaign Analytics** dashboard to track the specific impact of your Banner on downstream revenue and conversion events. If a banner isn't driving clicks, re-evaluate its placement or the urgency of the offer.

**Next Step:** Review your current **Banner Placements** in the dashboard to ensure they are mapped to high-traffic areas of your app where users are most likely to convert.