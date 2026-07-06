# Custom keyword handling

> This reference article covers how Braze deals with two-way SMS, MMS, and RCS messaging and auto-responses. This includes explanations on how keyword triggering works as well as custom keyword categories and multi-language support.

## Two-way messaging (custom keyword responses)

Two-way messaging allows you to send messages and process the responses to those messages. It requires end-users to send a keyword to Braze, to which that user will receive an automatic reply. Applied correctly, two-way messaging can be a simple, immediate, and dynamic solution to customer marketing, saving time and resources along the way.

## Managing keywords and auto responses

SMS, MMS, and RCS with Braze gives you the option to create keyword triggers, custom responses, define keyword sets for multiple languages, and establish custom keyword categories. 

**Note:**


Braze uses your full set of opt-out keywords ([default keywords](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/optin_optout/) and [custom keywords](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/keyword_handling/)) for exact opt-out handling and [fuzzy opt-out](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/fuzzy_opt_out/).






#### Add keyword triggers

In addition to the default opt-in and opt-out keywords, you may also define your own keywords to trigger Opt-In, Opt-Out, and Help responses.

To define your own keywords, do the following:

1. In the Braze dashboard, go to **Audience** > **Subscription Group Management** and select an **SMS/MMS/RCS** subscription group.<br><br>
2. Under **Global Keywords**, select the pencil icon next to the keyword category you want to add a keyword to. ![Opt-in keywords with the pencil icon displaying.](https://www.braze.com/docs/assets/img/sms/sms_keywords.png?9a58afab3c3c146f8190a82ef858cfd1)<br><br>
3. In the tab that opens, add a keyword you want to trigger this keyword category. Note that keywords are case insensitive, and universal keywords like `START`, `YES`, and `UNSTOP` cannot be changed. ![Editing keywords for "Opt-In" category. Added keywords are "START", "UNSTOP", and "YES". The reply message field reads "You have been unsubscribed to messages from this number. Reply HELP for help. Reply STOP to unsubscribe. Message and data rates may apply."](https://www.braze.com/docs/assets/img/sms/keyword_edit2.png?c2bf2d0da77bcf835e91deb4f3a18949)

The following rules apply to keywords and keyword responses:

| Keywords | Keyword responses |
| -------- | ----------------- |
| - Valid UTF-8 encoded characters<br>- Maximum of 20 keywords per category total<br>- Maximum length of 34 characters<br>- Minimum length of 1 character <br>- Cannot contain spaces<br>- Required to be case insensitive and unique across the subscription group | - Cannot be blank<br>- Maximum length of 300 characters<br>- Valid UTF-8 characters |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Add keyword triggers" }

**Tip:**


Interested in seeing how these keywords can be used in your campaigns and Canvases to retarget and trigger messages? Visit [User retargeting](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/user_retargeting/) for more information.






#### Manage responses

You can manage your own responses that are sent to users after they text in a keyword to a specific keyword category.

1. In the Braze dashboard, go to **Audience** > **Subscription Group Management** and select an **SMS/MMS/RCS** subscription group. <br><br>
2. Under **Global Keywords**, select a keyword category to edit a response for by selecting the pencil icon. ![Opt-in keywords with the pencil icon displaying.](https://www.braze.com/docs/assets/img/sms/sms_keywords.png?9a58afab3c3c146f8190a82ef858cfd1)<br><br> 
3. In the tab that opens, edit your response. Be mindful of our [six rules to get compliance right](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/compliance_and_delivery/laws_and_regulations/#the-six-rules-to-get-compliance-right) as you create your response, and read the following rules that apply to keywords and keyword responses. ![Responses](https://www.braze.com/docs/assets/img/sms/keyword_home.png?d62e1e08719f2210ea407dd392be9664){: style="max-width:70%;"}<br><br>
4. To automatically shorten static URLs in your response, select the **Link Shortening** toggle. The character counter will update to show the expected length of the shortened URL. ![A GIF showing the character counter updating when the "Link Shortening" toggle is on.](https://www.braze.com/docs/assets/img/sms/link_shortening.gif?18623dce0cd6a779cdd2b605c73ee454){: style="max-width:60%;"}

##### Considerations

| Keywords | Keyword responses |
| -------- | ----------------- |
| - Valid UTF-8 encoded characters<br>- Maximum of 20 keywords per category total<br>- Maximum length of 34 characters<br>- Minimum length of 1 character <br>- Cannot contain spaces<br>- Required to be case insensitive and unique across the subscription group | - Cannot be blank<br>- Maximum length of 300 characters<br>- Valid UTF-8 characters |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Considerations" }




**Tip:**

 
If an action-based Canvas is triggered by an inbound SMS, MMS, or RCS message, you can reference SMS, MMS, or RCS properties in the first [message step](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/message_step/) of the Canvas.



## Multi-language support

When sending to certain countries, a sender may be required to support inbound keywords and outbound replies with a local language. To support this, Braze allows you to create a language-specific keyword setting. When created, language-specific keyword settings will apply to all sending numbers within the subscription group. 
![Dropdown displaying languages to add as a keyword setting.](https://www.braze.com/docs/assets/img/sms/multi-language.png?f395bf45ec22dfe9925e5bb0538b5c47){: style="float:right;max-width:50%;margin-left:10px;"}

### Creating language-specific keywords

Select **Add a Language** and select your target language or search for a language within the dropdown.

**Important:**


Non-English languages do not come with preset keywords and responses, so senders will need to work with their marketing and legal teams to add any required keywords to this set. Otherwise, Braze will not handle localized incoming messages for those languages. 



If you need to delete a language, select the **Delete Language** button at the bottom right.

![Global Keywords page with the "Italian" tab selected. Additional tabs exist for each added language.](https://www.braze.com/docs/assets/img/sms/multi-language2.png?011cb7b7c96f351e3cf45c0893634cda)

## Custom keyword categories

In addition to the three default keyword categories (Opt-in, Opt-out, and Help), you can also create up to 25 of your own keyword categories. This allows you to identify arbitrary keywords and set up responses specific to your business. An example category might be "PROMO" or "DISCOUNT", which might prompt a response about promos that are happening this month. 

These custom keywords operate in an "always-on" capacity, meaning that any user subscribed to your message service can text keywords and receive a response at any point. In addition to this behavior, you also have the option to define specific keywords that can only be sent to at [certain points](#lifecycle-specific-keywords) of your user's lifecycle. 

![Keywords for a "Promo" category. If a user texts "YO", they receive the message with a promo code.](https://www.braze.com/docs/assets/img/sms/sms_custom_keyword.png?c3711a1a5f38fe9fb8293a16c13f5bf8)

### Creating a custom category

To create a custom keyword category, do the following:

1. Edit the appropriate subscription group.
2. Select **Add custom keyword**. ![Fields to add new keywords.](https://www.braze.com/docs/assets/img/sms/sms_custom_step.png?a8ec7b1a61a447e862a38e3c3a6653f2){: style="max-width:90%;"}
3. Provide a keyword category name and define which keywords a user can text in to receive the reply message.

After this keyword category is created, it will be available to [filter and trigger](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/user_retargeting/) against in your campaigns and Canvases.

Keywords created in custom keyword categories adhere to all of the rules and validations for the creation of new keywords. 

### Lifecycle-specific keywords

If you have a use case where you would like to limit when a customer can send a specific keyword during their lifecycle (for example, during their first initial onboarding) to receive a response, you can use the trigger **Sent inbound SMS to subscription group within keyword category OTHER** in your campaign or Canvas and define keywords that your users can send in at a point in time.

This trigger supports filtering on the specific inbound message using is or is not comparisons of the message, as well as matches or does not match regex rules to validate the user's input.

#### Canvas

![Action-based Canvas step with the trigger Send inbound SMS to subscription group "Messaging Service" within keyword category "Other" where the message body matches the regular expression "caret symbol skip."](https://www.braze.com/docs/assets/img/sms/canvas_trigger.png?0816c0ee8b284af8b3fbaccf287a7765){: style="max-width:90%;"}

#### Campaign

![Action-based campaign with the trigger Send inbound SMS to subscription group "Marketing Message Service A" within keyword category "Other" where the message body is "Keyword1" or is "Keyword2" or is not "Keyword A".](https://www.braze.com/docs/assets/img/sms/campaign_trigger.png?3bfb35ffc2d7c15b62a0b4fef2b10b98){: style="max-width:90%;"}

### Dealing with unknown keywords

We strongly recommend setting up an auto-response when subscribed users text something that doesn't match any of your defined keywords (handled under the **OTHER** keyword category).

To send a default reply—for example, "Sorry! We didn't recognize that keyword."—do the following:

1. Create an [SMS campaign](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/create/).
2. For **Target audience**, choose **All users** (the trigger still limits who receives the message).
3. For **Schedule**, choose **Action-based delivery**.
4. Set the trigger to **Send inbound SMS** to the appropriate subscription group **within keyword category OTHER**.
5. In the **Messaging** step, enter the response body you want users to receive.

For how Braze handles inbound messages from **unknown** phone numbers (before a profile exists), see [Handle unknown phone numbers](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/unknown_phone_numbers/).

**Tip:**


Interested in seeing how these keywords and keyword categories can be used in your campaigns and Canvases to retarget and trigger messages? Visit [User retargeting](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/user_retargeting/) for more information.



