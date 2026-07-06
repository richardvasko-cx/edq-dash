# Use case: Booking reminder email system

> Braze is a comprehensive customer engagement platform that is designed to be highly programmatically controllable. In this use case, we’ll demonstrate just a few ways in which Braze provides functionality you can plug into use cases that sit at the intersection of product and marketing, such as booking systems.

This use case shows how you can use Braze features to build a booking reminder email messaging service. The service will allow users to book appointments and will message users with reminders of their upcoming appointments. Though this use case uses email messages, you can send messages in any, or multiple, channels based on a single update to a user profile.

Other benefits of creating this service include:
- Sent messages will have full tracking and reporting.
- Non-technical company users can update message content.
- Messages obey opt-in and opt-out statuses on user profiles per campaign configuration.
- You can use both booking data and message interaction data to segment and target users for additional messaging. For example, you can retarget those who don't open the initial reminder message with an additional reminder before their appointment.

Follow these steps to achieve this use case:
1. [Write upcoming booking data to a Braze user profile](#step-1)
2. [Set up and launch a booking reminder message](#step-2)
3. [Handle updated bookings and cancellations](#step-3)

## Step 1: Write upcoming booking data to a Braze user profile {#step-1}

Use the Braze [`/users/track`](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) endpoint to write a [nested custom attribute](https://www.braze.com/docs/user_guide/data/custom_data/custom_attributes/nested_custom_attribute_support/) to a user profile each time a booking takes place. Make sure the nested custom attribute contains all the information you need to send and personalize the reminder message. In this use case, we’ll name the nested custom attribute “trips”.

### Add booking

When a user creates a booking, use the following structure for the array of objects to send the data to Braze through the `/users/track` endpoint.


```json
{
 "attributes": [
       {
           "external_id": "test-user",
           "_merge_objects": true,
           "trips": [
               {"trip_id":"1","name":"London Trip","start_date"{$time:"2025-11-11"}},
               {"trip_id":"2","name":"Sydney Trip","start_date"{$time:"2025-11-11"}}
           ]
       }
   ]
}
```


The nested custom attribute “trips” will display in the user profile like so.

![Two nested custom attributes for a London trip and Sydney trip.](https://www.braze.com/docs/assets/img/use_cases/2_nested_attributes.png?fd2b4fc5086f714931ee52a417fda9e6){: style="max-width:70%;"}

### Update booking
When a user updates a booking, use the following structure for the array of objects to send the data to Braze through the `/users/track` endpoint.


```json
{
 "attributes": [
       {
           "external_id": "test-user",
           "_merge_objects": true,
           "trips": {
               "$update:":[
                   {
                       "$identifier_key":"trip_id",
                       "$identifier_value":"1",
                       "$new_object":{"trip_id":"1","name":"London Trip","start_date":{"$time":"2025-11-11"}}
                   }
               ]
           }
       }
 ]
}
```


### Remove booking



#### Send data through the `/users/track` endpoint
When a user deletes a booking, use the following structure for the array of objects to send the data to Braze through the `/users/track` endpoint.


```json

{
 "attributes": [
       {
           "external_id": "test-user",
           "_merge_objects": true,
           "trips": {
               "$remove:":[
                   {
                       "$identifier_key":"trip_id",
                       "$identifier_value": "1"
                   }
               ]
           }
       }
   ]
}
```



#### Write nested attributes to user profiles through the SDK

If you’re collecting appointment bookings with your app, website, or both and want to write that data directly to a user profile, you can use the Braze SDK to transmit this data. Here is an example utilizing the Web SDK:


```json
const json = [{
  "id": 1,
  "name": "London Trip",
  "start_date": {"$time”: “2025-05-08”}
}, {
  "id": 1,
  "name": "Sydney Trip",
  "start_date": {"$time”: “2025-11-11”}
}];
braze.getUser().setCustomUserAttribute("trips", json);
```




Braze removes the specified booking from the nested custom attribute in the user profile and displays any remaining bookings.

![A nested custom attribute for a London trip.](https://www.braze.com/docs/assets/img/use_cases/1_nested_attribute.png?e54a3f974d6bae230b055d98df50c46b){: style="max-width:70%;"}

## Step 2: Set up and launch a booking reminder message {#step-2}

### Step 2a: Create a target audience
Create a target audience to receive reminders using multi-criteria segmentation. For example, if you want to send a reminder two days before the booking date, select the following:

- A start date **in more than 1 days** and
- A start date **in less than 2 days** 

![A nested custom attribute "trips" with criteria for a start date that is more than one day and less than two days.](https://www.braze.com/docs/assets/img/use_cases/custom_nested_attribute.png?ab0f5c4fb2436cfa8463d1265e1746d5)

### Step 2b: Create your message

Create the reminder email message by following the steps in [Creating an email with custom HTML](https://www.braze.com/docs/user_guide/message_building_by_channel/email/html_editor/). Use Liquid to personalize the message with data from the custom customer attribute you created (“trips”), such as in this example.


```liquid
{% assign dates = {{custom_attribute.${trips}}} %}
{% assign today = "now" | date: "%s" %}
{% assign two_days = today | plus: 172800 | date: "%F" %}
You have the following booked in 2 days! Check the information below:
{% for date in dates %}
{% if date.start_date == two_days %}
{{date.trip_id}} 
{{date.name}}
{% endif %}
{% endfor %}
```


### Step 2c: Launch your campaign

Launch the campaign for the reminder email message. Now, each time Braze receives the "trips" custom attribute, Braze schedules a message according to the data included in the respective booking's object.

## Step 3: Handle updated booking updates and cancellations {#step-3}

Now that you’re sending reminder messages, you can set up confirmation messages to send when bookings are updated or canceled.

### Step 3a: Send updated data




#### Send data through the `/users/track` endpoint
Use the Braze [`/users/track`](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) endpoint to send a custom event when a user updates or cancels a booking. In that event, put the necessary data into event properties that will confirm the change. 

Let’s say that in this use case, a user has updated the date of their trip to Sydney. The event would look like:


```json
{
  "events": [
    {
      "external_id": "user_id",
      "name": "trip_updated",
      "time": "2025-03-07T08:19:23+01:00",
      "properties": {
        "id": 2,
        "name": "Sydney Trip",
        "old_time": "2025-11-12"
        "new_time": "2026-01-21"
      }
    }
  ]
}
```




#### Write nested attributes to user profiles through the SDK

Send custom events to the user profile through the SDK. For example, if you’re using the web SDK, you could send:


```json
braze.logCustomEvent("trip_updated", { 
  id: 2,
  name: "Sydney Trip",
  old_time: "2025-11-12",
  new_time: "2026-01-21"
});
```




### Step 3b: Create a message to confirm the update

Create an [action-based campaign](https://www.braze.com/docs/user_guide/engagement_tools/campaigns/building_campaigns/delivery_types/triggered_delivery/) to send the user a confirmation of their updated booking. You can [use Liquid to template event properties](https://www.braze.com/docs/user_guide/data/custom_data/custom_events/) that reflect the name, old time, and new time of the booking (or just the name if it’s a cancellation) into the message itself.

For example, you could compose the following message:


```liquid
Hi {{${first_name}}}, you have successfully updated the date of your trip, {{event_properties.${name}}}, from {{event_properties.${old_time}}} to {{event_properties.${new_time}}}
```


### Step 3c: Modify the user profile to reflect the update

Finally, to send the booking reminders from steps 1 and 2 based on the most recent data, update the nested custom attributes to reflect the change or cancellation in the booking.

#### Updated booking

If the user in this use case updated their Sydney trip, you’d use the `/users/track` endpoint to change the date with a call like this:


```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "_merge_objects": true,
      "trips": {
	  "$update": [
	    {
            "$identifier_key": "id",
            "$identifier_value": 2,
            "$new_object": {
              "start_date": "2026-01-21"
            }
          }
        ]
      }
    }
  ]
}
```


#### Cancelled booking

If the user in this use case cancelled their Sydney trip, you'd send the following call to the `/users/track` endpoint:


```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "trips": {
	  "$remove": [
	   {
            "$identifier_key": "id",
            "$identifier_value": 2
          }
         ]
      }
    }
  ]
}
```


After these calls are sent and the user profile is updated, the booking reminder messages will reflect the latest data about the user’s booking dates.

