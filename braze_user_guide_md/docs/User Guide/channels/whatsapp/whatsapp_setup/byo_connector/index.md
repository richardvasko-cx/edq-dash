# Bring Your Own WhatsApp connector

> The Bring Your Own (BYO) WhatsApp connector offers a partnership between Braze and Infobip, in which you give Braze access to your Infobip WhatsApp Business Manager (WABA). This allows you to manage and pay for messaging costs directly with Infobip while using Braze for segmentation, personalization, and campaign orchestration. Braze maintains all existing functionality that the WhatsApp channel offers, such as outbound messages, inbound message processing, WhatsApp flows, and analytics.

## Requirements 

| Requirement | Description |
| --- | --- |
| Infobip account | An Infobip account is required to use the BYO WhatsApp connector.
| Message or Action Credits | You consume Braze Action Credits when you send WhatsApp messages. |
| WhatsApp requirements | Complete all [WhatsApp requirements](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/#prerequisites). |
| Phone number | We suggest you [acquire a phone number through Infobip](https://www.infobip.com/docs/numbers/getting-started) for convenience. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Requirements" }

## Set up 

Before setting up the BYO WhatsApp connector, confirm that your WhatsApp Business Account's previous sending hasn’t been done through Infobip.

### Supported cases

- WhatsApp Business Account and phone number have never been connected to a partner before
- WhatsApp Business Account is connected directly to Braze through the native integration.
    - Follow the steps in [WhatsApp phone number migration](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/whatsapp_phone_numbers/migrate_a_phone_number/) to migrate your phone numbers to a new WhatsApp Business Account one phone number at a time.
- WhatsApp Business Account is connected to a different solution provider from Braze and Infobip
    - Follow the steps in [WhatsApp phone number migration](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/whatsapp_phone_numbers/migrate_a_phone_number/) to migrate your phone numbers to a new WhatsApp Business Account one phone number at a time.

## Step 1: Retrieve Infobip account information {#step-1}

1. In Infobip, identify the account that you want to use with your WhatsApp Business Account. 
2. Go to **Developer Tools** > **API Keys** and select **Create API Key**.

!["Create API key" page with a creation date of "16/12/2025" and expiration date of "16/12/36".](https://www.braze.com/docs/assets/img/whatsapp/byo_connector/create_api_key.png?637aa61de060d3a9f94d5abddce61bfa)

{: start="3"}
3. Give the key a meaningful name, such as “Braze - My Workspace Name - My WABA Name”.
4. Add an expiry date that is far into the future to avoid issues with token expiration.
    - Make a note to generate a new API key and reconnect your WABA before the expiry date.
5. Select these scopes:
- `Message:send`
- `Whatsapp:manage`
- `Whatsapp:message:send`
- `Account-management:manage`
- `Subscriptions:manage`
- `Metrics:manage`
6. After creating the key, copy the API Key.
    - The key can only be copied for a limited time after creation. You can repeat these steps to create a new key if you need to connect another WhatsApp Business Account in the future.

!["Braze Example API Key" with 6 added scopes.](https://www.braze.com/docs/assets/img/whatsapp/byo_connector/api_key.png?8f4da96c7a09a377bb3a109da262d3ec)

{: start="7"}
7. Copy the account API base URL.

!["API keys" page with an API base URl highlighted.](https://www.braze.com/docs/assets/img/whatsapp/byo_connector/api_base_url.png?ecc01df50f9858f1d61df376ad32c6bc)

## Step 2: Start the embedded signup

1. In Braze, go to **Partner Integrations** > **Technology Partners** > **WhatsApp**
2. Select the **BYO Connector - Infobip** tab.

![The WhatsApp Technology Partners page.](https://www.braze.com/docs/assets/img/whatsapp/byo_connector/byo_tab_tech_parners.png?03b84433c032f5168d2c94d48c418ae9)

{: start="3"}
3. Enter the API key and base URL from [Step 1](#step-1).
4. Select **Connect**.
5. Proceed through the [Embedded Signup workflow](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/embedded_signup/#whatsapp-embedded-signup-workflow) with these considerations:
- You can't select the same business portfolio that is used by a different Business Solution Provider.
- You can't select a phone number that's used by another Business Solution Provider.
- You must create a new WABA, not select an existing one.

**Note:**


To receive the verification code, go to your Infobip dashboard > **Analyze** > **Logs**, and pull the code from the inbound SMS message.  



![Message logs showing an inbound SMS message with the verification code.](https://www.braze.com/docs/assets/img/whatsapp/byo_connector/verification_code.png?77584cfc5e1dd3bb3f8939bc1ccb7bc6)

After completing setup, your phone number is listed as a subscription group under your WhatsApp Business Group. The WhatsApp Business Group contains the Infobip account name and API base URL it’s connected to. Accounts connected through the native integration do not have an Infobip account name.

**Note:**


Connect each WhatsApp Business Account to a single Infobip account. Each time you connect an additional phone number or subscription group, if the WhatsApp Business Account is already connected to an Infobip account, you must re-enter the API credentials for the existing account.



## Step 3: Sending messages

Follow the native integration sending process, including:
- [Subscribing users to the subscription group](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/subscription_groups/)
- [Creating a WhatsApp message](https://www.braze.com/docs/user_guide/channels/whatsapp/create_a_whatsapp_message/)

## Troubleshooting setup

### Couldn’t retrieve WhatsApp Business Account ID

Confirm your WhatsApp Business Account isn’t connected to a different Braze workspace.

### Couldn’t share WhatsApp Business Account ID with Infobip

1. Confirm your WhatsApp Business Account isn’t connected to Braze or another partner.
2. Confirm no phone numbers in your WhatsApp Business Account are connected to a different Infobip account. For imported numbers, you can find the number in Infobip and select **Cancel number**.

![The "Cancel number" button for an Infobip number.](https://www.braze.com/docs/assets/img/whatsapp/byo_connector/cancel_number.png?3300b13097f6176ee840b0c6ca228c5d)

## Considerations 


While all existing functionality with Braze is supported, these use cases are currently not supported.

| Use case | Reason |
| --- | --- |
| Processing inbound messages in Braze and Infobip | This prevents logic trains that are triggered by either system, consequently generating duplicate and potentially contradictory message threads. |
| Sending messages from Braze and Infobip | For WhatsApp Business Accounts connected to Braze, all sending originates from Braze. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Considerations" }

