# Agents frequently asked questions

> This article answers frequently asked questions about Braze Agents.

## General

### What is the difference between Canvas Agents and Catalog Agents?

When creating an agent, you specify if you want to create a Canvas Agent or Catalog Agent. This determines the types of instructions and options the agent can support. Canvas Agents process users in real-time within journeys, while Catalog Agents enrich catalog data by adding or updating columns with processed information.

### What are the benefits of using Auto model versus bring-your-own (BYO) model?

Benefits of using the Braze Auto model include:

- Not requiring any retrieval or entry of API keys or integration setup
- Automatic routing of each invocation to the most effective model to do the job

### Where can I find my current agent usage?

Go to **Settings** > **Billing** > **Credits Usage** to see details of your agent usage and credit costs.

### Can I use conditional Liquid statements in agent instructions?

No, attempting to write Liquid blocks like `{% if %} statements can result in a validation error. Agents can handle different scenarios through natural language descriptions in the prompt instead.

### Can agents access user data beyond the specific Liquid attributes or values that I pass to them?

No. Agents only receive the specific user data points that are passed to it using Liquid as well as [resources](https://www.braze.com/docs/user_guide/brazeai/agents/creating_agents/#add-resources) added to agent context. Agents cannot search user’s profiles for attributes that the marketer did not configure them to look for.

## Troubleshooting

### Why did my agent not follow my instructions or rules?

Consider using [Operator](https://www.braze.com/docs/user_guide/brazeai/operator) to troubleshoot why your agent is not following your instructions. Operator can provide step-by-step instructions and detailed explanations.

### My agent is struggling with a complex task. How might I improve its performance? {#subagent-approach}

If you find that the agent is struggling with the tasks you’re asking it to do, consider a sub-agent approach. For example, you could use three agents to do the following:

- Agent 1 standardizes and transforms inbound unstructured Canvas context data.
- Agent 2 references a catalog of item details and identifies which items might be relevant.
- Agent 3 references a different catalog that has a variety of possible descriptions for each item and identifies the item description most relevant to the user to place in an email.

### What might cause a custom agent to frequently time out?

A custom agent may time out if:

- The agent instructions has incomplete or contradictory instructions
- The agent instructions do not cover off on all scenarios or include a fallback condition (such as “If all inputs are blank, output “Could not personalize”)
- The agent instructions ask the agent to output a different output format than the one specified in the **Output** tab (for example, if the agent instructions ask for a string, but in **Output** tab the output is defined as a number)
- The agent's task is too complex and would benefit from a [sub-agent approach](#subagent-approach) instead

## Compliance

### Is Agent Console GDPR/CCPA compliant?

Yes. When a Customer uses Braze Auto model (powered by Gemini), Google will be acting as a Braze Sub-processor, subject to the terms of the Data Processing Addendum (DPA) between the Customer and Braze.

### Is Agent Console HIPAA compliant?

Yes. When using the Braze Auto model, we have a specific HIPAA agreement, the Business Associate Addendum (BAA), with Google covering Gemini, which powers our Auto model.

Our BAA applies only to customers using the Braze Auto model. If customers use their own LLM key, Braze does not send Protected Health Information (PHI) subject to HIPAA to an LLM on their behalf; customers send it directly. In this case, the BAA between Braze and Google does not apply. Data processing via their own LLM key is governed by the customer's contract and any BAA they have directly with their LLM provider.