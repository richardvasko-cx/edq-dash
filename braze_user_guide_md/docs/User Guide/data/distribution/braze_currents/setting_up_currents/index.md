# [![Braze Learning course](https://www.braze.com/docs/assets/img/bl_icon3.png?5f6465f63e399dec15d7020b6f4d2452)](https://learning.braze.com/currents-the-basics-2/){: style="float:right;width:120px;border:0;" class="noimgborder"}Set up Currents

> This page outlines and describes the generic process for integrating and configuring Braze Currents.

**Important:**


Currents are included with certain Braze packages. Contact your Braze representative if you have any questions or want to gain access.



If you see "You do not have any remaining Currents integrations" when adding a new integration, common causes are:

- No Currents entitlement has been purchased for this workspace.
- The Currents entitlement is available in a different workspace in your company.

Contact your Braze account manager to request an entitlement or adjust your configuration.

## Requirements

Using Currents with any of our partners requires the same basic parameters and connection methodology.

Each partner requires that Braze has permission to write and send data files to them, and Braze asks for the location they should write those files to, specifically bucket names or keys.

The following requirements are the basic, minimum requirements to integrate with most of our partners. Some partners will require additional parameters, which are listed in their respective [partner documentation](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/setting_up_currents/available_partners/) along with any nuances associated with these basic requirements.

| Requirement | Origin | Access | Description
|---|---|---|---|
| Account with partner | Arrange account with that partner or contact your Braze account manager for suggestions. | Check that partner's site or contact that partner to sign up. | Braze will not send data to a partner if you don't have access to that data through your company's account.
| Partner API Key or Token | Usually the partner's dashboard. | Copy and paste it into the designated Braze field. | Braze has a designated field for this in the integrations page for that partner. We need this to map where we send your data. **Keep your Partner Keys or Tokens up to date; invalid credentials may disable your connector and drop events.**
| Authentication Code/Key, Secret Key, Certification File | Contact a representative for your account with that partner. May also exist in the partner's dashboard. | Copy and paste keys into the designated Braze field. Generate and upload `.json` or other certification files into the appropriate place in Braze. | Braze has a designated field for this in the integrations page for that partner. This gives Braze credentials and authorizes us to write files to your partner account. **It's important to keep your authentication details up to date; invalid credentials may result in disabling your connector, and dropping events.**
| Bucket, Folder Path | Some partners organize and sort data by buckets. This should be found in the partner's dashboard. | If this is required, copy the bucket name or file path exactly into the designated space in Braze. | Though this is required for some partners, it's important to get right when you do need it. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3  .reset-td-br-4 aria-label="Requirements" }

**Important:**


It's important to keep your Partner Keys, Partner Tokens, and authentication details updated; if your connector's credentials expire, the connector will stop sending events. If this persists for more than **5 days**, the connector's events will be dropped and data will be permanently lost.



## Setting up Currents

### Step 1: Choose your partner

Braze Currents allows you to integrate through Data Storage using flat files or to our behavioral analytics and customer data partners using a batched JSON payloads to a designated endpoint.  

Before you begin your integration, it's best to decide which integration is best for your purposes. For example, if you already use mParticle and Segment and would like Braze data to stream there, it would be best to use a batched JSON payload. If you would prefer to manipulate the data on your own or have a more complex system of data analysis, it might be best to use Data Storage ([Braze uses this method](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/use_cases/how_braze_uses_currents/)!)

### Step 2: Open Currents

To get started, go to **Partner Integrations** > **Currents**. You'll be taken to the Currents integration management page.

![Currents page in the Braze dashboard](https://www.braze.com/docs/assets/img_archive/currents-main-page.png?44ae049146049c9495af044ffb2fabf5)

### Step 3: Add your partner

Add a partner, sometimes called a "Currents connector," by selecting the dropdown at the top of the screen.

Each partner requires a different set of configuration steps. To enable each integration, refer to our list of [available partners](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/setting_up_currents/available_partners/) and follow the instructions on their respective pages.

### Step 4: Configure your events

Choose the events you wish to pass to that partner by checking from the available options. You can find listings of these events in our [Customer Behavior Events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/customer_behavior_events/) and [Message Engagement Events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events/) libraries.

![](https://www.braze.com/docs/assets/img/current4.png?4c906976ea89b1280312086d7e59bb15)

If needed, you can learn more about our events in our [event delivery semantics](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/setting_up_currents/event_delivery_semantics/) article.

### Step 5: Set up field transformations

You can use Currents field transformations to remove or hash a string field.

- **Remove:** Replaces the string field with `[REDACTED]`. This is helpful if your partner rejects events with missing or empty fields.
- **Hash:** Applies an SHA-256 hashing algorithm to the string field.

Selecting a field for one of these transformations will apply that transformation to all events in which that field appears. For example, selecting `email_address` for hashing will hash the `email_address` field in Email Send, Email Open, Email Bounce, and Subscription Group State Change events.

![Adding field transformations](https://www.braze.com/docs/assets/img/current3.png?024d1ea8f9aa4c950324551a54b1119f)

### Step 6: Test your integration

**Important:**


Currents will drop events with excessively large payloads of greater than 900&nbsp;KB. 



Before you test, consider checking out our [sample Currents data in GitHub](https://github.com/Appboy/currents-examples). When you're ready to test, you choose an option below:

#### Sending test events

To test your integration, you can select **Send Test Events** to send one event from each of your selected event types to this Current. For detailed information about each event type, refer to our [Customer Behavior Events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/customer_behavior_events/) and [Message Engagement Events](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events/) libraries.

![The "Currents Test" page in the Braze dashboard.](https://www.braze.com/docs/assets/img/currents/current_test_events.png?7eacf3ea5ba54b85103ccab11ec52f9d){: style="max-width:70%;"}

#### Testing Currents connectors

Test Currents connectors are free versions of our existing connectors that can be used for testing and trying out different destinations. Test Currents have:

- Up to 10 Test Currents connectors per workspace.
- An aggregate maximum of 1,500 events per fixed 24-hour period, resetting at midnight UTC. This event total is updated hourly on the dashboard.

After your Test Currents connectors reach the sending limit, your connector will not send events until the next day (at midnight UTC).

To upgrade your Test Currents connector, edit the integration in the dashboard and select **Upgrade Test Integration**.

## Updating Currents

To update your Currents connector after launching, do the following:

1. In Braze, navigate to **Partner Integrations** > **Data Export**.
2. Locate and your Currents connector in the list.
3. Select <i class="fas fa-pencil"></i>&nbsp;**Edit**.
4. Make your changes.
5. Select **Update Current**.

This will not stop your existing export and will begin sending events according to your new selection.

**Note:**


It may take some time for your changes to take effect.



## IP allowlisting

Braze will send Currents data from the listed IPs:















<!--The following section is the list of IPs for IP allowlisting-->



