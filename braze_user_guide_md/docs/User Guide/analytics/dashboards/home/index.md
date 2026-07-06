# Home dashboard

> The **Home** page on the dashboard provides key metrics for you to track and understand the performance of your app or website, and gives you an at-a-glance high-level understanding of your userbase.

The **Home** page has two main sections:
- [Pick up where you left off](#pick-up-where-you-left-off)
- [Performance overview](#performance-overview)

![Home dashboard in Braze.](https://www.braze.com/docs/assets/img_archive/home_dashboard.png?c8f7e1bf186fca0675a21927328b5b65)

## Pick up where you left off

You can pick up where you left off in the Braze dashboard with direct access to files you've recently edited or created. This section appears at the top of the **Home** page of the Braze dashboard.

You can revisit recently edited or created campaigns, Canvases, and segments. Each card is paired with tags that indicate the content type (campaign, Canvas, segment) and status (active, draft, archived, stopped).

**Note:**


The **Pick up where you left off** section appears after you have edited or created a campaign, Canvas, or segment.



![A Canvas draft, an active segment, and a campaign draft in the "Pick up where you left off" section.](https://www.braze.com/docs/assets/img/pick_up_where_you_left_off.png?3e25bfbc5b4b22749b885d4ac33ca842)

## Performance overview

By default, the **Performance overview** section shows the last 30 days of data for all apps and sites. Your metrics are all calculated based on the selected date range.

![Date range and app fields on the Home dashboard.](https://www.braze.com/docs/assets/img_archive/home_dashboard_select_date.png?7a8989748387be2d0ff60887858a6657){: style="max-width:60%;"}

Percentages are calculated based on the current date range as compared to the previous date range, with the exception of *Monthly Active Users* (MAU), which uses the last day of the prior period instead of a range. 

For example, if you set your date range to **Last 7 Days** and your *Daily Active Users* shows a percent increase of 1.8%, that means you had 1.8% more daily active users this week compared to last week.

![](https://www.braze.com/docs/assets/img_archive/home_dashboard_metric_tile.png?e7d7a85a6183474f67678e2337feac07){: style="max-width:60%;"}

### Show breakdown

Select **Show Breakdown** for each row of the performance overview statistics to view each statistic's value per day for the date range specified.

![Expand](https://www.braze.com/docs/assets/img_archive/home_dashboard_breakdown.png?26679d35e63f45441405b6e04ad06048)

### Performance over time

The **Performance Over Time** graph shows the value of each statistic over the specified date range for the specified apps.

![The Performance Over Time graph showing statistics for new users over 30 days.](https://www.braze.com/docs/assets/img/dashboards/performance_over_time.png?e97109f94357556ec1dd9a804c7b20cf)

You can chart statistics for:
- Banners
- Content Cards
- Daily Active Users
  - (Optional) Breakdown by segment
- Email
- In-app messages
- KPI Formulas
  - Select **Manage KPI Formulas** to create a formula or edit an existing formula.
- LINE
- Monthly Active Users (MAU)
- New Users
- Push
  - (Optional) Breakdown by segment
- Sessions
  - (Optional) Breakdown by segment or app version
- Sessions per Hour
- Sessions per MAU
- SMS
- Stickiness
- Uninstalls
  - (Optional) Breakdown by segment
- Users
- Webhooks
- WhatsApp

## Available statistics

The following are the definitions of your available statistics, how they're calculated, and why they should be important to you.

### Users

*Users* is the total number of users created in that workspace. This includes all users recorded using your app or website at any point in time, and those who might not be associated with a specific app or website. This number is the percentage of how many of your lifetime users are represented as *Monthly Active Users* (MAU), which is useful for seeing user retention over a long period of time.

A low MAU-to-user ratio may indicate that you need to diversify your messaging channels or increase your efforts in reaching out to lapsing users. See our quick win on [capturing lapsing users](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies/capturing_lapsing_users/#capture-lapsing-users) for more info. In general, the MAU-to-lifetime ratio will inevitably decrease over time because of user churn, but Braze tools can help you minimize this effect by keeping users engaged longer.

### Lifetime sessions

*Lifetime sessions* is the total count of sessions that Braze has recorded since integration. A session is each time a user uses the app or visits your website. For a more precise definition on how sessions are defined by platform, view the corresponding 
[iOS](https://www.braze.com/docs/developer_guide/analytics/tracking_sessions/?tab=swift), [Android and FireOS](https://www.braze.com/docs/developer_guide/analytics/tracking_sessions/?tab=android), or [Web](https://www.braze.com/docs/developer_guide/analytics/tracking_sessions/?tab=web) session tracking developer articles.

### Monthly active users

*Monthly Active Users* (MAU) is the number of users that have recorded a session in your app or site in the last 30 days. MAU are calculated nightly with a rolling 30-day window. MAU provides you with a good understanding of an app or site's health over an extended period of time as it smooths out the inconsistencies between days of varying usage intensity.

The percentage next to the MAU count shows the change in MAU for this period compared to the previous period.

$$\text{Change in MAU} = \frac{\text{MAU of last date in range} - \text{MAU of day before start date}}{\text{MAU of day before start date}}$$

#### MAU calculation rules

MAU calculations follow specific rules to ensure accurate and consistent billing:

- **Calculation timing**: Calculated once per day at 12:05 UTC as a 30-day snapshot; counts never change retroactively.
- **Anonymous profiles**: Count **only** when at least one session is logged.
- **Identified profiles**: Count automatically once they exist.
- **Orphaned profiles**: Duplicates merged into another user are **not** counted.
- **CSV uploads**: Users uploaded by CSV count only when `date_of_first_session` or `date_of_last_session` is supplied, or when they later log a session.
- **API deletions**: Deleting a user via API does not update MAU immediately; the count self-corrects in the next monthly cycle.

**Note:**


Anonymous users also count toward your MAU. For mobile devices, anonymous users are device-dependent. For web users, anonymous users are browser cache-dependent.



#### MAU calculation example

The following example demonstrates how MAU calculations work through different user actions:

| Step | Action | Immediate MAU change | Resulting total |
|------|--------|----------------------|-----------------|
| 1 | Create **Anonymous User 1** and log a session | +1 | 1 |
| 2 | Identify **Anonymous User 1** (profile converts to identified) | 0 | 1 |
| 3 | Create **Anonymous User 2** and log a session | +1 | 2 |
| 4 | Identify **Anonymous User 2** as the **same person** as User 1 (User 2 becomes orphaned) | –1 | 1 |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="MAU calculation example" }

MAU snapshots are calculated once per day and never change retroactively. In this example, the MAU count for the day after step 3 permanently remains 2, even though User 2 later becomes orphaned. However, the MAU count for subsequent days reflects only the non-orphaned user. Within any 30-day window, this flow ultimately consumes 1 MAU since only one distinct, non-orphaned user remains.

### Daily active users

*Daily Active Users* (DAU) displays the number of unique users who record at least one session in your app or site on a given day. DAU can be a useful statistic for examining the day-to-day variability of usage of your app or site and tailoring your messaging campaigns to be as effective as possible. For example, your app's usage may see an appreciable spike on weekends—this would inform you that you could reach more users with in-app messages on these days as opposed to weekdays.

### New users

*New Users* tells you how many users who have previously never recorded a session have started using your app or site. This number is a total of new users over the given time period. This statistic can be very valuable for tracking the effectiveness of your advertising efforts.

**Note:**


When you initially integrate Braze, all users will look like new users because Braze has never recorded a session for them before.

Unlike MAU, the *New Users* count can decrease retroactively when Braze merges an anonymous profile into an identified profile and orphans the anonymous profile. Braze removes the orphaned profile from app usage totals, which can lower *New Users* for dates you already viewed. For profile linking behavior, see [User profile lifecycle](https://www.braze.com/docs/user_guide/data/unification/user_data/user_profile_lifecycle/).



**Important:**


Users associated with more than one app are counted separately for each app. This means a single user can contribute to the *New Users* count multiple times if they start sessions across different apps in your workspace.



### Stickiness

The *Stickiness* value is a ratio of a given periods' DAU to MAU. In essence, stickiness measures the percentage of your MAU that come back on a daily basis.

For example, if the date range is set to 30 days, a ratio of 50% indicates that on average an active user is using the app or website for 15 out of 30 days or that about half of your active users come back on a daily basis. Stickiness is an important metric for success because most users don't quit using an app because they actively hate it, but rather because it hasn't become a part of their daily routine. Therefore, you can use stickiness as a proxy for measuring how well you're engaging your users.

The percentage next to the stickiness ratio shows the change in stickiness for this period compared to the previous period.

$$\text{Change in stickiness} = \frac{\text{Stickiness of last period} - \text{Stickiness of this period}}{\text{Stickiness of last period}}$$

The time frames for "last period" and "this period" are determined by the date range you select.

**Important:**


The MAU value is calculated nightly and won't update until the next day.



### Daily sessions

*Daily Sessions* is the number of sessions recorded on a given day. Comparing this value to your DAU count can inform you of how many times your users open the app or visit your website on days where they record at least one session.

### Daily sessions per MAU

*Daily Sessions per MAU* is the ratio of *Daily Sessions* to MAU on a given day. This statistic tells you how many sessions per day you can expect to have logged per MAU. When aggregated and averaged, this can give you an idea of the relative frequency of when your users use your app or site. That is, if your *Daily Sessions per MAU* were on average 0.5, then you could expect each MAU to record a session about every 2 days.  

