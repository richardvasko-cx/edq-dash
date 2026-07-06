# Self-serve custom domains

> This page covers how to set up your own custom domains in the Braze dashboard. Custom domains allow you to use a branded shortened link that reflects your brand’s identity instead of a generic shortened link or the Braze domain (`brz.ai`)—improving user trust and campaign engagement with SMS links.

Self-serve custom domains empower you to configure and manage your own custom domains for SMS, RCS, and WhatsApp—directly from your Braze dashboard. You can easily add, monitor, and manage up to 10 custom domains in one place.

## Benefits of self-serve custom domains

- **Streamlined setup:** Configure your domains on the **Company Settings** page, reducing set up time.
- **Enhanced transparency:** Receive real-time updates on your domain’s setup status through banners in the dashboard.
- **Proactive notifications:** Get immediate alerts when your custom domain is connected or if any configuration errors occur.

## Domain requirements

- Domains must be procured, owned, and managed by you. This can be done through a domain registrar, such as GoDaddy, Amazon Route 53, or Google Domains.
- The domain used for this feature must be:
  - Unique (different from your website domain)
  - Can't be used to host any web content
    - You can also use unique subdomains. For example, the domain `braze.com` could have subdomains of `sms.braze.com` or `whatsapp.braze.com`.

## Delegating your custom domain

We require you to delegate your custom domain to Braze so that we can facilitate proper routing and infrastructure compatibility with our link shortening and click tracking services. When you delegate your domain to Braze, we automatically handle the certificate renewal to prevent a lapse in service.

## Adding a custom domain

1. In Braze, go to **Company Settings** > **SMS/RCS and Messaging Apps Domains**.
!["SMS/RCS and Messaging Apps Domains" page with several domains listed.](https://www.braze.com/docs/assets/img/main_page.png?633343c437c73b174a84d8f95ba802cf)

{: start="2"}
2. Select **Add Domain** to begin a new custom domain setup.
3. Enter the custom domain you've purchased into our in-app input, which uses our existing validation logic for proper formatting, then select **Next** and **Submit**.

!["Add Domain" button on the "SMS/RCS and Messaging Apps Domains" page.](https://www.braze.com/docs/assets/img/custom_domain_button.png?f42c35c4b94c3cb2af69f16b72de0e6a){: style="max-width:70%;"}

{: start="4"}
4. Have your technical team (such as engineering or IT) update your DNS configuration with the Cloudflare DNS record details that display. Your technical team must update your DNS records with these details within 45 days.
  - If you need additional time to update your DNS records, you can restart the process and generate a new set of DNS records for your domain.

Braze will poll your DNS configuration roughly every 30 minutes to check for updates.

!["DNS record" section with 3 steps to complete to finish setting up your domain.](https://www.braze.com/docs/assets/img/dns_record.png?59f7e4282cec284d0b29951a054735b9)

**Note:**


Your domain progress is saved automatically. If you need to exit mid-flow, you can resume later by selecting the pending domain entry on the **SMS/RCS and Messaging Apps Domains** page.



### Ongoing management and usage

After your domain is verified, your custom domains will appear in the table on the **SMS/RCS and Messaging Apps Domains** page with status indicators. You can immediately use connected domains across multiple subscription groups, workspaces, and across SMS, RCS, and WhatsApp channels.

![List of custom domains and statuses.](https://www.braze.com/docs/assets/img/custom_domain_statuses.png?d8b2e50e2c5af7aa7c0533d46112a0c8){: style="max-width:60%;"}

Live monitoring will alert you in the Braze dashboard if any of your active domains have an issue, so that your custom links remain usable. If you encounter any issues, refer to the in-app error details or contact Braze [Support](https://www.braze.com/docs/braze_support/) for assistance.

## Assigning custom domains to subscription groups

After they're configured, custom domains can be assigned to one or multiple SMS, RCS, and WhatsApp subscription groups.

1. Go to **Audience** > **Subscription Group Management**.
2. Find and select your subscription group in the list.
3. Under **Subscription Group Details**, select your custom domain as the **Link Shortening Domain**.

![Subscription groups settings that allow you to select a link-shortening domain.](https://www.braze.com/docs/assets/img/custom_domain.png?0243cdff6927ed5e2bc90ab78991c586)

Campaigns sent with link shortening turned on will use the assigned domain associated with your SMS, RCS, or WhatsApp subscription group.

![SMS message composer preview with a shortened link domain that is different from the domain in the "Message" box.](https://www.braze.com/docs/assets/img/custom_domain2.png?e278f104360b65e166cbc3dd8fc98a82)

## Frequently asked questions

### Can delegated domains be shared across multiple subscription groups?

Yes. A single domain can be used with multiple subscription groups. To do so, select the domain for each subscription group that it should be associated with.

### Can delegated domains be shared across multiple workspaces?

Yes. Domains can be associated with subscription groups in multiple workspaces, assuming the workspaces are contained within the same company.

### How many custom domains can I add?

You can add up to 10 custom domains per dashboard.

### What happens if I don’t update my DNS records within 45 days?

Though your Cloudflare DNS record details will expire after 45 days, you can restart the setup process with the same domain and Braze will generate a set of new DNS records to extend your setup window.

### Will I be notified if there is an error during the DNS update process?

Yes. If there’s an error, you’ll receive a banner in the Braze dashboard detailing the issue along with steps to resolve it. 

### Can I use a custom domain across multiple channels?

Yes. After a custom domain is verified, it can be used in all SMS, RCS, and WhatsApp subscription groups across all workspaces within a dashboard. 

### What if I have questions or need further support?

For more detailed guidance on setting up and managing custom domains, including troubleshooting steps and technical requirements, [contact Support](https://www.braze.com/docs/braze_support/).
