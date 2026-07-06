# Custom code and JavaScript bridge for Banners

> When you use the **Custom Code** editor block in the Banner composer, you must call `brazeBridge.logClick()` from within your custom HTML to log clicks. Banners use the same JavaScript bridge as HTML in-app messages, so the same methods and patterns apply.

If you use custom HTML in your Banner design, the Braze SDK cannot automatically attach click listeners to elements inside your custom code. You must explicitly call `brazeBridge.logClick()` for any clickable elements (links, buttons, and similar) that you want to track in campaign analytics.

For example, to log a click when a user taps a button in your custom HTML:

```html
<button onclick="brazeBridge.logClick()">
  Click me
</button>
```

For the full JavaScript bridge reference, including all available methods and click tracking options, see the section below.

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

