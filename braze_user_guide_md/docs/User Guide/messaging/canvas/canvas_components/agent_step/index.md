# Agent step  

> The Agent step lets you add AI-powered decisioning and content generation directly into your Canvas workflow. For more general information, see [Braze Agents](https://www.braze.com/docs/user_guide/brazeai/agents/). 

![An Agent step in a Canvas user journey.](https://www.braze.com/docs/assets/img/ai_agent/agent_step.png?bf56890a04f391a2cc39dbc3927f7e1d){: style="float:right;max-width:30%;margin-left:15px;"}

## Prerequisites

Agent steps use [Canvas context variables](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/sources/context_variables/) to ingest relevant context and output a variable that can be leveraged in the Canvas.

## How it works

When a user reaches an Agent step in a Canvas, Braze sends the input data you’ve configured (full context or selected fields) to your chosen agent. The agent then processes the input using its model and instructions, and returns an output. That output is stored in the output variable you defined in the step.

You can then use this variable in three main ways:

- **Decisioning:** Route users down different Canvas paths based on the agent’s response. For example, a lead scoring agent might return a lead category of "Sales Ready", "Marketing Qualified", or "Disqualified". You might use this assignment to trigger a Slack alert or automated message for "Sales Ready" leads while dropping "Disqualified" leads from the journey.
- **Personalization:** Insert the agent’s response directly into a message. For example, an agent could analyze customer feedback and generate an empathetic follow-up email that references the customer’s comment and suggests a resolution.
- **Processing user data:** Analyze and standardize your user data, then store it on the user profile or send it using a webhook. For example, an agent could return a sentiment score or product affinity assignment. You can store that data in a user profile for future usage.

## Creating an Agent step

### Step 1: Add a step

Drag and drop the **Agent** component from the sidebar, or select the <i class="fas fa-plus-circle"></i> plus button at the bottom of a step and select **Agent**.  

### Step 2: Choose your agent  

Select the agent that will process data in this step. Choose an existing agent. For setup guidance, see [Create custom agents](https://www.braze.com/docs/user_guide/brazeai/agents/creating_agents/).

### Step 3: Set your agent's output {#define-the-output-variable}

Agent outputs are called "output variables" and are stored in a [context variable](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/context#context-variable-types) for easy access. To define the output variable, give the variable a name.

Note that the output variable's data type is set from the [Agent Console](https://www.braze.com/docs/user_guide/brazeai/agents). Agent outputs can be saved as strings, numbers, booleans, or objects. This makes them flexible for both text personalization and conditional logic in your Canvas. Here are some common uses for each type:

| Data type | Common uses |
| --- | --- |
| String | Message personalization (subject lines, copy, responses) |
| Number | Scoring, thresholds, routing in [Audience Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/audience_paths/) |
| Boolean | Yes/No branching in [Decision Splits](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/decision_split/) |
| Object | Leverage one or more of the above data types with a single LLM call in a predictable data structure |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Step 3: Set your agent's output #define-the-output-variable" }

You can use an output variable throughout the Canvas by using the same template syntax as you would with a context variable. Either use the **Context Variable** segment filter, or template agent responses directly using Liquid: `{{context.${response_variable_name}}}` .

To use a specific property from an object output variable, use dot notation to access that property using Liquid: `{{context.${response_variable_name}.field_name}}`

![Agent step for Body HTML Writer with an object data type output for the variable "agent_output".](https://www.braze.com/docs/assets/img/ai_agent/test_agent_step.png?56c0e1eda5e8be3e86177f805ab73fc5){: style="max-width:80%;"}

### Step 4: Add any additional context (optional)

You can decide to include additional context values for the agent step to reference when it runs. You can enter any Liquid templated values that you would normally use in a Canvas.

**Note:**


Note that the agent is already automatically receiving the context configured in the **Instructions** section. Liquid variables that were already configured there do not need to be re-entered here.



![The option to add additional context to an Agent step using Liquid.](https://www.braze.com/docs/assets/img/ai_agent/agent_step_context.png?584424bb70a2fe86446d467ec9de99b3){: style="max-width:80%;"}

### Step 5: Test the agent

After setting up your Agent step, you can test and preview the output of this step.

![Preview the agent output as a random user.](https://www.braze.com/docs/assets/img/ai_agent/agent_step_preview.png?ae0e59731575948654e25d88155ed0ed){: style="max-width:80%;"}

## Error handling  

- If the connected model returns a rate limit error, Braze retries up to five times with exponential backoff.  
- If the agent fails for any other reason (such as a timeout error or invalid API key), the output variable is set to `null`.
    - If an agent reaches its daily invocation limit, the output variable is set to `null`. 
- Use [default Liquid values](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/setting_default_values/) to buffer against errors. For example, in the **Add Personalization** modal, you can enter a default Liquid value such as `{{context.${response_variable_name}.push_title | default: 'Hello friend!'}}` or `{{context.${response_variable_name}.push_body | default: 'Open our app to get your prize!'}}`.
- Responses are cached for identical inputs and may be reused for repeated identical invocations within a few minutes.
    - Responses that use cached values do still count toward total and daily invocations.
- Agent steps may take time to process a large batch of users. If you see users who are still pending in this step, check your logs to verify that invocations are happening.

## Analytics  

Refer to the following metrics to track how your Agent steps perform:  

| Metric | Description |
| --- | --- |
| _Entered_ | The number of times users entered the Agent step. |
| _Proceeded to Next Step_ | The number of users that proceeded to the next step in the flow after passing through the Agent step. |
| _Exited Canvas_ | The number of users that exited the Canvas after passing through the Agent step. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Analytics" }

## Best practices

### Split tasks between agents for complicated use cases

If you find that an agent is struggling with the complexity of tasks you’re asking it to do, split the work across more than one Agent step. When one prompt mixes data cleanup, routing logic, and full message writing, those goals compete and output quality can vary.

The following pattern uses three agents for a travel example: someone searched in your app recently but didn’t book, and you want retargeting copy that nudges them toward checkout.

- Agent 1 summarizes Canvas context. It reads fields such as loyalty tier, last city searched, and high-intent search behavior, and returns a short structured summary as an output variable that later steps can reuse.
- Agent 2 returns a routing value your Canvas can branch on. Use a number, boolean, or structured object so the output matches how you branch. Map that value to an [Audience Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/audience_paths/) or [Decision Split](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/decision_split/) step. For example, consider separate paths for loyalty-led messaging versus deal-led messaging.
- Agent 3 drafts generated message text only on branches where you want it. Pass the Agent 1 summary (and any branch-specific context) so this agent focuses on tone and channel limits instead of normalizing inputs and choosing strategy in the same prompt.

### Use the Experiment Paths step to test agentic journeys at small scale

To test your agent's performance and credit consumption against your existing journeys, add an [Experiment Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/experiment_step/) step so only part of your audience enters the branch that contains your Agent step. 

For example, you can start by sending a few thousand users per day down a path with the agent and send the rest to a control path or a path without the agent. Gather data for 1-2 weeks and compare key performance indicators (KPIs), counter-metrics, and agent credit consumption between paths. This way, you can build confidence and prove ROI before you increase traffic to the agent-enabled branch, and limit invocation consumption to do it.

## Frequently asked questions

### When should I use an Agent step?

In general, we recommend using an Agent step when you want to feed particular contextual data into an LLM and have it agentically assign a Canvas context variable intelligently at a scale impossible for humans.

Let’s say you’re sending a personalized message to recommend a new ice cream flavor to a user who previously ordered chocolate and strawberry. Here’s the difference between using an Agent step versus AI item recommendations:

- **Agent step:** Uses LLMs to make a qualitative decision on what the user might want based on the instructions and context data points given to the agent. In this example, an Agent step might recommend a new flavor based on the possibility of the user wanting to try different flavors.
- **AI item recommendations:** Uses machine learning models to predict the products that a user is most likely to want based on past user events, such as purchases. In this example, AI item recommendations would suggest a flavor (vanilla) based on the user’s previous two orders (chocolate and strawberry) and how those compare to the behaviors of other users in your workspace.

### How do Agent steps use input data?

An Agent step analyzes the context data that the agent is configured to use, as well as any additional context that is [provided to the agent](#step-4-add-any-additional-context-optional).

## Related articles  

- [Braze Agents overview](https://www.braze.com/docs/user_guide/brazeai/agents/)  
- [Create custom agents](https://www.braze.com/docs/user_guide/brazeai/agents/creating_agents/)  
- [Deploy agents](https://www.braze.com/docs/user_guide/brazeai/agents/deploying_agents/)  
- [Reference for agents](https://www.braze.com/docs/user_guide/brazeai/agents/reference/)
