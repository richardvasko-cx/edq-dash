# User messages

> WhatsApp is a two-way communication channel. Not only can your brand send users messages, but they can engage in conversations using templated campaigns and Canvases. There are various ways to do this, including WhatsApp quick replies, list messages, and trigger words. Quick reply and list message calls-to-action (CTAs) are a great way to encourage user engagement with your WhatsApp messaging.

## Action-based triggers 

Both campaigns and Canvases can start, branch, and have mid-journey changes from an inbound WhatsApp message (a user messaging your WhatsApp), such as a trigger word. 

Ensure that your trigger word matches what you are expecting from users.

**Things to know:**
- Each letter of your trigger word must be capitalized when configured. Braze does not require inbound trigger words sent by users to be capitalized. For example, messaging "jOin2023" will still trigger the Canvas or campaign.
- If no trigger word is specified on the entry schedule action-based trigger, the campaign or Canvas will run for ALL inbound WhatsApp messages. This includes messages that have matched phrases across active campaigns and Canvases, in which case the user will receive two WhatsApp messages.




![Action-based campaign scheduling options.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp27.png?56685b32c7f62318e84177aaf0cc5921)




![Action-based Canvas scheduling options.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp25.png?b42bd5c52ff31526037a59976cd22559)




## Unrecognized responses

We recommend that you include an option for unrecognized responses on interactive Canvases. This guides users to understand what are available prompts and sets expectations for the channel. Expectation management can be especially helpful if you have WhatsApp channels with live agent chat. 
- In the action step, after creating the action groups for the custom filter phrases, add an additional action group for "Send WhatsApp message", but **do not check Where the message body**. This will catch all unrecognized user responses, similar to an "else" clause. 
- We recommend following up with a WhatsApp message informing the user that this channel is not manned and guiding them to a support channel if needed. 

## Quick replies 

![Phone screen showing a call to action button will reply the text of the button clicked.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp11.png?e90961a715be9b0cd83195ae2969ef5f){: style="float:right;max-width:25%;margin-left:15px;border: 0;"}

Quick replies appear as clickable button options within the conversation but act as if a user replied with text. Braze then processes these as inbound messages, and can send back set responses based on the button clicked. Use the "Inbound WhatsApp message action" step when creating and filtering responses from your users.

![A WhatsApp message showing text and three call to action buttons.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp13.png?610beb63a8b269bdbb262e8a5a6efa36){: style="max-width:50%;"}

### Configure the quick reply experience in Canvas

#### Step 1: Build out CTAs

