# Content QA with BrazeAI

> Learn how to QA your content with BrazeAI<sup>TM</sup>, so you can catch spelling errors, grammar issues, inappropriate tone, or offensive language&#8212;before hitting send.

## Supported features

The following features are supported to help improve the quality of your content:

| Feature                     | Description |
|----------------------------|-------------|
| Spelling and grammar check | Automatically checks for spelling and grammar mistakes in your message. It suggests corrections and provides recommendations to improve the overall accuracy of the content. |
| Tone analysis              | Evaluates the tone of the message to identify any potential issues. It helps ensure that the intended tone aligns with the desired communication style and helps avoid misunderstandings or unintended offenses. |
| Offensive language detection | Scans your message for any potentially offensive or inappropriate language, allowing you to revise your content and maintain respectful communication. |
| Accidental content check   | Detects any inclusion of code, markup language, or test messages that might have been added unintentionally, including any Liquid code that didn't render for a test user. |
| Multi-language support     | Although not officially supported by OpenAI, GPT can understand [multiple languages](https://openai.com/research/gpt-4#:~:text=GPT%2D4%203%2Dshot%20accuracy%20on%20MMLU%20across%20languages). Keep in mind that Braze doesn't pass any information about the language or locale of your copy when it's sent to OpenAI, so your results may vary depending on the language you're writing in. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Supported features" }

## Using BrazeAI<sup>TM</sup> to QA content

**Note:**


This feature is only available for SMS, Android push, iOS push, and traditional in-app messages at this time.



1. After composing a mobile push, SMS, or traditional in-app message, navigate to the **Test** tab.
2. Locate the **Content QA with AI** section.
3. Click **Test Content**.

![Content QA with AI section of the Test tab.](https://www.braze.com/docs/assets/img/content_qa_ai.png?4c2de5eb0be31e21b3faddc30e1704df)

## Best practices

Consider the following, so you can make the most of Content QA with AI:

- **Proofread your message:** Although the content checker can help identify errors, it is still essential to proofread your content manually. Rely on the AI-generated suggestions as a helpful guide, but use your judgment to ensure accuracy.
- **Understand the tone analysis:** The tone analysis results are subjective and based on the AI model's understanding. While they can provide useful insights, consider your intended tone and the conversation context to make appropriate adjustments.
- **Double-check flagged offensive language:** Offensive language detection is designed to be robust, but it may occasionally flag false positives. Review flagged sections carefully and make appropriate changes as necessary.

## How is my data used and sent to OpenAI? {#ai-policy} 
<!-- Braze Legal must approve any changes to this content. -->
<!-- Note: Keep these comments under this H2 heading to avoid breaking how headings on certain pages are rendered. -->

To generate AI output through BrazeAI features that leverage OpenAI (“Output”), Braze will send certain information (“Input”) to OpenAI. Input consists of your prompts, and may include the content displayed in the dashboard, and other workspace data relevant to your queries, as applicable. Per [OpenAI’s API platform commitments](https://openai.com/enterprise-privacy/), data sent to OpenAI’s API via Braze is not used to train or improve OpenAI models. OpenAI may retain data for 30 days for abuse monitoring purposes, after which it is deleted. Between you and Braze, Output is your intellectual property. Braze will not assert any claims of copyright ownership on such Output. Braze makes no warranty of any kind with respect to any AI-generated content, including Output.

