# Understanding and preventing SMS, MMS, and RCS traffic pumping fraud

> SMS, MMS, and RCS traffic pumping fraud can inflate your messaging costs quickly. This page explains how the scheme works, why Braze marks certain countries as High Fraud Risk, and the steps you can take to reduce your exposure.



SMS, MMS, and RCS traffic pumping—also known as Artificially Inflated Traffic (AIT)—is a fraud scheme where malicious actors exploit unsecured, public-facing web forms, authentication flows, or API endpoints to trigger massive volumes of SMS, MMS, and RCS messages (such as one-time passwords, opt-in confirmations, or notifications).


This introduces severe risks to your company, including significant financial exposure.



How the fraud cycle works:

#### Step 1: Target identification

Attackers locate an unprotected application flow (like a phone number input field, account creation form, or login page) that automatically triggers an outbound text message.

#### Step 2: Automated exploitation

Using automated bots or scripts, fraudsters rapidly feed thousands of phone numbers into these unsecured fields.

#### Step 3: Carrier exploitation

These phone numbers belong to specific ranges assigned to complicit or exploited local Mobile Network Operators (MNOs) or premium-rate international carriers.

#### Step 4: The revenue share payout

As the platform automatically fires off text requests to these numbers, the carrier charges your company the standard transmission fees. The fraudsters then receive a pre-arranged revenue-share payout from the carrier for generating that traffic, leaving your company to foot an inflated telecom bill.


### What are High Fraud Risk countries, and why do they exist?

"High Fraud Risk" countries are specific regions globally that experience a disproportionately high incidence of traffic pumping fraud. These regions generally correlate with countries where:

- The cost of SMS, MMS, and RCS message termination fees is significantly higher than global averages, maximizing the payout profit margins for fraudsters.
- Regulatory frameworks or local carrier standards lack rigorous monitoring, allowing rogue or compromised telecommunication providers to offer revenue-sharing models on inflated inbound traffic.

Because a single unmonitored attack targeting these regions can cause substantial financial exposure within a matter of minutes, identifying and selectively managing these high-risk regions is a foundational element of a company's security posture.




### What immediate foundational steps should my company take to prevent this fraud?

The most critical step your company can take within your customer engagement platform is to minimize your attack surface using geographic limitations.

#### Utilize the Braze Geographic Permissions allowlist

You should proactively audit the regions where your actual target customers reside and configure an allowlist to explicitly permit messaging only to those countries. For setup steps, see [Geographic permissions](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_setup/subscription_groups/geographic_permissions/).

##### Block high-risk destinations

If you only do business in North America or Western Europe, there's no reason to leave the doors open to high-cost international countries in other regions. As a rule of thumb, proactively disable any country where you don't actively market or have operations to eliminate unnecessary exposure.





### What else does Braze do to protect your company against fraud?

In addition to guidance and support from your account team and [Geographic permissions](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_setup/subscription_groups/geographic_permissions/), Braze maintains internal monitoring for unusual patterns and will proactively engage with customers when we identify anomalous activity on their account.


