# Variant distribution

> When you set up an A/B or multivariate test, each send independently assigns users to variants based on the percentages you configure. Because assignment is randomized, the actual distribution may not match your percentages exactly—especially with smaller sample sizes.

## How it works

The distribution between variants is not always even. Every time a message sends in a multivariate campaign, Braze independently selects a random option according to the percentages you set and assigns a variant based on the result. It's like flipping a coin—anomalies are possible. If you flip a coin 100 times, you probably won't get an exact 50-50 split between heads and tails, even though you only have two choices. You might get 52 heads and 48 tails.

Similarly, if you want to split multiple variants evenly using whole-number percentages, ensure the number of variants evenly divides 100. Otherwise, some variants have a higher percentage of users distributed to that variant compared to others. For example, if your campaign has seven variants, there can't be an even variant distribution because seven does not equally divide by 100 as a whole number. In this case, you would have two variants of 15% and five variants of 14%. 

**Tip:**


To distribute users in a Canvas, you could add a [Decision Split step](https://www.braze.com/docs/decision_split/) and separate users based on their [random bucket numbers](https://www.braze.com/docs/user_guide/messaging/ab_testing/concepts/random_bucket_numbers/).



## In-app message distribution

When running an A/B test on in-app messages, your analytics may appear to show a higher variant distribution between one variant and another, even if they have an even percentage split. For example, consider the following graph of *Unique Recipients* for Variant A and Variant C.

![Unique Recipients graph showing Variant A with a consistently higher count than Variant C, despite an even percentage split.](https://www.braze.com/docs/assets/img/variant_distribution_iam.png?d3c0cd896d4d16242c30693c5c382986)

Variant A has a consistently higher count of *Unique Recipients* than Variant C. This isn't due to variant distribution, but rather how *Unique Recipients* are calculated for in-app messages. For in-app messages, *Unique Recipients* are actually *Unique Impressions*, which is the total number of people who received and viewed the in-app message. This means if a user doesn't receive the message for whatever reason or decides not to view it, they are not included in the *Unique Recipients* count, and the variant distribution can appear skewed.
