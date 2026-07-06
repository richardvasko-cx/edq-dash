# Content Optimizer agent step

> The Content Optimizer agent step lets you configure and test multiple versions of content components within a single step. It helps you experiment with content variations and automatically optimizes toward the best-performing combinations over time. For an introduction, see [Content Optimizer](https://www.braze.com/docs/user_guide/brazeai/content_optimizer/).

**Important:**


Content Optimizer is currently in beta. For help getting started, contact your customer success manager.



## Creating a Content Optimizer step

For best results, use the Content Optimizer agent in Canvases where users enter the step gradually over time. If all users enter the step at once, the agent won’t have time to learn from early results. 

### Step 1: Add a step

Drag and drop the **Content Optimizer** component from the sidebar, or select the <i class="fas fa-plus-circle"></i> plus button at the bottom of a step and select **Content Optimizer**.

### Step 2: Create your base message

The base message is the starting point for your step. Variants for each content component are dynamically inserted based on the combinations defined in the **Content Optimizer Settings** tab. 

**Note:**


During the beta period, the supported channels are email, push notifications, and SMS/MMS/RCS. 






From the **Messaging Channels** tab, select **Email** and create your base email message. Refer to our dedicated [Email](https://www.braze.com/docs/user_guide/channels/email) section for help. 

The Content Optimizer agent uses the send settings (such as the email domain and reply-to address) specified in this variant to send all messages. You can either start with a new design or select an existing template for this message. At this step, consider which components of the message you want to optimize for. You define these in [step 4](#step-4).

Supported components to optimize include:

- Subject
- Body Header
- Body Content
- Primary CTA




From the **Messaging Channels** tab, select **Push notifications** and create your base push notification. Refer to our dedicated [Push](https://www.braze.com/docs/user_guide/channels/push) section for help. 

The Content Optimizer agent uses the selected push platforms specified in this variant to send all messages. You can either start with a new design or select an existing template for this message. At this step, consider which components of the message you want to optimize for. You define these in [step 4](#step-4).

Supported components to optimize include:

- Title
- Message




From the **Messaging Channels** tab, select **SMS/MMS/RCS** and create your base message. Refer to our dedicated [SMS/MMS/RCS](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs) section for help. 

The Content Optimizer agent uses the **Content** and **Message** details specified in this variant to send all messages. You can either start with a new design or select an existing template for this message. At this step, consider which components of the message you want to optimize for. You define these in [step 4](#step-4).

Supported components to optimize include:

- Hook
- Body
- CTA




### Step 3: Specify delivery settings

In the **Delivery Settings** tab, you can specify if the step should use Intelligent Timing or delivery validations. For more details, refer to [Edit delivery settings](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/message_step/#step-2-edit-delivery-settings) in Message step.

### Step 4: Add content components and variants {#step-4}

Content components are the individual elements of your message that you want to test, such as different subject lines or titles. These components allow you to generate multiple versions of a message and automatically optimize based on performance over time.

- **Email:** You can add up to three content components per step and up to five variants per component, for a total of 125 unique content combinations.
- **Push notifications:** You can add up to two components per step and up to five variants per component, for a total of 25 unique content combinations.
- **SMS/MMS/RCS:** You can add up to two content components per step, and up to five variants per component, for a total of 25 unique content combinations.

![Options for adding and configuring content components in the Content Optimizer interface. The interface displays selectable components such as Subject, Body Header, Body Content, and Primary CTA, each with fields to enter different variants.](https://www.braze.com/docs/assets/img/content_optimizer/add_content_components.png?65d8471a7b1a4ecd999faa9bb4543cc0)

#### Step 4.1: Configure content components

To configure components, go to the **Content Optimizer Settings** tab.




Choose which components you want to optimize for email messages. Supported options are:

- Subject
- Body Header
- Body Content
- Primary CTA

For each selected component, define a set of alternative versions of that content (variants). Use clear, distinct variants that differ in tone, structure, or content. This helps Content Optimizer identify top performers more effectively. You can:
  - Write your own variants manually.
  - Use AI-generated suggestions to explore new options quickly.

![Content Optimizer Settings interface showing options to add and configure content components for email optimization. Each component has input fields for entering different variants. Visible text includes component names and fields for entering variant text.](https://www.braze.com/docs/assets/img/content_optimizer/content_optimizer_settings.png?eaa39a50d886c9f7df176a4de208a463)




Choose which components you want to optimize for push notifications. Supported options are:
- Title
- Message

For each selected component, define a set of alternative versions of that content (variants). Use clear, distinct variants that differ in tone, structure, or content. This helps Content Optimizer identify top performers more effectively. You can:
  - Write your own variants manually.
  - Use AI-generated suggestions to explore new options quickly.

![Content Optimizer settings showing options to add and configure content components for push optimization.](https://www.braze.com/docs/assets/img/content_optimizer/add_content_components_push.png?c489d481025b66d6838d9f275a8bb796)




After selecting your subscription group and message type (if applicable), choose which components you want to optimize for SMS/MMS/RCS. Supported options are:
- Hook
- Body
- CTA
**Note:**


After an SMS/MMS/RCS Content Optimizer step is launched, you cannot update the subscription group or message type. 


For each selected component, define a set of alternative versions of that content (variants). Use clear, distinct variants that differ in tone, structure, or content. This helps Content Optimizer identify top performers more effectively. You can:
  - Write your own variants manually.
  - Use AI-generated suggestions to explore new options quickly.

![Content Optimizer settings showing options to add and configure content components for push optimization.](https://www.braze.com/docs/assets/img/content_optimizer/add_content_components_sms_rcs_mms.png?0e81611c4894b947eb86320ed6d35dd8)




#### Step 4.2: Add Liquid to your message

After defining at least two variants for each component, copy the associated Liquid tag for each one and paste it into the corresponding location in your base message.

- For example, if you're optimizing the subject line, paste the `{% message_component "Subject" %}` tag in the subject field of the email composer.
- You can also include component tags inside longer text to test just a portion of the component. For example: `Hey there, {% message_component "Subject" %}`.

![Options for adding and configuring content components such as Subject, Body Header, Body Content, and Primary CTA. Each component has fields for entering different variants.](https://www.braze.com/docs/assets/img/content_optimizer/optimization_liquid_in_use.png?b96fa79b951a0ff04172371327dff013)

If you don’t add a Liquid tag for a selected content component, you’ll see a warning on the **Content Optimizer Settings** tab and an error on the **Messaging Channels** tab. The Canvas can’t be launched until all selected components are properly added to your base message.

As the Canvas runs, the agent mixes and matches variants across components to generate different content combinations. Over time, higher-performing combinations are prioritized for delivery, helping you improve performance without manual intervention.

#### Liquid references

| Channel | Component | Liquid snippet |
| --- | --- | --- |
| Email | Subject | `{% message_component "Subject" %}` |
| Email | Body Header | `{% message_component "Body Header" %}` |
| Email | Body Content | `{% message_component "Body Content" %}` | 
| Email | Primary CTA | `{% message_component "Primary CTA" %}` | 
| Push | Title | `{% message_component "Title" %}` | 
| Push | Message | `{% message_component "Message" %}` | 
| SMS/MMS/RCS | Hook | `{% message_component "Hook" %}` |
| SMS/MMS/RCS | Body | `{% message_component "Body" %}` |
| SMS/MMS/RCS | CTA | `{% message_component "CTA" %}` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Liquid references" }

### Step 5: Select optimization event

The optimization event determines how the Content Optimizer agent evaluates performance and allocates traffic to content combinations over time.

Your selected optimization event applies to all content components in this step.




For email, you can optimize for one of the following events. The agent uses opens and clicks that are registered within 7 days of sending a message to shift delivery toward higher-performing content combinations.

| Event | Description | Use cases |
| --- | --- | --- |
| Opens | Optimizes for combinations that get recipients to open the email. | Testing subject lines or aiming to increase visibility |
| Clicks | Optimizes for combinations that drive engagement with links. Does not include bot clicks or Braze-recognized unsubscribe clicks. | Driving traffic, engagement, or conversion from links |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Step 5: Select optimization event" }




For push notifications, you can optimize **Opens**. This optimizes combinations that get recipients to open the push notification. You can use this optimization event to test variations in title or message copy.




For SMS and MMS messages, you can optimize **Clicks**. For RCS messages, you can optimize **Reads** or **Clicks**. 

In order for the step to have an event that it optimizes towards: 
- SMS and MMS messages must contain a link.
- RCS messages must contain a link or a suggested reply.

**Note:**


At this time, RCS messaging with Content Optimizer does not support SMS fallbacks.





## Best practices

- In general, we recommend testing more components rather than fewer for the Content Optimizer step. For example, instead of testing two components for email, test three.
- Test at least 10 total combinations for best results.
- If you’re optimizing for clicks, include subject lines in your tests, as stronger subject lines can contribute to increased opens and create more opportunities for clicks.
- If you’re optimizing for opens, keep your testing focused on the subject line.
- If this is your first time using Content Optimizer, consider using an [Experiment Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/experiment_step/) step so only part of your audience enters the branch that contains the Content Optimizer step. For example, you could send half your users down a path with the Content Optimizer step and send the other half of your users down a control path that sends the Message Step with your current business-as-usual content. Then, gather data for 2-3 weeks and compare any key performance indicators (KPIs) or counter-metrics before you increase traffic to the paths with Content Optimizer steps. 
  - For an effective one-to-one comparison, we recommend that your Content Optimizer step contains your business-as-usual content as one of the variants for each component.

## Considerations

- Multi-language settings aren't supported in Content Optimizer steps. Instead, we recommend using one Content Optimizer step per language and branching paths individually.
- Liquid tags for Content Optimizer components aren't supported in Message steps, so the Liquid aborts in Message steps.

## Analytics

To review performance, open the step-level analytics panel to see metrics by content variant and overall combination performance. The Content Optimizer step uses the [same analytics as the Message step](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/message_step/#analytics).

![Content Optimizer analytics for three buttons and the percentage of allocation of sends, which trend upwards.](https://www.braze.com/docs/assets/img/content_optimizer/content_optimizer_analytics.png?9f929445053f95a031ecb05e67769bc2)

### Performance by component

The **Performance by component** section displays the performance for each component in the Content Optimizer step. The **Component** column matches the content component you’re testing (for example, **Subject line** or **Primary CTA**). The **Identifier** column matches the identifier for this variant in the **Content Optimizer Settings** tab.

The unique opens and clicks are captured within seven days of sending a message. Which columns you see depends on your channel and selected optimization event.

| Metric | Description |
| --- | --- |
| Sends | The number of sends attributed to this variant for that component in this step, using the same step-level send counting as [*Sends*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#sends) in the [Performance by combination](#performance-by-combination) table. |
| Opens | When this column appears for your channel, the number of **unique** opens for this variant within seven days of send. See [*Unique Opens*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#unique-opens). |
| Open rate | When this column appears, the percentage of sends for this variant that logged at least one qualifying unique open within seven days. |
| Clicks | The number of **unique** clicks for this variant within seven days of send. See [*Total Clicks*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#total-clicks), [*Unique Clicks*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#unique-clicks), and [Step 5: Select optimization event](#step-5-select-optimization-event). |
| Click rate | The percentage of sends for this variant that logged at least one qualifying unique click within seven days, using the same step window as the [Performance by combination](#performance-by-combination) table. For more information, see [Why step analytics differ from general analytics](#why-step-analytics-differ-from-general-analytics). |
| Reads | When this column appears (for example, for RCS when you optimize for reads), counts when a consumer reads the message with read receipts enabled. See [*Reads*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#reads). |
| Read rate | The percentage of sends for this variant that resulted in a read among users with read receipts on. See [*Read Rate*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#read-rate). |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Performance by component metrics" }

![Content Optimizer Performance by component analytics with separate tables per component, listing sends, clicks, and click rate for each variant.](https://www.braze.com/docs/assets/img/content_optimizer/analytics_performance_by_component.png?4ad9ed8f3bfe2a05e5cb468b23883fc6)

### Performance by combination

The **Performance by combination** section displays the performance for each combination in the Content Optimizer step. Combinations are the mix of variants that define this row—one selected variant from each content component you’re testing (for example, a subject line paired with a primary CTA).

The unique opens and clicks are captured within seven days of sending a message. The columns you see depend on your channel and selected optimization event.

| Metric | Description |
| --- | --- |
| Sends | The total number of messages sent from this step using this combination. Counts follow the same general meaning as [*Sends*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#sends), scoped to each combination. |
| Opens | The number of unique opens for this combination within seven days of send. For how unique opens are defined for email, see [*Unique Opens*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#unique-opens). |
| Open rate | The percentage of sends for this combination that logged at least one qualifying unique open within seven days. |
| Clicks | The number of unique clicks for this combination within seven days of send. For how Braze defines clicks by channel, see [*Total Clicks*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#total-clicks) and [*Unique Clicks*](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#unique-clicks). |
| Click rate | The percentage of sends for this combination that logged at least one qualifying unique click within seven days. Because Content Optimizer uses the step’s seven-day, de-duplicated counts, this rate may not match click rates in general campaign analytics. For more information, see [Why step analytics differ from general analytics](#why-step-analytics-differ-from-general-analytics). |
| [Reads](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#reads) | When this column appears (for example, for RCS when you optimize for reads), counts when a consumer reads the message with read receipts enabled. |
| [Read rate](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/#read-rate) | When this column appears, the percentage of sends for this combination that resulted in a read among users with read receipts on. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Performance by combination metrics" }

![Content Optimizer Performance by combination analytics table with sends, clicks, and click rate for each content combination.](https://www.braze.com/docs/assets/img/content_optimizer/analytics_performance_by_combination.png?a2c1bf628e18190a935a47691c797e1f)

### Why step analytics differ from general analytics

Reasons that analytics in the Content Optimizer step differ from the **Analytics** section include:

- Push sends are de-duplicated for sends to the same user on different devices.
- In general, clicks and opens are de-duplicated to be unique for each user. 
- Only clicks and opens that happen within seven days of sending a message are counted in the Content Optimizer step. 

## Troubleshooting

| Issue | Description | Fix |
| --- | --- | --- |
| Missing Liquid tags | If you add a content component (such as Subject or CTA) but don’t insert the corresponding Liquid tag into your base message, you’ll see: <br>- A warning on the **Content Optimizer Settings** tab <br>- An error on the **Messaging Channels** tab | Copy the Liquid snippet shown under each component in the **Content Optimizer Settings** tab and paste it into the appropriate part of your message. |
| Orphaned Liquid tags | If you delete a content component but leave its Liquid tag in the base message, the message may not render as expected when sent. | Remove any unused `message_component` tags from your base message before launching. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Troubleshooting" }
