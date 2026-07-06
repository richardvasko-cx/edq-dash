# Integration

> Integrating with Braze is a worthwhile process. But you're smart. You're **here**. Clearly, you already know that. But what you probably don't know is that you and your developers are about to go on a journey together that requires technical expertise, strategic planning, and consistent communication that will help you coordinate between the two.

**Note:**

 
Note that the contents of this article don't apply to email. Check that out in the [Email setup](https://www.braze.com/docs/user_guide/channels/email/email_setup/) section.



## The technical side of the integration process

You may find yourself thinking, "My developers are magical! They can do anything, so I usually just leave them to it!" And they probably are and probably can! But there's no reason why you shouldn't know what they're doing behind the scenes. In fact, it would help the entire process if you knew when to jump in with information and what to look for when they say, "Can you send me the API key and API endpoint?"

So, what are they doing when they integrate Braze with your app or site? Glad you asked!

### Step 1: They implement the Braze SDK

The Braze SDK (Software Development Kit) is how we send and get information to and from your app or site. Your engineers are, essentially, tying our apps together. To do this, they need a few pieces of key information:

* Your [API keys](https://www.braze.com/docs/api/api_key/)
* Your [SDK endpoint](https://www.braze.com/docs/user_guide/administer/personal/sdk_endpoints/)
  * Braze no longer gives out custom endpoints so use the predefined SDK endpoints. If you have been given a pre-existing custom endpoint, Here, you can find the setup steps involved for [Android](https://www.braze.com/docs/developer_guide/platform_integration_guides/android/initial_sdk_setup/android_sdk_integration/#step-5-optional-custom-endpoint-setup), [iOS](https://www.braze.com/docs/developer_guide/sdk_integration/?sdktab=swift), and [Web](https://www.braze.com/docs/developer_guide/platform_integration_guides/web/initial_sdk_setup/#initializing-the-sdk) integration.

You can either give this information to them directly, or you can give them access to Braze by creating an account for them. 

**Warning:**


Ensure that you and your developers don't unknowingly or unintentionally change the company's credentials in Braze, as this could cause issues during the implementation process or lock one or more of you out of your accounts.



### Step 2: They implement your desired messaging channels

Braze has many options for getting in touch with your users, and each requires its own setup or tweaking to work the way you want. This is where communication with your engineers becomes critical.

Be sure to tell your developers which channels you want to use to ensure that implementation is done efficiently and in proper order.

| Channel | Details |
|---|---|
| In-app messages | Requires SDK implementation as well as these channel-specific steps. |
| Push | Requires SDK implementation to provide proper handling around messaging credentials and push tokens. |
| Email | This is an entirely different process. Check out the [Email Setup](https://www.braze.com/docs/user_guide/channels/email/email_setup/) section for more details on integration. |
| Content Cards | To get started with [Content Cards](https://www.braze.com/docs/user_guide/channels/content_cards/), contact your Braze customer success manager. |
| SMS & MMS | Check out the [SMS Setup](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_setup/sms_sending/) section for more details on integration. |
| Webhooks | Requires SDK implementation as well as channel-specific steps. | 
{: .reset-td-br-1 .reset-td-br-2 aria-label="Step 2: They implement your desired messaging channels" }

**Tip:**


You can use Braze to create accessible messaging campaigns across each channel. Work with your developers to ensure that you meet accessibility standards in your implementation.



### Step 3: They set up your data

Braze isn't a one-trick pony. This isn't about just sending emails or sending push. This is about creating personalized customer journeys that are unique for every user and customer. The customer journeys are based on their actions within your app or site, and you get to define what those are! Your developers' next task is to ensure that actions taken within your app or site are picked up by Braze.

So, what do you need to do to get them this information?

1. Work with your marketing team to define campaigns, goals, attributes, and events you need to track. Define those use cases and share them with your teams.
2. Define your custom data requirements ([custom attributes](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes/), [custom events](https://www.braze.com/docs/user_guide/data/activation/events/custom_events/), etc.).
3. From there, discuss how that data should be tracked (triggered through the SDK, etc.).
4. Define how many [workspaces](https://www.braze.com/docs/user_guide/administer/global/create_and_manage_workspaces/) you need. Your engineers will need to know how to [test and configure](https://www.braze.com/docs/user_guide/get_started/workspaces/) these workspaces.

Once you discover all of this information, share it with your engineer. They'll take that information and implement your [custom data](https://www.braze.com/docs/user_guide/data/activation/custom_data/managing_custom_data/). You might even need to [import some users](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/). You should also be aware of [event naming conventions](https://www.braze.com/docs/user_guide/data/activation/events/event_naming_conventions/).

### Step 4: They customize based on what you want

If you want things like API-triggered launching and Connected Content, discuss that with both your Braze contact and your developers to ensure that you'll be able to get data that lives outside of your app and Braze into your messages.

### Step 5: You both perform QA on your implementation

Work together with your engineer to make sure everything is working. Send [test messages](https://www.braze.com/docs/developer_guide/in_app_messages/sending_test_messages/), use our [test apps for Android](https://www.braze.com/docs/developer_guide/references/?tab=android) and [test apps for iOS](https://www.braze.com/docs/developer_guide/references/?tab=swift), check every box before you start sending!

We even have specific instructions for [testing your Android or FireOS integration](https://www.braze.com/docs/developer_guide/platform_integration_guides/android/initial_sdk_setup/test_your_basic_integration/#test-your-basic-integration) and testing [push for iOS](https://www.braze.com/docs/developer_guide/platforms/legacy_sdks/ios/push_notifications/testing/).

## After implementation

Keep in mind that the implementation finish line isn't also the green light to send a million messages at once. Sending a million push might break your app if every customer clicks the same link simultaneously. We recommend discussing what your capacity of your internal setup is for handling requests from Braze before clicking that **Send** button. Then, you can set your [rate limiting](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping#rate-limiting) based on that.

![](https://www.braze.com/docs/assets/img/torchie/firebrands.png?2c573e2752d8c7ca5c768f4beae589b9){: style="max-width:15%;float:right;margin-left:15px;border:none;"}

After you're comfortable using Braze, consider becoming a Braze Firebrand! With Braze Firebrands, our customer engagement community, we're building a community of movers and shakers using Braze to modernize their customer experience and marketing. Interested in learning more? [Join now](https://brazefirebrands.splashthat.com/).
