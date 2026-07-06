# Funnel reports

> The **Funnel Report** page offers a visual report that allows you to analyze the journeys your customers take after receiving a campaign or Canvas, including the different actions customers take on their path to conversion and where drop-offs occur. ![Screenshot of the Funnel Report page showing a conversion funnel for campaign or Canvas performance](https://www.braze.com/docs/assets/img/funnel_report/funnel_report2.png?542fd42e0859c06c2b50e56a04c44476){: style="float:right;max-width:15%;margin-bottom:15px; border: 0"}

If your campaign or Canvas uses a control group or multiple variants, you can understand how the different variants have impacted the conversion funnel at a more granular level and optimize based on this data.

![Funnel Report 1](https://www.braze.com/docs/assets/img/funnel_report/funnel_report1.jpg?71f7939698c7d344fc174a5ec2474519){: style="max-width:80%;"}

## Use cases

Funnel reports can answer questions such as:

- **Onboarding:** After you send a "Welcome, newcomer!" Canvas, how many users completed each step of the onboarding path?
- **Purchase completion:** Where did purchase drop-offs occur for a seasonal promotion?
- **Custom conversions:** What share of users started a session, listened to a track, and created a playlist after a "New release" push?
- **Upsell drop-offs:** On an upsell Canvas, where did users exit before subscribing?
- **Post-engagement behaviors:** Which email variant drove more purchases after users opened it?
- **Conversion frequency:** What percentage of users referred a friend at least three times after receiving a campaign?

## Setting up funnel reports

![Funnel Report 5](https://www.braze.com/docs/assets/img/funnel_report/canvas_campaign.png?aade1fa4aa491be25a2cdb754df52bfd){: style="float:right;max-width:40%;border:0;margin-left:15px;"}

You can run funnel reports for existing active campaigns and Canvases. These reports show a series of events that a campaign recipient progresses through over 1-30 days from the date they enter the Canvas or campaign. A user is considered converted through a step in the funnel if they perform the event in the specified order.

Funnel reporting is available from the following locations in the dashboard:

- The **Campaign Analytics** page for a specific campaign
- The **Canvas Details** page for a specific Canvas, by selecting the **Analyze Variants** button 

**Important:**


Funnel Reports are not available for [API campaigns](https://www.braze.com/docs/api/api_campaigns/).



### Step 1: Select a date range

You can select a time frame for your report (within the past six months), and refine the data to see users who, upon entering the campaign or Canvas, completed the funnel events within a set window (maximum of 30 days). In the following example, your funnel would look for users who received this campaign or Canvas in the last seven days and completed the funnel within three days.

**Note:**


If you set the window to complete the funnel to one day, then the funnel event must occur within 24 hours of message receipt. However, if you select multiple days, the timing window is counted as calendar days in the company time zone.



![Funnel report for a Canvas with "Last 7 Days" selected in the time frame dropdown.](https://www.braze.com/docs/assets/img/funnel_report/funnel_report5.png?c8b8cd5abbd09c5754556a421fed7bab){: style="max-width:90%;"}

### Step 2: Select events for funnel steps

For every funnel report, the first event is when the user receives your message. From there, the subsequent events you choose funnel the number of users who performed those events, as well as the previous events. 

#### Available funnel report events

| Campaign | Started Session, Made Purchase, Performed Custom Event, Message Engagement Event |
| Canvas | Started Session, Made Purchase, Performed Custom Event, Received Canvas Step, Interacted with Step |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Available funnel report events" }

**Note:**


The **Interacted with Step** report event can only be used with Canvas steps that use the Email or push messaging channels.



![Funnel report for a Canvas with a dropdown of the available report events.](https://www.braze.com/docs/assets/img/funnel_report/funnel_report3.png?08901a8d17b19ca47080f7fdba34af4b){: style="max-width:80%;"}

Funnel reports allow you to compare the success of your messages beyond just the conversion events or message engagement events you initially set up. So if there's a conversion event you didn't add initially, you can still track conversions for that event using a funnel.

For example, if you select a 14-day report time window, followed by the events `Added to cart` and `Made purchase`, you will see both the number of users who added to cart within 14 days of receiving the message and the number of users who added to cart and then made a purchase within 14 days of receiving the campaign.

As another example, you may want to see the percentage of users that converted on an email after clicking on it. To calculate this, you could create a report where the second event is clicking your email and the third event is performing your conversion event.

After selecting **Build Report**, the funnel report may take several minutes to generate. During this time, you can navigate away from the report to other pages in the dashboard. You'll receive an in-dashboard notification when your report is ready.

## Interpreting your funnel report

In your funnel report, you can directly compare the control group alongside the variants you have set up. Each consecutive event will show what percentage of the previous users completed that action and converted through the funnel.

### Funnel report components

- **Horizontal axis**: Displays the percentage of message recipients who performed those actions. 
- **Chart**: Displays the number of received messages, the number of users that performed the prior actions, as well as the action you chose, the conversion rate, and the percentage change from control.
- **Regenerate Option**: Allows you to regenerate your report and indicates when the current report was last generated. 
- **Variants**: Denoted by colored columns, funnel reporting allows up to 8 variants and a control group. By default, the **chart** will only show three variants. To see more, you can manually select the rest of the variants.

![Funnel report chart.](https://www.braze.com/docs/assets/img/funnel_report/funnel_report4.jpg?0b045f632dcb0e9450fbc676e6fee707)

**For campaigns with multiple variants**: Braze will show a table with metrics for each event and variant and the percentage change from control. The conversion rate is the number of users who performed the event (and subsequent ones) per message recipient.

**For campaigns with re-eligibility**: If a user receives the campaign more than once in the report time window, Braze will determine whether the user should be included in the funnel based on the actions this user took after the first time they received the campaign within the time window.
- Note that there may be a discrepancy between the funnel and standard conversion values, as users can convert more than once with re-eligibility, but funnel reports will convert a maximum of one time even if a user performs the event more than once. 

**For multivariant campaigns with re-eligibility**: If a user receives multiple variants from the campaign during the report time window, Braze will determine whether they should be included in the variant funnel based on the actions this user took after the first time they received the campaign variant. This means that the same user could count toward multiple different variants if they received multiple variants during the time window for the funnel.

**Important:**


Orphaned users are not tracked in funnel reports. When an anonymous user enters a Canvas or campaign and later becomes identified through the `changeUser()` method, their Braze ID changes. Funnel reports only track follow-up events that match the user ID at the time of entry and do not account for events performed by the user after their ID changes. This means that conversion events performed by the user after becoming identified will not be included in the funnel report.



## Frequently asked questions

### Does a user fall out of the report if they skip an event?

Yes. A user leaves the funnel at the first step where they don't perform the next event in the exact sequence you configured.

### How many events can I include in a funnel report?

There isn't a hard limit, but four to six events covers most use cases. Very long funnels can run slowly or time out.

### What channels support the **Interacted with Step** funnel event?

**Interacted with Step** is available for Canvas steps that use **email** or **push** channels.

### Why is my funnel report taking a long time to load?

Large queries can time out. Try a shorter report window, fewer funnel steps, or both.

### Why are the analytics on the Canvas different from the funnel report?

Canvas step analytics can show higher counts than the funnel for the same calendar dates because step analytics include broader engagement and conversions, while the funnel enforces event order and timing rules.

#### Canvas analytics (Analyze Variants)

The date range filters events by **when they occurred**. If you select January 1–7, you see all entries and conversion events that happened during that window—regardless of when the user entered the Canvas. A user who entered on January 1 but converted on January 8 would show one entry and zero conversions, because the conversion fell outside the selected dates. The conversion window configured on the Canvas step can extend beyond the funnel's maximum follow-up window, so step-level analytics may capture conversions over a longer horizon.

#### Funnel reports

The date range filters users by **when they entered** the Canvas. If you select January 1–7, the report includes every user who entered during that window, then tracks their actions for the funnel completion window you configure (up to 30 days after entry). The same user who entered on January 1 and converted on January 8 would show one entry and one conversion, because the conversion happened within the post-entry window.

Additionally, funnel reports require events to occur in the specified order and count each user at most once, while Canvas analytics count all conversions and engagement without an ordering constraint.

