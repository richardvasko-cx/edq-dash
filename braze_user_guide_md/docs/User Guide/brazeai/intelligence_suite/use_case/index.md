# Use case: Turn past app behavior into personalized offers on the right channel

> This example shows how a fictional brand uses Intelligent Timing to leverage past app and message engagement data to send personalized promotions in a unified Canvas.

Let’s say Marvin is a marketing manager at SandwichEmperor, a fast food restaurant that runs frequent limited-time offers. Marvin’s team is in charge of delivering promotional messages in their app to promote a new limited-time menu item: the Super Sub. 

Until now, every message for limited-time items has been managed as a silo: different copy tests and angles delivered as separate sends—they tried different messaging angles to drive higher engagement without fully understanding when limited-time promotions are most popular among their users in their app. 

For the new Super Sub promotion, Marvin wants one coordinated Canvas that still learns over time—using behavior Braze already captures (sessions, opens, clicks) rather than guessing send times or a single winning message.

Using Intelligent Timing, Marvin can deliver Message steps when each person is more likely to engage, based on statistical analysis of past interactions (for example, session patterns and channel engagement).

This walkthrough describes how Marvin:

- Builds one Canvas with push, email, and SMS in Message steps
- Uses Intelligent Timing on those steps so delivery aligns with inferred engagement patterns per user and channel

## Step 1: Define the success metric and build the Canvas

Marvin decides what “success” means for Super Sub (for example, orders or a custom event that triggers when someone completes a Super Sub purchase or adds it in the app). 

Next, Marvin creates a Canvas for new users to enter on a steady schedule while the offer runs.

1. In the Braze dashboard, Marvin navigates to **Messaging** > **Canvas**.
2. He creates a Canvas and names it “Limited item - Super Sub”.
3. He then adds one conversion event and another variant in the Canvas.
4. He completes the remaining Canvas details and is now ready to map the user journey in the Canvas builder.

## Step 2: Set up delivery settings

In the **Delivery settings** tab of the Message step, Marvin plans to use Intelligent Timing to analyze their users’ past interactions with the app and each messaging channel, then automatically select the best time to promote the Super Sub to each user. This means some users may receive the promotion in the afternoon, while others may receive it in the evening.

He selects **the most popular time to use the app amongst all users** for users who don’t have enough past interactions to analyze.

## Step 3: Add delays and Intelligent Timing to Message steps

For Message steps that use Intelligent Timing, Marvin follows Canvas guidance: he places a Delay step of at least two calendar days between entry (or a prior step) and the Message step with Intelligent Timing. He prefers calendar days for delays when using Intelligent Timing so delivery happens on the intended day at each user’s optimal time. 

In each push notification, email, and SMS Message step, he opens **Delivery Settings** and chooses **Using Intelligent Timing**. He sets a fallback time for users who don’t have enough engagement history for an optimal time. He notes that Message steps with multiple channels may send or attempt to send at different times per channel, matching how some customers engage more on email in the morning and push in the evening.

## Step 4: Monitor and optimize

Marvin coordinates Super Sub promotional assets across push, email, and SMS in the Message steps (and any subsequent steps his variants use) and launches the Canvas.

After launch, he watches Canvas analytics and conversion counts and concludes that Intelligent Timing keeps optimizing when each channel fires for each user based on ongoing engagement patterns. As a result, Marvin successfully helped SandwichEmperor connect limited-time offer performance to when and which journey works, rather than only which one-off promotional message won last time.
