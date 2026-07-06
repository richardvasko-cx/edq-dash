# Standard attributes

> Standard attributes are predefined fields that Braze recognizes on every user profile. Use this page as a quick reference for the field name, data type, and expected format of each standard attribute.

Standard attributes (sometimes called *default attributes* or *reserved keys*) are different from [custom attributes](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes/), which are unique to your business. When you send data to Braze with one of the field names listed on this page, Braze stores it on the predefined profile field instead of creating a new custom attribute.

You can set standard attributes through any of these methods:

- The [Braze SDK](https://www.braze.com/docs/developer_guide/analytics/setting_user_attributes/)
- The [User attributes object](https://www.braze.com/docs/api/objects_filters/user_attributes_object/) on the [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/)
- [CSV import](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/)
- [Cloud Data Ingestion](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/)

**Important:**


Standard attribute names are case sensitive. Always use lowercase (for example, `first_name`, not `First_Name`). If the spelling or capitalization doesn't match exactly, Braze stores the value as a [custom attribute](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes/) instead.



## Identifiers

Identifiers tell Braze which user profile to update or create. Every API request and CSV row must include at least one identifier. For details on choosing the right one, see [Identifier resolution](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#identifier-resolution).

| Field | Data type | Format and notes |
|---|---|---|
| `external_id` | String | A unique user identifier you assign. After it's set on a profile, Braze uses it to recognize the user across devices. Cannot be removed after it's added. |
| `braze_id` | String | A Braze-assigned identifier created when the SDK first sees a device. Read-only. Cannot be edited. |
| `user_alias` | Object | An object with `alias_name` (string) and `alias_label` (string), used to identify users without an `external_id`. Mutually exclusive with `external_id` in the same request. |
| `email` | String | Can be used as an identifier when `external_id` and `user_alias` are absent. Takes precedence over `phone` if both are sent. |
| `phone` | String | Can be used as an identifier when `external_id`, `user_alias`, and `email` are absent. Use [E.164](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_setup/user_phone_numbers/#recommended-format) format (for example, `+14155552671`). |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }

## Profile fields

These fields capture demographic, contact, and locale data about your users.

| Field | Data type | Format and notes |
|---|---|---|
| `first_name` | String | The user's first name (for example, `Jane`). |
| `last_name` | String | The user's last name (for example, `Doe`). |
| `email` | String | The user's email address (for example, `jane.doe@braze.com`). |
| `phone` | String | The user's phone number. Use [E.164](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_setup/user_phone_numbers/#recommended-format) format (for example, `+14155552671`). |
| `dob` | String | Date of birth in `YYYY-MM-DD` format (for example, `1988-02-14`). Enables targeting on birthdays. |
| `gender` | String | One of `M`, `F`, `O` (other), `N` (not applicable), `P` (prefer not to say), or `null` (unknown). |
| `country` | String | A country code in [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1) format (for example, `US`, `GB`). Setting `country` through CSV import or API prevents the SDK from automatically capturing it. |
| `home_city` | String | The user's home city (for example, `London`). |
| `language` | String | A language code in [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format (for example, `en`). Refer to the [list of accepted languages](https://www.braze.com/docs/user_guide/data/unification/user_data/language_codes/). Setting `language` through CSV import or API prevents the SDK from automatically capturing it. |
| `time_zone` | String | A time zone name from the [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) (for example, `America/New_York` or `Eastern Time (US & Canada)`). |
| `current_location` | Object | An object containing `longitude` and `latitude` (for example, `{"longitude": -73.991443, "latitude": 40.753824}`). |
| `image_url` | String | A URL to the user's profile image. Up to 1,024 characters. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }

## Subscription and consent

These fields manage how a user receives messages across channels. Updating them does not count toward your data point usage.

| Field | Data type | Format and notes |
|---|---|---|
| `email_subscribe` | String | One of `opted_in` (explicitly registered to receive email), `unsubscribed` (explicitly opted out of email), or `subscribed` (neither opted in nor out). |
| `push_subscribe` | String | One of `opted_in`, `unsubscribed`, or `subscribed`. Same definitions as `email_subscribe`. |
| `subscription_groups` | Array of objects | An array where each object has a `subscription_group_id` (string) and a `subscription_state` (`subscribed` or `unsubscribed`). For example: `[{"subscription_group_id": "abc-123", "subscription_state": "subscribed"}]`. |
| `email_open_tracking_disabled` | Boolean | `true` or `false`. Set to `true` to disable the email open tracking pixel for this user. Available for SparkPost and SendGrid only. |
| `email_click_tracking_disabled` | Boolean | `true` or `false`. Set to `true` to disable email click tracking for this user. Available for SparkPost and SendGrid only. |
| `marked_email_as_spam_at` | String | Timestamp at which the user's email was marked as spam. Use [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }

For details on subscription group setup, see [Subscription groups](https://www.braze.com/docs/user_guide/channels/email/subscriptions/#subscription-groups).

## Sessions and engagement

These fields capture when the user first or last engaged with your app. The SDK records them automatically; you typically set them only through API or CSV when migrating from another platform.

| Field | Data type | Format and notes |
|---|---|---|
| `date_of_first_session` | String | The date the user first used the app. Use [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format or one of: `yyyy-MM-ddTHH:mm:ss:SSSZ`, `yyyy-MM-ddTHH:mm:ss`, `yyyy-MM-dd HH:mm:ss`, `yyyy-MM-dd`, `MM/dd/yyyy`, or `ddd MM dd HH:mm:ss.TZD YYYY`. |
| `date_of_last_session` | String | The date the user last used the app. Same accepted formats as `date_of_first_session`. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }

## Push tokens

Use these fields when migrating push tokens from another platform. After you integrate the Braze SDK, push tokens are captured automatically. For migration guidance, see [Migrating push tokens](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#migrating-push-tokens).

| Field | Data type | Format and notes |
|---|---|---|
| `push_tokens` | Array of objects | An array where each object has an `app_id` (string) and a `token` (string). Optionally include a `device_id` (string). For example: `[{"app_id": "YOUR_APP_ID", "token": "abcd", "device_id": "optional_device_id"}]`. |
| `push_token_import` | Boolean | Top-level flag (not nested in `attributes`). Set to `true` to import legacy push tokens for anonymous users without an `external_id`. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }

## Social profile

These fields store data from social network integrations.

| Field | Data type | Format and notes |
|---|---|---|
| `facebook` | Object | An object containing any of `id` (string), `likes` (array of strings), or `num_friends` (integer). |
| `twitter` | Object | An object containing any of `id` (integer), `screen_name` (string, X handle), `followers_count` (integer), `friends_count` (integer), or `statuses_count` (integer). |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }

## API example

The following request sets standard attributes on two users through the [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/).

```http
POST https://YOUR_REST_API_URL/users/track
Content-Type: application/json
Authorization: Bearer YOUR-REST-API-KEY
{
  "attributes": [
    {
      "external_id": "user1",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane.doe@example.com",
      "country": "US",
      "language": "en",
      "time_zone": "America/New_York",
      "dob": "1988-02-14",
      "email_subscribe": "opted_in"
    },
    {
      "external_id": "user2",
      "first_name": "Alex",
      "phone": "+14155552671",
      "current_location": {
        "longitude": -73.991443,
        "latitude": 40.753824
      },
      "subscription_groups": [
        {
          "subscription_group_id": "abc-123",
          "subscription_state": "subscribed"
        }
      ]
    }
  ]
}
```

For the full API contract, see the [User attributes object](https://www.braze.com/docs/api/objects_filters/user_attributes_object/).

## CSV example

The following CSV updates standard attributes for two users. Column headers must exactly match the field names in this article. Headers that don't match (for example, `First_name` instead of `first_name`) are imported as custom attributes.

```plaintext
external_id,first_name,last_name,email,country,language,dob,email_subscribe
user1,Jane,Doe,jane.doe@example.com,US,en,1988-02-14,opted_in
user2,Alex,Smith,alex.smith@example.com,GB,en,1992-09-30,subscribed
```

You can't set some standard attributes through CSV import. You must send arrays, push tokens, and nested objects through the API or [Cloud Data Ingestion](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/) instead. For the complete list of CSV-supported fields and import steps, see [Default attributes](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/#default-attributes).

## Considerations

Consider these points when working with standard attributes:

- **Field names are case sensitive.** Always use lowercase. A header or key that doesn't exactly match a standard attribute name is treated as a custom attribute.
- **SDK auto-capture is suppressed when you set values through API or CSV.** When you set `country` or `language` through API or CSV, Braze stops auto-capturing those fields from the SDK for that user.
- **`null` removes a value.** Set a standard attribute to `null` to remove it from the profile. Some fields, including `external_id` and `user_alias`, can't be removed after they're set.
- **Blank CSV values don't overwrite.** A blank cell in a CSV import keeps the existing value on the profile. To clear a value, use the API.
- **Time zones default to UTC.** Date strings without an offset are interpreted as midnight UTC and displayed in your workspace's time zone. To specify a time zone, append a UTC offset (for example, `2024-11-10T18:00:00-05:00`).

## Related pages

- [User attributes object](https://www.braze.com/docs/api/objects_filters/user_attributes_object/) — Full API contract for the attributes object.
- [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) — REST endpoint for creating and updating user profiles.
- [Set user attributes](https://www.braze.com/docs/developer_guide/analytics/setting_user_attributes/) — SDK methods for setting standard and custom attributes.
- [CSV import](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/) — Upload standard attributes through a CSV file.
- [Custom attributes](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes/) — Define attributes unique to your business.
- [Data types](https://www.braze.com/docs/user_guide/data/activation/custom_data/data_types/) — Reference for supported data types.
