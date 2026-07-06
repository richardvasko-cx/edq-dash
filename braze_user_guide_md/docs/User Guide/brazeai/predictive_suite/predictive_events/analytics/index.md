# Predictive event analytics

> After your prediction has been built and trained, you will have access to the **Prediction Analytics** page. This page helps you decide what users you should target based on their likelihood score or category.

## About predictive event analytics

As soon as the prediction is done training and this page is populated, you can start using [filters](https://www.braze.com/docs/user_guide/brazeai/predictive_suite/predictive_churn/messaging_users#filters) in segments or campaigns to begin using the outputs of the model. If you want help deciding who to target and why, this page can help based on the historical accuracy of the model and your own business goals.

These are the components that make up predictive event analytics:

- [Likelihood Score](#purchase_score)
- [Prediction Quality](#prediction_quality)
- [Estimated Accuracy](#estimated_results)
- [Event Correlation Table](#correlation_table)

The distribution of the likelihood scores for the entire prediction audience is displayed at the top of the page. Users in buckets further to the right have higher scores and are more likely to perform the event. Users in buckets further to the left are less likely to perform the event. The slider beneath the chart will allow you to select a section of users and estimate what the results would be of targeting those users.

As you move the slider handles to different positions, the bar in the left half of the panel will inform you how many users out of the entire prediction audience would be targeted using the part of the population you've selected.

![](https://www.braze.com/docs/assets/img/purchasePrediction/purchaseTargeting.png?94bcc580da09aace2daddcb8b5244500){: style="max-width:90%"} 

## Likelihood score {#purchase_score}

Users in the prediction audience will be assigned a likelihood score between 0 and 100. The higher the score, the greater the likelihood of performing the event. 

The following is how a user is categorized depending on their likelihood score:

- **Low:** between 0 and 50
- **Medium:** between 50 and 75
- **High:** between 75 and 100

The scores and the corresponding categories will be updated according to the schedule you chose in the **Prediction Creation** page. The number of users with likelihood scores in each of the 20 equally sized buckets or in each of the likelihood categories, is displayed in the chart at the top of the page.

### Accessing user-level likelihood scores

To view the likelihood score for a single user, look up that user in the dashboard and go to **Engagement** > **Predictions** to see their score. To access scores and categories for many users at once, create a [segment](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/) using the [Event Likelihood Score](https://www.braze.com/docs/user_guide/audience/segments/segmentation_filters#event-likelihood-score) or [Event Likelihood Category](https://www.braze.com/docs/user_guide/audience/segments/segmentation_filters#event-likelihood-category) filters, then export the users from that segment. When exporting, you can include the likelihood scores in the export data.

**Note:**


While both predictive events and [predictive churn](https://www.braze.com/docs/user_guide/brazeai/predictive_suite/predictive_churn/) assign scores to users, there are important differences:<br><br>

- **Predictive events** (purchase predictions): Consider all users in the prediction audience, regardless of whether they've performed the target event before. For example, a purchase prediction can identify users likely to make their first purchase.
- **Predictive churn**: Only considers users who have already performed the custom event. Churn predictions identify users who have done something before and are likely to stop doing it. A user who has never logged in cannot be considered "churned" if they don't log in.

When exporting churn risk scores from a segment, these scores reflect the churn prediction model, which differs from purchase or other event prediction models.



## Estimated accuracy {#estimated_results}

In the right half of the panel beneath the chart, we show estimates of the expected accuracy of targeting the portion of the prediction audience you selected in two ways: how many selected users are expected to perform the event, and how many are expected not to.

![The selected audience and estimated accuracy shown in the Braze dashboard.](https://www.braze.com/docs/assets/img/purchasePrediction/purchaseEstimatedResults.png?3b7f2f721713732b8b4866464102fe39)

### Expected to perform

You can use the estimated accuracy to check how many selected users are expected to perform the event.

The prediction isn't perfectly accurate, and no prediction ever is, meaning Braze will not be able to identify every single future user to perform the event. The likelihood scores are like a set of informed and reliable predictions. The progress bar indicates how many of "true positives" expected in the prediction audience will be targeted with the audience selected. Note that we expect this number of users to perform the event even if you don't send them a message.

### Not expected to perform

You can use the estimated accuracy to check how many selected users are expected not to perform the event.

All machine learning models make errors. There may be users in your selection who have a high likelihood score but do not end up actually performing the event. They would not perform the event if you took no action. They will be targeted anyway, so this is an error or "false positive." The full width of this second progress bar represents the expected number of users who will not perform the event, and the filled portion is those who will be incorrectly targeted using the current slider position.

Using this information, we encourage you to decide how many of the true positives you want to capture, how many false positives you can accept being targeted, and what the cost of errors is for your business. If you are sending out a valuable promotion, you may want to target only non-purchasers (false positives) by favoring the left side of the chart. Or, you may want to encourage buyers who often purchase (true positives) to do so again by selecting a section of users that favors the right side of the chart.

## Prediction quality {#prediction_quality}

To measure the accuracy of your model, the _Prediction Quality_ metric will show you how effective this particular machine learning model appears to be when tested on historical data. Braze pulls data according to the groups you specified in the model creation page. The model is trained on one data set (the "training" set) and then tested on a new, separate data set (the "test" set).

The prediction will be trained again every two weeks and updated alongside the _Prediction Quality_ metric to keep your predictions updated on the most recent user behavior patterns. Additionally, each time this occurs, the last two weeks of predictions will be tested against actual user outcomes. The _Prediction Quality_ will then be calculated based on these real outcomes (rather than estimates). This is an automatic backtest (that is, testing a predictive model on historical data) to ensure the prediction is accurate in real-world scenarios. The last time this retraining and backtesting occurred will be displayed on the **Predictions** page and an individual prediction's analytics page. Even a preview prediction will perform this backtest once after its creation. This way, you can be sure of the accuracy of your customized prediction even with the free version of the feature.

**Prediction quality example**



For example, if 20% of your users usually churn on average, and you pick a random subset of 20% of your users and label them as churned at random (whether they truly are or not), you'd expect to correctly identify only 20% of the actual churners. That's random guessing. If the model were to only do that well, the lift would be 1 for this case.

If the model, on the other hand, allowed you to message 20% of the users and, in doing so capture all the "true" churners and no one else, the lift would be 100% / 20% = 5. If you chart this ratio for every proportion of the likeliest churners you could message, you get the [Lift Curve](https://en.wikipedia.org/wiki/Lift_(data_mining)). 

Another way to think of lift quality (and also _Prediction Quality_) is how far along the way between random guessing (0%) and perfection (100%) the prediction's lift curve is at identifying churners on the test set. For the original paper on lift quality, see [Measuring lift quality in database marketing](https://dl.acm.org/doi/10.1145/380995.381018).




### How it's measured

Our measure of _Prediction Quality_ is [lift quality](https://dl.acm.org/doi/10.1145/380995.381018). Generally, "lift" refers to the increased ratio or percentage of a successful outcome, such as a conversion. In this case, the successful outcome is correctly identifying a user who would have churned. Lift quality is the average lift the prediction provides across all possible audience sizes for messaging the test set. This approach measures how much better than random guessing the model is. With this measure, 0% means the model is no better than randomly guessing about who will churn, and 100% indicates perfect knowledge of who will churn.

### Recommended ranges

Here's what we recommend for various ranges of _Prediction Quality_:

| Prediction Quality Range (%) | Recommendation |
| ---------------------- | -------------- |
| 60 - 100 | Excellent. Top tier accuracy. Changing the audience definitions is unlikely to provide additional benefit. |
| 40 - 60 | Good. This model will produce accurate predictions, but trying different audience settings may achieve even better results. |
| 20 - 40| Fair. This model can provide accuracy and value, but consider trying different audience definitions to see if they increase performance. |
| 0 - 20 | Poor. We recommend you change your audience definitions and try again. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Recommended ranges" }


## Event correlation table {#correlation_table}

This analysis displays user attributes or behaviors that are correlated with events in the prediction audience. The attributes assessed are Age, Country, Gender, and Language. Behaviors that are analyzed include sessions, purchases, total dollars spent, custom events, and campaigns and Canvas steps received in the last 30 days.

The tables are split into left and right for more and less likely to perform the event, respectively. For each row, the ratio by which the users with the behavior or attribute in the left column are more or less likely to perform the event is displayed in the right column. This number is the ratio of likelihood scores of users with this behavior or attribute divided by the likelihood to perform the event off the entire prediction audience.

This table is updated only when the prediction retrains and not when user likelihood scores are updated.

**Note:**


Correlation data for preview predictions will be partially hidden. A purchase is required to reveal this information. Contact your account manager for more information.



## Troubleshooting

### Unable to create a prediction

If you're unable to create a prediction for a custom event, this may be due to insufficient sample size. Braze estimates the number of users who have performed the event, and if enough users haven't performed the event, the sample may not provide sufficient data to train the model. In this case, the system may extrapolate to no users, preventing prediction creation.

To create a successful prediction, make sure that a sufficient number of users in your prediction audience have performed your target custom event. The exact threshold varies, but events with very low usage across your user base may not provide enough data for reliable model training.