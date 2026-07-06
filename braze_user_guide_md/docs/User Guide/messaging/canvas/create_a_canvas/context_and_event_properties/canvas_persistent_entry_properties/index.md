# Persistent entry properties

> When a Canvas is triggered by a custom event, purchase, or an API call, you can use metadata from the API call, custom event, or purchase event for personalization in each step in your Canvas workflow. You can use these properties to send more curated messages.

**Important:**


Persistent entry properties are an artifact of the original Canvas editor, so there are deprecated references to terms like Canvas entry properties that remain for historical reference. For the current Canvas editor, refer to [Context and event properties](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/context_and_event_properties/).<br><br>To use persistent entry properties in the current Canvas editor, you must either create a new Canvas or [clone](https://www.braze.com/docs/user_guide/messaging/canvas/managing_canvases/cloning_canvases) an existing one to the current editor.



## Using entry properties

Entry properties can be used in action-based and API-triggered Canvases. These entry properties are defined when a Canvas is triggered by a custom event, purchase, or API call. Refer to the following articles for more information:

- [Canvas entry properties object](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/context/)
- [Event properties object](https://www.braze.com/docs/api/objects_filters/event_object/)
- [Purchase object](https://www.braze.com/docs/api/objects_filters/purchase_object/#purchase-product_id)

Properties passed in from these objects can be referenced by using the `canvas_entry_properties` Liquid tag. For example, a request with `"canvas_entry_properties": {"product_name": "shoes", "product_price": 79.99}` could add the word "shoes" to a message by adding the Liquid `{{canvas_entry_properties.${product_name}}}`.

When a Canvas includes a message with the `canvas_entry_properties` Liquid tag, the values associated with those properties will be saved for the duration of a user's journey in the Canvas and deleted when the user exits the Canvas. Note that Canvas entry properties are only available for reference in Liquid. To filter on the properties within the Canvas, use [event property segmentation](https://www.braze.com/docs/user_guide/data/activation/events/custom_events/nested_objects/) instead.

**Note:**


The Canvas entry properties object has a maximum size limit of 50 KB.



## Updating Canvas to use entry properties

If an active Canvas that previously did not include any messages that use `canvas_entry_properties` is edited to include `canvas_entry_properties`, the value corresponding to that property will not be available for users who entered the Canvas before `canvas_entry_properties` was added to the Canvas. The values will only be saved for users that enter the Canvas after the change is made.

For example, if you initially launched a Canvas that did not use any entry properties on November 3, then added a new property `product_name` to the Canvas on November 11, values for `product_name` would only be saved for users that entered the Canvas on November 11 onward.

In the case that a Canvas entry property is null or blank, you can abort messages using conditionals. The following code snippet is an example of how you could use Liquid to abort a message.

```
{% if canvas_entry_properties.${product_name} == blank %}
{% abort_message() %}
{% endif %}
```


To read more about aborting messages with Liquid, check out our [Liquid documentation](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/aborting_messages/#abort-messages).

## Global Canvas entry properties

With `canvas_entry_properties`, you can set global properties that apply to all users or user-specific properties that only apply to the specified user. The user-specific property will supersede the global property for that user.

### Example request

```bash
curl -X POST \
-H 'Content-Type: application/json' \
-d '{
      "api_key": "a valid rest api key",
      "canvas_id": "the ID of your Canvas",
      "canvas_entry_properties": {
        "food_allergies": "none"
      },
      "recipients": [
        {
          "external_user_id": "Customer_123",
          "canvas_entry_properties": {
            "food_allergies": ["dairy", "soy"],
            "nutrition": {
              "calories_per_serving": 200,
              "serving_size_in_ounces": 4
            }
          }
        }
      ]
    }'
```
 
In this request, the global value for "food allergies" is "none". For Customer_123, the value is "dairy". Messages in this Canvas containing the Liquid snippet `{{canvas_entry_properties.${food_allergies}}}` will template with "dairy" for Customer_123 and "none" for everyone else. 

## Use case

If you have a Canvas that is triggered when a user browses an item in your eCommerce site but does not add it to their cart, the first step of the Canvas might be a push notification asking if they are interested in purchasing the item. You could reference the product name by using `{{canvas_entry_properties.${product_name}}}`

![](https://www.braze.com/docs/assets/img/persistent_entry_properties/PEP1.png?cfb36698247506235033c958bced5bde){: style="border:0;margin-left:15px;"}

The second step may send another push notification prompting the user to checkout if they added the item to their cart but have not purchased it yet. You can continue to reference the `product_name` entry property by using `{{canvas_entry_properties.${product_name}}}`.

![](https://www.braze.com/docs/assets/img/persistent_entry_properties/PEP12.png?15b080f00294f9fcdef2024ad6cbad0e){: style="border:0;margin-left:15px;"}

