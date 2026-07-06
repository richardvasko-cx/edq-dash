# Set up IPs and domains

> This article guides you through the requirements and steps needed to set up your IP addresses and pools, as well as domains and subdomains needed before you can begin sending emails with Braze.

<iframe width="560" height="315" src="https://www.youtube.com/embed/" title="Video" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="media_embed "></iframe>



<br>

**Important:**


You can use SendGrid, SparkPost, or Amazon Simple Email Service (SES) as your email service provider (ESP) partner. Starting in 2026, Braze uses Amazon SES as the default ESP for new email setups. For more details, see [Amazon SES setup](https://www.braze.com/docs/user_guide/channels/email/email_setup/setting_up_ips_and_domains/amazon_ses).



## Method 1: Coordinate with Braze (recommended)

### Step 1: Outline information

Send the following information to your Braze representative:

* Your chosen domains and subdomains
* The approximate number of emails you'll be sending each month, which will help determine how many IPs you'll need
* How you prefer to map your sending domains to your allocated IP

### Step 2: Braze configures information

After receiving your email, we'll get to work configuring your IPs, domains and subdomains, and IP pools.

### Step 3: Add DNS records

After your IPs, domains, subdomains, and IP pools are configured, we'll send you a list of DNS records. Ask your engineers and developers to add these DNS records where needed, and after they have been added, let the Braze Onboarding team know.

The following table contains resources for creating and managing DNS records with commonly used domain providers. If you're using a different provider, refer to that provider's documentation or contact their support team for information.

| Domain provider | Resources |
| --- | --- |
| Bluehost | [DNS Records Explained](https://my.bluehost.com/hosting/help/508)<br> [DNS Management Add Edit or Delete DNS Entries](https://my.bluehost.com/hosting/help/559) |
| Dreamhost | [How do I add custom DNS records?](https://help.dreamhost.com/hc/en-us/articles/360035516812) |
| GoDaddy | [Add a CNAME record](https://www.godaddy.com/help/add-a-cname-record-19236?) |
| Cloudflare | [Manage DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/) |
| Squarespace | [Adding custom DNS settings](https://support.squarespace.com/hc/en-us/articles/360002101888-Adding-custom-DNS-records-to-your-Squarespace-managed-domain) |
| Amazon Route 53 | [Creating records by using the Amazon Route 53 console](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html) |
| Google Cloud DNS | [Quickstart: Set up DNS records for a domain name with Cloud DNS](https://docs.cloud.google.com/dns/docs/set-up-dns-records-domain-name) |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Table" }


After Braze provides your DNS records, add them as soon as your DNS or IT team is able. Domain verification is time-bound, and if records are added too late, verification may fail even if the DNS records later resolve correctly. If your DNS records appear correct but verification fails, contact the Braze Onboarding or Support team to reinitiate verification.

### Next steps

We'll check your setup and validate all information in our internal systems. The Braze Onboarding team will let you know when you're ready to go, or if there are issues with your DNS records that you must address with your engineering team.

## Method 2: Self-service email setup

This method will set up one sending domain, one tracking domain, and one IP in total for a company. If you're planning to set up more, please consult with Braze Onboarding team (method 1).



**Important:**


 is currently in early access. Contact your Braze account manager if you're interested in participating in the early access.




<br>If you're using the self-service email setup feature, be sure to also consult with the Braze Onboarding team.

### Prerequisites

To use self-service email setup, you must meet the following prerequisites:

1. You are a new customer in onboarding.
2. You have the "Manage Company Settings" company-level permission.

### Step 1: Begin setup

1. Go to **Settings** > **Admin Settings** under **Company Settings**. 
2. Next, select the **Sender Verification** tab. To view this tab, you must have the "Manage Company Settings" company-level permission.
3. Select **Start setup**.

### Step 2: Add and verify a sending domain

A sending domain is used in the "from" address when sending an email. Enter a sending domain and click **Submit**. 

Next, add the TXT and CNAME records from the bottom of the page to your DNS provider. Then, return to the Braze dashboard and click **Verify**.

![](https://www.braze.com/docs/assets/img_archive/email_setup_rdns_records.png?87b4e81a4f01e170ebc2f2931fa7c776)

If verification fails and you believe your DNS records are correct, contact Braze Support for assistance.

**Important:**


The sending domain must be a subordinate to a domain you own. For example, if you own "example.com", a subdomain could be "mail.example.com", which allows you to use the sending address "@mail.example.com".



### Step 3: Add and verify a tracking domain

A tracking domain is used to wrap links in your emails for click-tracking and branding purposes. This will be visible to users when they hover over or click your email links. We recommend matching this to your sending domain.

1. Enter a tracking domain and select **Submit**. 
2. Next, add the CNAME records from the bottom of the page to your DNS provider. 
3. Then, return to the Braze dashboard and select **Verify**.

### Step 4: Add an IP address

Braze generates an A record to associate your IP address with your sending subdomain in a setup called reverse DNS (rDNS). Add the A record in your DNS provider then click **Set up rDNS** to support deliverability.

Note that additional domains that have been added do not appear in the **Sender Verification** section. To add more domains, contact the Braze Support team.

### Next steps

After your sender verification is complete, we recommend IP warming so that your messages reach their destination inboxes at a consistently high rate. After completing this setup, be sure to also consult with the Braze Onboarding team to confirm if your domains and [IP address](https://www.braze.com/docs/user_guide/message_building_by_channel/email/email_setup/ip_warming/) are working.
