# Export segment data to CSV

> This page covers how to request a CSV export of user data from a segment, and the data included in the export.

**Note:**


CSV export options appear in the **User Data** dropdown only for company users who have the ["Export User Data" permission](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/) for that workspace.



To export segment data to a CSV, select the **User Data** dropdown while editing a segment and select to export either the user data or email addresses for the segment.

![Segment Details section with User Data dropdown showing export options.](https://www.braze.com/docs/assets/img_archive/csvexport.png?8e3236e89b3026481e94265efbbcf74d)

You can also request a CSV export from the main **Segments** page by selecting the <i class="fas fa-gear"></i> **Settings** dropdown for a segment:

![Settings dropdown on the main Segments page.](https://www.braze.com/docs/assets/img_archive/csvexport2.png?5b42067b95cac10a848cab64824556c9)

**Tip:**


To export data from all your user profiles, create a segment with no filters, and then request a CSV export.



The CSV output contains the data from each user profile captured in the segment at the time of export. You can export any segment by selecting the gear icon and CSV export. Braze will generate the report in the background and email it to the user who is currently logged in.

## Segment CSV export details

**Note:**


Dashboard users need the **Export user data** permission to use CSV export options. If they don't have this permission, CSV export options don't appear.



**CSV Export Email Addresses** only includes rows for users in the segment who have an email address. For example, if your segment has 100,000 users but only 50,000 have an email address, **CSV Export Email Addresses** produces about 50,000 rows. **CSV Export User Data** exports all user data for the segment.

**Important:**

 
Due to file size restrictions, your export may fail if the estimated size of your segment is over 500,000 users. Note that this restriction uses the estimated size of your segment, and not the exact calculation. For more details, refer to [Exporting large segments](#exporting-large-segments).



If you've linked your [Amazon S3 credentials](https://www.braze.com/docs/partners/data_and_infrastructure_agility/data_warehouses/amazon_s3/#amazon-s3-integration) to Braze, the CSV will instead be uploaded in your S3 bucket under the key `segment-export/SEGMENT_ID/YYYY-MM-dd/users-RANDOMSTRING.zip`. You must be logged into the dashboard to access the download link emailed to you.









































## Data included in export

The following is included in your export depending on your selection.

### CSV export user data

| Field Name                  | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| Appboy ID                   | Internal ID (cannot be changed)                           |
| country                     | Country                                    |
| created_at                  | Date and time when the user profile was created                   |
| created_from                | Method used to create the user profile (for example, REST API, SDK, or CSV import)         |
| devices                     | Device information                           |
| date_of_birth               | Date of birth                                            |
| email                       | Email address                                            |
| unsubscribed_from_emails_at | Date unsubscribed from emails                            |
| user_id                     | External ID                                              |
| first_name                  | First name                                               |
| first_session               | Date and time of first session                           |
| gender                      | Gender                                                   |
| google_ad_ids               | Google advertising IDs associated with the user                      |
| city                        | City                                     |
| IDFAs                       | Identifier for Advertising (IDFA) values                 |
| IDFVs                       | Identifier for Vendor (IDFV) values                      |
| language                    | Language in ISO-639-1 standard                                        |
| last_app_version_used       | Last version of the app used                             |
| last_name                   | Last name                                                |
| last_session                | Date and time of last session                            |
| number_of_google_ad_ids     | Count of associated Google advertising IDs               |
| number_of_IDFAs             | Count of associated IDFAs                                |
| number_of_IDFVs             | Count of associated IDFVs                                |
| number_of_push_tokens       | Count of associated push notification tokens             |
| number_of_roku_ad_ids       | Count of associated Roku advertising IDs                 |
| number_of_windows_ad_ids    | Count of associated Windows advertising IDs              |
| phone_number                | Phone number                                             |
| opted_into_push_at          | Date opted into push notifications                       |
| unsubscribed_from_push_at   | Date unsubscribed from push notifications                |
| random_bucket               | Random bucket number                                 |
| roku_ad_ids                 | Roku advertising IDs                          |
| session_count               | Total number of sessions                                 |
| timezone                    | User's time zone in the same format as the IANA Time Zone Database                                         |
| in_app_purchase_total       | Total amount spent on in-app purchases                   |
| user_aliases                | User aliases, if any                                          |
| windows_ad_ids              | Windows advertising IDs                       |
| Custom events               | Based on selection at export                             |
| Custom attributes           | Based on selection at export                             |
{: .reset-td-br-1 .reset-td-br-2 aria-label="CSV export user data" }

**Note:**


When you export user data from a Canvas step, the CSV includes all users who have been in that step over the lifetime of the Canvas step. You can't limit the export to a date range or other time window. For how to run these exports, see [Export Canvas data](https://www.braze.com/docs/user_guide/data/distribution/export_braze_data/export_canvas_data/).



### CSV Export Email Addresses

| Field Name                  | Description            |
| --------------------------- | ---------------------- |
| user_id                     | User's external ID     |
| first_name                  | First name             |
| last_name                   | Last name              |
| email                       | Email                  |
| unsubscribed_from_emails_at | Email unsubscribe date |
| opted_in_to_emails_at       | Email opt-in date      |
| user_aliases                | User aliases, if any   |
{: .reset-td-br-1 .reset-td-br-2 aria-label="CSV Export Email Addresses" }

**Tip:**


For help with CSV and API exports, visit our [troubleshooting](https://www.braze.com/docs/user_guide/data/distribution/export_braze_data/export_troubleshooting/) article.



**Note:**


Subscription group data is not available through segment exports. To identify users by subscription status, create a separate segment based on subscription group membership and export that segment.



## Exporting large segments

There are several methods to export a large user segment that contains over 500,000 users.




You can split a large segment into smaller segments and then export each of the smaller segments from Braze. 




You can also use [random bucket numbers](https://www.braze.com/docs/user_guide/messaging/ab_testing/concepts/random_bucket_numbers/) to break your user base into multiple segments, and then combine them after export. For example, if you need to break up your segment into two different segments, you can do so with the following filters:
- Segment 1: Random bucket number is less than 5000 (includes 0-4999)
- Segment 2: Random bucket number is more than 4999 (includes 5000-9999)




You can also leverage the following endpoints to export user data for a specific segment. Note that these endpoints are subject to data limits and [rate limits](https://www.braze.com/docs/api/basics/).
- [`/users/export/segment`](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_segment/)
- [`/users/export/global_control_group`](https://www.braze.com/docs/api/endpoints/export/user_data/post_users_global_control_group/)

If you've connected [Amazon S3 credentials](https://www.braze.com/docs/partners/data_and_infrastructure_agility/data_warehouses/amazon_s3/#amazon-s3-integration), large exports can be delivered to your bucket in addition to the emailed download link, as described in [Segment CSV export details](#segment-csv-export-details).



