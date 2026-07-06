# The Braze MCP server

> Learn about the Braze MCP server, a secure connection that lets AI tools like Claude and Cursor access non-PII Braze data to answer questions, analyze trends, and provide insights.

**Important:**


Braze MCP server is in beta. You don't need to request access to use it. Follow the setup instructions to get started. By using the Braze MCP server, you agree to the [Braze Beta Terms](https://www.braze.com/company/legal/beta-terms). To help us make it better, send your feedback to [mcp-product@braze.com](mailto:mcp-product@braze.com).




## What is Model Context Protocol (MCP)?

​​Model Context Protocol, or MCP, is a standard that lets AI agents connect to and work with data from another platform. It has two main parts:

- **MCP client:** The application where the AI agent runs, such as Cursor or Claude.
- **MCP server:** A service provided by another platform, like Braze, that defines which tools the AI can use and what data it can access.

## About the Braze MCP server

After [setting up the Braze MCP server], you can connect AI tools like agents, assistants, and chatbots directly to Braze, allowing them to read aggregated data such as Canvas and Campaign analytics, custom attributes, segments, and more. The Braze MCP server is great for:

- Building AI-powered tools that need Braze context.
- CRM engineers creating multi-step agent workflows.
- Technical marketers experimenting with natural language queries.

The Braze MCP server includes both read-only and write endpoints. They do not return data from Braze user profiles. You choose which endpoints to assign to your Braze API key, and that choice controls what an agent can read, create, or update. For the full list of available endpoints and their required permissions, see [Available API functions].

**Warning:**


Only assign the API key permissions you want your agent to have. If you don't want your agent to make changes in Braze, leave any write permissions off when you create your API key. Agents may try to write data through any write permission you grant.



## Usage example

You can interact with Braze through natural language using tools like Claude or Cursor. For other examples and best practices, see [Using the Braze MCP server].



!['What are my available Braze functions?' being asked and answered in Claude.](https://www.braze.com/docs/assets/img/mcp_server/claude/what_are_my_available_braze_functions.png?3c01fb7977ba5f52c0f9ca3db3b28ec6){: style="max-width:85%;"}



!['What are my available Braze functions' being asked and answered in Cursor.](https://www.braze.com/docs/assets/img/mcp_server/cursor/what_are_my_available_braze_functions.png?a7bb97c2f1daab42ce7a140e4f769816)



## Frequently Asked Questions (FAQ) {#faq}

### Which MCP clients are supported?

Only [Claude](https://claude.ai/) and [Cursor](https://cursor.com/) are officially supported. You must have an account for one of these clients to use the Braze MCP server.

### What Braze data can my MCP client access?

MCP clients can access endpoints that don't return PII. You control which endpoints an agent can use through the permissions you assign to your API key.

### Can my MCP client change Braze data?

Yes. The server exposes a focused set of write endpoints that let agents create or update content in your workspace, such as media library assets, email templates, and content blocks. Each write endpoint requires its own API key permission. If you don't want your agent to make a given change in Braze, leave that permission off when you create your API key. For the full list of write functions and their required permissions, see [Available API functions].

### Can I use a third-party MCP server for Braze?

Using a third-party MCP server for Braze data is not recommended. Only use the official Braze MCP server hosted on [PyPi](https://pypi.org/project/braze-mcp-server/).

### Why doesn't the Braze MCP server offer PII access?

To protect user data while supporting valuable use cases, the server is limited to endpoints that don't typically return PII. This reduces risk for your workspace and the people in it.

### Can I reuse my API keys?

No. You'll need to create a new API key for your MCP client. Remember to only give your AI tools access to what you’re comfortable with, and avoid elevated permissions.

### Is the Braze MCP server hosted locally or remotely?

The Braze MCP server is hosted locally.

### Why is Cursor only listing functions?

Check if you're in ask mode or agent mode. To use the MCP server, you need to be in agent mode.

### What do I do when the agent returns an answer that looks incorrect?

When working with tools like Cursor, you may want to try changing the model used. For example, if you have it set to auto, try changing it to a specific model and experiment to find which model performs best for your use case. You can also try starting a new chat and retrying the prompt. 

If issues persist, you can email us at [mcp-product@braze.com](mailto:mcp-product@braze.com) to let us know. If possible, include a video and expand the call functions so we can see what calls the agent attempted.

## Disclaimer
<!-- Braze Legal must approve any changes to this content. -->
<!-- Note: Keep these comments under this H2 heading to avoid breaking how headings on certain pages are rendered. -->

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) is a newly introduced open-source protocol that may be susceptible to security issues or vulnerabilities at this time.

Braze MCP Server setup code and instructions are provided by Braze “as is” and without any warranties, and customers use it at their own risk. Braze shall not be responsible for any consequences arising from improper setup, misuse of the MCP, or any potential security issues that may arise. Braze strongly encourages customers to review their configurations carefully and to follow the outlined guidelines to reduce risks associated with the integrity and security of their Braze environment.

For assistance or clarification, please contact [Braze Support](https://www.braze.com/docs/user_guide/administrative/access_braze/support).


