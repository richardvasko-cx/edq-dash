# Custom HTTP connector

> Learn how to integrate a custom Currents connector, so you can get event data from Braze in real time, enabling more customized analytics, reporting, and automation.

## Prerequisites

To integrate a custom Currents connector in Braze, you'll need to provide an endpoint URL and an [optional authentication token](#authentication).

Additionally, if you have more than one app group in Braze, you'll need to configure a custom Currents connector for each group. However, you can point all app groups to the same endpoint, or to an endpoint with an additional `GET` parameter, such as `your_app_group_key="Brand A"`.

## Integration

### Step 1: Set up your endpoint

You'll need an endpoint URL to configure this integration. Your endpoint should be able to receive HTTP POST requests and return a `2XX` status code to acknowledge successful receipt of events. If you want to authenticate requests from Braze, you'll also need a bearer token.

### Step 2: Configure Braze Currents

In Braze, navigate to **Partner Integrations** > **Data Export**, click **Create New Current**, and select **Custom Currents Export**.

Give your export a name and a contact email, then proceed to the **Current Details** page. On this page, enter your endpoint URL and optional bearer token.

After configuring your credentials, check all message engagement, customer behavior, and user events you'd like to export, and click **Launch Current**.

## Supported Currents events

Braze supports exporting the following data to your Custom HTTP Connector:

- [Message engagement events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events?tab=custom%20http%20connector)
- [Customer behavior events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/customer_behavior_events?tab=custom%20http%20connector)

For the payload structure of each event, select the **Custom HTTP Connector** tab in the event glossary.

## Preventing data loss

### Error monitoring

To avoid data loss and service interruption, it's essential that you monitor your endpoints at all times and promptly address any errors or downtime.

For most error types (such as server errors and network connection errors), Braze will actively retry event transmissions. If the issue persists for more than 5 days, the integration will be automatically disabled. New incoming events will be dropped and permanently lost.

### Change resilience

Occasionally, we'll make non-breaking changes to Braze Currents schemas. Non-breaking changes are new nullable columns or event types.

We typically give a two-week notice for these changes, but sometimes this isn't possible. It's essential that you design your integration to handle unrecognized fields or event types, otherwise it will likely lead to data loss.

**Tip:**


For the full list of Currents event schemas, see [Message Engagement Events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events/) and [Customer Behavior Events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/customer_behavior_events/).



## Batching and serialization

The target data format is JSON over HTTPS. By default, events are sent to your endpoint in batches of up to 100 events each.

Events are sent to the endpoint as a JSON array of all events in the following format:

```json
{"events": [event1, event2, event3, etc...]}
```

There will be a top-level JSON object with the key `"events"` that maps to an array of further JSON objects, each representing a single event. Each event contains two sub-objects:

|Name|Description|
|----|-----------|
|`"user"`|Contains user properties such as `user_id`, `external_user_id`, `device_id`, and `timezone`.|
|`"properties"`|Contains attributes of an event, such as the `app/campaign/canvas/platform` it applies to.|
{: .reset-td-br-1 .reset-td-br-2 role="presentation" }

