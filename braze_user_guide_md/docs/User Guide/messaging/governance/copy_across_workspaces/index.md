# Copy campaigns and Canvases across workspaces

> Copying campaigns across workspaces lets you jumpstart your message composition by starting with a copy of a campaign in a different workspace. This page covers how to copy campaigns to different workspaces and lists what is and isn't copied over.

When you copy a campaign or Canvas to a different workspace, the copy will remain as a draft until you edit and launch, helping you keep and build off your successful messaging strategies.




**Important:**


Copying campaigns across workspaces is generally available. Channel support for Content Cards isn't currently available.



You can copy campaigns across workspaces for these supported channels: SMS, in-app messages, push notifications, email, and webhooks. You can also copy across email templates, feature flags, and Content Blocks. Note that multi-channel campaigns with unsupported channels can't be copied over to a different workspace.

To copy a campaign to a different workspace:

1. Select the <i class="fas fa-cog"></i> gear icon next to the selected campaign.
2. Select **Copy to workspace**. 
3. After copying, review and test your campaign to confirm that all fields work properly.




**Important:**


Copying Canvases across workspaces is generally available. The following channels aren't currently supported: LINE, Content Cards, and WhatsApp.



You can copy Canvases across workspaces for these supported channels: email, in-app messages, push, webhooks, and SMS.

To copy a Canvas to a different workspace:

1. Select the <i class="fa-solid fa-ellipsis-vertical"></i>&nbsp;menu next to the selected Canvas.
2. Select **Copy to workspace**. 
3. After copying, review and test your Canvas to confirm that all fields work properly.

When copying a Canvas with Audience Sync steps, the settings will not be copied over to the destination workspace, but the steps in the journey will be.




## What's copied across workspaces

Note that the following is not a comprehensive list of what is copied across workspaces and what is omitted. As a best practice, check the campaign and Canvas details and test to confirm your message works as expected.

### Details




