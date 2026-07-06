# Send test messages

> Before sending a messaging campaign to your users, as a suggested best practice, we recommend testing to make sure it looks right and operates as intended. You can create and send test messages to select devices or team members using the tools in the Braze dashboard.

**Important:**


Make sure to save your campaign draft after testing to avoid deleting your campaign. You can send test messages without saving the message as a draft.



## Step 1: Identify your test users

Before testing your messaging campaign, it's important to identify your test users. These users can be either existing user IDs or email addresses, or new users that are used exclusively for testing messaging campaigns. 

### Optional: Create a Content Test Group

A convenient way to organize your test users is by creating a [Content Test Group](https://www.braze.com/docs/user_guide/administer/global/user_management/internal_groups/), which includes a group of users that will receive test messages from campaigns. You can add this test group to the **Add Content Test Groups** field under **Test Recipients** in your campaign, and launch your tests without creating or adding individual test users.

## Step 2: Send channel-specific test messages

For steps to send test messages, refer to the following section for your respective channel.




**Important:**


Before you can test Banner messages in Braze, you'll need to create a Banner campaign in Braze. Additionally, verify that the placement you want to test is already [placed in your app or website](https://www.braze.com/docs/developer_guide/banners/placements).



After creating your Banner message, you can preview your Banner or send a test message.

1. Draft your Banner message.
2. Select **Preview** to preview your Banner or send a test message.
3. To send a test message, add either a content test group or one or more individual users as **Test Recipients**, then select **Send Test**. 

You'll be able to view your test message on the device for up to 5 minutes.

![Preview tab of the Banner composer.](https://www.braze.com/docs/assets/img/banners/preview_banner.png?d8aab458e372815d934bd3cd9c3f3f43)

**Note:**


Keep in mind, your preview may not be identical to the final render on a user's device due to differences across hardware.



### Test checklist

- Is your Banner campaign assigned to a placement?
- Do the images and media show up and act as expected on your targeted device types and screen sizes?
- Do your links and buttons direct the user to where they should go?
- Does the Liquid function as expected? Have you accounted for a default attribute value in the event that the Liquid returns no information?
- Is your copy clear, concise, and correct?




**Important:**


To send a test to either [content test groups](https://www.braze.com/docs/user_guide/administer/global/user_management/internal_groups/#content-test-groups) or individual users, push must be enabled on your test devices with valid push tokens registered for the test user before sending. For iOS users, you must tap the push notification sent by Braze in order to view the test Content Card. This behavior only applies to test Content Cards.



Test Content Cards are delivered through a push notification. The card is packaged in the push payload, and the SDK extracts and caches it locally when the push is received.

This process bypasses the normal card delivery system, which is why push must be enabled even though you're testing a Content Card.

Test Content Cards expire approximately five minutes after they are sent.

After creating your Content Card, you can send a test Content Card to your app to see what it will look like in real-time.

1. Draft your Content Card.
2. Select the **Test** tab and select at least one Content Test Group or individual user to receive this test message. 
3. Select **Send Test** to send your Content Card to your app.

![Test Content Card](https://www.braze.com/docs/assets/img/contentcard_test.png?42af8bf4d046301eb6a33105befc31b9)

### Preview

You can preview your card as you compose it in the **Preview** tab. This should help you visualize what your final message will look like from your user's perspective.

**Note:**


In the **Preview** tab of your composer, the view of your message might not be identical to its actual rendering on the user's device. We recommend always sending a test message to a device to ensure that your media, copy, personalization, and custom attributes generate correctly.



### Test checklist

- Is your test user opted in to push with a valid push token?
- Do the images and media show up and act as expected?
- Does the Liquid function as expected? Have you accounted for a [default attribute value](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/conditional_logic/#accounting-for-null-attribute-values) if the Liquid returns no information?
- Is your copy clear, concise, and correct?
- Do your links direct the user to where they should go?
- Is your test user opted into push with a valid push token?

### Troubleshooting broken images

If a Content Card image is not rendering or appears broken:

- **Verify the URL is correct and URL-encoded:** Special characters in the URL (such as spaces or query parameters) must be properly encoded. Otherwise, the image request fails.
- **Check content security policies:** If your organization has a content security policy (CSP) or internal IT security rules, the policy may block the image domain. Confirm that the image URL's domain is allowed by your CSP.
- **Use HTTPS:** Image URLs should use `https://` rather than `http://` to avoid mixed-content blocking in browsers and apps.
- **Open the URL directly in a browser:** If the image doesn't load in a browser, the issue is with the image URL or hosting—not with Braze.

### Debug

After your Content Cards are sent, you can break down or debug any issues from the [Event User Log](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/event_user_log/) in the Developer Console. 

A common use case is trying to debug why a user can't see a particular Content Card. To do so, you can look in the **Event User Logs** for the Content Cards delivered to the SDK on session start, but prior to an impression, and trace those back to a specific campaign:

1. Go to **Settings** > **Event User Log**.
2. Locate and expand the SDK Request for your test user.
3. Click **Raw Data**.
4. Find the `id` for your session. The following shows an example excerpt:

    ```json
    [
      {
        "session_id": "D1B051E6-469B-47E2-B830-5A728D1D4AC5",
        "data": {
          "ids": [
            "NDg2MTY5MmUtNmZjZS00MjE1LWJkMDUtMzI1NGZiOWU5MDU3"
          ]
        },
        "name": "cci",
        "time": 1636106490.155
      }
    ]
    ```
    
{: start="5"}
5. Use a decoding tool like [Base64 Decode and Encode](https://www.base64decode.org/) to decode the `id` from Base64 format and find the associated `campaign_id`. In our example, this results in the following:

    ```
    4861692e-6fce-4215-bd05-3254fb9e9057_$_cc=c3b25740-f113-c047-4b1d-d296f280af4f&mv=6185005b9d9bee79387cce45&pi=cmp
    ```

    Where `4861692e-6fce-4215-bd05-3254fb9e9057` is the `campaign_id`.<br><br>

6. Go to the **Campaigns** page and search for the `campaign_id`.

![Search for campaign_id on Campaigns page](https://www.braze.com/docs/assets/img_archive/cc_debug.png?f9f496a9f5221760285ca0ca5082963b){: style="max-width:80%;"}

From there, you can review your message settings and content to drill down and determine why a user can't see a particular Content Card.




1. Draft your email message.
2. Select **Preview and Test**.
3. Select the **Test Send** tab and add your email address or user ID in the **Add individual users** field. 
4. Select **Send Test** to send your drafted email to your inbox.

![Test Email](https://www.braze.com/docs/assets/img_archive/testemail.png?7ed7d9a80a83fce76cbd7560840972af){: style="max-width:40%;" }

If your email campaign includes a large image and isn't displaying as expected in Outlook, consider reducing the actual file dimensions of the image with an image editing or resizing tool instead of only scaling it with CSS or HTML.




**Warning:**


To send a test to either [Content Test Groups](https://www.braze.com/docs/user_guide/administer/global/user_management/internal_groups/#content-test-groups) or individual users, push must be enabled on your test devices before sending. For example, you must have push enabled on your iOS device in order to tap the notification before the test message displays. 


If you have push notifications set up within your app and on your test device, you can send test in-app messages to your app to see what it looks like in real-time. 

1. Draft your in-app message.
2. Select the **Test** tab and add your email address or user ID to the **Add Individual Users** field. 
3. Select **Send Test** to send your push message to your device.

A test push message will appear at the top of your device screen.

![Test In App](https://www.braze.com/docs/assets/img_archive/test-in-app.png?98d5f6bfafcffa1d4e58f50e100a3e17)

**Important:**


Test sends may result in more than one in-app message being sent to each recipient. 



Directly clicking and opening the push message will send you to your app, where you can view your in-app message test. Note this in-app message testing feature relies on the user clicking a test push notification to trigger the in-app message. As such, the user must be eligible to receive push notifications in the relevant app for the successful delivery of the test push notification.

### Preview

You can preview your in-app message as you compose it in the **Preview** tab. This should help you visualize what your final message will look like from your user's perspective. You can preview what your message will look like to a random user, a specific user, or a customized user. You can also preview messages for either mobile devices or tablets.

![Compose tab when building an in-app message showing the preview of what the message will look like. A user is not selected, so the Liquid added in the body section displays as is.](https://www.braze.com/docs/assets/img/in-app-message-preview.png?a5d55c8327fc8ae00f6099d3175b342d)

Braze has three generations of in-app messages available. You can fine-tune to which devices your messages should be sent, based on which Generation they support.

![Switching between generations when previewing an in-app message.](https://www.braze.com/docs/assets/img/iam-generations.gif?e475dbcdd66ce5f7778cd4546dc3864c){: height="50%" width="50%"}

**Warning:**


In **Preview**, the view of your message might not be identical to its actual rendering on the user's device. We always recommend sending a test message to a device to ensure that your media, copy, personalization, and custom attributes generate correctly.



### Test checklist

- Do the images and media show up and act as expected?
- Does the Liquid function as expected? Have you accounted for a [default attribute value](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/conditional_logic/#accounting-for-null-attribute-values) if the Liquid returns no information?
- Is your copy clear, concise, and correct?
- Do your buttons direct the user where they should go?

### Accessibility scanner

To support accessibility best practices, Braze automatically scans the content of in-app messages created using the traditional HTML editor against accessibility standards. This scanner helps identify content that may not meet Web Content Accessibility Guidelines ([WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)) standards. WCAG is a set of internationally recognized technical standards developed by the World Wide Web Consortium (W3C) to make web content more accessible to people with disabilities.

![Accessibility scan results](https://www.braze.com/docs/assets/img/Accessibilty_Scanner_IAM.png?034581620f297b7a5de6121b2bb30f37)

**Note:**


The in-app message accessibility scanner only runs on messages built with custom HTML. 



#### How it works

The scanner runs automatically on custom HTML messages and evaluates your entire HTML message against the full [WCAG 2.1 AA rule set](https://www.w3.org/WAI/WCAG22/quickref/?versions=2.1&currentsidebar=%23col_customize&levels=aaa). For each flagged issue, it shows:

- The specific HTML element involved
- A description of the accessibility issue
- A link to additional context or remediation guidance

#### Understanding automated accessibility testing

[Automated accessibility testing](https://www.braze.com/docs/help/accessibility/#automated-accessibility-testing) helps catch common issues like missing alt text or low color contrast based on WCAG Level AA standards. It’s a powerful starting point for building more inclusive messages.

But automation can’t catch everything. Some issues need a human eye—like whether the focus order makes sense, if links and buttons are clearly labeled, or if your instructions are easy to follow. Think of these checks as a diagnostic tool, not a final verdict. We recommend reviewing flagged issues manually and using your best judgment when something is marked as “Needs review.”

For extra support, our [Accessibility at Braze](https://www.braze.com/docs/help/accessibility) guide shares practical tips for making your content easier for everyone to use, including:

- [Headings and structure](https://www.braze.com/docs/help/accessibility/#content)
- [Alt text and images](https://www.braze.com/docs/help/accessibility/#images) 
- [Links and buttons](https://www.braze.com/docs/help/accessibility/#links)
- [Color contrast](https://www.braze.com/docs/help/accessibility/#color-contrast)
- [Touch targets](https://www.braze.com/docs/help/accessibility/#touch-targets)

When you combine automated testing with thoughtful manual review, you’ll catch more issues—and create a better experience for all your users.




1. Create your LINE message.
2. Select the **Test** tab and select at least one Content Test Group or individual user to receive this test message.
3. Select **Send Test** to send your message.

![Test LINE message.](https://www.braze.com/docs/assets/img/line/test_preview.png?03ad86413ac07de01e6fc84f17d44cab)




#### Mobile push

1. Draft your mobile push.
2. Select the **Test** tab and add your email address or user ID in the **Add Individual Users** field.
3. Select **Send Test** to send your drafted message to your device.

![Test push](https://www.braze.com/docs/assets/img_archive/testpush.png?fe898d4940bf8067e8e0bf74d99e5ad8)

#### Web push

1. Create your web push.
2. Select the **Test** tab. 
3. Select **Send Test to Myself**.
4. Select **Send Test** to send your web push to your web browser.

![Test web push](https://www.braze.com/docs/assets/img_archive/testwebpush.png?7257d3736ebfd88751df823989fb9646)

If you have already accepted push messages from the Braze dashboard, the message displays in the corner of your screen. Otherwise, select **Allow** when prompted, and the message displays.

If you see an error that none of the selected users have matching push tokens for Web Push, verify that the test user has a valid push token registered for the selected platform. To receive a push token, the user must be configured to receive push notifications for the app on their device. For more details, see [Push enablement and push subscription](https://www.braze.com/docs/user_guide/channels/push/push_setup/push_subscription_states).




After creating your SMS, MMS, or RCS message, you can send a test message to your phone to see what it will look like in real-time. 

1. Draft your SMS, MMS, or RCS message.
2. Select the **Test** tab and select at least one Content Test Group or individual user to receive this test message. 
3. Select **Send Test** to send your test message.

![Test Content Card](https://www.braze.com/docs/assets/img/sms_test.png?3808cec453b39b100e5c97b3ed8201e5)




After creating your webhook, you can do a test send to check the webhook response. Select the **Test** tab and select **Send Test** to send a test send to the supplied webhook URL. You can also select an individual user to preview the response as a specific user. 

![Test Content Card](https://www.braze.com/docs/assets/img/webhook_test.png?c0207171222bea4694d67c34bff9ad04)




1. Create your WhatsApp message.
2. Select the **Test** tab and select at least one Content Test Group or individual user to receive this test message.
3. Initiate a conversation window by sending a WhatsApp message to the phone number associated with the subscription group you're using for this message. The associated phone number is listed in the alert on the **Test** tab.
4. Select **Send Test** to send your message.

![Test WhatsApp message.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp_test.png?707339787842609493d1c46e8905bf86)




## Test personalized campaigns 

If you are testing campaigns that populate user data or use custom event properties, you'll need to take additional or different steps.

### Testing campaigns personalized with user attributes

If you are using [personalization](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/overview/) in your message, you'll need to take additional steps to properly preview your campaign and check that user data is properly populating the content.

When sending a test message, make sure to choose either the option to **Select Existing User** or preview as a **Custom User**.

![Testing a personalized message](https://www.braze.com/docs/assets/img_archive/personalized_testing.png?4bfde0d20feaf40d495f74df89ee122d){: style="max-width:70%;" }

#### Selecting an existing user

If selecting an existing user, enter the specific user ID or email in the search field. Then, use the dashboard preview to see how your message would appear to that user, and send a test message to your device that reflects what that user would see.

![Select a user](https://www.braze.com/docs/assets/img_archive/personalized_testing_select.png?6b3cda9f19ed551eb1ff1ceb6055aae3)

#### Selecting a custom user

If previewing as a custom user, enter text for various fields available for personalization, such as the user's first name and any custom attributes. Once again, you can enter your own email address to send a test to your device.

![Custom user](https://www.braze.com/docs/assets/img_archive/personalized_testing_custom.png?74f4596c762713ea9ea4c02acad1cfff)

#### Customizing an existing user

You can edit individual fields from a random or existing user to help test dynamic content within your message. Select **Edit** to convert the selected user into a custom user you can modify.

![The "Preview as a User" tab with an "Edit" button.](https://www.braze.com/docs/assets/img_archive/edit_user_preview.png?01261cefe71937167833dfcc6ecdf35c){: style="max-width:50%;"}

### Testing campaigns personalized with custom event properties

Testing campaigns personalized with [custom event properties](https://www.braze.com/docs/user_guide/data/activation/events/custom_events/custom_event_properties/) differs slightly from testing other types of campaigns outlined. 




#### Method 1: Triggering campaign manually

You can trigger the campaign yourself as a robust way to test campaigns personalized using custom event properties:

1. Write up the copy involving the event property. 

![Composing Test Message with Properties](https://www.braze.com/docs/assets/img_archive/testeventproperties-compose.png?c95147da0c11368df33a611b7448c13f)

{: start="2"}
2. Use [action-based delivery](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery/) to deliver the campaign when the event occurs.

**Note:**


If you're testing an iOS push campaign, you must set the delay to one minute to allow yourself time to exit the app because iOS doesn't deliver push notifications for the currently open app. Other types of campaigns can be set to deliver immediately.



![Test Message Delivery](https://www.braze.com/docs/assets/img_archive/testeventproperties-delivery.png?c04202ee7513797d76baf33ef71bdfe9)

{: start="3"}
3. Target the users as you would for testing by using a testing filter or targeting your own email address, and finish creating the campaign. 

![Test Message Targeting](https://www.braze.com/docs/assets/img_archive/testeventproperties-target.png?dad98376c15a6104c5e806ed8375bb1d)

{: start="4"}
4. Go into your app and complete the custom event.

The campaign will trigger and show the message customized with the event property.

![Test Message Example](https://www.braze.com/docs/assets/img_archive/testeventproperties-message2.png?9f5380a3b9989b40c063f1499d8eb294)




#### Method 2: Sending yourself a test message

Alternatively, if you are saving custom user IDs, you can also test the campaign by sending a customized test message to yourself.

1. Write the copy for your campaign.
2. Select the **Test** tab and choose **Customized User**. 
3. Add the custom event property at the bottom of the page, and add your user ID or email address to the top box.
4. Select **Send Test** to receive a message personalized with the property.

![Testing Using Customized User](https://www.braze.com/docs/assets/img_archive/testeventproperties-customuser.png?0b4096f90ae25a454ff83382dd5a399c)




#### Method 3: Using Liquid

You can test custom event properties by manually inputting values with Liquid. 

1. In the message editor, input values for your custom event properties.
2. Select the **Preview as a User** tab to check that the correct message displays.




## Limitations

There are a few situations where test messages don't behave the same way as campaigns or Canvases sent to real users. In these instances, consider launching the campaign or Canvas to a limited set of test users to validate this behavior.

- Viewing the Braze preference center from test messages will cause the **Save Preferences** button to be grayed out.
- For testing in-app messages and Content Cards, the target user must have a push token for the target device.
- For testing unsubscribe links in emails, make sure your test user's email address is in the respective workspace.
- The `List-Unsubscribe` header is not included in emails sent by the test message functionality.

## Troubleshooting

### In-app messages

If your in-app message campaign is not triggered by a push campaign, check the in-app campaign segmentation to confirm the user meets the target audience **before** receiving the push message.

For test sends on Android and iOS, the in-app messages that use the **Request push permission** on-click behavior may not display on some devices. As a workaround:
- **Android:** Devices must be on Android 13 and our Android SDK version 21.0.0. Another reason may be that the device on which the in-app message is displayed already has a system-level prompt. You may have selected **Do not ask again**, so you may need to reinstall the app to reset the notification permissions before testing again.
- **iOS:** We recommend your developer team review the implementation of push notifications for your app and manually remove any code that would request push permissions. For more information, see [Push primer in-app messages](https://www.braze.com/docs/user_guide/channels/push/best_practices/).

For an action-based in-app message campaign to deliver, you must log custom events through the Braze SDK, not REST APIs, so users can receive eligible in-app messages directly to their device. Users receive the in-app message if they perform the event during the session.
