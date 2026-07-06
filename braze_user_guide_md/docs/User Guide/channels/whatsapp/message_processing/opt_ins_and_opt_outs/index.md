# Opt-in and opt-out

> Handling WhatsApp opt-ins and opt-outs is crucial as WhatsApp monitors your [phone number quality rating](https://www.facebook.com/business/help/896873687365001), and low ratings may result in your message limits being reduced. <br><br>One way to build a high-quality rating is to prevent users from blocking or reporting your business. This can be done by providing [high-quality messaging](https://developers.facebook.com/docs/whatsapp/messaging-limits#quality-rating-and-messaging-limits) (such as value to your users), controlling message frequency, and allowing customers to opt-out of receiving future communications. <br><br>This page covers how to set up opt-ins and opt-outs, and the differences between the "regex" and "is" modifiers.

Opt-ins can come from external sources or from Braze methods, such as SMS or in-app and in-browser messages. Opt-outs can be dealt with using keywords set in Braze and WhatsApp marketing buttons. Reference the following methods for guidance on setting up opt-ins and opt-outs.

#### Opt-in methods
- [External to Braze opt-in methods](#external-to-braze-opt-in-methods)
  - [Externally built opt-in list](#externally-built-opt-in-list)
  - [Outbound message in customer support WhatsApp channel](#outbound-message-in-customer-support-whatsapp-channel)
  - [Inbound WhatsApp message](#inbound-whatsapp-message)
- [Braze-powered opt-in methods](#braze-powered-opt-in-methods)

#### Opt-out methods
- [General opt-out keywords](#general-opt-out-keywords)
- [Marketing opt-out selection](#marketing-opt-out-selection)

## Set up opt-ins for your Braze WhatsApp channel

For WhatsApp opt-ins, you must comply with [WhatsApp's requirements](https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in/). You will also need to provide Braze with the following information:
- An `external_id`, a [phone number](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/user_phone_numbers/), and an updated subscription status for every user. This can be done by using the [SDK](https://braze-inc.github.io/braze-swift-sdk/documentation/brazekit/braze/user-swift.class/addtosubscriptiongroup(id:fileid:line:)/) or through the [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) to update the phone number and subscription status.

**Note:**


Braze released an improvement to the `/users/track` endpoint that allows updates to the subscription status that you can learn about in [Subscription groups](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/subscription_groups/#update-subscription-status). However, if you have already created opt-in protocols using the [`/v2/subscription/status/set` endpoint](https://www.braze.com/docs/api/endpoints/subscription_groups/post_update_user_subscription_group_status_v2/), you may continue to do so there.



### External to Braze opt-in methods

Your app or website (account registration, checkout page, account settings, credit card terminal) to Braze.

Wherever you already have marketing consent for email or texting, include an additional section for WhatsApp. After a user opts-in, they need an `external_id`, a [phone number](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/user_phone_numbers/), and updated subscription status. To do this, depending on how your install of Braze is set up, either leverage the [`/subscription/status/set` endpoint](https://www.braze.com/docs/api/endpoints/subscription_groups/post_update_user_subscription_group_status/) or use the [SDK](https://braze-inc.github.io/braze-swift-sdk/documentation/brazekit/braze/user-swift.class/addtosubscriptiongroup(id:fileid:line:)/).

#### Externally built opt-in list

If you have used WhatsApp previously, you may have already built a user list with opt-ins per the WhatsApp requirements. In this case, upload a CSV or use the API with the [following information](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users#csv) into Braze.

#### Outbound message in customer support WhatsApp channel

In your customer support channel, follow up on resolved issues with an automatic message asking if they want to opt-in to marketing messaging. The functionality here depends on the feature availability in your customer support tool of choice and where you keep user information.

1. Provide a [message link](https://business.facebook.com/business/help/890732351439459?ref=search_new_0) from your WhatsApp Business phone number.
2. Provide [quick reply actions](https://www.braze.com/docs/user_guide/channels/whatsapp/message_processing/messaging_users/#quick-replies) where the customer replies "Yes" to indicate opt-in
3. Set up custom keyword trigger.
4. For either of those ideas, you will probably need to finish the path with the following:
	- Call the [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) to either update or create a user
	- Leverage the [`/subscription/status/set` endpoint](https://www.braze.com/docs/api/endpoints/subscription_groups/post_update_user_subscription_group_status/) or use the [SDK](https://braze-inc.github.io/braze-swift-sdk/documentation/brazekit/braze/user-swift.class/addtosubscriptiongroup(id:fileid:line:)/)

#### Inbound WhatsApp message 

Have customers send an inbound message to the WhatsApp number.

This can be set up as a Canvas or a campaign, depending on whether you'd like the user to receive a confirmation message on the new channel.

1. Create a campaign with the action-based delivery trigger of an inbound message.
2. Create a webhook campaign. For an example webhook, see [Subscription groups](https://www.braze.com/docs/user_guide/channels/whatsapp/message_processing/opt_ins_and_opt_outs/#update-subscription-status).

**Tip:**


Note that you can build a URL or QR code to join a WhatsApp channel from within the [WhatsApp manager](https://business.facebook.com/wa/manage/phone-numbers/) under **Phone Number** > **Message Links**.<br>![WhatsApp QR code composer.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp115.png?5a236225d93e6ac70c2c4814a6c6d292){: style="max-width:55%;"}



### Braze-powered opt-in methods 

#### SMS message

In Canvas, set up a campaign that asks customers if they want to opt-in to receiving WhatsApp messages by using one of the following methods:
- Customer segment: subscribed marketing group outside of the US
- Custom keyword trigger setup

Learn about updating the subscription status of user profiles by viewing [Subscription groups](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/subscription_groups/#update-subscription-status).

#### In-app or in-browser message

Create an in-app message or in-browser pop-up prompting customers to opt-in to WhatsApp usage.

Use [HTML in-app message](https://github.com/braze-inc/in-app-message-templates/tree/master/braze-templates/4-sms-capture-modal) with [JavaScript "bridge"](https://www.braze.com/docs/user_guide/channels/in_app_messages/message_types/custom_html#javascript-bridge) to interface with Braze SDK. Make sure to use the WhatsApp subscription group ID. 

#### Phone number capture form

Use the [phone number capture form](https://www.braze.com/docs/user_guide/messaging/templates/in_app_message_templates/phone_number_capture/) template in the drag-and-drop editor for in-app messages to collect user phone numbers and grow your WhatsApp subscription groups.

## Set up opt-outs for your Braze WhatsApp channel

### WhatsApp "Offers and Announcements" toggle

WhatsApp provides an "Offers and Announcements" toggle in the app settings that allows users to opt out of marketing messages. This toggle operates independently from Braze subscription groups:

- **Braze subscription groups** are managed through your Braze integration (API, preference center, or SDK) and control which users you target for messaging.
- **WhatsApp's native toggle** is controlled by Meta and enforced at the platform level, outside of Braze.

These two layers don't sync automatically by design. When a user turns off the "Offers and Announcements" toggle in WhatsApp, Meta blocks marketing message delivery at the platform level, even if the user's Braze subscription status shows as "Subscribed". The user's preference is respected at the point of delivery.

**Note:**


Because Braze doesn't receive an opt-out signal until a send attempt is made and Meta returns an error, subscription counts in Braze may not reflect users who have opted out through the WhatsApp toggle until a message is attempted. This means reach estimates may be slightly overstated until that feedback loop occurs.



### General opt-out keywords

You can set up a campaign or Canvas that allows users who message in particular words to opt-out of future messaging. Canvases can be especially beneficial as they allow you to include a follow-up message that confirms the successful opt-out. 

#### Step 1: Create a Canvas with a trigger of "Inbound WhatsApp Message"
 
![Action-based Canvas entry step that enters users who send a WhatsApp inbound message.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp116.png?f888db38ded1694a470a1616ad51c36b){: style="max-width:85%;"}

When selecting keyword triggers, include words like "Stop" or "No Message". If you choose this method, ensure your customers know your opt-out words. For example, after receiving the initial opt-in, include a follow-up response like "To opt-out of these messages, message "Stop" at any time." 

![Message step to send a WhatsApp inbound message where the message body is "STOP" or "NO MESSAGE".](https://www.braze.com/docs/assets/img/whatsapp/whatsapp117.png?cb795698ddde4271e8f7a7421f153814){: style="max-width:85%;"}

#### Step 2: Update the user's profile

Update the user's profile by using one of the methods described in [Subscription groups](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/subscription_groups/#update-subscription-status).

### Marketing opt-out selection

Within the WhatsApp message template creator, you can include the "marketing opt-out" option. Any time you include this, ensure the template is used in a Canvas with a subsequent step for a subscription group change. 

1. Create a message template with the "marketing opt-out" quick reply.<br>![Message template with a footer option of "Marketing opt-out"](https://www.braze.com/docs/assets/img/whatsapp/whatsapp121.png?4d667d71847404ddf433a942abc7f7e3)<br><br>![Section to configure a marketing opt-out button.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp122.png?bcace6a2415533f8c045c4df988fcb01)<br><br>
2. Create a Canvas that uses this message template.<br><br>
3. Follow the steps in the preceding example but with the trigger text "STOP PROMOTIONS".<br><br>
4. Update the user's subscription status by using one of the methods described in [Subscription groups](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/subscription_groups/#update-subscription-status).

## Set up opt-in and opt-out workflows

You can configure "START" and "STOP" keyword response workflows for WhatsApp with these two methods:

- [User Update step](#user-update-step)
- [Webhook campaign to trigger a second WhatsApp campaign](#webhook-campaign-to-trigger-a-second-whatsapp-campaign)

### User Update step

The [User Update step](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/user_update/) can add the user's phone number to the WhatsApp subscription group when the user sends a keyword to the subscription group's phone number.

The User Update step avoids race conditions because the user won't progress to the next step in the Canvas before their phone number is added to the subscription group. It also has fewer steps to set up than the other methods, so Braze generally recommends this method.

1. Create a Canvas with the action-based step **Send a WhatsApp Inbound Message**. Select **Where the message body** and enter "START" for **Is**.

**Important:**


For "STOP" messages, invert the message step confirming the opt-out and the User Update step. If you don't, the user will be opted out of the subscription group first, and then will not be eligible to receive the confirmation message.



![A WhatsApp message step where the message body is "START".](https://www.braze.com/docs/assets/img/whatsapp/whatsapp_inbound_message.png?2bb6632619d439eb49643afe2d64903f){: style="max-width:80%;"}

{: start="2"}
2. In the Canvas, create a **Set Up User Update** step and for **Action** select **Advanced JSON Editor**. <br><br>![User Update step with an action of "Advanced JSON Editor".](https://www.braze.com/docs/assets/img/whatsapp/user_update.png?6d5abf9e845ea0c60e54fede84a24d6d)<br><br>
3. Populate the **User Update object** with the following JSON payload, replacing `XXXXXXXXXXX` with your subscription group ID:


```json
{
    "attributes": [
        {
            "subscription_groups": [
                {
                    "subscription_group_id": "XXXXXXXXXXX",
                    "subscription_state": "subscribed"
                }
            ]
        }
    ]
}
```


{: start="4"}
4. Add a subsequent WhatsApp message step. <br><br>![User Update step in a Canvas.](https://www.braze.com/docs/assets/img/whatsapp/message_step.png?adebc1d78a6da3f396c59c7bd2dfa0a0){: style="max-width:25%;"}

#### Considerations

The update might complete at variable speeds because Braze batches the [User Update step](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/user_update/) requests.

### Webhook campaign to trigger a second WhatsApp campaign

A Webhook campaign can trigger entry into a second campaign after adding the user's phone number to the WhatsApp subscription group when the user sends a keyword to the subscription group's phone number.

**Important:**


You do not need to use this method for STOP messages. The confirmation message will be sent before the user is removed from the subscription group, so you can use one of the other two steps.



1. Create a campaign or Canvas with an action-based step **Send a WhatsApp Inbound Message**. Select **Where the message body** and enter "START" for **Is**.

![WhatsApp message step where the message body is "START".](https://www.braze.com/docs/assets/img/whatsapp/whatsapp_inbound_message.png?2bb6632619d439eb49643afe2d64903f){: style="max-width:85%;"}

{: start="2"}
2. In the campaign or Canvas, create a Webhook Message step, and change the **Request Body** to **Raw Text**.

![Message step for a webhook.](https://www.braze.com/docs/assets/img/whatsapp/webhook_step.png?ce9a835a3db9f36d6a90faf97dd4248c){: style="max-width:85%;"}

{: start="3"}
3. Enter the customer's [endpoint URL](https://www.braze.com/docs/api/basics/) in the **Webhook URL**, followed by the endpoint link `campaigns/trigger/send`. For example, `https://dashboard-02.braze.eu/campaigns/trigger/send`.

![Webhook URL field under the "Compose Webhook" section.](https://www.braze.com/docs/assets/img/whatsapp/campaigns_webhook_url.png?8b0dd31e743d4dce4ea7d45c4e9e86fb){: style="max-width:70%;"}

{: start="4"}
4. In the raw text, enter the following JSON payload and replace `XXXXXXXXXXX` with your subscription group ID. You will need to replace the `campaign_id` after creating your second campaign.


```json
{
    "campaign_id": "XXXXXXXXXXX",
    "recipients": [
        {
            "external_user_id": "{{${user_id}}}",
            "attributes": {
                "subscription_groups": [
                    {
                        "subscription_group_id": "XXXXXXXXXXX",
                        "subscription_state": "subscribed"
                    }
                ]
            }
        }
    ]
}
```


{: start="5"}
5. Create a WhatsApp campaign (your second campaign) and set the trigger to API. Make sure you copy this `campaign_id` into the JSON payload of your first campaign.

#### Considerations

- Attribute updates from within the Canvas API trigger JSON payload is not yet supported, so you can only trigger a WhatsApp campaign for the WhatsApp response message (as in step 2).
- A WhatsApp template must be approved to send it as a response message. This is because a quick response requires the inbound message trigger to be inside the same campaign or Canvas. If you use a [User Update step](#user-update-step), you can send a quick response message without Meta approval.

## Understanding the difference between "regex" and "is" modifiers

In this table, `STOP` is used as an example trigger word to demonstrate how the modifiers work.

| Modifier | Trigger word | Action |
| --- | --- | --- |
| `Is` | `STOP` | Catches any whole word use of "stop" regardless of case. For example, this catches "stop" but not "please stop". |
| `Matches regex` | `STOP` | Catches any use of "STOP" in that exact case. For example, this catches "STOP" and "PLEASE STOP" but not "stop". |
| `Matches regex` | `(?i)STOP(?-i)` | Catches any use of "STOP" in any case. For example, this catches "stop", "please stop", and "never stop sending me messages". |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Understanding the difference between "regex" and "is" modifiers" }

