## Requirements

Before you start sending emails, there are some things you need. Refer to the following chart to learn more about these requirements.

| Requirement | Description | Source |
|---|---|---|
| A Dedicated IP (Internet Protocol)| A dedicated IP is a unique internet address provided exclusively to a single hosting account. | Braze gives you dedicated IPs to ensure control of your email sender reputation. Braze onboarding will set this up for you.|
| Whitelabeled Domains | These consist of a domain and a subdomain. By using whitelabeling, you can pass email authentication checks for DKIM and SPF. | The Braze Onboarding team will generate these domains for you, but you must choose their names. |
| Subdomains | This is a subdivision of a domain (such as "@news.company.com") within your email address. Having a subdomain will prevent any errors that could damage your company's official email reputation. | The Onboarding team will generate this for you, but you must decide the name of the subdomain. You cannot use subdomains that are currently being used outside of Braze. |
| IP Pools | These are an optional configuration used to separate out the reputation of different types of email (such as "promotional" and "transactional") to prevent the reputation of one from impacting the other and support higher deliverability. | The Onboarding team will set up the pools for you. Then, when composing your email, you can view your email's IP pool in the **Target Audiences** step.|
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Requirements" }

## IP warming

**Important:**


IP warming is the **most important step** in the email setup process. Though it is not your first step (it's actually the last), we're calling it out here to let you know that you must warm up your IP address, or else any emails you send will be sent to spam or be subject to other send barriers.



[IP warming](https://www.braze.com/docs/user_guide/channels/email/email_setup/ip_warming/) is when you send a relatively small number of emails out in your first batch, then over time, slightly increase the volume in the following batches until you reach your typical daily volume. This is done at the very end of your email setup process.

By starting with smaller volumes of email, you are establishing a level of trust with your email provider, showing you are only sending emails to relevant users. Sending your first batch of emails to your most engaged users can help you gain trust faster with your provider.

After you're done warming up your IP, you can [start creating and sending emails](https://www.braze.com/docs/user_guide/channels/email/html_editor/)!

## Legally required transactional emails









































<br><br>
