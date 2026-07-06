# Your Braze audience

> Learn how Braze defines and manages your users, identifies users, and leverages user data to power segmentation, personalization, and messaging across channels.

In Braze, a user (and their user profile) represents an individual person you can message and analyze.

## User profiles

A [user profile](https://www.braze.com/docs/user_guide/audience/manage_audience/user_profiles/) acts as a single source of truth for everything Braze knows about that person, including:

- Identifiers (such as user IDs or external IDs)  
- Devices and messaging channels  
- Behavioral data and events
- Attributes and preferences 
- Message engagement history

A single user profile can be associated with multiple devices and channels, allowing you to understand and message someone holistically across platforms.

## Anonymous users and identified users

Users in Braze generally fall into one of two states.

### Anonymous users

An [anonymous user](https://www.braze.com/docs/user_guide/data/unification/user_data/user_profile_lifecycle/anonymous_users/) is someone who has interacted with your app or website but has not yet been assigned an identifier from your system (such as an `external_id`).

- Anonymous users are automatically created when the Braze SDK initializes  
- You can still track events, attributes, and message engagement  
- These users can receive messages, depending on channel and opt-in status

### Identified users

An [identified user](https://www.braze.com/docs/user_guide/data/unification/user_data/user_profile_lifecycle/#identified-user-profiles) is one that has been associated with an `external_id` you provide (for example, a customer ID or account ID).

Identifying a user allows you to:

- Merge activity across devices and sessions  
- Send messages consistently across channels  
- Segment and personalize using long-term user data  
- Manage profiles through APIs and integrations

When an anonymous user is later identified, Braze merges eligible data into the identified profile according to [this merge behavior](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/#merge-behavior). For example, push tokens and messaging history carry over, and many fields from the anonymous profile merge only when they are not already set on the identified profile; when values conflict, the identified profile is kept.

## Message users through channels

A [channel](https://www.braze.com/docs/user_guide/channels/) is a specific way Braze can deliver a message to a user. Common channels include:

- [Push (web or mobile)](https://www.braze.com/docs/user_guide/channels/push/)  
- [Email](https://www.braze.com/docs/user_guide/channels/email/)  
- [SMS, MMS, and RCS](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/)  
- [WhatsApp](https://www.braze.com/docs/user_guide/channels/whatsapp/)  
- [In-app messages](https://www.braze.com/docs/user_guide/channels/in_app_messages/)  
- [Content Cards](https://www.braze.com/docs/user_guide/channels/content_cards/)  
- [Banners](https://www.braze.com/docs/user_guide/channels/banners/)  
- [LINE](https://www.braze.com/docs/user_guide/channels/line/)  
- [Webhooks](https://www.braze.com/docs/user_guide/channels/webhooks/)  

A single user profile can have multiple channels attached, such as both an email address and a mobile device. Braze uses this model to coordinate messaging across channels while maintaining a unified view of the user.

Each channel has its own delivery rules, opt-in requirements, and metadata, but all are associated with the same user profile.

## Ways users enter Braze

Users are created in Braze whenever someone interacts with your brand through a supported integration or channel. How they are added depends on how you implemented Braze.



- When a user opens your app for the first time, the Braze SDK creates a user profile.
- Devices and push tokens are automatically registered.
- Events and attributes can be logged immediately.



- Users are created when the Web SDK initializes.
- Web push subscriptions register a browser as a messaging channel.



- Users can be created when you upload data, call APIs, or collect opt-ins.
- Email addresses and phone numbers are stored as channel identifiers.
- Opt-in status is tracked per channel and per region.



- You can create or update users directly through [REST APIs](https://www.braze.com/docs/api/endpoints/user_data/) or [importing a CSV](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/).
- External tools (such as CDPs, CRMs, or data warehouses) can sync users into Braze automatically.



## Audience data sources

User data in Braze typically comes from a combination of sources.



Braze SDKs automatically collect contextual data such as:

- Device type and OS  
- Language and timezone  
- App version and session activity



When users interact with your app or messages, Braze records:

- [Custom events](https://www.braze.com/docs/user_guide/data/activation/events/custom_events/) (for example, purchases or feature usage)
- Message opens, clicks, and conversions  
- Session activity and engagement trends



You can send data from your own tools into Braze using:

- [REST APIs](https://www.braze.com/docs/api/endpoints/user_data/)  
- [CSV uploads](https://www.braze.com/docs/user_guide/audience/manage_audience/import_users/csv_import/)  
- Scheduled data syncs

This often includes identifiers, account data, or historical context.



### User-provided input

Users may provide data directly through:

- [Preference centers](https://www.braze.com/docs/user_guide/audience/subscription_preferences/preference_center/)  
- Forms or surveys (SDKs or integrations)
- In-app experiences

### Integrations

Braze integrates with platforms like [Segment](https://www.braze.com/docs/partners/segment/), data warehouses, and analytics tech partners through integrations, allowing user data to flow automatically into user profiles.

## Manage user data

You can add, update, or remove user data in several ways:

- **Dashboard tools** for manual edits or CSV uploads  
- **APIs** for real-time or programmatic updates  
- **SDKs** for capturing behavior directly in your app or site  
- **Integrations** for ongoing synchronization

Data can be removed by:

- Clearing attribute values  
- Removing tags  
- Updating subscription states  
- Resetting users on logout (for anonymous use cases)

## Audience data features

Once user data is in Braze, it powers nearly every engagement capability. The more complete and accurate your user data is, the more effectively you can use the following features.

| Feature | Description |
| ---- | ---- |
| [Segmentation](https://www.braze.com/docs/user_guide/audience/segments) | Create audiences based on: {::nomarkdown}<ul><li>Attributes and custom fields</li> <li>Events and behaviors</li> <li>Message engagement</li> <li>Device and channel properties</li></ul>{:/} <br>Segments can be reused across campaigns and Canvases. |
| [Personalization](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize) | Use user data to tailor content, such as: {::nomarkdown}<ul><li>Names and preferences in message copy</li> <li>Dynamic recommendations</li> <li>Location- or language-specific content</li></ul>{:/} |
| Automation and orchestration  | Trigger messages and journeys based on: {::nomarkdown}<ul><li>User actions</li> <li>Attribute changes</li> <li>Time-based conditions</li></ul>{:/} |
| Cross-channel coordination | Reach users on the most appropriate channel while respecting: {::nomarkdown}<ul><li>Opt-in status</li> <li>Frequency caps</li> <li>Channel preferences</li></ul>{:/} |
| [Analytics and insights](https://www.braze.com/docs/user_guide/analytics) | Understand how different audiences behave by analyzing: {::nomarkdown}<ul><li>Engagement rates</li> <li>Conversion paths</li> <li>Segment performance over time</li></ul>{:/} |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Audience data features" }
