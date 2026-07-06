# Email open pixel and click tracking

> [Open pixel tracking](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/email_preferences/#changing-location-of-tracking-pixel) and click tracking can be turned on or off for each user profile. This flexibility helps you follow regional privacy laws, where an individual user profile might indicate they no longer want to be tracked.

## Turning on open pixel or click tracking

When either importing or updating a user profile through [API](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#braze-user-profile-fields), [CSV](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users#csv), or [Cloud Data Ingestion (CDI)](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/), two fields are available for you to modify:

- `email_open_tracking_disabled`: Accepts `true` or `false`. Set to `false` to add the open tracking pixel to all future emails sent to this user. Available for SparkPost and SendGrid only.
- `email_click_tracking_disabled`: Accepts `true` or `false`. Set to `false` to add click tracking to all links within a future email, sent to this user. Available for SparkPost and SendGrid only.

For reference, this information is reflected on the user profile in the email **Contact Settings**, located in the **Engagement** tab.

![Email open and click tracking pixel fields on the Engagement tab of a user's profile](https://www.braze.com/docs/assets/img_archive/open_click_user_profile.png?8975b17e1959a932c08c5cb224285505){: style="max-width:60%;"}