If a downstream endpoint receives a payload with zero events or an empty request body, the result should be considered a no-op, meaning no downstream effects should occur from this call. However, you should still check the `Authorization` header (like you would a normal API call), and give an appropriate HTTP response for [invalid credentials](#authentication), such as `401` or `403`. This lets Braze know that the connector's credentials are valid.

## Authentication

Authentication tokens in your payload are optional. They can be passed through an HTTP `Authorization` header using the `Bearer` authorization scheme, as specified in [RFC 6750](https://tools.ietf.org/html/rfc6750#section-2.1). Although optional, if an authentication token is passed, Braze will always validate it first&#8212;even if no events are in the payload.

Per RFC 6750, tokens should be Base64-encoded values with at least one character. Keep in mind, RFC 6750 allows tokens to contain the following characters in addition to the normal Base64 characters: `-`, `.`, `_`, and `~`. You can choose whether you'd like to include these characters in your token or not&#8212;however, it must be in Base64 format.

Additionally, if the `Authorization` header is present, it will be constructed using the following format:

```plaintext
"Authorization: Bearer " + <token>
```

For example, if your authentication token is `0p3n5354m3==`, your `Authorization` header should be similar to the following:

```plaintext
Authorization: Bearer 0p3n5354m3==
```

**Note:**


In the future, we may use `Authorization` headers to implement a custom, key-value-pair, authorization scheme that's unique to Braze. This would adhere to the [RFC 7235](https://tools.ietf.org/html/rfc7235) specification, which is how some companies implement their authentication schemes, such as Amazon Web Services (AWS).



## Versioning

All requests from our HTTP connector integration will be sent with a custom header designating the version of the Currents request being made:

```plaintext
Braze-Currents-Version: 1
```

The version will always be `1`, as we don't expect to increment this number very often, if ever.

Just like our [data warehouse storage schemas](https://www.braze.com/docs/user_guide/data/braze_currents/event_delivery_semantics?redirected=1), every event field in an individual event is guaranteed to be backward-compatible with previous event payload versions, according to the [Apache Avro](https://avro.apache.org/) definition of backward-compatibility:

1. Specific event fields are guaranteed to always have the same datatype over time.
2. Any new fields that are added to the payload over time must be considered optional by all parties.
3. Required fields will never be removed.

## Error handling and retry mechanism

If an error occurs, Braze will queue and retry the request based on the HTTP return code received. If the issue persists for more than 5 days, the integration will be automatically disabled: new incoming events will be dropped and permanently lost, and already queued events will be permanently dropped after retaining 7 days. If data is stuck for more than 24 hours, our on-call engineers will be alerted automatically. For a full breakdown of how each status code is handled, see the table below.

If your Currents integration is returning authentication errors, Braze will automatically send you a notification email.

Any HTTP error code not listed below will be treated as an HTTP `5XX` error.

**Warning:**


If the issue persists for more than 5 days, the integration will be disabled. New incoming events will be dropped and permanently lost, and already queued events will be permanently dropped after retaining 7 days.



The following HTTP status codes will be recognized by our connector client:

<table aria-label="Error handling and retry mechanism">
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Response</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>2XX</code></td>
      <td>Success</td>
      <td>Event data will not be re-sent.</td>
    </tr>
    <tr>
      <td><code>5XX</code></td>
      <td>Server-side error</td>
      <td>Event data will be re-sent in an exponential backoff pattern with jitter. If the issue persists for more than 5 days, the integration will be disabled, and already queued events will be retained for 7 days.</td>
    </tr>
    <tr>
      <td><code>400</code></td>
      <td>Client-side error</td>
      <td>The connector sent at least one malformed event. The event data will be split into batches of size 1 and re-sent. Any events in these size-1 batches that receive another <code>400</code> response will be dropped permanently.</td>
    </tr>
    <tr>
      <td><code>401</code></td>
      <td>Unauthorized</td>
      <td>The connector was configured with invalid credentials. Failed events will not be re-sent. Fix your credentials and re-enable the integration to resume. If the issue persists for more than 5 days, the integration will be disabled, and already queued events will be retained for 7 days.</td>
    </tr>
    <tr>
      <td><code>403</code></td>
      <td>Forbidden</td>
      <td>The connector was configured with invalid credentials. Failed events will not be re-sent. Fix your credentials and re-enable the integration to resume. If the issue persists for more than 5 days, the integration will be disabled, and already queued events will be retained for 7 days.</td>
    </tr>
    <tr>
      <td><code>404</code></td>
      <td>Not Found</td>
      <td>The connector was configured with an incorrect endpoint URL or invalid credentials. Verify that your endpoint URL is correct and reachable. Fix your configuration and re-enable the integration to resume. If the issue persists for more than 5 days, the integration will be disabled, and already queued events will be retained for 7 days.</td>
    </tr>
    <tr>
      <td><code>413</code></td>
      <td>Payload Too Large</td>
      <td>Event data will be split into smaller batches and re-sent.</td>
    </tr>
    <tr>
      <td><code>429</code></td>
      <td>Too Many Requests</td>
      <td>Indicates rate limiting. Event data will be re-sent in an exponential backoff pattern with jitter. If the issue persists for more than 5 days, the integration will be disabled, and already queued events will be retained for 7 days.</td>
    </tr>
  </tbody>
</table>
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 role="presentation" }
