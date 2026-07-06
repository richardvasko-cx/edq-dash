# Create AI item recommendations

> Learn how to create an AI recommendation engine from items in your catalog.

## About AI item recommendations

Use AI item recommendations to calculate the most popular products or create personalized AI recommendations for a specific [catalog](https://www.braze.com/docs/user_guide/data/activation/catalogs/). After creating your recommendation, you can use personalization to insert those products into your messages.

**Tip:**


[AI Personalized recommendations](#recommendation-types) work best with at least a few hundred catalog items, at most 100,000 catalog items, and typically at least 30,000 users with purchase or interaction data. This is only a rough guide and can vary. The other recommendation types can work with less data, including when **Most popular** is used as a fallback.






## Creating an AI item recommendation

### Prerequisites

Before you start, you must have the following:

- At least one [catalog](https://www.braze.com/docs/user_guide/data/activation/catalogs/) to use any of the recommendation types described below.
- Purchase or event data on Braze (custom events, the order placed event, or the purchase object) that includes a reference to the item and must match the catalog item IDs.

### Step 1: Create a new recommendation

You can create an AI item recommendation from either place in the dashboard:



1. Go to **Analytics** > **AI Item Recommendation**.
2. Select **Create Prediction** > **AI Item Recommendation**.



You can also choose to create a recommendation directly from an individual catalog. Select your catalog from the **Catalogs** page, then select **Create Recommendation**.



### Step 2: Add recommendation details

Give your recommendation a name and optional description.

!["Recommendation details" step with the name and description fields.](https://www.braze.com/docs/assets/img/item_recs_1.png?e936cf5307c36ef1176eab1b59efd98e)

### Step 3: Define your recommendation {#recommendation-type}

Select a recommendation type. Each type uses the last six months of item interaction data, such as a purchase, an order placed, or custom event data. For more detailed information and uses cases for each, see [Types and Uses Cases](https://www.braze.com/docs/user_guide/brazeai/item_recommendations/).

**Tip:**


When using **Most Recent** or **AI Personalized**, users with insufficient data to create individualized recommendations will receive **Most Popular** items as a fallback. You can see an approximation of the proportion of users receiving the **Most Popular** fallback displayed on the **Analytics** page. The **Most Popular** fallback only returns items that exist in the linked catalog. 



#### Step 3.1: Exclude prior purchases or interactions (optional)

To avoid suggesting items that a user has already purchased or interacted with, select **Do not recommend items users have previously interacted with**. This option is only available when the recommendation **Type** is set to **AI Personalized**.

!["Define your recommendation" step with "AI Personalized" as the type and the "Do not recommend items users have previously interacted with" option selected.](https://www.braze.com/docs/assets/img/item_recs_2-3.png?d28a22b31d197027aff41f443349c5bb)

This setting prevents messages from reusing the items a user has already bought or interacted with, provided the recommendation has been updated recently. Items purchased or interacted with between recommendation updates may still appear. For the free version of item recommendations, updates happen weekly. For the pro version of AI item recommendations, updates happen every 24 hours.

For example, when using the pro version of AI item recommendations, if a user purchases something and then receives a marketing email within 30 minutes, the item they just purchased might not be excluded from the email in time. However, any messages sent after 24 hours won't include that item.

#### Step 3.2: Select a catalog

If not already populated, select the [catalog](https://www.braze.com/docs/user_guide/data/activation/catalogs/) that this recommendation will pull items from.

#### Step 3.3: Add a selection (optional)

If you'd like more control over your recommendation, choose a [selection](https://www.braze.com/docs/user_guide/data/activation/catalogs/selections/) to apply custom filters. Selections filter recommendations by specific columns in your catalog, such as brand, size, or location. Selections that contain Liquid can't be used in your recommendation.

![An example of the "in-stock" selection selected for the recommendation.](https://www.braze.com/docs/assets/img/item_recs_2-2.png?1846eb29d6db9c1a6f087e648ef9f349)

**Tip:**


If you can't find your selection, make sure it's set up in your catalog first.



### Step 4: Select the interaction to drive recommendations

Select the event you want this recommendation to optimize for. This event is usually a purchase, but it can also be any interaction with an item.

You can optimize for:

- Purchase events with the [Purchase Object](https://www.braze.com/docs/api/objects_filters/purchase_object/)
- Custom events that represent a purchase
- Custom events that represent any other item interaction (such as product views, clicks, or media plays)
- Orders placed with the [order placed event](https://www.braze.com/docs/user_guide/data/activation/events/recommended_events/ecommerce_events/?tab=ecommerce.order_placed)

If you choose **Custom Event**, select your event from the list.

![The "purchase" custom event selected as how events are currently tracked.](https://www.braze.com/docs/assets/img/item_recs_3.png?252b236e88c197cb3ecb20be42f815d5)

**Note:**


Custom events must have sufficient data before they appear in the event list. If your custom event doesn’t appear, it may be because the Braze backend hasn’t yet processed it or it lacks enough data for model training. AI recommendations rely on historical data to generate insights, so newly created or rarely triggered events won’t be available until more data is collected.



### Step 5: Choose the corresponding property name {#property-name}

To create a recommendation, you need to tell Braze which field of your interaction event (order placed event, purchase object, or custom event) has the unique identifier that matches an item's `id` field in the catalog. Not sure? [View requirements](#requirements).

Select this field for the **Property Name**.

The **Property Name** field will pre-populate with a list of fields sent through the SDK to Braze. If enough data is provided, these properties will also be ranked in order of probability to be the correct property. Select the one that corresponds to the `id` field of the catalog.

![The property name "purchase_item" selected that corresponds to the item IDs in the catalog.](https://www.braze.com/docs/assets/img/item_recs_4.png?04646252921dc2c0d58004a38f22d20e)

#### Requirements {#requirements}

There are some requirements for selecting your property:

- Must map to the `id` field of your selected catalog.
- **If you selected Order Placed Event or are using [eCommerce events](https://www.braze.com/docs/user_guide/data/activation/events/recommended_events/ecommerce_events/) to train item recommendations:** Enter `products.product_id` for the product ID.
  - The field can be inside an array of products, or end with an array of IDs. In either case, each product ID will be treated as a separate, sequential event with the same timestamp.
- **If you selected Purchase Object:** Must be the `product_id` or a field of your interaction event's `properties`.
- **If you selected Custom Event:** Must be a field of your custom event's `properties`.
- Nested fields must be typed into the **Property Name** dropdown in dot notation with the format of `event_property.nested_property`. For example, if selecting the nested property `district_name` within the event property `location`, you would enter `location.district_name`.

#### Example mappings

The following example mappings both refer to this sample catalog:

<style type="text/css">
.tg td{word-break:normal;}
.tg th{word-break:normal;font-size: 14px; font-weight: bold; background-color: #f4f4f7; text-transform: lowercase; color: #212123; font-family: "Sailec W00 Bold",Arial,Helvetica,sans-serif;}
.tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top;word-break:normal}
</style>
<table aria-label="Example mappings" class="tg">
  <caption>Example mappings</caption>
<thead>
  <tr>
    <th class="tg-0pky">id</th>
    <th class="tg-0pky">title</th>
    <th class="tg-0pky">price</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-0pky">ADI-BL-7</td>
    <td class="tg-0pky">Adidas Black Size 7</td>
    <td class="tg-0pky">100.00 USD</td>
  </tr>
  <tr>
    <td class="tg-0pky">ADI-RD-8</td>
    <td class="tg-0pky">Adidas Red Size 8</td>
    <td class="tg-0pky">100.00 USD</td>
  </tr>
  <tr>
    <td class="tg-0pky">ADI-WH-9</td>
    <td class="tg-0pky">Adidas White Size 9</td>
    <td class="tg-0pky">100.00 USD</td>
  </tr>
  <tr>
    <td class="tg-0pky">ADI-PP-10</td>
    <td class="tg-0pky">Adidas Purple Size 10</td>
    <td class="tg-0pky">75.00 USD</td>
  </tr>
</tbody>
</table>




Let's say you want to use the custom event `added_to_cart` so that you can recommend similar products before the customer checks out. The event `added_to_cart` has an event property of `product_sku`.

Then the `product_sku` property must include at least one of the values from the `id` column in the sample catalog: "ADI-BL-7", "ADI-RD-8", "ADI-WH-9", or "ADI-PP-10". You don't need events for every catalog item, but you need some of them so that the recommendation engine has enough content to work with.

##### Example custom event object

This event has `"product_sku": "ADI-BL-7"`, which matches the first item in the sample catalog.

```json
{
  "events": [
    {
      "external_id": "user1",
      "app_id": "your-app-id",
      "name": "added_to_cart",
      "time": "2024-07-16T19:20:30+01:00",
      "properties": {
        "product_sku": "ADI-BL-7"
      }
    }
  ]
}
```

##### Example custom event object with an array of products

If your event properties contain multiple products in an array, each product ID will be treated as a separate, sequential event. This event can use the property `products.sku` to match the first and third items in the sample catalog.

```json
{
  "events": [
    {
      "external_id": "user1",
      "app_id": "your-app-id",
      "name": "added_to_cart",
      "time": "2024-07-16T19:20:30+01:00",
      "properties": {
        "transaction_id": "2ff3f9a9-8803-4c3a-91da-14adbf93dc99",
        "products": [
          { "sku": "ADI-BL-7" },
          { "sku": "ADI-WH-9" }
        ]
      }
    }
  ]
}
```

##### Example custom event object with a nested object containing a product ID array

If your product IDs are values in an array instead of objects, you can use the same notation and each product ID will be treated as a separate, sequential event. This can flexibly be combined with nested objects in the following event by configuring the property as `purchase.product_skus` to match the first and third items in the sample catalog.

```json
{
  "events": [
    {
      "external_id": "user1",
      "app_id": "your-app-id",
      "name": "added_to_cart",
      "time": "2024-07-16T19:20:30+01:00",
      "properties": {
        "transaction_id": "13791e08-7c22-4f6c-8cc6-832c76af3743",
        "purchase": {
          "product_skus": ["ADI-BL-7", "ADI-WH-9"]
        }
      }
    }
  ]
}
```




A purchase object is passed through the API when a purchase has been made.

In terms of mapping, a similar logic applies for purchase objects as it does for custom events, except you can choose between using the purchase object's `product_id` or a field in the `properties` object.

Remember, you don't need events for every catalog item, but you do need some of them so that the recommendation engine has enough content to work with.

##### Example purchase object mapped to product ID

This event has `"product_id": "ADI-BL-7`, which maps to the first item in the catalog.

```json
{
  "purchases": [
    {
      "external_id": "user1",
      "app_id": "11ae5b4b-2445-4440-a04f-bf537764c9ad",
      "product_id": "ADI-BL-7",
      "currency": "USD",
      "price": 100.00,
      "time": "2024-07-16T19:20:30+01:00",
      "properties": {
        "color": "black",
        "checkout_duration": 180,
        "size": "7",
        "brand": "Adidas"
      }
    }
  ]
}
```

##### Example purchase object mapped to a properties field

This event has a property of `"sku": "ADI-RD-8"`, which maps to the second item in the catalog.

```json
{
  "purchases": [
    {
      "external_id": "user1",
      "app_id": "11ae5b4b-2445-4440-a04f-bf537764c9ad",
      "product_id": "shoes",
      "currency": "USD",
      "price": 100.00,
      "time": "2024-07-16T19:20:30+01:00",
      "properties": {
        "sku": "ADI-RD-8",
        "color": "red",
        "checkout_duration": 180,
        "size": "8",
        "brand": "Adidas"
      }
    }
  ]
}
```




##### Example order placed object mapped to product ID

```json
{
  "name": "ecommerce.order_placed",
  "properties": {
    "order_id": "order_123",
    "total_value": 200.0,
    "currency": "USD",
    "products": [
      {
        "product_id": "ADI-BL-7",
        "product_name": "Adidas Black Size 7",
        "variant_id": "ADI-BL-7-default",
        "quantity": 1,
        "price": 100.0
      }
    ],
    "source": "storefront"
  }
}
```




### Step 6: Train the recommendation

When you're ready, select **Create Recommendation**. This process can take anywhere from 10 minutes to 36 hours to complete. You will receive an email update when the recommendation is successfully trained or an explanation of why the creation may have failed.

You can find the recommendation on the **Predictions** page, where you can then edit or archive it as needed. Recommendations will automatically retrain once every week (paid) or month (free).
