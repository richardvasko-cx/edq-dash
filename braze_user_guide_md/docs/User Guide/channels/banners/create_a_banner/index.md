# Create a Banner

> Learn how to create Banners when you build campaigns and Canvases in Braze. For more general information, see [About Banners](https://www.braze.com/docs/user_guide/channels/banners).

## Prerequisites

Before you can launch your Banner, your development team must [set up placements in your app or website](https://www.braze.com/docs/developer_guide/banners/placements/). You can still draft your Banner campaign in the meantime, but you won't be able to launch the campaign until the placements are configured.

## Create a Banner message

### Step 1: Create placements in Braze

If you haven't already, you'll need to create Banner placements in Braze that are used to define the locations in your app or site can display Banners. To create a placement, go to **Settings** > **Banners Placements**, then select **Create Placement**.

![Banner Placements section to create placement IDs.](https://www.braze.com/docs/assets/img/banners/create_placement.png?98a42014b57988954fcac2c2d94f82da)

Give your placement a name and assign a **Placement ID**. Be sure you consult other teams before assigning an ID, as it'll be used throughout the card's lifecycle and shouldn't be changed later. For more information, see [Placement IDs].

![Placement details that designate a Banner will display in the left sidebar for spring sale promotion campaigns.](https://www.braze.com/docs/assets/img/banners/placement_details_example.png?e94e5b7365737e3a8d7ae38e01121c6c)


### Step 2: Choose where to build your message

Not sure whether your message should be sent using a campaign or a Canvas? Campaigns are better for single, targeted messaging campaigns, while Canvases are better for multi-step user journeys.




1. Go to **Messaging** > **Campaigns** and select **Create Campaign**.
2. Select **Banner**.
3. Name your campaign something clear and meaningful.
4. Add [teams](https://www.braze.com/docs/user_guide/administer/global/user_management/teams/) and [tags](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/tags/) as needed. Tags make your campaigns easier to find and build reports out of. For example, when using the Report Builder, you can filter by the relevant tags.
5. Select the placement you previously created to associate it with your campaign.
6. Add variants as needed. You can choose a different message type and layout for each one. For more information on variants, refer to [Multivariate and A/B testing](https://www.braze.com/docs/user_guide/messaging/ab_testing/).
7. Choose a start date and time for your Banner campaign. By default, Banners last indefinitely. You can change this by selecting **End Time** and specifying an end date and time.

**Tip:**


If all of the messages in your campaign are going to be similar or have the same content, compose your message before adding additional variants. You can then select **Copy from Variant** from the **Add Variant** dropdown.






1. [Create your Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/) using the Canvas composer.
2. After setting up your Canvas, add a Message step in the Canvas builder. Name your step something clear and meaningful.
3. Select **Banner** as your messaging channel.
4. Select a placement for the Banner.
5. Set the priority for the Banner. [Banner priority](https://www.braze.com/docs/user_guide/channels/banners/#priority) determines the order in which Banners are displayed if they share the same placement.
6. Set an expiration for the Banner. This can be after a duration of time after the step is available or at a specific date and time.




### Step 3: Compose a Banner {#compose-a-banner}

To compose your Banner, you can choose to:

- Start with a blank template
- Use a Braze Banner template
- Select a saved Banner template

![Option to choose a blank Banner or a template.](https://www.braze.com/docs/assets/img/banners/choose_banner_composer.png?a87f4e517432a8abd2eab159bfce6bd2)

#### Step 3.1: Style the Banner

You can drag and drop blocks and rows into the canvas area to start building your message. For a reference of Banner editor blocks and links to shared property details, see [Editor blocks (Banners)](https://www.braze.com/docs/user_guide/messaging/design_and_edit/editor_blocks/?sdktab=banners).









































To customize your message's background properties, border settings, and more, select **Styles**. If you only want to customize the style for a specific block or row, select it to make changes.

![Style panel of the Banner composer.](https://www.braze.com/docs/assets/img/banners/banner_card_styles.png?e616f6e22dd189004c9c10f134f5142d)

#### Step 3.2: Define on-click behavior (optional)

When a user clicks a link in the Banner, you can choose to navigate them deeper into your app or redirect them to another webpage. Additionally, you can choose to [log a custom attribute or event](https://www.braze.com/docs/developer_guide/analytics/), which updates your user's profile with custom data when they click the Banner.

**Important:**


{::nomarkdown}
On-click behavior can be overridden if a specific element (such as a button, link, or image, of the Banner) has its own on-click behavior. For example, given the following on-click behaviors:<br><ul><li>A Banner has an on-click behavior that redirects to a website's homepage.</li><li>An image in the Banner has an on-click behavior that redirects to a website's product page.</li></ul>If a user clicks the image, they are redirected to the product page. However, clicking the surrounding area in the Banner redirects them to the homepage.
{:/}



#### Step 3.3: Configure dismissal behavior (optional) {#dismiss-behavior}

Select the **Banner can be dismissed** checkbox in the **Dismiss Behavior** section to allow users to dismiss the Banner. This option is beneficial in scenarios where you want to promote a limited-time sale for all app users, but allow them to dismiss the message if they aren't interested.

When dismissal is enabled, you can customize the dismiss button in the **Dismiss Behavior** section:

| Setting | Description |
|---------|-------------|
| **Button size** | The size of the dismiss button displayed on the Banner. |
| **Button color** | The color of the dismiss button. |
| **ARIA label** | The accessible label for the dismiss button, used by screen readers. Defaults to "Close" if left blank. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Dismiss button settings" }

When a user dismisses a Banner, it doesn't appear again for that user, even if they still qualify for the campaign's targeting criteria.

#### Step 3.4: Add custom properties (optional) {#custom-properties}

You can add custom properties to a Banner to attach structured metadata, such as strings or JSON objects. These properties don’t affect how the Banner is displayed but can be [accessed through the Braze SDK](https://www.braze.com/docs/developer_guide/banners/placements/) to modify your app’s behavior or appearance. For example, you could:

- Send metadata for your third-party analytics or integrations.
- Use metadata such as a `timestamp` or JSON object to trigger conditional logic.
- Control the behavior of a Banner based on included metadata like `ratio` or `format`.

To add a custom property, select **Settings** > **Properties** > **Add property**.

![The properties page showing the option to add the first custom property to a Banner campaign.](https://www.braze.com/docs/assets/img/banners/add_property.png?8b36823cad72205eb171a61e7d768401)

For each property you'd like to add, fill out the following:

| Field | Description | Example |
|-------|-------------|---------|
| Property type | The data type for the property. Supported types include string, boolean, number, timestamp, image URL, and JSON object. | String |
| Property key | The unique identifier for the property. This key is used in the SDK to access the property. | `color` |
| Value | The value assigned to the property. Must match the selected property type. | `#FF0000` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Step 3.4: Add custom properties (optional) #custom-properties" }

When you're finished, select **Done**.

![The properties page with a string property with a key of color and value of #FF0000.](https://www.braze.com/docs/assets/img/banners/example_property.png?3d34210d84b04028eabc38d2099f6802)

### Step 4: Build the remainder of your campaign or Canvas




#### Set Banner priority (optional)

[Banner priority](https://www.braze.com/docs/user_guide/channels/banners/#priority) determines the order in which Banners are displayed if they share the same placement. To manually set the priority:

1. Select **Set exact priority**.
2. Drag and drop the campaigns to order them with the correct priority.
3. Select **Apply Sort**.

**Tip:**


If you have multiple Banner campaigns using the same placement ID, we recommend using the drag-and-drop priority sorter to define the exact priority.



#### Configure re-eligibility (optional) {#re-eligibility}

By default, users who dismiss a Banner are never re-eligible for that campaign. To let dismissed users see the Banner again, go to the **Delivery Controls** step and select **Allow users to become re-eligible to receive campaign**. When enabled, set a cooldown window in minutes, hours, days, or weeks.

The countdown starts from when the user dismisses the Banner. After the window expires, the user is automatically re-eligible—no campaign restart required. Re-eligibility is tracked per user per campaign.

#### Choose your audience

1. In **Target Audiences**, choose segments or filters to narrow your audience. You automatically receive a preview of the approximate segment population. Exact segment membership is calculated before the message is sent.

**Important:**


Your message will only be sent to users who already match the conditions you set in the **Target Audience** step. After that, they still need to meet the trigger you define in the **Schedule Delivery** step. Think of the target audience as a waiting room—only people already inside can move forward when the next action happens. 



{:start="2"}
2. In **Assign Conversions**, track how often users perform specific actions after receiving a campaign by defining conversion events with up to a 30-day window to count the action as a conversion.

#### Choose conversion events

Braze allows you to track [conversion events](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/), how often users perform specific actions, after receiving a campaign. You have the option of allowing up to a 30-day window during which a conversion is counted if the user takes the specified action.





If you haven't done so already, complete the remaining sections of your Canvas component. For further details on how build out the rest of your Canvas, implement [multivariate testing](https://www.braze.com/docs/user_guide/messaging/ab_testing/) and [Intelligent Selection](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_selection/), and more, refer to the [Build your Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#step-3-build-your-canvas) step of our Canvas documentation.

To control re-eligibility for Canvas Banner steps, use the Canvas re-entry settings. For more information, see [Re-eligibility for campaigns and Canvas](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/re_eligibility/).




### Step 5: Test your message (optional)

 **Preview** to you preview your Banner or send a test message.

![Preview tab of the Banner composer.](https://www.braze.com/docs/assets/img/banners/select_preview.png?898229d959020b86215b0604a136dfae){: style="max-width:50%;"}

Keep in mind, your preview may not be identical to the final render on a user's device due to differences across hardware.

To send a test message, add either a content test group or one or more individual users as **Test Recipients**, then select **Send Test**. You'll be able to view your test message on the device for up to 5 minutes. You can then select **Copy preview link** to generate and copy a shareable preview link that shows what the banner will look like for a random user. The link will last for seven days before it needs to be regenerated.

![Preview tab of the Banner composer.](https://www.braze.com/docs/assets/img/banners/preview_banner.png?d8aab458e372815d934bd3cd9c3f3f43)

While reviewing your test Banner, verify the following:

- Is your Banner campaign assigned to a placement?
- Do the images and media show up and act as expected on your targeted device types and screen sizes?
- Do your links and buttons direct the user to where they should go?
- Does the Liquid function as expected? Have you accounted for a default attribute value in the event that the Liquid returns no information?
- Is your copy clear, concise, and correct?

For more information, see [Send test messages](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/sending_test_messages/).


### Step 6: Review and deploy

After you've finished building your campaign or Canvas, review its details, [test it](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/sending_test_messages/), then send it when you're ready.
