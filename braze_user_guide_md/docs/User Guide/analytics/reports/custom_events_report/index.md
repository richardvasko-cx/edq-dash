# Custom events report

> The custom events report lets you view the occurrences of one or more custom events over time. You can break down results by segment, apply KPI formulas, and export the data for further analysis.

## Viewing a report

To view this report from the dashboard, go to **Analytics** > **Custom events report**. Select the custom events you want to analyze, then select **Apply** to generate the graph.

![Custom events](https://www.braze.com/docs/assets/img_archive/Export_events.png?714452a38dffc9a8a965d7496bc653d3)

## Configuring your report

Use the following options to customize what data appears in the **Performance Over Time** graph.

| Option | Description |
| --- | --- |
| Apps | By default, the report includes data from all apps. Use this dropdown to narrow the report to a specific app. |
| Breakdown custom events by | Controls how the time series for your selected custom event is grouped. By default, the chart shows the overall aggregate trend by date. Switch to **Custom Events by Hour** to see intraday patterns, or **Custom Events per MAU** to normalize event volume against your monthly active user count. |
| Filter by Segments | Toggle this on to break down event counts by one or more segments. When enabled, select the segments you want to compare. The graph shows the number of users in each segment who performed the custom event. |
| KPI formula | Replaces the raw event count with a calculated metric built from a numerator (such as a custom event count) and a denominator (such as DAU, MAU, or an analytics-enabled segment size). When you select one or more formulas, the chart plots each formula's value over the selected date range so you can compare normalized performance (for example, "events per active user") instead of total event volume. If no data is available for the selected time range and formulas, Braze displays a "no data" message—broaden the time range or choose different formulas. Select **Manage KPI formulas** to create or edit formulas. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Configuring your report" }

## Exporting data

To export your custom events data, select <i class="fas fa-bars" title="Chart context menu"></i> in the **Performance Over Time** graph and select your export option.

**Tip:**


For help with CSV and API exports, refer to [Export troubleshooting](https://www.braze.com/docs/user_guide/data/distribution/export_braze_data/export_troubleshooting/).