First, build out your Quick Reply CTAs in the [WhatsApp Message Template Manager](https://business.facebook.com/wa/manage/message-templates/) within a message template. 

![The WhatsApp message template manager UI showing how to create a CTA button, providing the button type (custom) and the button text.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp12.png?4cec17ecf3ab2313a5e09a8f3bbb3ff9){: style="max-width:80%;"}

Once your template has been submitted and approved by WhatsApp, you can use it to build a Canvas within Braze. 

**Tip:**


You can build the Canvas before receiving the approval on your message template. 



#### Step 2: Build your Canvas

Next, build a Canvas with a message step that includes your created template. 

![WhatsApp step message composer with a populated quick reply template.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp14.png?110f7f6c7717e162ab764735ceffd716)

Create an action step that follows the message step. Create one group per quick reply option in this action step.

![A Canvas where the evaluation action is "send a whatsapp inbound message".](https://www.braze.com/docs/assets/img/whatsapp/whatsapp15.png?ed0695b02fc9d904e51382143ba82097)

For each quick reply option group, specify the exact text as the button you are matching. Note that the keywords must be in uppercase. 

![A Canvas step where the action "send a whatsapp inbound message" is set to send when a specific message body is received.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp16.png?5bc28f0bca10947a93f49821566acc02)

If you would like a default response for users who respond to the message with text instead of quick replies, create an additional group with no matching message body.

Continue building the Canvas as you would otherwise from this point forward.

### Responses

You will most likely want a reply message for each response. We recommend having a catch-all option for responses outside the bounds of quick replies (such as for customers who respond with a general message rather than a predetermined prompt). For example, "We’re sorry, we didn’t recognize your response. For support issues, please message <support channel>."

![A Canvas built out showing the responses for each call-to-action button.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp18.png?f138680c21fa71d4f8162e8a7281daaf)

Note that you can use any subsequent actions that the Braze Canvas offers, such as messages in response, user profile updates, or Braze-to-Braze webhooks. 

## List messages

List messages appear as a body message with a list of clickable options. Each list can have multiple sections, and each list can have up to 10 rows.

![Example of a WhatsApp list message with rows for different fashion styles.](https://www.braze.com/docs/assets/img/whatsapp/list_message_example.png?36e35e8f04d68ce2fc0571c6bbedfb03){: style="max-width:40%;"}

### Configure the list message experience in Canvas

#### Step 1: Create or edit an existing action-based Canvases

You can only add WhatsApp list messages to Canvases that are action-based, as they need to be in response to a user message.

#### Step 2: Create a WhatsApp Message step

Add a WhatsApp [Message step](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/message_step/), and then select the response message layout of **List Message**.

![A selectable collection of the different types of WhatsApp response messages you can create, including "List Message".](https://www.braze.com/docs/assets/img/whatsapp/list_message_option.png?2a35e77bc113528e0c05c28b94e5f1d0){: style="max-width:70%;"}

Add a **List button** name that users will select to display your list. Then, use the fields in **List content** to create your list:

- **Section:** Add up to 10 sections to group and organize your list items. For example, a clothing retailer could use sections to organize by seasonal styles (like spring, summer, autumn, and winter) or clothing items (like tops, bottoms, and shoes).
- **Row:** Add up to 10 rows, or list items, across all sections.
- **Row description (optional):** Add an optional description to all rows (list items).

![The "List content" section filled out with two sections, and several rows and row descriptions.](https://www.braze.com/docs/assets/img/whatsapp/list_content.png?daf56d9ddb8c019080138027e6f4e254){: style="max-width:60%;"}

Change the order of sections and rows by selecting and dragging the icon next to their names.

![Dragging a list section into a new location.](https://www.braze.com/docs/assets/img/whatsapp/drag_list_order.png?2983f8d43bff92b06ab1b553a464d541){: style="max-width:60%;"}

Back in the Canvas composer, add an [Action path](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/action_paths/) after the Message step that has a group for each list response. In each group:

1. Add a trigger for **Sent inbound WhatsApp subscription group** and select the respective WhatsApp subscription group.
2. Check the **Where the message body** checkbox.
3. Specify the content for one row (or list item).

![Composer for an Action path with groups for different clothing styles.](https://www.braze.com/docs/assets/img/whatsapp/action_path_list_message.png?4661e6f588c894d75abb8f391ea8f175)

Continue to build out your Canvas.

### Creating actions paths for long descriptions

If you have row descriptions, you must use **Matches regex** to specify a row. For example, if you want to specify a row with the description, "Our new style that fits over your favorite pair of ankle boots", you could use [regex](https://www.braze.com/docs/user_guide/audience/segments/regex/) with "ankle boots".

![A WhatsApp trigger using the filter for "Matches regex" to capture response messages with "ankle boots".](https://www.braze.com/docs/assets/img/whatsapp/regex_list_message.png?2ca4c40951f2c66d97479cfdff10479b)

## Considerations

### Timing requirements for response messages

Response messages need to be sent within 24 hours of receiving a user's message. To help build successful experiences, Braze checks the message logic to confirm there is an upstream inbound user message that unblocks the response message. 

The following events unblock response messages: 

- Inbound message 
  - [Action Path](https://www.braze.com/docs/action_paths/) or [action-based entry](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/) with the trigger **Send a WhatsApp inbound message**.

![An action-based entry step with the trigger "Send a WhatsApp inbound message".](https://www.braze.com/docs/assets/img/whatsapp/whatsapp_inbound_message_trigger.png?b1c4ced44353dc412960ddabd1d13fef)

- [API-triggered entry](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/api_triggered_delivery/)
- Inbound product message 
  - [`ecommerce.cart_updated`](https://www.braze.com/docs/user_guide/data/activation/events/recommended_events/ecommerce_events#types-of-ecommerce-recommended-events?tab=ecommerce.cart_updated) event

![An Action Path with the trigger of a performed custom event `ecommerce.cart_updated`.](https://www.braze.com/docs/assets/img/whatsapp/ecommerce_cart_updated.png?6835a47614c225f10006f4c5c3680725)

### Filtering by a custom time attribute

If your action-based WhatsApp campaign or Canvas audience depends on a custom time attribute falling within a relative window (for example, between now and the next 24 hours), combine two filters as described in [Time](https://www.braze.com/docs/user_guide/data/activation/custom_data/custom_attributes/#time).