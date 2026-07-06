# Notification options

> These are the some of the Android-specific push notification options available through Braze.

## Silent notifications

When you [compose your push notification message](https://www.braze.com/docs/user_guide/channels/push/create_a_push_message/?tab=android#step-4-compose-your-push-message), you **cannot** send an Android push message without a title&#8212;however, you can enter a single space instead. Keep in mind, if your message only contains a single space, it will be sent as a silent push notification. For more information, see [Silent push notifications](https://www.braze.com/docs/developer_guide/push_notifications/silent/?sdktab=android).

## Notification groups

If you want to categorize your messages and group them in your user's notification tray, you can utilize Android's Notification Channels feature through Braze.

First, create your Android push campaign, then look to the top of the **Compose** tab for the **Notification Channel** dropdown.

![](https://www.braze.com/docs/assets/img_archive/notification_channel_dropdown.png?6033af9998755b1005b31379fda680c9){: style="max-width:60%;"}

Select your Notification Channel from the dropdown. You must also select a fallback channel in the event that your Notification Channel settings malfunction.

If you don't have any [Notification Channels](https://www.braze.com/docs/user_guide/channels/push/platform_specific_resources/android/notification_channels/) listed here, you can add one using the Notification Channel ID. Contact your developers to identify what your Notification Channel IDs are or to create new IDs as needed. 

To add a Notification ID to your Notification Channel, click **Manage Notification Channel** in the **Notification Channel** dropdown menu and fill out the required fields. Notification Channels must be defined on the app before they can be used in the Braze platform.

![](https://www.braze.com/docs/assets/img_archive/notification_channels.png?89bed1ea0b35b463ac18739800390e45){: style="max-width:80%;" }


