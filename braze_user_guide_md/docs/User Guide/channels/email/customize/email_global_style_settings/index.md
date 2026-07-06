# Email global style settings

> With global style settings, you can personalize the look of your email campaigns and Canvases. You can add and customize a default theme for your drag-and-drop editor. This includes editing your styles for email titles, text, buttons, and more. Using a combination of these settings can help create a consistent look across your email messaging.

To edit your global style settings, go to **Settings** > **Email Preferences** > **Drag-and-Drop Email Preferences**. After editing the styles in the drag-and-drop email editor, select **Save**. To further customize your email campaigns and Canvases, check out how you can incorporate [Editor blocks (email)](https://www.braze.com/docs/user_guide/messaging/design_and_edit/editor_blocks/?sdktab=email).

![Email Global Style Settings section in the Drag-And-Drop Email Editor Settings tab.](https://www.braze.com/docs/assets/img_archive/dnd_global_style_settings.png?b90ab9594ef58f19728971cf2de52bc1)

**Note:**


Updates made to the global style settings will apply to all future email campaigns and Canvases. 

 

## Basic styling 

For **Basic Styling**, you can set your default email and content background colors for your email campaigns and Canvases. You can also select a default font, add a custom font, and edit link colors.

![Basic styling options that include options to edit the email and content background colors, default font name, and default link color.](https://www.braze.com/docs/assets/img_archive/dnd_basic_styling.png?2a01bfc613840abd038de299fd05fdc2) 

## Custom font

With custom fonts, you can manually add a web font for branding consistency across various email platforms. You can add one custom font for each styling section.

### Requirements

Before adding a custom font, check that the custom font file meets the following requirements:

- CORS must be enabled on the server that provides the custom font file. This is usually managed by your IT team. 
  - The custom font file must have the header: `Access-Control-Allow-Origin: *`
- The file URL must point to a CSS file (not WOFF or OTF).
- The custom font name must match the name of the font face in the CSS file.

Note that the custom font provider may collect personal data from your recipients. You should review your font provider's policies prior to use.

### Adding a custom font

To add a custom font, do the following:

1. In the **Default Font Name** section of **Basic Styling**, select **Add a custom font**.
2. For the **Font Name** field, enter the same font name that appears in your custom font source file. Make sure this name is capitalized and spaced correctly.
3. Enter the corresponding URL for the **Font URL** field.
4. Check that the preview shows your custom font.
5. Select **Save** to use the custom font as your default email font. 

**Important:**


Gmail does not support custom fonts, so your custom font may display as a default system font. For other email platforms, check that your custom font displays correctly prior to sending your email messaging.



To use other custom fonts in your email campaigns, you can create an [email template](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/email_template/) or [Content Blocks](https://www.braze.com/docs/user_guide/messaging/design_and_edit/content_blocks/) that includes the custom font. For example, you can create a specific email template designed with festive custom fonts tailored to your sale theme. Be sure to check that your font choice is still web-safe and supported on your email platforms.

### Fallback font

Fallback fonts are used for the title, header, and body text when your default font choice isn't supported by the inbox provider or operating system. By default, Braze automatically sets Arial as a fallback font when global style settings are saved. You also have the option of adding serif or sans serif as options for your default font family.

![An example of "Arial" as a fallback font with "Sans-serif" as the font family.](https://www.braze.com/docs/assets/img_archive/dnd_fallbacks.png?f998be775c85e79b7206814073eeb315)

You can add up to 17 fallback fonts. The first fallback font selected will be the one attempted first. The fallback font will only be applied for newly created templates, email campaigns, and Canvas components. The fallback font isn't automatically set for messages that were created before the fallback font was specified. We highly recommend selecting fallback fonts that are similar to your email messaging to maintain consistency across your branding.

## Title styling

Here, you can adjust the styles of your email titles by editing the font size, font color, and text alignment. 

![Title Styling settings for a center-aligned main header and secondary header.](https://www.braze.com/docs/assets/img_archive/dnd_title_styling.png?4f87cf8cbdb17fe9a35422bc52d3484e)

Optionally, you can override the default style of your drag-and-drop editor theme. Select **Override default style** to apply your choice of title styling. This can include setting a different font and link color.

## Paragraph styling

To set a default paragraph style, go to the **Paragraph Styling**, enter the **Font Size**, and select **Font Color** to choose a font color. You can also adjust the block styling for the body text by editing the **Padding Top**, **Padding Right**, **Padding Bottom**, and **Padding Left** values. This will apply to the spacing around all four areas surrounding the paragraph block.

![Paragraph Styling settings for text with 14pt font.](https://www.braze.com/docs/assets/img_archive/dnd_paragraph_styling.png?e552a5f51d80b65c21b287767532d2d3)

## List styling

When adding lists to your messaging, the **List Styling** section creates consistency in how your lists are styled. This includes details like: 

- Font size
- Font color
- Font weight
- Line height
- Alignment
- Text direction
- Letter spacing
- List item spacing
- List item indent
- List type
- List style type

You can set the **List Type** to be either numbered or bulleted. The **List Style Type** provides additional customization for the style of your lists. For example, you can set the list types to always be bulleted and for each bullet to be a square.  

![List Styling settings for a bulleted list.](https://www.braze.com/docs/assets/img_archive/dnd_list_styling.png?77c888f45dd33b52b8e2dc6fbf4048f0)

## Button styling

In the **Button Styling** section, you can edit the following default styles for the button:
- Background color
- Font size
- Font color
- Border radius
- Border color
- Border weight
- Button padding

![Button Styling settings for a rectangular button with a blue background.](https://www.braze.com/docs/assets/img_archive/dnd_button_styling.png?0594073aed06435e94301257caf9ed52)

As with all other styling sections, you can adjust the block styling by editing the **Padding Top**, **Padding Right**, **Padding Bottom**, and **Padding Left** values.

## Email template width

Using the email template width, you can adjust and set a width for consistency across your email campaigns. 

![Email template width set to 600px.](https://www.braze.com/docs/assets/img_archive/dnd_email_template_width.png?77c3e74e7caa787659a52337e136a199)

## Content Block width

This setting will be the pre-configured for all future Content Blocks. Existing Content Blocks won't be updated. You can set all Content Blocks to be set at 100%, adhering to the width where a Content Block is inserted, or define a specific pixel value.

We recommend matching the Content Block width to the email template width.

![Content Block width set to 600px.](https://www.braze.com/docs/assets/img_archive/dnd_content_block_width_update.png?fb3d540a59b1fe0b616b06f7d48b24f7)
