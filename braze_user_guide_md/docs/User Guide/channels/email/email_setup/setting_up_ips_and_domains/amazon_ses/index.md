# Amazon SES setup

> Braze uses Amazon Simple Email Service (SES) as the default email service provider during new email setup. If your required setup doesn't align with the features of Amazon SES, contact the Braze Support for the option to complete the setup in SparkPost or SendGrid.

## Prerequisites

Before you begin Amazon SES setup, confirm you have the following:

- Sending domain names
- IP pool names (such as marketing, transactional, staging)
- The number of IP addresses for each IP pool
- Preferred append for click tracking domains (such as "clicks" or "click", "links" or "link")

## Setup example

A typical Amazon SES setup looks like the following:

- **Sub-account name:** braze
- **Cluster:** eu-02

| IP pool | Number of IPs | Configuration set | Sending domain | Click tracking domain |
| --- | --- | --- | --- | --- |
| `eu02_braze_marketing` | 1 IP | `eu02_braze_marketing_set1` | `demo.braze.com` | `clicks.demo.braze.com` | 
| `eu02_braze_transactional` | 1 IP | `eu02_braze_transactional_set1` | `dev.braze.com` | `clicks.dev.braze.com` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 .reset-td-br-5 aria-label="Setup example" }

**Note:**


The cluster and sub-account name are automatically appended to the IP pools and configuration sets.



## Click tracking domain configuration examples

The following tables are examples of possible click tracking domain configurations based on your preference for branding.

### One click tracking domain for each sending domain

| Marketing IP pool | Configuration set | Sending subdomains | Click tracking domains |
| --- | --- | --- | --- |
| braze_marketing - 1 IP | braze_marketing_set1 | `email1.example.com` | `clicks.email1.example.com` |
| braze_marketing - 1 IP | braze_marketing_set2 | `email2.example.com` | `clicks.email2.example.com` |
| braze_marketing - 1 IP | braze_marketing_set3 | `email3.example.com` | `clicks.email3.example.com` |
| braze_marketing - 1 IP | braze_marketing_set4 | `email4.example.com` | `clicks.email4.example.com` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="One click tracking domain for each sending domain" }

### One click tracking domain for all sending domains

This is based on the rule that the click tracking domain needs to match at least one sending domain from the configuration set.

| Marketing IP pool | Configuration set | Sending subdomains | Click tracking domains |
| --- | --- | --- | --- |
| braze_marketing - 1 IP | braze_marketing_set | `email1.example.com` | `clicks.email1.example.com` |
| braze_marketing - 1 IP | braze_marketing_set | `email2.example.com` | `clicks.email1.example.com` |
| braze_marketing - 1 IP | braze_marketing_set | `email3.example.com` | `clicks.email1.example.com` |
| braze_marketing - 1 IP | braze_marketing_set | `email4.example.com` | `clicks.email1.example.com` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 .reset-td-br-4 aria-label="One click tracking domain for all sending domains" }

## Considerations

- IP pools on Amazon SES only hosts the IP address itself while the configuration sets host the sending domains and click tracking domain.
- Each configuration set can have only one IP pool assigned to it at a time but we can create multiple configuration sets that can use the same IP pool but with different sending domains.
- Amazon SES handles rDNS and A records internally as they have close relationships with inbox providers in order to help recognize IP addresses.
- Each sending domain has a MAIL FROM identifier attached to it to help with SPF validations. 
    - The value for each sending domain is “e”. 
    - The MAIL FROM value does not change the From address your customers see.
- Trap message period start and trap message period end are unavailable if you're using Amazon SES as your email service provider.

## Next steps

- [Set up SSL](https://www.braze.com/docs/user_guide/channels/email/email_setup/ssl)