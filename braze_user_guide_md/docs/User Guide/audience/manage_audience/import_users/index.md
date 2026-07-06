# Import users

> Learn about Braze's various user import options, like CSV import, REST API, Cloud Data Ingestion, and more.

## Import options

You can upload user attributes and events through a CSV import in Braze, a serverless S3 Lambda CSV import script, direct API calls, or Cloud Data Ingestion from your data warehouse.

### Braze CSV import

You can use CSV import to record and update the following user attributes and custom events. To get started, see [CSV Import](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/).

|Type|Definition|Example|Maximum file size|
|---|---|---|---|
|Default Attributes|Reserved user attributes recognized by Braze.|`first_name`, `email`|500 MB|
|Custom Attributes|User attributes unique to your business.|`last_destination_searched`|500 MB|
|Custom Events|Events unique to your business that represent user actions.|`trip_booked`|50 MB|
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="Braze CSV import" }

#### Constructing your CSV {#constructing-your-csv}

Braze accepts user data in standard CSV format. Default and custom attribute imports support files up to 500 MB; custom event imports support files up to 50 MB. For identifiers, column headers, validation rules, and examples, see [CSV import](https://www.braze.com/docs/user_guide/data/user_data_collection/user_import/csv_import).

When you upload a large CSV through **Import Users** in the dashboard, the page may appear unresponsive or respond slowly while Braze receives the file and runs the calculation step. Let the upload and calculation finish—total time ranges from a few minutes to a few hours depending on file size, and larger files take longer to calculate.

**Note:**


When importing custom events with properties, you must use dot notation in your CSV column headers. For more information about formatting custom events, refer to [Understanding custom event formatting](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/?tab=custom%20events#understanding-custom-event-formatting).



### Lambda user CSV import

Use our serverless S3 Lambda CSV import script to upload user attributes to Braze. This solution works as a CSV uploader where you drop your CSVs into an S3 bucket, and the scripts upload it through our API.

Estimated execution times for a file with 1,000,000 rows should be around five minutes. See [User attribute CSV to Braze import](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion) for more information.

### REST API

Use the [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) to record custom events, user attributes, and purchases for users.

### Cloud Data Ingestion

Use Braze [Cloud Data Ingestion](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/) to import and maintain user attributes.

## HTML validation

Keep in mind that Braze does not sanitize, validate, or reformat HTML data during import, meaning script tags must be removed from all import data you use for web personalization.

When importing data into Braze that is specifically meant for personalization usage in a web browser, ensure that it is stripped of HTML, JavaScript, or any other script tag that potentially could be leveraged maliciously when rendered in a web browser.

Alternatively, for HTML, you can use Braze Liquid filters (`strip_html`) to strip HTML from rendered text. For example:




```liquid
{{ "Have <em>you</em> read <strong>Ulysses</strong>?" | strip_html }}
```




```liquid
Have you read Ulysses?
```


