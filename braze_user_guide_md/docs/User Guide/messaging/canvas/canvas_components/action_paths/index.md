# Action Paths 

> Action Paths in Canvas allow you to sort your users based on their actions. 

![An Action Paths step  in a Canvas user journey.](https://www.braze.com/docs/assets/img/canvas_actionpath.png?a3b4e6240364076cdacfdcebd8cf9b77){: style="float:right;max-width:40%;margin-left:15px;"}

Using Action Paths, you can:

* Customize user paths based on a specific action, including user engagement events and custom events
* Hold users for a given duration to prioritize their next path based on their actions during this evaluation period

## Creating an action path

To create an action path, add a component to your Canvas. Drag and drop the component from the sidebar, or select the <i class="fas fa-plus-circle"></i> plus button at the bottom of a step and select **Action Paths**.

### Action settings

In the **Action Settings**, set the **Evaluation Window** to determine how long users are held in the step. By default, users are evaluated within one day, but you can adjust this window by seconds, minutes, hours, days, and weeks depending on your Canvas. The maximum evaluation window for an action path is 31 days.

Within the **Action Settings**, you can also turn on the ranked order for your components by switching on the **Advance users based on ranked order** toggle.

![The Action Settings with an evaluation window of 1 day.](https://www.braze.com/docs/assets/img/actionpath_settings.png?9af8014d590176b0f4e2f20e56a062d0)

By default, **Ranking** is off. When a user enters the action path and performs the trigger event attached to any action group, they immediately advance through the relevant action group based on the **first qualifying action** they perform after entering the step. If a user performs a second action that matches a different action group, they do not switch paths—the first action determines their route. If a user doesn't perform a trigger event, then they advance through the default **Everyone Else** group at the end of the evaluation period.

When **Advance users based on ranked order** is turned on, this means **Ranking** is on. So, all users are held until the end of the evaluation window. At the end of the evaluation period, users advance through the highest priority action group that they are eligible for at the end of the evaluation window. Users who do not perform any of the actions during the evaluation window advance through the default **Everyone Else** group.

**Tip:**


To route users based on their current attributes or segment membership rather than actions they perform, use [Audience Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/audience_paths/) instead.



Note that you can trigger an action path when a nested custom attribute object changes, but not for arrays of nested custom attributes or changes to object array data types.

#### In-app messages

Note that when the action group trigger is starting a session, and the next step is an in-app message, the user must perform two session starts to receive the in-app message. The first session assigns the user to the action group within the action path, and the second session triggers the in-app message.

#### Ranking status example

Let's say you have an action path with an evaluation period of one day with two action groups: Group 1 and Group 2. Group 1 has a trigger event "Start Session", and Group 2 has "Place an Order". If **Ranking** is turned on, then all users in the action path are "held" for one day. At the end of the day, if a user has started a session and placed an order, then they advance to the highest rank path. In this case, the user would advance to Group 1. 

In the preceding example, if **Ranking** is off and a user performs one of the trigger events ("Start Session" or "Place an Order"), that user is advanced in the relevant action group based on the trigger action.

Note that Canvas entry properties differ from event properties. Canvas entry properties are properties from the event that triggered the Canvas. These properties can only be used in the first full step of a Canvas when using the original Canvas workflow. When using Canvas, persistent entry properties are enabled and allow the entry properties to be reused throughout the Canvas. Conversely, event properties originate from an event or action that occurs as the user goes through their workflow.

### Action groups

Add a trigger or multiple triggers to define your action groups. Here, you can select a range of triggers, such as if users:

- Place an order
- Start a session
- Perform a [custom event](https://www.braze.com/docs/user_guide/data/activation/events/custom_events/)
- Perform a conversion event
- Add an email address
- Change a custom attribute value.
  - This includes adding a new attribute with a value to a user profile for the first time (when the attribute was not previously present).
  - Attribute triggers are not available for array attributes.
- Update their subscription status or subscription group status
- Interact with a campaign or Content Card
- Enter a location
- Trigger a geofence
- Send an SMS or WhatsApp inbound message

![An action group named "Group 1" for users who make any purchase.](https://www.braze.com/docs/assets/img/actionpath_group.png?1cf39c37541a14ef4f3e052f46361e13)

In each action group setting, you also have the option to select the checkbox **I want this group to exit the Canvas**, meaning that the users within this group exit the Canvas at the end of the evaluation period.

### Canvases with re-eligibility

If users enter an action path multiple times and have multiple entries in the action path at the same time, the expected behavior varies depending on the **Ranking** status.

| Ranking status | Action path behavior |
|---|--------------|
| **Off** | A user can enter an action path more than once. These entries are held in the action path until a trigger action or event is recorded. If the trigger event does not satisfy an entry's property filters (for example, a [context variable](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/context_variables/) does not match the trigger's property filters), the entry remains in the action path. <br><br>If the trigger event satisfies more than one entry, Braze deduplicates only these entries and immediately advances the earliest matching entry through the relevant action group. |
| **On** | All entries advance at the end of the relevant evaluation window. No deduplication occurs. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Canvases with re-eligibility" }

Note that the rankings aren't [editable after launch](https://www.braze.com/docs/post-launch_edits/).
