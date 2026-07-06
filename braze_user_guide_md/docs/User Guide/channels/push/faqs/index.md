# Frequently asked questions

> This article provides answers to some frequently asked questions about the push channel.

### What happens when multiple users log into a single device?

When a user logs out of a device or website, they will remain reachable by push until another user logs in. At that point, the push token is reassigned to the new user. This is because each device can only have one active push subscription per app or website.

When a push token is reassigned, the change is reflected in the user profile's **Push Changelog**. You can find this by going to the **Engagement** tab in the user profile.

![The "Push Changelog" in the "Contact Settings" section.](https://www.braze.com/docs/assets/img/push_changelog_faq.png?bf69a43c5360fa0dbfe4f37f0cc7069d){: style="max-width:50%;"}

### When I send a test push, does it go to all of my devices?

Yes. The test push is sent to every push-enabled device associated with the selected user profile. If you have multiple phones or tablets logged in with the same user, each device with a valid push token receives the notification.

To send the test push to only one device, you can remove push tokens for the other devices from the user profile before testing. Alternatively, if you're sending with the [`/messages/send` endpoint](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_messages/), set `send_to_most_recent_device_only` to `true` in the `apple_push` or `android_push` object so that only the most recently active device receives the push.

### What does “Error sending push because the payload was invalid” mean?

This message indicates that APNs rejected the push request due to an invalid payload (for example, an empty payload or a payload that’s too large).

For details and next steps, see [Common push error messages](https://www.braze.com/docs/user_guide/channels/push/push_error_codes/).

### Why doesn't an opted-in user have a push token?

This can happen if the user’s push token was reassigned to someone else who used the same device.

1. Go to the **Push Changelog** in the **Engagement** tab of the affected user's profile.
2. Look for a message that says the push token was moved to another user.
3. Copy the push token and paste into the user search bar. 
4. If the push token still exists, you'll be directed to the user who most recently logged in on the device.

If you want the push token reassigned to the original user:

1. Have the original user log into the profile with the missing push token.
2. Trigger a new push send. This will move the token back to the account if they still have push enabled on the device level.

### Why does "Open web URL inside mobile app" always open the app when I'm testing a draft campaign?

When a campaign is still in **Draft** status, and you send a test push, tapping the notification always opens the app first, regardless of whether the **Open web URL inside mobile app** option is selected or cleared. When the campaign is **Live**, the on-click behavior works as configured.

If you selected **Open web URL** without the **Inside App** option, the link opens directly in the device's default browser. If you selected **Open web URL inside mobile app**, the link opens in an in-app web view.

### What is the difference between "Send to Production" and "Send to Development" for iOS push certificates?

When adding an Apple Push Certificate in Braze, the **Send to Production** and **Send to Development** options determine which APNs (Apple Push Notification service) gateway Braze uses to deliver push notifications:

- **Send to Development:** Select this if the app was built in development mode in Xcode and signed with a development provisioning profile. Push notifications are routed through Apple's development (sandbox) gateway.
- **Send to Production:** Select this if the app is distributed via Apple's TestFlight, App Store, or enterprise distribution. Push notifications are routed through Apple's production gateway.

If the wrong option is selected, push notifications silently fail because the push token type does not match the gateway. Typically, apps distributed through TestFlight or the App Store should use **Send to Production**.

### What is the difference between the "Foreground Push Enabled" and "Background or Foreground Push Enabled" filters?

These segmentation filters check for different conditions:

| Filter | What it checks | Use case |
|--------|---------------|----------|
| **Foreground Push Enabled** | The user has a valid foreground push token **and** their push subscription state is `Opted-In` or `Subscribed`. | Target users who can receive visible push notifications. |
| **Background or Foreground Push Enabled** | The user has any push token (foreground or background) **and** their push subscription state is `Opted-In` or `Subscribed`. This includes users who have disabled visible push notifications but still have a background push token. | Used for [uninstall tracking](https://www.braze.com/docs/user_guide/analytics/tracking/uninstall_tracking/), [silent push notifications](https://www.braze.com/docs/developer_guide/push_notifications/silent/), and geofencing. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="What is the difference between the "Foreground Push Enabled" and "Background or Foreground Push Enabled" filters?" }

A user can be `Background or Foreground Push Enabled` without being `Foreground Push Enabled`. This happens when the user has disabled visible push notifications in their device settings but the app still holds a background push token. For more details, see [Push users and subscriptions](https://www.braze.com/docs/user_guide/channels/push/push_setup/push_subscription_states/#foreground-push-enabled).

### How does Braze determine when a push message is sent successfully?

A message is logged as sent as soon as the message is received by the push service provider. This does not necessarily mean the user has received or viewed the message.

For iOS, the push service provider is Apple Push Notification Service (APNs), and for Android, it is typically Firebase Cloud Messaging (FCM). The push service provider immediately responds with success or failure. A failure could include a bounce or a retry for network failure.

If a success message is returned, the send is logged by Braze, then the push service attempts to deliver to the device. If the device cannot immediately be reached, the service retries up to its expiration option set in Braze (**TTL** for Android, **Expiry** for iOS). If the message times out, the push service discards the push, but it is not be considered a bounce.

- For action-based delivery push campaigns, the message send is logged as soon as the user has performed the action that triggers the campaign.
- For scheduled campaigns, the send time is the time the message was enqueued and passed to the push service provider.
- For both delivery types, the message is marked as "sent" in Braze and in the user profile under **Campaigns Received**, even though the user may not have seen or received the push yet.

The "deliveries" metric for push in the dashboard is calculated on page load as the number of sends minus bounces.