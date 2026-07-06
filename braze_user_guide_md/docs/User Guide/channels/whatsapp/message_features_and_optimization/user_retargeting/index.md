# User retargeting 

> In addition to changing the user’s subscription state, Braze will also record interactions with the user profile for filtering and triggering messages.<br><br>These filters and triggers allow you to filter users that have received WhatsApp messages or received WhatsApp messages from a specific WhatsApp campaign or Canvas step.

## Retargeting options

**Note:**


When building audiences with user retargeting, you may wish to include or exclude certain users based on their preferences, and in order to comply with privacy laws, such as the “Do Not Sell or Share” right under the CCPA. Marketers should implement the relevant filters for users’ eligibility within their Canvas and/or Campaign entry criteria.



### Filter users by WhatsApp

Users can be filtered by when they last received a WhatsApp or if they have received a WhatsApp from a specific WhatsApp campaign. Filters can be set in the Target Users step of the campaign builder.

#### Filter by last received WhatsApp

![Filter for last receiving a WhatsApp message on April 22, 2025.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp23.png?6d5d2425629cba7f0eb1a370e49e113c){: style="max-width:75%"}

#### Filter by received messages from WhatsApp campaign

Filters users who have received a message from a specific WhatsApp campaign. With this filter, you also have the option to filter off those that have not received messages from a WhatsApp campaign.

**Note:**


When a WhatsApp message is delivered, opened, or clicked, Braze updates data for all profiles that share the same phone number as the profile that logged the interaction, so users who share that number with someone who received, opened, or clicked the message can match "received" filters even if they were not directly sent it.



![Filter for receiving a WhatsApp campaign.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp22.png?ced131dd6e2c8b247024d473589d02d1){: style="max-width:75%"}

### Filter by engagement

Retarget users who have, or have not, read a WhatsApp campaign or Canvas step. 

#### Retarget users who have opened/read a specific WhatsApp Campaign

1. Create a segment using the **Clicked/Opened Campaign** filter.
2. Select **read WhatsApp message**.
3. Choose the desired campaign.

![Filter for having read a WhatsApp message.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp21.png?0e02674a42471e9defa1b0159e94fa15){: style="max-width:75%"}

#### Retarget users who have opened/read a specific Canvas Step

1. Create a segment using the **Clicked/Opened Step** filter.
2. Select **read WhatsApp message**.
3. Choose the desired Canvas and Canvas steps.

![Filter for reading a WhatsApp step.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp20.png?1d8323944657690f2e4cbe87215aaa01){: style="max-width:75%"}

#### Filter by campaign or Canvas attribution

Filter for users who have opened/read to a specific WhatsApp campaign or Canvas component or tag.

![Filter for opening a specific WhatsApp message.](https://www.braze.com/docs/assets/img/whatsapp/whatsapp19.png?2b77a3ffabe2853340dfeebe44ae0439){: style="max-width:75%"}

