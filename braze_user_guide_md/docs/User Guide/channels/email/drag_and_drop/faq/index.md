# Frequently asked questions

> This page provides answers to some frequently asked questions related to the drag-and-drop editor for email.

### Can I preview how my email appears in dark mode?

Yes. Go to the **Preview and Test** section of the drag-and-drop editor and turn on **Dark mode**. We recommend also previewing and testing your emails across different user platforms and using transparent images for row background images when possible. 

### How should I design emails for dark mode and light mode?

Emails do not need to be sent in separate light and dark layouts because email clients and devices can apply their own dark theme. However, this may invert colors or hide backgrounds if explicit colors are not set on the outer container and major sections. To prevent this, we recommend setting solid background colors so your message reads clearly in both dark and light mode.

### How can I change the email padding on mobile without updating the padding in the web view?

You cannot edit the padding for mobile and web views exclusively, so any edits are reflected in both views. However, you can add CSS logic in the HTML editor that sets the padding based on different screen sizes. This isn't supported in the drag-and-drop editor, so you can export the HTML file and use the HTML editor instead.

### How can I optimize a row of buttons to remain horizontal on desktop and mobile?

When building an email using the drag-and-drop editor, if you create a horizontal row of call-to-action buttons, you may find that the buttons are changed to a vertical orientation on mobile. 

To retain the same format across device sizes, we recommend creating a separate row with CTA buttons that have padding optimized for mobile and are set to hide the row on a desktop device. Having two separate rows means that you can set the desired padding for the best text rendering on desktop and mobile devices.

### Can I adjust the row height in the drag-and-drop editor?

The row height auto-adjusts to the content. As an alternative, we recommend that you:
1. Add a divider block.
2. Click the toggle to turn on its transparency.
3. Adjust the height.

### Is it possible to build layers in the editor? Can I add a background image, layer on an image, and add a text layer over that?

The drag-and-drop editor currently supports two layers. You can set a row background image and customize background colors.

### Can I save my drag-and-drop email as a template after I build it within my campaign or Canvas?

No. You can't save a drag-and-drop email from a campaign or Canvas as a drag-and-drop **Email Template** in **Templates** > **Email Templates**. Recreate the layout under **Templates** > **Email Templates**, or start from a saved template next time. For instructions, see [Create an email template](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/email_template/).

If you need a reusable HTML template instead, select **Download file** while editing the drag-and-drop body, open the HTML from the ZIP, and paste the markup into an [HTML email template](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/html_email_template/) using the HTML code editor. Recheck Liquid, links, and hosted assets afterward.

For more information about where templates live, see [Templates and Media](https://www.braze.com/docs/user_guide/messaging/templates/).

### Why can't I change a button's fill color in the drag-and-drop editor?

Page-level styles can override message-level styles. If updating **Fill** on a button or block does nothing, try the following:
1. Open [email global style settings](https://www.braze.com/docs/user_guide/channels/email/customize/email_global_style_settings/) and select **Reset to default** on the conflicting page style so the message-level color can apply.
2. Set the color again on the block.

### Can I add email attachments to the drag-and-drop editor?

Yes. You can add attachments to your email message by going to **Sending Settings** > **Advanced**.

### Why doesn't my Content Block render in email preview?

If a Content Block doesn't render in email preview, check for unclosed anchor tags. For Connected Content URLs, use the `replace` filter to convert double-encoded ampersands (`&amp;amp;`) to a single encoded ampersand (`&amp;`). Limit Content Block nesting to two levels.

### Why is the drag-and-drop editor ignoring alignment settings?

If the drag-and-drop editor ignores alignment settings, remove custom CSS or HTML blocks, remove custom fonts, check for CSS conflicts, and avoid duplicating row blocks. Contact Braze Support if the issue persists.
