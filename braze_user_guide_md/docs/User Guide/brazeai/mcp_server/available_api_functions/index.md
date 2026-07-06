# Braze MCP server functions

> The Braze MCP server exposes a set of API functions that map to specific Braze REST API endpoints. MCP clients like Claude and Cursor can call these functions to retrieve non-PII data and, with the right permissions, perform non-PII write actions. For more general information, see [Braze MCP server].

**Important:**


Braze MCP server is in beta. You don't need to request access to use it. Follow the setup instructions to get started. By using the Braze MCP server, you agree to the [Braze Beta Terms](https://www.braze.com/company/legal/beta-terms). To help us make it better, send your feedback to [mcp-product@braze.com](mailto:mcp-product@braze.com).




## Prerequisites

Before you can use this feature, you'll need to [set up the Braze MCP server].

## Available Braze API functions

Your MCP client references the following API functions to interact with the Braze MCP server.

### General functions

These functions help your MCP client discover and run the available Braze API functions.

| Function | Description |
|----------|-------------|
| `list_functions` | Lists all available Braze API functions with their descriptions and parameters. |
| `call_function` | Calls a specific read-only Braze API function with the provided parameters. |
| `call_write_function` | Calls a specific write-capable Braze API function with the provided parameters. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="General functions" }

### Campaigns

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_campaign_list` | [`/campaigns/list`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaigns) | Export a list of campaigns with metadata. |
| `get_campaign_details` | [`/campaigns/details`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_details) | Get detailed information about specific campaigns. |
| `get_campaign_dataseries` | [`/campaigns/data_series`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_analytics) | Retrieve time series analytics data for campaigns. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Campaigns" }

### Canvases

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_canvas_list` | [`/canvas/list`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvases) | Export a list of Canvases with metadata. |
| `get_canvas_details` | [`/canvas/details`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_details) | Get detailed information about specific Canvases. |
| `get_canvas_data_summary` | [`/canvas/data_summary`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_analytics_summary) | Get summary analytics for Canvas performance. |
| `get_canvas_data_series` | [`/canvas/data_series`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_analytics) | Retrieve time series analytics data for Canvases. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Canvases" }

