# Manage segments

> The Segments section allows you to view a comprehensive list of your existing segments, create new segments, and edit existing segments. You can refine the list of segments by selecting a variety of filters and columns so only the most relevant information to you is displayed.

![The Segments section displaying a list of Active segments.](https://www.braze.com/docs/assets/img/segment/segments_page.png?6efaf4ba6f4930467078d247a8337360)

## Customizing your view

Tailor your view of the segments list by using filters and changing the columns that you want to appear. When you leave the **Segments** section and return, the list will revert to the default view, clearing any filters you previously selected.

### Status filter

You can narrow the list to display only active or archived segments. Any non-archived segment is considered active.

### Filters

Sort through the segments in the list by adjusting the following filters:
- **Last Edited By:** The user that last edited the segments
- **Last Edited:** Time range in which the segments were last edited
- **Estimated Size:** Approximate range of how many users are in the segments
- **Tags:** Tags associated with the segments
- **Teams:** Teams associated with the segments
- **Advanced Tracking Segments Only:** View only the segments that have [Analytics Tracking](https://www.braze.com/docs/user_guide/analytics/tracking/segment_analytics_tracking#segment-analytics-tracking) enabled.

### Columns

These are the columns of information that you can select to display in the segment list:
- **Filters:** Number of filters in the segment
- **Last edited:** Date the segment was last edited
- **Last edited by:** The user that last edited the segment
- **Tags:** Tags associated with the segment
- **Teams:** Teams associated with the segment
- **Estimated size:** Estimated number of users in the segment
- **Canvases:** Number of Canvases that use the segment
- **Campaigns:** Number of campaigns that use the segment

### Show starred only

Selecting **Show Starred Only** narrows your view to the segments that were starred by you.

## Viewing a segment's messaging use {#messaging-use}

Go to a segment's **Messaging Use** section for an overview of where the segment is being used, such as within other segments, campaigns, and Canvases.

**Note:**


To prevent loops of segments referencing one another, segments that use the **Segment Membership** filter can't be referenced by other segments. For more details, refer to [Segmentation Filters](https://www.braze.com/docs/user_guide/audience/segments/segmentation_filters/).



## Managing specific segments

![The edit menu for a segment showing the options "Edit", "Duplicate", "Archive", and "Add to starred".](https://www.braze.com/docs/assets/img/segment/segments_page_edit_menu.png?e05335f99b698a3d7a16268860fde93b){: style="float:right;max-width:25%;"}

To manage a specific segment, hover over it and select the menu icon at the end of the row to reveal the following options:
- **Edit:** Edit the filters in your segment.
- **Duplicate:** Make a copy of your segment.
- **Archive:** Archive the segment. Note that this will also archive any campaigns or Canvases that use that segment.
- **Add to starred:** Star the segment, which allows you to quickly access it by checking the Show starred only box in the segments section.
 
You can also perform bulk actions–specifically, bulk archiving and bulk tagging–by checking the boxes next to multiple segment names.

**Tip:**


If you need a machine-readable export of the existing segments in the workspace (not only the current table view), use the [Export segment list endpoint](https://www.braze.com/docs/api/endpoints/export/segments/get_segment/) and paginate through the results. To audit archived segments, review them separately in the **Segments** dashboard using the status filter.



![Multiple segments selected with "CRM" selected in the "Tag As" dropdown field.](https://www.braze.com/docs/assets/img/segment/segments_bulk_action.png?5217160b682a29f816ecd7bd863187fb){: style="max-width:45%;"}

### Changes Since Last Viewed

The number of updates to the segments from other members of your team is tracked by the *Changes Since Last Viewed* metric on the segment overview page. Select **Changes Since Last Viewed** to view a changelog of updates to the segment's name, description, and target audience. For each update, you can see who performed the update and when. You can use this changelog to audit changes to your segment.

## Searching for segments

Search for segment names by entering terms into the search field. 

All terms and strings entered in this field will be searched for. For example, searching for “test segment 1” will return segments with “test”, “segment”, or “1” anywhere in their name. To search for an exact string, put quotes around your search term. Searching for [“test segment 1”] will return all segments that contain the exact phrase “test segment 1” in their name.

![The search results for entering "all users" into the search field include "All Users (Test)", "All Users", "All Users 15".](https://www.braze.com/docs/assets/img/segment/segments_search.png?86a550979e29220c6c3eca6ed4d8417d)

### Segments in Canvases

To search for all segment references, including those in other segments, campaigns, or Canvases, go to a segment's [Messaging Use](#messaging-use) section. The **Target segment** filter on the **Canvas** page searches only Canvas Audience segments. 

![Target segment filter on the Canvas page.](https://www.braze.com/docs/assets/img/segment/target_segment.png?c2f0aa16591656bc5de7e70af7820252){: style="max-width:45%;"}