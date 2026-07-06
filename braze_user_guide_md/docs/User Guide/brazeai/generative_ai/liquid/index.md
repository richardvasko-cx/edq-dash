# Generate Liquid code with BrazeAI

> The BrazeAI<sup>TM</sup> Liquid Assistant is a chat assistant powered by BrazeAI<sup>TM</sup> that helps generate the Liquid you need to personalize message content.

## About the BrazeAI<sup>TM</sup> Liquid assistant

The BrazeAI<sup>TM</sup> Liquid Assistant is designed to help you write effective Liquid code tailored to your marketing needs. Trained on both Liquid syntax and how marketers utilize Liquid in their messages, our AI understands the nuances of crafting personalized content.

Additionally, by providing the BrazeAI<sup>TM</sup> Liquid Assistant your custom attribute names (such as “favourite_color”) and data types (such as boolean and string), our BrazeAI<sup>TM</sup> Liquid Assistant ensures your messages are precisely targeted and aligned with your goals. Additionally, if you create Brand Guidelines, the BrazeAI<sup>TM</sup> Liquid Assistant may use Brand Guidelines to better personalize the outputs generated and to customize content to our own brand voice. The Brand Guidelines you create will only be used to personalize content for your own use.

## Supported channels

You can use the BrazeAI<sup>TM</sup> Liquid Assistant when creating: 
- SMS messages
- Push notifications
- HTML email messages
- Canvases

**Note:**


The assistant works on email messages and not templates. It works best on email messages that are already built.



## Generating Liquid code

To launch the BrazeAI<sup>TM</sup> Liquid assistant, select the AI assistant icon in the message composer.

