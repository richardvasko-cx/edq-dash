# Message 

> Message steps allow you to add a standalone message where you want in your Canvas.

![A Message step named "Lunch promo" using the push channel.](https://www.braze.com/docs/assets/img/canvas_components/message_step1.png?385ee4d42492b765061877fb5a9e564f){: style="float:right;max-width:25%;margin-left:15px;"}

## Create a message

To create a Message component, first add a step to your Canvas. Drag and drop the component from the sidebar, or select the <i class="fas fa-plus-circle"></i> plus button at the bottom of a step and select **Message**. 

### Step 1: Select your messaging channel

You can select from the following messaging channels:
- Banners
- Content Cards
- Email
- LINE
- Push notifications
- SMS/MMS/RCS
- In-app messages
- Webhook
- WhatsApp

![A list of available messaging channels to select for the Message step.](https://www.braze.com/docs/assets/img/canvas_components/message_step2.png?9f758c3b59ccdbd832d4b8e6f2c48d46)

### Step 2: Edit delivery settings

Next, you can edit settings for Intelligent Delivery, Quiet Hours overrides, and delivery validation.

#### Intelligent Timing

You can enable [Intelligent Timing](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_timing/) with a fallback option when a user's profile does not have enough data to calculate an optimal time. We recommend enabling Intelligent Timing and [rate limiting](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping#rate-limiting-and-frequency-capping/) as an additional check for any delays between users entering the Message step and the actual message sending.

Select **Using Intelligent Timing** in the **Delivery Settings** tab. Here, you can select either the most popular time or a specific fallback time. If Quiet Hours are enabled, the Message step also allows you to override this setting.

![The Delivery Settings tab for Message component settings. Quiet Hours are enabled, and the checkbox for Using Intelligent Timing is selected to deliver the message at an optimal time.](https://www.braze.com/docs/assets/img/canvas_components/message_step4.png?8450c5f09b1192aa81ad04347a148d56){: style="max-width:90%;"}

#### Delivery validations

Delivery validations provide an additional check at message send to confirm your audience still meets your criteria. We recommend using it when Quiet Hours, Intelligent Timing, or rate limiting are enabled. Select **Validate audience at message send**, then add a segment or additional filters. If a user doesn't meet the validations, choose whether they exit the Canvas or advance to the next step.

Delivery validations evaluate user profile criteria at send time. App-related filters check whether a user recently used or ever used a specific app, but they don't confirm which app a user is using in their current session.

If your workspace has multiple apps and a Message step should target a specific app, use one of the following approaches instead:

- When composing the message, [specify your delivery platforms](https://www.braze.com/docs/user_guide/channels/in_app_messages/traditional/#step-2-specify-delivery-platforms), such as **Mobile Apps** or **Web Browsers**.
- Use Liquid to check the targeted device or app at send time:
  - `{{targeted_device.${platform}}}` evaluates the platform for the user's current session. For more information, see [Targeted device information](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/supported_personalization_tags/#targeted-device-information).
  - `{{app.${api_id}}}` evaluates which app is requesting the message. Combine this tag with `abort_message()` to prevent sends to the wrong app. For more information, see [Targeted app information](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/supported_personalization_tags/#targeted-app-information).

![Delivery Validations are enabled to validate the audience at message send. Delivery validations advancement behavior is set to progress the user to the next step in the Canvas if delivery validations are not met.](https://www.braze.com/docs/assets/img/canvas_components/message_step5.png?b7f0f9d772194934ebbd013b7eacfd5e){: style="max-width:90%;"}

## How users advance

All users who enter the Message step advance to the next step when any one of the following conditions is met:

- Any message is sent
- A message is frequency capped and not sent
- A message is aborted
- A user is not reachable by channel, so the message is not sent
- A user does not meet the criteria in **Delivery validations**


If an action-based Canvas is triggered by an inbound SMS message, you can reference SMS properties in the first step (Message step) or a Message step that is nested under an Action Path step. For example, in the Message step, you could use `{{sms.${inbound_message_body}}}` or `{{sms.${inbound_media_urls}}}`.


## Reference context properties









































Entry properties are configured in the **Entry Schedule** step of creating a Canvas and will indicate the trigger that enters a user into a Canvas. These properties can also access the properties of entry payloads in API-triggered Canvases. Note that the `context` object has a maximum size limit of 50 KB.

Entry properties can be used in Liquid in any Message step. Use the following Liquid when referencing these entry properties: ``{context.${property_name}}``. Events must be custom events or purchase events to be used this way.

**Note:**


For in-app message channels specifically, `context` can only be referenced in Canvas.



Use the following Liquid when referencing these entry properties: ``context.${property_name}``. Note that the events must be custom events or purchase events to be used this way.


For example, consider the following request: `\"context\" : {\"product_name\" : \"shoes\", \"product_price\" : 79.99}`. You could add the word "shoes" to a message with the Liquid `{{context.${product_name}}}`.


You can also leverage [persistent entry properties](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/context_and_event_properties/canvas_persistent_entry_properties/) in any Message step to guide your users through personalized steps throughout your Canvas workflow.

### Event properties

Event properties refer to the properties that you set for custom events and purchase events. These event properties can be used in campaigns with action-based delivery as well as Canvases. 

In Canvas, custom event and purchase event properties can be used in Liquid in any Message step that follows an [Action Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/action_paths/) step. For example, when referencing `event_properties`, use this Liquid snippet: ``{{event_properties.${property_name}}}`` 

**Important:**


`event_properties` can't be used independently of Action Paths steps.



In the first Message step following an Action Path, you can use `event_properties` related to the event referenced in that Action Path. You can have other steps (that are not another Action Paths or Message step) in between this Action Paths step and the Message step. Note that you'll only have access to `event_properties` if your Message step can be traced back to a non-Everyone Else path in an Action Path step.

**Important:**


You can't use `event_properties` in the lead Message step. Instead, you must use `context` or add an Action Paths step with the corresponding event before the Message step that includes `event_properties`.



**Expand for original Canvas editor**



You can no longer create or duplicate Canvases using the original editor. This section is available for reference only.

- `event_properties` can't be used in scheduled full steps. However, you can use `event_properties` in the first full step of an action-based Canvas, even if the full step is scheduled.
- `context` can be referenced only in the first full step of a Canvas.
- For in-app message channels specifically, `context` can be referenced in the original Canvas editor if you have persistent entry properties enabled as part of the previous early access.




## Analytics

Refer to the following table for definitions of Message component metrics: 

| Metric | Description |
| --- | --- |
| _Entries_ | The number of times the step has been entered. If your Canvas has re-eligibility and a user enters a Message step twice, two entries will be recorded. |
| _Proceeded to Next Step_ | The number of entries that proceeded to the next step in the Canvas. |
| _Sends_ | The total number of messages the step has sent. If your Canvas re-eligibility and a user enters a Message step twice, two entries will be recorded. |
| _Unique Recipients_ | The number of users who have received messages from this step. |
| _Primary Conversion Event_ | The number of times a defined event occurred after interacting with or viewing a received message from a Braze campaign. You define this event when building the campaign. |
| _Revenue_ | The total revenue in dollars from campaign recipients within the set primary conversion window. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Analytics" }
