# Manage company users

> Learn how to manage users in your company account, including adding, suspending, and deleting users.

## Adding company users

You must have administrator permissions to add users to your Braze account. 

To add a new user:

1. Go to **Settings** > **Company Users**.
2. Select **+ Add New User**.
3. Enter their information as prompted, including their email, department, and [user role](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/#creating-a-role).

**Tip:**


The department listed in a user's profile determines what types of communications they receive from Braze. This is so everyone only receives the communications and alerts that are relevant to how they use Braze.



{:start="4"}

4. For users that aren't administrators, select the company-level and workspace-level [permissions](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/#editing-a-users-permissions) you want this user to have.

![Workspace-level permissions with a section for custom permissions fields.](https://www.braze.com/docs/assets/img/add_new_user_3.png?ca794c4308af6328b8641cce774f92fb)

### Email address requirements

Every email address used in an [instance](https://www.braze.com/docs/user_guide/administer/personal/sdk_endpoints) must be unique. This means that if you try to add an email address that's already associated with a user who had or still has access to a company workspace in that instance, you'll see an error message. 

If your team uses Gmail and you're experiencing issues adding an email address, you can create an alias by adding a plus sign (+) like "+1" or "+test" to the email address. For example, `contractor@braze.com` can have an alias of `contractor+1@braze.com`. Emails to `contractor+1@braze.com` will still be delivered to `contractor@braze.com`, but the alias will be recognized as a unique email address.

### Can I change my Braze account's email address?

For security reasons, users cannot change the email address associated with their Braze account. If a user wants to update their email address, an administrator should [create a new account](#adding-braze-users) for them with their preferred email address.

## Assigning user access and responsibilities



## Suspending company users

Suspending a user puts their account into an inactive state, where the user can no longer log in, but the data associated with their account is preserved. Only administrators can suspend or unsuspend company users. Note that suspended users may still receive notifications from Braze.

To suspend a user, go to **Settings** > **Company Users**, find their username, and select <i class="fa-solid fa-user-lock"></i> **Suspend**.

![Option to suspend a user.](https://www.braze.com/docs/assets/img_archive/suspend_user.png?177147332d932ebf7464e7e24eacddc4)

Administrators can also suspend a user by selecting their name from the list and selecting **Suspend user** in the footer.

![Suspend a user when editing the user details.](https://www.braze.com/docs/assets/img_archive/suspend_user2.png?51bdddb2503dfe3f7c885873dc39f50b){: style="max-width:70%;"}

## Deleting company users

To delete a user, go to **Settings** > **Company Users**, find the user's name, and select <i class="fa fa-trash-can"></i> **Delete user**. 

Only administrators can delete company users, and company users cannot delete their own accounts. An administrator cannot delete their own dashboard account; another administrator must delete it for them.

![Delete a user.](https://www.braze.com/docs/assets/img_archive/delete_user_new.png?10587eba02bc4a23186fb2015567bc24)

After a user is deleted, Braze does not keep any of the following account data:

- Any attributes that the user had
- Email address
- Phone number
- External user ID
- Gender
- Country
- Language
- Other similar data

Braze will keep the following account data:

- Custom attributes or test data associated with their account
- Campaigns or Canvases they created (but the user's name won't appear in them, such as appearing in the **Last edited by** column)

### Impact of deleting a dashboard user

When a dashboard user is deleted, there is no significant impact on the assets they created within the dashboard, such as campaigns, segments, and Canvases. However, the **Created By** field for these assets displays a "null" value instead of the email address of the deleted user.

If a new dashboard user is subsequently created with the same email address as the deleted user, Braze will not re-associate the assets created by the deleted user with the new user. The new dashboard user will start with a clean slate and will not be credited as the creator of any existing assets in the dashboard.

## Troubleshooting

### "Unable to perform action" when adding a user

If adding a dashboard user fails with an "Unable to perform action" (or similar) error:

- Remove leading or trailing spaces and hidden characters from the email address.
- Confirm the address is a valid email format for your organization. Some special characters are rejected.
- The same email cannot be used for two dashboard users in the same [cluster](https://www.braze.com/docs/user_guide/administer/personal/accessing_your_account/). If the address is already registered in another workspace on that cluster, use a distinct address or an alias such as `user+1@company.com`.

### "Email is already taken" when trying to add a user

If you try to add a new user and receive an error saying the email is already taken, but can't find them in your user list, that user most likely exists within a different instance of the same Braze dashboard cluster.

To create this new user, you can do either of the following:

1. Delete the user from the other instance before you can create them in the new one, or
2. Create the user with a different email string (such as `testing+01@braze.com`) or another email alias. 

If you don't receive the message activation in your inbox when using `testing+01@braze.com`, confirm with your IT team that you can accept messages from that kind of email address. Some administrators filter messages sent to email addresses with a `+`.

## Next steps

After adding users, manage their access:

- [Permissions](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/) to configure what each user can do in the dashboard.
- [Teams](https://www.braze.com/docs/user_guide/administer/global/user_management/teams/) to organize users into groups with shared access to specific dashboard objects.
