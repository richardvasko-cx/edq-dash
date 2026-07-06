# Catalog segments

> Catalog segments are a type of SQL Segment Extension that is created by combining catalog data with data from custom events or purchases. They can be referenced in a segment and then targeted by campaigns and Canvases. 

Catalog segments use SQL to join data from catalogs and data from custom events or purchases. To do so, you must have a common identifier field across your catalogs and your custom events or purchases. For example, the value of an item ID in a catalog must match the value of a property in a custom event.

## Creating a catalog segment

1. Go to **Segment Extensions** > **Create New Extension** > **Start With Template** and select a template. <br>![Modal with the option to create a catalog segment for events, purchases, or RFM segments.](https://www.braze.com/docs/assets/img/catalog-segments-template.png?8f0cf68f97174f2e60f4f28700b4a7a1){: style="max-width:80%" }

{: start="2"}
2. The SQL editor automatically populates with a template. <br>![SQL editor with a pregenerated template.](https://www.braze.com/docs/assets/img/catalog-segments-editor.png?b2c756f21a9e741c569fa0453a8dd9d8){: style="max-width:80%" }<br>This template joins user event data with catalog data to segment users who engaged with certain catalog items.

3. Use the **Variables** tab to provide the necessary fields for your template before generating your segment. <br>For Braze to identify users based on their engagement with catalog items, you need to do the following: <br> - Select a catalog that contains a catalog field <br> - Select a custom event that contains an event property <br> - Match your catalog field and event property values

Here are guidelines to select the variables:

| Variable field | Description |
| --- | --- |
| `Catalog` | The name of the catalog you’re using to target users. |
| `Catalog field`| The field in your catalog that contains the same values as your `Custom event property`. This is often a type of ID. In the eCommerce use case, this would be `shopify_id`. |
| `Custom event` | The name of your custom event, which is the same event that contains a property with values matching your `Catalog field`. In the eCommerce use case, this would be `Made Order`. |
| `Custom event property` | The name of your custom event property, which matches values with your `Catalog field`. In the eCommerce example use case, this would be `Shopify_ID.`|
{: .reset-td-br-1 .reset-td-br-2 aria-label="Creating a catalog segment" }

{: start="4"}
4. If needed, fill in additional optional fields for your use case to segment by a particular field value within your catalog:
- `Catalog field`: A particular field (column name) within this catalog
- `Value`: A specific value within that field or column <br><br> Using the health app as an example, let’s say that within the catalog for each doctor you could book, there’s a field called `specialty` that contains a value such as `vision` or `dental`. To segment users who have visited any doctors with the value `dental`, you can select `specialty` as the `Catalog field`, and select `dental` as the `Value`.

5. After creating a SQL Segment, we recommend clicking **Run Preview** to see if your query returns users or if there are errors. For more information about [previewing query results](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/sql_segments/#previewing-results), managing [SQL Segment Extensions](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/sql_segments/#managing-sql-segment-extensions), and more, check out [SQL Segment Extensions](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/sql_segments/). 

**Note:**


If you're creating a SQL segment that uses the table `CATALOGS_ITEMS_SHARED`, you must specify a catalog ID. For example:

```sql
SELECT * FROM CATALOGS_ITEMS_SHARED
WHERE CATALOG_ID = 'XYZ'
LIMIT 10
```



### Determining if you need to invert SQL

While it's not possible to directly query for users with zero events, you can use **Invert SQL** to target these users.

For example, to target users who have fewer than three purchases, first write a query to select users who have three or more purchases. Then, select **Invert SQL** to target users with fewer than three purchases (including those with zero purchases).

![Segment Extension named "Clicked 1-4 emails in the last 30 days" with the option to invert SQL selected.](https://www.braze.com/docs/assets/img_archive/sql_segment_invert_sql.png?2450554211189d389864254bcf61ce82){: style="max-width:70%;"}

**Important:**


Unless you're specifically aiming to target users with zero events, you won't need to invert SQL. If **Invert SQL** is selected, confirm that the feature is needed and that the segment matches your desired audience. For example, if a query targets users with at least one event, it will only target users with zero events when inverted.



## Refreshing segment membership

To refresh the segment membership of any catalog segment, open the catalog segment and select **Actions** > **Refresh** > **Yes, Refresh**.

**Tip:**


If you created a segment where you expect users to enter and exit regularly, manually refresh the catalog segment it uses before targeting that segment in a campaign or Canvas.



### Designating refresh settings







## Use cases




### Health app

Let's say you have a health app and want to segment users who have booked a visit for the dentist. You also have the following:

- A catalog `Doctors` that contains the different doctors a patient can book, each assigned with a `doctor ID`
- A custom event `Booked Visit` with a `doctor ID` property that shares the same values as the `doctor ID` field in your catalog
- A `speciality` field within your catalog that contains the `dental` value

You would set up a catalog segment by using the following variables:

| Variable | Property |
| --- | --- |
| `Catalog`| Doctors |
| `Catalog field` | doctor ID |
| `Custom event`| Booked Visit|
| `Custom event property` | doctor ID |
| `(Under Filter SQL Results) Catalog field` | Specialty |
| `(Under Filter SQL Results) Value`| Dental |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Health app" }




### SaaS platform

Let’s say you have B2B SaaS platform and want to segment users who are employees of an existing customer. You also have the following:

- A catalog `Accounts` that contains the different accounts that are currently using your SaaS platform, each assigned with an `account ID`
- A custom event `Event Attendance` with an "account ID" property that shares the same values as the "account ID" field in your catalog
- A `Classification` field within your catalog that contains the `enterprise` value

You would set up a catalog segment by using the following variables:

| Variable | Property |
| --- | --- |
| `Catalog` | Accounts |
| `Catalog field `| account ID |
| `Custom event` | Event Attendance |
| `Custom event property` | account ID |
| `(Under Filter SQL Results) Catalog field` | Classification |
| `(Under Filter SQL Results) Value` | Enterprise |
{: .reset-td-br-1 .reset-td-br-2 aria-label="SaaS platform" }




## Frequently asked questions

### Does running a catalog segment consume SQL Segment Extension credits?

Yes, catalog segments are powered by SQL and consume SQL Segment Extension credits. To learn more, check out [SQL Segments usage](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/sql_segments/#monitoring-your-sql-segments-usage).

### Does creating a catalog segment consume SQL Segment Extension allotments?

Yes. In the same way SQL Segment Extensions count toward your Segment Extension allotment, catalog segments also count toward that allotment.

### I have a catalog segment use case that the current template doesn't serve. How should I set that up?

Contact your customer support manager or [Braze Support](https://www.braze.com/docs/user_guide/administer/personal/braze_support/) for additional guidance.

