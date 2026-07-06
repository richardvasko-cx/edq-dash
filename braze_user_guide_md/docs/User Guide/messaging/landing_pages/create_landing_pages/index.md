# Create landing pages

> Learn how to create and customize a landing page using the drag-and-drop editor, so you can grow your audience and collect preferences directly in Braze.

## Prerequisites

To access the landing page builder, you need [certain permissions](https://www.braze.com/docs/user_guide/messaging/landing_pages/#prerequisites). If you don’t have access, ask your Braze admin for help.

## Creating a landing page

### Step 1: Create a new draft

Go to **Messaging** > **Landing Pages**, then select **Create landing page**. You can also select the name of an existing landing page to duplicate or make changes to it.

![The landing pages section in the Braze dashboard.](https://www.braze.com/docs/assets/img/landing_pages/landing-pages-homepage.png?20df7a74990cb66ffb722c308ff590da)

### Step 2: Enter the page details

Add internal and public-facing details that help you organize, brand, and share your landing page.

#### General details

Enter a name and description for the landing page. These details are used to search for the page in your internal workspace. They won't be visible to your customers.

#### Site details

Set up metatags to customize how your page appears on the browser tab and optimize for search engine results. These will be visible to your customers.

We suggest following these best practices:

| Field | Description | Recommendations |
| --- | --- |
| Site title | The title that displays on the browser tab. | Use up to 60 characters. |
| Meta description | A text snippet that displays in search results. | Use between 140-160 characters.|
| Favicon | The icon that appears next to the site title on the browser tab. | Use an aspect ratio of 1:1, and a supported file type of PNG, JPEG, or ICO. |
| Page URL | This is URL path to your landing page. This value is also referenced when using [landing page liquid tags](https://www.braze.com/docs/user_guide/messaging/landing_pages/tracking_users/) that you can embed in a message to automatically identify when they submit your form.| This value must be unique across your workspace. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Site details" }

### Step 3: Customize the page

If you haven't already, select **Save as draft**. To start customizing your page, select **Edit landing page**. The drag-and-drop editor will preload with a default template that you can customize to fit your use case.

![An example landing page being created in the drag-and-drop editor.](https://www.braze.com/docs/assets/img/landing_pages/template.png?2e3c8b82789890d483ed19f22b4c9d30)

The editor uses two types of components for landing page composition: basic blocks and form blocks. All blocks must be placed in a row. For a dedicated reference of each block and properties, see [Editor blocks (landing pages)](https://www.braze.com/docs/user_guide/messaging/design_and_edit/editor_blocks/?sdktab=landing%20pages).

![The 'Build' section containing 'Rows' and 'Form Blocks'.](https://www.braze.com/docs/assets/img/landing_pages/dnd.png?616d6745467a4ea38667439c2ff61642){: style="max-width:35%;"}




You can use these blocks to add content and customize the layout of your landing page.

| Block Type   | Description |
|-------------|-------------|
| Title       | A text block for adding a heading or title to your content. Useful for structuring sections and improving readability. |
| Paragraph   | A text block for longer descriptions or additional context. Supports rich text formatting. |
| Button      | A clickable element that directs users to a specified action, such as opening a link or submitting a form. |
| Radio Button | Adds a list of options from which users can select one. When submitted, the user profile logs the associated custom attribute. |
| Image       | A block for displaying images. You can upload an image or provide a URL to reference an external source. |
| Link        | A hyperlink that users can click to navigate to a specified URL. Can be embedded within text or standalone. |
| Spacer      | An invisible block that adds vertical spacing between elements for improved layout and readability. |
| Custom Code | A block that allows you to insert and run custom HTML, CSS, or JavaScript for advanced customization. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Step 3: Customize the page" }

##### Span text

To apply specific styling to text blocks without custom code, highlight the text you want to style and then select **Wrap with span for style**. 

![Text box with different stylized text sections, such as different font sizes and colors, and a highlighted section that displays a toolbar with the option to "Wrap with span for style".](https://www.braze.com/docs/assets/img/landing_pages/wrap_with_span.png?dc6b90812ae532b21b6494ca5d8daac6){: style="max-width:50%;"}

Adjust the span properties to update your text styling, which includes:

- Font family, weight, size
- Line height 
- Letter spacing
- Text alignment and color
- Block padding

![Span properties panel with different options to update.](https://www.braze.com/docs/assets/img/landing_pages/span_properties.png?ce234aaf90e85d849a214b83bed1f8a6){: style="max-width:35%;"}




You can use these blocks to create a form that links user-submitted data to their profile in Braze. Keep in mind, if you use form blocks, you'll also need to create an additional landing page for the confirmation state.

![A form block that registers a new customer and will send a discount code to their email.](https://www.braze.com/docs/assets/img/landing_pages/form.png?b13f9c730db6ff88091d8f5213c4a0c4){: style="max-width:70%;"}

| Block Type     | Description |
|---------------|-------------|
| Email Capture | A form field for email addresses. When submitted, the email address is added to that user's profile in Braze. |
| Phone Capture | A form field for phone numbers. When submitted, the user is subscribed to your SMS or WhatsApp subscription group. |
| Input Field   | A form field that supports standard attributes (such as first and last name) or a custom attribute string of your choice. |
| Dropdown      | Users can select an item from a pre-defined list. You can add any custom attribute strings to the list. |
| Checkbox      | If a user checks the box, the block's attribute is set to `true`. If left unchecked, it's attribute is set to `false`. |
| Checkbox Group| Users can select from multiple choices presented. Values are either set or added to a defined array custom attribute. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Span text" }

**Important:**


After creating a landing page with a form, be sure to embed its [landing page Liquid tag](https://www.braze.com/docs/user_guide/messaging/landing_pages/tracking_users/) into your message. With this tag, Braze can automatically identify and update existing user profiles when they submit the form.






#### Page container styles

You can set styles to be applied across all relevant component blocks in your landing page from the **Page container** tab. These styles will be used everywhere on your page except where you override them with a specific block.

We recommend setting up page container-level styles before you customize styles at the block level. You can also add a background image for the entire page.

![The 'Page container' section with options to customize background images, colors, border details, and content styling.](https://www.braze.com/docs/assets/img/landing_pages/page_container.png?b3bb6aafc52354bf0c2c82f15de75cd8){: style="max-width:40%;"}

#### Responsive to user devices

You can make your landing page responsive to the size of a user's device by vertically stacking columns on smaller screens. To enable this, add a column into the row you want to make responsive, and then toggle on **Vertically stack on smaller screens** in the **Customize columns** section.

When enabled, you can also reverse stack columns to control the vertical order of multi-column content on smaller screens. This makes pages look and feel better on mobile without custom code.

![The "Vertically stack on smaller screens" toggle in the "Customize columns" section.](https://www.braze.com/docs/assets/img/landing_pages/device_responsive_toggle.png?f8bb1b53f882617456550968b8b2dd10){: style="max-width:50%;"}

#### Optional and required fields

You can choose whether a form field is required or optional. Required fields must be filled out before the form can be submitted. Optional fields can be left blank or unselected by a user.

For example, to enforce consent capture before form submission, you can turn on **Required field input** to set a checkbox to be required with the appropriate disclaimer text.

![A checkbox form field with the "Required input field" toggle selected.](https://www.braze.com/docs/assets/img/landing_pages/lp-optional-required.png?9696d998f00deadfb8cdfacbb3082b9c){: style="max-width:50%;"}

### Step 4: Create a confirmation page (optional)

If your landing page doesn’t include a form, continue to the next step.

If your landing page includes a [form](#form-blocks), create a second landing page to serve as the confirmation experience. This page should thank users or provide a next step after form submission.

To link the confirmation page:
- Select the **Submit** button on your form
- Use the **Open web URL** action to link to your confirmation page

If you don’t include a confirmation page, users may not know their form was submitted successfully. Always include a confirmation experience to complete the journey.

**Note:**

 
If your confirmation page opens in a new tab, a user who returns to the original landing page and resubmits with updated information can overwrite the previous submission, resulting in inconsistent data. 



### Step 5: Preview the page

You can preview your landing page in the editor's **Preview** tab. After saving your landing page as a draft, you can visit the URL by going to **Landing Pages** and selecting **Copy URL** next to your landing page. You can also share the URL with collaborators.

![A landing page with the menu open to show the "Copy URL" option.](https://www.braze.com/docs/assets/img/landing_pages/copy-url.png?1ec0de709762041ce6baa5a2866f9d05)

Before you publish, make sure:

- You haven’t exceeded your plan’s published landing page limit
- Each form-based page links to a [confirmation page](#step-4-create-a-confirmation-page) using the **Open web URL** action
- All required page fields (like URL path and title) are complete

When you're ready, select **Publish Landing Page**.

**Note:**


Aggressive pop-up blockers and ad blockers on iOS and in Safari (including Safari's built-in controls and third-party extensions) can negatively impact how landing pages behave when a form **Submit** button also opens another URL, whether that URL opens in the same tab or a new tab.



## Using templates

Use landing page templates to create templates for your next campaigns. These templates can be accessed and managed in both the landing page editor and from the **Landing Page Templates** page (**Content** > **Landing Page**). Landing page templates require a name and optionally require a description. 

## Managing templates

You can preview, archive, or edit landing page templates. You can duplicate your own landing page templates (located in **Your Templates**), but not Braze Templates. When editing a landing page, you can save your landing page as a template, make changes to the template, or delete the content of the landing page.

![A dropdown with options to save, change, and delete a landing page.](https://www.braze.com/docs/assets/img/landing_pages/manage-lp-template.png?127f098710ffeac598c9d5408afe09b6){: style="max-width:60%;"}

## Viewing analytics

To analyze the effectiveness of your landing page, go to **Messaging** > **Landing Pages**, then selected a landing page you've published. Here, you can track the number of page views, page clicks, page submissions, and the submission rates for your landing page.

![The analytics section for a landing page.](https://www.braze.com/docs/assets/img/landing_pages/analytics.png?3676211dc200d07bd03f3b87aa3bd848)

## Handling form submission errors {#handling-form-submission-errors}

If a user tries to submit a form with missing or unsupported input, they’ll see a generic error message and won’t be able to submit.

Common causes:

- Required fields are left blank
- Special characters are used in text inputs
- A required checkbox is not selected

Error messages shown to users can’t be customized. Preview your landing page to confirm field behavior before publishing. 
