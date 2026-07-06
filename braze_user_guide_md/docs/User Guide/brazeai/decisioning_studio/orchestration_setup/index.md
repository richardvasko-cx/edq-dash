# Set up orchestration

> Decisioning agents need to connect to a customer engagement platform (CEP) to orchestrate communications once they have ingested customer data and personalized at a 1:1 level. This article covers what you need to prepare and how to configure the integration for each supported CEP.

## What is orchestration?

Orchestration is the connection between Decisioning Studio and your customer engagement platform (CEP). Once your decisioning agent determines the optimal action for each customer, orchestration carries out those decisions by triggering personalized communications through your CEP.

Think of it this way:

- **Decisioning Studio** decides *what* to send and *when* to send it
- **Your CEP** handles *how* to send it

## Choose your CEP

The first step is to choose which CEP to use with Decisioning Studio. Your choice affects setup complexity and available features.

### Supported CEPs

| CEP | Integration type | Setup complexity |
|-----|-----------------|------------------|
| **Braze** | Native API integration (recommended) | Low |
| **Salesforce Marketing Cloud** | API events + Journey Builder | Medium |
| **Other CEPs** | Custom (recommendation file) | High |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Supported CEPs" }

**Tip:**


If you're already using Braze as your CEP, we recommend using the native Braze integration for the smoothest setup experience.



## Prerequisites

Before setting up orchestration, gather the following items based on your chosen CEP.




| Requirement | Description |
|------|-------------|
| **REST API key** | A new API key with permissions for user data, messages, campaigns, Canvas, segments, and templates. |
| **Braze dashboard URL** | Your Braze instance URL (for example, `https://dashboard-01.braze.com`). |
| **App ID** | The API key associated with the app you want to track (found in **Settings** > **App Settings**). |
| **Email display name and address** | The sender information to use for your campaigns (found in **Settings** > **Email Preferences**). |
| **Base templates** | The message templates your agent will use for orchestration. You'll create API-triggered campaigns for each template. |
| **Test user ID** | A user ID for testing the integration before launch. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites" }




| Requirement | Description |
|------|-------------|
| **App package credentials** | Client ID, Client Secret, Authentication Base URI, REST Base URI, and SOAP Base URI from an installed package with server-to-server API integration. |
| **API permissions** | Scopes for channels, assets, automations, journeys, contacts, data extensions, and tracking events. |
| **Data extensions** | You'll need data extensions for subscriber data, engagement data, and recommendations. |
| **Email templates** | The templates you want Decisioning Studio to use, with template IDs for each. |
| **Journey Builder access** | Access to create and activate multi-step journeys with API event entry sources. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites" }




If you're using a CEP other than Braze or Salesforce Marketing Cloud, Decisioning Studio can integrate through a recommendation file approach:

| Item | Description |
|------|-------------|
| **Data ingestion capability** | Your CEP must be able to ingest recommendation files (typically CSV or JSON) containing personalized decisions for each customer. |
| **Dynamic content support** | Your campaigns must support populating fields dynamically based on recommendation data. |
| **Custom engineering resources** | Your team will need to build the integration to read recommendation files and trigger communications. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites" }




## Plan your campaigns

Before setting up orchestration, consider the following details:

### Base templates

A base template is any message template that your decisioning agent might use. Consider:

- **How many templates?** Your agent can work with one template or multiple. If multiple, the agent can personalize which template each customer receives.
- **What channels?** Email, push, SMS, or a combination. Each channel may require separate templates and campaigns.
- **What dynamic elements?** Identify which parts of your message the agent will personalize (subject lines, CTAs, offers, timing, etc.). These will become API trigger properties or dynamic placeholders.

### Re-eligibility settings

Your campaigns should allow users to receive messages multiple times:

- For testing, you'll want to send the same campaign to the same user repeatedly
- In production, the agent may determine the same campaign is optimal for a user on consecutive days

**Note:**


While setting up re-eligibility for testing, Decisioning Studio agents are designed to respect frequency caps and will not send the same campaign to a user more than once per day in production.



### API trigger properties

For Braze integrations, plan which dimensions your agent will optimize. These become API trigger properties that pass dynamic values into your campaigns:

