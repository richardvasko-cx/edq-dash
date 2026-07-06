# User retargeting

> In addition to changing the user's subscription state and sending auto-responses based on incoming keywords, Braze will also record interactions to the user profile for filtering and triggering messages.<br><br>These filters and triggers allow you to filter actions based on users who have been sent or have responded to SMS, MMS, and RCS campaigns, or further engage with users who have clicked shorted URLs.

**Tip:**


To read more about custom keywords and how to set up two-way messaging to take advantage of these retargeting options, visit our [custom keyword](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/keyword_handling/) article.

  

## Retargeting options

**Note:**


When building audiences with user retargeting, you may wish to include or exclude certain users based on their preferences, and in order to comply with privacy laws, such as the “Do Not Sell or Share” right under the CUP. Marketers should implement the relevant filters for users’ eligibility within their Canvas and/or Campaign entry criteria.



### Filter users by SMS, MMS, and RCS

Users can be filtered by when they last received an SMS, MMS, or RCS or if they have received an SMS, MMS, or RCS from a specific campaign. Filters can be set in the **Target Audiences** step of the campaign builder. 

**Note:**


When a message is received, opened, or clicked, Braze updates data for all profiles that share the same phone number as the profile that logged the interaction. Users who share a phone number with someone who received, opened, or clicked the message can match this filter even if they were not originally in the campaign or were not directly sent the message.



#### Filter by last received SMS/MMS/RCS

