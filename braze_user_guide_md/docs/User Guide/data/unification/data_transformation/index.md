## How it works

Many modern-day platforms have “webhooks,” or real-time API notifications, to send information about a new event or new data from one platform to another. Data Transformation provides:

* A Braze URL address to receive such webhooks.
* Capabilities to transform the webhook payload with JavaScript code to create valid requests to various Braze API endpoints, including Braze `/users/track` or `/catalogs`. For example, for the `/users/track` destination, you can choose what information to use from the webhook and how you want the data represented on Braze user profiles as user attributes, events, or purchases.
* Logging to perform quality assurance, troubleshoot, and monitor the performance of your transformations.

The end result is a webhook integration that connects a source platform of your choice by turning their webhooks into Braze updates.

**More on webhooks**


Webhooks are real-time notifications sent via an HTTP POST request to a specific destination. Webhooks are often used to send data from one point to another, in which the webhook can pass through data about an action that has occurred and who was involved in that action.

For example, a survey platform can send a webhook to a destination of your choice whenever a survey response to an online form is received. Or, a customer service platform can send a webhook to a destination of its choice whenever a customer service ticket is created.



## Data Transformation tiers

The following table describes the differences between the free and pro version of Data Transformation.

| Area | Free Version | Data Transformation Pro |
|----|----|----|
| Active transformations | Up to 5 per company | Up to 55 per company |
| Per month | 300,000 incoming requests per month | 10,300,000 incoming requests per month |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Data Transformation tiers" }

**Important:**


To request an upgrade to Data Transformation Pro, contact your Braze account manager or select the **Request Upgrade** button in the Braze dashboard.



### Rate limits

The rate limit for Braze Data Transformations is 1,000 incoming requests per minute per workspace. If you have Data Transformation Pro and need a higher rate limit, contact your Braze account manager.

## Frequently asked questions

### What gets synced with Braze Data Transformation?

Any data the external platform makes available in a webhook can be synced to Braze. The more an external platform sends via webhooks, the more options for choosing what gets synced.

### I’m a marketer. Do I need developer resources to use Braze Data Transformation?

While we would love for developers to use this feature as well, you don’t need to be one to use this! Marketers can also successfully set up transformations without developer resources.

### Can I still use Braze Data Transformation if my external platform only gives an email address or phone number as an identifier?

Yes. You can have your transformations updating the `/users/track` endpoint with the [email address or phone number as an identifier](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/#example-request-for-updating-a-user-profile-by-email-address).

This works by using `email` or `phone` as your identifier property in the transformation code instead of `external_id` or `braze_id`. The example [transformation code](https://www.braze.com/docs/user_guide/data/unification/data_transformation/use_cases#example-transformation-code) uses this functionality.

**Note:**


Early access users of Braze Data Transformation who started before April 2023 may be familiar with a `get_user_by_email` function that helped with this use case. That function has been deprecated.



### Does Braze Data Transformation log data points?

Yes, in most cases. Braze Data Transformation eventually creates a `/users/track` call that writes the attributes, events, and purchases you want. These will log data points in the same way as if the `/users/track` call was made independently. You have control over how many data points are logged based on how you write your transformation.

### How can I get help setting up my use case or with my transformation code?

Contact your Braze account manager for additional assistance.
