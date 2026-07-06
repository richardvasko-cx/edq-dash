# Frequently asked questions

> This page provides answers to some frequently asked questions about Currents.

### Can I export campaign or Canvas data for a specific date window?

To pull campaign or Canvas metrics for a defined date range, use one of the following approaches:

- Submit a [product request](https://portal.braze.com/) for date-aligned exports when you need dashboard-style reporting outside standard API windows.
- Call the [campaign analytics](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_analytics/) or [Canvas analytics](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_analytics/) endpoints with `ending_at` and `length` parameters (or use [`/campaigns/data_series`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_analytics/) and [`/canvas/data_series`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_analytics/)) for time-series data.
- Stream events to your warehouse with [Currents](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/) when you need ongoing, queryable message engagement data in Amazon S3, Azure Blob Storage, or another supported destination.

### How do I edit a live Currents integration?

To change a live Currents connector, open the integration and click **Edit** in the lower left of the page. Without **Edit**, the integration UI stays read-only and you cannot modify connector settings from the icons alone.

### How does Braze handle Azure Blob Storage Avro files after upload?

Braze does not modify Avro files in [Microsoft Azure Blob Storage](https://www.braze.com/docs/partners/data_and_analytics/cloud_storage/microsoft_azure_blob_storage_for_currents/) after upload completes. Azure may block deletion of a blob while an upload is still in progress.

### How do I get historical data?

Currents is a real-time, live data stream, which means that events can't be replayed. However, you can store Currents data in a data warehouse such as [Amazon S3](https://www.braze.com/docs/partners/data_and_analytics/cloud_storage/amazon_s3/) or [Microsoft Azure Blob Storage](https://www.braze.com/docs/partners/data_and_analytics/cloud_storage/microsoft_azure_blob_storage_for_currents/), so you can act on past events as you see fit. Data is retained for 30 days, but for more historical data, you can query [Snowflake](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/use_cases/s3_to_snowflake/).

### Why does Currents output data in the Avro format, not JSON?

Avro, unlike schema-less JSON, natively supports schema evolution. You'll also benefit from the ability to send Avro files with less bandwidth and saved storage space because Avro is highly compressible.

### How does Braze handle file overhead?

We build out an Extract, Transform, Load (ETL) process, which lets you pull large amounts of data from one database to place and store in another.

### Where should I store this data for querying?

Braze is partnered with several data warehouses you can store your data in for querying. We recommend using:
- [Amazon S3](https://www.braze.com/docs/partners/data_and_analytics/cloud_storage/amazon_s3/)
- [Microsoft Azure Blob Storage](https://www.braze.com/docs/partners/data_and_analytics/cloud_storage/microsoft_azure_blob_storage_for_currents/)
- [Google Cloud Storage](https://www.braze.com/docs/partners/data_and_analytics/cloud_storage/google_cloud_storage_for_currents/).

### How reliable is Currents data?

Currents guarantees "at-least-once" delivery, meaning duplicate events can occasionally be written to your storage bucket. If your use case requires exactly-once delivery, you can deduplicate events using the unique identifier field (`id`) sent with every event. For more details, refer to [Event delivery semantics](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/setting_up_currents/event_delivery_semantics/).

### How often is data synced to Currents?

Data is continuously streamed. Braze sends a batch of events every time there is a full batch to send, or every 5 minutes, whichever comes first. For high-volume connectors, data arrives close to real-time. For low-volume connectors, expect data to arrive within 5 to 30 minutes. For more details, refer to [Avro write threshold](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/setting_up_currents/event_delivery_semantics#avro-write-threshold).

**Note:**


If a device isn't connected to the internet, there may be a delay in creating the event. This is most common for in-app message events, since in-app messages can be triggered offline.



### How do I find which events are available for Currents?

For a full list of events that Currents logs, refer to the [Customer behavior events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/customer_behavior_events/) and [Message engagement events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events/) glossaries. You can filter these glossaries by event type (such as sends, deliveries, or opens).

### Why does the `external_id` in my Currents email open or click event differ from the user profile in the Braze dashboard?

- **In the Braze dashboard:** When a user associated with an email address opens or clicks an email, all user profiles that share that email address are marked as having opened or clicked that email. For more information, see [What happens when an email is sent out, and multiple profiles have the same email address?](https://www.braze.com/docs/user_guide/channels/email/faq/#what-happens-when-an-email-is-sent-out-and-multiple-profiles-have-the-same-email-address).
- **In Currents:** That same open or click is stored on one profile. Braze attributes it to the profile that was originally targeted for the send if that profile still shares the email address. Otherwise, Braze attributes it to one randomly selected profile among those that share the email address.

Because of this, the `external_id` on a Currents email open or click event may not match the user profile you expect when you compare Currents to the Braze dashboard.

### Are all send events logged to Currents?

All events are logged to Currents. There are no scenarios where an event would be intentionally suppressed from the Currents stream.

### Can data be corrupted in Currents?

Under normal circumstances, Currents data is not corrupted. While there is always a possibility of a rare issue, there are no known conditions under which data would be systematically corrupted.

### Why do I see custom event data dated before my Currents integration was set up?

Braze does not backfill events to Currents. However, custom events can be logged with a past timestamp (for example, if a device was offline when the event occurred and synced later). In these cases, the event timestamp reflects when the event originally occurred, which may be before the Currents integration was configured.

### Can I include custom attributes in Currents send events?

No. Currents does not include custom attributes in send events. Currents logs custom events and message engagement events. For a complete list of available fields, refer to the [event glossaries](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/).

### Does Currents include campaign tags or key-value pairs?

No. Currents does not include campaign tags or message-level key-value pairs. As a workaround, you can use a webhook channel in the campaign to send this information to your own endpoint, using [Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/) to template the tag and key-value pair data.

### How does Braze notify customers of changes to Currents?

When Currents changes occur (such as new event fields or event types), Braze sends an email to all customers with active Currents integrations who have used the dashboard within the past 30 days. You can also refer to the [Currents changelog](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/currents_changelogs) for latest changes.

### How much storage do I need for Currents data?

Storage requirements depend on your event volume and the types of events you're exporting. Braze provides [sample events in Avro format](https://github.com/appboy/currents-examples/tree/master/sample-data) that you can use to estimate file sizes for your use case.

### Why is the campaign name or Canvas step name `NULL` in my Currents data?

When you create a new campaign or Canvas, the name may take some time to propagate through all Braze systems. Events sent through Currents during this window may have `NULL` in the name fields (such as `campaign_name` or `canvas_step_name`). This is also expected if the name was modified shortly before the events were logged. To avoid this, allow some time after creating or renaming a campaign or Canvas step before sending.

### Why are session end events delayed or missing in Currents?

Session end events follow the SDK's normal upload schedule. The Braze SDK caches session data locally and flushes it periodically based on network quality—for example, about every 10 seconds on a strong connection. Until the SDK uploads the event, it doesn't appear in Currents.

If a user force-quits the app or goes offline before the next flush, the session end event may arrive late or not at all. On iOS, session end events often don't flush until the app reopens because the SDK can't send data while the app is in the background.

When you need timelier session boundaries in Currents, call `requestImmediateDataFlush()` at lifecycle points such as when the app moves to the background or returns to the foreground. For more information, see [Data upload and download](https://www.braze.com/docs/developer_guide/getting_started/sdk_overview/#data-upload-and-download) and [Session end and session start have similar timestamps (iOS)](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/event_user_log/#session-end-and-session-start-have-similar-timestamps-ios).

### What happens if my storage bucket is unavailable when Currents tries to write data?

If your storage bucket is unavailable at the time of data transfer, that data is lost. Braze is not able to backfill events that were not successfully delivered. To avoid data loss, ensure your storage bucket is available and properly configured at all times.

### Why do I see "You do not have any remaining Customer Behavior Events entitlements" when editing my Currents integration?

This message can appear when you update an existing Currents integration, and your workspace has reached its entitlement limit for customer behavior events. Contact your Braze account manager to request an entitlement or adjust your configuration.

### How often does the Currents version in the storage path change?

The `version=<currents_version>` segment in the storage path advances with each Currents release on a monthly cadence (for example, `version=6` to `version=7`). We recommend reading files recursively from the root path rather than hardcoding a specific version segment, so your pipeline automatically picks up data after a version change. For more details on the path format, refer to [Event delivery semantics](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/setting_up_currents/event_delivery_semantics/). For a history of changes by version, refer to the [Currents changelog](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/currents_changelogs).

### Why are `campaign_id` or `canvas_id` missing from a message engagement event?

Depending on the event type and context, a message engagement event may not be tied to a specific campaign or Canvas step. In those cases, `campaign_id`, `canvas_id`, and related name fields can be omitted from the event payload. If you don’t see those fields on a given event, check whether that event type and context normally include campaign or Canvas identifiers.
