# Teams

> As a Braze admin, you can group your company users into Teams with varying user roles and permissions. This allows you to have multiple, unrelated groups of company users working together in one workspace by separating the types of content that can be edited.

Teams can be set up across customer base location, language, and custom attributes so that Team members and non-Team members have different access to messaging features and customer data. Team filters and tags can be assigned across various engagement tools. There is no limit on how many teams you can create in your workspace.

Teams are not available on all Braze contracts. To access this feature, contact your Braze account manager or [contact us](mailto:success@braze.com) for a consultation.

## How do Teams differ from permission sets and roles?



## Create Teams {#creating-teams}

Go to **Settings** > **Internal Teams** and select <i class="fas fa-plus"></i> **Add Team**.

![Window to add a new Team.](https://www.braze.com/docs/assets/img_archive/adding_a_team.png?c7e9f1259a0d556d24f6a39ef149e4b8)

Enter the **Team Name**. If desired, use the **Define Team (Optional)** field to select a custom attribute, location, or language to further define what user data the Team has access to. For example, a possible use case is to perform [testing with Teams](#test-with-teams) by creating a development Team that only has access to test users, identified by a custom attribute. Another use case is to restrict communication with users based on the product.

If a Team is defined by a custom attribute, language, or country, you can then use the Team to filter end-users for features like campaigns, Canvases, Content Cards, segments, and more. For more, see [Assigning Team tags](#tags-and-filters).

## Assign users to Teams

Braze administrators and limited users with the company-level permission "Can Manage Company Settings" can assign Team-level permissions to a company user with limited access. When assigned to a Team, company users are limited to only read or write data available to their particular Teams, such as user language, location, or custom attribute, as defined when the Team was created.

To assign a user to a Team, navigate to **Settings** > **Company Users** and select a user you'd like to add to your Team.

Then perform the following steps:

1. In the **Workspace-level permissions** section, add the user to the appropriate workspace if they aren't already included.

![Workspace-level permissions with the Banner Template permission set.](https://www.braze.com/docs/assets/img/team_level_permissions.png?f863414f26c8b1498b52e45bc1f7b488)

{: start="2"}
2. Select **+ Add team-level permissions**, then select the **Team** you'd like to add this user to.
3. Assign specific permissions from the **Team** permissions section.

![Team-level landing page template permissions.](https://www.braze.com/docs/assets/img/teams.png?7e6ef8585b9e10272b90a3b16bfb7455)

### Available Team-level permissions

The following are all available permissions you can assign at the Team level. Any permissions not listed here are only granted on the workspace level, and these permissions will appear as "--" in the **Teams** permissions column.

- View Campaigns
- Edit Campaigns
- Archive Campaigns
- Launch Campaigns
- Approve Campaigns
- View Canvases
- Edit Canvases
- Archive Canvases
- Launch Canvases
- Approve Canvases
- View Content Blocks
- Edit Content Blocks
- Archive Content Blocks
- Launch Content Blocks
- View Segments
- Edit Segments
- Archive Segments
- View IAM Templates
- Edit IAM Templates
- Archive IAM Templates
- View Email Templates
- Edit Email Templates
- Archive Email Templates
- View Webhook Templates
- Edit Webhook Templates
- Archive Webhook Templates
- View Email Link Templates
- Edit Email Link Templates
- View Media Library Assets
- Edit Media Library Assets
- Delete Media Library Assets
- Export User Data
- View User Profiles (PII Redacted)
- View PII
- Edit Dashboard Users
- Edit Canvas Templates
- View Canvas Templates
- Archive Canvas Templates
- View Dashboard Reports
- Edit Dashboard Reports
- Delete Dashboard Reports

To see descriptions of what each user permission includes and how to use them, check out our [User Permissions](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/) section.

## Assign Team tags {#tags-and-filters}

You can assign a Team to Canvases, campaigns, Content Cards, segments, email templates, webhook templates, Content Blocks, and media library assets with the **Add Team** filter.
 
![Adding a Team tag to a campaign.](https://www.braze.com/docs/assets/img/teams1.png?399a4e4ea0330745cb3aa5c33c09e0d7){: style="max-width:70%;"}

- Based on the *definitions* applied when the Team was created, when a Team filter is assigned, that engagement tool's audience is restricted to user profiles that match the definition.
- Based on assigned *permissions*, Team members will only be allowed to access dashboard engagement tools that have their Team filter set. If they have limited or no workspace permissions, they must add a Team filter to certain objects before they can save or launch them. Team members are also able to filter Canvases, campaigns, Content Cards, and segments by Team to identify content relevant to them.

### Use cases

Consider the following two scenarios for a marketer in Braze named Michelle. Michelle is a member of a Team called "Development". She has access to all of the Team-level permissions for the Development Team.




In this scenario, Michelle is a limited user who has no workspace-level permissions. Her permissions look something like this:

![Custom permissions with no workspace-level permissions and 16 team-based permissions.](https://www.braze.com/docs/assets/img_archive/scenario1.png?20795814217db24088ccd4cafffa3e36)

Based on Michelle's assigned permissions, whenever she creates a campaign, she can only assign the "Development" Team to that campaign. She can't launch the campaign unless the Team is assigned, and she can't view or access any other Team tags.

![Campaign Team tag dropdown that only displays the "Development" Team tag.](https://www.braze.com/docs/assets/img_archive/team_permissions_scenario1.gif?525a58837f3d881134eca16db04d3994)




In this scenario, Michelle is still a member of the Development Team, but she also has an additional workspace-level permission.

![Custom permissions with one workspace-level permission and 15 team-based permissions.](https://www.braze.com/docs/assets/img_archive/scenario2.png?2d53682f32c30f94c7be1bd4ca9bb7ca)

Because Michelle has the workspace-level permission of "Access Campaigns, Canvases, Cards, Content Blocks, Feature Flags, Segments, Media Library, and Preference Centers", she can view and assign other Team filters to the campaign she creates.

![Campaign Team tag dropdown with multiple Team tags](https://www.braze.com/docs/assets/img_archive/team_permissions_scenario2.gif?09d109293fe04362d5843c4a4c4ad2cb)

Similar to the first scenario, Michelle must add the Development Team tag to the campaign before she can launch it.




## Test with Teams

One possible use case for Teams is to create a Teams-based approval system for testing and launching content in a production environment.

To do so, create a "Development" Team that only has access to test users. You can limit a Team to only access test users if your test users are identifiable by a custom attribute. Then, add the custom attribute as a definition when creating or editing the Team (see the preceding section [Creating Teams](#creating-Teams)). Your approvers should have access to all users.

The general process would be as follows:

1. The Development Team creates a campaign and adds the "Development" Team tag.
2. The Development Team launches the campaign to test users.
3. The Approver Team validates the local campaign design, promotes, and launches. To launch, the Approver Team changes the Team tag from "Development" to "[All Teams]" and relaunches the campaign.

For changes to active campaigns:

1. The Development Team clones the running campaign, adds the "Development" Team tag, and saves.
2. The Development Team makes edits and shares with the Approver Team.
3. The Approver Team removes the "Development" Team tag, pauses the previous campaign, and launches the new campaign.

## Archive an existing Team

You can archive Teams from the **Internal Teams** page.

Select one or many Teams to archive. If the Team is not associated with any object within Braze, the Team will be archived immediately. If the Team is associated with an object, you will be presented with an option to remove the Team after the archive process or replace the Team.

![Archiving a Team that is associated with an object in Braze](https://www.braze.com/docs/assets/img_archive/archive_a_team.png?204e9984f10cd335a7b836583e79583b){: style="max-width:70%;"}

Braze admins can unarchive a Team by selecting the archived Team and selecting **Unarchive**.
