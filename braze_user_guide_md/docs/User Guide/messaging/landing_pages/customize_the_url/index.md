# Customize landing page URLs

> Learn how to customize your landing page URLs with your company's brand by connecting your domain to your Braze workspace.

## How it works

When you [connect your domain to Braze](#connect-your-domain-to-braze), it will be used as the default domain for all landing pages. For example, if you connect the subdomain `forms.example.com`, your landing page URLs would now be `forms.example.com/holiday-sale`.

The number of custom domains you can connect to your Braze account depends on your [plan tier](https://www.braze.com/docs/user_guide/messaging/landing_pages/#plan-tiers). To increase your limit, contact your Braze account manager.

## Connect your domain to Braze

To connect a domain to your Braze account, have an administrator follow the steps below.

1. Go to **Settings** > **Landing Page Settings**.
2. Enter the domain you want to connect to and select **Submit**. For example, `forms.example.com`.
3. Copy and paste the **TXT** and **CNAME** records into the DNS settings of your domain provider.
4. Return to the Braze dashboard to verify the connection.

![Landing Page Settings page with one TXT and two CNAME records listed with their respective names and values.](https://www.braze.com/docs/assets/img/landing_pages/connect_subdomain.png?90e6041a48809dd48a070dff6d237092)

**Note:**


Depending on your domain provider, the connection can take up to 48 hours. When the process is complete, we’ll start using your custom domain for your landing pages in the Braze dashboard.



### SSL certificate setup

Braze uses Cloudflare to automatically provision SSL certificates for your custom domain through an [ACME DNS-01 challenge](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge). This continuous validation method is enabled by one of the CNAME records you provided during setup, and allows the certificate authority (LetsEncrypt) to verify your domain ownership through DNS records without requiring Braze to own your domain.

## Remove your domain

If you're a Braze administrator, you can remove a previously-configured domain by completing the following steps:

1. Go to **Settings** > **Landing Page Settings**.
2. Select **Remove Custom Domain**
3. Confirm removal of the domain.
4. Remove the listed DNS records from your domain settings.

**Important:**


When you remove a custom domain, that URL will no longer be valid. Any landing pages that were using this domain will automatically revert to the default domain set by Braze.



## Migrate your domain

To migrate a custom domain to another workspace:

1. Remove the custom domain.
2. Create a new custom domain in the desired workspace.
3. Reconfigure the custom domain with the new DNS records. Note that your subdomain will be unavailable during this process.

## DNS resources

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


## Troubleshooting 

### My domain connection failed

Verify that your domain was entered correctly and that it matches what you submitted to Braze from your domain provider account. If it's correct and matches, check the TXT and CNAME records provided by Braze. They should match the records you entered into your domain provider account.

## Frequently asked questions

### Can I use nested subdomains for my custom domain?

Yes, you can use nested subdomains for your landing pages. For example, `forms.braze.com`, `pages.forms.braze.com`, or deeper levels are all supported. The only requirement is that you cannot use an apex domain (such as `braze.com`) because Braze uses CNAME records for the connection.

### Can I connect multiple subdomains to my workspace, or connect one subdomain to multiple workspaces?

No, you currently can only connect one subdomain to a workspace.

### Can I use the same subdomain that I currently use for my main website or my sending domain?

No, you can't use subdomains that are already in use. While these subdomains are valid, they can't be used for landing pages if they are already assigned to other purposes or have DNS records that conflict with the required CNAME records.

### Why is my custom domain stuck on "Connecting" despite valid DNS records?

If your custom domain shows all DNS records as "Connected" but the domain status remains on "Connecting" for more than four hours, your organization may be using CAA (Certificate Authority Authorization) records or Cloudflare zone holds that prevent Braze from securing your page.

#### CAA records

CAA records restrict which certificate authorities can issue SSL certificates for your domain. If your CAA records don't include LetsEncrypt, Braze (through Cloudflare) can't issue the required SSL certificate.

To resolve this, ask your IT team to add a CAA record to your subdomain with the following values:
- **Record type:** CAA
- **Value:** `0 issue "letsencrypt.org"`

For more information, refer to [LetsEncrypt's CAA documentation](https://letsencrypt.org/docs/caa/).

#### Cloudflare zone holds

If your organization uses Cloudflare, a zone hold security feature may be preventing Braze from creating your custom domain.

To resolve this, ask your IT team to temporarily release the zone hold. For more information, refer to [Cloudflare's zone hold documentation](https://developers.cloudflare.com/fundamentals/account/account-security/zone-holds/#release-zone-holds).

#### Restarting the validation process

After resolving either issue, delete and recreate your custom domain in the Braze dashboard to restart the validation process.

### Can I use a reverse proxy to serve landing pages under my main domain or a subdirectory?

No, landing page URL Liquid tags will not work correctly with reverse proxies.
