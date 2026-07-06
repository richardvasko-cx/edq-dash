# Email subscriptions

> Learn about user subscription states, how to create and manage subscription groups, and how to segment users based on their subscriptions.

This document is for informational purposes only. It is not intended to provide, nor may it be relied upon as providing legal advice in any capacity. Sending marketing and transactional emails may be subject to specific legal requirements. To ensure that you are doing so in compliance with all applicable laws, rules, and regulations specific to your company, you should seek the advice of your legal counsel and/or regulatory compliance team.

## Subscription states {#subscription-states}

Braze has three global subscription states for email users. These states gate your messages from users. For example, users in the `unsubscribed` state don't receive messages targeted at `subscribed` or `opted-in`.

| State | Definition |
| ----- | ---------- |
| Opted-in | A user has explicitly confirmed they want to receive email. We recommend an explicit opt-in process to get consent from users to send emails. |
| Subscribed | A user has neither unsubscribed nor explicitly opted-in to receive emails. This is the default subscription state when a user profile is created. |
| Unsubscribed | A user has explicitly unsubscribed from your emails. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Subscription states #subscription-states" }

**Note:**


Braze does not count subscription state changes against your data points, globally, and around subscription groups.



### Unsubscribed email addresses

Braze automatically unsubscribes any user who manually unsubscribes through a [custom footer](https://www.braze.com/docs/user_guide/channels/email/customize/custom_email_footer). If the user updates their email address and **Resubscribe users when they update their email** is enabled in **Sending Configuration**, normal sending resumes.

If a user marks one or more of your emails as spam, Braze sends only transactional emails to that user. Transactional emails refer to the **Send to all users including unsubscribed users** option in **Target Audience**.

**Tip:**


Refer to our [IP warming](https://www.braze.com/docs/user_guide/channels/email/email_setup/ip_warming/) best practices for guidance on how to re-engage your users effectively.



### Bounces and invalid emails



































































































































<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->












 

































































































































<!-- Unique Impressions & Unique Recipients have a dedicated section in campaign_analytics.md -->












 

When an email address hard bounces, Braze doesn't automatically set the user's subscription state to "unsubscribed". If an address hard bounces (invalid or doesn't exist), Braze marks it invalid and doesn't attempt further sends. If the user changes their email address, Braze resumes sending. Braze retries soft bounces for 72 hours.

### Updating email subscription states

There are four ways to update a user's email subscription state:

#### SDK integration

Use the Braze SDK to update a user's subscription state.

#### REST API

Use the [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) to update the [`email_subscribe` attribute](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#migrating-push-tokens) for a user. For example, to set a user's email subscription state to unsubscribed when they use a custom unsubscribe link, include `email_subscribe: "unsubscribed"` in the user attributes in your request.

#### User profile

1. Find the user through **Search Users**. 
2. Under **Engagement**, select **Unsubscribed**, **Subscribed**, or **Opted In** to change the user's subscription status. 

If available, the user profile also displays a timestamp for when the user's subscription was last changed.

#### Preference center

Include [Preference center](#email-preference-center) Liquid at the bottom of your emails to let users opt in or out. Braze manages subscription state updates from the preference center.

### Checking email subscription state

![User profile for John Doe with their email subscription state set to Subscribed.](https://www.braze.com/docs/assets/img/push_example.png?35176b34da21057d058dc0b0f0e3d9f7){: style="float:right;max-width:35%;margin-left:15px;"}

Use any of the following methods to check a user's email subscription state:

1. **REST API export:** Use the [Export users by segment](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_segment/) or [Export users by identifier](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_identifier/) endpoints to export individual user profiles in JSON format.
2. **User profile:** Find the user's profile on the [Search Users](https://www.braze.com/docs/user_guide/audience/manage_audience/user_profiles/) page, then select the **Engagement** tab to view and manually update a user's subscription state.

When a user updates their email address, their subscription state is set to subscribed. If the updated email address already exists elsewhere in a Braze workspace, the user inherits the subscription state from that existing user unless **Resubscribe users when they update their email setting** is turned on in **Sending Configuration**.

To troubleshoot subscription state changes, review **Email Subscription-State Changes** in the user profile logs for the history and source (API or SDK).

## Subscription groups

Subscription groups are segment filters that can further narrow your audience from the [global subscription states](#subscription-states). These groups allow you to present more granular subscription options to end-users.















For example, suppose you send out multiple categories of email campaigns (promotional, newsletter, or product updates). In that case, you can use subscription groups to let your customers pick and choose which email categories they want to subscribe or unsubscribe from in bulk from a single page, using an [email preference center](#email-preference-center). Alternatively, you could use subscription groups to let your customers choose how frequently they want to receive emails from you, by creating subscription groups for daily, weekly, or monthly emails.

Use the [Subscription Group endpoints](https://www.braze.com/docs/api/endpoints/subscription_groups) to programmatically manage the subscription groups that you have stored on the Braze dashboard to the **Subscription Group** page.

### Creating a subscription group

1. Go to **Audience** > **Subscription Group Management**.
2. Select **Create email subscription group**. 
3. Give your subscription group a name and description.
4. Select **Save**. 

All subscription groups are automatically added to your preference center.

![Fields to create a subscription group.](https://www.braze.com/docs/assets/img/sub_group_create.png?1bf9e64bfede1cc2bb810fc759eb40c4){: style="max-width:75%"}

### Segmenting with a subscription group

When creating your segments, set the subscription group name as a filter. This will confirm that users who have opted into your group will receive your emails. This is great for monthly newsletters, coupons, membership tiers, and more.

![Example of targeting users in the "Lapsed Users" segment with the filter for users in the "Weekly Emails" subscription group.](https://www.braze.com/docs/assets/img/segment_sub_group.png?a4bae7bfdebf7b4bddccaeb652209578){: style="max-width:90%"}

### Archiving subscription groups

Archived subscription groups cannot be edited and will no longer appear in segment filters or in your preference center. If you attempt to archive a group that is being used as a segment filter in any email, campaign, or Canvas, you will receive an error message that will prevent you from archiving the group until you remove all usages of it.

To archive your group from the **Subscription Groups** page, do the following:

1. Find your group in the list of subscription groups. 
2. Select **Archive** from the <i class="fa-solid fa-ellipsis-vertical"></i>&nbsp;dropdown menu.

Braze doesn't process state changes for users in archived groups. For example, if you archive Subscription Group 1 while Alex is subscribed to it, Alex remains "subscribed" even if they click an unsubscribe link. This doesn't matter because Subscription Group 1 is archived and you can't send messages using it.

#### Viewing subscription group sizes

You can reference the **Subscription Group Timeseries** graph in the **Subscription Groups** page to view the subscription group size based on the number of users over a period of time. These subscription group sizes are also consistent with other areas of Braze, such as segment size calculation.

![An example "Subscription Group Timeseries" graph dated from December 2nd through 11th. The graph shows a ~10 million increase in the number of users from the 6th to the 7th.](https://www.braze.com/docs/assets/img_archive/subscription_group_graph.png?59d31622d0b949b83f4757842ffd9b45)

If the timeseries count diverges sharply from a segment using **Email Subscription Status is Unsubscribed**, remember the graph counts membership in that **subscription group**, while that filter reflects **global** email subscription state—for example, users can be globally subscribed but unsubscribed from a specific group.

#### Viewing subscription groups in campaign analytics

You can see counts of users who changed their subscription state (subscribed or unsubscribed) from a specific email campaign on that campaign's analytics page.

1. From the **Campaign Analytics** page for your campaign, scroll down to the **Email Message Performance** section.
2. Select the arrow under **Subscription Groups** to see the aggregate count of state changes, as submitted by your customers.

![The "Email Message Performance" page displaying the aggregate count of state changes submitted by customers.](https://www.braze.com/docs/assets/img/campaign_analytics_sub_groups.png?e54cfc4c886d5945047c4a98f109b206)

### Checking a user's email subscription group

- **User profile:** Individual user profiles can be accessed through the Braze dashboard from the [Search Users](https://www.braze.com/docs/user_guide/audience/manage_audience/user_profiles#access-profiles) page. Here, you can look up user profiles by email address, phone number, or external user ID. You can also view a user's email subscription groups in the **Engagement** tab.
- **Braze REST API:** Use the [List user’s subscription groups endpoint](https://www.braze.com/docs/api/endpoints/subscription_groups/get_list_user_subscription_groups/) or [List user’s subscription group status endpoint](https://www.braze.com/docs/api/endpoints/subscription_groups/get_list_user_subscription_group_status/) to view individual user profile's subscription groups. 

## Email preference center

The email preference center lets you manage which users receive subscription group newsletters. Find it in the dashboard under **Subscription Groups**. Each subscription group you create is added to the preference center list. 

To learn more about how to add or customize a preference center, refer to [Preference center](https://www.braze.com/docs/user_guide/channels/email/subscriptions/).

## Changing email subscriptions {#changing-email-subscriptions}

In most cases, users manage their email subscription through links included in the emails they receive. Insert a legally compliant footer with an unsubscribe link at the bottom of every email. When users select the unsubscribe URL, Braze unsubscribes them and shows a landing page confirming the change. Include this Liquid tag: `${set_user_to_unsubscribed_url}`.

When a user selects "Unsubscribe from all of the above types of emails" in the preference center, Braze sets their global email subscription status to `unsubscribed` and unsubscribes them from all groups.

### Creating custom footers {#custom-footer}

If you don't want to use the default footer, create a workspace-wide custom email footer and template it into every email using `{{${email_footer}}}`.

This lets you avoid creating a new footer for every email template or email campaign. For steps, see [Custom email footer](https://www.braze.com/docs/user_guide/channels/email/customize/custom_email_footer/).

#### Managing subscription states for Chinese IP addresses

If you anticipate Chinese IP addresses, don't rely solely on an unsubscribe link to maintain `unsubscribed` lists. Provide alternate unsubscribe paths such as a support ticket or customer representative email. 

### Creating a custom unsubscribe page

When users select an unsubscribe URL in an email, they open a default landing page that confirms the subscription change.

To use a custom landing page instead:

1. Go to **Email Preferences** > **Subscription Pages and Footers**.
2. Add the HTML for your custom page.

Include a resubscribe link (for example `{{${set_user_to_subscribed_url}}}`) so users can undo an accidental unsubscribe.

You can also send users to your site and update status with the Braze REST API (for example link with `?user_id={{${user_id}}}` and then call [`/email/status`](https://www.braze.com/docs/api/endpoints/email/post_email_subscription_status/).

**Note:**


If you use the dashboard footer instead of only an HTML content block, the template must still contain `{{${set_user_to_unsubscribed_url}}}` to save. To use a different unsubscribe URL temporarily, you can comment out the default tag. An example is: `<!-- {{${set_user_to_unsubscribed_url}}} -->`.



![Custom unsubscribe page with a preview "Sorry to see you go!".](https://www.braze.com/docs/assets/img/custom_unsubscribe.png?f01f1d9097aca39bbfc571b2976a3f4d)

### Creating a custom opt-in page

Use a custom opt-in page to let users acknowledge and control notification preferences before subscription. This additional communication can help email campaigns stay out of spam folders.

1. Go to **Settings** > **Email Preferences**.
2. Select **Subscription Pages and Footers**.
3. Customize the styling in the **Custom opt-in page** section to see how that indicates to your users that they've been subscribed.

Users reach this page through the `{{${set_user_to_opted_in_url}}}` tag.

**Tip:**


Use a double opt-in process to improve outreach. Braze sends an additional confirmation email where a user confirms notification preferences via a link. After confirmation, the user is opted in.



![Custom opt-in email with a message "Glad to see you still want to hear from us".](https://www.braze.com/docs/assets/img/custom_optin.png?86d25218e9ae12ff521cd42b94c12d0e)

## Subscriptions and campaign targeting {#subscriptions-and-campaign-targeting}

By default, Braze targets campaigns with push or email messages at users who are subscribed or opted in. Change this in **Target Audience** by selecting the dropdown next to **Send to these users:**.

Braze supports three targeting states:

- Users who are subscribed or opted-in (default).
- Only users who are opted-in.
- All users, including those who have unsubscribed.

**Important:**


It's your responsibility to comply with any applicable [spam laws](https://www.braze.com/docs/help/best_practices/spam_regulations/#spam-regulations) when using these targeting settings.



## Segmenting by user subscriptions {#segmenting-by-user-subscriptions}

Use the "Email Subscription Status" and "Push Subscription Status" filters to segment users by subscription status.

Use this to target users who have neither opted in nor out and encourage an explicit opt in. Create a segment with the filter "Email/Push Subscription Status is Subscribed" and send campaigns to users who are subscribed but not opted in.

![Email Subscription Status used as a segment filter.](https://www.braze.com/docs/assets/img_archive/not_optin.png?c7d31fdae851bad464d6d7c1c6390c8f)

