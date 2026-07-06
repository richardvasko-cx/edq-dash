# Winning Path in Experiment Paths

> Winning Path is similar to [Winning Variant](https://www.braze.com/docs/user_guide/messaging/ab_testing/optimizations/) in campaigns, and lets you automate your A/B tests.

When Winning Path is turned on in an Experiment Path step, after a specified period of time, all subsequent users are sent down the path with the highest conversion rate.

## Using Winning Path

### Step 1: Add an Experiment Path step

Add an [Experiment Path](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/experiment_step/) to your Canvas, then turn on **Winning Path**.

![Settings in Experiment Path titled "Distribute Subsequent Users to Winning Path". The section includes a toggle for Winning Path, and options to configure the conversion event and experiment window.](https://www.braze.com/docs/assets/img/experiment_step/experiment_winning_path_recurring.png?409af69692dea444c345304a56052660)

### Step 2: Configure Winning Path settings

Specify the conversion event that should determine the winner. If there are no conversion events available, return to the first step of Canvas setup and [assign conversion events](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#choose-conversion-events). 

If you choose opens or clicks as your conversion event, make sure the first step in the path is a [Message step](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/message_step/). Braze only counts engagement from the first Message step in each respective path. If the path starts with a different step (like a Delay or Audience Path step) and the message comes later, that message won’t be included when evaluating performance.

Next, set the **Experiment Window**. The **Experiment Window** specifies how long the experiment runs before the Winning Path is determined and all users who follow are sent down that path. The window begins when the first user enters the step.

![Winning Path Settings with the conversion event "Clicks" selected for a 12-hour experiment window.](https://www.braze.com/docs/assets/img/experiment_step/experiment_winning_settings.png?d4c6987041bfbeb91bd93a61c573595f)

### Step 3: Determine fallback {#statistical-significance}

By default, if the results of the test aren't enough to determine a statistically significant winner, all future users are sent down the best-performing path. Alternatively, you can select **Continue sending all future users the mix of paths**. This option sends future users down the mix of paths according to the percentages specified in the experiment path distribution.

In the event of a tie, Braze selects the path that appears first.

!["Continue sending all future users the mix of paths" selected as what happens to users if the test result isn't statistically significant.](https://www.braze.com/docs/assets/img/experiment_step/experiment_winning_statistical.png?97018ff3ff3f4884ab67d2d6b45fc413)

**Note:**


A Delay Group appears in your path distribution only if your Canvas is set up for one-time entry and your Experiment step has three paths or fewer. Recurring and triggered Canvases do not have a Delay Group when Winning Path is turned on.



### Step 4: Add your paths and launch the Canvas

A single Experiment Path component can contain up to four paths. However, if your Canvas is set up for [one-time entry](#one-time-entry), one path must be reserved for the Delay Group that Braze automatically adds when Winning Path is turned on. This means for Canvases with one-time entry, you can add up to three paths to your experiment.

Finish setting up your Canvas as needed, then launch it. When the first user has entered the experiment, you can check the Canvas to see analytics as they come in and [track your experiment's performance](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/experiment_step#tracking-performance).

After a Winning Path concludes, all subsequent users who enter the Canvas go down the Winning Path, including users who re-entered and were previously in the control group of the Experiment Path step.

## Analytics {#analytics}

If Winning Path is turned on, your analytics view is separated into two tabs: **Initial Experiment** and **Winning Path**.

- **Initial Experiment:** Shows the metrics for each path during the experiment window, which path was selected as the winner, and Canvas conversion metrics. The conversion event used to pick the winner, configured in Winning Path settings, might not be the same as the conversion metric highlighted in Canvas analytics. For more information on how Experiment Path analytics relate to Canvas conversion events and the winning metric, see [Experiment Paths](https://www.braze.com/docs/user_guide/engagement_tools/canvas/canvas_components/experiment_step/#winning-path-and-personalized-paths-performance).
- **Winning Path:** Shows only the metrics for the Winning Path starting from the moment the Initial Experiment finished.

## Things to know

### One-time entry {#one-time-entry}

When using Winning Paths in a Canvas where users are allowed to enter only once, a Delay Group is automatically included. During the duration of the experiment, a percentage of users are held in the Delay Group while the remaining users enter your Experiment Paths.

![Experiment Step with a Delay Group for Winning Path](https://www.braze.com/docs/assets/img/experiment_step/experiment_one_time.png?9ec2f88a02fedfe33f598dfc53bbfeca){: style="max-width:75%"}

When the test finishes and a Winning Path is determined, the users assigned to the Delay Group are directed to the chosen path and continue through the Canvas.

![Experiment Step with a Delay Group sent down the Winning Path](https://www.braze.com/docs/assets/img/experiment_step/experiment_one_time_results.png?75001cd2e328b2910a5b5711bc0f2aeb){: style="max-width:75%"}

### Local time delivery

We don't recommend using local time delivery in Canvases with Winning Paths. This is because experiment windows begin when the first user passes through. Users who are in very early time zones may enter the step and trigger the start of the experiment window much earlier than you expect, which can result in the Experiment concluding before the bulk of your users in more typical time zones have had enough time to enter the Canvas or convert, or both. 

Alternatively, if you wish to use local delivery, use an experiment window of 24-48 or more hours. That way, users in early time zones enter the Canvas and trigger the experiment to start, but plenty of time in the experiment window remains. Users in later time zones still have sufficient time to enter the Canvas and the Experiment Step with Winning Paths and possibly convert before the experiment window expires.

### Variants based on clicks

If you're setting up a Winning Path variant based on clicks, note that the definitions for opens and clicks differ by channel. For specific metrics and definitions by channel, refer to [Report metrics glossary](https://www.braze.com/docs/user_guide/analytics/reporting/report_metrics) and [Email report metrics glossary](https://www.braze.com/docs/user_guide/message_building_by_channel/email/reporting_and_analytics/analytics_glossary).