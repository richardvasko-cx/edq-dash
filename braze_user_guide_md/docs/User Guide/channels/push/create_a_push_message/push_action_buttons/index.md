# Push action buttons

> Push action buttons allow you to set content and actions for buttons when using Braze iOS and Android push notifications. With action buttons, your users can interact directly with your app from a notification without needing to click into an app experience.

![An iOS push notification with two push action buttons: Accept and Decline.](https://www.braze.com/docs/assets/img_archive/push_action_example.png?6e52f27f9204033a484b53951b283761){: style="float:right;max-width:40%;margin-left:15px;border:none;"}

## Creating action buttons

Each interactive button can link to a web page or a deep link or open the app. 

- For standard push campaigns, you can specify your push action buttons in the **On-Click Behavior** section of the push message composer in the dashboard.
- For [quick push campaigns](https://www.braze.com/docs/quick_push), action buttons can be configured separately for each platform under the **Settings** tab.



### iOS {#ios}

To use action buttons in your iOS push messages, do the following:

1. Turn on action buttons in the **Compose** tab for a standard campaign or in the **Settings** tab for quick push.
2. Select your **iOS Notification Category** from the following available button combinations:
 - Accept / Decline
 - Yes / No
 - Confirm / Cancel
 - More
 - Pre-registered custom iOS Category

![iOS Notification Category dropdown menu.](https://www.braze.com/docs/assets/img_archive/push_action_buttons_ios.png?c19647015689cc31b41375ea41cf12b6){: style="max-width:70%"}

**Note:**


Due to iOS's handling of buttons, you need to perform additional integration steps when setting up push action buttons, which are outlined in our [developer documentation](https://www.braze.com/docs/developer_guide/push_notifications/customization/?sdktab=swift#swift_customizing-push-categories). In particular, you need to either configure iOS Categories or select from certain default button options. For Android integrations, these buttons will work automatically.



Preset pairs such as **Yes** / **No** map the second button to a dismissive (**CLOSE**) action by default, so it doesn't open the app the same way as the first button. **_Direct Opens_** doesn't include that kind of tap, but **Push Notification Open** data in Currents or Snowflake may still log it with `button_action_type` and `button_string`. For more information, see [Push action buttons and reporting](https://www.braze.com/docs/user_guide/channels/push/reporting/#push-action-buttons-and-reporting).


### Android {#android}

To use action buttons in your Android push messages, do the following:

1. Turn on action buttons in the **Compose** tab for a standard campaign or in the **Settings** tab for quick push.
2. Select <i class="fas fa-plus-circle"></i> **Add Button** and specify your button text and **On-Click Behavior**. You can select from the following available actions:
  - Open App
  - Redirect to Web URL
  - [Deep Link](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/actions_and_media_urls/) Into Application

![Selecting "Open App" as the on-click behavior for a notification button.](https://www.braze.com/docs/assets/img_archive/push_action_buttons_android.png?e63f3cffbc54e45883072b4af3899376){: style="max-width:70%"}

You can add up to three buttons in your push.

#### Android character limits

Unlike iOS buttons, which are stacked, Android buttons are displayed side-by-side in a row. This means that the more buttons you add (up to three), the less space you have for button copy. 

![Android push action buttons with truncated text.](https://www.braze.com/docs/assets/img_archive/push_action_truncated.png?b27ec90a7464a4c3d24be8a1cc93896f){: style="max-width:50%"}

The following table outlines how many characters you can add before your button copy is truncated, depending on how many buttons you have:

| Number of Buttons | Maximum characters per button |
| --- | --- |
| 1 | 46 characters |
| 2 | 20 characters |
| 3 | 11 characters |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Android character limits" }



