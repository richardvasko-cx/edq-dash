# Create a Canvas

> This reference article covers the necessary steps involved in creating, maintaining, and testing a Canvas. Follow this guide, or check out our [Canvas Braze Learning course](https://learning.braze.com/quick-overview-canvas-setup). You can also start from a [Braze Canvas template](https://www.braze.com/docs/user_guide/messaging/templates/canvas_templates/braze_templates/) to speed up your setup. For more information, see [Canvas templates](https://www.braze.com/docs/user_guide/messaging/templates/canvas_templates/).

**Expand for original Canvas editor details**


You can no longer create or duplicate Canvases using the original Canvas experience. Braze recommends [cloning your Canvases](https://www.braze.com/docs/user_guide/messaging/canvas/managing_canvases/cloning_canvases/) to the most current editor.



## Step 1: Set up a new Canvas 

First, go to **Messaging** > **Canvas**, then select **Create Canvas**.

The Canvas builder will guide you step-by-step through setting up your Canvas—everything from naming it to setting conversion events and bringing the right users into your customer journey. Select each of the following tabs to view which settings you can adjust for each builder step.


  
    Here, you will set up the basics of your Canvas:
    - Name your Canvas
    - Add teams
    - Add tags
    - Assign conversion events, and choose their event types and deadlines

    Learn more about the [Basics step](#step-11-start-with-your-canvas-basics).
  
  
    Here, you will decide how and when your users will enter your Canvas:
    - Scheduled: This is a time-based Canvas entry
    - Action-Based: Your user will enter your Canvas after they perform a defined action
    - API-Triggered: Use an API request to enter users into your Canvas

    Learn more about the [Entry Schedule step](#step-12-determine-your-canvas-entry-schedule).
  
  
    Here, you will select your target audience:
    - Create your audience by adding segments and filters
    - Fine-tune Canvas re-entry and entry limits
    - See a summary of your target audience

    Learn more about the [Target Audience step](#step-13-set-your-target-entry-audience).
  
  
    Here, you will select your Canvas Send Settings:
    - Select your subscription settings
    - Set a send rate limit for your Canvas messages
    - Enable and set Quiet Hours

    Learn more about the [Send Settings step](#step-14-select-your-send-settings).
  
  
    Here, you will build your Canvas.

    Learn how to [build your Canvas](#step-2-build-your-canvas) using the Canvas builder.
  
  
    Here, you will find the summary of your Canvas details. If you have the [Canvas approval workflow](https://www.braze.com/docs/user_guide/messaging/governance/approvals/) turned on, you can approve the listed Canvas details before launching.

  


### Step 1.1: Start with your Canvas basics

Here, you'll name your Canvas, assign [Teams](https://www.braze.com/docs/user_guide/administer/global/user_management/teams/#teams), and create or add [Tags](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/tags/#tags). You can also assign conversion events for the Canvas.

**Tip:**


Tag your Canvases so they're easy to find and build reports out of. For instance, when using [Report Builder](https://www.braze.com/docs/user_guide/analytics/reports/report_builder/), you can filter by particular tags.



![The Canvas details page, with fields for the Canvas name, description, location, and tags.](https://www.braze.com/docs/assets/img/canvas_details.png?2eaf1a1d9857f26dde32e60c0c17fd9c){: style="max-width:70%;"}

#### Choose conversion events

Choose your conversion event type, then select the conversions to record. These [conversion events](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/) will measure the efficiency of your Canvas. 

![Primary Conversion Event A with the Makes Purchase conversion event type to record conversations for users who make any purchase within a three day conversion deadline.](https://www.braze.com/docs/assets/img/add_canvas_conversions.png?5c23b8494f820bfef398421aa1f34582)

If your Canvas has multiple variants or a control group, Braze will use this conversion event to determine the best variation for achieving this conversion goal. Using the same logic, you can create multiple conversion events.

### Step 1.2: Determine your Canvas entry schedule

You can choose one of three ways in which users can enter your Canvas. 

#### Entry schedule types



With scheduled delivery, users will enter on a time schedule, similarly to how you would schedule a campaign. You can enroll users in a Canvas as soon as it is launched, enter them into your journey at some point in the future, or on a recurring basis (daily, weekly, or monthly). 
    
If you select a monthly recurring schedule, note that some months may not have the selected day. For example, let's say you set a Canvas to send monthly on the 31st day. In this scenario, Braze sends on the last day of that month, such as April 30, because April 31 doesn't exist.

In this example, based on the time-based options, users enter this Canvas every Tuesday at 12 pm in their local time zone every week, beginning November 14, 2025 until December 31, 2025.

![The "Entry Schedule" page with the type set to "Scheduled". Due to the selection, time-based options are shown, including frequency, start time, recurrence, days, and more.](https://www.braze.com/docs/assets/img_archive/Canvas_Scheduled_Delivery.png?22f99135bf3f487106e3767213fe849e)

When using local time zone delivery, Braze evaluates entry eligibility twice: first at Samoa time (UTC+13) on the scheduled day, and again at the user's local time. A user must be eligible for both checks to enter the Canvas. If your entry filters use relative time windows (for example, "more than 2 days ago"), the 24-hour period may not have elapsed at the time of the first check, causing users to enter one day late. To avoid this, use a broader time window, such as at least two days. For more details, see [When does Braze evaluate users for local time zone delivery?](https://www.braze.com/docs/user_guide/messaging/campaigns/faq/#when-does-braze-evaluate-users-for-local-time-zone-delivery)


With action-based delivery, users will enter the Canvas and begin receiving messages when they take particular actions, such as opening your app, making a purchase, or triggering a custom event.

You can control other aspects of the Canvas behavior from the **Entry Audience** window, including rules for re-eligibility and frequency capping settings. Note that action-based delivery is unavailable for Canvas components with in-app messages.

![An example of action-based delivery. Users will enter the Canvas if they make a purchase with an entry window beginning at 1:30 pm on June 10, 2025.](https://www.braze.com/docs/assets/img_archive/Canvas_Action_Based_Delivery.png?cd3f800b27ec326fc0e11bee12630e2e)

**Important:**


If your action-based Canvas sends messages earlier than expected, check that your custom event timestamp is sent with the current time instead of a backdated time. For example, if an action-based Canvas has a three-hour delay after a user performs a custom event, Braze uses the timestamp sent with the custom event to evaluate that delay. If the timestamp is backdated by more than three hours, Braze treats the delay as already elapsed and sends the message immediately.




With API-triggered delivery, users will enter your Canvas and begin receiving messages after they have been added using the [`/canvas/trigger/send` endpoint](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_triggered_canvases/) via the API. In the dashboard, you can find an example cURL request that does this as well as assign optional [`context`](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_triggered_canvases/) using the [context object](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/context/). 

![An example of API-triggered delivery with a Canvas ID and an example of a cURL request.](https://www.braze.com/docs/assets/img_archive/Canvas_API_Triggered_Delivery.png?cf4427ae7e5690a60da1dc8aaf5f9520)

You can use the following endpoints for API-triggered delivery:
- [POST: Send Canvas Messages via API-Triggered Delivery](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_triggered_canvases/)
- [POST: Schedule API-Triggered Canvases](https://www.braze.com/docs/api/endpoints/messaging/schedule_messages/post_schedule_triggered_canvases/)
- [POST: Update Scheduled API-Triggered Canvases](https://www.braze.com/docs/api/endpoints/messaging/schedule_messages/post_update_scheduled_triggered_canvases/)



After selecting your delivery method, adjust the settings to match your use case, then continue to setting your target audience.

**Deduplicate behavior for Canvases using the original editor**


Should the window of re-eligibility be less than the maximum duration of the Canvas, a user will be allowed to re-enter and receive more than one component's messages. In the edge case where a user's re-entry reaches the same component as its previous entry, Braze will deduplicate that component's messages. 

If a user re-enters the Canvas, reaches the same component as their previous entry, and is eligible for an in-app message for each entry, the user will get the message twice (depending on in-app message priority) as long as they re-open a session two times.



### Step 1.3: Set your target entry audience

Only the users who match your defined criteria can enter the journey in the **Target Audience** step, meaning Braze evaluates the target audience for eligibility first **before** users enter the Canvas journey. For example, if you want to target new users, you can select a segment of users who first used your app less than a week ago.

In **Entry Controls**, you can limit the number of users every time the Canvas is scheduled to run. For API trigger-based and action-based Canvases, this limit occurs at every UTC hour. 








#### Testing your audience

After adding segments and filters to your target audience, you can test if your audience is set up as expected by [looking up a user](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/) to confirm if they match the audience criteria.

![The "User Lookup" field, which allows you to search by external user ID or Braze ID.](https://www.braze.com/docs/assets/img_archive/user_lookup.png?a23b1b90dd9a139a54218f61761a0040){: style="max-width:80%;"}

#### Selecting entry controls

Entry controls determine if users are allowed to re-enter a Canvas. You can also limit the number of people who would potentially enter this Canvas by a selected cadence depending on your entry schedule type:

- **Scheduled:** Lifetime of the Canvas or every time the Canvas is scheduled
- **Action-Based:** Hourly, daily, or the lifetime of the Canvas
- **API-Triggered:** Hourly, daily, or the lifetime of the Canvas

For example, if you have an action-based Canvas and select **Limit entrance volume** and set the **Maximum entries** field to 5,000 users with **Daily** as the limit cadence, then the Canvas only sends to 5,000 users per day.

![The "Entry Controls" page displaying checkboxes for "Allow users to re-enter Canvas" and "Limit entrance volume". The latter allows you to set the maximum entries and choose a cadence that depends on the entry schedule type (for example, lifetime of the Canvas or every time the Canvas is scheduled for scheduled entry, and hourly, daily, or lifetime of the Canvas for action-based and API-triggered entry).](https://www.braze.com/docs/assets/img_archive/entry_controls.png?dfccafba9b227bdb87b55966803dbf88)

**Tip:**


Braze does not recommend selecting **Every time the Canvas is scheduled** for IP warming as this may lead to increased send volumes.



#### Setting exit criteria

Setting the [exit criteria](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/exit_criteria/) determines which users you want to exit a Canvas. If a user performs the exception event or matches the segments and filters, they won't receive any further messages.

#### Calculating target population

In the **Target Population** section, you can view a summary of your audience, such as your selected segments and additional filters, and a breakdown of how many users are reachable per messaging channel. To calculate the exact number of reachable users in your target audience instead of the default estimation, select [Calculate exact statistics](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/#calculating-exact-statistics).

Note that:

- Calculating exact statistics can take a few minutes to run. This function only calculates the exact statistics at the segment level, not at the filter or filter group level.
- While exact statistics are loading, a rounded estimate may appear. The exact figure appears in the **Reachable Users** section when loaded. You can select **Show Additional Stats** for a detailed breakdown.
- For large segments, it is normal to see slight variation even when calculating exact statistics. The accuracy of this feature is expected to be 99.999% or greater.

To view additional statistics, such as the average lifetime revenue for targeted users, select **Show Additional Statistics**.

![Target Population breakdown with option to calculate exact statistics.](https://www.braze.com/docs/assets/img_archive/canvas_exact_stats.png?8764082ecb944789842b66b28c59f70c)

#### Why the target audience count could differ from the reachable users count







### Step 1.4: Select your send settings

Select **Send Settings** to edit your subscription settings, turn on rate limiting, and to turn on [quiet hours](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/quiet_hours/). By turning on [rate limiting](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/#rate-limiting-and-canvas-components) or [frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/#frequency-capping), you can ease the marketing pressure placed on your users and ensure you aren't over-messaging them.

For Canvases targeting email and push channels, you may want to limit your Canvas so that only the users who are explicitly opted in will receive the message (excluding subscribed or unsubscribed users). For example, say you have three users of different opt-in status:

- **User A** is subscribed to email and is push enabled. This user doesn't receive the email but will receive the push.
- **User B** is opted-in to email but is not push enabled. This user will receive the email but doesn't receive the push.
- **User C** is opted-in to email and is push enabled. This user will receive both the email and the push.

To do so, set the **Subscription Settings** to send this Canvas to "opted-in users only". This option will ensure that only opted-in users will receive your email, and Braze will only send your push to users who are push enabled by default. 

These subscription settings are applied on a per-step basis, meaning that there is no effect on the entry audience. So, this setting is used to evaluate a user's eligibility to receive each Canvas step.

**Important:**


With this configuration, don't include any filters in the **Target Audience** step that limits the audience to a single channel (for example, `Foreground Push Enabled = True` or `Email Subscription = Opted-In`).



If desired, specify [quiet hours](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/quiet_hours/) (the time during which your messages will not be sent) for your Canvas. Check **Enable Quiet Hours** in your **Send Settings**. Then, select your quiet hours in your user's local time and what action will follow if the message triggers inside of those quiet hours.

![The "Quiet Hours" page displaying a checkbox for enabling quiet hours. If enabled, the start time, end time, and fallback behavior can be set.](https://www.braze.com/docs/assets/img/quiet_hours.png?6de04fa223fe658a5708e2199f3615b6)

## Step 2: Build your Canvas

**Tip:**


Save time and streamline your Canvas creation by using [Braze Canvas templates](https://www.braze.com/docs/user_guide/messaging/templates/canvas_templates/braze_templates/)! Browse our library of pre-built templates to find one that fits your use case and customize it to meet your specific needs. For more information, see [Canvas templates](https://www.braze.com/docs/user_guide/messaging/templates/canvas_templates/).



### Step 2.1: Add a variant

![The "Add Variant" button selected to show a context menu with the option to "Add Variant".](https://www.braze.com/docs/assets/img_archive/canvas_add_variant.gif?bc4ddaff9c5b9e2c854a612dfff6ba1b){: style="float:right;max-width:40%;margin-left:15px;"}

Select **Add Variant**, then add a new variant to your Canvas. Variants represent a journey that your users will take and can contain multiple steps and branches.

You can add additional variants by selecting the <i class="fas fa-plus-circle"></i> plus button. When you add new variants, you'll be able to adjust how your users will be distributed between them so that you can cross-compare and analyze the efficacy of different engagement strategies.

![Two example variants in a Braze Canvas.](https://www.braze.com/docs/assets/img_archive/Canvas_Multiple_Variants.png?dbec2d0ad033336455d6bc266a5f1307)

**Tip:**


By default, the Canvas variant assignment is locked in when users enter the Canvas, meaning that if a user first enters a variant, that will be their variant every time they re-enter the Canvas. However, there are ways to circumvent this behavior. <br><br>To do so, you can create a random number generator using Liquid, run it at the beginning of each user's Canvas entry, store the value as a custom attribute, and then use that attribute to randomly divide users.

**Expand for steps**



1. Create a custom attribute to store your random number. Name it something easy to locate, like "lottery_number" or "random_assignment". You can create the attribute either [in your dashboard](https://www.braze.com/docs/user_guide/data/activation/custom_data/managing_custom_data/), or through API calls to our [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/).<br><br>
2. Create a webhook campaign at the beginning of your Canvas. This campaign will be the medium in which you create your random number and store it as a custom attribute. Refer to [Create a webhook](https://www.braze.com/docs/user_guide/channels/webhooks/create_a_webhook/#step-1-set-up-a-webhook) for more. Set the URL to our `/users/track` endpoint.<br><br>
3. Create the random number generator. You can do so with the code [ outlined here](https://community.shopify.com/c/technical-q-a/is-there-any-way-to-generate-random-number-with-liquid-shopify/m-p/1595486), which takes advantage of each user's unique time of entry to create a random number. Set the resulting number as a Liquid variable within your webhook campaign.<br><br>
4. Format the `/users/track` call on your webhook campaign so that it sets the custom attribute you created in step 1 to the random number you've generated on your current user's profile. When this step runs, you will have successfully made a random number that changes each time a user enters your campaign.<br><br>
5. Adjust the branches of your Canvas so that, instead of being divided by randomly chosen variants, they are divided based on audience rules. In the audience rules of each branch, set the audience filter according to your custom attribute. <br><br>For example, one branch may have "lottery_number is less than 3" as an audience filter, while another branch may have "lottery_number is more than 3 and less than 6" as an audience filter.






### Step 2.2: Add Canvas steps

You can add more steps to your Canvas workflow by dragging and dropping components from the **Components** sidebar. Or, select the <i class="fas fa-plus-circle"></i> plus button to add a component with the popover menu.

**Tip:**


As you begin to add more steps, you can switch up the zoom level to focus in on details or take in the entire user journey. Zoom in with <kbd>Shift</kbd> + <kbd>+</kbd> or zoom out with <kbd>Shift</kbd> + <kbd>-</kbd>.



![The component search window adding a delay step to the Braze Canvas.](https://www.braze.com/docs/assets/img_archive/add_components_flow.png?79f81e02a46c962e8037dc41d0cdd9ba){: style="max-width:80%;"}

**Important:**


You can add up to 200 steps in a Canvas. If your Canvas exceeds 200 steps, loading issues may occur.



#### Maximum duration

As your Canvas journey increases in steps, the maximum duration is the longest possible time a user can take to complete this Canvas. This is calculated by adding the delays and trigger windows of each step for each variant for the longest path. For example, if your Canvas has a Delay step with a delay of 3 days and a Message step, the maximum duration of your Canvas will be 3 days.

#### Editing a step

Looking to edit a step in your user journey? Check out how to do this depending on your Canvas workflow!

You can edit any step in your Canvas workflow by selecting any of the components. For example, let's say you want to edit your first step, a [Delay](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/delay_step/) component, in your workflow to a specific day. Select the step to view its settings and adjust your delay to March 1. This means on March 1, your users will move to the next step in your Canvas.

![An example "Delay" step with the delay set to "Until a specific day."](https://www.braze.com/docs/assets/img_archive/edit_delay_flow.png?85910b32d35e4ab16123584dece94166)

Or you can quickly edit and adjust the **Action Settings** of your [Action Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/action_paths/) step to hold users for a window of time. This prioritizes their next path based on the actions during this evaluation period.

![The second step in the canvas, "Action Settings", with an evaluation window set to 1 day.](https://www.braze.com/docs/assets/img_archive/action_paths_flow.png?81a7e5358605cc4e4c3c36be45171bcf)

The lightweight components in Canvas allow for a simple editing experience, so adjusting the finer details of your Canvas is made easier. 

#### Messages in Canvas

Edit the messages in a Canvas component to control messages that a particular step will send. Canvas can send email, mobile, and web push messages, and webhooks to integrate with other systems. Similar to campaigns, you can use certain [Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/using_liquid/) templating to personalize your messages.

**Tip:**


Did you know you can include Canvas component names in your messages and link templates?<br>
Use the `campaign.${name}` Liquid tag in Canvas to display the current Canvas component name.



The Message component manages the messages sent to users. You can select your **Messaging Channels** and adjust **Delivery Settings** to optimize your Canvas messaging. For more details on this component, check out [Message](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/message_step/).

![The "Set up Messages" step, with "Messaging Channels" selected which displays the list of available messaging channels, such as android push, content cards, email, and more.](https://www.braze.com/docs/assets/img_archive/message_setup_settings_flow.png?cf71f5ea09b73a5015c94e63ab2b10e8)

Select **Done** after you've finished configuring your Canvas component.




The [`context` object](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/context/) is configured in the **Entry Schedule** step of creating a Canvas and indicates the trigger that enters a user into a Canvas. These properties can also access the properties of entry payloads in API-triggered Canvases. Note that the `context` object can be up to 50 KB. 

Use the following Liquid when referencing these properties created upon entering the Canvas:  ``context.${property_name}`` . Note that the events must be custom events or purchase events to be used this way.


For example, consider the following request: `\"context\" : {\"product_name\" : \"shoes\", \"product_price\" : 79.99}`. You could add the word "shoes" to a message with this Liquid ``{{context.${product_name}}}``.





Event properties are the properties set by you on custom events and purchases. These `event_properties` can be used in campaigns with action-based delivery as well as Canvases. 

In Canvas, custom event and purchase event properties can be used in Liquid in any Message step that follows an Action Paths step. Use this Liquid  ``{{event_properties.${property_name}}}``  when referencing these `event_properties`. These events must be custom events or purchase events to be used this way in the Message component.

In the first Message step following an Action Path, you can use `event_properties` related to the event referenced in that Action Path. You can have other steps (that are not another Action Paths or Message step) in between this Action Paths step and the Message step. Note that you'll only have access to `event_properties` if your Message step can be traced back to a non-Everyone Else path in an Action Path step




### Step 2.3: Edit connections

To move a connection between steps, select the arrow connecting the two components and select a different component. To remove the connection, select the arrow followed by **Cancel Connection** in the footer of the Canvas composer.

If a single variant has multiple branches with the same audience and send time, Braze does not guarantee an even split across those branches. Distribution may favor the branch that was created first. For an even split, use [Random Bucket Number](https://www.braze.com/docs/user_guide/messaging/ab_testing/concepts/random_bucket_numbers/) filters on each branch. For more information, see [What happens if the audience and send time are identical for a Canvas that has one variant, but multiple branches?](https://www.braze.com/docs/user_guide/messaging/canvas/faqs/#what-happens-if-the-audience-and-send-time-are-identical-for-a-canvas-that-has-one-variant-but-multiple-branches).

## Step 3: Add a control group

You can add a control group to your Canvas by selecting the <i class="fas fa-plus-circle"></i> plus button to add a new variant. 

Braze will track the conversions for users who are placed into the control group, although they will not receive any messages. To preserve an accurate test, we will track the number of conversions for your variants and the control group for exactly the same amount of time, as shown on the conversion event selection screen. 

You can adjust the distribution between your messages by double-clicking the **Variant Name** headers.

In this example, we have our Canvas divided into two variants. Variant 1 has 70% of the users. The second variant is a control group with the remaining 30% of users.

![An example variant in a Braze Canvas, where 70% go to "Variant 1", which delays for 1 day in the first step, then sends a message in the second step. The other 30% go to a "Control" that does not have any follow-up steps.](https://www.braze.com/docs/assets/img_archive/Canvas_Multivariate_Flow.png?fedf4425278a87365387d0498dfa81e2)

### Intelligent Selection for Canvas

Intelligent Selection capabilities are now available within multivariate Canvases. Similar to the [Intelligent Selection](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_selection/) feature for multivariate Campaigns, Intelligent Selection for Canvas analyzes the performance of each Canvas variant and adjusts the percentage of users being funneled through each variant. This distribution is based on each variant's performance metrics to maximize the total expected number of conversions.

Keep in mind that multivariate Canvases allow you to test more than copy, but timing and channels as well. Through Intelligent Selection, you can test Canvases more efficiently and have confidence that your users will be sent on the best possible Canvas journey.

![The "Intelligent Selection" option is enabled in the "Edit Variant Distribution" page. As it analyzes and optimizes the Canvas, it displays a horizontal bar across the page that's split into several sections, each varying in color and size. This is only a visual representation and does not correlate to any specific analytics.](https://www.braze.com/docs/assets/img_archive/canvas_intelligent_selection.png?63e19aa453f66a2734a0eda5909c1f69)

Intelligent Selection for Canvas optimizes your Canvas results by making gradual real-time adjustments to the distribution of users sorted into each variant. When the statistical algorithm determines a decisive winner among your variants, it will rule out the underperforming variants and slot all future eligible recipients of the Canvas into the Winning Variants. 

For this reason, Intelligent Selection works best on Canvases that have new users entering frequently.

## Step 4: Save and launch

After you're done creating your Canvas, select **Launch Canvas** to save and launch your Canvas. After you've launched your Canvas, you'll be able to view analytics for your journey as they come in on the **Canvas Details** page. 

You can also save your Canvas as a draft if you need to come back to it.

![An example Canvas in Braze.](https://www.braze.com/docs/assets/img_archive/Canvas_Analytics.png?f1899e1be60417bd7f484e922d7763f3)

**Tip:**


Need to make edits to your Canvas after launch? Well, you can! Check out [Editing Canvases after launch](https://www.braze.com/docs/post-launch_edits/) for more information.


