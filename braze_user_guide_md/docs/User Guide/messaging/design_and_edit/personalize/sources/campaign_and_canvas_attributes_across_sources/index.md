# Campaign and Canvas attributes across sources

> Campaign, Canvas, and Canvas Step names and IDs are all available in Liquid, the Braze REST API, and Currents. These attributes map to the same value across all three sources, but may be named differently. Use this page to draw connections between the three.

## Use cases

### Liquid

Campaign and Canvas attributes are available as Liquid tags in the dashboard (such as `{{campaign.${api_id}}}`). Use Liquid to pass these attributes in the message itself, in a Connected Content call, or as key-value pairs. This is usually done for tracking purposes.

### REST API

Campaign and Canvas attributes are also available in the [Export campaign details endpoint](https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_details/) or [Export Canvas details endpoint](https://www.braze.com/docs/api/endpoints/export/canvas/get_canvas_details/). Use the Braze REST API to build mappings—that is, a list of all the Canvas names and their corresponding IDs.

### Currents

Campaign and Canvas attributes are tied to [message engagement events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events/) from Currents. Note that only Message steps have access to campaign attributes, and other Canvas steps only have access to Canvas attributes. This is important so that you can determine what campaign or Canvas component a push send or email open is associated with.

## Campaign attributes

| Attribute | Liquid | REST API | Currents |
| --- | --- | --- | --- |
| Campaign name | `{{campaign.${name}}}` | `name` | `campaign_name` |
| Campaign ID | `{{campaign.${api_id}}}` | N/A (used as an input for the API call itself) | campaign_id |
| Variant name | `{{campaign.${message_name}}}` | `messages.message_variation_id.name` | N/A (map variant name to variant ID using the Export campaign details endpoint) |
| Variant ID | `{{campaign.${message_api_id}}}` | `messages.message_variation_id` | `message_variation_api_id` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="Campaign attributes" }

## Canvas attributes

| Attribute | Liquid | REST API | Currents |
| --- | --- | --- | --- |
| Canvas name | `{{canvas.${name}}}` | `name` | `canvas_name` |
| Canvas ID | `{{canvas.${api_id}}}` | N/A (used as an input for the API call itself) | canvas_id |
| Variant name | `{{canvas.${variant_name}}}` | `variants.name` | `canvas_variation_name` |
| Variant ID | `{{canvas.${variant_api_id}}}` | `variants.name.id` | `canvas_variation_id` |
| Step name (for Message steps only) | `{{campaign.${name}}}` | `steps.name` | `canvas_step_name` |
| Step ID | `{{campaign.${api_id}}}` | `steps.id` | `canvas_step_id` |
| Message channel | N/A | `steps.messages.message_variation_id.channel` | N/A (inherent from event type, such as push send or email open) |
| Message ID | `{{campaign.${message_api_id}}}` | `steps.message.message_variation_id` | `canvas_step_message_variation_api_id` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="Canvas attributes" }
