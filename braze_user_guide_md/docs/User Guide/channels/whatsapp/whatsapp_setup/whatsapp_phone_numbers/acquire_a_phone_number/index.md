# Acquire a WhatsApp phone number

> To use the WhatsApp messaging channel, you'll need a phone number that meets WhatsApp’s requirements for its [Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers) or [On-Premises API](https://developers.facebook.com/docs/whatsapp/on-premises/phone-numbers).

You must acquire your phone number yourself, as Braze won't provision the number for you. You can either purchase a physical phone with a SIM card through your business phone provider or use one of our partners: Twilio or Infobip. **You must have your own Twilio or Infobip account because this cannot be done through Braze.**

## WhatsApp API requirements

Your phone number must meet these WhatsApp API requirements:

- Owned by your business 
- Have a country and area code (such as a landline and cell numbers)
- Able to receive voice calls or SMS
- Accessible during account setup (to receive verification codes)
- Not a short code
- Not previously used with the WhatsApp Business Platform
- Not connected to a personal WhatsApp account

## Acquiring a Twilio phone number

### Step 1: Buy a phone number from the Twilio console or API

1. From the Twilio console, go to **Develop** > **Phone Numbers** > **Manage** > **Buy a number**. If you don’t see this option, select **Explore Products**, scroll to **Super Networks**, then select **Phone Number** > **Buy a number**. <br><br>![Twilio console with the "Develop" tab opened and "Buy a number" option.](https://www.braze.com/docs/assets/img/whatsapp/develop_buy_number.png?ea3d63be7ab8455c033f6d745563d0b5){: style="max-width:20%;"}<br><br>

2. Enter your desired area code or locality (if you have one). Find a number, then select **Buy**. <br><br> ![A button to buy the listed phone number.](https://www.braze.com/docs/assets/img/whatsapp/buy.png?e8a4d970a2a048257ec787b071fcdc11)<br><br>

3. After purchasing your phone number, go to **Active Numbers** and select the phone number you just purchased. <br><br>!["Active Numbers" showing the purchased phone number.](https://www.braze.com/docs/assets/img/whatsapp/active_numbers.png?5136d6b9628ca2f6105fb0d6a1465916){: style="max-width:70%;"}<br><br>

### Step 2: Configure your phone number

Follow Twilio’s instructions to set up your Twilio phone number to receive the verification code through email using **only** [Twilio Voice](https://www.twilio.com/docs/whatsapp/self-sign-up#add-your-whatsapp-phone-number). **Do not follow the instructions in other steps.**

**Warning:**


Only follow Twilio’s instructions to receive a verification code.
If you follow the next steps, you connect your phone number to Twilio, which means you can’t connect that number to Braze unless you do a migration or purchase a different number.



1. In the Twilio console, go to the [Active Numbers page](https://www.twilio.com/console/phone-numbers/incoming) and select the phone number you purchased.
2. Go to the **Voice Configuration** section and in the **Configure with** dropdown, select **Webhook, TwiML Bin, Function, Studio Flow, Proxy Service**.
3. In the **A call comes in** row, select **Webhook** and set the URL to `https://twimlets.com/voicemail?Email=YOUR_EMAIL_ADDRESS`, replacing `YOUR_EMAIL_ADDRESS` with your email address.
4. In the Twilio console, go to **2. Link WhatsApp Business Account with your number** > **2. Copy the phone number you register**, and select **Copy** next to the phone number.
5. In the **Self Sign-up** window, on the **Add your WhatsApp phone number** page, select **Add a new phone number** and paste the phone number.
6. Select **Phone call** as the verification method, then select **Next**.
7. You receive the verification code in your email within 10 minutes.

### Step 3: Complete the embedded sign up workflow

1. After Twilio is configured, go to your Braze dashboard > **Technology Partners** > **WhatsApp** and select **Begin integration** or **Add WhatsApp Business Account**, whichever shows up, to trigger the [embedded sign up workflow](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/embedded_signup/).<br><br>In the **Add a phone number for WhatsApp** step, select **Phone call** for how you'd like to verify your phone number. <br><br>![Section with the options to verify your phone number through text message or a phone call.](https://www.braze.com/docs/assets/img/whatsapp/verify.png?4c276b909aff4d74751b7f44a5b0dab4){: style="max-width:50%;"}<br><br>

2. Wait a few minutes for the verification code to send to your email inbox, then enter the verification code and complete your setup.

## Acquiring an Infobip phone number 

1. In the Infobip console, go to **Channels and Numbers** and select **Numbers**.<br><br>![Infobip "Channels and Numbers" section with "Numbers" listed beneath.](https://www.braze.com/docs/assets/img/whatsapp/infoblip_numbers.png?554df45ab436145e542f7e833aaf8556){: style="max-width:30%;"}<br><br>

2. Select **Buy Number** > the country where you want to send messages > **SMS**.<br><br>![Button to buy a number.](https://www.braze.com/docs/assets/img/whatsapp/infoblip_buy.png?14a29317508eb00102581d06d7434730)<br><br>

3. Depending on your selected country, you might need to complete an additional registration process (such as selecting a 10 DLC or toll-free option for US phone numbers). Be sure to select the available option.<br><br>![A page asking for you to select the number type: either 10 DLC or toll-free.](https://www.braze.com/docs/assets/img/whatsapp/infoblip_10dlc.png?58531776fd6891761df2cc275852ae3a){: style="max-width:70%;"}<br><br>

4. Select the available offer, then proceed through the rest of the steps and wait for your request to be processed. You can check the status by going to **Numbers** > **My Request**. <br><br>![An offer with information including fees and coverage.](https://www.braze.com/docs/assets/img/whatsapp/infoblip_offer.png?88acb391e1cd46ad37ce10e8fd30c1e2){: style="max-width:70%;"}<br><br>

5. Depending on your selected country, wait for the Infobip team to contact you for registration details (such as for 10DLC in the US).<br><br>

6. When your phone number is ready in Infobip, go to your Braze dashboard > **Technology Partners** > **WhatsApp** and select **Begin integration** or **Add WhatsApp Business Account**, whichever shows up, to trigger the [embedded sign up workflow](https://www.braze.com/docs/user_guide/channels/whatsapp/whatsapp_setup/embedded_signup/).<br><br> In the **Add a phone number for WhatsApp** step, select **Text message** for how you'd like to verify your phone number.<br><br>![Section with the options to verify your phone number through text message or a phone call.](https://www.braze.com/docs/assets/img/whatsapp/infoblip_verify.png?f24bcf9ab774c6707ecb5a8c87d35db4)<br><br>

7. Check Infobip’s [analyze logs](https://www.infobip.com/docs/analyze/analyze-logs) in their customer portal for the verification code, which could take a few minutes to appear, then enter the verification code and complete setup.




