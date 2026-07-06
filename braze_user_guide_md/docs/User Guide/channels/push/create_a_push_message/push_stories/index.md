# Push Stories

> Push Stories take the photo carousel functionality popularized in Instagram and Facebook and allow marketers to create a carousel of pages within a push that tells a rich, cohesive story. These pages consist of an image, click action, title, and description. Your users can swipe through these pages and view the story—as told by you.

| Android Example (Expanded) | IOS Example (Expanded) |
| :-----: | :----------: |
| ![](https://www.braze.com/docs/assets/img_archive/pushstories_android_preview.png?b9ff1b03bc3189d44ee98d330662fe90) | ![](https://www.braze.com/docs/assets/img_archive/pushstories_ios_preview.png?d0485e7305a238015d4420b956e0b375) |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Push Stories" }

**Note:**


On iOS SDK versions 3.13.0+, due to a change in how the SDK downloads images, a thumbnail of the first image will not show on the condensed view of the push. Ensure that your message copy prompts users to expand the push to see the images.



## Prerequisites

The following SDK versions are required to receive Push Stories:

<div id='sdk-versions'><a href='/docs/developer_guide/platforms/swift/changelog/#500' class='sdk-versions--chip ios-sdk' target='_blank'><i class='fa-brands fa-apple'></i> &nbsp; Swift: 5.0.0+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a><a href='/docs/developer_guide/platforms/android/changelog/#220' class='sdk-versions--chip android-sdk' target='_blank'><i class='fa-brands fa-android'></i> &nbsp; Android: 2.2.0+ &nbsp;<i class='fa-solid fa-arrow-up-right-from-square'></i></a></div>


## How to use Push Stories

![](https://www.braze.com/docs/assets/img_archive/pushstories_composer_dropdown2.png?31b30518ce8f475f2862e736c1449257){: style="float:right;max-width:50%;margin-left:15px;margin-bottom:15px;"}

To use Push Stories, do the following:

1. Create a [push campaign](https://www.braze.com/docs/user_guide/channels/push/create_a_push_message/).
2. For your **Notification Type**, select **Push Stories**.
3. Select **iOS** or **Android**. Note that if you select both for a push message, the option to create a Push Story won't appear. 

### Push Story composer

To create a page, perform the following steps:

1. Click **Manage Pages** from the main composer.
    <br><br>![](https://www.braze.com/docs/assets/img_archive/pushstories_add_pages.png?a52df8edf8deafe070b67635a59f99ee){: style="max-width:70%"}<br><br>
2. Insert an image for each page, along with the click behavior for that image.
3. If desired, add a **Title** and **Description** for each page. If you use a title and description for one page, they must be inserted for all pages.

The previews will be reflected and are interactive.

![](https://www.braze.com/docs/assets/img_archive/pushstories_composer.png?f7843e6059b52206a7b1f18fdcad0e9e){: style="max-width:60%"}

**Important:**


If you are pulling in images with [Connected Content](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content#about-connected-content), ensure that your image URL begins with `https://`. Using `http://` will crash your app.



### Image and text specifications

The following image and text specifications apply to the photo carousel portion of Push Stories. For information on the basic push that users interact with to activate the Push Story, refer to [Push message and image formats](https://www.braze.com/docs/user_guide/channels/push/create_a_push_message/message_and_image_formats/).




- **Image ratio:** 2:1 (required)
- **Recommended image size:** 500 KB
- **Maximum image size:** 5 MB
- **File types:** PNG, JPEG




- **Title:** 30 characters (recommended)
- **Description:** 30 characters (recommended)

**Note:**


While there may be some variance in character length from device to device, the title and description for Push Stories are limited to one line each. The remainder of your message will be truncated. Always test your message on a real device.






### Push Story segmentation

When you create a campaign or Canvas, you can filter which users you want to target based on whether they have clicked on a Push Story page. Then, select the campaign and the page you want to use to target your users.

### Push Stories analytics

The analytics will look very similar to the current analytics section for push notifications. For Push Stories analytics, you can open the **Direct Opens** metric to view the clicks per page.

![iOS Push Performance table with sample analytics and expanded details for the Direct Opens metric.](https://www.braze.com/docs/assets/img_archive/pushstories_analytics.png?fa732c83f1b1e7e825c24863ed9df5a6)

## Troubleshooting

### iOS

#### I sent myself a Push Story but didn't receive the notification

Apple has specific rules in place that will prevent certain types of notifications from being sent to a device based on a number of different factors. This includes evaluating the customers' data plan, notification size, and the customers' storage capacity. As a result, sometimes no notification will be sent to your customers.

These are limitations imposed by Apple that should be considered when designing your Push Story.

#### I sent myself a Push Story but saw the condensed view instead

In certain situations where all the pages do not load, for example, due to a loss of data connection, the Push Story will only show the condensed notification.

### Android

#### Push Story doesn't dismiss after clicking the image 

By default, Push Stories are not dismissed on Android after a user clicks on the image. If you'd like to dismiss the notification, call [`cancelNotification`](https://braze-inc.github.io/braze-android-sdk/kdoc/braze-android-sdk/com.braze.push/-braze-notification-utils/index.html#-1466259649%2FFunctions%2F-1725759721).  

