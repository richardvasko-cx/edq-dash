# Setting up the Braze MCP server

> Learn how to set up the Braze MCP server, so you can interact with your Braze data through natural language using tools like Claude and Cursor. For more general information, see [Braze MCP server].

**Important:**


Braze MCP server is in beta. You don't need to request access to use it. Follow the setup instructions to get started. By using the Braze MCP server, you agree to the [Braze Beta Terms](https://www.braze.com/company/legal/beta-terms). To help us make it better, send your feedback to [mcp-product@braze.com](mailto:mcp-product@braze.com).




## Prerequisites

Before you start, you'll need the following:

| Prerequisite | Description |
|--------------|-------------|
| Braze API Key | A Braze API key with the required permissions. You'll create a new key when you [set up your Braze MCP server](#create-api-key). |
| MCP client | [Claude](https://claude.ai/), [Cursor](https://cursor.com/), and [Google Gemini CLI](https://docs.cloud.google.com/gemini/docs/codeassist/gemini-cli) are officially supported. You must have an account for one of these clients to use the Braze MCP server. |
| Terminal | A terminal app so you can run commands and install tooling. Use your preferred terminal app or the one that's pre-installed on your computer. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites" }

## Setting up the Braze MCP server

### Step 1: Install `uv`

First, install `uv`&#8212;a [command-line tool by Astral](https://docs.astral.sh/uv/getting-started/installation/) for dependency management and Python package handling.



Open your terminal application, paste the following command, then press <kbd>Enter</kbd>.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

The output is similar to the following:

```bash
$ curl -LsSf https://astral.sh/uv/install.sh | sh

downloading uv 0.8.9 aarch64-apple-darwin
no checksums to verify
installing to /Users/Isaiah.Robinson/.local/bin
  uv
  uvx
everything's installed!
```



 Open Windows PowerShell, paste the following command, then press <kbd>Enter</kbd>.

```powershell
irm https://astral.sh/uv/install.ps1 | iex
```

The output is similar to the following:

```powershell
PS C:\Users\YourUser> irm https://astral.sh/uv/install.ps1 | iex

Downloading uv 0.8.9 (x86_64-pc-windows-msvc)
no checksums to verify
installing to C:\Users\YourUser\.local\bin
  uv.exe
  uvx.exe
everything's installed!
```



### Step 2: Create an API key {#create-api-key}

The Braze MCP server includes both read-only and write endpoints. They don't return data from Braze user profiles. Write endpoints let agents create or update content in your workspace.

To create your API key:

1. Go to **Settings** > **APIs and Identifiers** > **API Keys**.
2. Create a new key.
3. Assign some or all of the following permissions to your key.

**Important:**


Only assign the permissions you want your agent to use. To prevent your agent from making changes in Braze, leave any write permissions off when you create your API key.



**List of supported permissions**


#### Campaigns

| Endpoint | Required permission |
|----------|---------------------|
| [`/campaigns/data_series`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_analytics) | `campaigns.data_series` |
| [`/campaigns/details`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_details) | `campaigns.details` |
| [`/campaigns/list`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaigns) | `campaigns.list` |
| [`/sends/data_series`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_send_analytics) | `sends.data_series` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Campaigns" }

#### Canvas

| Endpoint | Required permission |
|----------|---------------------|
| [`/canvas/data_series`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_analytics) | `canvas.data_series` |
| [`/canvas/data_summary`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_analytics_summary) | `canvas.data_summary` |
| [`/canvas/details`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_details) | `canvas.details` |
| [`/canvas/list`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvases) | `canvas.list` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Canvas" }

#### Catalogs

| Endpoint | Required permission |
|----------|---------------------|
| [`/catalogs`](https://www.braze.com/docs/api/endpoints/catalogs/catalog_management/synchronous/get_list_catalogs) | `catalogs.get` |
| [`/catalogs/{catalog_name}/items`](https://www.braze.com/docs/api/endpoints/catalogs/catalog_items/synchronous/get_catalog_items_details_bulk) | `catalogs.get_items` |
| [`/catalogs/{catalog_name}/items/{item_id}`](https://www.braze.com/docs/api/endpoints/catalogs/catalog_items/synchronous/get_catalog_item_details) | `catalogs.get_item` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Catalogs" }

#### Cloud Data Ingestion

| Endpoint | Required permission |
|----------|---------------------|
| [`/cdi/integrations`](https://www.braze.com/docs/api/endpoints/cdi/get_integration_list) | `cdi.integration_list` |
| [`/cdi/integrations/{integration_id}/job_sync_status`](https://www.braze.com/docs/api/endpoints/cdi/get_job_sync_status) | `cdi.integration_job_status` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Cloud Data Ingestion" }

#### Content Blocks

The `content_blocks.create` and `content_blocks.update` permissions are write permissions. Add them only if you want your agent to create or update content blocks in your workspace.

| Endpoint | Required permission |
|----------|---------------------|
| [`/content_blocks/list`](https://www.braze.com/docs/api/endpoints/templates/content_blocks_templates/get_list_email_content_blocks) | `content_blocks.list` |
| [`/content_blocks/info`](https://www.braze.com/docs/api/endpoints/templates/content_blocks_templates/get_see_email_content_blocks_information) | `content_blocks.info` |
| [`/content_blocks/create`](https://www.braze.com/docs/api/endpoints/templates/content_blocks_templates/post_create_email_content_block) | `content_blocks.create` |
| [`/content_blocks/update`](https://www.braze.com/docs/api/endpoints/templates/content_blocks_templates/post_update_content_block) | `content_blocks.update` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Content Blocks" }

#### Custom Attributes

| Endpoint | Required permission |
|----------|---------------------|
| [`/custom_attributes`](https://www.braze.com/docs/api/endpoints/export/custom_attributes/get_custom_attributes) | `custom_attributes.get` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Custom Attributes" }

#### Events

| Endpoint | Required permission |
|----------|---------------------|
| [`/events/list`](https://www.braze.com/docs/api/endpoints/export/custom_events/get_custom_events) | `events.list` |
| [`/events/data_series`](https://www.braze.com/docs/api/endpoints/export/custom_events/get_custom_events_analytics) | `events.data_series` |
| [`/events`](https://www.braze.com/docs/api/endpoints/export/custom_events/get_custom_events_data) | `events.get` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Events" }

#### KPIs

| Endpoint | Required permission |
|----------|---------------------|
| [`/kpi/new_users/data_series`](https://www.braze.com/docs/api/endpoints/export/kpi/get_kpi_daily_new_users_date) | `kpi.new_users.data_series` |
| [`/kpi/dau/data_series`](https://www.braze.com/docs/api/endpoints/export/kpi/get_kpi_dau_date) | `kpi.dau.data_series` |
| [`/kpi/mau/data_series`](https://www.braze.com/docs/api/endpoints/export/kpi/get_kpi_mau_30_days) | `kpi.mau.data_series` |
| [`/kpi/uninstalls/data_series`](https://www.braze.com/docs/api/endpoints/export/kpi/get_kpi_uninstalls_date) | `kpi.uninstalls.data_series` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="KPIs" }

#### Media Library

The `media_library.create` permission is a write permission. Add it only if you want your agent to upload assets to your media library.

| Endpoint | Required permission |
|----------|---------------------|
| [`/media_library/create`](https://www.braze.com/docs/api/endpoints/media_library/manage_assets/create) | `media_library.create` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Media Library" }

#### Messages

| Endpoint | Required permission |
|----------|---------------------|
| [`/messages/scheduled_broadcasts`](https://www.braze.com/docs/api/endpoints/messaging/schedule_messages/get_messages_scheduled) | `messages.schedule_broadcasts` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Messages" }

#### Preference Center

| Endpoint | Required permission |
|----------|---------------------|
| [`/preference_center/v1/list`](https://www.braze.com/docs/api/endpoints/preference_center/get_list_preference_center) | `preference_center.list` |
| [`/preference_center/v1/{preferenceCenterExternalID}`](https://www.braze.com/docs/api/endpoints/preference_center/get_view_details_preference_center) | `preference_center.get` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Preference Center" }

#### Purchases

| Endpoint | Required permission |
|----------|---------------------|
| [`/purchases/product_list`](https://www.braze.com/docs/api/endpoints/export/purchases/get_list_product_id) | `purchases.product_list` |
| [`/purchases/revenue_series`](https://www.braze.com/docs/api/endpoints/export/purchases/get_revenue_series) | `purchases.revenue_series` |
| [`/purchases/quantity_series`](https://www.braze.com/docs/api/endpoints/export/purchases/get_number_of_purchases) | `purchases.quantity_series` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Purchases" }

#### Segments

| Endpoint | Required permission |
|----------|---------------------|
| [`/segments/list`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment) | `segments.list` |
| [`/segments/data_series`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment_analytics) | `segments.data_series` |
| [`/segments/details`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment_details) | `segments.details` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Segments" }

#### Sends

| Endpoint | Required permission |
|----------|---------------------|
| [`/sends/data_series`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_send_analytics) | `sends.data_series` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Sends" }

#### Sessions

| Endpoint | Required permission |
|----------|---------------------|
| [`/sessions/data_series`](https://www.braze.com/docs/api/endpoints/export/sessions/get_sessions_analytics) | `sessions.data_series` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Sessions" }

#### SDK Authentication Keys

| Endpoint | Required permission |
|----------|---------------------|
| [`/app_group/sdk_authentication/keys`](https://www.braze.com/docs/api/endpoints/sdk_authentication/get_sdk_authentication_keys) | `sdk_authentication.keys` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="SDK Authentication Keys" }

#### Subscription

| Endpoint | Required permission |
|----------|---------------------|
| [`/subscription/status/get`](https://www.braze.com/docs/api/endpoints/subscription_groups/get_list_user_subscription_group_status) | `subscription.status.get` |
| [`/subscription/user/status`](https://www.braze.com/docs/api/endpoints/subscription_groups/get_list_user_subscription_groups) | `subscription.groups.get` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Subscription" }

#### Templates

The `templates.email.create` and `templates.email.update` permissions are write permissions. Add them only if you want your agent to create or update email templates in your workspace.

| Endpoint | Required permission |
|----------|---------------------|
| [`/templates/email/list`](https://www.braze.com/docs/api/endpoints/templates/email_templates/get_list_email_templates) | `templates.email.list` |
| [`/templates/email/info`](https://www.braze.com/docs/api/endpoints/templates/email_templates/get_see_email_template_information) | `templates.email.info` |
| [`/templates/email/create`](https://www.braze.com/docs/api/endpoints/templates/email_templates/post_create_email_template) | `templates.email.create` |
| [`/templates/email/update`](https://www.braze.com/docs/api/endpoints/templates/email_templates/post_update_email_template) | `templates.email.update` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Templates" }



**Warning:**


Don't reuse an existing API key. Create one specifically for your MCP client. Assign only the permissions your agent needs. Agents may try to use any permission you grant, so leave any write permissions off if you don't want your agent to make changes in Braze.



### Step 3: Get your identifier and endpoint

When you configure your MCP client, you'll need your API key's identifier and your workspace's REST endpoint. To get these details, go back to the **API Keys** page in the dashboard&#8212;keep this page open, so you can reference it during [the next step](#configure-client).

![The 'API Keys' in Braze showing a newly created API key and the user's REST endpoint.](https://www.braze.com/docs/assets/img/mcp_server/get_indentifer_and_endpoint.png?e439a42a44d6fcaeb410fb209b2c39bd){: style="max-width:85%;"}

### Step 4: Configure your MCP client {#configure-client}

Configure your MCP client using the pre-provided configuration file.



Set up your MCP server using the [Claude Desktop](https://claude.ai/download) connector directory. 

1. In Claude Desktop, go to **Settings** > **Connectors** > **Browse Connectors** > **Desktop Extensions** > **Braze MCP Server** > **Install**.
2. Enter your API key and base URL.
3. Save the configuration and restart Claude Desktop.




In [Cursor](https://cursor.com/), go to **Settings** > **Tools and Integrations** > **MCP Tools** > **Add Custom MCP**, then add the following snippet:

```json
{
  "mcpServers": {
    "braze": {
      "command": "uvx",
      "args": ["--native-tls", "braze-mcp-server@latest"],
      "env": {
        "BRAZE_API_KEY": "your-braze-api-key",
        "BRAZE_BASE_URL": "your-braze-endpoint-url"
      }
    }
  }
}
```

Replace `key-identifier` and `rest-endpoint` with the corresponding values from the **API Keys** page in Braze. Your configuration should be similar to the following:

```json
{
  "mcpServers": {
    "braze": {
      "command": "uvx",
      "args": ["--native-tls", "braze-mcp-server@latest"],
      "env": {
        "BRAZE_API_KEY": "2e8b-3c6c-d12e-bd75-4f0e2a8e5c71",
        "BRAZE_BASE_URL": "https://torchie.braze.com"
      }
    }
  }
}
```

When you're finished, save the configuration and restart Cursor.


Gemini CLI reads user settings from `~/.gemini/settings.json`. If this doesn't exist, you can create it by running the following in your terminal:

```powershell
mkdir -p ~/.gemini
nano ~/.gemini/settings.json
```

Next, replace `yourname` with the exact string before `@BZXXXXXXXX` in your terminal prompt. Then, replace `key-identifier` and `rest-endpoint` with the corresponding values from the **API Keys** page in Braze. 

Your configuration should be similar to the following:

```json
{
  "mcpServers": {
    "braze": {
      "command": "/Users/yourname/.local/bin/uvx",
      "args": ["--native-tls", "braze-mcp-server@latest"],
      "env": {
        "BRAZE_API_KEY": "2e8b-3c6c-d12e-bd75-4f0e2a8e5c71",
        "BRAZE_BASE_URL": "https://torchie.braze.com"
      }
    }
  }
}
```

When you're finished, save the configuration and restart Gemini CLI. Then, in Gemini, run the following commands to verify that the Braze MCP server is listed and that the tools and schema are available for use:

```powershell
gemini
/mcp
/mcp desc
/mcp schema
```

You should see the `braze` server listed with the tools and schema available for use.




### Step 5: Send a test prompt

After you set up the Braze MCP server, try sending a test prompt to your MCP client. For other examples and best practices, see [Using the Braze MCP server].



!['What are my available Braze functions?' being asked and answered in Claude.](https://www.braze.com/docs/assets/img/mcp_server/claude/what_are_my_available_braze_functions.png?3c01fb7977ba5f52c0f9ca3db3b28ec6){: style="max-width:85%;"}



!['What are my available Braze functions' being asked and answered in Cursor.](https://www.braze.com/docs/assets/img/mcp_server/cursor/what_are_my_available_braze_functions.png?a7bb97c2f1daab42ce7a140e4f769816)



![What are my available Braze functions? being asked and answered in Gemini CLI.](https://www.braze.com/docs/assets/img/mcp_server/gemini_cli/what_are_my_available_braze_functions.png?31a24038fcd7ba20fbd70e3bd80297e7)



## Troubleshooting

### Terminal errors

#### `uvx` command not found

If you receive an error that `uvx` command not found, reinstall `uv` and restart your terminal.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### `spawn uvx ENOENT` error

If you receive a `spawn uvx ENOENT` errors, you may need to update the filepath in your client's config file. First, open your terminal and run the following command:

```bash
which uvx
```

The command should return a message similar to the following:

```bash
/Users/alex-lee/.local/bin/uvx
```

Copy the message to your clipboard and open [your client's config file](#configure-client). Replace `"command": "uvx"` with the path you copied, then restart your client. For example:

```json
"command": "/Users/alex-lee/.local/bin/uvx"
```

#### Package installation fails

If your package installation fails, try installing a specific Python version instead.

```bash
uvx --python 3.12 braze-mcp-server@latest
```

### Client configuration

#### MCP client can't find the Braze server

1. Verify your MCP client configuration syntax is correct.
2. Restart your MCP client after configuration changes.
3. Check that `uvx` is in your system `PATH`.

#### Authentication errors

1. Verify your `BRAZE_API_KEY` is correct and active.
2. Ensure your `BRAZE_BASE_URL` matches your Braze instance.
3. Check that your API key has the [correct permissions](#create-api-key).

#### Connection timeouts or network errors

1. Verify your `BRAZE_BASE_URL` is correct for your instance.
2. Check your network connection and firewall settings.
3. Ensure you're using HTTPS in your base URL.

## Disclaimer
<!-- Braze Legal must approve any changes to this content. -->
<!-- Note: Keep these comments under this H2 heading to avoid breaking how headings on certain pages are rendered. -->

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) is a newly introduced open-source protocol that may be susceptible to security issues or vulnerabilities at this time.

Braze MCP Server setup code and instructions are provided by Braze “as is” and without any warranties, and customers use it at their own risk. Braze shall not be responsible for any consequences arising from improper setup, misuse of the MCP, or any potential security issues that may arise. Braze strongly encourages customers to review their configurations carefully and to follow the outlined guidelines to reduce risks associated with the integrity and security of their Braze environment.

For assistance or clarification, please contact [Braze Support](https://www.braze.com/docs/user_guide/administrative/access_braze/support).


