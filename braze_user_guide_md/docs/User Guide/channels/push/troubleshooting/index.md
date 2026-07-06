# Troubleshoot push

> Use this page to troubleshoot issues with the Push messaging channel.

## Missing push notifications

Experiencing delivery challenges with push notifications? There are a number of steps you can take to troubleshoot this issue by checking the:

- [Push subscription status](#push-subscription-status)
- [Segment](#segment)
- [Push notification caps](#push-notification-caps)
- [Rate limits](#rate-limits)
- [Control group status](#control-group-status)
- [Valid push token](#valid-push-token)
- [Push notification type](#push-notification-type)
- [Current app](#current-app)

#### Push subscription status

Pushes can only be sent to subscribed or opted-in users. Check your user profile in the [Engagement](https://www.braze.com/docs/user_guide/audience/manage_audience/user_profiles/#engagement-tab) tab in the **User Profile** section to confirm if you are actively registered for push for the workspace that you are testing. If you are registered for multiple apps, you will find them listed in the **Push Registered For** field:

![Push Registered For](https://www.braze.com/docs/assets/img_archive/trouble1.png?caff2be534c973738dd957b0fd6609d2)

You can also export the user profiles using Braze export endpoints:
- [Users by identifier](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_identifier)
- [Users by segment](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_segment)

Either endpoint will return a push token object that includes push enablement information per device.

#### Segment

Make sure you fall into the segment that you are targeting (if this is a live campaign and not a test). In the **User Profile**, you will see a list of segments that the user currently falls into. Remember this is an ever-changing variable as segmentation is updated in real time.

![List of Segments](https://www.braze.com/docs/assets/img_archive/trouble2.png?b79bfc1b3d07082f048b5d2343ab63f7)

You can also confirm that the user is part of the segment by using **User Lookup** when creating a segment.

![User Lookup section with a search field.](https://www.braze.com/docs/assets/img_archive/user_lookup.png?a23b1b90dd9a139a54218f61761a0040){: style="max-width:80%;"}

#### Push notification caps

Check the global frequency caps. It's possible you did not receive the push notification because your workspace has global frequency capping in place and you've already hit your push notification cap for the specified time frame.

You can do this by checking [global frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping#freq-cap-feat-over) in the dashboard. If the campaign is set to abide by frequency capping rules, there will be a number of users impacted by these settings

![Campaign Details](https://www.braze.com/docs/assets/img_archive/trouble3.png?2da7b998d84ba2c094988dfd2606da8f)

#### Rate limits

If you have a rate limit set for your campaign or Canvas, you might be falling out of receiving messaging due to exceeding this limit. For more information, refer to [Rate Limiting](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping#rate-limiting).

#### Control group status

If this is a single channel campaign or a Canvas with a control group, it's possible you are falling into the control group.

  1. Check the [variant distribution](https://www.braze.com/docs/user_guide/messaging/ab_testing#step-5-distribute-users-among-your-variants) to see if there is a control group.
  2. If so, create a segment filtering for [in campaign control group](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies/retargeting_campaigns#in-campaign-control-group-filter) then [export the segment](https://www.braze.com/docs/user_guide/data/distribution/export_braze_data/segment_data_to_csv#exporting-to-csv) and check if your user ID is on this list.

#### Valid push token
A push token is an identifier that senders use to target specific devices with a push notification. So, if the device does not have a valid push token, then there is no way to send a push notification to it. 

#### Push notification type

Check that you're using the correct type of push notification. For example, if you want to target a FireTV, then you would use a Kindle push notification, not an Android push campaign. Likewise, if you want to target an Android, use an Android push notification and not an iOS push campaign. Check out the following articles for more information on understanding the Braze workflow for:
- [Apple Push Notification](https://www.braze.com/docs/developer_guide/push_notifications/troubleshooting/?sdktab=swift)
- [Firebase Cloud Messaging](https://www.braze.com/docs/developer_guide/push_notifications/troubleshooting/?sdktab=android)

#### Current app

When testing push sends with internal users, make sure that the user who you want to receive the push notification is currently logged into the relevant app. This can lead to the user either not receiving a push or receiving a push you believe they aren't segmented for.

**Note:**


If you're sending push messages with images on Android, FCM can sometimes discard the image and only display the text in the push message. This issue is usually caused by server connectivity issues.



## Error: MismatchSenderID

MismatchSenderID indicates an authentication failure with Firebase Cloud Messaging (FCM). Confirm your Firebase sender ID and FCM API key are correct.

To find the proper Firebase Server Key and replace it:

1. Go to the Firebase console for your app.
2. Under **Project Overview**, select **Project Settings**.
3. In the **Cloud Messaging** tab, check that the Sender ID below the API keys matches the one in Braze (in **Settings** > **App Settings** > **Cloud Messaging API Key**).

**Warning:**


Do not change your Sender ID in your Braze dashboard. Doing so will cause existing push registrations to be invalidated. If the Sender ID does not match, you must find your Firebase project with the matching Sender ID.



4. Copy the **Server Key** under **Project credentials**.
5. In Braze, go to **Settings** > **App Settings**, select your app, and paste the server key into the **Cloud Messaging API Key** field (replacing the outdated key).
6. Select **Save**.
7. To verify, send a test push to a device before and after changing the API key without opening the application. This helps confirm that users continue to receive push notifications without requiring a new push registration ID (push token) to be generated.

## Troubleshooting scenarios

### Delayed push notifications

Your push notifications can be delayed for these reasons:

- A weak data connection on the device
- Custom code in the app that can suppress Braze push notifications
- User preferences for push notifications in the device's settings
- Message priority of the push when created in the campaign or Canvas
- Traffic delays or issues with the push service providers (FCM and APNs)

### Push notifications are sending slower than expected

Make sure your push notification setup follows these best practices:

- If you're sending to large audiences without considering push-enabled status, this may lead to a slower sending speed. Instead, consider sending to push-enabled users only to reduce the size of your audience.
- If possible, try to schedule your campaigns ahead of time rather than immediately.
- If you're targeting a larger number of users with push notifications in a Canvas, you can anticipate that subsequent message steps in the Canvas will require different processing times than a campaign that sends to users immediately. In this case, campaigns would typically finish sending before a Canvas, as the first "step" of a Canvas is to check whether users qualify for the specific user journey.

## Clicking a push notification doesn't open the app

If clicking a push notification doesn't open your app, check the following based on your platform.

### Android

1. **Verify on-click behavior:** Confirm that the campaign is configured to open the app when clicked.
2. **Check deep link handling:** In your `braze.xml` file, check whether `com_braze_handle_push_deep_links_automatically` is set to `true` or `false`.
   - If set to `true`, the Braze SDK handles deep links directly and the app should open as expected.
   - If set to `false`, your app needs a broadcast receiver to listen for and handle push received and opened intents. Verify that this receiver is implemented correctly.
3. **Collect verbose logs:** [Enable verbose logging](https://www.braze.com/docs/developer_guide/sdk_integration/verbose_logging), reproduce the issue, and provide the logs along with your `braze.xml` and `AndroidManifest.xml` to Braze Support.

### iOS

1. **Verify on-click behavior:** Confirm that the campaign is configured to open the app when clicked.
2. **Check push integration:** Deep linking from a push into the app is automatically handled by the Braze [standard push integration](https://www.braze.com/docs/developer_guide/push_notifications/?sdktab=swift). Confirm that the integration is implemented correctly, including any custom delegate handling.
3. **Collect verbose logs:** [Enable verbose logging](https://www.braze.com/docs/developer_guide/sdk_integration/verbose_logging), reproduce the issue, and provide the logs to Braze Support.

## Push clicks unexpectedly open in app

If you're experiencing issues with links in push notifications unexpectedly opening in your app instead of your web browser, there may be an issue with your campaign configuration or SDK implementation. Refer to these steps for help.

### Verify on-click behavior

In your campaign or Canvas step, double-check that **Open web URL inside mobile app** is not selected. If it is, clear the selection and relaunch. 

!["On-click behavior" field of configuring a push set to "Open web URL" with "Open web URL inside mobile app" unchecked.](https://www.braze.com/docs/assets/img/push_on_click.png?714279cd9cd0e35b091736b39ff5136c)

The default interaction for the on-click behavior "Open web URL" differs by SDK version. For SDK versions iOS 2.29.0 and Android 2.0.0 and higher, this option is selected by default and web URLs will open in a web view within the app. Prior to these versions, this option is cleared by default and web URLs open in the device's default web browser.

If this is not the issue, there may be a problem with your push implementation. 

### Double-check push integration

If links in your push notifications are opening in the app unexpectedly, it might be due to issues with your push notification integration or customization settings. Follow these steps to troubleshoot:

1. **Review the push delegate implementation:** Ensure that the Braze push delegate is implemented correctly. For detailed instructions, refer to the integration guide for push notifications for your [platform](https://www.braze.com/docs/developer_guide/home/).
2. **Inspect custom link handling:** Check if the app includes custom handling for all `https://` links. Custom configurations might override default behaviors. Collaborate with your development team to review and adjust these settings if necessary.
3. **Verify iOS push registration:** For iOS, revisit step 1 of the push integration guide on [registering push notifications with APNs](https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/push_notifications/integration/#step-1-register-for-push-notifications-with-apns). Ensure your delegate object is assigned synchronously before the app finishes launching. This step should be completed in the `application:didFinishLaunchingWithOptions:` method.
4. **Test your integration:** After making adjustments, test the push notification behavior on both iOS and Android devices to confirm the issue is resolved.

### Deep links with app still running in the background (iOS)

If deep links work when the app is not running or when the link is used directly, but not when the application is already running in the background, the issue may be related to how the app handles the link. Check whether you're using any third-party libraries that use method swizzling. We recommend turning swizzling off, as it can cause issues with deep link implementations.

## Migrate to a .p8 authentication key

Apple `.p8` authentication keys are the required approach for APNs push in Braze. Unlike legacy certificate file types, `.p8` keys don't expire and support all of your apps under a single key, eliminating the need for annual certificate renewals and reducing the risk of push delivery failures.

If you're currently using a `.p12` or `.pem` certificate, migrate to a `.p8` key as soon as possible. For instructions on creating and uploading a `.p8` key, see [Upload your APNs push certificate](https://www.braze.com/docs/developer_guide/push_notifications/?sdktab=swift). For Apple's guidance on generating a `.p8` key from your developer account, see [Communicate with APNs using authentication tokens](https://developer.apple.com/help/account/capabilities/communicate-with-apns-using-authentication-tokens/).

## Web push notifications aren't behaving as expected

If you're experiencing issues with push notifications in your browser, you may need to reset your site's notification permissions and clear your site's storage. Refer to these steps for help.




### Reset Chrome on desktop

1. Next to your URL in the Chrome browser, select the **View Site Information** slider icon.
2. Under **Notifications**, select **Reset permission**.
3. Open Chrome DevTools. The following are the relevant shortcuts per operating system.

<style> 
table {
    max-width: 50%;
}
</style>

| OS      | Keyboard shortcuts                                                  |
| ------- | ------------------------------------------------------------------- |
| Mac      | `Fn` + `F12`<br>`Ctrl` + `Shift` + `I` |
| Windows | `F12`<br>`Ctrl` + `Shift` + `I` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Reset Chrome on desktop" }

{:start="4"}
4. In DevTools, navigate to the **Application** tab.
5. In the sidebar, select **Storage**.
6. Select **Clear site data**.
7. Chrome will prompt you to reload the page to apply your updated settings. Select **Reload**.

Your push permissions are now reset. Open a new tab to your site and try it out.

### Reset Chrome on Android

If you have a notification from your site visible in your Android notification drawer:

1. From the push notification, tap <i class="fas fa-cog" title="Settings"></i> and select **Site settings**.
2. From **Site settings**, tap **Clear & Reset**.

If you don't have a notification from your site open:

1. Open Chrome on Android.
2. Tap the <i class="fas fa-ellipsis-vertical"></i> menu.
3. Go to **Settings** > **Site Settings** > **Notifications**.
4. Verify notifications are set to **Ask before sending (recommended)**.
5. Find your site on the list.
6. Select the entry and tap **Clear and Reset**.

Your push permissions are now reset. Open a new tab to your site and try it out.




### Reset Firefox on desktop

1. Next to your site URL, select <i class="fa-solid fa-circle-info" alt="info icon"></i> or <i class="fas fa-lock" alt="lock icon"></i>.
2. Under **Permissions**, next to **Receive Notifications**, select <i class="fa-solid fa-circle-xmark" title="Clear this permission and ask again"></i> to clear notification permissions.
3. On the same menu, select **Clear Cookies and Site Data**.
4. In the dialog to confirm your choice, select **OK**.

Your push permissions are now reset. Open a new tab to your site and try it out.

### Reset Firefox on Android

To reset push permissions on Android, refer to this [Mozilla support article](https://support.mozilla.org/en-US/kb/clear-your-browsing-history-and-other-personal-data#w_clear-specific-items-from-your-browser).




### Reset Safari on macOS

**Note:**


These steps are for macOS only, as Apple doesn't support Web Push for Safari on Windows.



1. Open Safari.
2. From the [menu bar on Mac](https://support.apple.com/guide/mac-help/whats-in-the-menu-bar-mchlp1446/mac), go to **Safari** > **Settings** > **Websites** > **Notifications**.
3. Select your site from the list.
4. Select **Remove** to delete notification permissions for the site.
5. Then, go to **Privacy** > **Manage Website Data**.
6. Select your site from the list.
7. Select **Remove**, or to remove all site data, select **Remove All**.
8. Select **Done**.

Your push permissions are now reset. Open a new tab to your site and try it out.




## Push error messages

For detailed information about common push error messages (such as `DEVICE_UNREGISTERED`, `Unregistered`, `NotRegistered`, and others), refer to [Common push error messages](https://www.braze.com/docs/user_guide/channels/push/push_error_codes/).

Still need help? Open a [support ticket](https://www.braze.com/docs/braze_support/).
