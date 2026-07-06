# Message extras Liquid tag

> Use the `message_extras` Liquid tag to annotate your send events with dynamic data from Connected Content, Catalogs, custom attributes (such as language, country), Canvas entry properties, or other data sources.

The `message_extras` Liquid tag appends key-value pairs to the corresponding send event in Currents and Snowflake Data Sharing. 

To send dynamic or extra data back to your Currents or Snowflake Data Sharing send event, insert the proper Liquid tag into your message body. 

Here's an example of the standard Liquid tag format for `message_extras`:


```liquid
{% message_extras :key test :value 123 %}
```


You can add these tags as needed for your key-value pairs in the message body. However, the length of all keys and values should not exceed 1,000 bytes (1&nbsp;KB). In Currents and Snowflake Data Sharing, you can see a new event field called `message_extras` for your send events. This generates a JSON-serialized string in one field.

## How message extras data is sent using Currents

**Message extras** are key-value pairs attached at send time. Configuration depends on the channel. For email, they are added using headers. For iOS push, they are included in the push payload. All supported send events surface the same `message_extras` field in Currents (and Snowflake) once the message is sent.

## Supported channels

The `message_extras` tag is supported for all message types with a send event, along with in-app message impression events. Using `message_extras` with in-app messages requires certain [minimum SDK versions](#iam-sdk) to be met.

## How to use the `message_extras` tag

1. In the message body for the channel, enter the `message_extras` Liquid tag. Or, you can use the **Add Personalization** modal and select **Message Extras** for the personalization type. 

![The Add Personalization modal with Message Extras selected as the personalization type.](https://www.braze.com/docs/assets/img_archive/message_extras1.png?69c737d3137bb3531879416fae77dfcb){: style="max-width:35%;"}

{: start="2"}

2. Enter the [key-value pair](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/sources/key_value_pairs/) for each `message_extras` tag. 

![An example of key-value pairs for the message extras tag. The title field reads "Your New Favorites." The message reads key-value pairs for the message extras tag and the following sentence: "We're excited to bring you a side selection of fresh and exciting products that are sure to become your new go-to favorites"](https://www.braze.com/docs/assets/img_archive/message_extras2.png?8f7929f2c74c926338c2a3d48de53d62){: style="max-width:70%;"}

{: start="3"}

3. After your campaign or Canvas has been sent, Braze will attach the dynamic data at the send time via the Currents or Snowflake Data Sharing send events to the `message_extras` field.

## Checking syntax

Any other input that doesn't match the tag standard discussed above may fail to pass to Currents or Snowflake. Check that your syntax or formatting doesn't include any of the following:

- Non-existent, empty, or mistyped delimiters
- Duplicate keys (Braze will default to sending the key-value pair that is encountered first)
- Extra text before keys or values are defined
- Out of order keys and values 
  - For example, ```{% message_extras :value 123 :key test %}```

## Sending promotion code information to Currents







## Considerations

- Key-values that exceed 1,000 bytes (1&nbsp;KB) are truncated.
- Whitespace counts toward the character count. Note that Braze omits the leading and trailing whitespaces.
- The resulting JSON outputs string values only.
- You can include Liquid variables as a key or value, but you cannot nest additional Liquid tags inside `message_extras`.
  - For example, you could use the following Liquid: ```{% assign value = '123' %} {% assign key = 'test' %} {% message_extras :key {{key}} :value {{value}} %}```

## Frequently asked questions

#### How can I associate the message_extras field in the send events to my engagement events like opens and clicks? 

A `dispatch_id` is generated and provided in your send events, which you can use as a unique identifier to tie to specific click, open, or delivered events. Query this field in Currents or Snowflake. For more information, see [Dispatch ID behavior](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/dispatch_id/).

#### Can I use message_extras with in-app messages? {#iam-sdk}

Yes, you can use `message_extras` in your in-app messages as long as your users' devices are on the following minimum SDK versions:

<div id='sdk-versions'><a href='/docs/developer_guide/platforms/swift/changelog/#840' class='sdk-versions--chip ios-sdk' target='_blank'><i class='fa-brands fa-apple'></i> &nbsp; Swift: 8.4.0+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a><a href='/docs/developer_guide/platforms/web/changelog/#520' class='sdk-versions--chip web-sdk' target='_blank'><i class='fa-solid fa-desktop'></i> &nbsp; Web: 5.2.0+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a><a href='/docs/developer_guide/platforms/android/changelog/#3040' class='sdk-versions--chip android-sdk' target='_blank'><i class='fa-brands fa-android'></i> &nbsp; Android: 30.4.0+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a></div>

