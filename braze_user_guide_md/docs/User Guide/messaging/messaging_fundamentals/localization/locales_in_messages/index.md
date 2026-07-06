# Multi-language messages

> After adding locales to your workspace, you can target users in different languages all within a single push, email, banner, in-app message, or Content Block.

## Prerequisites

Watch the following video for an optional overview of setting up and using multi-language messages.

<iframe width="560" height="315" src="https://www.youtube.com/embed/" title="Video" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="media_embed "></iframe>
















| Feature | Required user permissions |
| --- | --- |
| Message&nbsp;types | You need these permissions to add locales and translations to campaigns and Canvases:<br><br> <ul><li>Edit Campaigns</li><li>Edit Canvases</li></ul>{:/} |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites"}




| Feature | Required user permissions |
| --- | --- |
| Templates | You need these permissions for the template type you want to add locales and translations to:<br><br> <ul><li>Edit Email Templates</li><li>Edit IAM Templates</li><li>Edit Content Block Templates</li></ul>{:/} |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites" }




## Use locales

### Step 1: Set up locales

Before you can add translations to a message, you must first [create the locales you want to support](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/multi_language_settings/). Locales define the language (and optionally region) variants available for messaging. 

### Step 2: Mark content for translation

Wrap text you want to translate with the Liquid translation tags `{% translation your_id_here %}` and `{% endtranslation %}` and assign a tag ID. Translation tag IDs must be unique within a message. Consider using semantic ID names that plainly describe the text, such as `{% translation header %}`.

Here is an example message marked for translation: `{% translation greeting %}Hello!{% endtranslation %}`

**Tip:**


Highlight the text you want to translate and use the keyboard shortcut **Cmd + Alt + L** (macOS) or **Ctrl + Alt + L** (Windows) to wrap in translation tags.<br><br> This shortcut works in all channels that support multi-language messaging except for the drag-and-drop editors for email and Content Blocks. For those, use the **Add personalization** button in the left sidebar to add translation tags.



#### Localize URLs

When translating content, URLs require special handling to prevent broken links. 

##### Standard (static) URLs

Static URLs are entered manually in the editor (for example, `https://example.com`). We also recommend the following:

| Recommendation | Reasoning |
| --- | --- |
| Keep the protocol (`https://`) outside of translation tags. Wrap only the domain and path (for example, `example.com/en`). | Translators may accidentally alter or remove special characters, causing broken links. |
| Do not include query parameters inside translation tags (for example, `?utm_source=promo`). | Translators may accidentally alter or remove special characters, resulting in broken links. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Standard (static) URLs" }

A standard URL that follows both recommendations is:


```
<a href="https://{% translation id_1 %}example.shop.com{% endtranslation %}">Visit our store</a>
```


##### Liquid-generated URLs

If your URL is generated with Liquid (for example, `{% landing_page_url %}`), we recommend the following:

| Recommendation | Reasoning |
| --- | --- |
| Wrap the Liquid-generated URL in translation tags only if it must be localized. | Liquid syntax must be carefully preserved to render correctly. |
| Do not include query parameters (for example, `?utm_source=promo`) inside translation tags.  | Translators may accidentally alter or remove special characters, resulting in broken links. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Liquid-generated URLs" }

A Liquid-generated URL that follows both recommendations is:


```
<a href="{% translation id_1 %}{% landing_page_url xyz %}{% endtranslation %}">View details</a>
```


**Important:**


