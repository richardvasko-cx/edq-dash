# IP warming

> IP warming is the practice of getting email inbox providers used to receiving messaging from your dedicated IP addresses. It's an extremely important part of email sending with any email service provider (ESP) and standard practice at Braze to confirm your messages reach their destination inboxes at a consistently high rate.

IP warming is designed to help you establish a positive reputation with internet service providers (ISPs). Every time a new IP address is used to send an email, ISPs programmatically monitor those emails to verify that it isn't being used to send spam to users. Think of your IP and domain reputation like a credit score—ISPs use this reputation to determine whether your mail lands in the inbox or the spam folder. Much like a credit score, it takes time to build a positive reputation and even longer to rebuild a poor one.

## Email delivery and deliverability

**Delivery** is the share of emails that were accepted and did not hard bounce. **Deliverability** is whether mail reaches the inbox rather than spam—mailbox providers don't expose that as a single metric.

A healthy delivery rate is often around 99% delivered with a bounce rate no higher than about 1%. Rates can look strong on paper and still hide problems (for example, many bounces from one domain, or mail delivered but filtered to spam). Watch opens and clicks, not only delivery. Even a small reported spam rate can warrant deeper review.

### Recommendations before IP warming

Before you start IP warming:

1. In **Settings** > **Email Preferences**, set your default sending domain, add a valid unsubscribe link in your [custom footer](https://www.braze.com/docs/user_guide/channels/email/customize/custom_email_footer/), turn on the [list-unsubscribe header](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/email_preferences/#list-unsubscribe), and consider custom unsubscribe/opt-in pages where needed.
2. Configure [frequency capping](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/) for email.
3. Create your required templates by going to **Content** > **Email**.

## What if I don't have time to warm IPs?

**IP warming is required.** If you don't warm IPs appropriately, and the pattern of your email causes any suspicion, your email delivery speed could be significantly throttled or slowed. Your domain or IP could also be blocked by the ISPs, which can result in your emails going directly to the spam folder of your user's inbox instead. As such, it's important to warm your IPs properly.

ISPs throttle email delivery when suspicion of spam arises so that they can protect their users. For example, if you send to 100,000 users, the ISP might deliver the email only to 5,000 of those users over the first hour. Then, the ISP monitors measures of engagement such as open rates, click rates, unsubscribes, and spam reports. So, if a significant number of spam reports occur, they might choose to relegate the remainder of that send to the spam folder rather than delivering it to the user's inbox. 

If engagement is moderate, they may continue to throttle your email to collect more engagement data to determine whether or not the email is spam with more certainty. If the email has very high engagement metrics, they may cease to throttle this email entirely. They use that data to create an email reputation that will eventually determine whether or not your emails are filtered to spam automatically.

If your domain or IP is blocked by an ISP, the message logs in the [Message Activity Log](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/) will contain information about what websites to visit to appeal to these ISPs and to get off those lists.

## IP warming schedules

We strongly recommend adhering strictly to an IP warming schedule to support deliverability. It's also important that you don't skip days, as consistent scaling improves delivery metrics. Choose a schedule based on your existing email sending history and deliverability metrics.

**Tip:**


If you're interested in having a dedicated deliverability resource as part of your account team, contact your Braze account manager for more information.






The conservative schedule is a slower, more cautious approach that helps establish a strong sending reputation from scratch. This is recommended if you're new to email sending, migrating from a shared IP, or have experienced deliverability issues such as throttling or blocklisting by an inbox provider.

Day | Number of emails to send
----|---------------------
1 | 50
2 | 50
3 | 50
4 | 100
5 | 100
6 | 100
7 | 500
8 | 500
9 | 500
10 | 1,000
11 | 1,000
12 | 1,000
13 | 2,000
14 | 2,000
15 | 2,000
16 | 4,000
17 | 4,000
18 | 4,000
19 | 8,000
20 | 8,000
21 | 8,000
22+ | Double every 3 days until desired volume




The moderate schedule is a balanced approach that ramps up sending volume at a steady pace. This is recommended for most senders, including those with some email sending history who are transitioning to a new IP.

Day | Number of emails to send
----|---------------------
1 | 50
2 | 100
3 | 500
4 | 1,000
5 | 2,000
6 | 4,000
7 | 8,000
8 | 16,000
9 | 25,000
10 | 35,000
11 | 50,000
12 | 75,000
13 | 100,000
14 | 150,000
15 | 200,000
16 | 275,000
17 | 375,000
18 | 500,000
19 | 650,000
20 | 825,000
21 | 1,000,000
22+ | Double every 2 days until desired volume




**Important:**


The aggressive schedule is the fastest approach and is only recommended for senders with an established, positive sending history and deliverability metrics that align with best practices, including high open rates, high click rates, and low bounce rates. Using this schedule without a proven track record can harm your sender reputation.



Day | Number of emails to send
----|---------------------
1 | 50
2 | 100
3 | 500
4 | 1,000
5 | 2,500
6 | 5,000
7 | 9,000
8 | 16,000
9 | 29,000
10 | 52,000
11 | 98,000
12 | 160,000
13 | 225,000
14 | 315,000
15 | 450,000
16 | 615,000
17 | 875,000
18 | 1,200,000
19 | 1,750,000
20 | 2,750,000
21+ | Double daily until desired volume




In most cases, warm up to your average daily send volume rather than your peak. ISPs primarily look at the previous few weeks of sending behavior to evaluate your reputation, so if you hit peak volume only every few months (for example, 7 million during a seasonal period), you can ramp up toward that peak closer to the send date. However, if you reach peak volume every one to two weeks, warm up to that peak from the start.

After IP warming is complete and you've reached your desired daily volume, you should aim to maintain that volume daily. Some fluctuation is expected, but reaching the desired volume, then only doing a mass blast once a week, may negatively affect your delivery metrics and sender reputation. 

**Important:**


Most ISPs only store reputation data for 30 days. If you go a month without sending any messages, you must repeat the IP warming process.



### IP addresses

After three months of non-use, Braze may recycle and reassign IP addresses. Regardless of an IP address's prior history, full IP warming is recommended for all newly assigned IPs, as most ISPs only store reputation data for 30 days. For most ISPs, this means a three-month cooldown effectively resets reputation. If you have further questions about the history of a specific IP address, contact [Braze Support](https://www.braze.com/docs/user_guide/administer/personal/braze_support).

## How to limit sends during warming

Our built-in user limiting feature serves as a useful tool to help you with warming your IP address. After choosing your desired messaging segments during campaign creation, on the [Target Users](https://www.braze.com/docs/user_guide/channels/email/html_editor/#step-4-build-the-remainder-of-your-campaign-or-canvas) step, select the **Advanced Options** dropdown to limit your users. As your warming schedule continues, you can gradually raise this limit to increase the volume of emails you send.

![](https://www.braze.com/docs/assets/img_archive/email_ip_warming_sends_limit_new.png?a8f7bd43b28a229f32194699aea4bb40)

## Subdomain segmentation

Many ISPs and email access providers no longer filter by IP address reputation. These filtering technologies now also account for domain-based reputation. This means that filters will look at all data associated with the sender's domain and not just single out the IP address. For this reason, in addition to warming up your email IP, we also recommend having separate domains or subdomains for marketing, transactional, and corporate mail. 

**Important:**


Subdomain segmentation is especially important for large-volume senders. These senders should work with a Braze representative when setting up their account to confirm they adhere to this practice.



We recommend segmenting your domains so that corporate mail is sent through your top-level domain, and marketing and transactional mail are sent through different domains or subdomains.

## Best practices

You can avoid all the consequences of not IP warming by following these best practices:

### Start with small sending volumes of email

Increase the amount you send each day as gradually as possible. Abrupt, high-volume email campaigns are regarded with the most skepticism by ISPs. Therefore, you should begin by sending small amounts of email and scale gradually toward the volume of email you ultimately intend to send. Keep in mind that you're warming your IP at each ISP individually—ISPs don't share reputation data with each other. When building out your warming volumes, make sure you aren't increasing volume too quickly at any single ISP. Regardless of volume, we suggest warming up your IP to be safe. See [IP warming schedules](#ip-warming-schedules).

### Have engaging introductory content

Confirm that your first content is highly engaging and maximizes the likelihood that users click, open, and engage with your email. Always prefer well-targeted emails to indiscriminate blasts when warming IPs.

### Set a consistent sending cadence

Once IP warming is complete, create a sending cadence, making sure to also spread your emails across a day or several days. By creating as much of a consistent schedule as possible, you can prevent an IP cooldown, which can occur if sending volume stops or significantly decreases for more than a few days. 

Refer to our [IP warming schedule](#ip-warming-schedules) to spread your send across a longer time frame, rather than sending a mass blast at a single specific time.

### Clean your email lists

Confirm that your email list is clean and doesn't have old or unverified emails. Ensuring that you're both [CASL- and CAN-SPAM-compliant](https://www.braze.com/docs/user_guide/administer/global/privacy/spam_regulations/) is ideal.

### Monitor your sender reputation

When conducting the IP warming process, be sure to carefully monitor your sender reputation while you conduct the IP warming process. These specific metrics are important to watch:
- **Bounce Rates:** If any campaign bounces at more than 3-5%, you should evaluate the cleanliness of your list by following the guidelines in our [Keep It Clean: The Importance of Email List Hygiene](https://www.braze.com/blog/email-list-hygiene/) article. Additionally, you should consider implementing a [sunset policy](https://www.braze.com/docs/user_guide/channels/email/best_practices/sunset_policies/) to stop emailing unengaged or dormant email addresses.
- **Spam Reports:** If any campaign is reported as spam at a rate of more than 0.08%, you should re-evaluate the content you're sending, check that it is targeted to an interested audience, and make sure your emails are appropriately worded to pique their interest.
- **Open Rates:** Open rates are a useful proxy for inbox placement. If your unique open rates are over 25%, you're likely experiencing high inbox placement, which indicates a positive sender reputation.

**Tip:**


Braze recommends against using [Intelligent Timing](https://www.braze.com/docs/user_guide/brazeai/intelligence_suite/intelligent_timing/) to warm your IPs. Because IP warming campaigns are some of the first campaigns you send, Braze won't have enough information on your users to calculate an optimal send time. In this case, all messages with Intelligent Timing would default to the fallback time and send at the same time anyway.



**Tip:**


It is normal for mail to be sent to the spam folder during IP warming because your domain and IP have not yet established a positive reputation. If mail lands in your spam folder, your mail administrator may need to add your Braze sending domain and IP to your company's allowlist.


