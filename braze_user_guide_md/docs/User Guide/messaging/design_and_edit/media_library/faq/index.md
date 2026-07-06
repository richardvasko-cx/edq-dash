# Frequently asked questions

> This page provides answers to frequently asked questions about the media library in Braze.

### Are there storage limits for images within the media library?

No, there are no storage limits for assets within the media library. However, there are size limits for assets (maximum 5 MB).

### Are there expiration dates for uploaded assets?

No, assets uploaded to the media library will be retained for the entire duration of your contract with Braze.

### Can I upload video assets?

No, the media library doesn't support video files. We recommend you host these externally, or on a platform such as YouTube.

### Can I crop all image types?

No, the media library doesn't support cropping GIF images.

### How do I crop an existing image?

You can crop an existing image by selecting the image from the media library and clicking **Crop & Save New Image**. 

![Preview of media library image.](https://www.braze.com/docs/assets/img_archive/media_library_crop1.png?07479ca864bd897b91d7ac03b35e9dca){: height="75%" width="75%"}

You'll then be redirected to a cropping composer where you can select your ratio type, and edit the name of the new image. When you select **Save**, your new image can be used.

![Window to crop and save media library image.](https://www.braze.com/docs/assets/img_archive/media_library_crop2.png?4ded35b01e3031b3b4f05f9056223579){: height="75%" width="75%"}

### My image keeps timing out when I try to upload it. What can I do about this?

This can happen for a variety of reasons, but a common solution is to make sure your image is optimized before attempting to upload it. This means running your image through an image optimizer such as [ImageOptim](https://imageoptim.com/mac).

Additionally, if your image was built in Photoshop (or a similar software) and has many layers, merging and reducing the number of layers can also help.

### I see an "Unexpected Error" when uploading an image even though it's under 5 MB and in a supported format. What's wrong?

This can happen for two main reasons:

1. **Invalid metadata in the file:** The software Braze uses to process images may reject files with invalid or incompatible metadata. In some cases, the file may also be processed in a way that pushes it over the 5 MB limit. Try using a different image (for example, re-export or re-save the image from your image editor) or an image from another source.
2. **Special characters in the file name:** File names that contain special characters (such as `&` or `%`) can cause the upload to fail. Rename the file to use only letters, numbers, hyphens, or underscores, then try uploading again.

### Why can't I upload any image I want into the push composers?

This is because most composers have restrictions on the image ratio size that is allowed.

### Generate an image using AI

You can generate images from **Content** > **Media Library** by selecting **AI Image Generator**. You need **Edit Media Library Assets** permission. If you don't see the option, contact your Braze customer team. For steps and policy details, see [Generate images with BrazeAI](https://www.braze.com/docs/user_guide/brazeai/generative_ai/images/) and [Generating images with BrazeAI](https://www.braze.com/docs/user_guide/messaging/design_and_edit/media_library/#generate-ai).

### Can I create vanity URLs for media library image assets?

Vanity URLs for Media Library assets aren't supported because custom URLs would break CDN delivery. You can replace an image at its existing URL when campaigns already reference that URL. For more information, see [Replace a file](https://www.braze.com/docs/user_guide/messaging/design_and_edit/media_library/#replace-a-file).

