# Push

> Push notifications are a tried-and-true way to send time-sensitive calls to action through mobile or web, as well as re-engage users who haven't come into the app in a while. They lead the user directly to content and demonstrate the value of your application.

[![Braze Learning course](https://www.braze.com/docs/assets/img/bl_icon3.png?5f6465f63e399dec15d7020b6f4d2452)](https://learning.braze.com/path/push-fundamentals){: style="float:right;width:120px;border:0;" class="noimgborder"}

## Prerequisites

Before you start, make sure you have the following:

- **Push integrated into your app or website.** Work with your developers to set this up. For detailed steps, refer to the integration guides for [iOS](https://www.braze.com/docs/developer_guide/push_notifications/?sdktab=swift), [Android](https://www.braze.com/docs/developer_guide/platform_integration_guides/android/push_notifications/?tab=android), and [Web](https://www.braze.com/docs/developer_guide/push_notifications/?sdktab=web).
- **A push opt-in strategy.** Users must grant push permission on their device. Consider using [push primer messages](https://www.braze.com/docs/user_guide/channels/push/best_practices/push_primer_messages/) to explain the value before prompting.

## Use cases

| Use case | Explanation |
| --- | --- |
| Initial onboarding | Until users take the initial steps toward using your app (such as registering an account), their value is severely limited. Use push notifications to urge users to complete these steps so they can begin using your app in full. |
| First purchases | After users are comfortable using your app, you can use push notifications to help convert them into in-app purchasers. |
| New features | Push notifications can be effective in notifying disengaged users about new features that might attract them back to your app. |
| Time-sensitive offers | If you have a clock ticking on an offer, push is a great way to let your users know about it before it expires. These messages generally carry a high sense of urgency and are optimal for reminding recently-lapsed users about your app. For example, if your app is a game and you offer an in-game currency bonus for a daily play streak, alerting a user that their streak is at risk can be an effective push after they've reached a certain number of days. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Use cases" }

## Push message regulations

Push reaches your customer's device directly, so app and store policies restrict how you use it.

**Important:**


Your push messages must follow the [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) and [Google Play policies](https://support.google.com/googleplay/android-developer/answer/9888379). That includes rules on using push for ads, spam, promotions, and related topics.



| Policy source | Summary |
| --- | --- |
| Apple [3.2.2](https://developer.apple.com/app-store/review/guidelines/#unacceptable) | Unacceptable uses include creating an interface for displaying third-party apps, extensions, or plug-ins similar to the App Store or as a general-interest collection. |
| Apple [4.5.4](https://developer.apple.com/app-store/review/guidelines/#apple-sites-and-services) | Push must not be required for the app to function and must not carry sensitive personal or confidential information. Don't use push for promotions or direct marketing unless customers explicitly opt in via consent language in your app's UI and can opt out in the app. |
| Apple [4.10](https://developer.apple.com/app-store/review/guidelines/#monetizing-built-in-capabilities) | You may not monetize built-in capabilities such as Push Notifications, the camera, or the gyroscope, or Apple services such as Apple Music or iCloud. |
| Google Play — [Unauthorized use or imitation of system functionality](https://developers.google.com/android/play-protect/mobile-unwanted-software#muws-categories) | Apps must not mimic or interfere with system notifications. System-level notifications are only for integral app features (for example, an airline app notifying users of deals, or a game notifying users of in-game promotions). |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Push message regulations" }

## Next steps

- [Push setup](https://www.braze.com/docs/user_guide/channels/push/push_setup/)
- [Create a push message](https://www.braze.com/docs/user_guide/channels/push/create_a_push_message/)
