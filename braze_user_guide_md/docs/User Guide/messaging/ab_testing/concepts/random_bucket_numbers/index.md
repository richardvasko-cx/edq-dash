# Random bucket numbers

> A random bucket number is a user attribute that can be used to create uniformly distributed segments of random users. 

## Overview

When a user profile is created in Braze, that user is automatically assigned a random bucket number between 0 and 9999 (inclusive). You can use these segments to test the effectiveness of multiple campaigns or Canvases on groups of users over time.

### Global Control Group usage

Random bucket numbers are used in your Global Control Group&#8212;a group of users who don't receive any campaigns or Canvases. Braze randomly selects multiple ranges of random bucket numbers and includes users from those selected buckets. Random bucket numbers are assigned with no weighting or consideration of recently allocated numbers. 

**Note:**


When a user is deleted and re-created, the user is assigned a different random bucket number because they are considered a new user.



If you have a Global Control Group set up and want to use random bucket numbers for other use cases, check out [Things to watch out for](https://www.braze.com/docs/user_guide/audience/global_control_group#things-to-watch-for).

### When to use random bucket numbers

If you want to perform long-term testing on the effectiveness of multiple campaigns or Canvases over time, you can use random bucket numbers to segment your users.

### When to use something else

If you want to segment users for testing within a single campaign or single Canvas, use [A/B testing](https://www.braze.com/docs/user_guide/messaging/ab_testing/create_tests/) for campaigns. For Canvases, you can create different [variants](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#step-21-add-a-variant) for journey-level testing, or use [Experiment Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/experiment_step/) for step-level testing.

## Create segments using random bucket numbers

When [creating a segment](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/), add the "Random Bucket #" filter. Then, specify a number or range of numbers to include in your segment.

![A segment filter that is for random bucket numbers no more than "3000".](https://www.braze.com/docs/assets/img_archive/random_buckets_filterexample.png?70bc907b92376374122175f1709a000b)

You may want to use these types of segments if you want to run a test of three different variants and also include a control group. Consider the following sample plan for creating segments of equal size for three variants and a control group:

- Bucket numbers 0 to 2499 correspond to the control segment
- Bucket numbers 2500 to 4999 correspond to the segment that will receive variant 1
- Bucket numbers 5000 to 7499 correspond to the segment that will receive variant 2
- Bucket numbers 7500 to 9999 correspond to the segment that will receive variant 3

Depending on how many segments you want and the distribution of users within each segment, your plan may look different.

For each of your random bucket number segments, including the control group, turn on [analytics tracking](https://www.braze.com/docs/user_guide/analytics/tracking/segment_analytics_tracking/). When evaluating the success of variants relative to the control group, you can go to your [custom events](https://www.braze.com/docs/user_guide/analytics/reports/custom_events_report/) page and view how often each segment has completed certain custom events.

**Tip:**


When using random bucket number segments in a Canvas, for example as a filter in a [Decision Split](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/decision_split/) step, make sure your Canvas [exit criteria](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/exit_criteria/), audience filters, and upstream steps don't target segments that overlap with one of your bucket ranges. If they do, users in that range may be disproportionately removed before reaching the split, causing uneven distribution between paths.



### Random audience re-entry using random bucket numbers

Random audience re-entry can be useful for [A/B testing](https://www.braze.com/docs/user_guide/messaging/ab_testing#what-are-multivariate-and-ab-testing) or targeting specific user groups in your campaigns. To perform random audience re-entry with random bucket numbers, do the following:

1. [Create your segment](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/).
2. Define the random buckets. In your campaign or Canvas, use the random bucket filter to split your audience into different groups. For example, you can specify exactly two random buckets to split your audience into (50% of users per bucket).
3. In the **Target Audiences** section of your campaign or Canvas, specify the random bucket settings. This allows Braze to automatically assign users to the appropriate buckets based on the defined percentages.
4. Set up logic that allows users to re-enter the segment. For example, you can allow users to re-enter the segment if they haven't engaged with an app for 15 days.
5. Launch your campaign and monitor the performance of each bucket. You can analyze metrics such as engagement rates and conversion rates to determine how effective random audience re-entry is with your use case.


