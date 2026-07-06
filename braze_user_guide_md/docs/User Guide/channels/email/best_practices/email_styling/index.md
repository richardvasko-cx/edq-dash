# Email styling

> This article outlines email styling best practices, including subject lines, preheader text, email size, and image recommendations.

## Address styling

The subject line is one of the first things that recipients see upon receiving your message. Keeping it to 6 to 10 words yields the highest open rates. 

There are also different approaches to creating a good subject line, ranging from asking a question to pique the reader's interest or being more direct, to personalizing it as to engage your clientele. Don't just stick with one subject line, leverage [A/B testing](https://www.braze.com/docs/user_guide/messaging/ab_testing/#what-are-multivariate-and-ab-testing/) to try new ones out and gauge their effectiveness. Subject lines should be no more than 35 characters to display appropriately on mobile.

The "From" field should clearly show who the sender is. Try not to use a person's name or an uncommon abbreviation. Instead, use a recognizable name like your brand name. If using a person's name suits your brand's methods of personalizing email, stay consistent to develop a relationship with the recipient. The "From" name should be no more than 25 characters to display appropriately on mobile.

### No-reply addresses

No-reply email addresses are generally not recommended for multiple reasons, as they disengage your readers. Many recipients reply to the email to unsubscribe, so if they are not allowed to do that, the next course of action is more often than not marking the email as spam.

Getting out-of-office replies can actually provide valuable information, increasing open rates and decreasing spam reports (by removing those who don't want to be emailed). On a personal level, a no-reply can appear impersonal to recipients and may turn them away from receiving further emails from your company.

## Preheader text

The preheader text in an email communicates the main point of the message efficiently to catch the reader's interest and encourage opens. Preheader text is also often used by email marketers to provide additional information on an email's contents. A preheader is the preview text displayed immediately after an email subject. In the following example, the preheader is `- Brand. New. Lounge Shorts`.

![Preheader text in a Gmail inbox with the text "Brand. New. Lounge Shorts".](https://www.braze.com/docs/assets/img_archive/preheader_example.png?c440148996f7a9a22d5e8b6a5544532a)

The amount of visible preheader text is dependent on the user's email client and the length of the email's subject line. Generally, we suggest email preheaders to be between 50 and 100 characters.

**Note:**


The preheader can reference Liquid in the email body, and the email body can reference Liquid in the preheader. This is because the preheader text is part of the email body when you send messages to recipients.



Here are some best practices to keep in mind when writing your preheaders:

1. Calls to action come into play after readers have opened your email.
  - Point your readers in the right direction, whether you want them to subscribe, purchase a product or visit your website.
  - Use strong words so that the reader knows exactly what you are asking of them, but make sure it reflects your company's brand voice and that every call to action exhibits some sort of value to the consumer.
  - Preheader should be no more than 85 characters and have some sort of descriptive call to action that supports the subject line.

2. Email and landing sites to which you direct your users should be mobile-optimized:
  - No interstitial boxes
  - Large form-fields
  - Easy navigation
  - Large text
  - Generous white space
  - Short, concise body copy
  - Clear calls to action

### Preheader character limits

  |   Mobile email client  |  Limit  |
  |:----------------------:|:-------:|
  | iOS Outlook            | 74      |
  | Android Native         | 43      |
  | Android Gmail          | 24      |
  | iOS Native             | 82      |
  | iOS Gmail              | 30      |
  {: .reset-td-br-1 .reset-td-br-2 aria-label="Preheader character limits" }

  |  Desktop email client  |  Limit  |
  |:----------------------:|:-------:|
  | Apple Mail             | 33      |
  | Outlook '13            | 38      |
  | Outlook for Mac '15   | 53      |
  | Outlook '16            | 50      |
  {: .reset-td-br-1 .reset-td-br-2 aria-label="Preheader character limits" }


  |  Webmail email client  |  Limit  |
  |:----------------------:|:-------:|
  | AOL Mail               | 81      |
  | Gmail                  | 119     |
  | Outlook.com            | 49      |
  | Office 365             | 40      |
  | Mail.ru                | 64      |
  {: .reset-td-br-1 .reset-td-br-2 aria-label="Preheader character limits" }

## Email size

Email size refers to the size of your message HTML in Braze (the body you build and what Braze adds when the message is sent). 

- Make sure to limit your email size. Email bodies larger than 102&nbsp;KB are not only extremely taxing on Braze servers, but they're also clipped by Gmail and other email clients. 
- Hosted images that you reference by URL are not embedded in the HTML the same way as pasting huge inline assets. We recommend using the [Media Library](https://www.braze.com/docs/user_guide/messaging/design_and_edit/media_library/) and linking by `href` helps keep the message smaller.

|   Text Only   | Text with images |     Email width    |
|:-------------:|:----------------:|:------------------:|
| 25&nbsp;KB maximum |   60&nbsp;KB maximum   | 600 pixels maximum |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Email size" }

To reduce clipping risk:

- Shorten copy and links.
- Inline critical CSS where needed. Remove extra whitespace in HTML.
- Compress images and HTML assets.

**Note:**


To save your email campaign or template, make sure your email body does not exceed 400&nbsp;KB.



### What can add to the final email size?

These features increase the rendered message size by small amounts:

- Open tracking pixel: Adds a 1 x 1&nbsp;px image tag to the message body
- Preheader: Adds a hidden `<div>` at the top of the body
- Link aliasing: Appends a 16-character query parameter (`lid=`) to each tracked URL
- Link templates: Appends any query parameters configured in the dashboard to matching URLs 
- CSS inlining (optional): Applies embedded stylesheet rules inline to HTML elements, which may add redundant CSS depending on stylesheet complexity

The preheader and tracking pixel add roughly 600 characters (less than 1&nbsp;KB). Braze typically adds between 0&nbsp;KB and 5&nbsp;KB depending on the number of links, link template complexity, and whether CSS inlining is enabled. If your email size is near the limit, we recommend testing emails before sending since the final rendered size depends on these inputs.

## Text length

Refer to the following table for recommended text lengths.

| Text specifications | Recommended properties |
| --- | --- |
| Subject Line Length | 35 characters maximum (for optimal mobile display) (6 to 10 words) |
| Sender Name Length | 25 characters maximum (for optimal mobile display) |
| Preheader Length | 85 characters maximum |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Text length" }

## Image size

Refer to the following table for recommended image sizes. Smaller, high-quality images load faster, so use the smallest asset possible to achieve your desired output.

|     Size    | Header image width |  Body image width  |   File types  |
|:-----------:|:------------------:|:------------------:|:-------------:|
| 5&nbsp;MB maximum | 600 pixels maximum | 480 pixels maximum | PNG, JPEG, GIF |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="Image size" }

**Note:**


Gmail web and Gmail mobile apps often do not render SVG (and WEBP support is inconsistent). Use PNG or JPEG for images that must display reliably in Gmail.



## Deep linking

With push notifications and in-app messages, a [deep link](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/actions_and_media_urls/) takes users directly to a specified destination within an app. However, deep links require the app to be installed, and emails don't provide a way to know whether recipients have the app. This means deep links in emails can result in errors for recipients who don't have the app installed.

Instead, use [universal links and App Links](https://www.braze.com/docs/user_guide/channels/email/customize/universal_links_and_app_links/), which function as standard URLs. You can configure them to open the app or direct users to a specific page. They can also redirect to the app store or fall back to a webpage when the app is not installed.

## Content Blocks with transparent images

When a Content Block contains an image with a transparent background (for example, a logo) and is inserted by a Liquid tag, you may see a background color appear behind the image. This color comes from the drag-and-drop editor's [email global style settings](https://www.braze.com/docs/user_guide/channels/email/customize/email_global_style_settings/)—specifically the **Email Background Color**. If your global style settings use a color other than white, that color appears instead.

To display the Content Block as intended:

- Set the Content Block's column background color to match the email or template background.
- Alternatively, convert the drag-and-drop Content Block to an HTML Content Block and set its background to transparent.

If you need to use the same Content Block in areas with different backgrounds (for example, body and footer), create two versions of the block, each with the appropriate column background color.

If you prefer to drag the Content Block into the email as a row, you can set the row column background to transparent to override the global background.

**Note:**


Dragging a Content Block in as a row inserts a pre-rendered snapshot, which does not automatically update if the source Content Block changes.


