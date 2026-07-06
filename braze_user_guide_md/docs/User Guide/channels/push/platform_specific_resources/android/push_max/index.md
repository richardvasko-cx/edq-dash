# Push Max

> Learn about Push Max and how you can use this feature to potentially improve the deliverability of Android push notifications to [Chinese OEM devices](https://www.braze.com/docs/user_guide/channels/push/best_practices/chinese_push_deliverability/).

## What is Push Max?

Push Max amplifies Android push notifications by tracking failed push notifications and resending the push when the user is more likely to receive it.

Some Android devices manufactured by Chinese Original Equipment Manufacturers (OEMs), such as Xiaomi, OPPO, and Vivo, employ a robust battery optimization scheme to extend battery life. This behavior may have the unintended consequence of shutting down background app processing, which reduces the deliverability of push notifications on these devices if the app is not in the foreground. This circumstance occurs most often in the Asia-Pacific (APAC) markets.

## Availability

- Available for Android push notifications only
- Not supported for action-based or API-triggered messages
- Not supported when the option to [only send to the user's last used device](https://www.braze.com/docs/user_guide/channels/push/create_a_push_message/#device-options) is selected

## Prerequisites

Push notifications sent using Push Max will only be delivered to devices that have at least the following [minimum SDK version](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies/new_features#filtering-by-most-recent-app-versions):

<div id='sdk-versions'><a href='/docs/developer_guide/platforms/android/changelog/#2901' class='sdk-versions--chip android-sdk' target='_blank'><i class='fa-brands fa-android'></i> &nbsp; Android: 29.0.1+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a></div>

## Using Push Max




To use Push Max in your campaign:

1. Create a push campaign.
2. Select **Android Push** as your platform.
3. Go to the **Schedule Delivery** step.
4. Select **Send using Push Max**.

![Android Push Deliverability section of the Schedule Delivery step with the option to "Send using Push Max".](https://www.braze.com/docs/assets/img_archive/push_max_campaigns.png?4a40386457740b5978cc71bbaa5af316)




To use Push Max in your Canvas:

1. Add a Message step to your Canvas.
2. Select **Android Push** as your platform.
3. Go to the **Delivery Settings** tab.
4. Select **Send using Push Max**.

![Delivery Settings tab of an Android Push Message step with the option to "Send using Push Max".](https://www.braze.com/docs/assets/img_archive/push_max_canvas.png?71bb088af5b9f004884cdde5e1c36e4a)




The following two features, Intelligent Timing and Time to Live, can be used in tandem with Push Max to potentially increase the deliverability of your Android push notifications.

### Intelligent Timing

Push Max works best when [Intelligent Timing](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_timing/) is turned on. Intelligent Timing can calculate and send the push notification at a time when the user is most likely to be using the app and the push is most likely to be delivered.

### Time to Live (TTL)

Time to Live (TTL) can track failed push notifications to Firebase Cloud Messaging (FCM) and retry the notification when the user is likely to receive it.

By default, Time to Live is set to 28 days, which is the maximum. You can decrease the default TTL for all new Android push messages from **Settings** > **Workspace Settings** > **Push Settings**, or you can configure the number of days on a per message basis in the **Settings** tab when composing an Android push notification.

![Time to Live field set to 28 days.](https://www.braze.com/docs/assets/img_archive/time_to_live.png?344cbc4961f4f6a6baaf3dfb5b110694){: style="max-width:60%"}

## Things to know

### Promotion codes

We recommend that you don't use Braze [promotion codes](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/sources/promotion_codes/) in messages where Push Max is turned on.

This is because promotion codes are unique. If a push notification that contains a promotion code fails to deliver, when that notification is resent due to Push Max, a new promotion code will be sent. This can result in you consuming promotion codes faster than expected.

### Canvas event properties and entry properties

Push Max may not work as expected if you include Liquid references to [Canvas entry properties or event properties](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/context_and_event_properties/) in your message. This is because the entry and event properties are not available when Push Max is attempting to resend the message.
