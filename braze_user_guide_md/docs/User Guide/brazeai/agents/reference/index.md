# Reference for agents

> As you create custom agents, refer to this article for more information on key settings, such as instructions and output schemas. For an introduction, see [Braze Agents](https://www.braze.com/docs/user_guide/brazeai/agents/) and [Frequently asked questions](https://www.braze.com/docs/user_guide/brazeai/agents/faq/).

## Models

When you set up an agent, you can choose the model it uses to generate responses. You have two options: using a Braze-powered model or bringing your own API key.

**Important:**


The Braze-powered **Auto** model is optimized for models whose thinking capabilities are sufficient to perform tasks such as catalog search and segment membership. When using other models, we recommend testing to confirm your model works well for your use case. You may need to adjust your [instructions](#writing-instructions) to give different levels of detail or step-by-step thinking to models with different speeds and capabilities.



### Option 1: Use a Braze-powered model

This is the simplest option, with no extra setup required. Braze provides access to large language models (LLMs) directly. To use this option, select **Auto**, which uses Gemini models.

**Important:**


If you don't see **Braze Auto** as an option in the **Model** dropdown when creating an agent, contact your customer success manager to learn how to become eligible to use the Braze Auto model.



### Option 2: Bring your own API key

With this option, you can connect your Braze account with providers like OpenAI, Anthropic, or Google Gemini. If you bring your own API key from an LLM provider, token costs are billed directly through your provider, not through Braze.

We recommend routinely testing the most recent models, as legacy models may be discontinued or deprecated after a few months. You can also sign up for Agent Console notifications in [Notification Preferences](https://www.braze.com/docs/user_guide/administer/global/admin_settings/notification_preferences/) to be alerted when Braze detects a model is no longer available.

To set this up:

1. Go to **Partner Integrations** > **Technology Partners** and find your provider.
2. Enter your API key from the provider.
3. Select **Save**.

Then, you can return to your agent and select your model.

When you use a Braze-provided LLM, the providers of such a model will be acting as Braze Sub-processors, subject to the terms of the Data Processing Addendum (DPA) between you and Braze. If you choose to bring your own API key, the provider of your LLM subscription is considered a Third Party Provider under the contract between you and Braze.

#### Thinking levels

Some LLM providers may allow you to adjust a selected model's thinking level. Thinking levels define the range of thought the model uses before answering—from quick, direct responses to longer chains of reasoning. This affects response quality, latency, and token usage.

| Level | When to use |
|-------|-------------|
| **Minimal** | Simple, well-defined tasks (such as catalog lookup, straightforward classification). Fastest responses and lowest cost. |
| **Low** | Tasks that benefit from a bit more reasoning but don't need deep analysis. |
| **Medium** | Multi-step or nuanced tasks (such as analyzing several inputs to recommend an action). |
| **High** | Complex reasoning, edge cases, or when you need the model to work through steps before answering. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Thinking levels" }

We recommend starting with **Minimal** and testing your agent’s responses. Then, you can adjust the thinking level to **Low** or **Medium** if you find the agent is struggling to provide accurate answers. In rare cases, a **High** thinking level may be needed, although using this level can result in high token costs and longer response times or higher risk of timeout errors. If your agent is struggling to balance multi-step reasoning with reasonable response times, consider breaking your use case apart into more than one agent that can work together in a Canvas or catalog.

Braze uses the same IP ranges for outbound LLM calls as for Connected Content. The ranges are listed in the [Connected Content IP allowlist](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content/making_an_api_call#connected-content-ip-allowlisting). If your provider supports IP allowlisting, you can restrict the key to those ranges so only Braze can use it.

**Important:**


When you use a Braze-provided LLM, the providers of such a model will be acting as Braze Sub-processors, subject to the terms of the Data Processing Addendum (DPA) between you and Braze. If you choose to bring your own API key, the provider of your LLM subscription is considered a Third Party Provider under the contract between you and Braze.



#### Determine which model to use

Each LLM provider has a slightly different mix of model capabilities, costs, and thinking levels. Here are some general guidelines and best practices:

- For cost efficiency, prioritize testing lower token cost models over higher cost models. Adjust to higher cost models only if lower cost models are struggling with the use case or generate inconsistent or inaccurate outputs.
- For speed and performance efficiency, prioritize testing lower model thinking levels over higher thinking levels. Adjust to higher thinking level models only if lower thinking levels are struggling with the use case or generating inconsistent or inaccurate outputs.
- If lower cost models or model thinking levels are struggling with the use case or generating inconsistent or inaccurate outputs, consider adjusting to higher cost models or thinking level models.
- During testing, make sure to balance the reliability and accuracy with token usage and invocation duration.
- Each use case may have a different optimal model and thinking level. We recommend thoroughly testing to check for consistent quality without timeouts.

### Rate limits

The following rate limits apply per workspace:

- **Braze-powered model:** 1,000 invocations per minute 
- **Bringing your own API key:** 2,500 invocations per minute 

## Writing instructions

Instructions are the rules or guidelines you give the agent (system prompt). They define how the agent should behave each time it runs. System instructions can be up to 25 KB.

Here are some general best practices to get you started with prompting:

1. Start with the end in mind. State the goal first.
2. Give the model a role or persona ("You are a ...").
3. Set clear context and constraints (audience, length, tone, format).
4. Ask for structure ("Return JSON/bullet list/table...").
5. Show, don't tell. Include a few high-quality examples.
6. Break complex tasks into ordered steps ("Step 1... Step 2...").
7. Encourage reasoning ("Think through the steps internally, then provide a concise final answer," or "briefly explain your decision").
8. Pilot, inspect, and iterate. Small tweaks can lead to big quality gains.
9. Handle the edge cases, add guardrails, and add refusal instructions.
10. Measure and document what works internally for reuse and scaling.

For inspiration on how to write agent instructions, see our dedicated [use case library for Braze Agents](https://www.braze.com/docs/user_guide/brazeai/agents/use_cases).

### Using Liquid

Including [Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/) in your agent's instructions can add an extra layer of personalization in its response. You can specify the exact Liquid variable the agent gets and can include it in the context of your prompt. For example, instead of explicitly writing "first name", you can use the Liquid snippet `{{${first_name}}}`:


```
Tell a one-paragraph short story about this user, integrating their {{${first_name}}}, {{${last_name}}}, and {{${city}}}. Also integrate any context you receive about how they are currently thinking, feeling, or doing. For example, you may receive {{context.${current_emotion}}}, which is the user's current emotion. You should work that into the story.
```


In the **Logs** section of the **Agent Console**, you can review the details for the agent's input and output to understand what value is rendered from the Liquid.

![The details for an agent that has Liquid in its instructions.](https://www.braze.com/docs/assets/img/ai_agent/using_liquid_example.png?7f3f7b313686fe11fcd0cf8d860600d5){: style="max-width:50%;"}

For catalog agents, use **Fields** in the **Output** section rather than JSON schema; you can still write instructions that ask the model for key-value output matching those field names.

For more details on prompting best practices, refer to guides from the following model providers:

- [OpenAI](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api)
- [Anthropic](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)
- [Gemini](https://support.google.com/a/users/answer/14200040?hl=en)

## Outputs

### Basic schemas

Basic schemas are a simple output that an agent returns. This can be a string, a number, a boolean, an array of strings, or an array of numbers.

For example, if you want to collect user sentiment scores from a simple feedback survey to determine how satisfied your customers are after receiving a product, you can select **Number** as a basic schema to structure the output format.

**Important:**


Arrays are only available for Canvas agents, not catalog agents.



![Agent Console with number selected as a basic schema.](https://www.braze.com/docs/assets/img/ai_agent/basic_schema.png?35a2c3c0243513030e03601950791fd6){: style="max-width:85%;"}

### Advanced schemas

Advanced schema options include manually structuring fields or using JSON.

- **Fields:** A no-code way to enforce an agent output that you can use consistently.
- **JSON:** A code approach to creating a precise output format, where you can nest variables and objects within the JSON schema. Only available for Canvas agents, not catalog agents.

We recommend using advanced schemas when you want the agent to return a data structure with multiple values defined in a structured manner, rather than a single-value output. This allows the output to be better formatted as a consistent context variable.

For example, you may use an output format within an agent that is intended to create a sample travel itinerary for a user based on a form they submitted. The output format allows you to define that every agent response should come back with values for `tripStartDate`, `tripEndDate`, and `destination` values. Each of these values can be extracted from context variables and placed in a Message step for personalization using Liquid.




If you want to format responses to a simple feedback survey to determine how likely respondents are to recommend your restaurant's newest ice cream flavor, you can set up the following fields to structure the output format:

| Field name | Value |
| --- | --- |
| **likelihood_score** | Number |
| **explanation** | String |
| **confidence_score** | Number |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Advanced schemas" }

![Agent Console showing three output fields for likelihood score, explanation, and confidence score.](https://www.braze.com/docs/assets/img/ai_agent/output_format_fields.png?2b47a397d346fe87faad4d35a40f11b4){: style="max-width:85%;"}




If you want to collect user feedback for their most recent dining experience at your restaurant chain, you can select **JSON Schema** as the output format and insert the following JSON to return a data object that includes a sentiment variable and reasoning variable.

```json
{
  "type": "object",
  "properties": {
    "sentiment": {
      "type": "string"
    },
    "reasoning": {
      "type": "string"
    }
  },
  "required": [
    "sentiment",
    "reasoning"
  ]
}
```




## Catalogs and fields

Choose specific catalogs for an agent to reference and to give your agent the context it needs to understand your products and other non-user data when relevant. Agents use tools to find the relevant items only and send those to the LLM to minimize token use.

![The "restaurants" catalog and "Loyalty_Program" column selected for the agent to search.](https://www.braze.com/docs/assets/img/ai_agent/search_catalog.png?22c9c43da8f153c8e064ca038154ea88){: style="max-width:75%;"}

## Segment membership context

You can select up to five segments for the agent to cross-reference each user's segment membership against when the agent is used in a Canvas. Let's say your agent has segment membership selected for a "Loyalty Users" segment, and the agent is used in a Canvas. When users enter an Agent step, the agent can cross-reference if each user is a member of each segment you specified in the agent console, and use each user's membership (or non-membership) as context for the LLM.

![The "Loyalty Users" segment selected for agent membership access.](https://www.braze.com/docs/assets/img/ai_agent/segment_membership_context.png?7ca4cc3418fc85c55cc6fcf939e4132c){: style="max-width:75%;"}

## Brand guidelines

You can select [brand guidelines](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/brand_guidelines/) for your agent to adhere to in its responses. For example, if you want your agent to generate SMS copy to encourage users to sign up for a gym membership, you can use this field to reference your predefined bold, motivational guideline.

## User-specific interaction history {#user-history}

A user's interaction data includes their recent campaign and Canvas opens, clicks, and conversion data. For example, you can include this context for an agent to reference when it's evaluated in Canvas. User-specific interaction history can also help influence an agent when its job is to write personalized message copy.

## Duplicate agents

To test improvements or iterations of an agent, you could duplicate an agent then apply changes to compare to the original. You can also treat duplicating agents as version control to track variations in the agent's details and any impacts on your messaging. To duplicate an agent:

1. Hover over the agent's row and select the <i class="fas fa-ellipsis-vertical"></i> menu.
2. Select **Duplicate**.

## Archive agents

As you create more custom agents, you can organize the **Agent Management** page by archiving agents that aren't actively being used. To archive an agent:

1. Hover over the agent's row and select the <i class="fas fa-ellipsis-vertical"></i> menu.
2. Select **Archive**.

![Agent Management page with archived agents.](https://www.braze.com/docs/assets/img/ai_agent/archived_agents.png?a04f8674464d60fd28fe0ca346a5d2d7)
