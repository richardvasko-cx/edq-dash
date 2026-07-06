# Using the Braze MCP server

> Learn how to interact with your Braze data through natural language using tools like Claude and Cursor. For more general information, see [Braze MCP server].

**Important:**


Braze MCP server is in beta. You don't need to request access to use it. Follow the setup instructions to get started. By using the Braze MCP server, you agree to the [Braze Beta Terms](https://www.braze.com/company/legal/beta-terms). To help us make it better, send your feedback to [mcp-product@braze.com](mailto:mcp-product@braze.com).




## Prerequisites

Before you can use this feature, you'll need to [set up the Braze MCP server].

## Best practices

When using the Braze MCP server through natural-language tools like Claude and Cursor, keep these tips in mind to get the best results:

- LLMs can make mistakes, so always be sure to double-check their answers.
- For data analysis, be clear about the time range you need. Shorter ranges often give more accurate results.
- Use exact [Braze terminology](https://www.braze.com/resources/articles/glossary) so your LLM calls the right function.
- If results seem incomplete, prompt your LLM to continue or dig deeper.
- Try creative prompts! Depending on your MCP client, you may be able to export a CSV or other useful files.

## Usage examples

After [setting up the Braze MCP server], you can interact with Braze through natural language using tools like Claude or Cursor. Here's some examples to get you started:

### What are my available Braze functions?



!['What are my available Braze functions?' being asked and answered in Claude.](https://www.braze.com/docs/assets/img/mcp_server/claude/what_are_my_available_braze_functions.png?3c01fb7977ba5f52c0f9ca3db3b28ec6){: style="max-width:85%;"}



!['What are my available Braze functions' being asked and answered in Cursor.](https://www.braze.com/docs/assets/img/mcp_server/cursor/what_are_my_available_braze_functions.png?a7bb97c2f1daab42ce7a140e4f769816)



For more information on the `list_functions` function, see [Available API functions].

### Get details about a Canvas ID



!['Get details about a canvas ID' being asked and answered in Claude.](https://www.braze.com/docs/assets/img/mcp_server/claude/get_details_about_a_canvas_id.png?89c549f37505ff9379dc815e3603a6b3){: style="max-width:85%;"}



!['Get details about a canvas ID' being asked and answered in Cursor.](https://www.braze.com/docs/assets/img/mcp_server/cursor/get_details_about_a_canvas_id.png?804569457849da6dad769b23ba38c354)



For more information on the `get_canvas_details` function, see [Available API functions].

### Show me my recent Canvases



!['Show my recent canvases' being asked and answered in Claude.](https://www.braze.com/docs/assets/img/mcp_server/claude/show_my_recent_canvases.png?c272aa8831f6f1374b36d29a47ec1576){: style="max-width:85%;"}



!['Show my recent canvases' being asked and answered in Cursor.](https://www.braze.com/docs/assets/img/mcp_server/cursor/show_me_my_recent_canvases.png?ce37e194fed83980ba444c978ccf0d0d)



For more information on the `get_canvas_list` function, see [Available API functions].

### Create an email template



!['Create an email template' being asked and answered in Cursor.](https://www.braze.com/docs/assets/img/mcp_server/cursor/create_an_email_template.png?7eaf95b3ae3a2b7631c48b7721b87330)



For more information on the `create_email_template` function, see [Available API functions].

### Update a content block



!['Update a content block' being asked and answered in Cursor.](https://www.braze.com/docs/assets/img/mcp_server/cursor/update_a_content_block.png?ef5ddb03443eb53df82b6b10bf9460e3)



For more information on the `update_content_block` function, see [Available API functions].

## Disclaimer
<!-- Braze Legal must approve any changes to this content. -->
<!-- Note: Keep these comments under this H2 heading to avoid breaking how headings on certain pages are rendered. -->

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) is a newly introduced open-source protocol that may be susceptible to security issues or vulnerabilities at this time.

Braze MCP Server setup code and instructions are provided by Braze “as is” and without any warranties, and customers use it at their own risk. Braze shall not be responsible for any consequences arising from improper setup, misuse of the MCP, or any potential security issues that may arise. Braze strongly encourages customers to review their configurations carefully and to follow the outlined guidelines to reduce risks associated with the integrity and security of their Braze environment.

For assistance or clarification, please contact [Braze Support](https://www.braze.com/docs/user_guide/administrative/access_braze/support).


