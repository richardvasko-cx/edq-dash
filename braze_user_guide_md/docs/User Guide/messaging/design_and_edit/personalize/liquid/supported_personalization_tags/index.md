# Supported personalization tags

> This reference article covers a complete list of supported Liquid personalization tags.

## Summary of supported tags

As a convenience, a summary of supported personalization tags are provided. For more detail on each type of tag and best practices, continue reading.



| Personalization tag type | Tags |
| -------------  | ---- |
| Standard (Default) Attributes | `{{${city}}}` <br> `{{${country}}}` <br> `{{${date_of_birth}}}` <br> `{{${email_address}}}` <br> `{{${first_name}}}` <br> `{{${gender}}}` <br> `{{${language}}}` <br> `{{${last_name}}}` <br> `{{${last_used_app_date}}}` <br> `{{${most_recent_app_version}}}` <br> `{{${most_recent_locale}}}` <br> `{{${most_recent_location}}}` <br> `{{${phone_number}}}` <br> `{{${time_zone}}}` <br> `{{${user_id}}}` <br> `{{${braze_id}}}` <br> `{{${random_bucket_number}}}` <br> `{{subscribed_state.${email_global}}}` <br> `{{subscribed_state.${subscription_group_id}}}` |
| Device Attributes | `{{most_recently_used_device.${carrier}}}` <br> `{{most_recently_used_device.${id}}}` <br> `{{most_recently_used_device.${idfa}}}` <br> `{{most_recently_used_device.${model}}}` <br> `{{most_recently_used_device.${os}}}` <br> `{{most_recently_used_device.${platform}}}` <br> `{{most_recently_used_device.${google_ad_id}}}` <br> `{{most_recently_used_device.${roku_ad_id}}}` <br> `{{most_recently_used_device.${foreground_push_enabled}}}`|
| <a href='/docs/user_guide/channels/email/subscriptions#managing-user-subscriptions'>Email List Attributes</a> | `{{${set_user_to_unsubscribed_url}}}` <br>This tag replaces the previous `{{${unsubscribe_url}}}` tag. While the older tag still works in previously created emails, we recommend that you use the newer tag instead. <br><br> `{{${set_user_to_one_click_list_unsubscribe}}}` <br> `{{${set_user_to_subscribed_url}}}` <br> `{{${set_user_to_opted_in_url}}}` |
| <a href='/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/user_retargeting#trigger-messages'>SMS Attributes</a> | `{{sms.${inbound_message_body}}}` <br> `{{sms.${inbound_media_urls}}}` |
| <a href='/docs/user_guide/channels/whatsapp/message_processing/messaging_users'>WhatsApp Attributes</a> | `{{whats_app.${inbound_message_body}}}` <br> `{{whats_app.${inbound_media_urls}}}` <br> `{{whats_app.${inbound_flow_response}}}` <br> `{{whats_app.${inbound_product_id}}}` <br> `{{whats_app.${inbound_catalog_id}}}` <br> `{{whats_app.${inbound_profile_name}}}` |
| Campaign Attributes and Canvas Step Attributes | `{{campaign.${api_id}}}` <br> `{{campaign.${dispatch_id}}}` <br> `{{campaign.${name}}}` <br> `{{campaign.${message_name}}}` <br> `{{campaign.${message_api_id}}}` |
| Canvas Attributes | `{{canvas.${name}}}` <br> `{{canvas.${api_id}}}` <br> `{{canvas.${variant_name}}}` <br> `{{canvas.${variant_api_id}}}` |
| Card Attributes | `{{card.${api_id}}}` <br> `{{card.${name}}}` |
| Geofencing Events | `{{event_properties.${geofence_name}}}` <br> `{{event_properties.${geofence_set_name}}}` |
| Event Properties <br> (These are custom to your workspace.)| `{{event_properties.${your_custom_event_property}}}` |
| Canvas Context Variables | `{{context.${your_context_variable}}}` |
| Custom Attributes <br> (These are custom to your workspace.) | `{{custom_attribute.${your_custom_attribute}}}` |
| <a href='/docs/api/objects_filters/trigger_properties_object/'>API Trigger Properties</a> | `{{api_trigger_properties.${your_api_trigger_property}}}` |
| Canvas Entry Properties | `{{context.${property_name}}}` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Summary of supported tags" }