| Example dimension | API trigger property |
|-------------------|---------------------|
| Subject line | `{{api_trigger_properties.${subject_line}}}` |
| Call to action | `{{api_trigger_properties.${cta_message}}}` |
| Offer | `{{api_trigger_properties.${offer_id}}}` |
| Discount amount | `{{api_trigger_properties.${discount}}}` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="API trigger properties" }

## Integration setup

Select your CEP below to get started with the integration setup.




## Set up Braze integration

Follow these steps to integrate a Decisioning Studio agent with Braze's orchestration capabilities (Braze's services team will be available to help):

### Step 1: Create an API key

Go to **Settings** > **API Keys**, then create a new key with the following permissions:

| Permission | Purpose | Required? |
| :--- | ----- | :---: |
| [`/users/track`](https://www.braze.com/docs/api/endpoints/user_data/post_user_track) | Updates custom attributes on user profiles, in addition to creating temporary user profiles when using test sends. | &#10003; |
| [`/users/delete`](https://www.braze.com/docs/api/endpoints/user_data/post_user_delete) | Deletes temporary user profiles that were created while using test sends. | Only for test sends |
| [`/users/export/segment`](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_segment) | Updates the available audience communications every morning by exporting the list of users from each selected segment. | &#10003; |
| [`/users/export/ids`](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_identifier) | Retrieves a list of identifiers when targeting users using an `external_id` instead of a segment. Since Decisioning Studio doesn’t accept Personally Identifiable Information (PII), you'll need to ensure your `fields_to_export` parameter returns only non-PII fields.
 | Only if using `external_ids` |
| [`/messages/send`](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_messages) | Sends recommended variants at the recommended time using API Campaigns that are configured for Decisioning Studio's experimenter. | &#10003; |
| [`/campaigns/list`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaigns/#prerequisites) | Retrieves the list of active campaigns and extracts available email content for experimentation. | &#10003; |
| [`/campaigns/data_series`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_analytics) | Exports aggregated campaign data to enable reporting, validation, and troubleshooting in Decisioning Studio, so you can compare reporting values and analyze baseline performance.<br><br>While not required, this permission is recommended. |  |
| [`/campaigns/details`](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_details) | Retrieves HTML content, subject line, and image resources from existing Campaigns for experimentation. | &#10003; |
| [`/canvas/list`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvases) | Retrieves the list of active Canvases to extract available email content for experimentation. | &#10003; |
| [`/canvas/data_series`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_analytics) | Exports aggregated canvas data for reporting and validation, especially when BAU is orchestrated via Canvas.<br><br>While not required, this permission is recommended. |  |
| [`/canvas/details`](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_details/#prerequisites) | Retrieves HTML content, subject line, and image resources from existing Canvases for experimentation. | &#10003; |
| [`/segments/list`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment) | Retrieves all existing segments as potential target audiences for the Decisioning Studio experimenter. | &#10003; |
| [`/segments/data_series`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment_analytics) | Exports segment size information, which is shown in Decisioning Studio when selecting an audience. | &#10003; |
| [`/segments/details`](https://www.braze.com/docs/api/endpoints/export/segments/get_segment_details/#prerequisites) | Retrieves segment details such as entry and exit criteria to help understand changes in audience size or performance. |  |
| [`/templates/email/create`](https://www.braze.com/docs/api/endpoints/templates/email_templates/post_create_email_template) | Creates copies of selected base HTML templates with [dynamic placeholders](https://www.braze.com/docs/user_guide/personalization_and_dynamic_content/liquid) (Braze liquid tags) for experimentation, avoiding changes to the originals. | &#10003; |
| [`/templates/email/update`](https://www.braze.com/docs/api/endpoints/templates/email_templates/post_update_email_template) | Pushes updates to Decisioning Studio-created template copies when experimentation criteria change, such as call-to-actions. | &#10003; |
| [`/templates/email/info`](https://www.braze.com/docs/api/endpoints/templates/email_templates/get_see_email_template_information/#prerequisites) | Retrieves information about Decisioning Studio-created templates in your Braze instance. | &#10003; |
| [`/templates/email/list`](https://www.braze.com/docs/api/endpoints/templates/email_templates/get_list_email_templates) | Validates that templates were successfully copied over to your Braze instance. | &#10003; |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Table" }


### Step 2: Set up API-triggered campaigns

Set up an API-triggered campaign for each base template with API trigger properties for all optimized dimensions.

A base template is any template that the Decisioning Agent might use for orchestrating messages. A Decisioning Agent might have 1 base template or multiple, in which case choosing the right base template for each customer will be one of the decisions the agent personalizes.

### Step 3: Configure re-eligibility

Ensure all API-triggered campaigns allow users to become re-eligible within 15 minutes.

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_frequency_cap.png?8dcd2098690ee6b2bd827328e375616c)

**Note:**


While the Decisioning Studio agent will never send the same campaign more than once a day, you will want to have the ability to send the same campaigns multiple times in a day for testing purposes.



### Step 4: Add dynamic placeholders

These serve as dynamic placeholders for decisions that the Decisioning Studio agent is optimizing.

#### Example 1: Email Campaign

Suppose the Decisioning Studio agent is optimizing an email campaign. This might be configured like this:

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_email_example_1.png?aa7bc7323a8585d6edb120e92f2db91f)

Supposing the agent is optimizing for choice of templates and Call to Action (CTA) message, then an API-triggered campaign should be created for each template, and the CTA section of one template might look like:

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_braze_email_example_2.png?e6f05316a954744cf203a0bf0b7fdae2)

#### Example 2: Push campaign

Suppose a Decisioning Studio agent is optimizing the message of a Push campaign. This might be configured like this:

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_push_example_1.png?9773a38fb2ce8c797698439aa328fc01)

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_push_example_2.png?cd7bd35be6b461dfac94731cc7ac6313)

Resulting in the following message:

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_push_example_3.png?b8d1d4b59195980581da82f666ab6455)

#### Example 3: SMS Campaign

Suppose that the Decisioning Studio agent is optimizing for fields in an SMS campaign. This might be configured like this:

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_sms_example_1.png?5c86bd8f1501910ee5dd397fa398355c)

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_sms_example_2.png?fffe211c7f99ca55e04c89f1d14c04e3)

Resulting in the following message:

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_sms_example_3.png?da648fc3ee265907506dc72d0a694684)