### Catalogs

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_catalogs` | [`/catalogs`](https://www.braze.com/docs/api/endpoints/catalogs/catalog_management/synchronous/get_list_catalogs) | Return a list of catalogs in a workspace. |
| `get_catalog_items` | [`/catalogs/{catalog_name}/items`](https://www.braze.com/docs/api/endpoints/catalogs/catalog_items/synchronous/get_catalog_items_details_bulk) | Return multiple catalog items and their content with pagination support. |
| `get_catalog_item` | [`/catalogs/{catalog_name}/items/{item_id}`](https://www.braze.com/docs/api/endpoints/catalogs/catalog_items/synchronous/get_catalog_item_details) | Return a specific catalog item and its content by ID. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Catalogs" }

### Cloud Data Ingestion

| Function | Endpoint | Description |
|----------|----------|-------------|
| `list_integrations` | [`/cdi/integrations`](https://www.braze.com/docs/api/endpoints/cdi/get_integration_list) | Return a list of existing CDI integrations. |
| `get_integration_job_sync_status` | [`/cdi/integrations/{integration_id}/job_sync_status`](https://www.braze.com/docs/api/endpoints/cdi/get_job_sync_status) | Return past sync statuses for a given CDI integration. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Cloud Data Ingestion" }

### Content Blocks

The `create_content_block` and `update_content_block` functions are write functions. Your MCP client must call them with `call_write_function`, and your API key must have the matching `content_blocks.create` or `content_blocks.update` permission.

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_content_blocks_list` | [`/content_blocks/list`](https://www.braze.com/docs/api/endpoints/templates/content_blocks_templates/get_list_email_content_blocks) | List your available content blocks. |
| `get_content_blocks_info` | [`/content_blocks/info`](https://www.braze.com/docs/api/endpoints/templates/content_blocks_templates/get_see_email_content_blocks_information) | Get information on your content blocks. |
| `create_content_block` | [`/content_blocks/create`](https://www.braze.com/docs/api/endpoints/templates/content_blocks_templates/post_create_email_content_block) | Create a content block. Requires `name` and `content`. Optional fields are `description`, `state` (must be `active` or `draft`), and `tags`. |
| `update_content_block` | [`/content_blocks/update`](https://www.braze.com/docs/api/endpoints/templates/content_blocks_templates/post_update_content_block) | Update an existing content block. Requires `content_block_id` and at least one updatable field: `name`, `content`, `description`, `state` (must be `active` or `draft`), or `tags`. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Content Blocks" }

### Custom Attributes

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_custom_attributes` | [`/custom_attributes`](https://www.braze.com/docs/api/endpoints/export/custom_attributes/get_custom_attributes) | Export custom attributes recorded for your app. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Custom Attributes" }

### Events

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_events_list` | [`/events/list`](https://www.braze.com/docs/api/endpoints/export/custom_events/get_custom_events) | Export a list of custom events recorded for your app. |
| `get_events_data_series` | [`/events/data_series`](https://www.braze.com/docs/api/endpoints/export/custom_events/get_custom_events_analytics) | Retrieve time series data for custom events. |
| `get_events` | [`/events`](https://www.braze.com/docs/api/endpoints/export/custom_events/get_custom_events_data) | Get detailed event data with pagination support. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Events" }

### KPIs

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_new_users_data_series` | [`/kpi/new_users/data_series`](https://www.braze.com/docs/api/endpoints/export/kpi/get_kpi_daily_new_users_date) | Daily series of new user counts. |
| `get_dau_data_series` | [`/kpi/dau/data_series`](https://www.braze.com/docs/api/endpoints/export/kpi/get_kpi_dau_date) | Daily Active Users time series data. |
| `get_mau_data_series` | [`/kpi/mau/data_series`](https://www.braze.com/docs/api/endpoints/export/kpi/get_kpi_mau_30_days) | Monthly Active Users time series data. |
| `get_uninstalls_data_series` | [`/kpi/uninstalls/data_series`](https://www.braze.com/docs/api/endpoints/export/kpi/get_kpi_uninstalls_date) | App uninstall time series data. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="KPIs" }

### Media Library

The `create_media_library_asset` function is a write function. Your MCP client must call it with `call_write_function`, and your API key must have the `media_library.create` permission.

| Function | Endpoint | Description |
|----------|----------|-------------|
| `create_media_library_asset` | [`/media_library/create`](https://www.braze.com/docs/api/endpoints/media_library/manage_assets/create) | Upload an asset to your Braze media library. You can provide either a publicly accessible URL (`asset_url`) or a base64-encoded file (`asset_file_base64`), but not both. Images have a 5 MB size limit. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Media Library" }

### Messages

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_scheduled_broadcasts` | [`/messages/scheduled_broadcasts`](https://www.braze.com/docs/api/endpoints/messaging/schedule_messages/get_messages_scheduled) | List upcoming scheduled campaigns and Canvases. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Messages" }

### Preference Centers

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_preference_centers` | [`/preference_center/v1/list`](https://www.braze.com/docs/api/endpoints/preference_center/get_list_preference_center) | List your available preference centers. |
| `get_preference_center_details` | [`/preference_center/v1/{preferenceCenterExternalID}`](https://www.braze.com/docs/api/endpoints/preference_center/get_view_details_preference_center) | View details for a specific preference center including HTML content and options. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Preference Centers" }

### Purchases

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_product_list` | [`/purchases/product_list`](https://www.braze.com/docs/api/endpoints/export/purchases/get_list_product_id) | Export paginated list of product IDs. |
| `get_revenue_series` | [`/purchases/revenue_series`](https://www.braze.com/docs/api/endpoints/export/purchases/get_revenue_series) | Revenue analytics time series data. |
| `get_quantity_series` | [`/purchases/quantity_series`](https://www.braze.com/docs/api/endpoints/export/purchases/get_number_of_purchases) | Purchase quantity time series data. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Purchases" }

### Segments

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_segment_list` | [`/segments/list`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment) | Export list of segments with analytics tracking status. |
| `get_segment_data_series` | [`/segments/data_series`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment_analytics) | Time series analytics data for segments. |
| `get_segment_details` | [`/segments/details`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment_details) | Detailed information about specific segments. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Segments" }

### Sends

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_send_data_series` | [`/sends/data_series`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_send_analytics) | Daily analytics for tracked campaign sends. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Sends" }

### Sessions

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_session_data_series` | [`/sessions/data_series`](https://www.braze.com/docs/api/endpoints/export/sessions/get_sessions_analytics) | Time series data for app session counts. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Sessions" }

### SDK Authentication Keys

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_sdk_authentication_keys` | [`/app_group/sdk_authentication/keys`](https://www.braze.com/docs/api/endpoints/sdk_authentication/get_sdk_authentication_keys) | List all SDK Authentication keys for your app. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="SDK Authentication Keys" }

### Subscription

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_user_subscription_groups` | [`/subscription/user/status`](https://www.braze.com/docs/api/endpoints/subscription_groups/get_list_user_subscription_groups) | List and get the subscription groups of a certain user. |
| `get_subscription_group_status` | [`/subscription/status/get`](https://www.braze.com/docs/api/endpoints/subscription_groups/get_list_user_subscription_group_status) | Get the subscription state of a user in a subscription group. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Subscription" }

### Templates

The `create_email_template` and `update_email_template` functions are write functions. Your MCP client must call them with `call_write_function`, and your API key must have the matching `templates.email.create` or `templates.email.update` permission.

| Function | Endpoint | Description |
|----------|----------|-------------|
| `get_email_templates_list` | [`/templates/email/list`](https://www.braze.com/docs/api/endpoints/templates/email_templates/get_list_email_templates) | List your available email templates. |
| `get_email_template_info` | [`/templates/email/info`](https://www.braze.com/docs/api/endpoints/templates/email_templates/get_see_email_template_information) | Get information on your email templates. |
| `create_email_template` | [`/templates/email/create`](https://www.braze.com/docs/api/endpoints/templates/email_templates/post_create_email_template) | Create an email template. Requires `template_name`, `subject`, and `body`. Optional fields are `plaintext_body`, `preheader`, `tags`, and `should_inline_css`. |
| `update_email_template` | [`/templates/email/update`](https://www.braze.com/docs/api/endpoints/templates/email_templates/post_update_email_template) | Update an existing email template. Requires `email_template_id` and at least one updatable field: `template_name`, `subject`, `body`, `plaintext_body`, `preheader`, `tags`, or `should_inline_css`. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Templates" }

## Disclaimer
<!-- Braze Legal must approve any changes to this content. -->
<!-- Note: Keep these comments under this H2 heading to avoid breaking how headings on certain pages are rendered. -->

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) is a newly introduced open-source protocol that may be susceptible to security issues or vulnerabilities at this time.

Braze MCP Server setup code and instructions are provided by Braze “as is” and without any warranties, and customers use it at their own risk. Braze shall not be responsible for any consequences arising from improper setup, misuse of the MCP, or any potential security issues that may arise. Braze strongly encourages customers to review their configurations carefully and to follow the outlined guidelines to reduce risks associated with the integrity and security of their Braze environment.

For assistance or clarification, please contact [Braze Support](https://www.braze.com/docs/user_guide/administrative/access_braze/support).