If you are using [email link tracking](#email-link-tracking) (link aliasing or link templates), additional configuration is required when URLs are wrapped in translation tags.



#### HTML attributes and structure

Only wrap human-readable text in translation tags. Avoid wrapping HTML attributes (such as `class`, `style`, or `id`) or other structural code. HTML attributes control layout, styling, and functionality. Wrapping them in translation tags can break formatting or styles in localized versions of your message.

This text is correctly wrapped:


```
<p class="headline" style="color: red;">
  {% translation id_1 %}Welcome to our sale{% endtranslation %}
</p>
```


**Incorrectly wrapped text**



This text is **incorrectly** wrapped:


```
{% translation id_1 %}
<p class="headline" style="color: red;">
  Welcome to our sale
</p>
{% endtranslation %}
```





### Step 3: Add locales to your message

After adding translation tags to your message, select **Manage languages** in the editor (**Languages** in the drag-and-drop editors for email and Content Blocks) and select at least one locale you want to add translations for.

![The Add locale dropdown with options to select the default locale or custom attributes.](https://www.braze.com/docs/assets/img/multi-language_support/select_locale_type.png?e468b34115905696cc61ddc3ad6167db){: style="max-width:70%;"}

#### Content Blocks containing translation

If your message contains Content Blocks that already have translations saved, you do not need to re-upload those translations. Saved translations are automatically applied when the Content Block is added to your message.

In the **Manage languages** modal, Content Blocks with saved translations appear in the list, alongside the locales they support. This allows you to see which parts of your message are already localized before adding new translations.

![The Manage languages section with a list of Content Blocks that have saved translations.](https://www.braze.com/docs/assets/img/multi-language_support/content_blocks_translations.png?ce0711070c9919995a0af63f405ae452){: style="max-width:70%;"}

**Important:**


Make sure each Content Block includes translations for every locale added to your message. If a Content Block is missing translations for one of the locales you added, it shows in its original language for users in that locale.



### Step 4: Add translations

After selecting locales, add translations to your message using one of the following methods:

![The Add translations tab with options to upload translations by CSV or by connecting to translation partners.](https://www.braze.com/docs/assets/img/multi-language_support/add_translations.png?78a79e415522228bc0fe83a86159b3ff){: style="max-width:70%;"}




Select **Download template** to download a CSV containing a matrix of your selected translation IDs and locales. Enter translations for each locale. Upload the completed file and translations will be applied to your message. 

**Important:**


To prevent display issues with non-English characters, avoid using Excel for your translation CSV.



![CSV with translation tags for a title, offer text, offer amount, and CTA.](https://www.braze.com/docs/assets/img/multi-language_support/csv_template_example.png?763a9fc513b36d65d7a801fa163a32f5){: style="max-width:50%;"}




Use a partner translation API to manage and update translations in your campaigns and Canvases. This is useful if you use an external system for localization or want to directly connect with a translation partner.

To use the translations endpoints with Canvases, include the following parameters:
  - `workflow_id`
  - `step_id`
  - `message_variation_id` 

**Note:**


When using the translation API with Canvas steps that were created after the Canvas launched, the `message_variation_id` that you pass into the API will be empty or blank.






### Step 5: Preview translations

To preview your message, select the **Multi-Language User** option from the **Preview as User** dropdown. This lets you switch between different locale definitions to preview all translations of your message.

![Locale previews](https://www.braze.com/docs/assets/img/multi-language_support/multi_language_user_preview.png?f55b1a40baaba6ede110adbbda7cbf8e){: style="max-width:70%;"}

## Manage translations

### Duplicate Canvas steps or campaigns, and translations

When you duplicate a Canvas step, campaign, or variation, translations are included. This is also true when copying across workspaces, so long as the locales are defined in that destination workspace. Be sure to review and update translations accordingly when making modifications to your Canvas or campaign.

### Save translations in Content Blocks

Content Blocks support multi-language in the same way as messages. When creating or editing Content Blocks, you can tag content for translation, add locales, and upload translations using a CSV or the [translation API](https://www.braze.com/docs/api/endpoints/translations/).

Saved translations remain associated with the Content Block. When the block is added to a message, its translations are automatically included.

### Right-to-left messages

When filling in the translation file for languages that are written from right-to-left (like Arabic), wrap the translation with `span` so that it is properly formatted:


```
{% translation your_id_here %}<span dir='rtl'>default text</span>{% endtranslation %}
```


### Email link tracking

In email campaigns, Braze tracks links by adding tracking information (query parameters) to each URL. This behavior supports both [link aliasing](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/link_aliasing/) and [link templating](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/link_template/).

When a URL is wrapped in translation tags, Braze may not be able to determine where to add this tracking information. To ensure this works correctly, you must include a special character at the end of the URL to indicate where tracking should be added.

URLs use two special characters to control how this works:
  - `?` adds tracking to a URL that does not already have it.
  - `&` adds additional tracking if a `?` is already present in the URL. A URL can only contain one `?`.

| URL | Contains&nbsp;`?` | Description | Example |
| --- | --- | --- | --- |
| Standard URL | No | Add `?` after the closing translation tag if the URL does not already contain one. | ```<a href="https://{% translation id_1 %}example.com{% endtranslation %}?">Shop Now</a>``` |
| Standard URL | Yes | Use `&` at the end of the URL (after the closing translation tag) if it already contains `?`. | ```<a href="https://{% translation id_1 %}example.com{% endtranslation %}?ref=4&">Shop Now</a>``` |
| Liquid generated | No | Use `?` after the closing translation tags if the generated URL does not already contain one. | ```<a href="{% translation id_1 %}{{ product_url }}{% endtranslation %}?">Shop Now</a>```  |
| Liquid generated | Yes | Use `&` after the closing translation tag if the generated URL already contains a `?`. | ```<a href="{% translation id_1 %}{% landing_page_url xyz %}{% endtranslation %}&">Shop Now</a>``` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="Email link tracking" }

### Language settings and accessibility {#language-settings-and-accessibility}

Start with [Accessibility language](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/accessibility/#accessibility-language) in [Accessibility](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/accessibility/) for WCAG context, channel and editor behavior (including landing pages), and message-level **Accessibility** settings.

When you use **multi-language messages**, align accessibility language with each locale so localized sends declare the appropriate language.

#### Configure the accessibility language {#configuring-the-accessibility-language}

You can set accessibility language at two levels:

##### Message level

At the message level, set accessibility language in the **Accessibility** section of your message settings. For selecting a language, using Liquid, and limitations by channel, refer to [Accessibility language](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/accessibility/#accessibility-language).

##### Locale level

For multi-language messages, set accessibility language for each locale in **Localization Settings**. You can use `{{accessibility_language}}` in the **Accessibility** section so document or card language maps to those locale values.

Whether that token appears by default for new messages depends on the channel and editor. For example, in-app messages and Banners behave differently from landing pages and drag-and-drop emails. Refer to [Accessibility language](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/accessibility/#accessibility-language) for details.

## Frequently asked questions

#### What are the limits for translation tags?

When using translation tags, the following limits apply:

- Each message can have up to 200 translation tags.
- Each default text (the content between translation tags) can have up to 2,000 characters.
- The translations per locale can have up to 409,600 bytes (approximately 409.6&nbsp;KB).

#### Can I make a change to the translated copy in one of my locales?

Yes. First, make the edit in the CSV, then upload the file again to make a change to the translated copy.

### Does Braze provide translations?

No. You must [provide your own translations](#step-4-add-translations) either by uploading a CSV or using the translation API.

### Can I nest translation tags?

No.

#### Can I wrap entire HTML messages in a translation tag?

No. As a best practice, you should only wrap human-readable text or content that must be localized. This helps prevent broken formatting, links, or other non-text elements.

Additionally, consider wrapping smaller, semantically-related pieces of text to create accurate translations and avoid performance or size limitations.

#### Can I make a change to the translated copy in one of my locales?

Yes. If using a CSV, first make the edit in the file, then upload it again to make a change to the translated copy. If  using the [translation API](https://www.braze.com/docs/api/endpoints/translations/), use the Update endpoints to make changes.

#### What validations or extra checks does Braze do?

| Scenario | Validation in Braze |
| --- | --- |
| A message contains two or more matching translation IDs that map to different text. | This translation file won't be downloaded. |
| A translation file is missing one or more translation tag IDs. | This translation file won't be uploaded. |
| A translation file contains locales that are missing from the message. | This translation file won't be uploaded. |
| Translation tags must be added to a message before downloading the translation template. | This translation file won't be downloaded. |
| Translation tags found in your uploaded file are missing from your message. | Extra translations won't be saved to the message. |
| A message contains one or more broken Liquid tags. To open tags use `{% translation your_id_here %}`, close translation tags with `{% endtranslation %}`. | This translation file won't be downloaded. |
| A translation file contains default text that doesn't match what's in the message. | Translations are added, but original message text is not updated. |
| One or more of the locales in a message have been deleted in settings and no longer exist. | Translations that have already been added continue to exist within the message. If deleted from the message, translations are lost. |
| Translation tags contain full URLs or Liquid-generated URLs. | Translation tags containing URLs are identified in case issues with broken links or link tracking occur. |
| Translation tags include query parameters. | Translation tags containing query parameters are identified in case issues with broken links or link tracking occur. |
| Translation tags contain HTML attributes or structures. | Translation tags containing HTML attributes or structures are identified in case issues with styles and formatting occur. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="What validations or extra checks does Braze do?" }