## Set up SFMC integration

Decisioning Studio supports native integration with Salesforce Marketing Cloud. Decisioning Studio triggers API events into a journey with data required to populate dynamic elements.

For detailed steps to configure the SFMC integration, follow the [SFMC instructions](https://www.braze.com/docs/user_guide/brazeai/decisioning_studio/decisioning_studio_go/set_up_orchestration/) in the Decisioning Studio Go documentation.




## Set up other CEP integrations

Decisioning Studio can integrate with any customer engagement platform. However, this may require some custom engineering work from your team, since Decisioning Studio cannot trigger communications directly.

In this scenario, the agent will deliver a "recommendation file." This file contains rows for each customer, with columns that indicate all of the personalized decisions for that customer.

For example, the following recommendation file:

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_custom_example_2.png?5833019b5e622301fbb86ab6c5be0823)

Might be used to optimize an email campaign that looks like the following:

![Decisioning Pro Diagram](https://www.braze.com/docs/assets/img/decisioning_studio/decisioning_studio_custom_example_1.png?bd2c4619a1d7fcce46b1d3675fdc448b)




## Best practices

Keep these best practices in mind as you prepare for orchestration:

1. **Begin with a narrow scope.** Use one channel and one or two templates at first. You can expand later as you learn what works.
2. **Test thoroughly.** Before launching, test your integration with a small set of users to verify that dynamic content populates correctly.
3. **Document your setup.** Keep track of campaign IDs, template IDs, API keys, and other identifiers. You'll need to reference these in the Decisioning Studio portal.
4. **Coordinate with your team.** Orchestration setup may involve marketing, engineering, and data teams. Ensure everyone understands their role in the process.
5. **Plan for feedback data.** Orchestration includes sending messages and collecting the engagement and conversion data that helps your agent learn. See [Prepare your data](https://www.braze.com/docs/user_guide/brazeai/decisioning_studio/prepare_data/) for more details.

## Next steps

After setting up orchestration, proceed to design your agent:

- [Design decisioning agents](https://www.braze.com/docs/user_guide/brazeai/decisioning_studio/design_agents/)