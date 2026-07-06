# [![Braze Learning course](https://www.braze.com/docs/assets/img/bl_icon3.png?5f6465f63e399dec15d7020b6f4d2452)](https://learning.braze.com/email-onboarding-for-pro-and-enterprise-achieving-high-deliverability){: style="float:right;width:120px;border:0;" class="noimgborder"}Deliverability pitfalls and spam traps

> This article covers common email deliverability pitfalls, spam traps, and how to avoid them.

Your email deliverability can be affected by any of the following spam traps:

| Trap Type | Description |
|---|---|
| Pristine Traps | Email addresses and domains that have never been used. |
| Recycled Traps | Email addresses that were originally real users, but are now dormant. |
| Typo Traps | Email addresses containing common typos. |
| Spam Complaints | When your email is marked as spam by a customer. |
| High Bounce Rate | When your email consistently fails to deliver because the recipient's address is invalid. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="![Braze Learning course](https://learning.braze.com/email-onboarding-for-pro-and-enterprise-achieving-high-deliverability): style="float:right;width:120px;border:0;" class="noimgborder"Deliverability pitfalls and spam traps" }

## How to avoid spam traps

These traps can be avoided if you set up a confirmed opt-in process. By sending an initial opt-in email and asking customers to verify that they want your messages, you're ensuring your recipients want to hear from you, and that you're sending to real, valid addresses. Here are additional ways to avoid spam traps:

1. Send a double opt-in email. This is an email that will require users to confirm their subscription choices by clicking a link.
2. As a best practice, implement a [sunset policy](https://www.braze.com/docs/user_guide/channels/email/best_practices/sunset_policies/).
3. **Never purchase email lists.** 

**Tip:**


The Braze Customer Success and Deliverability teams can help make sure you're following best practices to maximize deliverability across the globe.



## Remove an email address from your bounce or spam list

You can remove bounced emails and emails on your Braze spam list with the following endpoints:
- [`/email/bounce/remove`](https://www.braze.com/docs/api/endpoints/email/post_remove_hard_bounces)
- [`/email/spam/remove`](https://www.braze.com/docs/api/endpoints/email/post_remove_spam)

## Improve email deliverability

For best practices to improve your email deliverability, see [Improve email deliverability](https://www.braze.com/docs/user_guide/channels/email/best_practices/improve_deliverability/).