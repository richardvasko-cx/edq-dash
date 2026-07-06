# Link templates

> With link templates, you can create dynamic and reusable links for your email campaigns by appending parameters or prepending URLs. This can create consistency in the URLs across your campaigns and messages. 

**Note:**


Link templates are an optional feature. If **Email Link Templates** is missing from the **Templates** section, contact your account manager to turn on the feature.



## How it works

Link templates are most often used in these following use cases:

- Appending Google Analytics query parameters to all links in a given email message
- Prepending a URL to all links in a given email message

Let's say you're running a promotional email campaign for a new product launch. You can use a link template that directs users to the product page and personalize the link to include your user's name or a specific promotional code. This can allow you to track how many users have clicked on the link and have made a purchase. This way, you can create consistency across your links and better track your analytics.

## Creating a link template

You can create an unlimited number of link templates to support your various needs. To create a link template, do the following:

1. Go to **Content** > **Email Link**.
2. Select **Create email link template**.
3. Give your link template a name.
4. (Optional) Add a description, team, or tag to add details about the link template.
5. (Optional) Select the toggle to automatically add the link template to links in email campaigns and Canvases. This applies when adding a new link to any new or existing email.

There are two types of link templates you can create:

- [Link template that inserts before a URL](#prepend-link-template)
- [Link template that inserts after a URL](#append-link-template)

When using link templates and [Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/), Liquid must only be added within the body tag to ensure consistent rendering.

### Prepend: Create a link template that inserts before a URL {#prepend-link-template}

To add a string or URL before the links in your email message, do the following:

1. Create a new link template.
2. Set the **Template Position** to **Before URL**. 
3. Enter a string that will always get prepended to your URL. 

The **Template preview** is provided to give you an example of how the link template will be inserted before a URL.

![Template Position, Prepend URL, and Template Preview fields for the link template insertion process before a URL.](https://www.braze.com/docs/assets/img_archive/link_template_preappend.png?159f3ade448f86d5283b21b777c96fdc){: style="max-width:90%;"}

### Append: Create a link template that inserts after a URL {#append-link-template}

If you want to add query parameters after a URL in your email message:

1. Create a new link template.
2. Set the **Template Position** to **After URL**. 
3. Enter the query parameters (`value=example`) to the end of each URL. You can have multiple parameters appended to the end of a URL.

![Template Position, Query Parameters, and Template Preview fields for the link template insertion process after a URL.](https://www.braze.com/docs/assets/img_archive/link_template_postappend.png?7e78ad7fe951fc6687d981c9aba180e5){: style="max-width:90%;"}

## Using link templates in email campaigns

After you set up your link templates, you can apply them in your email.

To apply a link template in the HTML editor or the drag-and-drop editor, follow these steps:

**Important:**


To access the **Link Management** tab in the updated HTML editor or the drag-and-drop editor, you must have link aliasing turned on. To turn on link aliasing, contact your account manager. For more information, see [Link aliasing](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/link_aliasing/).



- **Updated HTML editor:** On the **Content** tab, select **Link Management**, select **Add a Link Template**, choose your link template, and then select **Add**.
- **Drag-and-drop editor:** On the **Content** tab, select **Link Management**, select **Add a Link Template**, choose your link template, and then select **Add**.

![Link Management tab in the drag-and-drop editor with an example list of link templates.](https://www.braze.com/docs/assets/img_archive/link_template_messagecomposer2.png?daafe639c906bd6915e4222e5e3c9d92)

**Note:**


Link templates aren't applied to plain text. This means Currents may show clicks that don't include the parameters from the link templates as those clicks may come from the plain text version of the email.



As you add link templates in the **Link Management** tab, scroll to the right to view the templates you've added. If existing links within an email already have a link template added, newly added links will also have the link template added by default.

## Managing link templates

You can also [duplicate](https://www.braze.com/docs/user_guide/messaging/templates/managing_templates/) link templates. Learn more about creating and managing templates and creative content in [Templates & Media](https://www.braze.com/docs/user_guide/messaging/templates/).

**Important:**


Archiving templates is not currently available for link templates.



## Frequently asked questions

For answers to frequently asked questions about link templates, check out our [Templates FAQ](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/faq/) page.

