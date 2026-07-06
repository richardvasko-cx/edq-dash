# Predictive churn analytics

> After your prediction has been built and trained, you will have access to the **Prediction Analytics** page. This page helps you decide what users you should target based on their _Churn Risk Score_ or category. 

## About predictive churn analytics

As soon as the prediction is done training and this page is populated, you can jump to simply using [filters](https://www.braze.com/docs/user_guide/brazeai/predictive_suite/predictive_churn/messaging_users#filters) in segments or campaigns to begin using the outputs of the model. But, if you want help deciding who to target and why, this page can help based on the historical accuracy of the model and your own business goals. 

These are the components that make up predictive churn analytics:

- [Churn Score and Category](#churn_score)
- [Prediction Quality](#prediction_quality)
- [Estimated Accuracy](#estimated_results)
- [Churn Correlation Table](#correlation_table)

The distribution of the scores for the entire prediction audience is displayed at the top of the page in a chart that you can view, by category or by score. Users in bins further to the right have higher scores and are more likely to churn. Users in bins further to the left are less likely to churn. The slider beneath the chart will allow you to select a swath of users and estimate what the results would be of targeting users in the selected range of _Churn Risk Score_ or category.

As you move the slider, the bar in the left half of the lower panel will inform you how many users out of the entire prediction audience would be targeted.

![](https://www.braze.com/docs/assets/img/churn/churnTargeting.gif?d232051fb485c1095fe2651cbe955539)

## Churn score and category {#churn_score}

Users in the prediction audience will be assigned a _Churn Risk Score_ between 0 and 100. The higher the score, the greater the likelihood of churn. 
- Users with scores between 0 and 50 will be labeled in the _Low Risk_ category. 
- Users with scores between 50 and 75, and 75 and 100 will be labeled in the _Medium Risk_ and _High Risk_ categories, respectively. 

The scores and the corresponding categories will be updated according to the schedule you chose on the model creation page. The number of users with churn scores in each of 20 equally sized buckets is displayed in the chart at the top of the page. This can help you determine what the churn risk looks like across the population according to this prediction.

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


## Estimated accuracy {#estimated_results}

In the right half of the panel beneath the chart, we show estimates of the expected accuracy of targeting this swath of the prediction audience. Based on data about users in the prediction audience in the past, and the apparent accuracy for the model for discriminating between churning and non-churning users on that past data, these progress bars estimate for a future potential message using the audience highlighted with the slider:

![](https://www.braze.com/docs/assets/img/churn/churnEstimatedResults.png?86a582353564c10fa88d23cad81bef13){: style="float:right;max-width:40%;margin-left:15px;"}

- How many selected users are expected to churn
- How many selected users are expected **not** to churn

Using this information, we encourage you to decide how many of the churners you want to capture and what the cost of a false positive error is for your business. If you are sending out a valuable promo, you may want to keep non-churners targeted to a minimum while getting as many expected true churners as the model will allow. Or, if you're less sensitive to false positives and users receive extra messaging, you can message more of the audience to capture more expected churners and ignore the likely errors.

### Users expected to churn

This is an estimate of how many actual churners will be correctly targeted. Of course, we don't know the future perfectly, so we don't know precisely which users from the prediction audience will churn in the future. But the prediction is a reliable inference. Based on past performance, this progress bar indicates how many of the total "actual" or "true" churners expected in the prediction Audience (based on prior churn rates) will be targeted with the current targeting selection. We would expect this number of users to churn if you do not target them with any extra or unusual messaging.

### Users expected not to churn 

This is an estimate of how many users who wouldn't have churned will be incorrectly targeted. All machine learning models make errors. There may be users in your selection who have a high _Churn Risk Score_ but do not end up churning. They would not churn even if you took no action. They will be targeted anyway, so this is an error or "false positive." The full width of this second progress bar represents the expected number of users who will not churn, and the filled portion represents those who will be incorrectly targeted using the current slider position.

## Churn correlation table {#correlation_table}

This analysis displays any user attributes or behaviors that are correlated with user churn in the historical prediction audience. The tables are split into left and right for more and less likely to churn, respectively. For each row, the ratio by which the users with the behavior or attribute in the left column are more or less likely to churn is displayed in the right column. This number is the ratio of churn likelihood of users with this behavior or attribute divided by the likelihood to churn off the entire prediction audience.

This table is updated only when the prediction retrains and not when user _Churn Risk Scores_ are updated.

**Note:**


Correlation data for preview predictions will be partially hidden. A purchase is required to reveal this information. Contact your account manager for more information.


