# Send to Destination step

> The Send to Destination step allows you to send users from one Canvas to another. For example, you can connect Canvases that share messaging for promotional offers.

## How it works

![A Send to Destination step to send users to a new Canvas.](https://www.braze.com/docs/assets/img/send_to_destination1.png?fe2eea5457018add9a41076d8483eb24){: style="float:right;max-width:35%;margin-left:15px;"}

Your current Canvas with the Send to Destination step is the source. Within the step, you can choose the destination Canvas. Users from the source Canvas must meet the destination Canvas entry and audience criteria. Let's say you have two Canvases:

- **Source:** Canvas 1, includes a Send to Destination step that sends users to Canvas 2
- **Destination:** Canvas 2, with the entry criteria to enter users who ordered an item

This step allows users from Canvas 1 to be sent to Canvas 2. When users from Canvas 1 enter the Send to Destination step, they are evaluated against Canvas 2's entry and audience criteria to determine if they're eligible to enter the Canvas. In this case, users who ordered an item can enter Canvas 2 and also continue their journey in Canvas 1. For users who haven't ordered an item, they continue their journey in Canvas 1 only.

### Real-time entry

Send to Destination enters users into the destination Canvas as soon as they reach this step. This step acts as a one-time entry point into the destination Canvas. Users who meet the destination Canvas entry and audience criteria begin that Canvas journey in real time. Users who don't meet those criteria at that moment don't enter the destination Canvas and continue in the source Canvas.

## Create a Send to Destination step

### Step 1: Add a step

Drag and drop the **Send to Destination** component from the sidebar, or select the <i class="fas fa-plus-circle"></i> plus button at the bottom of a step and select **Send to Destination**.

### Step 2: Choose your destination

Select the dropdown or enter the Canvas name in the **Destination** field. Then, select **Done**.

![A Send to Destination step set up to send users from a Canvas named "Feature Adoption" to "New Canvas".](https://www.braze.com/docs/assets/img/send_to_destination2.png?319d903f29526f93b190c30c4306f05a)

### Step 3: Preview your destination

You can select **Preview destination** to see the journey for users who meet the entry criteria for the destination Canvas.

After setting up this Canvas step, you can [preview the user path](https://www.braze.com/docs/user_guide/messaging/canvas/testing_canvases/preview_user_paths) to see if a user proceeds to the next step in the current Canvas and if they also proceed to the destination Canvas.

## Frequently asked questions

### Can I set the destination to a draft Canvas?

Yes. The destination Canvas can have a draft or idle status.

### Are context variables preserved?

Yes. The [context](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/sources/context_variables) of the source Canvas is always passed to the destination Canvas.

### Can I use the Send to Destination step to connect Canvases instead of using API or User Update workarounds?

Yes. You can connect Canvases with the Send to Destination step when users should move directly into another Canvas journey.

You don’t need separate User Update steps, API triggers, or webhooks solely to move users between Canvases, as long as they meet the destination Canvas criteria when they’re sent.

### Do users enter at the start of the destination Canvas?

Eligible users enter immediately at the first step of the destination Canvas. They don't wait for a later scheduled entry time on the destination Canvas. You can't link into a specific Canvas step inside the destination Canvas.

### Does the Send to Destination step respect a scheduled destination Canvas entry schedule?

No. If the destination Canvas uses a scheduled entry type, users sent from the Send to Destination step don't wait for the next scheduled evaluation window. They're evaluated and entered when they reach the Send to Destination step if they meet entry and audience criteria of the destination Canvas.

### How does advancement behavior work for Send to Destination steps?

Users who enter the Send to Destination step continue their user journey if there are additional steps in the source Canvas. If users also meet the entry rules of the destination Canvas, they can enter that Canvas and begin that journey.
