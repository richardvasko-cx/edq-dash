# User merge behavior

> Learn how Braze handles user merging, including the three user types where the default behavior doesn't apply: users marked for deletion, test users, and Global Control Group users.

This behavior applies to all merges, whether you're using [individual merging](https://www.braze.com/docs/user_guide/audience/manage_audience/merge_duplicate_users/#individual-merging), [bulk merging](https://www.braze.com/docs/user_guide/audience/manage_audience/merge_duplicate_users/#bulk-merging), or the [Merge users API endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/).

## General merge behavior

When you merge two user profiles, Braze fills empty fields on the profile to keep with values from the profile to merge. If a field has a value on both profiles, Braze preserves the value on the profile to keep.

For example, if a value only exists on one profile or the other, Braze keeps it:

| Field | Profile to merge | Profile to keep | Resulting profile |
|---|---|---|---|
| `first_name` | Alex | (blank) | Alex |
| `last_name` | (blank) | Sterling | Sterling |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 role="presentation" }

If both profiles have a value for the same field, Braze keeps the value from the profile to keep:

| Field | Profile to merge | Profile to keep | Resulting profile |
|---|---|---|---|
| `first_name` | Alex | Al | Al |
| `last_name` | (blank) | Sterling | Sterling |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 role="presentation" }

This behavior works well for default and custom attributes. However, Braze handles the following user types differently.

## Behavior summary

| User type | Behavior | Reason |
|---|---|---|
| Users marked for deletion | Don't merge | Profiles marked for deletion are deleted within 7 days, so their data doesn't need to be preserved. |
| Test users | Merge, with test user status preserved | Maintaining test user status helps you keep a usable testing population after a merge. |
| Global Control Group users | Don't merge | Merging would change random bucket numbers, which would affect experiments and reporting. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }

## Users marked for deletion

When you use the [bulk user deletion tool](https://www.braze.com/docs/user_guide/audience/manage_audience/user_profiles/delete_users/) to delete a segment, Braze flags those user profiles for deletion within the next 7 days. Braze doesn't merge profiles that are marked for deletion, whether they're the profile to keep or the profile to merge.

If you need to merge a profile that's marked for deletion, first [cancel the segment deletion](https://www.braze.com/docs/user_guide/audience/manage_audience/user_profiles/delete_users/#cancel) or remove the user from deletion so the profile is no longer flagged.

## Test users

Braze allows test user profiles to be merged and preserves test user status on the resulting profile. This differs from the [general merge behavior](#general-merge-behavior), which would otherwise keep the value on the profile to keep.

The following table shows the resulting test user status for each combination:

| Profile to merge | Profile to keep | Resulting profile |
|---|---|---|
| Not a test user | Not a test user | Not a test user |
| Test user | Test user | Test user |
| Test user | Not a test user | Test user |
| Not a test user | Test user | Test user |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }

For more information about test users, see [Internal groups](https://www.braze.com/docs/user_guide/administer/global/user_management/internal_groups/).

## Global Control Group users

Braze doesn't merge user profiles in a [Global Control Group](https://www.braze.com/docs/user_guide/audience/global_control_group/), whether they're the profile to keep or the profile to merge.

Global Control Group membership is determined by a user's [random bucket number](https://www.braze.com/docs/user_guide/messaging/ab_testing/concepts/random_bucket_numbers/). Merging would change which users belong to the group, which would affect your experiments and reporting.

## Related articles

- [Merge duplicate users](https://www.braze.com/docs/user_guide/audience/manage_audience/merge_duplicate_users/)
- [POST: Merge users](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/)
- [Delete users](https://www.braze.com/docs/user_guide/audience/manage_audience/user_profiles/delete_users/)
- [Global Control Group](https://www.braze.com/docs/user_guide/audience/global_control_group/)
- [Random bucket numbers](https://www.braze.com/docs/user_guide/messaging/ab_testing/concepts/random_bucket_numbers/)
- [Internal groups](https://www.braze.com/docs/user_guide/administer/global/user_management/internal_groups/)
