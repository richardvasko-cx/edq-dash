# User phone numbers

> This article will discuss different topics around your users' or customers' phone numbers. If you're looking for information about your own numbers, go to our article on [sending phone numbers](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_setup/sender_setup/).

## Recommended format

We recommend importing phone numbers in [`E.164`](https://en.wikipedia.org/wiki/e.164) format to ensure accuracy in the event that you are sending to multiple regions with different country or area codes&#8212;even for U.S.-based phone numbers.

- **U.S. numbers:** All U.S. numbers must be valid, 10-digit phone numbers with a valid area code. If any 10-digit phone number is missing a `+` and country code, Braze will map it as U.S. numbers.
- **International numbers:** All international numbers should start with a `+`, followed by their country code and then the phone number. For example, `+442071838750`.

![Example of a valid e164 international phone number.](https://www.braze.com/docs/assets/img/sms/e164.png?76830497cb02adfbc8c4b8f89ac642ad){: style="max-width:50%;border: 0;"}

Here's a few examples showing the differences between local and `E.164` formatting:

| Country | Local | Country Code | `E.164` |
|---|---|---|---|
| USA | `4155552671` | 1 | `+14155552671` |
| UK | `2071838750` | 44 | `+442071838750` |
| Brazil | `1155256325` | 55 | `+551155256325` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="Recommended format" }

## Import phone numbers

When importing phone numbers, it's important that you follow the [recommended format](#recommended-format). To import phone numbers, use one of the following methods:

- [Uploading a CSV to Braze](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users#csv)
- [Using the `/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track)

**Important:**


User phone numbers appear in Braze as a string of digits. If you import a number that contains non-digits (such as `,`, `-`, or `(`) other than the leading `+`, the non-digits are removed when rendered in Braze. For example, importing `+1 (724) 123-4567` appears as `+17241234567`.



## Phone number validation

Braze uses Google's [libphonenumber](https://github.com/google/libphonenumber) library to validate phone numbers. When new mobile number prefixes are introduced, support is added as the upstream library is updated. Braze does not maintain a separate list of valid prefixes.

### Handling invalid phone numbers

When a phone number is deemed invalid, Braze will mark the user's phone number as invalid and will not attempt to send further communications to that phone number. An invalid phone number is marked in the **Engagement Tab** of a user profile.

![Example error message for invalid phone numbers in Braze.](https://www.braze.com/docs/assets/img/sms/invalid_banner.png?acd136e17bd69df65880b93bb7d0dd74){: style="max-width:50%;border: 0;"}

A phone number is considered invalid for the following reasons:

- **Provider Error**: a permanent error was received from the SMS and RCS provider. This indicates that the phone number supplied is incorrectly formatted or permanently unable to receive SMS or RCS messages.
- **Deactivated**: the phone number has been deactivated due to a mobile subscriber terminating their service and releasing their number from their carrier (and may eventually be recycled and assigned to a new user). A deactivated phone number can be marked invalid even if you have not sent any SMS or RCS messages to that phone number.

These invalid phone numbers can be managed using [SMS and RCS endpoints](https://www.braze.com/docs/api/endpoints/sms/). 

**Note:**


If multiple user profiles have the same phone number and that phone number is marked invalid, then all existing User Profiles with that number will display as invalid. Newly created user profiles will never initially be marked as invalid.



You can also include or exclude any users with invalid phone numbers when [creating a segment](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/#step-4-add-filters-to-your-segment).

## Exclude rejected SMS sends from segmentation

**Important:**


SMS rejections are charged toward your SMS allotment.



To exclude users with rejected SMS sends from your segments, use [SQL Segment Extensions](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/sql_segments/), do the following:

1. Go to **Audience** > **Segment Extensions**.
2. Select **Create New Extension** > **Full refresh** or **Incremental refresh**.
3. Write a SQL query that identifies users with SMS rejections. For example, you can query the `USERS_MESSAGES_SMS_REJECTION_SHARED` event to find users who have received SMS rejections.
4. Save your Segment Extension.
5. When creating your SMS segment, add a filter to exclude users in this Segment Extension.

## Add users to SMS and RCS subscription groups

For a user to receive an SMS or RCS message, they must have a valid phone number and be opted-in to a subscription group. Subscription groups are tied to the SMS or RCS program you are running (make sure you follow the [legal requirements for SMS, MMS, and RCS](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/compliance_and_delivery/laws_and_regulations/) and have recorded consent for each customer). For more information, refer to [SMS and RCS subscription groups](https://www.braze.com/docs/sms_rcs_subscription_groups/).

## Third-party sourcing and verification

Braze relies on third-party tools to source invalid numbers. Braze is not responsible for any outages or misinformation of these services. Thus, this tool should not be relied upon as your sole method of compliance for verifying invalid numbers.

## Phone number capture

To capture phone numbers through in-app messages, refer to [Phone number capture](https://www.braze.com/docs/phone_number_capture/).