### Supported attributes

Campaign, Card, and Canvas attributes are only supported in their corresponding messaging templates (for example, `dispatch_id` isn't available in in-app message campaigns).

For more detail, see [Campaign and Canvas attributes across sources](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/sources/campaign_and_canvas_attributes_across_sources/).

### Canvas and campaign tag differences 

The behavior for the following tags differs between Canvas and campaigns:

- `dispatch_id` behavior differs because Braze treats Canvas steps as triggered events, even when they are "scheduled" (except for entry steps, which can be scheduled). For more information, see [Dispatch ID behavior](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/dispatch_id/).
- Using the `{{campaign.${name}}}` tag with Canvas displays the Canvas component name. When using this tag with campaigns, it displays the campaign name.


#### Campaign names in URLs
{: #campaign-names-in-urls}


Campaign and message variant names can include characters that are not URL-safe, such as `%`, spaces, or `&`. When you insert `{{campaign.${name}}}` or `{{campaign.${message_name}}}` in a link or query string, such as a `utm_campaign` parameter, apply the [`url_encode`](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/advanced_filters/#url-filters) filter so the URL parses correctly. For example:

```liquid
https://example.com/?utm_campaign={{ campaign.${name} | url_encode }}
```


## Most recently used device information

You can template the following attributes for the user's most recent device across all platforms. If a user has not used your application (for example, you imported the user via REST API), then these values are all `null`.



|Tag | Description |
|---|---|
|`{{most_recently_used_device.${browser}}}` | The most recently used browser on the user's device. Examples include "Chrome" and "Safari". |
|`{{most_recently_used_device.${id}}}` | The Braze device identifier. On iOS, this can be the Apple Identifier for Vendor (IDFV) or a UUID. For Android and other platforms, it's a randomly generated UUID. |
| `{{most_recently_used_device.${carrier}}}` | The most recently used device's telephone service carrier, if available. Examples include "Verizon" and "Orange". |
| `{{most_recently_used_device.${ad_tracking_enabled}}}` | If the device has ad tracking enabled or not. This is a boolean value (`true` or `false`). |
| `{{most_recently_used_device.${idfa}}}` | For iOS devices, this value is the Identifier for Advertising (IDFA) if your application is configured with our [optional IDFA collection](https://www.braze.com/docs/developer_guide/platforms/legacy_sdks/ios/initial_sdk_setup/other_sdk_customizations/). For non-iOS devices, this value is null. |
| `{{most_recently_used_device.${google_ad_id}}}` | For Android devices, this value is the Google Play Advertising Identifier if your application is configured with our optional Google Play Advertising ID collection. For non-Android devices, this value is null. |
| `{{most_recently_used_device.${roku_ad_id}}}` | For Roku devices, this value is the Roku Advertising Identifier that is collected when your application is configured with Braze. For non-Roku devices, this value is null. |
| `{{most_recently_used_device.${model}}}` | The device's model name, if available. Examples include "iPhone 6S" and "Nexus 6P" and "Firefox". |
| `{{most_recently_used_device.${os}}}` | The device's operating system, if available. Examples include "iOS 9.2.1" and "Android (Lollipop)" and "Windows". |
| `{{most_recently_used_device.${platform}}}` | The device's platform, if available. If set, the value is one of `ios`, `android`, `kindle`, `android_china`, `web`, or `tvos`. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Most recently used device information" }

Because there is such a wide range of device carriers, model names, and operating systems, we advise that you thoroughly test any Liquid that conditionally depends on any of those values. These values are `null` if they are not available on a particular device.

## Targeted app information

For in-app messages, you can use the following app attributes within Liquid. The values are based on which SDK API key your apps use to request messaging.

|Tag | Description |
|------------------|---|
| `{{app.${api_id}}}` | The API key of the app requesting the message. For example, you use this key in conjunction with `abort_message()` Liquid to avoid sending in-app messages to certain apps, such as TV platforms or development builds that use a separate SDK API key.|
| `{{app.${name}}}` | The name of the app (as defined in the Braze dashboard) requesting the message. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Targeted app information" }

For example, this Liquid code aborts a message if the requesting apps are not one of the two API keys in the list:

```liquid
{% assign allowed_api_keys = 'sdk_api_key_1,sdk_api_key_2' | split: ',' %}
{% if allowed_api_keys contains {{app.${api_id}}} %}
User is in list of apps
{% else %}
{% abort_message("User not in list of apps") %}
{% endif %}
```

## Targeted device information

For push notifications, in-app messages, and Banners, you can template in the following attributes for the device that receives the message. A push notification, in-app message, or Banner can include attributes of the device on which the user reads the message. These attributes don't work for Content Cards or emails. For emails, messages are rendered before sending, so the device the user opens the email on is unknown at that time.

|Tag | Description |
|------------------|---|
| `{{targeted_device.${id}}}` | This is the Braze device identifier. On iOS, this can be the Apple Identifier for Vendor (IDFV) or a UUID. For Android and other platforms, it is a randomly generated UUID. For example, if a user has five devices, a send attempt occurs for all five devices, each using the corresponding device identifier. If a message is configured to send to a user's most recently used device, only one send attempt  occurs to the most recently used device identified through Braze. |
| `{{targeted_device.${carrier}}}` | The most recently used device's telephone service carrier, if available. Examples include "Verizon" and "Orange". |
| `{{targeted_device.${idfa}}}` | For iOS devices, this value is the Identifier for Advertising (IDFA) if your application is configured with our [optional IDFA collection](https://www.braze.com/docs/developer_guide/platforms/legacy_sdks/ios/initial_sdk_setup/other_sdk_customizations/). For non-iOS devices, this value is null. |
| `{{targeted_device.${google_ad_id}}}` | For Android devices, this value is the Google Play Advertising Identifier if your application is configured with our [optional Google Play Advertising ID collection]. For non-Android devices, this value is null. |
| `{{targeted_device.${roku_ad_id}}}` | For Roku devices, this value is the Roku Advertising Identifier that is collected when your application is configured with Braze. For non-Roku devices, this value is null. |
| `{{targeted_device.${model}}}` | The device's model name, if available. Examples include "iPhone 6S" and "Nexus 6P" and "Firefox". |
| `{{targeted_device.${os}}}` | The device's operating system, if available. Examples include "iOS 9.2.1" and "Android (Lollipop)" and "Windows". |
| `{{targeted_device.${platform}}}` | The device's platform, if available. If set, the value is one of `ios`, `android`, `kindle`, `android_china`, `web`, or `tvos`. You can also use the `most_recently_used_device` personalization tag. |
| `{{targeted_device.${foreground_push_enabled}}}` | This value is `true` when the targeted device is enabled for foreground push, `false` otherwise. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Targeted device information" }



Because there is such a wide range of device carriers, model names, and operating systems, we advise that you thoroughly test any logic that conditionally depends on any of those values. These values are `null` if they are not available on a particular device. 

Furthermore, for push notifications, it is possible that Braze cannot discern the device attached to the push notification under certain circumstances such as if the push token was imported through API, resulting in values being `null` for those messages.

![Example of using a default value of "there" when using a first name variable in a push message.](https://www.braze.com/docs/assets/img_archive/personalized_firstname_.png?ab1f2c99d1b34b0bdddaab42c8916a0b)

### Using conditional logic instead of a default value

In some circumstances, you may opt to use [conditional logic](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/conditional_logic/) instead of setting a default value. Conditional logic allows you to send messages that differ based on the value of a custom attribute. Additionally, you can use conditional logic to [abort messages](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/aborting_messages/) to customers with null or blank attribute values. 

#### Use case

For example, let's say you're sending a rewards balance notification to customers. There isn't a good way to account for customers with low and null balances using default values.

In this case, there are two options that may work better than setting a default value:

1. Abort the message for customers with low, null, and blank balances.



   ```liquid
   {% if {{custom_attribute.${balance}}} > 0 %}
   Your rewards balance is {{custom_attribute.${balance}}}
   {% else %}
   {% abort_message() %}
   {% endif %}
   ```



2. Send a completely different message to these customers, such as:



   ```liquid
   {% if ${first_name} != blank and ${first_name} != null %}
   Hello {{${first_name} | default: 'there'}}, thanks for downloading!
   {% else %}
   Thanks for downloading!
   {% endif %}
   ```

In this use case, a user with a blank or null first name receives the message "Thanks for downloading". You should include a [default value](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/setting_default_values/) for first name to make sure that your customer doesn't see Liquid in the event of a mistake.



## Variable tags

You can use the `assign` tag to create a variable in the message composer. We recommend using a unique name for your variable. If you create a variable with a similar name to the supported personalization tags (such as `language`), this may affect your messaging logic.

After you create a variable, you can reference that variable in your messaging logic or message. This tag comes in handy when you want to reformat content that is returned from our [Connected Content](https://www.braze.com/docs/assets/img_archive/personalized_firstname_.png?ab1f2c99d1b34b0bdddaab42c8916a0b) feature. You can read more in Shopify's documentation on [variable tags](https://docs.shopify.com/themes/liquid/tags/variable-tags).

**Tip:**


Find yourself assigning the same variables in every message? Instead of writing out the `assign` tag over and over again, you can save that tag as a Content Block and put it at the top of your message instead.

1. [Create a Content Block](https://www.braze.com/docs/user_guide/messaging/design_and_edit/content_blocks/#create-a-content-block).
2. Give your Content Block a name (no spaces or special characters).
3. Select **Edit** at the bottom of the page.
4. Type in your `assign` tags.

As long as the Content Block is at the top of your message, every time the variable is inserted into your message as an object, it refers to your chosen custom attribute.



### Use case

Let's say that you allow your customers to cash in their rewards points for prizes after they accrue 100 rewards points. So, you only want to message customers who would have a points balance greater than or equal to 100 if they made that additional purchase:


```liquid
{% assign new_points_balance = {{custom_attribute.${current_rewards_balance} | plus: 50}} %}
{% if new_points_balance >= 100 %}
Make a purchase to bring your rewards points to {{new_points_balance}} and cash in today!
{% else %}
{% abort_message('not enough points') %}
{% endif %}
```


## Iteration tags


Iteration tags can be used to run a block of code repeatedly. The use case below features the `for` tag.

### Use case

Let's say that you're having a sale on Nike sneakers and want to message customers who've expressed interest in Nike. You have an array of product brands viewed on each customer's profile. This array could contain up to 25 product brands, but you only want to message customers who viewed a Nike product as one of their 5 most recent product views.

```liquid
{% for items in {{custom_attribute.${Brands Viewed}}} limit:5 %}
{% if {{items}} contains 'Converse' %}
{% assign converse_viewer = true %}
{% endif %}
{% endfor %}
{% if converse_viewer == true %}
Sale on Converse!
{% else %}
{% abort_message() %}
{% endif %}
```

In this use case, we check the first five items in the sneaker brands viewed array. If one of those items is converse, we create the `converse_viewer` variable and set it to true.

Then, we send the sale message when `converse_viewer` is true. Otherwise, we abort the message.

This is a simple example of how iteration tags can be used in the Braze message composer. You can find more information in Shopify's documentation on [iteration tags](https://docs.shopify.com/themes/liquid/tags/iteration-tags).

## Syntax tags

Syntax tags can be used to control how Liquid is rendered. You can use the `echo` tag to return an expression. This is the same as wrapping an expression using curly brackets, except you can use this tag within Liquid tags. You can also use the `liquid` tag to have a block of Liquid without any delimiters on each tag. Each tag has to be in its own line when using the `liquid` tag. Check out Shopify's documentation on [syntax tags](https://shopify.dev/api/liquid/tags#syntax-tags) for more information and examples.

With [whitespace control](https://shopify.github.io/liquid/basics/whitespace/), you can remove whitespaces around your tags, helping you further control what the Liquid output looks like.

## HTTP status codes {#http-personalization}

You can utilize the HTTP status from a [Connected Content](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content/) call by first saving it as a local variable and then using the `__http_status_code__` key. For example:

```html
{% connected_content https://example.com/api/endpoint :save connected %}
{% if connected.__http_status_code__ != 200 %}
{% abort_message('Connected Content returned a non-200 status code') %}
{% endif %}
```


**Note:**


This key is only automatically added to the Connected Content object if the endpoint returns a JSON object. If the endpoint returns an array or other type, that key cannot be set automatically in the response.



## Send messages based on language, most recent locale, and time zone

In some situations, you may wish to send messages that are specific to particular locales. For example, Brazilian Portuguese is typically different than European Portuguese.

### Use case: Localize based on recent locale

Here's a use case of how you can use the most recent locale to further localize an internationalized message.



```liquid
{% if ${language} == 'en' %}
Message in English
{% elsif  ${language} == 'fr' %}
Message in French
{% elsif  ${language} == 'ja' %}
Message in Japanese
{% elsif  ${language} == 'ko' %}
Message in Korean
{% elsif  ${language} == 'ru' %}
Message in Russian
{% elsif ${most_recent_locale} == 'pt_BR' %}
Message in Brazilian Portuguese
{% elsif ${most_recent_locale} == 'pt_PT' %}
Message in European Portuguese
{% elsif  ${language} == 'pt' %}
Message in default Portuguese
{% else %}
Message in default language
{% endif %}
```

In this use case, customers with a most recent locale of `pt_BR` get a message in Brazilian Portuguese, and customers with a most recent locale of `pt_PT` get a message in European Portuguese. Customers who don't meet the first two conditions but have their language set to Portuguese get a message in whatever you would like the default Portuguese language type to be.

### Use case: Target users by time zone

You can also target users by their time zone. For example, send one message if they are based in EST and another if they are PST. To do this, save the current time in UTC, and compare an if/else statement with the user's current time to send the right message for the right time zone. You should set the campaign to send in the user's local time zone, to give them the campaign at the right time. 

See the following use case for how to write a message that delivers between 2 pm and 3 pm with a specific message for each time zone.

```liquid
{% assign hour_in_utc = 'now' | date: '%H' | plus:0 %}
{% if hour_in_utc >= 19 && hour_in_utc < 20 %}
It is between 2:00:00 pm and 2:59:59 pm ET!
{% elsif hour_in_utc >= 22 && hour_in_utc < 23 %}
It is between 2:00:00 pm and 2:59:59 pm PT!
{% else %}
{% abort_message %}
{% endif %}
```



## Send messages with a random number


The `{% random %}` tag returns a random number. You can use it for A/B-style logic, sampling, or varying message content.

| Tag | Description |
|-------|--------------|
| `{% random %}` | A float between 0 and 1 (inclusive of 0, exclusive of 1). |
| `{% random 10 %}` (integer argument) | An integer ranging from 0 up to, but not including, the specified integer. For example, `{% random 10 %}` returns an integer from 0 to 9. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Send messages with a random number" }



### Use case: Send users random variants


```liquid
{% capture roll_str %}{% random %}{% endcapture %}
{% assign roll = roll_str | plus: 0 %}
{% if roll < 0.5 %}
Show variant A
{% else %}
Show variant B
{% endif %}
```


## eCommerce shopping cart tag {#shopping-cart-tag}

The `shopping_cart` tag accesses a user's cart contents in eCommerce [abandoned cart](https://www.braze.com/docs/user_guide/messaging/canvas/ideas_and_strategies/ecommerce_use_cases/?tab=abandoned%20cart#abandoned-cart) and [abandoned checkout](https://www.braze.com/docs/user_guide/messaging/canvas/ideas_and_strategies/ecommerce_use_cases/?tab=abandoned%20checkout#abandoned-checkout) eCommerce Canvas use cases. Replace `CART_ID` with the actual cart ID value, such as `{{context.${cart_id}}}`.


```liquid
{% shopping_cart CART_ID :abort_if_not_abandoned false %}
```


The `abort_if_not_abandoned` parameter in this example applies only to the [abandoned checkout](https://www.braze.com/docs/user_guide/messaging/canvas/ideas_and_strategies/ecommerce_use_cases/?tab=abandoned%20checkout#abandoned-checkout) use case when used with the `ecommerce.checkout_started` event. It is not applicable to abandoned cart use cases. For details, see [`abort_if_not_abandoned`](https://www.braze.com/docs/user_guide/messaging/canvas/ideas_and_strategies/ecommerce_use_cases/?tab=abandoned%20checkout#abort-if-not-abandoned).

[31]:https://docs.shopify.com/themes/liquid/tags/variable-tags
[32]:https://docs.shopify.com/themes/liquid/tags/iteration-tags
