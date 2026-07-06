# Fullscreen in-app messages

> Fullscreen messages take up the whole screen of the device! This message type is great when you really need your user's attention, like for mandatory app updates. 

This message type is available in both the [drag-and-drop](https://www.braze.com/docs/user_guide/channels/in_app_messages/drag_and_drop/) and [traditional editor](https://www.braze.com/docs/user_guide/channels/in_app_messages/traditional/).




![Two fullscreen in-app messages side-by-side in portrait orientation, detailing the image and text recommendations. See following sections for details.](https://www.braze.com/docs/assets/img/full-screen-spec.png?8e69932c6fd54b23040c4a91dfd8652f){: style="max-width:801px;border:none;display:block;margin-left:auto;margin-right:auto"}




![Two fullscreen in-app messages side-by-side in landscape orientation, detailing the image and text recommendations. See following sections for details.](https://www.braze.com/docs/assets/img/full-screen-spec-landscape.png?586e3f80b444c63630cfd097b939e4ad){: style="max-width:801px;border:none;display:block;margin-left:auto;margin-right:auto"}




## Images

Fullscreen in-app messages will fill the entire height of a device and crop horizontally (left and right sides) as needed. Image and text fullscreen messages will fill 50% of the height of a device. All fullscreen in-app messages will fill the status bar on "notched" devices.

- All images must be less than 5&nbsp;MB.
- We only accept PNG, JPEG, and [GIF](https://www.braze.com/docs/developer_guide/platform_integration_guides/android/in-app_messaging/customization/gifs#gifs) file types.
- We recommend that your images be 500&nbsp;KB.

**Tip:**

 Create assets with confidence! Our in-app message image templates and safe zone overlays are designed to play nicely with devices of all sizes. [Download Design Templates ZIP](https://www.braze.com/docs/assets/download_file/Braze-In-App-Message-Design-Templates.zip?50a8730464ef2e32295ac3cd13cc6c05) 


### Portrait

| layout | asset size | notes |
|--- | --- | --- |
| Image and text | 6:5 aspect ratio<br> High-res 1200 x 1000&nbsp;px<br> Minimum 600 x 500&nbsp;px | Cropping can occur on all sides, but the image will always fill the top 50% of the viewport |
| Image only | 3:5 aspect ratio<br> High-res 1200 x 2000&nbsp;px<br> Minimum 600 x 1000&nbsp;px | Cropping can occur on the left and right edges on taller devices |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Portrait" }

### Landscape

| layout | asset size | notes |
|--- | --- | --- |
| Image and text | 10:3 aspect ratio<br> High-res 2000 x 600px<br> Minimum 1000 x 300&nbsp;px | Cropping can occur on all sides, but the image will always fill the top 50% of the viewport |
| Image only | 5:3 aspect ratio<br> High-res 2000 x 1200px<br> Minimum 1000 x 600&nbsp;px | Cropping can occur on the left and right edges on taller devices |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Landscape" }

### Image safe zone

When previewing a fullscreen in-app message in the Braze platform, you can enable the Image Safe Zone to the area of the message that is safe from cropping when displayed across devices. In addition to testing the Image Safe Zone in the preview pane, we recommend you [test your message](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/sending_test_messages/?tab=in-app%20message) as always.

![Previewing an in-app message in Braze with "Show Image Safe Zone" enabled. The image safe zone is an overlay over the image that visualizes what parts of the image will be safe from cropping.](https://www.braze.com/docs/assets/img/image-safe-zone-full-screen-in-app-message.png?2cf219af9d0640386357d49457712d48)

## Larger screens

On a tablet or desktop browser, a fullscreen in-app message will sit in the center of the app screen, as shown in the following screenshot.




![Fullscreen in-app message as it would appear on a large screen in portrait orientation. The message appears as a large modal that sits in the center of the screen.](https://www.braze.com/docs/assets/img/full-screen-large-viewport.png?066f281d24ca99d4bdbec91c7ea99717){: style="border:none;display:block;margin-left:auto;margin-right:auto"}




![Fullscreen in-app message as it would appear on a large screen in landscape orientation. The message appears as a large modal that sits in the center of the screen.](https://www.braze.com/docs/assets/img/full-screen-large-viewport-landscape.png?eb5e0494028e31dbff7abf8c52d6c64c){: style="max-width:80%;border:none;display:block;margin-left:auto;margin-right:auto"}




