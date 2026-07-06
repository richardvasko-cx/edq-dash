# How to use eCommerce Events

> eCommerce [recommended events](https://www.braze.com/docs/recommended_events/) use a shared, order-level schema, which lets Braze build reliable features on top of your eCommerce data—including user profiles, segmentation, messaging, reporting, and AI-powered recommendations. The sections in this article cover how to use each capability in Braze.<br><br> See [Event schemas](https://www.braze.com/docs/user_guide/data/activation/events/recommended_events/#event-schemas) for property requirements and data types, and [Event validation and troubleshooting](https://www.braze.com/docs/user_guide/data/activation/events/recommended_events/#event-validation-and-troubleshooting) for what happens when an event fails validation.

Because eCommerce events follow a predictable schema, Braze can build reliable features on top of them, from revenue tracking and pre-built Canvas templates to AI-powered recommendations. The following sections give you a quick overview of each capability with links to the full documentation.

**Note:**


Braze eCommerce events and their segmentable event properties don't count toward [data points](https://www.braze.com/docs/user_guide/data/infrastructure/data_points/).



<a id="transactions-tab" aria-hidden="true"></a>

## Commerce tab {#commerce-tab}

The **Commerce** tab on each user profile combines two modules: **Order activity** (calculated revenue and order metrics) and **Active cart** (the latest cart from `ecommerce.cart_updated` events).

### Order activity

The **Order activity** module surfaces three calculated metrics that update in real time as events are processed. The order-level model of these calculations cleanly separates product prices from total order value.

**Note:**


eCommerce recommended events do not populate within the **Purchase history** section of the **Commerce** tab. Purchase history is populated by legacy purchase events. Use the metrics in the following table for revenue, and order activity from recommended events.



| Metric | Formula |
| ----- | ----- |
| Total Revenue | sum (`order_placed.total_value`) − sum (`order_refunded.total_value`) |
| Total Orders | count (distinct `order_placed`) − count (distinct `order_cancelled`) |
| Total Refund Value | sum (`order_refunded.total_value`) |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Order activity metrics" }

### Active cart

The **Active cart** module shows the latest cart on the user profile. That view is especially helpful while you test. You can use it to confirm cart contents, validate cart-based journeys, or verify that `ecommerce.cart_updated` events are updating the profile as you expect.

**Active cart** includes the following:

- **Cart ID** — Identifier for the cart that last received an `ecommerce.cart_updated` event.
- **Last updated** — Timestamp of the most recent cart update.
- **Total cart value** — Total value of the line items in the current cart.
- **View products** — A link to open the list of products in the cart (up to 50 products).

## eCommerce orchestration

### Segmentation

Braze provides three ways to segment users based on eCommerce data:

- **eCommerce filters:** Use the **eCommerce** category in the segmenter, which contains filters powered by eCommerce recommended events (such as **Last Order Placed**, **Total Revenue**, and **Average Order Value**). For a complete list of available filters, see [Segment filters](https://www.braze.com/docs/user_guide/audience/segments/segmentation_filters/).
- **Custom event filters:** Because eCommerce events behave like custom events, all existing custom event filters work immediately. For example, you can filter by "Has performed custom event `ecommerce.order_placed` more than X times" or "First performed custom event `ecommerce.order_placed`".
- **Segment Extensions:** For segmenting off nested event properties including the nested products array or the metadata objects properties, use [Segment Extensions](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/) with nested event property filtering. This lets you build audiences like "users who purchased product SKU-123 in the last 90 days" or combine criteria across different properties of the same order.

**Important:**


Segment Extensions for eCommerce recommended events are a paid feature and in early access. If you're interested in participating in the early access, contact your customer success manager. Confirm your plan includes access before recommending nested property segmentation to your team.



### Triggering

You can use performed custom event triggers with eCommerce events throughout Braze, just like with other custom events. For abandoned cart flows, use the **Perform Cart Updated Event** trigger to properly capture cart updates.

Additionally, Braze offers a dedicated **Places Order** trigger, which lets you start journeys or take actions based on any placed order, or on orders that include a specific product. You can filter this trigger by product name, `product_id`, or `variant_id` to target specific purchase scenarios. For more information, see [Action-based delivery](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/).

![Places Order trigger with a selected option to place any order.](https://www.braze.com/docs/assets/img/recommended_events/places_order_trigger.png?dbc7d7ccebf7deac6362c092e8dfc337)

### Liquid personalization

eCommerce events support [Liquid personalization](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/using_liquid/) the same way custom events do; you can reference event properties directly in your messaging. To pull product images, pricing, or other catalog data into your messages, join your catalog with the event using `product_id` or `variant_id` as the linking identifier. The `{% shopping_cart %}` Liquid tag lets you loop through a user's current cart contents for abandoned cart reminders, checkout nudges, or order confirmations. For ready-to-use code samples, see [eCommerce use cases](https://www.braze.com/docs/ecommerce_use_cases/).

For a no-code alternative, [drag-and-drop product blocks](https://www.braze.com/docs/user_guide/messaging/design_and_edit/product_blocks/) are available in the early access program.

### eCommerce Canvas templates

Braze provides ready-to-use Canvas templates pre-configured with eCommerce recommended events as entry, exit, and conversion criteria, so you can launch lifecycle flows without custom setup. Each template ships with drag-and-drop email designs and supports drag-and-drop product blocks (currently in early access). For detailed use cases and Liquid examples, see [eCommerce use cases](https://www.braze.com/docs/ecommerce_use_cases/).

These templates cover the most common eCommerce lifecycle flows. Use them as a starting point, then customize the timing, channels, and creative for your audience.




Re-engages users who viewed a product but didn't add it to their cart.

Use this template when you want to bring browsers back to consider products they recently viewed but didn't act on.

| Setting | Value |
| --- | --- |
| Entry event | `ecommerce.product_viewed` |
| Exit events | `ecommerce.product_viewed`, `ecommerce.cart_updated`, `ecommerce.checkout_started`, Placed Order |
| Conversion event | Placed Order |
{: .reset-td-br-1 .reset-td-br-2 aria-label="eCommerce Canvas templates" }




Recovers users who added items to their cart but didn't begin checkout.

Use this template when you want to remind users about items in their cart and drive them back to complete checkout.

| Setting | Value |
| --- | --- |
| Entry event | `ecommerce.cart_updated` |
| Exit events | `ecommerce.cart_updated`, `ecommerce.checkout_started`, Placed Order |
| Conversion event | Placed Order |
{: .reset-td-br-1 .reset-td-br-2 aria-label="eCommerce Canvas templates" }

**Tip:**


The `ecommerce.cart_updated` event supports full cart replacement (each event can describe the entire cart) or incremental updates using the `add` and `remove` values for the optional `action` property. Pick one approach per cart and avoid mixing replacement and incremental cart updates for the same `cart_id`. Use the `{% shopping_cart %}` Liquid tag in your message to dynamically display the current cart contents at send time.






Recovers users who started checkout but didn't complete the purchase.

Use this template when you want to recover purchases at the highest-intent stage of the funnel.

| Setting | Value |
| --- | --- |
| Entry event | `ecommerce.checkout_started` |
| Exit event | Placed Order |
| Conversion event | Placed Order |
{: .reset-td-br-1 .reset-td-br-2 aria-label="eCommerce Canvas templates" }




Confirms a successful purchase and follows up with a feedback survey to drive review collection and post-purchase engagement.

Use this template when you want to streamline post-purchase communication and gather customer feedback in a single workflow.

| Setting | Value |
| --- | --- |
| Entry event | `ecommerce.order_placed` |
| Conversion event | Start Session or `ecommerce.product_viewed` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="eCommerce Canvas templates" }




#### Customize templates

These templates are designed to be a starting point. Common customizations include:
  - **Customize the email:** Each template includes a pre-configured email built with the drag-and-drop editor which is fully editable to match your brand and content.
  - **Add channels:** Pair email with push, SMS, or in-app messages for cross-channel reinforcement.
  - **Add delays and decision splits:** Branch users by behavior (for example, high-value cart compared to low-value cart) or wait periods between messages.
  - **Swap creative:** Replace the included email template with your brand's visual style.
  - **Use product blocks:** Use drag-and-drop product blocks (in the early access program) to dynamically render abandoned cart contents or browsed products without writing custom Liquid.

For more advanced lifecycle strategies, including Liquid personalization examples, see [eCommerce use cases](https://www.braze.com/docs/ecommerce_use_cases/).

## eCommerce reporting

eCommerce recommended events power the same revenue surfaces customers already use today. When your integration is sending eCommerce events, the following reports include eCommerce revenue automatically:

| Report                                      | What it shows                             |
|---------------------------------------------|-------------------------------------------|
| Revenue Report                              | Total revenue, average daily revenue, daily purchases, and revenue per user over time across all sources for your selected date range and apps.                                                                                     |
| Last Touch Attribution Revenue dashboard     | Revenue attributed to the last campaign or Canvas a user interacted with before placing an order. Touch events include email clicks, push opens, Content Card clicks, in-app message clicks, and SMS or WhatsApp short link clicks. |
| Campaign and Canvas analytics                | Total revenue attributed to a specific campaign or Canvas within the primary conversion window.                                                                                   |
| Conversions report                          | Revenue tied to conversion events on campaigns and Canvases.<br> **Note:** To count `ecommerce.order_placed` revenue, the campaign or Canvas must use the “Place Order” conversion event type as its conversion event.                                                                                    |
| Segment Insights                            | Revenue comparisons across segments in the segment insights dashboard.                                                               |
| Report Builder                              | Revenue metrics in custom reports built in Report Builder.                                                                                  |
| Dashboard Builder                           | Revenue metrics in custom dashboards built in Dashboard Builder.                                                                                  |
{: .reset-td-br-1 .reset-td-br-2 aria-label="eCommerce reporting" }

For non-user calculated fields (for example, campaign or Canvas revenue), revenue is calculated the same way across all reports: `price` multiplied by `quantity` per product in the order, summed across the products in each `order_placed` event.

**Note:**


To avoid double-counting revenue, do not send both legacy purchases and eCommerce recommended events for the same orders. If you are planning to transition from legacy purchases to recommended events, coordinate the change with your Braze account team before making any integration changes.<br><br>
Revenue calculations cap individual product quantities at `1,000` units per order. If a `quantity` field is missing for a product, it defaults to `1`. The original `order_placed` event retains the full quantity you sent—only the revenue calculation applies the cap.



### BrazeAI<sup>TM</sup>

[Predictive Events](https://www.braze.com/docs/user_guide/brazeai/predictive_suite/predictive_events/), [Predictive Churn](https://www.braze.com/docs/user_guide/brazeai/predictive_suite/predictive_churn/), and [item recommendations](https://www.braze.com/docs/user_guide/brazeai/item_recommendations/) support eCommerce events as target events and signals, and have a dedicated "Order Placed" option. The standardized schema makes these models more reliable because the data is consistent across your user base.

### Export data

Braze offers several ways to export eCommerce event data for use in your data warehouse, BI tools, or downstream systems. eCommerce recommended events are exported through the same channels as your other event data.

| Export path                         | What's included                                                                                                                                                                                 |
|------------------------------------- |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Currents](https://www.braze.com/docs/user_guide/data/distribution/braze_currents)                            | eCommerce events stream as custom events; search the `ecommerce.*` namespace to find them. Products from each order are available as purchases.                                                |
| [Snowflake Data Sharing](https://www.braze.com/docs/partners/data_and_analytics/data_warehouses/snowflake/data_sharing)               | eCommerce events are shared as custom events; search the `ecommerce.*` namespace to find them. Products from each order are available in the purchases table.                                   |
| [Export segment data to CSV](https://www.braze.com/docs/user_guide/data/distribution/export_braze_data/segment_data_to_csv)           | CSV export of segment members. To include eCommerce events, select them by name from the custom events dropdown.                                                                                |
| [Export user profile by Segment (API)](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_segment/#prerequisites) | User profile data for segment members, returned via API. eCommerce events are included as custom events.                                                                                        |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Export data" }
### How do I segment users by a specific product?

The segmenter allows you to filter by the number of times a user performed an eCommerce event. To filter by specific product properties (such as `product_id` or `product_name`), use [Segment Extensions](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/), which support nested event property filtering. For example, you can find all users who purchased product "SKU-123" in the last 90 days.
