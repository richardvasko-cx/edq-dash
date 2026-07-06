# Cloud Data Ingestion table setup

> Use this page to separate two related but different requirements for Cloud Data Ingestion (CDI): source table setup and payload formatting.

## Understand table setup compared to payload formatting

For CDI user data syncs, configure both:

| Layer | What it controls |
| --- | --- |
| Source table setup | Required columns, user identifiers, and `UPDATED_AT` sync behavior |
| Payload formatting | JSON fields in `PAYLOAD`, including object shape for attributes, events, and purchases |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Understand table setup compared to payload formatting" }

Braze reads rows from your source table first, then validates the `PAYLOAD` field based on the selected data type.

## Set up your source table

For data warehouse user data syncs, your source table or view should include:

- `UPDATED_AT`
- `PAYLOAD`
- One or more supported user identifier columns:
  - `EXTERNAL_ID`
  - `ALIAS_NAME` and `ALIAS_LABEL`
  - `BRAZE_ID`
  - `EMAIL`
  - `PHONE`

Each row should include one identifier type at a time, even if your table contains multiple identifier columns.

### `UPDATED_AT` requirements

- Store `UPDATED_AT` values in UTC to avoid daylight savings time issues.
- Braze syncs rows where `UPDATED_AT` is later than the last synced value.
- Rows at the exact boundary timestamp may be re-synced if new rows share that timestamp.

For guidance on duplicate timestamps and incremental updates, see [Cloud Data Ingestion best practices](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/best_practices/#avoid-resyncing-rows-with-duplicate-timestamps).

**Note:**


File storage sources use different setup requirements and do not support `UPDATED_AT`. For details, see [File storage integrations](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/file_storage_integrations/#required-file-formats).



## Set up the `PAYLOAD` column

The `PAYLOAD` value follows the same object formats used by the Braze `/users/track` endpoint for the selected data type.

| Data type | Formatting reference |
| --- | --- |
| `attributes` | [User attributes object](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#migrating-push-tokens) |
| `events` | [Events object](https://www.braze.com/docs/api/objects_filters/event_object/) |
| `purchases` | [Purchases object](https://www.braze.com/docs/api/objects_filters/purchase_object/) |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Set up the PAYLOAD column" }

For nested attributes, include dates using the format in [Capturing dates as object properties](https://www.braze.com/docs/user_guide/data/activation/attributes/nested_custom_attribute_support#capturing-dates-as-object-properties).

### Payload examples



You may include nested custom attributes in the payload column for a custom attributes sync.

```json
{
      "most_played_song": {
        "song_name": "Solea",
        "artist_name": "Miles Davis",
        "album_name": "Sketches of Spain",
        "genre": "Jazz",
        "play_analytics": {
            "count": 1000,
            "top_10_listeners": true
        }
      }
}
```



To sync events, an event name is required. Format the `time` field as an ISO 8601 string or in `yyyy-MM-dd'T'HH:mm:ss:SSSZ` format. If the `time` field is not present, Braze uses the `UPDATED_AT` column value as the event time. Other fields, including `app_id` and `properties`, are optional.

You can sync one event per row.

```json
{
    "app_id" : "your-app-id",
    "name" : "rented_movie",
    "time" : "2013-07-16T19:20:45+01:00",
    "properties": {
        "movie": "The Sad Egg",
        "director": "Dan Alexander"
    }
}
```



To sync purchase events, `product_id`, `currency`, and `price` are required. Format the optional `time` field as an ISO 8601 string or in `yyyy-MM-dd'T'HH:mm:ss:SSSZ` format. If the `time` field is not present, Braze uses the `UPDATED_AT` column value as the event time. Other fields, including `app_id`, `quantity`, and `properties`, are optional.

You can sync one purchase event per row.

```json
{
    "app_id" : "11ae5b4b-2445-4440-a04f-bf537764c9ad",
    "product_id" : "Completed Order",
    "currency" : "USD",
    "price" : 219.98,
    "time" : "2013-07-16T19:20:30+01:00",
    "properties" : {
        "products" : [ { "name": "Monitor", "category": "Gaming", "product_amount": 19.99 },
        { "name": "Gaming Keyboard", "category": "Gaming ", "product_amount": 199.99 }
        ]
    }
}
```



To sync subscription group statuses, include one or more `subscription_group_id` and `subscription_state` pairs in each row.
```json
{
    "subscription_groups" : [
        {
            "subscription_group_id": "subscription_group_identifier_1",
            "subscription_state": "unsubscribed"
        },
        {
            "subscription_group_id": "subscription_group_identifier_2",
            "subscription_state": "subscribed"
        },
        {
            "subscription_group_id": "subscription_group_identifier_3",
            "subscription_state": "subscribed"
        }
      ]
}
```



## Related CDI setup docs

- For source-specific DDL examples, see [Data warehouse integrations](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/integrations/#step-1-set-up-tables-or-views).
- For file-based setup, see [File storage integrations](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/file_storage_integrations/).
- For sync behavior and optimization guidance, see [Cloud Data Ingestion best practices](https://www.braze.com/docs/user_guide/data/unification/cloud_ingestion/best_practices/).
