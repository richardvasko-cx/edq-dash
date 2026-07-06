# Engagement reports

> Engagement reports let you pull engagement statistics for specific messages from campaigns and Canvases to receive as an email at your preferred time.

**Note:**


You need "Export User Data" permissions to run engagement reports.



With engagement reports, you can manually select campaigns and Canvases to include in your email report, or specify rules to automatically select relevant campaigns and Canvases.

Regardless of the number of campaigns or Canvases you select, up to two CSV files are generated—one for all campaign data and one for all Canvas data. You can access these CSV files from the link embedded inside your report email. Engagement reports are not saved in the Braze dashboard.

Certain data is aggregated at the campaign or Canvas level versus at the individual campaign variant or Canvas step level. If you [delete a Canvas step after launch](https://www.braze.com/docs/user_guide/messaging/canvas/managing_canvases/change_your_canvas_after_launch/#canvas-details), this will also remove the data from engagement reports.

**Tip:**


You can re-run the report to generate updated statistics.



## Creating a new report

### Step 1: Create a report

In your dashboard account, go to **Analytics** > **Engagement reports**. Select **+ Create New Report**.

### Step 2: Add messages

Add the campaigns and Canvas messages that you would like to compile in your report. You can select your messages in two ways:

- Manually select campaigns and Canvases
- Automatically select campaigns and Canvases based on specific rules

![engagement_reports_message_selection](https://www.braze.com/docs/assets/img_archive/engagement_report_add_messages.png?5af65978ac222ce2b78d41c0669fbb4c)

#### Manually select campaigns or Canvases

This option gives you the freedom to choose whichever campaigns or Canvases you would like in this report.

#### Automatically select campaigns or Canvases

This option lets you automatically include all messages that include a specific [tag](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/tags/). You can target messages that have any one or all of the tags listed. This option is useful if you are setting up recurring reports and you regularly tag your engagement messages.

**Important:**


The tags must match at least one campaign or Canvas for a report to generate. If you use **Automatically select campaigns and Canvases based on specific rules** and see an error, confirm that at least one campaign or Canvas matches your tags and other filters (for example, when you require all listed tags, every matching message must have every tag).



### Step 3: Add statistics {#add-statistics-to-your-reports}

The **Add Stats** step shows you statistics for the types of campaigns or Canvases you have selected. For example, if you selected email messages, you can only view relevant email statistics. If you picked a combination of email and push, you can view the statistics for those two channels.

![engagement_report_add_stats](https://www.braze.com/docs/assets/img_archive/engagement_report_add_stats.png?2f325f6a3f52d8213585246152eb7b87)

Engagement reports aggregate data per campaign or Canvas, not at the workspace level. To monitor total send or impression volume across all active campaigns and Canvases, such as per-channel sends and impressions across an entire workspace, use [Report Builder](https://www.braze.com/docs/report_builder/).

**Note:**


*Sends to Carrier* is deprecated, but will continue to be supported for users who already have it.



| Channel | Available statistics |
| ------| --------------|
| Email | Sends, Opens, Unique Opens, Clicks, Unique Clicks, Click to Open, Unsubscribes, Bounces, Delivered, Reported Spam |
| Push  | Sends, Opens, Influenced Opens, Bounces, Body Clicks |
| Web Push | Sends, Opens, Bounces, Body Clicks |
| In-app message | Impressions, Clicks, First Button Clicks, Second Button Clicks |
| Webhook  |  Sends, Errors |
| SMS | Sends, Sends to Carrier, Confirmed Deliveries, Delivery Failures, Rejections |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Step 3: Add statistics #add-statistics-to-your-reports" }

### Step 4: Complete report setup

Give your report a name, choose how your report will be formatted, and select your recipients. By default, engagement reports are sent as a ZIP file where data is comma-delimited (where each piece of data is separated by a comma).

You can select from the following compression and delimiter options:

- **Compression:** ZIP, Uncompressed, or gzip
- **Delimiter:** Comma (`,`), Colon (`:`), Semicolon (`;`), or Pipe (`|`)

**Note:**


Statistics are only collected for the date range specified by the report. To receive accurate open and click rate statistics, select a date range that includes when the Sends events were performed for your campaigns and Canvases.



#### Select time frame

By default, the data range shown is based on your company's time zone and will go from the earliest message selected until the present date. You can customize this by selecting the date dropdown and using the custom range selection OR by selecting the next radio button and defining your date range with the dropdown options available.

#### Select data display

By default, the data displayed in the engagement reports is daily (one day). To view this data across different intervals, choose an explicit number of days or weeks to aggregate the data for the report. So instead of seeing daily metrics, you can view your engagement by week, month, quarter, or similar. Should a time-centric aggregation not suffice, you can also elect to export data at the campaign or Canvas level.

![engagement_reports_data_coverage](https://www.braze.com/docs/assets/img_archive/engagement_report_datacoverage.png?5322020d2c3c0344947b8e5a2d7269f2)

##### Show Data by Entire Campaign or Canvas

When you select **Show Data by Entire Campaign or Canvas**, Braze aggregates metrics in 1,825-day (five year) chunks across the report's time range. 

If the time range spans more than one chunk, you may see multiple rows for the same campaign or Canvas with different dates in the date column. Some rows may include only metrics recorded later in the range (for example, unsubscribes). Dates may also fall years before you started sending in the workspace, because they reflect chunk boundaries in the export, not only your first send. 

To align the date column with when your selected campaigns and Canvases actually sent, set the report [start date in **Select time frame**](#select-time-frame) to the earliest date you want in the file—typically when those messages started sending—rather than leaving the default range that reaches back to the oldest selected message.

#### Schedule your report

There are two options when scheduling your report:

- **Send immediately:** After the report is launched, Braze will send this report immediately.
- **Send at a designated time:** This option gives you the flexibility to choose how frequently you receive this report. You can choose to send this report every set number of days, weeks or months. You can also define when to stop sending the report.

![engagement_reports_schedule_report](https://www.braze.com/docs/assets/img_archive/engagement_report_reportschedule.png?30e93b4d7d340c2fc6391265651b9bae){: style="max-width:65%;" }

### Step 5: Review and launch

The final step of setting up your report shows a view-only overview of your configured options. Review your report, and when you're satisfied, select **Launch Report**.

### Step 6: Check your email  

You will receive an email with links to your reports at your chosen time or schedule. **These links expire 1 hour after the report was sent.** When you select the provided links you will automatically download a ZIP file containing your CSV files-one for all campaigns.

The report contains all statistics selected in the [Add Stats](#add-statistics-to-your-reports) section of the setup process.

## Troubleshooting

### Engagement report doesn't match metrics from the Canvas or campaign

#### Mismatched time range

Make sure the dates in the engagement report match the dates in the Canvas or campaign analytics (for example, both cover December 1–15), even if the Canvas only sent once. In the engagement report settings, check **Data Display** to confirm you are looking at the correct Canvas or campaign. If **Data Display** is set to show data every *X* days, you get one row per date when metrics were recorded for each step.

If totals look wrong in a spreadsheet, clear extra filters on the export. You can sum the daily rows to reconcile them with Canvas or campaign totals for the same time range.

**Note:**


If you want rows aggregated by entire campaign or Canvas instead of daily, weekly, or other recurring buckets, set **Data Display** to **Show Data by Entire Campaign or Canvas**. If row counts or dates look wrong in the CSV, see [Show Data by Entire Campaign or Canvas](#show-data-by-entire-campaign-or-canvas).



#### Duplicate button clicks in HTML in-app messages

If you use HTML in-app messages and **Body clicks** look high in the engagement report, you may be firing click logging twice—for example by calling `brazeBridge.logClick()` for a generic body click and also `brazeBridge.logClick('body click')` (or another ID) on the same interaction. Search your markup for `brazeBridge.logClick(` and align with one pattern per control. For recommended usage, see [Button tracking](https://www.braze.com/docs/user_guide/channels/in_app_messages/message_types/custom_html/#button-tracking-improvements).

