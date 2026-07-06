# Query Builder templates

> Access [Query Builder](https://www.braze.com/docs/user_guide/analytics/reports/query_builder/) templates by selecting **Query Template** when creating a report. All templates surface data from up to the last 60 days, but you can directly edit that and other values in the editor.<br><br>For definitions of the metrics that may appear in your Query Builder reports, refer to the [Report Metrics Glossary](https://www.braze.com/docs/user_guide/analytics/metrics_glossary/) and filter by the respective channel.

## Channel templates

<style>
table th:nth-child(1) {
    width: 30%;
}
table th:nth-child(2) {
    width: 70%;
}
table td {
    word-break: break-word;
}
</style>

| Query name | Description | 
| --- | --- | 
| Channel engagement and revenue | This report shows, for each channel, all engagement metrics (such as opens and clicks), revenue, number of transactions, and average price. {::nomarkdown} <ul> <li> <i>Number of transactions:</i> Number of purchase events </li> <li> <i>Average price:</i> Revenue divided by transactions </li> </ul> {:/} ![](https://www.braze.com/docs/assets/img_archive/channel_engagement_revenue.png?95c6c27b4371b05bb198e91118f41bf1) |
| Purchases and revenue by segment | This report shows metrics for the messages sent for a specific segment. <br><br> Purchase metrics are unique throughout the reporting period. One user can generate at most one purchase. Revenue takes into account every purchase from the reporting period. |
| Purchases and revenue for variants or steps, by segment | This report shows metrics for the variants or Canvas steps of the messages sent to each segment. <br><br> Purchase metrics are unique throughout the reporting period. One user can generate at most one purchase. Revenue takes into account every purchase from the reporting period. |
| Top/bottom messaging for purchases | This report shows purchase metrics for the top or bottom campaigns, Canvases, or Canvas steps. Each row is a campaign, Canvas, or Canvas step. You must specify whether to display the top or bottom performers, and the specific metric to run this analysis for (such as *Unique purchases upon receipt*, *Revenue upon receipt*, *Unique recipients*). <br><br> The rows in top performer reports will be ordered from best to worst, while the rows in bottom performer reports will be ordered from worst to best. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Channel templates" }

## Campaign templates

| Query name | Description | 
| --- | --- | 
| Campaign revenue by country | This report shows revenue per country for a specific campaign. To run this report, you must specify the API identifier for a campaign. You can find a campaign's API identifier at the bottom of that campaign's details page. <br><br> This report shows, for each country, the amount of revenue generated, number of orders, number of returns, net revenue, and gross revenue.<br><br> {::nomarkdown} <ul> <li> <i>Orders:</i> Number of purchase events </li> <li><i> Returns:</i> Number of purchase events with negative revenue values </li> <li><i> Net revenue:</i> Revenue of all non-returns </li> <li><i> Gross revenue:</i> Revenue that includes the value of returns </li></ul>{:/} ![](https://www.braze.com/docs/assets/img_archive/campaign_revenue_country.png?8d43a4b59786dd3519808f29627ac9a6){: style="max-width:70%;"} |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Campaign templates" }

## Canvas templates

| Query name | Description | 
| --- | --- | 
| Canvas revenue by country | This report shows revenue per country for a specific Canvas. To run this report, you must specify the API identifier for a Canvas. You can find the Canvas API identifier under **Analyze Variants**. <br><br> This report shows, for each country, the amount of revenue generated, number of orders, number of returns, net revenue, and gross revenue.<br><br> {::nomarkdown} <ul> <li> <i>Orders:</i> Number of purchase events </li> <li><i> Returns:</i> Number of purchase events with negative revenue values </li> <li><i> Net revenue:</i> Revenue of all non-returns </li> <li><i> Gross revenue:</i> Revenue that includes the value of returns </li></ul>{:/} ![](https://www.braze.com/docs/assets/img_archive/canvas_revenue_country.png?5dca6e73457ae0416826f85445890141){: style="max-width:70%;"} |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Canvas templates" }

## Email templates

| Query name | Description | 
| --- | --- | 
| Email bounces per domain | The number of bounces per email domain, broken down into total bounces, hard bounces, and soft bounces. <br> ![](https://www.braze.com/docs/assets/img_archive/query_builder_q4.png?9393d5b26445b3a5f771223292b784c8){: style="max-width:60%;"} |
| Email delivery metrics by day | This report shows metrics for the messages sent on each day, such as how many emails were sent, delivered, soft bounced, and hard bounced. <br><br> All metrics are unique throughout the reporting period. For example, if a welcome email soft bounced one time on November 21, two times on November 22, and was never delivered: {::nomarkdown} <ul><li> The <i>Soft Bounces</i> metric for November 21 increases by one.</li><li> The <i>Soft Bounces</i> metric for November 22 is not affected. </li></ul>{:/} ![](https://www.braze.com/docs/assets/img_archive/email_delivery_day.png?a772327790d5fb0443129128ca8783f7)|
|  Email engagement metrics by segment | This report shows metrics for the messages sent to each segment, such as how many emails were sent, delivered, soft bounced, and hard bounced. <br><br> All metrics are unique throughout the reporting period. For example, if a welcome email soft bounced one time on November 21, two times on November 22, and was never delivered: {::nomarkdown} <ul><li> The <i>Soft Bounces</i> metric for November 21 increases by one. </li><li> The <i>Soft Bounces</i> metric for November 22 is not affected.</li></ul>{:/} ![](https://www.braze.com/docs/assets/img_archive/email_engagement_segment.png?4d3dbfbc3bb93723c36e858b017d94b2) |
| Email engagement metrics for variants or steps, by segment | This report shows metrics for the variants or Canvas steps of the messages sent to each segment. These metrics include how many emails were sent, delivered, soft bounced, and hard bounced. <br><br> All metrics are unique throughout the reporting period. For example, if a welcome email soft bounced one time on November 21, two times on November 22, and was never delivered: {::nomarkdown} <ul><li> The <i>Soft Bounces</i> metric for November 21 increases by one. </li> <li> The <i>Soft Bounces</i> metric for November 22 is not affected.</li></ul> {:/} |
| Email performance by country | This report shows the following metrics for each country: sends, indirect open rate, and direct open rate. Country is the country of the user at the time of push send. <br><br> ![](https://www.braze.com/docs/assets/img_archive/query_builder_q3.png?dea9ce73cf0e73331d8fb053852c791e) |
| Email Subscription Change Logs | This report shows the metrics that were logged about each user's subscription change, such as their email address, subscription status, the time their status was changed, and the associated Canvas or campaign. |
| Email subscription group opt-ins and opt-outs | This report shows the number of unique user opt-ins and opt-outs for any email subscription group for each week. You must have at least one [email subscription group](https://www.braze.com/docs/user_guide/channels/email/subscriptions/) in the workspace to run this query. <br><br> ![](https://www.braze.com/docs/assets/img_archive/query_builder_q2.png?17f25ead98da6d878bcd5ee52f83ccee){: style="max-width:70%;"} |
| Email URLs clicked | This report shows the number of clicks each link in an email had. To run this report, you'll need to specify the API identifier for a campaign or Canvas. You can find a campaign's API identifier at the bottom of that campaign's details page and the Canvas API identifier under **Analyze Variants**. <br><br> This report shows de-personalized links and a count of clicks for each link. Your CSV download will include the user IDs of all users that clicked, the link they clicked on, and a timestamp of when they clicked. <br><br> *De-personalized URLs:* URLs that are stripped of Liquid tags. <br><br> ![](https://www.braze.com/docs/assets/img_archive/query_builder_q5.png?328fcfcef7c90b7df29a94aceb56165e){: style="max-width:70%;"} |
| Top/bottom messaging for email engagement | This report shows email engagement metrics for the top or bottom campaigns, Canvases, or Canvas steps. You must specify whether to display the top or bottom performers, and the specific metric to run this analysis for (such as *Sent*, *Soft Bounces*, and *Unique Opens*). <br><br> The rows in top performer reports will be ordered from best to worst, while the rows in bottom performer reports will be ordered from worst to best. <br><br> ![](https://www.braze.com/docs/assets/img_archive/top-bottom-email.png?86fb7eb3972c19b00f79176de7214716) |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Email templates" }

## Mobile templates

| Query name | Description | 
| --- | --- | 
| Device carriers | The number of users per device carrier, such as Verizon and T-Mobile. <br><br> ![](https://www.braze.com/docs/assets/img_archive/device_carriers.png?7ffa6a60e466e7f6aa4646621f76be83){: style="max-width:50%;"} |
| Device models | The number of users per device model, such as iPhone 15 Pro and Pixel 7. <br><br> ![](https://www.braze.com/docs/assets/img_archive/device_models.png?60ea1b8692a03ef5a3963b7d20404a8c){: style="max-width:50%;"} |
| Device operating systems | The number of users per operating system, such as 17.4 and Android 14. <br><br> ![](https://www.braze.com/docs/assets/img_archive/os_version.png?99ab2798b11159aeabee4ee50d9b500b){: style="max-width:50%;"} |
| Device screen resolutions | The number of users per device screen resolution, such as 1179x2556 and 750x1334. <br><br> ![](https://www.braze.com/docs/assets/img_archive/device_screen_resolutions.png?9d78e23debdedceb56d8e3c4ad9b3c52){: style="max-width:40%;"} |
| SMS Error Codes | This report shows the error type and number of errors for each SMS error code. <br><br>![](https://www.braze.com/docs/assets/img_archive/sms_errors.png?da3a83c8e6a01db7405fcb2e3a3c4186){: style="max-width:50%;"} |
| SMS Provide Errors by User | This report shows SMS error codes for a specific user. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Mobile templates" }

## Push templates

| Query name | Description | 
| --- | --- | 
| Push performance by country | This report shows the following metrics for each country: deliveries, open rate, and click rate. Country is the country of the user at the time of email send. <br><br> ![](https://www.braze.com/docs/assets/img_archive/query_builder_q7.png?176921003d9c7b23c30fd233a5969355){: style="max-width:70%;"} |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Push templates" }

## Segment breakdown

| Query name | Description |
| -- | -- |
| Email engagement metrics by segment | This report shows email performance metrics broken down by segment at the campaign or Canvas level. |
| Purchases and revenue by segment | This report shows purchase and revenue metrics broken down by segment for a specific campaign or Canvas. |
| Top/bottom messaging for email engagement | This report shows the campaigns, Canvases, or Canvas steps that were the highest or lowest performers for a specified email engagement metric.|
| Top/bottom messaging for purchases | This report shows the campaigns, Canvases, or Canvas steps that were the highest or lowest performers for a specified purchase or revenue metric. |
| Push performance by segment | This report shows push metrics broken down by segments.|
{: .reset-td-br-1 .reset-td-br-2 aria-label="Segment breakdown" }