# [![Braze Learning course](https://www.braze.com/docs/assets/img/bl_icon3.png?5f6465f63e399dec15d7020b6f4d2452)](https://learning.braze.com/most-engaged-channel){: style="float:right;width:120px;border:0;" class="noimgborder"}Intelligent Channel filter

> The `Intelligent Channel` filter (previously `Most Engaged`) selects the portion of your audience for whom the selected messaging channel is their "best" channel. 

## About the Channel Filter

![The Intelligent Channel filter with a dropdown for the different channels that can be selected.](https://www.braze.com/docs/assets/img/intelligent_channel_filter.png?70bc2bb864f9892d4a767a8f23ffced5){: style="float:right;max-width:40%;margin-left:10px;margin-top:10px;border:0"}

In this case, best means the channel that has the highest likelihood of engagement, given the user's history. You can select email, SMS, WhatsApp, web push, or mobile push (including any available mobile OS or device) as a channel.

The Intelligent Channel computes the engagement rate for each user for each of the available channels by taking the ratio of message interactions (opens or clicks) to the number of messages received over the last six months of activity. The available channels are ranked according to their respective engagement ratios, and the channel with the highest ratio is the "Most Engaged" for that user. 

Every time a message is sent to a user, or a user interacts with a message, the engagement ratio is recalculated within seconds. A user can only be counted as interacting with a message once (for example, an open and click on the same email will cause that message to be marked as having been engaged with only once, not twice). 

To enable the Intelligent Channel filter, select the **Intelligent Channel** filter on the **Target Audiences** page when creating a email, web push, or mobile push campaign.

**Important:**


To compute the engagement rate of the SMS channel, turn on [SMS link shortening](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/link_shortening#overview/) with advanced tracking and click tracking. Without this tracking, SMS may be selected as the Intelligent Channel for a 0% engagement rate because of our [tie-breaking behavior](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_channel#tie-breaking).



## The "Not enough data" option

For Braze to determine which channel is "best", there needs to be enough data. This means that a user must have received at least three or more messages per channel across at least two of the three available channels. The messages don't necessarily need to have been opened. 

If users haven't received enough messages across the channels, those users will fall into the "Not Enough Data" option of this filter. This allows you to use any of the three available messaging channels to target these users.

For example, let's say you want users who prefer push messages to receive a push and users who don't have enough data to receive the same push message. In that case, you could set the Intelligent Channel filter to **Mobile push** and use **OR** to add a second Intelligent Channel filter set to **Not Enough Data**. A separate campaign with the Intelligent Channel filter set to email could address users who prefer email.

![Intelligent Channel filters for mobile push or not enough data.](https://www.braze.com/docs/assets/img/intelligent_example.png?d49c3fa0265043b0978f391992e52148){:style="border:none"}

**Note:**


Campaigns and Canvas Steps that ignore [frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping#delivery-rules) will not be accounted for by Intelligent Channel and cannot contribute to the data requirements.



## The "Mobile push" option

Mobile push incorporates Android, iOS, Kindle, and other mobile device channels available on Braze. When calculating the Intelligent Channel, Braze looks at each kind of mobile device separately and then chooses the highest engagement rate among them to represent the "Mobile Push" category when comparing against email and Web push. 

For example, if a user has several mobile devices, their mobile engagement rate would be represented by the highest rate exhibited across the devices. This would not, however, force the user to receive push notifications exclusively on that device. This rate is only used when comparing rates against email and web push.

## Message Open Likelihood filter for individual channels {#individual-channels}

Rather than let Braze choose the single best channel for a user, you can use the ["Message Open Likelihood" segmentation filter](https://www.braze.com/docs/user_guide/audience/segments/segmentation_filters#message-open-likelihood) to filter users based on whether or not they're likely to open a message on a specific channel you choose. This filter is calculated by the percentage of interactions divided by the total messages received for the last 100 messages sent per channel.

Note that a user must have received at least three messages on a specific channel before they can have a likelihood score for that channel. Users without sufficient data to measure a likelihood for a channel can be selected using "is blank."

## Best practices and effective use strategy

### Tie-breaking

Because some users will have low numbers of messages received, it's not unusual to have ties in engagement rates across the available channels for a given user (such as a single user has a 0.2 engagement rate for **both** email and mobile push). In such cases, ties will be broken by prioritizing (giving a higher ranking to) the channel with the most recent open events.

### Unreachable channels

A user may have sufficient data for Braze to determine a channel ranking, but then become unreachable on their highest-ranked channel. For example, a user whose historical best channel is email may have recently unsubscribed from email. If you send a message on that channel, it won't be delivered to that user. Users who are unreachable on specific channels should be targeted or routed separately.

### Audience sizing

Intelligent Channel allows you to selectively target in advance the fraction of users who have a much higher likelihood of engaging with a message than the rest of your audience. This is not likely to represent a majority of users in a typical audience. Rather, you can expect this filter to find the 5-20% from your usual audience who have an established record of engaging on a particular channel.