| Copied | Omitted |
|---|---|
| Description | Territories | 
| Type | Tags | 
| Actions (nested) | Segments and filters | 
| Conversion behaviors (nested) | [Approvals](https://www.braze.com/docs/user_guide/messaging/governance/approvals/) | 
| Quiet time configurations | Trigger schedule | 
| Frequency capping configurations | Campaign summaries | 
| Recipient subscription state |  | 
| Recurring schedule |  | 
| Is Transactional |  | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Details" }




| Copied | Omitted |
|---|---|
| Description | Territories | 
| Type | Tags | 
| Actions (nested) | Segments and filters | 
| Conversion behaviors (nested) | [Approvals](https://www.braze.com/docs/user_guide/messaging/governance/approvals/) | 
| Quiet time configurations | Trigger schedule | 
| Frequency capping configurations | Canvas summaries | 
| Recipient subscription state |  | 
| Recurring schedule | Exit criteria | 
| Is Transactional |  |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Details" }

Filter criteria from Canvas steps (for example, [Decision Split](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/decision_split/) steps) aren't copied to the destination workspace. Reconfigure those filters after you copy.




### Conversion behaviors




| Copied | Omitted |
|---|---|
| Type behavior | Workspace IDs |
| Campaign interaction |  Campaign ID | 
| Custom event name |  | 
| Product name |  |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Conversion behaviors" }




| Copied | Omitted |
|---|---|
| Type behavior | Workspace IDs |
| Canvas interaction |  Canvas ID | 
| Custom event name |  | 
| Product name |  | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Conversion behaviors" }




### Actions




| Copied | Omitted |
|---|---|
| Type behavior | Workspace IDs |
| Campaign interaction |  Campaign ID | 
| Custom event name |  | 
| Product name |  |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Actions" }




| Copied | Omitted |
|---|---|
| Type behavior | Workspace IDs |
| Canvas interaction |  Canvas ID | 
| Custom event name |  | 
| Product name |  | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Actions" }




### Message variations




| Copied | Omitted |
|---|---|
| Send percentage | API ID |
| Type |  Seed group IDs | 
|  |  Link template IDs | 
|  |  Internal user group IDs | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Message variations" }




| Copied | Omitted |
|---|---|
| Send percentage | API ID |
| Type |  Seed group IDs | 
|  |  Link template IDs | 
|  |  Internal user group IDs | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Message variations" }





### Email message variation




| Copied | Omitted |
|---|---|
| Email body | From address |
| Message extras |  Reply to | 
| Title |  BCC | 
| Subject |  Link template | 
|  |  Link aliasing |
|  | Translations |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Email message variation" }




| Copied | Omitted |
|---|---|
| Email body | From address |
| Message extras |  Reply to | 
| Title |  BCC | 
| Subject |  Link template | 
|  |  Link aliasing |
|  | Translations |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Email message variation" }




### Email body




| Copied | Omitted |
|---|---|
| Plain text | Link aliasing |
| HTML and drag-and-drop content | Translations | 
| Preheader |  | 
| Inline CSS |  | 
| AMP HTML |  |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Email body" }




| Copied | Omitted |
|---|---|
| Plain text | Link aliasing |
| HTML and drag-and-drop content | Translations | 
| Preheader |  | 
| Inline CSS |  | 
| AMP HTML |  |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Email body" }




### Email templates




| Copied | Omitted |
|---|---|
| Email body | API IDs |
| Description | Image IDs | 
| Subject | Territories | 
| Headers | Tags | 
| | Translations |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Email templates" }




| Copied | Omitted |
|---|---|
| Email body | API IDs |
| Description | Image IDs | 
| Subject | Territories | 
| Headers | Tags | 
| | Translations |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Email templates" }




### Content Blocks




| Copied | Omitted |
|---|---|
| Name | Link aliasing |
| Description | API keys | 
| Content | Territories | 
| HTML and drag-and-drop content | Tags | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Content Blocks" }




| Copied | Omitted |
|---|---|
| Name | Link aliasing |
| Description | API keys | 
| Content | Territories | 
| HTML and drag-and-drop content | Tags | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Content Blocks" }




### SMS message variation




| Copied | Omitted |
|---|---|
| Body | Messaging service |
| Link shortening | VCF media items | 
| Click tracking |  | 
| Media items |  | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="SMS message variation" }




| Copied | Omitted |
|---|---|
| Body | Messaging service |
| Link shortening | VCF media items | 
| Click tracking |  | 
| Media items |  | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="SMS message variation" }




## Copying messages that contain Liquid

Liquid references within message bodies are copied over to the destination workspace, but the references may not function as expected. This means if a Canvas from Workspace A is copied to Workspace B, then Workspace B can't reference Workspace A's details, including Liquid references. For example, fields like trigger actions, audience filters, and [Decision Split](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/decision_split/) filter criteria aren't copied over.

Keep track of the following Liquid references with dependencies when copying campaigns and Canvases across workspaces:

- Catalog item tags
- Connected Content tags
- Content Blocks
- Custom attributes
- Preference centers
- Product recommendations
- Subscription state tags
- Voucher and promotion tags

## Copying messages with feature flags

To copy a feature flag campaign and a Canvas with a Feature Flag step between workspaces, make sure the destination workspace has a [feature flag experiment](https://www.braze.com/docs/developer_guide/feature_flags/experiments) configured with an ID that matches either the feature flag referenced in the original campaign or the Feature Flag step referenced in the original Canvas.

If you copy a campaign or Canvas that has a Feature Flag step with a feature flag ID that doesn't exist in the destination workspace, the Feature Flag step will be copied but its contents will not be.

## Copying messages with Content Blocks

When you copy a campaign across workspaces, Content Blocks won't be copied. However, a Content Block can be referenced in the destination workspace if a block with the same name exists. Alternatively, you can create the Content Block (or these Liquid references) in the destination workspace to avoid errors when launching a campaign.

For Canvases that reference a Content Block, the Content Block must first be copied to the destination workspace.