![Segmentation filter Last Received SMS after December 8, 2020.](https://www.braze.com/docs/assets/img/sms/filter2.png?d3e74bda93f4a009abf26ff471ef0047)

#### Filter by received messages from SMS/MMS/RCS campaign

Filters users who have received a message from a specific campaign. With this filter, you also have the option to filter off those that have not received messages from a campaign.

![Segmentation filter Has received message from campaign "SMS retargeting".](https://www.braze.com/docs/assets/img/sms/filter1.png?7a59aa155d5f51453c0569b88c9101b3)

### Trigger messages as users receive SMS, MMS, or RCS {#trigger-messages}

To trigger messages as users receive SMS, MMS, or RCS messages from a specific campaign, select **Interact with Campaign** as the trigger action for an action-based campaign. Next, select **Receive SMS** and the SMS, MMS, or RCS campaign you would like to use.

![](https://www.braze.com/docs/assets/img/sms/trigger.png?ad1574286a26c3b5625028d78a6c3488)

### Filter by advanced tracking links

Retarget users who have clicked campaigns with [advanced tracking links](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/link_shortening/).
Only campaigns that have advanced tracking enabled appear in the following dropdowns:

#### Retarget users who have clicked a specific SMS, MMS, or RCS Campaign

1. Create a segment using the **Clicked/Opened Campaign** filter.
2. Select **clicked shortened sms link**.
3. Choose the desired campaign.

![](https://www.braze.com/docs/assets/img/sms/retargeting5.png?32d68323f8987a9bf85876f4a00cfcee)

#### Retarget users who have clicked a specific Canvas Step

1. Create a segment using the **Clicked/Opened Step** filter.
2. Select **clicked shortened sms link**.
3. Choose the desired Canvas and Canvas step.

![](https://www.braze.com/docs/assets/img/keyword_example1.jpg?c5399d5e1558e4a977928534d5846662)

## Keyword category-specific retargeting

In addition to the three default keyword categories (Opt-in, Opt-out, and Help), you are also able to create up to 25 of your own keyword categories, allowing you to identify arbitrary keywords and responses. These categories can be used for filtering and retargeting. To read more about Global keyword categories and how to set them up, refer to [Keyword processing](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/). 

### Filter by recency

Filter for the recency of a user responding to your SMS, MMS, or RCS program. This filter will evaluate the last date a user sent an inbound message that is within one of the keyword categories. 

![Segmentation filter Last sent SMS to subscription group "Marketing SMS" with keyword "Opt-in" after August 11, 2020.](https://www.braze.com/docs/assets/img/sms/retargeting1.png?e47106bd565b0b4af6c86d6a62787cba)

### Filter by campaign or Canvas attribution

Filter for users who have replied to a specific SMS, MMS, or RCS campaign or Canvas component, keyword category, or tag.

#### Filter by replied to a specific campaign with keyword category

![Campaign with the filter "Has replied to SMS" for campaign "SMS-283" "Promotion". Under the filter the feature mentions "This filter will expire 25 months after the last message is sent from "Promotion" if it is not being used in any active campaign."](https://www.braze.com/docs/assets/img/sms/clicked_opened_campaign.png?e66ec315ef60641e41c3e54a2ab5065a)

#### Filter by replied to a campaign or Canvas with a specific tag

![Campaign with the filter "Has replied to SMS" for campaign or Canvas with tag "Curbside Messaging Service C".](https://www.braze.com/docs/assets/img/sms/clicked_opened_campaign_canvas_tag.png?07aa1c64ef330723fa182cddae327e6b)

#### Filter by replied to a specific step

![Campaign with the filter "Has replied to SMS" for step "SMS Double Opt" "Step - Help".](https://www.braze.com/docs/assets/img/sms/clicked_opened_step.png?c3d50ee217d52f7ae8a132ee79d20749)

### Trigger messages by keyword

Messages can be triggered as users send messages inbound based on keyword categories (user sent any one of the keywords) or other keywords (user sent a keyword that does not fall into one of the existing categories). These triggers are set in the Delivery step of the campaign builder.

When evaluating if an inbound message meets a defined trigger event, the leading and trailing spaces are removed before evaluation begins.

**Tip:**

 
If an action-based Canvas is triggered by an inbound SMS or MMS message, you can reference [supported SMS Liquid properties](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/supported_personalization_tags/) in any Canvas step until the next action path.



#### Trigger by inbound keyword category

![Action-based SMS campaign with the segmentation filter Sent keyword "Opt-in" to subscription group "Marketing SMS".](https://www.braze.com/docs/assets/img/sms/retargeting2.png?6bd37c2f43d33c62558efd12df54e40a){: style="margin-top:10px;"}

#### Trigger by arbitrary keywords

Note when triggering a message on an "Other" keyword response, you have the opportunity to evaluate the keyword body on an exact text match. This match follows the same rules as noted: Only the **exact, single-word message** is processed (case _insensitive_). A keyword sent of `Hello Braze!` would not match the criteria shown in the following example. 

![Action-based SMS campaign with keyword category as "Other" where the message body is exactly "Hello" or "Hey".](https://www.braze.com/docs/assets/img/sms/retargeting3.png?a4f92737394d74e3f95731526ad25151){: style="margin-top:10px;"}

#### Template keywords

When triggering a campaign or Canvas component on an inbound SMS or MMS, you can optionally template the text or media attachments that your user sent into the body of your campaign or Canvas with Liquid. This enables you to access the user's response which you can then include in your reply, apply conditional logic to, or anything else you can do with Liquid. 



```liquid
Sorry, we didn't recognize {{sms.${inbound_message_body}}}. Text HELP for help or STOP to stop.
```

```liquid
{% if {{sms.${inbound_message_body}}} == "SNEAKERS" %}
OK, you're subscribed to updates on all our sneaker deals!
{% elsif {{sms.${inbound_message_body}}} == "SHIRTS" %}
Shirt deals coming up for you!
{% else %}
Want to receive a specific deal? Just text us the category you're interested in. For example SHIRTS or SNEAKERS.
{% endif %}
```



[16]: /docs/assets/img/keyword_example1.jpg?c5399d5e1558e4a977928534d5846662
[16]: /docs/assets/img/sms/retargeting4.png?31efe1da5d62d5145e9c4828d9b18b81
