# Slideup in-app messages

> Our slideups typically appear at the top or bottom of the app screen (you can set this when you create your message). These are great for alerting your users about new terms of service, cookies, and other snippets of information. These are non-obtrusive and allow your users to continue to interact with your app while the message displays.

This message type is available in the [traditional editor](https://www.braze.com/docs/user_guide/channels/in_app_messages/traditional/).

![Two slide-up in-app messages, one appearing from the top of the screen and the other from the bottom, detailing the image and text recommendations. See following sections for details.](https://www.braze.com/docs/assets/img/slideup-spec.png?5e0eb3225ef5a9ca264817b8267aad45){: style="max-width: 40%; border: none;"}

## Image and copy behavior

Slideup messages can contain up to three lines of copy before truncation with ellipses. Images in slideups will never be cropped or clipped—they will always scale down to fit within the 50 x 50 pixel image container.

- All images must be less than 5&nbsp;MB.
- We only accept PNG, JPEG, and GIF file types.
- We recommend that your images be 500&nbsp;KB.

**Tip:**

 Create assets with confidence! Our in-app message image templates and safe zone overlays are designed to play nicely with devices of all sizes. [Download Design Templates ZIP](https://www.braze.com/docs/assets/download_file/Braze-In-App-Message-Design-Templates.zip?50a8730464ef2e32295ac3cd13cc6c05) 


| Layout | Asset Size | Notes |
|--- | --- | --- |
| Image + Text | 1:1 aspect ratio<br>High-res 150 x 150&nbsp;px<br> Minimum 50 x 50&nbsp;px | Images of various aspect ratios will fit into a square image container, without cropping. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Image and copy behavior" }

You should always [preview and test your messages](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/sending_test_messages/?tab=in-app%20message) on a variety of devices to ensure that the most important areas of your image and message appear as expected. Note that when previewing your message on the composer, the actual rendering on devices may differ.

## Mobile devices

On mobile devices, slideups appear at the top or bottom of the app screen. You can specify this when you create your message. Users can swipe to dismiss the slideup, or tap to open it if a click action is included. If a click action is added to the slideup, a chevron ">" is shown.

## Larger screens




On a desktop browser, a slideup in-app message will sit in the corner of the screen as shown in the following screenshot (unless designated otherwise when creating the in-app message). Users can click the close "X" button to dismiss the slideup.

![Slideup in-app message as it appears on a desktop browser. The message appears in the bottom-right corner of the screen and does not take up the full width of the screen.](https://www.braze.com/docs/assets/img/slideup-large-viewport.png?8a1850d9feb1a3413b9abbce2e5501f5){: style="border: none;"}




On a tablet, a slideup in-app message appears on the bottom of the screen. Similar to on mobile devices, users can swipe to dismiss the slideup, or tap to open it if a click action is included. If a click action is added to the slideup, a chevron ">" is shown. A close "X" button is not shown by default.

![Slideup in-app message as it appears on a tablet screen. The message appears in the bottom-middle of the screen and does not take up the full width of the screen.](https://www.braze.com/docs/assets/img/slideup-tablet.png?51905451e62327e3ef6edc3de988d9d7){: style="border: none;"}




