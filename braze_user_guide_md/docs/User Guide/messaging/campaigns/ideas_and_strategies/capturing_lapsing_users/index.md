# Capture lapsing users

> If your audience is dwindling, it's crucial to try wooing them back. With Braze, you can set up automated recurring re-engagement campaigns to capture lapsing users. You can choose the re-engagement timeframe and recurrence that best suits your app, but to demonstrate, we'll get started with a 14 day re-engagement plan.

For more on targeting users, check out our [Braze Learning course](https://learning.braze.com/campaign-setup-delivery-targeting-conversions) on campaign setup!

## Step 1: Segment users

First, we'll create a segment to target users who haven't used your app in the past two weeks, using the following filters:

- **Last Used App** more than 2 weeks ago
- **Last Used App** less than 3 weeks ago

![](https://www.braze.com/docs/assets/img_archive/2weeklapse1.png?9eb9b1fd161795b3427dc8c8067a3059){: style="max-width:70%;"}

Name the segment something memorable, like "Lapsed Users – 2 Weeks." Because we're setting up the campaign to recur on a weekly basis, we want to make sure there's at least one week of users captured in the segment. That's why we've selected users who last used the app between two to three weeks ago.

## Step 2: Create a campaign

Next, click **Create Campaign** and choose the type of campaign we will be sending to this segment. in this example, we'll create a new [push campaign](https://www.braze.com/docs/user_guide/channels/push/create_a_push_message/).

![](https://www.braze.com/docs/assets/img_archive/2weeklapse2.png?4eac57ac6da447747456f467011a9068){: style="max-width:70%;"}

We'll name the campaign "Message to Lapsed Users - 2 Weeks" and then create the content of our message. In this example, we'll only target iOS users, but you can use Braze for Android and iOS push notifications. 

The closer to the last time a user was in the app, the more important it is to be topical and relevant. When messaging a user after two weeks of not using the app, it's important to surface relevant content and highlight the benefits of using the app.

![](https://www.braze.com/docs/assets/img_archive/2weeklapse3.png?03fbbb58f4317819e51d0678bae6d281){: style="max-width:70%;"}

Next, we'll create a recurring schedule to send our weekly message on Thursdays at 5:45 pm using [local time zone delivery](https://www.braze.com/docs/help/faqs/#what-does-local-time-zone-delivery-offer) in **Time-Based Scheduling Options**. We recommended that you look at your sessions graph to target users just prior to high-usage periods. This ensures that you attempt to re-engage people when they're most likely to use the app. You can change this later and test your initial hypothesis.

![](https://www.braze.com/docs/assets/img_archive/2weeklapse4.png?ba848ec104de67f9b541f7bb6860b956){: style="max-width:70%;"}

## Step 3: Launch the campaign

Now, you're ready to send the campaign. Confirm the settings on the last page of the composer and click **Launch Campaign**!

