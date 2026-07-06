# Create a catalog

> Creating a catalog involves importing a CSV file of non-user data into Braze. This allows you to then access that information to enrich your messages. You can bring in any type of data into a catalog. This data is typically some sort of metadata from your company such as product information for an eCommerce business, or course information for an education provider.

## Use cases

Commons use cases for catalogs include:

- Products
- Services
- Food
- Upcoming events
- Music
- Packages

After this information is imported, you can begin accessing it in messages in a similar way to accessing custom attributes or custom event properties through Liquid.

## Supported data types {#supported-data-types}

The following table lists the supported catalog data types and how they can be created or updated.

| Data type    | Description                                   | Available via CSV upload | Available via API and CDI |
|--------------|-----------------------------------------------|:------------------------:|:-------------------------:|
| String       | A sequence of characters.                     | ✅ Yes                    | ✅ Yes                     |
| Number       | A numeric value, either integer or float.     | ✅ Yes                    | ✅ Yes                     |
| Boolean      | A `true` or `false` value.                    | ✅ Yes                    | ✅ Yes                     |
| Time         | A string formatted in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.                        | ✅ Yes                    | ✅ Yes                     |
| Geolocation  | A `[longitude, latitude]` coordinate array. Latitude must be between -90 and 90; longitude must be between -180 and 180. For example, `[-73.988103, 40.779109]`. | ✅ Yes                    | ✅ Yes                     |
| JSON object  | A nested object with key-value pairs. Can be displayed in the platform but can only be created or updated through the API or CDI.         | ⛔ No                     | ✅ Yes                     |
| String array | A list of strings. Can be displayed in the platform but can only be created or updated through the API or CDI. Maximum of 100 elements. | ⛔ No                     | ✅ Yes                     |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 role="presentation" }

## Creating a catalog

To create a catalog, go to **Data Settings** > **Catalogs**, then select **Create New Catalog** and choose one of the following options:



### Step 1: Review your CSV file

Before you upload your CSV file, ensure that your CSV file meets the following requirements:

