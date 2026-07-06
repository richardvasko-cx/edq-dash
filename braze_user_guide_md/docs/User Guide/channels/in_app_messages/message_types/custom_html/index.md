# Custom HTML in-app messages {#custom-html-messages}

> While our standard in-app messages can be customized in a variety of ways, you can gain even greater control over the look and feel of your campaigns using messages designed and built using HTML, CSS, and JavaScript. With some simple composition, you can unlock custom functionality and branding to match any of your needs. 

This message type is available in the [traditional editor](https://www.braze.com/docs/user_guide/channels/in_app_messages/traditional/).

## How it works

HTML in-app messages allow for greater control over the look and feel of a message, including the following:

- Custom fonts and styles
- Videos
- Multiple images
- On-click behaviors
- Interactive components
- Custom animations

Custom HTML messages can use the [JavaScript Bridge](#javascript-bridge) methods to log events, set custom attributes, close the message, and more! Check out our [GitHub repository](https://github.com/braze-inc/in-app-message-templates) that contains detailed instructions on how to use and customize HTML in-app messages for your needs, and for a set of HTML5 in-app messages templates to help you get started.

**Note:**


To enable HTML in-app messages through the Web SDK, you must supply the `allowUserSuppliedJavascript` initialization option to Braze: for example, `braze.initialize('YOUR-API_KEY', {allowUserSuppliedJavascript: true})`. This is for security reasons since HTML in-app messages can execute JavaScript, so we require a site maintainer to enable them.



## JavaScript bridge {#javascript-bridge}

Custom HTML in-app messages and Banners support a JavaScript "bridge" to interface with the Braze SDK, allowing you to trigger custom Braze actions when users click on elements with links or otherwise engage with your content. These methods exist with the global `brazeBridge` or `appboyBridge` variable.

<div class='alert alert-important' role='alert'><img src='/docs/assets/img/message-important.png' alt='' class='alert-icon'><div class='alert-msg'><b>important</b><br />
<p>Braze recommends that you use the global <code class="language-plaintext highlighter-rouge">brazeBridge</code> variable. The global <code class="language-plaintext highlighter-rouge">appboyBridge</code> variable is deprecated but will continue to function for existing users. If you are using <code class="language-plaintext highlighter-rouge">appboyBridge</code>, we suggest you migrate to <code class="language-plaintext highlighter-rouge">brazeBridge</code>. <br /><br /> <code class="language-plaintext highlighter-rouge">appboyBridge</code> was deprecated in the following SDK versions:<br /><br /></p>
<ul>
  <li>Web: <a href="/docs/developer_guide/platform_integration_guides/web/changelog/#330">3.3.0+</a></li>
  <li>Android: <a href="/docs/developer_guide/platform_integration_guides/android/changelog/#1400">14.0.0+</a></li>
  <li>iOS: <a href="/docs/developer_guide/platform_integration_guides/ios/changelog/objc_changelog/#420">4.2.0+</a></li>
</ul>
</div></div>

For example, to log a custom attribute and custom event, then close the message, you could use the following JavaScript within your custom HTML:

```html
<button id="button">Set Favorite Color</button>
<script>
// Wait for the `brazeBridge` ready event, "ab.BridgeReady"
window.addEventListener("ab.BridgeReady", function(){
  // Event handler when the button is clicked
  document.querySelector("#button").onclick = function(){
    // Track Button 1 clicks for analytics
    // Note: This requires Android SDK v8.0.0, Web SDK v2.5.0, Swift SDK v5.4.0, and iOS SDK v3.23.0
    brazeBridge.logClick("0");
    // Set the user's custom attribute
    brazeBridge.getUser().setCustomUserAttribute("favorite color", "blue");
    // Track a custom event
    brazeBridge.logCustomEvent("completed survey");
    // Send the enqueued data to Braze
    brazeBridge.requestImmediateDataFlush();
    // Close the message
    brazeBridge.closeMessage();
  };
}, false);
</script>
```

### JavaScript Bridge methods {#bridge}

The following JavaScript methods are supported within custom HTML for in-app messages and Banners:

<style>
/* Makes first column wider */
#article-main > table:first-of-type > tbody > tr td:first-child {
    min-width: 470px !important;
}
/* Makes code column smaller font */
#article-main > table:first-of-type > tbody > tr td:first-child code {
    font-size:12px !important;
}
#article-main > table:first-of-type td {
  word-break: break-word;
}
</style>

