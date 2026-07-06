# API-triggered delivery

> API-triggered campaigns or server-trigger campaigns are ideal for more advanced transactional use-cases. Braze API-triggered campaigns allow marketers to manage campaign copy, multivariate testing, and re-eligibility rules within the Braze dashboard while triggering the delivery of that content from their own servers and systems. The API request to trigger the message can also include additional data to be templated into the message in real-time.

## Setting up an API-triggered campaign

Setting up an API-triggered campaign takes a few steps. First, create a new multichannel or single-channel campaign (with multivariate testing).

**Note:**


An API-triggered campaign is different from an [API campaign](https://www.braze.com/docs/developer_guide/rest_api/api_campaigns/#api-campaigns).



Next, configure your copy and notifications the same way as you would normally for scheduled notifications and select **API-Triggered Delivery**. For more information on the triggering of these campaigns from your server, check out this [API-triggered campaign sending](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_triggered_campaigns/) article.

![](https://www.braze.com/docs/assets/img_archive/api_triggered_campaign_delivery.png?205130b3abf4e10eb92f5dea1912ee5c)

## Using the templated content included with an API request

In addition to triggering the message, you can also include content with the API request to be templated into the message within the `trigger_properties` object. This content can be referenced in the body of the message. Use exactly two curly brackets per Liquid tag in `trigger_properties` and message copy. An example is: `{{api_trigger_properties.${your_property}}}`. An extra `{` or `}` is a common cause of [API-triggered personalization failures](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/faq/#why-is-my-api-triggered-liquid-failing-in-braze).

See the following social notification example for additional context.

![The aforementioned trigger property included in the message to auto-fill the user's name followed with the text: "liked your photo! Click here to see what they've been up to.".](https://www.braze.com/docs/assets/img_archive/api_triggered_photo_social_example_1.png?ade2e450db3f23d42eb4acae8f6eea3c){: style="max-width:70%;"}

## Re-eligibility with API-triggered campaigns

The number of times a user receives an API-triggered campaign can be limited using re-eligibility settings. This means the user will receive the campaign only once or once in a given window, regardless of how many times the API trigger is fired.

For example, let's say you're using an API-triggered campaign to send the user a campaign about an item they recently viewed. In this case, you can limit the campaign to send a maximum of one message a day regardless of how many items they viewed while firing the API trigger for each item. On the other hand, if your API-triggered campaign is transactional, you will want to make sure that the user receives the campaign every time they do the transaction by setting the delay to zero minutes.

![](https://www.braze.com/docs/assets/img_archive/api_triggered_reeligible.png?5f5ed1c6b70b72075ac8dc7988f4c134)


