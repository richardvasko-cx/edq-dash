# Exit criteria

> By adding exception events directly to your Canvas entry rules, you can remove users from the journey when they perform a specific action.
> Braze records the exit as soon as the event happens.
> How quickly a user fully leaves the Canvas depends on the step they're in, especially for Delay steps.
> For more information, see [How users exit](#how-users-exit).

### How users exit

When a user performs the exit event, Braze immediately marks them to exit the Canvas. After that, they don't advance to any later steps.

If they're in a Delay step, they remain in that step until the delay period ends. They don't proceed into any following steps when the delay finishes—they fully leave the Canvas instead. Depending on where you review Canvas data, you may see exit-related activity when the exit event occurs and again when the Delay step completes and the user fully exits the Canvas.

For example, if a user is in a Delay step for 30 days and they perform the exit event on the first day of the Delay step, they're marked to exit right away, but they don't fully leave the Canvas until the Delay step ends (29 days later).

Let's consider another example when using time-based exit criteria. A user enters a Delay step set to 24 hours on July 1 at 12 am. In this delay period, they perform the exit event "Last placed an order less than 1 hour ago" at 3 am. This user will be evaluated for the exit criteria on July 2 at 12 am, which is the conclusion of the Delay step's duration. Because 21 hours have passed since their order placement on July 1 at 3 am, they won't exit the Canvas because they didn't place an order within the one hour of exiting the Delay step on July 2. This impacts the "Total Exits by Exit Criteria" in your Canvas analytics, which are only updated after a user has fully exited the Canvas.

## Setting up exit criteria

In the **Target Audience** step of the Canvas builder, you can set up exit criteria to identify which users you want to exit your Canvas. 

The exit criteria includes an exception event, which is the specific action that can cause users to exit the Canvas.

![The exit criteria set up to re-engage users who have browsed products but haven't added them to their cart or placed an order yet.](https://www.braze.com/docs/assets/img/exit_criteria.png?134c3b1b16b8b71aaa0c8da55c7d80a6){: style="max-width:90%;"}

### Selecting exception events {#exception-events}

When a user performs the exception event, Braze marks them to exit according to [How users exit](#how-users-exit). Exception events apply while a user is in the Canvas, including when they're waiting in a step such as a Delay step.

Let's say you have a Canvas set up to promote a new product. In this case, the order of the product would be the exception event. This way, after a user places the order, they won't receive more messages about a product they already purchased. Exception events keep your messaging relevant and personalized.

Additional exception events include:

- Placing an order
- Starting a session
- Performing a custom event
- Performing a conversion event
- Adding an email address
- Changing a custom attribute value
- Updating a subscription status
- Updating a subscription group status
- Interacting with a campaign
- Entering a location
- Triggering a geofence
- Sending an SMS inbound message
- Sending a WhatsApp inbound message
- Sending a LINE inbound message
- Performing a cart updated event
- Performing a checkout completed event
- Performing a checkout started event

#### Scheduled steps

For Canvas steps that don't keep the user on a Delay step until a future time, the user typically leaves the Canvas as soon as the current step completes. That completion is often immediately after the exception event, because there is no remaining delay timer on that step. This differs from a Delay step, where the user stays until the delay ends even after they're marked to exit (see [How users exit](#how-users-exit)).
 
#### Triggered steps

If a Canvas step is triggered by an event, the last scheduled send enqueued from that trigger will be canceled, but the user will remain inside the Canvas for the duration of the window. That means the user can still be sent the step if they perform the trigger event again within the window. After the window passes, the user will then exit the Canvas.

### Using segments and filters

You can also add segments and filters in the exit criteria. This means users who match the segment and filter will exit the Canvas and won't receive any further messaging. 

For example, if the first step in a Canvas is a Delay step with a five-day delay, exit criteria are evaluated when that step completes. If a user meets the exit criteria while they're in the Delay step, they're marked to exit immediately, but they fully leave the Canvas at the end of the five days (and they don't advance to any steps after the Delay).

**Note:**


Array attributes aren’t currently supported as exit criteria on exception events.



### Having the same exit event and conversion event

When the exit event and conversion event are the same, both the conversion and exit events will be accounted for. For example, if a Canvas has a Delay step and a user performs the exit criteria while in that Delay step, the exit event will increment as soon as the user exits the Delay step. The conversion will also increment as soon as the event is logged on the user profile.

Conversions are tracked even after the Canvas ends, but exits are not tracked once the user exits the Canvas. The conversion window extends to three days beyond the maximum duration of the Canvas. This means conversions will continue to be tracked after exits stop being tracked. 

The minimum time for a conversion window is five minutes. Set the conversion windows to five minutes for your conversion events to get as close as possible to parity with exit events. We also recommend setting the conversion window to at least match the longest path in the Canvas.

Consider the following example on how analytics are calculated:

1. Ten users go through the Canvas.
2. Three users perform the conversion event within five minutes (the number of exit events is three, and the number of conversion events is three).
3. Another five users exit the Canvas after five minutes but perform the conversion event after two days (the number of exit events remains the same, but the conversion event increases to eight).
4. The last two users exit the Canvas after five minutes but don't perform the conversion event, or perform it after three days and five minutes (they aren't counted in either exit events or conversion events metrics).

## Example

Let's say we want to target users who haven't placed an order at our backpack supply company yet. To set up the exit criteria, we would:

1. Select **Place an Order** as the exception event.
2. Select **Add Trigger**. 
3. For **Segments**, select **Used in last day** so that when our Canvas launches, the audience will exclude users who have made any purchases.
4. For **Filters**, select **Purchase behavior** > **Number of purchases** > **Purchased product**.
5. Set the filter group to `backpack-example exactly 1`. This means that users who have purchased our backpack product would exit the Canvas.

![Exit Criteria settings with "Makes Any Purchase" as the exception event, so if a user makes any purchase, then they will exit this Canvas.](https://www.braze.com/docs/assets/img_archive/exit_criteria_example.png?ae54f048f9604de07fd59509237d0a44){: style="max-width:80%;"}

**Tip:**


To set up exit criteria that compare event properties against Canvas entry properties (for example, exiting only when a user purchases the specific item they abandoned), see [Matching exit criteria to entry events](https://www.braze.com/docs/user_guide/messaging/canvas/ideas_and_strategies/matching_entry_and_exit_criteria/).