![Message composer with the AI assistant.](https://www.braze.com/docs/assets/img/ai_liquid/ai_assistant_icon.png?c484bc6e26f2a335b3c5989a19c0b107){: style="max-width:50%;"}

You can choose one of the included prompts or enter your own into the textbox.



The **Use app activity** prompt generates Liquid code to help you send different messages based on when your app was last used. You may be asked follow-up questions so the assistant can generate a more accurate result.

![Example output of the "Use app activity" prompt.](https://www.braze.com/docs/assets/img/ai_liquid/use_app_activity.png?349b7b4efff9a9ff3af00aee20ab809f){: style="max-width:45%;"}



This prompt will generate Liquid code that sends a message with how much time until an event happens. It will ask you to provide details about the event date and time.

![Example output of the "Add countdown" prompt.](https://www.braze.com/docs/assets/img/ai_liquid/add_countdown.png?75c3fa0ec36b11d4d104af6a6d8ce729){: style="max-width:45%;"}



This prompt appears when there is content in your message box. It generates a list of options you can choose from to personalize your message with Liquid. 

![Example output of the "Inspire me" prompt.](https://www.braze.com/docs/assets/img/ai_liquid/inspire_me.png?0a42cb50037b88858d2ee5bba05a0243){: style="max-width:45%;"}



This prompt appears when there is content in your message composer. Select it when you want the assistant to make your code more efficient and easier to read.

![Example output of the "Improve my Liquid" prompt.](https://www.braze.com/docs/assets/img/ai_liquid/improve_my_liquid.png?343a41053fc77108bd5641cdbd6d6848){: style="max-width:45%;"}



To generate your Liquid code, select **Update composer**.

![AI assistant window with provided prompts.](https://www.braze.com/docs/assets/img/ai_liquid/ai_assistant_window.png?0f88049d0d25eed8610e044df94e1a5e){: style="max-width:50%;"}
 
You can generate another message using the same prompt by selecting **Regenerate**. To remove the message and revert to your previous one, select **Undo update**.

## Liquid attributes {#supported-attributes}

The following attributes are currently in beta for the BrazeAI<sup>TM</sup> Liquid Assistant:

| Criterion | Knowledge type | 
| - | - | 
| Liquid (including `for` loops, `if` statements, math, and others) | Coding |
| Default and standard user attributes | Attributes |
| Custom attributes that have any of these data types: {::nomarkdown}<ul><li>Booleans</li><li>Numbers</li><li>Strings</li><li>Arrays</li><li>Time</li></ul>{:/} | Attributes |
| Connected Content | Coding |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Liquid attributes" }

## Best practices

For help writing effective prompts for the BrazeAI<sup>TM</sup> Liquid Assistant, check out our best practices:

### Use natural language

The BrazeAI<sup>TM</sup> Liquid Assistant is trained to understand natural language. Chat with it as you would with a coworker when asking for help. This makes it easier for the assistant to comprehend your needs and provide accurate assistance.

### Give context

Providing context helps the BrazeAI<sup>TM</sup> Liquid Assistant understand the bigger picture surrounding your project. It's helpful to include context such as:

- Your company name and industry
- A campaign you're working on, such as Black Friday or holiday sales
- Your goal, such as increasing your click-through rate
- Specific custom attributes you want to include in your message

Including context in your prompt helps the assistant tailor its responses to better suit your needs. You can also include details from your campaign, message brief, or brainstorming document to bring the assistant up to speed.

### Be specific

The BrazeAI<sup>TM</sup> Liquid Assistant can ask follow-up questions, but providing details upfront can lead to more precise results sooner. Consider including details such as:

- Any known preferences or requirements for the message
- Instructions on how to handle situations, such as a lack of responses from the message recipient or fallback message options
- When asking for Liquid that uses Connected Content, documentation for the API endpoint, a sample API response, or both

### Get creative

Think outside the box with your prompts to see how the BrazeAI<sup>TM</sup> Liquid Assistant can enhance your messaging. Experiment with different prompts and ideas, as creativity can lead to more engaging results.

## Example prompts

Here's some examples to help get you started:



- What is Liquid, and how can it help me enhance the personalization of my marketing campaigns within Braze?
- What types of data can I use in Liquid to personalize my marketing messages, such as demographic information or past purchases?



- Create a message that shows different content based on my customer’s loyalty status. If we don’t know about their loyalty status, send a fallback message.
- Write a dynamic message that includes a user’s favorite product and their last purchase date. If there’s no last purchase, abort the message.
- Write me Liquid to encourage someone to click my message that includes a countdown with how much time is left. If the offer has expired, abort the message.
- Help me write a message to encourage users to come back and check out if they have items remaining in their cart.
- Write Liquid to personalize a message based on a customer’s country. I want to fill in the message with the country’s name. If we don’t have either of them, suggest they click on a link to update their profile.
- How can I personalize a welcome message with a user’s first name and write different copy based on the user’s gender?
- Write Liquid to display different messages based on a custom attribute, “CUSTOM_ATTRIBUTE_NAME“ and its value. There are six different options I could send. If there’s no value for the custom attribute, I want to send a placeholder message.



- Can you give me some examples of how Liquid is used in marketing campaigns to increase engagement and conversion rates?
- What are some common use cases for Liquid in text messages for summer sales, such as abandoned cart reminders or personalized promotions?



**Tip:**


Let us know if you had any interesting prompts or experiences by booking a [feedback session](https://research.rallyuxr.com/braze/schedule/clxxhw8em0d071ak4b279553s?channel=share) with us.



## How is my data used and sent to OpenAI? {#ai-policy} 
<!-- Braze Legal must approve any changes to this content. -->
<!-- Note: Keep these comments under this H2 heading to avoid breaking how headings on certain pages are rendered. -->

To generate AI output through BrazeAI features that leverage OpenAI (“Output”), Braze will send certain information (“Input”) to OpenAI. Input consists of your prompts, and may include the content displayed in the dashboard, and other workspace data relevant to your queries, as applicable. Per [OpenAI’s API platform commitments](https://openai.com/enterprise-privacy/), data sent to OpenAI’s API via Braze is not used to train or improve OpenAI models. OpenAI may retain data for 30 days for abuse monitoring purposes, after which it is deleted. Between you and Braze, Output is your intellectual property. Braze will not assert any claims of copyright ownership on such Output. Braze makes no warranty of any kind with respect to any AI-generated content, including Output.

