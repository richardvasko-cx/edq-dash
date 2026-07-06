# Merge duplicate users

> Learn how to find and merge duplicate users, so you can maximize the effectiveness of your campaigns and Canvases.

## REST API: Identify and merge users

The tools on this page merge duplicate profiles in the dashboard. You can also combine or re-point profiles through Braze's [User Data endpoints](https://www.braze.com/docs/api/endpoints/user_data/):

- [POST: Identify users](https://www.braze.com/docs/api/endpoints/user_data/post_user_identify/) (`/users/identify`): Combines an alias-only, email-only, or phone number-only profile with a profile that has an `external_id`.
- [POST: Merge users](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/) (`/users/merge`): Merges one user profile into another, including when both profiles already have an `external_id`. Review [Prerequisites](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/#prerequisites) and [Merge behavior](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/#merge-behavior) before you call this endpoint.

When an anonymous profile is matched to an existing identified profile (for example through an SDK `changeUser()` call or `/users/identify`), Braze orphans the anonymous profile and copies only certain fields onto the identified profile. For more information, see [What happens when you identify anonymous users](https://www.braze.com/docs/user_guide/data/unification/user_data/user_profile_lifecycle/#what-happens-when-you-identify-anonymous-users).

User merges are difficult to undo. If you're planning a complex merge across multiple `external_id` values or large profile migrations, contact your Braze customer success manager for guidance before you rely on `/users/merge`.

Braze handles three user types differently when merging: users marked for deletion, test users, and Global Control Group users. For details, see [User merge behavior](https://www.braze.com/docs/user_guide/audience/manage_audience/merge_duplicate_users/merge_behavior/).

## Individual merging

If a user search returns duplicate profiles, you can merge each profile individually from the user's profile in the Braze dashboard.

### Step 1: Search for a duplicate profile

In Braze, select **Audience** > **User Search**.

![The "User Search" tile highlighted in the navigation menu.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/individual_merging/select_search_users.png?b5806402d40991d25bb2178d3f9f9deb){: style="max-width:60%;"}

Enter a unique identifier, such as an email address or phone number, for the duplicate profile, then select **Search**.

![The "User Search" page in the Braze dashboard.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/individual_merging/search_user.png?2201399f878a68ec7d28ddc26c668305){: style="max-width:60%;"}

### Step 2: Merge duplicates

To begin the merge process, select **Merge duplicates**.

![One of the duplicate user's profiles.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/individual_merging/select_merge_duplicates.png?96ba961ae21bdb1a496234b2272158ea){: style="max-width:50%;"}

Choose which user profile to keep and which to merge, then select **Merge profiles**. Repeat this process until you've merged all duplicate profiles.

![The individual merge page for a duplicate profile.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/individual_merging/select_merge_profiles.png?914b50715b37cf5db5e7032395b8b4e1){: style="max-width:80%;"}

**Warning:**


Duplicate user profiles cannot be recovered after merging.



## Bulk merging

When you bulk merge duplicate users, Braze finds profiles with matching identifiers (such as an email address) and keeps one profile. Braze first prioritizes profiles with an `external_id`, then applies your **Resolving ties** settings: **Resolve ties using** and **Prioritization**. If there are no profiles with an `external_id`, Braze uses **Resolve ties using** and **Prioritization** across profiles without an `external_id`. Braze only merges users when these settings identify one profile to keep. For example, if **Resolve ties using** is **Updated date** and both profiles have the same last updated timestamp, Braze can't resolve the tie, so those users aren't merged.

### Step 1: Go to Manage Audience

In the Braze dashboard, select **Audience** > **Manage Audience**.

![The "Manage Audience" tile highlighted in the navigation menu.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/bulk_merging/select_manage_audience.png?ae4ecfffbd3e7ec27aed0c21cc02b1a9){: style="max-width:60%;"}

### Step 2: Preview the results (optional)

To preview your results before merging your duplicates, select **Generate list of duplicates**.

![The "Manage Audience" page with "Generate list of duplicates" highlighted.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/bulk_merging/select_generate_list.png?63527bde979b93206b5aab40ecfb708b)

Braze will generate your preview and send it to your email address as a CSV file.

![An email from Braze with a link to the generated CSV file.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/bulk_merging/example_email.png?d766e7c828a8f77a4f9242ee31c47331){: style="max-width:60%;"}

In the following example, Braze uses the user's external ID to flag duplicate profiles and identify which one to keep. If these profiles are bulk merged, Braze will use the profile with an external ID as the user's new primary profile.



| Email Address    | External ID | Phone Number   | Braze ID              | Identifier for rule | Profile to keep | Profile to merge |
| ---------------- | ----------- | -------------- | --------------------- | ------------------- | --------------- | ---------------- |
| alex@company.com | A8i3mkd99   | (555) 123-4567 | 65fcaa547f470494d1370 | email               | TRUE            | FALSE            |
| alex@company.com |             | (555) 987-6543 | 65fcaa547f47d004d1348 | email               | FALSE           | TRUE             |
| alex@company.com |             | (555) 321-0987 | 65fcaa547f47d0049135c | email               | FALSE           | TRUE             |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Step 2: Preview the results (optional)" }



#### Merge behavior

Braze will fill empty fields on the kept profile with values from the merged profile. For a list of the fields that will be filled, refer to [Merge behavior](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/#merge-behavior).

### Step 3: Merge your duplicates

If you're satisfied with the results of your preview, select **Merge all duplicates**.

**Warning:**


Duplicate user profiles cannot be recovered after merging.



![The "Manage Audience" page with "Merge all duplicates" highlighted.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/bulk_merging/select_merge_profiles.png?e82ea58dc1ecbd5eb45a9731b863f459){: style="max-width:70%;"}

## Rules-based merging

You can use rules to control how duplicate profiles are resolved when running a merge so the most relevant user profile is kept. When rules are set, Braze will keep profiles that match your criteria.

### Step 1: Define your rules

1. Go to **Audience** > **Manage Audience** > **Edit rules**.
2. In the **Profile to keep** section of the **Edit rules** panel, select the **Identifier** for the profiles that will be kept when merging duplicates. This can be the email address or phone number.
3. In the **Resolving ties** section, select the criteria to determine how to solve ties between profiles with matching criteria from **Profile to keep**. You can select the following:<br>
- **Resolve ties using**: Created date, Updated date, Last session
- **Prioritization**: Newest, Oldest

![The "Edit rules" panel with sections to select options for "Profile to keep" and "Resolving ties".](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/edit_rules.png?4f4fdef2a956f75f02893b7f0c91d6fa){: style="max-width:40%;"}

For example, you could keep the profile that has a phone number. If multiple users have the same phone number, you could resolve ties using the **Updated date** field and prioritize the most recently updated user.

### Step 2: Preview the results (optional)

After saving your rules, you can preview how they'll work by selecting **Generate a list of duplicates**. Braze will generate your preview and send it to your email address as a CSV file that shows which users would be kept and merged if your rules were applied. 

### Step 3: Merge duplicates

If you're satisfied with the results of your preview, return to the **Manage Audience** page and select **Merge all duplicates**.

**Warning:**


Duplicate user profiles cannot be recovered after merging.



## Scheduled merging

Similar to rules-based merging, scheduled merging allows you to automate the merging of user profiles on a daily basis using preconfigured rules.

![The "Manage Audience" page with "schedule" button.](https://www.braze.com/docs/assets/img/audience_management/duplicate_users/bulk_merging/select_scheduled_merge_rules.png?343f60c9ca39b7ce4def000efe119e9d)

After the feature is turned on, Braze will automatically assign a timeslot to perform the merge process daily at approximately 12 am in the user's company time zone. You can turn off scheduled merging at any time. Braze will notify the admins of your workspace 24 hours before the scheduled merge occurs, providing a reminder and time to review the configuration.

**Warning:**


Duplicate user profiles cannot be recovered after merging.



## Related articles

- [User merge behavior](https://www.braze.com/docs/user_guide/audience/manage_audience/merge_duplicate_users/merge_behavior/)
- [POST: Merge users](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/)
- [Delete users](https://www.braze.com/docs/user_guide/audience/manage_audience/user_profiles/delete_users/)
