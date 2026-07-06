# Retarget users through a landing page

> Learn how to retarget users who've submitted a form through a landing page by creating a dedicated segment or triggering a message when the form is submitted.

## Prerequisites

Before you start, you'll need to create a [landing page](https://www.braze.com/docs/user_guide/messaging/landing_pages/create_landing_pages/).

## Retargeting users

Braze automatically tracks when a user submits a landing page form. You can view the total number of submissions for a form under [landing page analytics](https://www.braze.com/docs/user_guide/messaging/landing_pages/create_landing_pages/#viewing-analytics). However, for user-specific retargeting, you'll need to retarget users through your landing page form using one of the following methods:

- **Using a segment:** You can create a new segment to automatically identify users who have or haven't submitted a landing page form.
- **Using a message trigger:** You can set up a message trigger to automatically message users or enter them into a Canvas after they submit the form.



When you [create a segment](https://www.braze.com/docs/user_guide/audience/segments/creating_a_segment/), under "Retargeting" group, choose **Submitted form on Landing Page**.

![Segment creation with the Filter Group selected as "Submitted Form on Landing Page".](https://www.braze.com/docs/assets/img/landing_pages/segmentation_selected.png?13e13653f0d6aadfa2e8c8dae64e9351)

From here, you can segment users based on whether they have or haven't submitted a landing page form for your landing page.



When you choose your delivery option for your [campaign](https://www.braze.com/docs/user_guide/messaging/campaigns/) or [Canvas](https://www.braze.com/docs/user_guide/messaging/canvas/), select **Action Based Delivery**, then **Submitted Landing Page form**.

All users who submit a form through this landing page form will either be messaged through the chosen messaging channel or entered into the chosen Canvas.

![Landing page trigger action in messaging.](https://www.braze.com/docs/assets/img/landing_pages/trigger.png?7c10579ccbffb0d245aaaa6c5db70f2b)

**Note:**


The action-based delivery option for landing pages isn't available for in-app messages. To target users who have submitted a form on a landing page with an in-app message, select the **Submitted Form on Landing Page** filter in the **Targeting Options** of your campaign.





