# Segment analytics tracking

> When analytics tracking is turned on for a segment, you can view sessions, custom events, and revenue over time for that segment.

If you don't turn analytics tracking on for a segment, you can still access [real-time statistics](https://www.braze.com/docs/user_guide/audience/segments/segment_data#segment-statistics) for that segment and target its users with campaigns. The only difference is whether you can access the specific analysis tools mentioned on this page.

## Turning on segment analytics

In a segment's page **Segment Details** section, turn on **Analytics Tracking**.

![Analytics tracking toggle for a segment](https://www.braze.com/docs/assets/img_archive/A_Tracking_2.png?d31196e1e5b66f88dca1d49651ef8082)

An app can have tracking turned on for up to 25 segments. Braze recommends tracking segments that are important for you to analyze when understanding your campaigns' effects on sessions, revenue, and purchases.

**Note:**


After enabling analytics tracking, there may be a delay until the segment data populates. If the data does not populate within 24 hours, [contact Support](https://www.braze.com/docs/braze_support/).



## Viewing revenue and purchases over time

Go to **Analytics** > **Revenue Report** to view data on [revenue and purchases over time for this segment](https://www.braze.com/docs/user_guide/analytics/reports/revenue_report/).

Revenue and purchase charts reflect activity recorded after analytics tracking is turned on for that segment. Turning tracking on does not backfill earlier purchases into those reports. When you compare segments, use only time ranges where tracking was enabled for each segment you select.

![Revenue data by segment](https://www.braze.com/docs/assets/img_archive/Revenue.png?e6de4ea2f7ade143cf5f53e1653f1229)

To visually compare segment data for any custom time range, add or remove segments from the graph. Select **By Segment** in the **Breakdown** dropdown, and then select your segments in **Breakdown values**.

Select any segment name above the graph to turn on or off visibility for that segment's metrics.

![Revenue for multiple segments](https://www.braze.com/docs/assets/img_archive/segment_revenue_multiple.png?78fb3f54c51d913ad20b5585ae573c3f)

## Sessions over time

Similarly, you can find data on [sessions over time for this particular segment](https://www.braze.com/docs/user_guide/analytics/dashboards/home#exporting-app-usage-data) on the **Home** page.

![Session data by segment](https://www.braze.com/docs/assets/img_archive/events_over_time2.png?a7be3e61df95c64d7cdd9b5028977eee)

## View custom events over time

View data on [Custom events over time for segments](https://www.braze.com/docs/user_guide/data/activation/events/custom_events#analytics) by going to **Analytics** > **Custom events report**.

## Using Query Builder templates

When analytics tracking is turned on, you can use Query Builder report templates to break down performance metrics for campaigns, Canvas, variants, and steps by segments. To learn more, check out [Segment data](https://www.braze.com/docs/user_guide/audience/segments/segment_data#performance-data-by-segment).

## Frequently asked questions

### What should I check if analytics tracking looks wrong or empty?

Confirm **Analytics Tracking** is still enabled in **Segment Details**, you have not exceeded the per-app limit (25 segments with tracking), and allow up to 24 hours for data to populate after you first enable tracking. If issues continue, verify the segment definition and report date range, then [contact Support](https://www.braze.com/docs/braze_support/).

