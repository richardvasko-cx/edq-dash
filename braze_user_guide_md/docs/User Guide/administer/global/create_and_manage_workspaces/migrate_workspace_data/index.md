# Migrate data between workspaces and instances

> Workspaces keep your Braze data separate. This page explains how that isolation affects migration, what you can move with product features and APIs, and what you need to rebuild or handle outside Braze. Migration is usually a cross-functional effort—not only a Company Admin task. Admins often own workspace setup and channel configuration; developers handle SDK and API changes; marketers rebuild segments and copy messaging content. Each step requires the relevant [permissions](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/) in the source and destination workspaces.

Everything you store in Braze—user profiles, segments, messaging content, and engagement history—lives inside a workspace. A segment, campaign, or Canvas can't read or target data from another workspace. Dashboard users often use multiple workspaces on the same company dashboard for staging and production, for different brands, or for regional splits. That setup gives you isolation, but it also means there is no single action in the dashboard that moves all workspace data to another workspace or another Braze instance.

For planning context, see [Get started: Workspaces](https://www.braze.com/docs/user_guide/get_started/workspaces/) and [Create and manage workspaces](https://www.braze.com/docs/user_guide/administer/global/create_and_manage_workspaces/).

## What Braze does not automatically migrate between workspaces

The following is not bulk-migrated when you point SDKs or APIs at a new workspace (or a new Braze dashboard environment with its own workspaces):

| Area | Behavior |
| --- | --- |
| **User profiles** | Profiles don't transfer as a packaged unit. Recreate or import users in the destination workspace (see [User profile data](#user-profile-data)). |
| **Segments and filters** | Segment definitions stay in the source workspace. Rebuild segments in the destination workspace using the same logic where possible. |
| **Messaging history** | Campaign and Canvas receipt history on a profile is tied to the source workspace. It doesn't appear on a new profile in another workspace unless you model it yourself (for example, via custom attributes), as noted in [Braze onboarding FAQs](https://www.braze.com/docs/user_guide/onboarding_faq/). |
| **Channel-specific configuration** | Sending domains, SMS subscriptions, WhatsApp numbers, and similar settings are workspace-scoped. Reconfigure them in the destination workspace where applicable. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="What Braze does not automatically migrate between workspaces" }

**Important:**


If using separate workspaces for staging and production, remember that [Currents](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/) connectors are not shared across workspaces. Plan which workspace owns production exports. For more detail, see [Get started: Workspaces](https://www.braze.com/docs/user_guide/get_started/workspaces/#currents-connectors).



## What you can move or recreate

### Campaign and Canvas content

You can copy many campaign and Canvas definitions to another workspace as drafts. Supported channels, omitted fields, and Liquid caveats are documented in [Copy campaigns and Canvases across workspaces](https://www.braze.com/docs/user_guide/messaging/governance/copy_across_workspaces/). After copying, update segments, triggers, and any workspace-specific references before you launch.

### User profile data

Typical approaches:

- **REST API:** Use [`/users/track`](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) to create or update users in the destination workspace with the identifiers and attributes you need. This is the same pattern described for [migrating legacy user data](https://www.braze.com/docs/developer_guide/getting_started/integration_overview/#migrating-legacy-user-data) when bringing historical data into Braze.
- **CSV import:** For marketer-driven imports, see [Import users](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/) and [CSV import](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/).
- **Cloud Data Ingestion:** To sync attributes from a warehouse into the destination workspace, see [Cloud Data Ingestion](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/).
- **Exports from the source workspace:** Use [`/users/export/ids`](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_identifier/) or [`/users/export/segment`](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_segment/) to extract data you are allowed to move, then map it into `users/track` or CSV for the destination. Respect your data retention, privacy, and contractual obligations when exporting and reloading data.

**Note:**


Merging duplicate profiles with the [Merge users](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/) endpoint or [duplicate users](https://www.braze.com/docs/user_guide/audience/manage_audience/merge_duplicate_users/) in the dashboard applies within a single workspace, not across two workspaces.



### User export fields that don't map to standard profile APIs

When you rebuild users in a destination workspace from a [user export](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_identifier/), some export fields cannot be written back into Braze standard profile fields through the REST API or CSV (the way the SDK and server populate them). You can often keep the values as custom attributes instead. Be aware of the following limits.

#### Device information (`devices`)

Device records in the export are populated by the SDK. You cannot migrate that data into Braze's standard device fields through the REST API.

If you need that information before the user starts a session in an app that targets the destination workspace, send it as custom attributes when you import the user. Standard segmentation filters and Liquid references that rely on built-in device data do not use the exported device payload until the user opens a session on an app instance wired to the new workspace (when the SDK refreshes standard device fields).

**Note:**


This is separate from [push token migration](#push-tokens), which uses the `push_tokens` field on [`/users/track`](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/).



#### Total sessions and per-app session data (`apps` and nested `sessions`)

Session totals and nested session data from the `apps` object in an export cannot be re-imported into the same built-in fields. To preserve legacy counts (for example, total sessions from the source workspace), store them in custom attributes and segment on those fields in the destination workspace.

You can set `date_of_first_session` and `date_of_last_session` through [`/users/track`](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) or CSV import. For accepted formats, see the [User attributes object](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#braze-user-profile-fields) and [CSV import](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/).

#### Random bucket (`random_bucket`)

Each user is assigned a [random bucket number](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/customer_behavior_events/#random-bucket-number-update-events) in their workspace. That value cannot be re-imported; the user gets a new random bucket in the destination workspace.

If you rely on the old number for holdouts or sampling (for example, excluding users whose `random_bucket` is below a threshold), save the exported value as a custom attribute and build segments or filters on that attribute instead of the built-in random bucket field.

#### Partner attribution fields (`attributed_*`)

Attribution fields from partner integrations (the `attributed_*` fields in an export) cannot be set on Braze standard attribution fields through the REST API. Map them to custom attributes in the destination workspace if you need to keep them for segmentation or messaging.

### Push tokens

When users already have push tokens from a previous provider or app version, you can import tokens for mobile apps through the API, or rely on the SDK after integration. Web push tokens have API limitations. For full detail and examples, see [Migrating push tokens](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#migrating-push-tokens).

### WhatsApp

Phone numbers and subscription groups can be moved between workspaces with a specific transfer flow. See [Transfer WhatsApp phone numbers and subscription groups between workspaces](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/whatsapp_phone_numbers/transfer_between_workspaces/).

### Engagement and analytics data outside Braze

If you need a historical record of sends, opens, or clicks when consolidating environments, [Currents](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/) and other exports are the supported way to land that data in your warehouse or tools. That data is not re-ingested into Braze as native per-user message history on another workspace.

## Before you change SDK or API keys

When you've pointed your app or site at a new workspace:

- Users who open the app or site can create new profiles in the new workspace. They don't carry over prior workspace-specific history automatically.
- If the same person could exist in both workspaces, you can see [duplicate-like scenarios](https://www.braze.com/docs/user_guide/administer/global/create_and_manage_workspaces/#should-i-create-a-new-workspace-when-im-releasing-an-updated-app) (for example, overlapping push reach). Prefer a deliberate data and targeting plan over sharing production and staging keys unintentionally.

**Tip:**


For workspace or app instance deletion limits, special account moves, or large-scale migration planning, [contact Braze Support](https://www.braze.com/docs/user_guide/administer/personal/braze_support/) with your dashboard links and a summary of source and destination workspaces.


