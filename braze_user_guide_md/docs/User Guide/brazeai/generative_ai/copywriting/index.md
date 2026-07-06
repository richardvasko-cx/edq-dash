# Generate copy with BrazeAI

> The AI copywriting assistant passes a brief product name or description to a third-party provider GPT copy generation tool owned by OpenAI to generate human-like marketing copy for use in your messaging. This functionality is available by default for most message composers in the Braze dashboard.

## Generating copy

### Step 1: Launch AI copywriter

From your message composer, select <i class="fa-solid fa-wand-magic-sparkles"></i> **Launch AI Copywriter**.

In the drag-and-drop editor for in-app messages, select a text block and select <i class="fa-solid fa-wand-magic-sparkles" title="AI Copywriter"></i> in the block's toolbar.

### Step 2: Enter the details

Enter a product name or description in the input field, then select an approximate output length.

You can choose a specific channel for an output length based on channel-specific best practices or select between short (1 sentence), medium (2-3 sentences), or long (1 paragraph).

### Step 3: Customize it further (optional)

To customize your copy further, you can:

- **Apply brand guidelines:** After [generating brand guidelines with BrazeAI<sup>TM</sup>](https://www.braze.com/docs/user_guide/brazeai/generative_ai/brand_guidelines), you can use them to help generate your copy.
- **Choose a tone:** Each tone will generate copy in a different style. Choose the tone that best matches your brand voice.
  
  Selecting a tone adds a style instruction to the prompt sent to OpenAI, so the exact output can vary by input, channel length, brand guidelines, and the model. 
  
  Here's what each tone is intended to do by default:
  - **Formal:** More professional and polished wording. Full sentences, more courteous language, minimal slang.
  - **Straight-forward:** More direct and concise. Fewer adjectives, less "marketing fluff," clearer calls to action.
  - **Casual:** More relaxed and conversational. Friendlier phrasing, simpler words, lighter energy.
  - **Personal:** More 1:1 and empathetic. Uses "you" more, can feel more tailored, especially if you add personalization like `{{${first_name}}}` to the message you're creating.
  - **Eye-catching:** More attention-grabbing. Punchier phrasing, higher energy, stronger hooks and CTAs (often reads more "promo" than the other tones).
  - **Sophisticated:** More elevated, refined language. Less casual, more "premium" positioning.
  - **Professional:** Businesslike and clear. More modern and approachable than Formal, while still maintaining authority.
  - **Passive:** Softer, less pushy language. Fewer direct commands, more suggestive phrasing.
  - **Urgent:** Emphasizes immediacy and time sensitivity. Stronger CTAs, deadlines, scarcity cues.
  - **Exciting:** More energetic and enthusiastic. Emphasizes positive emotion and celebration (often more hype-focused than Eye-catching's hook-driven approach).
 
  
- **Reference past campaign data**: When enabled, previous mobile push notifications sent through your campaigns or Canvas steps are used for stylistic reference to generate your new copy. For more information, see [Using past campaign data](#past-campaign-data).
- **Auto-translate copy:** You can choose a different output language for your copy. Generated content will be output to that language.

### Step 4: Generate your copy

When you're finished, select **Generate**. We'll use the information you provide to prompt GPT to write copy for you. The response will be fetched from OpenAI and provided to you. For more information, see [How is my data used and sent to OpenAI?](#ai-policy).

![AI copywriting assistant modal showing various features available"](https://www.braze.com/docs/assets/img/ai_copywriter/gpt3.png?871a54f4db5e78121155660039983f5b "GPT3"){: style="max-width:70%;"}

**Important:**


We filter out responses for offensive content that violates OpenAI's [content policy](https://beta.openai.com/docs/usage-guidelines/content-policy).



## About past campaign data {#past-campaign-data}

When using push as your output length, if you select **Reference past campaign data**, randomly selected previous mobile push campaigns will be sent to OpenAI so that GPT can use them as a basis for its copy generation. Currently, the AI copywriter will send push campaigns to OpenAI that do not have Liquid syntax. Leave this box unchecked if you do not want to leverage this ability. See the following sections for more information on how Braze and OpenAI use your data. 

If used in conjunction with a [brand guideline](https://www.braze.com/docs/user_guide/brazeai/generative_ai//brand_guidelines/), both the brand guideline and the past campaign data will be incorporated into the final output.

## How is my data used and sent to OpenAI? {#ai-policy} 
<!-- Braze Legal must approve any changes to this content. -->
<!-- Note: Keep these comments under this H2 heading to avoid breaking how headings on certain pages are rendered. -->

To generate AI output through BrazeAI features that leverage OpenAI (“Output”), Braze will send certain information (“Input”) to OpenAI. Input consists of your prompts, and may include the content displayed in the dashboard, and other workspace data relevant to your queries, as applicable. Per [OpenAI’s API platform commitments](https://openai.com/enterprise-privacy/), data sent to OpenAI’s API via Braze is not used to train or improve OpenAI models. OpenAI may retain data for 30 days for abuse monitoring purposes, after which it is deleted. Between you and Braze, Output is your intellectual property. Braze will not assert any claims of copyright ownership on such Output. Braze makes no warranty of any kind with respect to any AI-generated content, including Output.

