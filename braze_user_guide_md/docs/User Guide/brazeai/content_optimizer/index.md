# Content Optimizer

> Content Optimizer is an agent that helps you test and optimize message content at scale, using AI to generate and evaluate high volumes of content variants automatically.

**Important:**


Content Optimizer is currently in beta and only available for these channels: email, push notifications, and SMS/MMS/RCS messages. For help getting started, contact your customer success manager.



## About Content Optimizer

Content Optimizer is an agent that runs in a Canvas step. It helps you define message components to test, generate variants using Generative AI or manual input, and automatically optimize which content combinations are sent to users. This feature helps you to:

- Optimize subject lines, body header, body content, or primary CTA for emails.
- Optimize titles and messages for push notifications.
- Optimize hooks, bodies, and CTAs for SMS, MMS, and RCS messages.
- Continuously improve message performance without manual A/B test setup.
- Test high volumes of content variants quickly, leveraging AI for ideation.
- Automatically phase out underperforming content and scale up winners.

Learn how to create a [Content Optimizer step](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/content_optimizer_step/).

## Use cases

### Email

| Optimization use case | Goal | Description |
| --- | --- | --- |
| Subject line variations | Increase open rate | Test tone, urgency, personalization, and use of emojis. |
| Header messaging styles | Boost engagement | Compare emotional, value-driven, and clear messaging in the body header. | 
| Body content format | Improve readability and engagement | Test storytelling versus feature lists, bullets versus paragraphs, and content length. |
| CTA copy and tone | Increase click-throughs | Compare action-led, benefit-focused, and first-person CTA phrasing. |
| Themed content combinations | Discover high-performing combinations | Mix and match themed subject, body, and CTA components to find the best overall combination. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Email" }

### Push notifications

| Optimization use case | Goal | Description |
| --- | --- | --- |
| Title variations | Increase open rate | Test clarity, urgency, personalization, and tone in the push title. |
| Body copy styles | Improve engagement | Compare concise, benefit-led, and action-oriented messaging in the push body. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Push notifications" }

### SMS, MMS, and RCS messages

| Optimization use case | Goal | Description |
| --- | --- | --- |
| Hook variations | Increase engagement | Test urgency, personalization, and tone in the first line shown in SMS previews, MMS captions, or RCS introductions. |
| Body copy styles | Improve engagement | Compare concise and action-oriented messaging in the body, including wording that accompanies media on MMS and RCS. |
| CTA copy variations | Increase click-throughs | Compare action-led and conversational CTA phrasing for links and next-step prompts in SMS, MMS, and RCS. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="SMS, MMS, and RCS messages" }

## How it works

Content Optimizer uses a non-contextual [multi-armed bandit](https://en.wikipedia.org/wiki/Multi-armed_bandit) algorithm to allocate more sends to high-performing variants and reduce allocation to underperforming ones. Over time, this results in continuous improvement of your message content, with minimal manual intervention.

Braze's proprietary bandit optimization algorithm is built specifically for the combinatorial nature of the Content Optimizer step. Given that each message is comprised of several components, the bandit simultaneously learns about the performance of each component (such as the subject line, body, CTA) as well as their interactions when combined into a message. More concretely, when a given combination is sent, all combinations that share the same components benefit from the data of that send. This allows the bandit to learn much faster on the same amount of data, relative to a standard bandit algorithm.

When the step first launches, Content Optimizer sends variants randomly to collect initial performance data. After this initial exploration period, the algorithm begins shifting traffic toward higher-performing content combinations, gradually reducing allocation to underperforming options. During the exploration period, traffic is generally distributed across available variants to allow the algorithm to learn from their relative performance.

Content Optimizer is similar to the Message step in Canvas, with features like quiet hours, [Intelligent Timing](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_timing/), and event logging. You can configure a Content Optimizer step by creating a base message and defining which content components (such as subject line, body text, or call-to-action) to optimize. Variants for each component can be generated with AI or entered manually, and Liquid tags must be added to the base message to map components into the message content.

Each user receives one message per entry into the Content Optimizer step. Re-entries are treated as new, with no memory of previous variants.

## Canvas entry setup

For best results, use Content Optimizer in Canvases where users enter the step gradually and regularly over time, such as in recurring or always-on Canvases with consistent daily volume. If all users enter the step at once, the agent won’t have time to learn from early results. The step will behave more like a static A/B test than a live optimization engine.

The best fit for Content Optimizer is in daily recurring entry Canvases, as well as event-triggered and API-triggered Canvases with relatively consistent daily user entries. If you do use Content Optimizer in single-send Canvases or "spiky" entry Canvases (like recurring monthly), consider using [Entry controls](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#selecting-entry-controls) to smooth out user entries over the course of multiple days.

### Key concepts

| Term                    | Description |
|-------------------------|-------------|
| Base message   | The main message template that variants are built from, including all send settings. |
| Content components  | Elements within a message (for example, subject line or primary CTA) that can be tested and optimized. Marketers must insert the relevant Liquid tag into the message where the component should appear. |
| Content variants    | The different values a content component can take. |
| Content combinations| Unique messages created by mixing and matching content variants. |
| Optimization event       | Determines how Content Optimizer evaluates performance and allocates traffic to content combinations over time, such as clicks or opens for email. Applies to all content components in a step. Content Optimizer continuously learns from this event and automatically shifts delivery toward higher-performing content combinations. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Key concepts" }

## Considerations

- Content Optimizer is currently in beta and only available for these channels: email, push notifications, and SMS/MMS/RCS messages.
- For email, the agent can generate up to 125 combinations per step:
   - Up to 3 components per step
   - Up to 5 variants for each component
- For push notifications, the agent can generate up to 25 combinations per step:
   - Up to 2 components per step
   - Up to 5 variants for each component
- For SMS, MMS, and RCS messages, the agent can generate up to 25 combinations per step:
   - Up to 2 components per step
   - Up to 5 variants for each component
- Only one message is sent per user per entry. There is no memory of previous sends for re-entries.
- Marketers must manually insert Liquid tags for each component in the message composer where the defined content component variants should render.

## How is my data used and sent to OpenAI? {#ai-policy} 
<!-- Braze Legal must approve any changes to this content. -->
<!-- Note: Keep these comments under this H2 heading to avoid breaking how headings on certain pages are rendered. -->

To generate AI output through BrazeAI features that leverage OpenAI (“Output”), Braze will send certain information (“Input”) to OpenAI. Input consists of your prompts, and may include the content displayed in the dashboard, and other workspace data relevant to your queries, as applicable. Per [OpenAI’s API platform commitments](https://openai.com/enterprise-privacy/), data sent to OpenAI’s API via Braze is not used to train or improve OpenAI models. OpenAI may retain data for 30 days for abuse monitoring purposes, after which it is deleted. Between you and Braze, Output is your intellectual property. Braze will not assert any claims of copyright ownership on such Output. Braze makes no warranty of any kind with respect to any AI-generated content, including Output.


## Next steps

- Contact your customer success manager to join the beta or for onboarding support.
- Learn how to create a [Content Optimizer step](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/content_optimizer_step/).
