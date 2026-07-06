# Create an email with custom HTML

> Email messages are great for delivering content to your users on their terms. They are also excellent tools to re-engage users who may have even uninstalled your app. Sending customized and tailored email messages will enhance your users' experience, and help your users get the most value out of your app. 

To see examples of email campaigns, check out our [Case Studies](https://www.braze.com/customers). 

**Tip:**


If this is your first time creating an email campaign, we highly recommend checking out these Braze Learning courses:<br><br>
- [Email Opt-Ins and Permissions](https://learning.braze.com/messaging-channels-email)
- [Project: Build a basic email marketing program](https://learning.braze.com/project-build-a-basic-email-marketing-program)



## Step 1: Choose where to build your message

Use campaigns for single, simple messaging. Use Canvases for multi-step user journeys.




1. Go to **Messaging** > **Campaigns** and select **Create Campaign**.
2. Select **Email**, or, for campaigns targeting multiple channels, select **Multichannel**.
3. Name your campaign something clear and meaningful.
4. Add [teams](https://www.braze.com/docs/user_guide/administer/global/user_management/teams/) and [tags](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/tags/) as needed.
   * Tags make your campaigns easier to find and build reports out of. For example, when using the [Report Builder](https://www.braze.com/docs/user_guide/analytics/reports/report_builder/), you can filter by particular tags.
5. Add and name as many variants as you need for your campaign. For more on this topic, refer to [Multivariate and A/B testing](https://www.braze.com/docs/user_guide/messaging/ab_testing/).

**Tip:**


If all of the messages in your campaign are going to be similar or have the same content, compose your message before adding additional variants. You can then choose **Copy from Variant** from the **Add Variant** dropdown.





1. [Create your Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/) using the Canvas composer.
2. After you've set up your Canvas, add a step in the Canvas builder. Name your step something clear and meaningful.
3. Choose a [step schedule](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/delivery_and_entry_types/#schedule-delay) and specify a delay as needed.
4. Filter your Audience for this step, as necessary. You can further refine the recipients of this step by specifying segments and adding additional filters. Audience options will be checked after the delay, at the time messages are sent.
5. Choose your [advancement behavior](https://www.braze.com/docs/user_guide/messaging/canvas/managing_canvases/cloning_canvases/).
6. Choose any other messaging channels that you would like to pair with your message.



**Tip:**


If you plan to build custom HTML and need backgrounds to stay consistent in the Gmail mobile app with device dark mode on, see [Gmail mobile app and Dark Mode background colors](#gmail-dark-mode).





## Step 2: Select your editing experience {#step-2-choose-your-template-and-compose-your-email}

Braze offers two editing experiences when creating an email campaign: our [drag-and-drop editor](https://www.braze.com/docs/dnd/) and our standard HTML editor. Choose the appropriate tile for the editing experience you'd prefer. 

![Choosing between the drag-and-drop editor, HTML editor, or templates for your email editing experience.](https://www.braze.com/docs/assets/img_archive/choose_email_creation.png?aca7b8d0e033a4a868923644f3297a4b){: style="max-width:75%" }

Then, you can either select an existing [email template](https://www.braze.com/docs/user_guide/channels/email/html_editor#creating-an-email-template), [upload a template](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/html_email_template/) from a file (HTML editor only), or use a blank template.

If you use the HTML editor and need background colors to stay consistent in the Gmail mobile app when the device is in dark mode, see [Gmail mobile app and Dark Mode background colors](#gmail-dark-mode).

**Tip:**


We recommend selecting one editing experience per email campaign. For example, choose either the **HTML Classic** or **Block editor** in a single email campaign rather than switching between editors.



## Step 3: Compose your email

After you've selected your template, you'll see an overview of your email where you can directly jump to the fullscreen editor to draft your email, change your sending information, and view warnings about deliverability or law compliance. You can switch among HTML, classic, plaintext, and [AMP](https://www.braze.com/docs/user_guide/channels/email/customize/amp_for_email/) tabs while you compose. 

![The "Regenerate from HTML" button.](https://www.braze.com/docs/assets/img_archive/regenerate_from_html.png?e0265452ae5df277df0fe20030dba123){: style="max-width:30%;float:right;margin-left:15px;border:none;" }

Braze automatically updates the plaintext version from the HTML version until it detects an edit to the plaintext. After Braze detects an edit, it stops updating the plaintext because it assumes you made intentional changes. To restore automatic sync, go to **Plaintext** and select **Regenerate from HTML** (visible only when plaintext isn't synchronizing).

**Tip:**


To add motion in an email with an accurate preview, use GIFs instead of elements that require JavaScript, as most inboxes don't support JavaScript.



![Email Variants panel for composing your email.](https://www.braze.com/docs/assets/img/email.png?45e31feae92fad6f6f8ed4dd18e9346f){: style="max-width:75%" }

**Important:**


Braze automatically removes HTML event handlers referenced as attributes. This modifies the HTML, so re-check the email after you finish. Learn more about [HTML handlers](https://www.w3schools.com/tags/ref_eventattributes.asp).



**Tip:**


Need help creating awesome copy? Try using the [AI copywriting assistant](https://www.braze.com/docs/user_guide/brazeai/generative_ai/copywriting/). Input a product name or description and the AI will generate human-like marketing copy for use in your messaging.

![Launch AI Copywriter button, located in the Body tab of the email composer.](https://www.braze.com/docs/assets/img/ai_copywriter/ai_copywriter_email.png?8949399245b427145be8856bd77ec753){: style="max-width:80%"}



Need help crafting right-to-left messages for languages like Arabic and Hebrew? Refer to [Creating right-to-left messages](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/localization/right_to_left_messages/) for best practices.

### Gmail mobile app and dark mode {#gmail-dark-mode}

The Gmail mobile app (Android and iOS) can invert background colors when the device is in dark mode. That can break layouts where the email background should match an image edge or a specific brand color.

To avoid this, in the table cell that needs a stable background, use a single-color CSS `linear-gradient` instead of `background-color`. Gmail is less likely to invert that treatment than a flat background color.

For example, to keep a white background on a cell, use this:

```html
<td style="background-image: linear-gradient(#ffffff, #ffffff);">
```

Replace `#ffffff` with your intended color.

**Note:**


This approach does not apply reliably to `<table aria-label="Gmail mobile app and dark mode #gmail-dark-mode">` elements alone, so set the gradient on the cell instead of only on the table.
  <caption>Gmail mobile app and dark mode</caption>



For more information about gradient syntax, see [CSS gradients on W3Schools](https://www.w3schools.com/css/css3_gradients.asp).

### Step 3.1: Add your sending information

After you finish designing and building your email message, add your sending information in **Sending Settings**.

1. Under **Sending Info**, select an email as the **From Display Name + Address**. You can also customize this by selecting **Customize From Display Name + Address**.
2. Select an email as the **Reply-To Address**. You can also customize this by selecting **Customize Reply-To Address**.
3. Next, select an email as the **BCC Address** to make your email visible to this address.
4. Add a subject line to your email. Optionally, you can also add a preheader and a whitespace after the preheader.











A preview in the right-hand panel will populate with the sending information you've added. This information can also be updated by going to **Settings** > **Email Preferences** > **Sending Configuration**.

#### Advanced

Under **Sending Settings** > **Advanced**, turn on **inline CSS** for the widest client support. If messages clip or images stretch to row height, try turning inline CSS **off** temporarily. Some templates behave better without inlining.

You can also add personalization for email headers and email extras to send additional data back to other email service providers.

##### Email attachments

You can also add email attachments by the following methods:

- **Upload a file:** Drag and drop or browse to upload a file directly from your computer to the email. Braze validates the file type and size (up to 2&nbsp;MB by default) before uploading, then these files are uploaded to the media library. Files that are larger than 2&nbsp;MB limit cannot be uploaded.
- **Use the media library:** Browse and select from assets already stored in the [media library](https://www.braze.com/docs/user_guide/messaging/design_and_edit/media_library). PDFs, Word documents, Excel files, and PowerPoint presentations are all supported.
- **Add from URL:** Enter a URL pointing to the file and provide a display filename. Because Braze cannot probe arbitrary URLs for size during email composition, the file size is enforced at send time. Note that Liquid is not supported in this field.

Refer to [Email guidelines](https://www.braze.com/docs/user_guide/channels/email/best_practices/email_guidelines) for specific best practices to consider.

##### Email headers

To add email headers, select **Add New Header**. Email headers contain information about the email being sent. These [key-value pairs](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/sources/key_value_pairs/) typically include sender, recipient, authentication protocol, and routing information. Braze automatically adds the RFC-required header information for emails to reach inbox providers.

Braze allows you the flexibility to add additional email headers as needed for advanced use cases. There are a few reserved fields that the Braze platform will overwrite during sending. 

Avoid using the following keys:

<style>
#reserved-fields td {
    word-break: break-word;
    width: 33%;
}
</style>

<table aria-label="Email headers" id="reserved-fields">
  <caption>Email headers</caption>
<thead>
  <tr>
    <th>Reserved Fields</th>
    <th></th>
    <th></th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>BCC</td>
    <td>dkim-signature</td>
    <td>Reply-To</td>
  </tr>
  <tr>
    <td>CC</td>
    <td>From</td>
    <td>Subject</td>
  </tr>
  <tr>
    <td>Content-Transfer-Encoding</td>
    <td>MIME-Version</td>
    <td>To</td>
  </tr>
  <tr>
    <td>Content-Type</td>
    <td>Received</td>
    <td>x-sg-eid</td>
  </tr>
  <tr>
    <td>DKIM-Signature</td>
    <td>received</td>
    <td>x-sg-id</td>
  </tr>
</tbody>
</table>

##### Adding email extras

Email extras allows you to send additional data back to other email service providers. This is only applicable for advanced use cases, so you should only use email extras if your company already has this set up.

To add email extras, go to the **Sending Info** and select **Add New Extra**.

**Warning:**


The total key-value pairs added should not exceed 1 KB. Otherwise, the messages will be aborted.



Email extra values are not published to Currents or Snowflake. If you're looking to send additional metadata or dynamic values to Currents or Snowflake, use [`message_extras`](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/advanced_filters/message_extras/) instead.

### Step 3.2: Preview and test your message {#step-3b-preview-and-test-your-message}

After you finish composing your email, test it before sending. From the bottom of the overview screen, select **Preview and Test**. 

Here, you can preview how your email will appear in a customer's inbox. With **Preview as User** selected, you can preview your email as a random user, select a specific user, or create a custom user. This allows you to test that your Connected Content and personalization calls are working as they should. 

Then, you can **Copy preview link** to generate and copy a shareable preview link that shows what the email will look like for a random user. The link will last for seven days before it needs to be regenerated.

You can also switch between desktop, mobile, and plaintext views to get a sense of how your message will appear in different contexts.

**Tip:**


Curious about what your email looks like for dark mode users? Select the **Dark Mode Preview** toggle located in the **Preview and Test** section (drag-and-drop editor only). If you use the HTML editor, you can still address Gmail mobile dark mode rendering with [Gmail mobile app and Dark Mode](#gmail-dark-mode).



When you're ready for a final check, select **Test Send** and send a test message to yourself or a tester group to confirm the email displays properly across devices and clients.

![Test Send option and example email preview when composing your email.](https://www.braze.com/docs/assets/img_archive/newEmailTest.png?0e99a7d771c612f02c61ac1c41794b11)

If you see any issues with your email, or want to make any changes, select **Edit Email** to return to the editor.

**Tip:**


Email clients that support preview text always pull in enough characters to fill all available preview text space. However, this can leave you in situations where the preview text is incomplete or unoptimized.
<br><br>To avoid this, you can create white space after your desired preview text so that email clients don't pull other distracting text or characters into the envelope content. To do so, add a chain of zero-width non-joiners (‌`&zwnj;`) and non-breaking spaces (`&nbsp;`) after the preview text that you want displayed. <br><br>When added to the end of your preview text in the preheader section, the following piece of code for the HTML editor will add the white space you're looking for:<br><br>

```html
<div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
```

For the drag-and-drop editor, add only the zero-width non-joiners (‌`&zwnj;`) without the `<div>` formatting directly in the preheader in the **Sending Settings** section.



### Step 3.3: Check for email errors

Before send, the editor flags common issues:

- From display name and header not set together
- Invalid From or reply-to addresses
- Duplicate header keys
- Liquid syntax errors
- Content Blocks that include a full `<!DOCTYPE html>`
- Email body is over 400&nbsp;KB
  - Aim for [less than 102&nbsp;KB](https://www.braze.com/docs/user_guide/message_building_by_channel/email/best_practices/guidelines_and_tips/#email-size) to avoid clipping.
- Blank body or subject
- Missing unsubscribe link
- From domain not allowlisted (sends heavily throttled)

## Step 4: Build the remainder of your campaign or Canvas



Next, build the remainder of your campaign. See the following sections for details on how to use Braze tools to build your email campaign.

#### Choose delivery schedule or trigger

Deliver emails based on a scheduled time, an action, or an API trigger. For more, refer to [Scheduling your campaign](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/).

**Note:**


For API-triggered campaigns, when the trigger action is set to **Interact With Campaign**, selecting a **Receive** option as the interaction will cause your new campaign to trigger as soon as Braze marks the selected campaign as sent, even if that message bounces or fails to be delivered.



You can also set the campaign's duration, specify [Quiet hours](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/quiet_hours/), and set [frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/#frequency-capping) rules.

#### Choose users to target

Next, [target users](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/target_users/) by choosing segments or filters. Braze shows a live preview of the segment population, including how many users are reachable through email. Exact segment membership is calculated just before send.

**Important:**


Your message will only be sent to users who already match the conditions you set in the **Target Audience** step. After that, they still need to meet the trigger you define in the **Schedule Delivery** step. Think of the target audience as a waiting room—only people already inside can move forward when the next action happens. 



You can also choose to only send your campaign to users who have a specific [subscription status](https://www.braze.com/docs/user_guide/channels/email/subscriptions/), such as those who are subscribed and opted in to email.

Optionally, you can also limit delivery to a specified number of users within the segment, or allow users to receive the same message twice upon a recurrence of the campaign.

**Note:**


When creating a new email campaign, the Control Group defaults to 20% and can be adjusted or removed as needed for your campaign.



##### Multichannel campaigns with email and push

For multichannel campaigns targeting both email and push channels, you may want to limit your campaign so that only the users who are explicitly opted in will receive the message (excluding subscribed or unsubscribed users). For example, say you have three users of different opt-in statuses:

- **User A** is subscribed to email and is push enabled. This user doesn't receive the email but will receive the push.
- **User B** is opted-in to email but is not push enabled. This user will receive the email but doesn't receive the push.
- **User C** is opted-in to email and is push enabled. This user will receive both the email and the push.

To do so, under **Audience Summary**, select to send this campaign to "opted-in users only". This option will check that only opted-in users will receive your email, and Braze will only send your push to users who are push enabled by default.

**Important:**


With this configuration, don't include any filters in the **Target Audiences** step that limit the audience to a single channel (for example, `Foreground Push Enabled = True` or `Email Subscription = Opted-In`).



#### Choose conversion events

Braze allows you to track how often users perform specific actions, [conversion events](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/), after receiving a campaign. You can specify any of the following actions as a conversion event:

- Opens app
- Makes purchase (This can be a generic purchase or a specific item)
- Performs specific custom event
- Opens email

You can allow up to a 30-day window during which Braze counts a conversion if the user takes the specified action. While Braze tracks opens and clicks automatically, you may set the conversion event to an open or click to use [Intelligent Selection](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_selection/).



If you haven't done so already, complete the remaining sections of your Canvas components. For further details on how build out the rest of your Canvas, implement multivariate testing and Intelligent Selection, and more, refer to the [Build your Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#step-3-build-your-canvas) step of our Canvas documentation.



## Step 5: Review and deploy

The final section summarizes the campaign you designed. Confirm all relevant details and select **Launch Campaign**.

To learn how you can access the results of your email campaigns, check out [Email reporting](https://www.braze.com/docs/user_guide/channels/email/reporting/).
