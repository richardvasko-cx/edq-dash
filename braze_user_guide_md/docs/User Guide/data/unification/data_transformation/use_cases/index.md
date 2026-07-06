# Data Transformation use cases

> Consider the following possible use cases with Braze Data Transformation and a combination of webhooks from the example external platforms.

## Generating leads

You host a lead generation Typeform form on your website. When new users fill out this form, you can:
- Create new users in Braze.
- Add them to one of your Braze email lists.
- Sync some of their responses as custom attributes in Braze, as their answers are valuable first-party data that can power personalized messaging experiences for future use.

## Opening service tickets

When customers open customer service tickets on a platform like Zendesk, you can:
- Write a custom event in Braze when a Zendesk ticket is created.
- Write a custom event with event properties in Braze when a negative CSAT rating is provided to Zendesk.

## Integrating with Braze

Braze has an integration with [Iterate](https://www.braze.com/docs/partners/additional_channels_and_extensions/extensions/surveys/iterate/), a customer insights and survey platform. With Data Transformation, you can save multiple survey responses under one nested custom attribute, instead of to the existing integration that saves multiple custom attributes.

## Example transformation code

Consider this sample payload from Typeform, a survey platform, which sends whenever a survey response is received.

![](https://www.braze.com/docs/assets/img/data_transformation/data_transformation2.png?6bb06c0aa893bd03c9227de15c977e66)




This example takes survey answers as attributes and writes an event to indicate that the survey was completed:

```
return {
  "attributes": [ 
    {
      "email": payload.form_response.hidden.email_address,
      "_update_existing_only": true,
      "home_city": payload.form_response.answers[0].text,
      "home_weather_rating": payload.form_response.answers[1].number
    }
  ],
  "events": [ 
    {
      "email": payload.form_response.hidden.email_address,
      "_update_existing_only": true,
      "name": "weather_survey_completed",
      "time": new Date(),
      "properties": {
        "form_id": payload.form_response.form_id
      }
    }
  ]
}
```




Let's further build on the basic transformation example and introduce an `if` statement to categorize the user in one of the answers.

```
let nps_category;
let nps_number = payload.form_response.answers[1].number;
if (nps_number < 7) {
  nps_category = "Detractor";
} else if (nps_number == 7 || nps_number == 8) {
  nps_category = "Passive";
} else if (nps_number > 8) {
  nps_category = "Promoter";
}

return {
  "attributes": [ 
    {
      "email": payload.form_response.hidden.email_address,
      "_update_existing_only": true,
      "home_city": payload.form_response.answers[0].text,
      "home_weather_NPS_category": nps_category
    }
  ],
  "events": [
    {
      "email": payload.form_response.hidden.email_address,
      "_update_existing_only": true,
      "name": "weather_survey_completed",
      "time": new Date(),
      "properties": {
        "form_id": payload.form_response.form_id
      }
    }
  ]
};
```



[1]: /docs/assets/img/data_transformation/data_transformation2.png?6bb06c0aa893bd03c9227de15c977e66