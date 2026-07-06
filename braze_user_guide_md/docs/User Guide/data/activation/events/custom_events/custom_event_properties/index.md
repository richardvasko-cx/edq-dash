# Custom event properties

> This article describes custom event properties, their expected format, how to use them for messaging and segmentation, and custom event property storage.

Custom event properties are custom event metadata or attributes that describe a specific occurrence of an event. These properties can be used for further qualifying trigger conditions, increasing personalization in messaging, tracking conversions, and generating more sophisticated analytics through raw data export.

Custom event properties aren't stored on the Braze profile and therefore don't log data points (see [Data points](#data-points) for exceptions).

**Important:**


Each custom event or purchase can have up to 256 distinct custom event properties. If a custom event or purchase is logged with more than 256 properties, only the first 256 will be captured and available for use.



## Expected format {#expected-format}

Property values must be an object: keys are the property names (non-empty strings, 255 characters or fewer, no leading `$`), and values are the property values. For supported data types, format requirements, and payload limits, see [Data types](https://www.braze.com/docs/user_guide/data/activation/custom_data/data_types/#event-property-data-types).

You can change the data type of your custom event property, but be aware of the impacts of [changing data types](https://www.braze.com/docs/user_guide/data/activation/custom_data/data_types/#changing-custom-attribute-or-event-data-type) after data has been collected.

### Reserved keys

You cannot use reserved keys as event property names. Using a reserved key in the `properties` object returns the error "Invalid 'properties' field".

| Property | Reserved Key |
| --- | --- |
| Custom events | `time` and `event_name` | 
| Purchase events |`time`, `product_id`, `quantity`, `event_name`, `price`, `currency` | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Reserved keys" }

## Using custom event properties

Custom event properties can be used to qualify campaign triggers, track conversions, and personalize messaging.

### Trigger messages

Use custom event properties to further narrow your audience for a particular campaign or Canvas. For example, if you have an eCommerce application and want to send a message to a user when they abandon their cart, you can add a custom event property of `price` to improve your target audience and allow for increased campaign personalization.

![Custom event property filters for an abandoned card. Two filters are combined with an AND operator to send this campaign to users who abandoned their card with a price between 100 and 200 dollars](https://www.braze.com/docs/assets/img_archive/customEventProperties.png?03200b17e56f8f8ad0c6ab439de76832 "customEventProperties.png"){: style="max-width:70%;"}

Nested custom event properties are also supported in [action-based delivery](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/).

![Custom event property filters for an abandoned card. One filter is selected if any items in the cart have a price more than 100 dollars.](https://www.braze.com/docs/assets/img_archive/customEventPropertiesNested.png?b19bb6241ab8ce0a82217365d63c96ad "customEventPropertiesNested.png"){: style="max-width:70%;"}

### Personalize messages

You can also use custom event properties for personalization within the messaging template. Any campaign using [action-based delivery](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/) with a trigger event can use custom event properties from that event for messaging personalization.

For example, if you have a gaming app and want to send a message to users who completed a level, you could further personalize your message with a property for the time it took users to complete that level. In this example, the message is personalized for three different segments using [conditional logic](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/conditional_logic/). The custom event property called `time_spent` can be included in the message by calling `` {{event_properties.${time_spent}}} ``.


```liquid
{% if {{event_properties.${time_spent}}} < 600 %}
Incredible work, hero! Are you ready to test your skills against other powerful heroes? Visit the Arena for real-time battles with top players from around the globe.
{% elsif {{event_properties.${time_spent}}} < 1800 %}
Great job, hero! Don't forget to visit the town store between levels to upgrade your tools.
{% else %}
Well done, hero! Talk to villagers for tips on how to beat levels faster and unlock more rewards.
{% endif %}
```


**Warning:**


If the user doesn't have an internet connection, triggered in-app messages with templated custom event properties (for example, ``{{event_properties.${time_spent}}}``) will fail and not display.



For a full list of Liquid tags that will cause in-app messages to deliver as templated in-app messages, refer to [Frequently asked questions](https://www.braze.com/docs/user_guide/channels/in_app_messages/faq#what-are-templated-in-app-messages/).

#### Considerations with filters

- **API calls:** When making API calls and using the "is blank" filter, a custom event property is considered "blank" if excluded from the call. For example, if you were to include `"event_property": ""`, then your users would be considered "not blank".
- **Integers:** When filtering for a number custom event property and the number is very large, don't use the "exactly" filter. If a number is too large, it may be rounded at a certain length, so your filter won't work as expected.

### Segmentation

Use event property segmentation to target users based on custom events taken and the properties associated with those events. This increases your filtering options when segmenting by purchase and custom events.

Event properties for custom events are updated in real-time for any segment that uses them. You can manage properties by going to **Data Settings** > **Custom Events** and selecting **Manage properties** for the associated custom event. Custom event properties used in certain segment filters have a maximum look-back history of 30 days.

#### Adding event properties for segmentation

You need the "Edit Custom Event Property Segmentation" [user permission](https://www.braze.com/docs/user_guide/data/infrastructure/data_points#viewing-data-point-usage) to create segments based on event property recency and frequency.

By default, you can have 20 segmentable event properties per workspace. Contact your Braze account manager to increase this limit.

To add event properties for segmentation, do the following:

1. Go to your custom event and select **Manage properties**.
2. Select the **Enable segmentation** toggle to add the event property for segmentation. You can access additional filtering options when segmenting.

The event property segmentation filters include:

- Has done a custom event with property A with value B, X times in the last Y days.
- Has made any purchases with property A with value B, X times in the last Y days.
- Adds the ability to segment within 1 to 30 days.

![A filter group that has 'Abandoned Cart' with property 'number of items' and value 2 more than 1 time in the last 30 calendar days.](https://www.braze.com/docs/assets/img/nested_object3.png?e737f9afc6c05f1115860d67c189e868)

Data is logged only for a given event property after you enable it, and event properties are available only from that date moving forward.

#### Data points

In regards to subscription usage, custom event properties enabled for segmentation with the following filters are all counted as separate data points in addition to the data point counted by the custom event itself:

- `X Custom Event Property in Y Days`
- `X Purchase Property in Y Days`

### Canvas entry properties and event properties

You can use Canvas entry properties and event properties in your Canvas user journeys.




[Canvas entry properties](https://www.braze.com/docs/api/objects_filters/context_object/) are the properties you map for Canvases that are action-based or API-triggered. Note that the `canvas_entry_properties` object has a maximum size limit of 50 KB.

**Note:**


For in-app message channels specifically, `context` can only be referenced in Canvas.



You can reference `context` in any Message step with this Liquid format: `` context.${property_name} ``. Note that the events must be custom events or purchase events to be used this way.

#### Use case


Let's say a retail store, RetailApp, has the following request: `\"context\" : {\"product_name\" : \"shoes\", \"product_price\" : 79.99}`. 

RetailApp can pull the product name (shoes) into a message with this Liquid: `{{context.${product_name}}}`.


RetailApp can also trigger specific messages to send for different `product_name` properties in a Canvas that targets users after they've triggered a purchase event. For example, they can send different messages to users who purchased shoes and users who purchased something else by adding the following Liquid into a Message step.


```markdown
{% if  {{context.${product_name}}} == "shoes" %}
  Your order is set to ship soon. While you're waiting, why not step up your shoe care routine with a little upgrade? Check out our selection of shoelaces and premium shoe polish.
{% else %}
  Your order will be on its way shortly. If you missed something, you have until the end of the week to add more items to your cart for the same discounts.
{% endif %}

```


**Expand for original Canvas editor**



You can no longer create or duplicate Canvases using the original editor. This section is available for reference only. For the Canvases built with the original editor, Canvas entry properties can be referenced in the first full step of a Canvas only.







Event properties refer to the properties you set for custom events and purchases. These `event_properties` can be used in campaigns with action-based delivery and Canvases.

**Important:**


You can't use `event_properties` in the first Message step of your Canvas. Instead, you must use `context` or add an Action Paths step with the corresponding event **before** the Message step that includes `event_properties`.



In Canvas, custom event and purchase event properties can be used in Liquid in any Message step that follows an Action Paths step. Make sure to use  ``{{event_properties.${property_name}}}`` if you're referencing these event properties. These events must be custom events or purchase events to be used this way in the Message component.

In the first Message step following an Action Path, you can use event properties related to the event referenced in that Action Path. However, these event properties can only be used if the user actually performed the action (and didn't get sorted into the Everyone Else group). You can have other steps (that are not another Action Paths or Message step) in between this Action Paths and the Message step.

**Expand for original Canvas editor**



You can no longer create or duplicate Canvases using the original editor. This section is available for reference only. For the original Canvas editor, event properties can't be used in scheduled full steps. However, you can use event properties in the first full step of an action-based Canvas, even if the full step is scheduled.







Refer to [Canvas entry properties and event properties](https://www.braze.com/docs/user_guide/engagement_tools/canvas/create_a_canvas/canvas_entry_properties_event_properties/) for more information and examples.

### Nested objects {#nested-objects}

You can use nested objects (objects inside of another object) to send nested JSON data as properties of custom events and purchases. This nested data can be used for templating personalized information in messages, triggering message sends, and segmenting users.

To learn more, refer to our dedicated page on [Nested objects](https://www.braze.com/docs/user_guide/data/activation/events/custom_events/nested_objects/).

## Custom event property storage

Custom event properties are designed to help you increase targeting precision and make messages feel even more personalized. Custom event properties can be stored within Braze in both the short and long term.

You can segment based on the values of event properties in two ways:

1. **Within 30 days:** You can use event property segmentation based on the frequency and recency of specific event property values within Braze segments. This option impacts data usage.<br><br>
2. **Within and beyond 30 days:** To cover both short-term and long-term event property segmentation, you can use [Segment Extensions](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/). This feature segments users based on custom events and event properties tracked within the past two years. This option does not impact data usage.

Contact your Braze customer success manager for recommendations on the best approach depending on your specific needs.
