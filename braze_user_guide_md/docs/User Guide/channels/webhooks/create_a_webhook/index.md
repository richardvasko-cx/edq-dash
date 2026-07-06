# Create a webhook campaign

> Creating a webhook campaign or including a webhook in a multichannel campaign allows you to trigger non-app actions by providing other systems and applications with real-time information. 

You can use webhooks to send information to systems, such as Salesforce or Marketo, or to your backend systems. For example, you might want to credit your customers' accounts with a promotion after they've performed a custom event a certain number of times.

**Tip:**


To learn more about what webhooks are and how you can use them in Braze, check out [Webhooks](https://www.braze.com/docs/user_guide/channels/webhooks/) before proceeding.



## Step 1: Choose where to build your message

Not sure whether your message should be sent using a campaign or a Canvas? Campaigns are better for single, targeted messaging campaigns, while Canvases are better for multi-step user journeys.




**Steps:**

1. Go to **Messaging** > **Campaigns** and select **Create Campaign**.
2. Select **Webhook**, or, for campaigns targeting multiple channels, select **Multichannel**.
3. Name your campaign something clear and meaningful.
4. (Optional) Add a description to describe how this campaign will be used.
4. Add [teams](https://www.braze.com/docs/user_guide/administer/global/user_management/teams/) and [tags](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/tags/) as needed.
   * Tags make your campaigns easier to find and build reports out of. For example, when using the [Report Builder](https://www.braze.com/docs/user_guide/analytics/reports/report_builder/), you can filter by particular tags.
5. Add and name as many variants as you need for your campaign. You can choose different webhook templates for each of your added variants. For more on this topic, refer to [Multivariate and A/B testing](https://www.braze.com/docs/user_guide/messaging/ab_testing/).

**Tip:**


If all of the messages in your campaign are going to be similar or have the same content, compose your message before adding additional variants. You can then choose **Copy from Variant** from the **Add Variant** dropdown.






**Steps:**

1. [Create your Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/) using the Canvas composer.
2. After you've set up your Canvas, add a step in the Canvas builder. Name your step something clear and meaningful.
3. Choose a [step schedule](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#schedule-your-canvas-step) and specify a delay as needed.
4. Filter your audience for this step as necessary. You can further refine the recipients of this step by specifying segments and adding additional filters. Audience options will be checked after the delay at the time messages are sent.
5. Choose your [advancement behavior](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#advancement-behavior).
6. Choose any other messaging channels which you would like to pair with your message.




## Step 2: Build your webhook

You can choose to create a webhook from scratch, use an existing template, or use one of our existing templates. Then, build your webhook in the **Compose** tab of the editor.

The **Compose** tab consists of the following fields:

- Language
- Webhook URL
- HTTP method
- Request body

![The "Compose" tab with an example webhook template.](https://www.braze.com/docs/assets/img_archive/webhook_compose.png?50ea81f106ae80aeeab8889296098081)

#### Language {#internationalization}

[Internationalization](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies/#campaigns-in-multiple-languages) is supported in the URL and the request body. To internationalize your message, select **Add languages** and fill out the required fields. 

We recommend selecting your languages before writing your content so you can fill in your text where it belongs in the Liquid. For our full list of available languages you can use, refer to [Languages supported](https://www.braze.com/docs/developer_guide/platform_integration_guides/android/advanced_use_cases/localization/#languages-supported).

If you're adding copy in a language that is written right-to-left, note that the final appearance of right-to-left messages depends largely on how service providers render them. For best practices on crafting right-to-left messages that display as accurately as possible, refer to [Creating right-to-left messages](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/localization/right_to_left_messages/).

#### Webhook URL

The webhook URL, or HTTP URL, specifies your endpoint. The endpoint is the place where you'll be sending the information that you're capturing in the webhook. 

If you'd like to send information to a vendor, the vendor should provide this URL in their API documentation. If you're sending information to your own systems, check with your development or engineering team to confirm you're using the correct URL. 

Braze only allows URLs that communicate over standard ports `80` (HTTP) and `443` (HTTPS).

##### Using Liquid

You can personalize your webhook URLs using [Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/). At times, certain endpoints may require you to identify a user or provide user-specific information as part of your URL. When using Liquid, make sure to include a [default value](https://www.braze.com/docs/developer_guide/analytics/setting_user_ids/?tab=web) for each piece of user-specific information that you use in your URL.

#### HTTP method

The HTTP method you should use varies depending on the endpoint to which you are sending information. In most cases, you'll use POST.

| HTTP method | Description |
| ----------- | ----------- |
| POST | Writes new information on the receiving server. This is the most common method used when sending data. |
| GET | Retrieves existing information, as opposed to writing new information. By definition, a GET request does not support a request body. |
| PUT | Updates information on the endpoint, replacing any existing information with what's in the request body. |
| DELETE | Deletes the resource in the HTTP URL. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="HTTP method" }

#### Request body

The request body is the information that will be sent to the URL that you specified. You can  create the body of your webhook request with JSON key-value pairs or raw text.

##### JSON key-value pairs

JSON key-value pairs allow you to easily write a request for an endpoint that expects a JSON format. You can only use this with an endpoint that expects a JSON request. For example, if your key is `message_body`, the corresponding value might be `Your order just arrived!`. After you've entered your key-value pair, the composer will configure your request in JSON syntax, and a preview of your JSON request will automatically populate.

![Request body set to JSON key-value pairs.](https://www.braze.com/docs/assets/img/webhook_json_1.png?becf0ae2980f8d192ffab479cc8e4120)

You can personalize your key-value pairs using Liquid, such as including any user attribute, [custom attribute](https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/analytics/setting_user_ids/#additional-notes-and-best-practices), or [event property](https://www.braze.com/docs/user_guide/data/activation/events/custom_events/) in your request. For example, you can include a customer's first name and email in your request. Be sure to include a [default value](https://www.braze.com/docs/developer_guide/analytics/setting_user_ids/?tab=web) for each attribute.

##### Raw text

The raw text option gives you the flexibility to write a request for an endpoint that expects a body of any format. For example, you might use this to write a request for an endpoint that expects your request to be in XML format. 

Both [personalization](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/) and [internationalization](https://www.braze.com/docs/user_guide/messaging/campaigns/ideas_and_strategies/#campaigns-in-multiple-languages) using Liquid is supported in raw text.

![An example of a request body with raw text using Liquid.](https://www.braze.com/docs/assets/img_archive/webhook_rawtext.png?bf17237fbbf1ba70de38934d6c262d4f)

If you set the `Content-Type` [request header](#request-headers-optional) to `application/x-www-form-url-encoded`, the request body must be formatted as a URL-encoded string. For example:


```
to={{custom_attribute.${example}}}&text=Your+order+just+arrived
```


![Request body with URL-encoded string.](https://www.braze.com/docs/assets/img_archive/webhook_rawtext_URL-encoded.png?046771a87fd7d2bb85315dceab3e81f8)

## Step 3: Configure additional settings

#### Request headers (optional)

Certain endpoints may require that you include headers in your request. In the **Compose** section of the composer, you can add as many headers as needed.

![Request header examples for "Authorization" key and "Content-type" key.](https://www.braze.com/docs/assets/img_archive/webhook_request_headers_example.png?4715c97a5b7a3437fa7555e4f8ec8298)

Common request headers are `Content-Type` specifications (which describe what type of data to expect in the body, such as XML or JSON) and authorization headers that contain your credentials with your vendor or system. 

Content type specifications must use the key `Content-Type`. Common values are `application/json` or `application/x-www-form-urlencoded`.

Authorization headers must use the key `Authorization`. Common values are  `Bearer {{YOUR_TOKEN}}` or `Basic {{YOUR_TOKEN}}`  where `YOUR_TOKEN` is the credentials provided by your vendor or system.

## Step 4: Test send your message

Before making your campaign go live, Braze recommends that you test the webhook to make sure the request is formatted properly.

To do so, switch to the **Test** tab and send a test webhook. You can test the webhook as a random user, a specific user (by entering their email address of external user ID), or a customized user with attributes of your choosing.  

After sending the test webhook, a dialog will appear with the response message. If the webhook request is unsuccessful, refer to the error message for assistance in troubleshooting your webhook. The following example details the response of a webhook with an invalid webhook URL.

```http
404 Not Found

{
  "error": {
    "message": "Unrecognized request URL. Please see https://lob.com/docs or email us at support@lob.com.",
    "status_code": 404
  }
}

```

For more information, see [Send test messages](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/sending_test_messages/?tab=webhook).

## Step 5: Build the remainder of your campaign or Canvas




Next, build the remainder of your campaign. See the following sections for further details on how to best use our tools to build webhooks.

#### Choose delivery schedule or trigger

Webhooks can be delivered based on a scheduled time, an action, or based on an API trigger. For more, refer to [Scheduling your campaign](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/).

For action-based delivery, you can also set the campaign's duration and [Quiet hours](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/quiet_hours/).

This step is also where you can specify delivery controls, such as allowing users to become [re-eligible](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/re_eligibility/#campaigns) to receive the campaign, or enabling [frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/#frequency-capping) rules.

#### Choose users to target

Next, you must [target users](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/target_users/) by choosing segments or filters to narrow down your audience. In this step, you select the larger audience from your segments, and narrow that segment further with our filters, if you choose. You automatically receive a preview of what that approximate segment population looks like. Keep in mind that exact segment membership is always calculated before the message is sent.

**Important:**


Your message will only be sent to users who already match the conditions you set in the **Target Audience** step. After that, they still need to meet the trigger you define in the **Schedule Delivery** step. Think of the target audience as a waiting room—only people already inside can move forward when the next action happens. 



#### Choose conversion events

Braze allows you to track how often users perform specific actions, [conversion events](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/conversion_events/), after receiving a campaign. You have the option of allowing up to a 30-day window during which a conversion will be counted if the user takes the specified action.





If you haven't done so already, complete the remaining sections of your Canvas step. For further details on how build out the rest of your Canvas, implement multivariate testing and Intelligent Selection, and more, refer to the [Build your Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#step-3-build-your-canvas) step of our Canvas documentation.




## Step 6: Review and deploy

After you've finished building the last of your campaign or Canvas, review its details, test it, then send it!

## Things to know

### Errors, retry logic, and timeouts

Webhooks rely on Braze servers making requests to an external endpoint, and errors can occasionally occur. The most common errors include syntax errors, expired API keys, rate limits, and unexpected server-side issues. Before sending a webhook campaign:

- Test your webhook for syntax errors
- Ensure personalized variables have default values

If your webhook fails to send, an error message gets logged to the [Message Activity Log](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/), and includes details like the error timestamp, app name, and details about the error.

![Webhook error with the message "An active access token must be used to query information about the current user".](https://www.braze.com/docs/assets/img_archive/webhook-error.png?27ca392cc5bec5126e9ab4375324438e)

If the error message is not clear enough regarding the source of the error, you should check the documentation of the API endpoint you're using. These typically provide an explanation of the error codes the endpoint uses as well as what they're typically caused by.

#### Response codes and retry logic

When the webhook request is sent, the receiving server will return a response code indicating what happened with the request. The following table summarizes the different responses the server may send, how they impact campaign analytics, and whether, in the case of errors, Braze will try to redeliver the campaign:

| Response code | Marked as received? | Retries? |
|---------------|-----------|----------|
| `20x` (success)  | Yes |   N/A  |
| `30x` (redirection)  | No | No |
| `408` (request timeout)  | No | Yes |
| `429` (rate limited)  | No | Yes |
| `Other 4XX` (client error)  | No | No |
| `5XX` (server error)   | No | Yes |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Response codes and retry logic" }

**Note:**


Braze retries the above status codes up to five times within 30 minutes using exponential backoff. If we can't reach your endpoint, retries may be spread over a 24-hour period.<br><br>Each webhook is allowed 90 seconds before it times out.



`Retry-After` and rate-limit response headers can affect how long Braze waits before a **retriable** attempt (for example, after `408`, `429`, or `5XX`). They do not make non-retriable responses, such as `401`, eligible for retry.

#### Authentication and Connected Content credentials

The outbound webhook HTTP request does not support attaching [Connected Content credentials](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content/making_an_api_call/#authentication-types) (`:basic_auth` or `:auth_credentials`) to authenticate against your endpoint. Set authentication using **Request headers** on the webhook instead. To fetch a token or secret at send time, you can place a `{% connected_content %}` tag in a header or body field so Liquid resolves it before the webhook is sent.

#### Saved webhook templates and campaign usage

Braze does not provide a built-in report that lists every campaign or Canvas step that references a given **saved webhook template**. To audit usage, review webhook steps that use the same URL and HTTP method, or contact [Braze Support](https://www.braze.com/docs/support_contact/).

#### Troubleshooting and additional error details

For detailed explanations, troubleshooting steps, and guidance on resolving specific webhook errors, refer to [Troubleshoot webhook and Connected Content requests](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content/troubleshooting_webhooks_and_connected_content/). You'll also find more explanations on how our unhealthy host detection system works and how Braze provides error notifications through automated emails and additional logging in Braze Currents.

### IP allowlisting {#ip-allowlisting}

When a webhook is sent from Braze, the Braze servers make network requests to our customers or third-party servers. With IP allowlisting, you can verify that webhook requests are coming from Braze, adding a layer of security.

Braze will send webhooks from the following IPs. The listed IPs are automatically and dynamically added to any API keys that have been opted-in for allowlisting.

**Important:**


If you're making a Braze-to-Braze webhook and using allowlisting, you should allowlist all the following IPs, including `127.0.0.1`.

















<!--The following section is the list of IPs for IP allowlisting-->




