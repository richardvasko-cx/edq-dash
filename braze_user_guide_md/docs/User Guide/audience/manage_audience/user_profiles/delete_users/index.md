# Delete users

> Learn how to delete an individual user or a segment of users directly through the Braze dashboard.

**Important:**


Deleting users is currently in early access. Contact your customer success manager if you're interested in participating.



## Prerequisites

To delete users, you must be an admin or have the **Delete Users** permission. To view user deletion records, you must be an admin or have the **View User Deletion Records** permission. The following permissions control user deletion and deletion records:

| Permission | Description |
|------------|-------------|
| Delete Users | Permanently delete users individually or in bulk. |
| View User Deletion Records | View user deletion records. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites" }

## About user deletion

User deletion lets you manage your database by removing profiles that are no longer needed, created in error, or required to be deleted for compliance (such as GDPR or CCPA).

| Consideration | Details |
|---------------|---------|
| Maximum size | You can delete up to 100 million user profiles when deleting a segment. |
| Waiting period | All segment deletions require a 7-day waiting period plus the time it takes to process deletions. |
| Job limits | Only one segment can be deleted at a single time, which includes the 7-day waiting period. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="About user deletion" }

## Deleting users

You can delete an [individual user](#delete-individual) or a [segment of users](#delete-segment) through the Braze dashboard:

### Deleting an individual {#delete-individual}

To delete an individual user from Braze, go to **Audience** > **Search Users**, then search for and select a user. If you're deleting a duplicate user profile, verify that you've selected the right one.

![The 'Search Users' page in Braze.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/individual_merging/search_user.png?2201399f878a68ec7d28ddc26c668305){: style="max-width:75%;"}

**Warning:**


Single-user deletions are permanent—profiles cannot be recovered after they're deleted.  



On their profile page, select <i class="fa-solid fa-ellipsis-vertical"></i> **Show options** > **Delete User**. Keep in mind, it may take a few minutes for the user to be fully deleted in Braze.

![A user in Braze with the vertical-ellipses menu open, showing the option to delete the user.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/delete_user.png?75155b9cfc5ce043b4b19df1c23bffd6){: style="max-width:85%;"}

### Deleting a segment {#delete-segment}

If you haven't already, [create a segment](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/) containing the user profiles you want to delete. Be sure to include all user profiles if you're deleting duplicate users.

In Braze, go to **Audience** > **Manage Audience**, then select the **Delete Users** tab.

![The 'Delete Users' tab in the 'Manage Audience' section of the Braze dashboard.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/delete_users_tab.png?fb3ac4e516ffa107771db4e13bcf253f){: style="max-width:85%;"}

Select **Delete users**, choose the segment you want to delete, then select **Next**.

![A pop-up window with a segment chosen for deletion.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/choose_segment_to_delete.png?e84d7dd8cc8903dad867ae5e0d7bcd9d){: style="max-width:75%;"}

Type **DELETE** to confirm your request, then select **Delete users**.

![The confirmation page with 'DELETE' typed in the confirmation box.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/confirm_segment_delete.png?818e21c6a5016ba0a8ec8faf712380cc){: style="max-width:75%;"}

The users in this segment won't be deleted immediately. Instead, they'll be marked as pending deletion for the next 7 days. After this time, they'll be deleted and we'll email you to let you know.

**Tip:**


To ensure that these exact users are deleted regardless of segment changes, a segment filter called **Pending Deletion** is automatically created. You can [use this filter](https://www.braze.com/docs/user_guide/audience/segments/managing_segments/#filters) to check the status of pending deletions.



## Confirming segment deletions

Braze sends a confirmation email with the number of profiles pending deletion.

To continue with the deletion, log in to Braze and confirm the deletion request.

If you don't confirm within the time frame shown in the email, the deletion request expires and doesn't proceed.

## Canceling segment deletions {#cancel}

You have 7 days to cancel pending segment deletions. To cancel, go to **Audience** > **Manage Audience**, then select the **Delete Users** tab.

![The 'Delete Users' tab in the 'Manage Audience' section of the Braze dashboard.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/delete_users_tab.png?fb3ac4e516ffa107771db4e13bcf253f){: style="max-width:85%;"}

Next to a pending segment deletion, select <i class="fa-solid fa-eye"></i> to open the deletion record details.

![A pending segment deletion on the 'Delete Users' tab.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/pending_deletion.png?fb0f83c2d2807beac69f200df95fe76c)

In the deletion record details, select **Cancel deletion**.

![The 'Deletion Record Details' window on the 'Delete Users' tab.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/deletion_record_details.png?e1f9e238908e759814af231db44c9e25){: style="max-width:55%;"}

**Tip:**


When bulk user deletion is in progress, you can cancel it at any time. However, any users already deleted before the cancellation cannot be restored.



## Checking deletion status {#status}

You can check the status of a deletion using [segment filters](#segment-filters), the [manage audience](#manage-audience) page, or [security event reports](#security-event-report).

### Segment filters

When you request a segment of users to be deleted, a [segment filter](https://www.braze.com/docs/user_guide/audience/segments/managing_segments/#filters) called **Pending Deletion** is automatically created. You can use it to:

- See the exact set of users tied to a specific deletion run date.
- Exclude those users from campaigns so they don't receive messages before removal.
- Export the list if you need it for compliance or record-keeping.

### Manage audience

**Note:**


To get the list of exact users who will be deleted, use the [Pending Deletion segment filter](#segment-filters) instead.



Go to **Audience** > **Manage Audience**, then select the **Delete Users** tab.

![The 'Delete Users' tab in the 'Manage Audience' section of the Braze dashboard.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/delete_users_tab.png?fb3ac4e516ffa107771db4e13bcf253f){: style="max-width:85%;"}

On this page, you can find the following general information for all current and pending deletions:

| Field | Description |
|-------|-------------|
| Request Date | The date the request was originally made. Use it with the **Pending Deletion** filter to get the list of profiles pending deletion. |
| Requester | The user who initiated the deletion request. |
| Segment Name | The name of the segment used to select the users pending deletion. |
| Status | Shows whether the deletion request is pending, in progress, or complete. |  
{: .reset-td-br-1 .reset-td-br-2 aria-label="Manage audience" }

For more details about a specific request, select <i class="fa-solid fa-eye"></i> to show the deletion record details. Here you can also [cancel pending segment deletions](#cancel).

![A pending segment deletion on the 'Delete Users' tab.](https://www.braze.com/docs/assets/img/audience_management/deleting_users/pending_deletion.png?fb0f83c2d2807beac69f200df95fe76c)

### Security event report

You can also check the status of previous deletions by downloading a security event report. For more information, see [Security settings](https://www.braze.com/docs/user_guide/administer/global/admin_settings/security_settings/#security-event-report).

## Frequently asked questions {#faq}

### Can I delete segments with more than 100 million users?

No. You cannot delete segments with more than 100 million users. If you need help deleting a segment of this size, contact [Braze Support](https://www.braze.com/docs/user_guide/administer/personal/braze_support/).

### It looks like I am not able to delete 100 million users and am limited to deleting only 10 million. Is this a bug?

No, this is not a bug. Certain customers are limited in the number of users they can delete during the early access (EA) program.

As the EA program progresses, this capacity is designed to increase until all customers can delete up to 100 million users.

If you want to increase this capacity, contact your Braze account manager. Requests are granted at the discretion of the product team.

### Does automated user merging affect user deletion?

If a scheduled merge includes user profiles pending deletion, Braze skips those profiles and does not merge them. To merge these profiles, you must remove them from deletion.

### What happens to data sent to users pending deletion?

Data sent from external systems or SDKs is still accepted, but the users will be deleted as scheduled regardless of activity.

### Do Canvases and Campaigns trigger for users pending deletion?

Yes. However, you can add a segment inclusion filter to exclude all users with the **Pending Deletion** [segment filter](#segment-filters).

### Can I recover deleted user profiles?

Deleting individual users are permanent.

You can [cancel segment deletions](#cancel) within the first 7 days after. However, any users already deleted before cancelling cannot be restored.

### Can I delete users with the API instead of the dashboard?

Yes. For smaller batches, you can use the [`/users/delete` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_delete/), which accepts up to 50 identifiers per request and is subject to that endpoint's [rate limit](https://www.braze.com/docs/api/endpoints/user_data/post_user_delete/#rate-limit). Segment-based dashboard deletion is better suited to very large audiences but includes the [7-day waiting period](#about-user-deletion).