| CSV Requirement | Details |
|-----------------|---------|
| Headers | The first column in the CSV file must be named `id`, and each row must have a unique `id` value. |
| Columns | A CSV file can have a maximum of 1,000 fields (columns), and each column name can be up to 250 characters long. |
| File size | For Free plans, the total size of all CSV files across a company is limited to 100 MB. For Pro plans, the maximum file size for a single CSV file is 2 GB. |
| Field values | Each cell (field value) can contain up to 5,000 characters. |
| Valid characters | The `id` column and all header values can only contain letters, numbers, hyphens, and underscores. |
| Data types | Supported data types for CSV uploads include string, number, boolean, time, and geolocation. For the full list of data types, including those available only through the API and CDI, refer to [Supported data types](#supported-data-types). |
| Formatting | Format all text in lowercase to maintain consistency. |
| Encoding | Save and upload the CSV file using UTF-8 encoding. |
{: .reset-td-br-1 .reset-td-br-2 role="presentation"}

**Note:**


Need more space to accommodate for your CSV files? Contact your Braze account manager for more information about upgrading your catalogs.



### Step 2: Upload CSV

Drag and drop your file to the upload zone, or select **Upload CSV** and choose your file.

![](https://www.braze.com/docs/assets/img_archive/catalog_CSV_upload.png?e430b46811c881292626525c823001f0){: style="max-width:80%;"}

Select a data type for each column.

**Note:**


This data type cannot be edited after you set up your catalog. In addition, a `NULL` value isn't supported in CSV upload and will be treated as a string.



![](https://www.braze.com/docs/assets/img_archive/catalog_data_type.png?e4d7110d675beccabee1a82c4a737b3d){: style="max-width:80%;"}

Enter a name and optional description for your catalog. Keep the following requirements in mind when naming your catalog:

  - Must be unique
  - Maximum of 250 characters
  - Can only include numbers, letters, hyphens, and underscores

**Tip:**


You can also [use templates in a catalog name](#template-catalog-names), letting you dynamically generate catalog names based on variables like language or campaign.



![A catalog named "my_catalog".](https://www.braze.com/docs/assets/img_archive/in_browser_catalog.png?064b7ce1ba9f10a065be5205214322a8){: style="max-width:80%;"}

Select **Process Catalog** to create the catalog.

**Important:**


Your CSV file can be rejected if you go above your [tier](#tiers). 



### Tutorial: Creating a catalog from a CSV file

For this tutorial, we're using a catalog that lists two games, their cost, and an image link.

<style type="text/css">
.tg td{word-break:normal;}
.tg th{word-break:normal;font-size: 14px; font-weight: bold; background-color: #f4f4f7; text-transform: lowercase; color: #212123; font-family: "Sailec W00 Bold",Arial,Helvetica,sans-serif;}
.tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top;word-break:normal}
</style>
<table class="tg" aria-label="Tutorial: Creating a catalog from a CSV file">
<thead>
  <tr>
    <th class="tg-0pky">id</th>
    <th class="tg-0pky">title</th>
    <th class="tg-0pky">price</th>
    <th class="tg-0pky">image_link</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-0pky">1234</td>
    <td class="tg-0pky">Tales</td>
    <td class="tg-0pky">7.49</td>
    <td class="tg-0pky">https://picsum.photos/200</td>
  </tr>
  <tr>
    <td class="tg-0pky">1235</td>
    <td class="tg-0pky">Regeneration</td>
    <td class="tg-0pky">22.49</td>
    <td class="tg-0pky">https://picsum.photos/200</td>
  </tr>
</tbody>
</table>

We'll create the catalog by uploading a CSV file. The data types for `id`, `title`, `price`, and `image_link` are string, string, number, and string, respectively. 

**Note:**


This data type cannot be edited after you set up your catalog.



![Four catalog column names: "id", "title", "price", "image_link".](https://www.braze.com/docs/assets/img_archive/catalog_data_type.png?e4d7110d675beccabee1a82c4a737b3d){: style="max-width:85%;"}

Next, we'll name this catalog "games_catalog" and select the **Process Catalog** button. Then, Braze will check the catalog for any errors before catalog creation.

![A catalog named "games_catalog".](https://www.braze.com/docs/assets/img_archive/catalog_new_name.png?75794463c4fa7b07303d44c348602ff6){: style="max-width:85%;"}

Note that you won't be able to edit this name after the catalog is created. You can delete a catalog and re-upload an updated version using the same catalog name.

After creating the catalog, you can begin referencing the [catalog in a campaign](https://www.braze.com/docs/user_guide/data/activation/catalogs/using_catalogs/).



### Prerequisites

Before you can edit or create catalogs in the browser, you need the following [user permissions](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/) for your workspace:

- View Catalogs
- Edit Catalogs
- Export Catalogs
- Delete Catalogs

### Step 1: Enter catalog details

Enter a name and optional description for your catalog. Keep the following requirements in mind when naming your catalog:

- Must be unique
- Maximum of 250 characters
- Can only include numbers, letters, hyphens, and underscores

**Tip:**


You can also [use templates in a catalog name](#template-catalog-names), letting you dynamically generate catalog names based on variables like language or campaign.



![A catalog named "my_catalog".](https://www.braze.com/docs/assets/img_archive/in_browser_catalog.png?064b7ce1ba9f10a065be5205214322a8){: style="max-width:80%;"}

### Step 2: Create your catalog

Select your catalog from the list, then select **Update Catalog** > **Add fields**. Enter the **Field name** and use the dropdown to select the data type. Repeat as needed.

![Two example fields "rating" and "name".](https://www.braze.com/docs/assets/img_archive/add_catalog_fields.png?42774d364ffeb3791c9b26d9b623a5d1){: style="max-width:50%;"}

Select **Update Catalog** > **Add items** to add an item to your catalog by entering the information based on the fields you previously added. Then, select **Save Item** or **Save and Add Another** to continue adding your items.

![Add a catalog item.](https://www.braze.com/docs/assets/img_archive/add_catalog_items.png?42e715dfb27e24782095cb644f5667c4){: style="max-width:50%;"}

**Note:**


Braze processes time values based on the dashboard timestamp. For example, if a column has a value of "03/13/2024" and your time zone is the Pacific Time Zone, this time would be imported to Braze as "Mar 12, 2024, 5:00 PM".





## Catalog data types

Catalogs support various data types to help you organize and structure your data effectively. The following table describes each supported data type and how it maps to CSV and API type names:

| Data Type | Format | Example | Description |
|-----------|--------|---------|-------------|
| String | Text | `"Hello World"` | Any sequence of characters used for text data such as names, descriptions, and IDs. Equivalent to the `string` type in CSV and API imports. |
| Time | ISO 8601 or Unix timestamp (seconds) | `"2024-03-15T14:30:00Z"` | Date and time values formatted as ISO 8601 or Unix timestamp in seconds. Equivalent to the `time` type in the API and the `datetime` type in CSV imports. |
| Boolean | `true` or `false` | `true` | Logical values representing true or false states. Equivalent to the `boolean` type in CSV and API imports. |
| Number | Integer or decimal | `42` or `19.99` | Numeric values including integers and floating-point numbers for prices, quantities, ratings, and more. Equivalent to the `integer` and `float` types in CSV imports and the `number` type in the API. |
| Geolocation | `[longitude, latitude]` array | `[-73.988103, 40.779109]` | A coordinate pair representing a geographic location. Longitude must be between -180 and 180; latitude must be between -90 and 90. API `type` value is `geo`. Can be added via the **Add Fields** drawer in the Catalogs UI, CSV upload, or the REST API. |
| Object | JSON object | `{"key": "value", "price": 10}` | Complex nested data structures. API `type` value is `object`. Displayed as JSON Object in the dashboard. Only available via API or Cloud Data Ingestion (CDI). |
| Array | Array of strings | `["red", "blue", "green"]` | Lists of string values. API `type` value is `array`. Displayed as String array in the dashboard. Only available through the API or CDI. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 role="presentation"}

## Using templates in catalog names {#template-catalog-names}

When naming your catalog, you can also use templates in a catalog name. This lets you dynamically generate catalog names based on variables like language or campaign. For example, you can use the following:


```liquid
{% assign language = "content_spanish" %}

{% catalog_items {{language}} fall_campaign %}
{{ items[0].body }}
```


## Managing catalogs

### In the dashboard

To update your catalog after uploading a CSV or creating a catalog in the browser, select **Update Catalog > Upload CSV**, then select whether to update, add, or delete items in your catalog.

### Using the REST API

As you build more catalogs, you can also use the [List catalogs endpoint](https://www.braze.com/docs/api/endpoints/catalogs/catalog_management/synchronous/get_list_catalogs/) to return a list of the catalogs in a workspace.

The REST API supports all [catalog data types](#supported-data-types), including JSON objects and string arrays. JSON objects and string arrays can only be created or updated through the REST API.

### Using Cloud Data Ingestion

You can maintain catalogs through [Cloud Data Ingestion](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/sync_catalogs_data/) by syncing catalog data directly from your data warehouse (such as Snowflake, Redshift, BigQuery, Databricks, Microsoft Fabric, or S3) on a scheduled basis.

## Managing catalog items

In addition to managing your catalogs, you can also use asynchronous and synchronous endpoints to manage the catalog items. This includes the ability to edit and delete catalog items, and to list catalog item details. 

For example, if you want to edit an individual catalog item, you can use the [`/catalogs/catalog_name/items/item_id` endpoint](https://www.braze.com/docs/api/endpoints/catalogs/catalog_items/synchronous/patch_catalog_item/).

## Catalog storage {#tiers}

The free version of catalogs supports CSV file sizes of up to 100 MB for all CSV files combined across your company, whereas the Catalogs Pro version supports CSV file sizes of up to 2 GB for a single CSV file.

**Important:**


The package entitlement shown in the Braze dashboard is rounded to the nearest unit for visual purposes; however, you are still entitled to the full entitlement purchased. To request an upgrade for catalog storage, contact your Braze account manager.



#### Free version

The storage size for the free version of catalogs is up to 100&nbsp;MB. You can have unlimited items as long as they're under 100&nbsp;MB. 

#### Catalogs Pro

At a company level, the maximum storage for Catalogs Pro is based on the size of catalog data. The storage size options are: 5&nbsp;GB, 10&nbsp;GB, or 15&nbsp;GB. Note that the free version's storage (100&nbsp;MB) is included in each of these plans.

## Specifications

The following table summarizes specifications for what you can include in catalogs.

| Area | Specifications |
|------|-----------|
| Item value characters | Up to 5,000 characters in a single value. For example, if you have a field labeled `description`, the maximum number of characters within the field is 5,000. |
| Item column name characters | Up to 250 characters |
| Selections per catalog | Up to 30 selections per catalog |
{: .reset-td-br-1 .reset-td-br-2 role="presentation" }

**Important:**


Catalog Liquid tags cannot be used recursively, meaning you cannot reference a catalog item that then calls a second catalog item from within the same Liquid evaluation.