| Method Name    | Description      |
| :------- | :------------------ |
| `brazeBridge.closeMessage()`                                                               | Close the current message. Behavior differs by channel: <br><br> **In-app messages:** closes the UI only. No dismissal is logged and no server-side suppression occurs. <br><br> **Banners:** equivalent to calling `logBannerDismissal`. This logs a Banner dismissal, removes the Banner from the UI, and suppresses the Banner for the user. Also re-triggers any active `subscribeToBannersUpdates` subscribers. Do not call this method if the message is already in the process of closing or will automatically close due to processing a deep-link.                          |
| `window.addEventListener("ab.BridgeReady", function(){...}, false)`                         | Callback method for when the `brazeBridge` has finished loading. All JavaScript code should be ran within this callback function.                                                                                                                                                              |
| `brazeBridge.requestImmediateDataFlush()`                                                  | Flush queued data to the Braze servers. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/modules/braze.html#requestimmediatedataflush)   |
| `brazeBridge.logClick(button_id_string)`                                                   | Log a button click for a given button ID. When `button_id_string` is left blank, a body-click will be logged instead. The `button_id_string` can be passed out as the `button_id` in [in-app message click events](https://www.braze.com/docs/user_guide/data_and_analytics/braze_currents/event_glossary/message_engagement_events/#in-app-message-click-events) via Currents. <br><br>This method was introduced in Android SDK v8.0.0, Web SDK v2.5.0, and iOS SDK v3.23.0<br><br>The `button_id_string` only accepts alphanumeric characters, spaces, dashes, and underscores. Adding a character with an accent (for example, ö,â,ê) breaks the button click tracking, resulting in the button string not appearing in the campaign analytics section and clicks not being accounted for. |
| `brazeBridge.logCustomEvent(eventName,eventProperties)`                                    | Log a custom event. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/modules/braze.html#logcustomevent)                                                                                                                                                                                   |
| `brazeBridge.logPurchase(productId, price, currencyCode, quantity, purchaseProperties)`    | Log a purchase. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/modules/braze.html#logpurchase)                                                                                                                                                                                          |
| `brazeBridge.getUser().addAlias(alias, label)`                                             | Adds an alias to a user. Introduced in Web SDK v2.7.0, Android v8.1.0, and iOS SDK v3.26.0 [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#addAlias)                                                                                                                                                                                       |
| `brazeBridge.getUser().addToCustomAttributeArray(key, value)`                              | Adds to a custom attribute array. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#addToCustomAttributeArray)                                                                                                                                                                 |
| `brazeBridge.getUser().addToSubscriptionGroup(subscriptionGroupId)` | Adds a user to an email or SMS subscription group. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/classes/appboy.user.html#addtosubscriptiongroup).<br><br>This method was introduced in Android SDK v15.0.0, Web SDK v3.4.0, and iOS SDK v4.3.3. |
| `brazeBridge.getUser().removeFromSubscriptionGroup(subscriptionGroupId)` | Removes a user from an email or SMS subscription group. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/classes/appboy.user.html#removefromsubscriptiongroup).<br><br>This method was introduced in Android SDK v15.0.0, Web SDK v3.4.0, and iOS SDK v4.3.3. |
| `brazeBridge.getUser().setFirstName(firstName)`                                            | Set a user's first name. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setFirstName)                                                                                                                                                                                       |
| `brazeBridge.getUser().setLastName(lastName)`                                              | Set a user's last name. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setLastName)                                                                                                                                                                                         |
| `brazeBridge.getUser().setEmail(email)`                                                    | Set a user's email address. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setEmail)                                                                                                                                                                                        |
| `brazeBridge.getUser().setGender(gender)`                                                  | Set a user's gender. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setGender)                                                                                                                                                                                              |
| `brazeBridge.getUser().setDateOfBirth(year, month, day)`                                   | Set a user's date of birth. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setDateOfBirth)                                                                                                                                                                                  |
| `brazeBridge.getUser().setCountry(country)`                                                | Set a user's country. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setCountry)                                                                                                                                                                                            |
| `brazeBridge.getUser().setHomeCity(city)`                                                  | Set a user's city. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setHomeCity)                                                                                                                                                                                              |
| `brazeBridge.getUser().setEmailNotificationSubscriptionType(notificationSubscriptionType)` | Set email notification subscription status. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setEmailNotificationSubscriptionType)                                                                                                                                            |
| `brazeBridge.getUser().setPushNotificationSubscriptionType(notificationSubscriptionType)`  | Set push notification subscription status. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setPushNotificationSubscriptionType)                                                                                                                                              |
| `brazeBridge.getUser().setPhoneNumber(phoneNumber)`                                        | Set a user's phone number. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setPhoneNumber)                                                                                                                                                                                   |
| `brazeBridge.getUser().setCustomUserAttribute(key, value, merge)`                                 | Set a custom user attribute. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setCustomUserAttribute)                                                                                                                                                                         |
| `brazeBridge.getUser().removeFromCustomAttributeArray(key, value)`                         | Remove a custom user attribute. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#removeFromCustomAttributeArray)                                                                                                                                                              |
| `brazeBridge.getUser().incrementCustomUserAttribute(key, incrementValue)`                  | Increment a custom user attribute. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#incrementCustomUserAttribute)                                                                                                                                                             |
| `brazeBridge.getUser().setLanguage(language)`                                              | Set a user's language. Introduced in Android SDK v5.0.0 and Web SDK v2.6.0. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setLanguage)                                                                                                    |
| `brazeBridge.getUser().setCustomLocationAttribute(key, latitude, longitude)`               | Set a custom location attribute. Introduced in Android SDK v5.0.0. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html#setCustomLocationAttribute)                                                                                                            |
| `brazeBridge.web.registerAppboyPushMessages(successCallback, deniedCallback)`              | Register for web push (web only). This method is a no-op when called in a non-web environment. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/modules/braze.html#requestpushpermission)                                        |
| `brazeBridge.requestPushPermission(successCallback, deniedCallback)` | Register for push across Web, iOS, and Android. Note: the method's callbacks are only supported on web. This method was introduced as of Web SDK v4.0.0, Android SDK v21.0.0, and Swift SDK v5.4.0. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/modules/braze.html#requestpushpermission) |
| `brazeBridge.changeUser(id, sdkAuthSignature?)`                                            | Identify user with a unique ID. [JS Docs](https://js.appboycdn.com/web-sdk/latest/doc/modules/braze.html#changeuser)<br><br>This method was introduced in Web SDK v4.3.0. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Table" }


### Button click tracking

Use the `brazeBridge.logClick(button_id)` method to track clicks in your custom HTML.

<div class='alert alert-note' role='alert'><img src='/docs/assets/img/message-note.png' alt='' class='alert-icon'><div class='alert-msg'><b>note</b><br />
<p><strong>Banners:</strong> Only <code class="language-plaintext highlighter-rouge">brazeBridge.logClick()</code> (without arguments) is supported. Button IDs and custom button tracking are supported for in-app messages only.</p>
</div></div>

For in-app messages, you can programmatically track "Button 1", "Button 2", and "Body Clicks" using `brazeBridge.logClick('0')`, `brazeBridge.logClick('1')`, or `brazeBridge.logClick()`, respectively.

| Clicks     | Method                       | Supported |
| ---------- | ---------------------------- | --------- |
| Body click | `brazeBridge.logClick()`    | In-app messages and Banners |
| Button 1   | `brazeBridge.logClick('0')` | In-app messages only |
| Button 2   | `brazeBridge.logClick('1')` | In-app messages only |
| Custom button tracking |`brazeBridge.logClick('your custom name here')`| In-app messages only |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Button click tracking" }

For in-app messages, you can track multiple button click events per impression. For example, to close a message and log a Button 2 click:

```html
<a href="#" onclick="brazeBridge.logClick('1');brazeBridge.closeMessage()">✖</a>
```

You can also track new custom button names—up to 100 unique names per campaign. For example, `brazeBridge.logClick('blue button')` or `brazeBridge.logClick('viewed carousel page 3')`.

<div class='alert alert-tip' role='alert'><img src='/docs/assets/img/message-tip.png' alt='' class='alert-icon'><div class='alert-msg'><b>tip</b><br />
<p>When using JavaScript methods inside an <code class="language-plaintext highlighter-rouge">onclick</code> attribute, wrap string values in single quotes to avoid conflicts with the double-quoted HTML attribute.</p>
</div></div>

#### Limitations (in-app messages only)

- You can have up to 100 unique button IDs per campaign.
- Button IDs can have up to 255 characters each.
- Button IDs can only include letters, numbers, spaces, dashes, and underscores.


## Link-based actions

In addition to custom JavaScript, Braze SDKs can also send analytics data with these convenient URL shortcuts. Note that these query parameters and URL schemes are all case sensitive.

### Button click tracking (deprecated)

**Warning:**


The use of `abButtonID` is not supported in [HTML with Preview](https://www.braze.com/docs/user_guide/channels/in_app_messages/message_types/custom_html/#html-upload-with-preview/) message types. For more information, see our [upgrade guide](https://www.braze.com/docs/user_guide/channels/in_app_messages/message_types/custom_html/#html-upload-with-preview).



To log button clicks for in-app message analytics, you can add `abButtonId` as a query parameter to any deep link, redirect URL, or anchor element `<a>`. Use `?abButtonId=0` to log a "Button 1" click, and `?abButtonId=1` to log a "Button 2" click.

As with other URL parameters, the first parameter should begin with a question mark `?`, while subsequent parameters should be separated by an ampersand `&`.

#### Example URLs

- `https://example.com/?abButtonId=0` - Button 1 click
- `https://example.com/?abButtonId=1` - Button 2 click
- `https://example.com/?utm_source=braze&abButtonId=0` - Button 1 click with other existing URL parameters
- `myApp://deep-link?page=home&abButtonId=1` - Mobile deeplink with Button 2 click
- `<a href="https://example.com/?abButtonId=1">` - Anchor element `<a>` with Button 2 click

**Note:**


In-app messages support only Button 1 and Button 2 clicks. URLs that do not specify one of these two button IDs will be logged as generic "body clicks".



### Open link in new window (mobile only)

To open links outside your app in a new window, set `?abExternalOpen=true`. The message will be dismissed before opening the link.

For deep linking, Braze will open your URL regardless of the value of `abExternalOpen`.

### Open as deeplink (mobile only)

To have Braze handle your HTTP or HTTPS link as a deep link, set `?abDeepLink=true`.

When this query string parameter is absent or set to `false`, Braze will try to open the web link in an internal web browser inside the host app.

### Close in-app message

To close an in-app message, you can use the `brazeBridge.closeMessage()` javascript method.

For example, `<a onclick="brazeBridge.closeMessage()" href="#">Close</a>` will close the in-app message.

## HTML upload with preview

When crafting custom HTML in-app messages, you can preview your interactive content directly in Braze. 

The message preview panel of the editor shows a realistic preview that renders the JavaScript included in your message. You can preview and interact with your custom messages from the preview panel by clicking through pagination, submitting forms or surveys, watching JavaScript animations, and more!

![Interacting with the HTML preview by swiping through pages.](https://www.braze.com/docs/assets/img/iam-beta-javascript-preview.gif?d5722d71befd68713d0297d7224dad88)

**Tip:**


Any `brazeBridge` JavaScript methods you use in your HTML won't update user profiles while previewing in the dashboard.



### SDK requirements {#supported-sdk-versions}

To use the HTML preview for in-app messages, you must upgrade to the following minimum Braze SDK versions:

<div id='sdk-versions'><a href='/docs/developer_guide/platforms/swift/changelog/#500' class='sdk-versions--chip ios-sdk' target='_blank'><i class='fa-brands fa-apple'></i> &nbsp; Swift: 5.0.0+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a><a href='/docs/developer_guide/platforms/web/changelog/#250' class='sdk-versions--chip web-sdk' target='_blank'><i class='fa-solid fa-desktop'></i> &nbsp; Web: 2.5.0+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a><a href='/docs/developer_guide/platforms/android/changelog/#800' class='sdk-versions--chip android-sdk' target='_blank'><i class='fa-brands fa-android'></i> &nbsp; Android: 8.0.0+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a></div>

**Warning:**


Because this message type can only be received by certain later SDK versions, users who are on unsupported SDK versions will not receive the message. Consider adopting this message type after a significant portion of your user base is reachable, or target only those users whose app version is later than the requirements. Learn more about [filtering by most recent app version](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies/new_features#filtering-by-most-recent-app-versions).



### Creating a campaign {#instructions}

Your mobile app users need to upgrade to the supported SDK versions to receive a **Custom Code** in-app message. We recommend that you [nudge users to upgrade](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies/new_features/) their mobile apps before launching campaigns that depend on newer Braze SDK versions.

#### Asset files

When creating custom code in-app messages with HTML upload, you can upload campaign assets to the [media library](https://www.braze.com/docs/user_guide/messaging/design_and_edit/media_library/) to reference in your message.

The following file types are supported for upload:

| File Type        | File Extension                    |
| :--------------- | :-------------------------------- |
| Font Files       | `.ttf`, `.woff`, `.otf`, `.woff2` |
| SVG Images       | `.svg`                            |
| JavaScript Files | `.js`                             |
| CSS Files        | `.css`                            |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Asset files" }

Braze recommends uploading assets to the media library for two reasons:

1. Assets added to a campaign via the media library allow your messages to be displayed even while the user is offline or has a poor internet connection.
2. Assets uploaded to Braze can be reused across campaigns.

##### Adding asset files

You can add new or existing assets to your campaign.

To add new assets to your campaign, use the drag-and-drop section to upload a file. Assets added in this section will also be automatically added to the media library. To add assets that you've already uploaded to the media library, select **Add from Media Library**.

After your assets are added, they will appear in the **Assets for this campaign** section. 

If an asset's filename matches that of a local HTML asset, it is replaced automatically (for example, `cat.png` is uploaded and `<img src="cat.png" />` exists). 

Otherwise, hover over an asset from the list and select <i class="fas fa-copy"></i> **Copy** to copy the file's URL to your clipboard. Then paste the copied asset URL into your HTML as you normally would when referencing a remote asset.

### HTML editor

Changes you make in the HTML automatically render in the preview panel as you type. Any [`brazeBridge` JavaScript](#bridge) methods you use in your HTML won't update user profiles while previewing in the dashboard.

**Tip:**


You can select <i class="fa-solid fa-magnifying-glass"></i> **Search** within the HTML editor to search within your code!



### Button tracking {#button-tracking-improvements}

You can track performance within your custom code in-app message using the [`brazeBridge.logClick(button_id)`](https://www.braze.com/docs/user_guide/channels/in_app_messages/message_types/) JavaScript method. This allows you to programmatically track "Button 1", "Button 2", and "Body Clicks" using `brazeBridge.logClick('0')`, `brazeBridge.logClick('1')`, or `brazeBridge.logClick()`, respectively.

| Clicks     | Method                       |
| ---------- | ---------------------------- |
| Button 1   | `brazeBridge.logClick('0')` |
| Button 2   | `brazeBridge.logClick('1')` |
| Body click | `brazeBridge.logClick()`    |
| Custom button tracking |`brazeBridge.logClick('your custom name here')`|
{: .reset-td-br-1 .reset-td-br-2 aria-label="Button tracking #button-tracking-improvements" }

**Note:**


This method of button tracking replaces the prior automatic click tracking methods (such as `?abButtonId=0`), which have been removed.



### Backward incompatible changes {#backward-incompatible-changes}

1. The most notable incompatible change with this new message type is the SDK requirements. Users whose app SDK does not meet the minimum [SDK version requirements](#supported-sdk-versions) will not be shown the message.
2. The `braze://close` deeplink, which was previously supported on mobile apps, has been removed in favor of the JavaScript `brazeBridge.closeMessage()`. This allows for cross-platform HTML messages, since the web does not support deeplinks.
3. Automatic click tracking, which used `?abButtonId=0` for button IDs, and "body click" tracking on close buttons have been removed. The following code examples show how to change your HTML to use our new click tracking JavaScript methods:

   | Before | After |
   |:-------- |:------------|
   |<code>&lt;a href="braze://close"&gt;Close Button&lt;/a&gt;</code>|<code>&lt;a href="#" onclick="brazeBridge.logClick();brazeBridge.closeMessage()"&gt;Close Button&lt;/a&gt;</code>|
   |<code>&lt;a href="braze://close?abButtonId=0"&gt;Close Button&lt;/a&gt;</code>|<code>&lt;a href="#" onclick="brazeBridge.logClick('0');brazeBridge.closeMessage()"&gt;Close Button&lt;/a&gt;</code>|
   |<code>&lt;a href="app://deeplink?abButtonId=0">Track button 1&lt;/a&gt;</code>|<code>&lt;a href="app://deeplink" onclick="brazeBridge.logClick('0')"&gt;Track button 1&lt;/a&gt;</code>|
   |<code>&lt;script&gt;<br>location.href = "braze://close?abButtonId=1"<br>&lt;/script&gt;</code>|<code>&lt;script&gt;<br>window.addEventListener("ab.BridgeReady", function(){<br>&nbsp;&nbsp;brazeBridge.logClick("1");<br>&nbsp;&nbsp;brazeBridge.closeMessage();<br>});<br>&lt;/script&gt;</code>|
{: .reset-td-br-1 .reset-td-br-2 aria-label="Backward incompatible changes #backward-incompatible-changes" }

