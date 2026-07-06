# Audience Paths 

> Canvas Audience Paths allow you to intuitively filter and segment users on a large scale by sending each user down the first path whose criteria they meet.

This Canvas component replaces the need to create excessive audience-based full steps, allowing you to combine what might have been eight full components into one. This helps you simplify user targeting while clearing up your Canvases from unnecessary clutter and complexity. 

## How it works

![An Audience Path with two groups: engaged users and everyone else.](https://www.braze.com/docs/assets/img/audience_path/audience_path.png?a359e85a822468f639f2613f8b8de133){: style="float:right;max-width:45%;margin-left:15px;margin-top:15px;"}

Users are progressed down the first branch whose criteria they meet, so put the most important path first. This reduces ambiguity about where users go and which messages they receive. Note that this order isn't [editable after launch](https://www.braze.com/docs/post-launch_edits/).

With Audience Paths, you can:

- Send users down different Canvas paths based on audience criteria.
- Put your most important audience groups first; users take the first path they qualify for.
- Precisely target users on a large scale.
  - You can create up to eight audience groups (two default and six additional groups) per Audience Paths step, but you may want to connect multiple Audience Paths steps to further sort your users. 

Within a single Audience Paths step, users are evaluated against audience groups in order and move down the first path they qualify for. If you connect multiple Audience Paths steps in a Canvas, users are evaluated again each time they reach a new Audience Paths step.

### How users are evaluated

![Canvas showing a 24-hour delay after a Message step, followed by an Audience Path.](https://www.braze.com/docs/assets/img/audience_path/audience_path5.png?5d1b9608f27e1e17535d3d2cc656661b){: style="float:right;max-width:40%;margin-left:15px;"}

Users are evaluated against filters and segment membership **at the moment they reach the Audience Path step**—not when they entered the Canvas. After evaluation, they immediately progress to the matching path. When a user is placed in an audience group, they stay in that group even if their user profile changes afterward.

<div style="clear: both;"></div>

**Important:**


Audience Paths evaluate based on a user's current attributes, filters, and segment membership at the time of evaluation. They do not evaluate based on the specific event that triggered Canvas entry. To route users based on an action they perform (such as a custom event), use [Action Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/action_paths/) instead.



### Allowing time for user evaluations

Because evaluation is immediate, it's important to add a delay before the Audience Path if the path criteria depend on a user interaction with a previous step.

For example, if users are sent Message A and the next step is an Audience Path that evaluates whether they interacted with that message, all users will progress to the step for those who haven't interacted with that message. This is because the users immediately progressed to the Audience Path step without time to interact with the message. In other words, users are evaluated for an interaction with the message almost immediately after the message sends.

To give users time to interact with a sent message, add a delay between the Message step and Audience Path. For example, a 24-hour delay gives users 24 hours after the message sends to interact with Message A before evaluation.

## Creating an Audience Path

To add an Audience Paths step, do the following: 

1. Add a step to your Canvas. 
2. Drag and drop the component from the sidebar, or select <i class="fas fa-plus-circle"></i> **Add** at the bottom of a step and select **Audience Paths**.

The default Audience Paths component contains two default audience groups, **Group 1** and **Everybody Else**. The **Everybody Else** group includes any user who does not fall into a defined audience group. This group is always last in the order.

### Defining audience groups

The following screenshot shows the layout of an expanded Audience Paths step. Here, you can define up to eight audience groups (one preset and seven customizable). To define an audience group, select the group name from the Audience Paths editor. You can rename your audience group, choose the filters and segments that apply to your group, and add or delete groups.

For example, if you wanted to target onboarding messaging to a group of users, you might select retargeting filters, such as "Has clicked email" and "Has clicked in-app message".

![An expanded Audience Path with groups for "Loves Asian Cuisine”, “Loves Latin Cuisine”, “Loves European Cuisine”, and "Everyone Else".](https://www.braze.com/docs/assets/img/audience_path/audience_path3.png?4171d06315efceae6d9b733df80b09a4)

After the Audience Paths step is complete, each audience group will have a separate branch. You can continue using Audience Paths to further filter your audience, or continue your Canvas journey with the standard Canvas steps. 

![Two Audience Paths with different groups based on engagement.](https://www.braze.com/docs/assets/img/audience_path/audience_path4.png?8003dd4487fe8f324bc0af9051bf9adb){: style="max-width:50%"}

### Testing audience groups

After adding segments and filters to your audience, you can test if your audience groups are set up as expected by [looking up a user](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/) to confirm they match the audience criteria.

![The "User Lookup" section.](https://www.braze.com/docs/assets/img_archive/user_lookup.png?a23b1b90dd9a139a54218f61761a0040){: style="max-width:70%"}

## Using Audience Paths

The true power of Audience Paths lies in putting the paths you care about most **first**. While this feature doesn't need to be used strategically, some marketers may find themselves pushing certain products to users such as specials or limited-edition releases. 

By placing those segments first in the list, you can target users that fall into specific filters and segments while still targeting users that might not fit those specific criteria—all in a single Canvas step.

![An Audience Path with groups for “Likes Big Brand Shoes”, “Likes Big Brand”, and "Everyone Else".](https://www.braze.com/docs/assets/img/audience_path/audience_path2.png?9711da55d665fb9d5f610af2f29d18b9){: style="float:right;max-width:50%;margin-left:15px;margin-bottom:15px;"}

For example, let's say you wanted to send a group of users ads for new products. You'd start by putting filters that fall under those products **first** on the Audience Path. If you were creating a marketing campaign for the company "Big Brand" and a new retail brand had just released, you might select filters like "Likes Big Brand Shoes" or "Likes Big Brand Bags", and send different email messages based on what filtered group they fall into. 

When users enter this Audience Paths component, they'll first be evaluated for Audience Group 1 "Likes Big Brand Shoes"—the first path in the list. If so, they'll continue to the next component defined in your Canvas. If they don't "Like Big Brand Shoes", they will then be evaluated for the next audience group, Audience Group 2 "Likes Big Brand Bags", and will continue to the next step if the criteria are met. Lastly, users who don't fall into the previous groups would fall into the "Everybody Else" group and also continue to the next Canvas step you define for that path.

You can also see the performance of this step using [Canvas analytics](https://www.braze.com/docs/user_guide/messaging/canvas/testing_canvases/measuring_and_testing_with_canvas_analytics#performance-visualization).

### Segmenting Audience Paths with random bucket numbers

If your Canvas uses a [rate limit](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping/) (such as limiting the total number of users who will receive the Canvas), Braze recommends that you don't use random bucket numbers to segment your Audience Paths. 

A [random bucket number](https://www.braze.com/docs/user_guide/messaging/ab_testing/concepts/random_bucket_numbers/) is a user attribute that can be used to create uniformly distributed segments of random users. Braze uses the random bucket number to group users during the segmentation phase of Canvas entry, and each group is processed separately. Depending on which groups finish processing first, some users may be capped at entry due to the rate limit, which could cause an uneven distribution of users when they reach the Audience Paths step.

In this scenario, try using [Experiment Paths](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/experiment_step/) instead.

### Using Intelligent Channel filter with Audience Paths

Using a combination of Audience Paths steps and Intelligent Channel filters, you can tailor your messaging experience to each user's preferences and behaviors. This way, your users will receive the most relevant messages through the appropriate channels.

For example, in an Audience Paths step, you can create three audiences: Email, Mobile Push, and Everyone Else. For the Email audience, add the filter `Intelligent Channel is Email`. For the Mobile Push audience, add the filter `Intelligent Channel is Mobile Push`. Then, you can add a Message step for each of the audience paths to deliver personalized and relevant messages.

**Tip:**


Check out our [Braze Canvas templates](https://www.braze.com/docs/user_guide/messaging/templates/canvas_templates/braze_templates) for examples on how you can customize these pre-built templates to your advantage.


