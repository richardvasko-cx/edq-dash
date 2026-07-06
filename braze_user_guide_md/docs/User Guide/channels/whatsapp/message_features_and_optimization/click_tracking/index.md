# Click tracking

> This page covers how to turn on click tracking in your WhatsApp messages, test shortened links, use your custom domain in tracked links, and more.

Click tracking lets you measure when someone taps a link in your WhatsApp message, giving you a clear view into what content is driving engagement. Braze shortens your URLs, adds tracking behind the scenes, and logs click events as they happen.

You can turn on click tracking in both response and template messages. It works with links in buttons and body text, and supports personalized URLs and custom domains. After it's turned on, you'll see click data in your WhatsApp performance reports and be able to segment users based on who clicked what.

**Note:**


Click tracking doesn’t work with deep links. You can shorten universal links from providers such as Branch or Appsflyer, but Braze is unable to troubleshoot issues that may arise in doing so (such as breaking the attribution or causing a redirect).



## How it works

### Response messages 

To set up click tracking for response messages:
1. Create a response message that includes a call-to-action (CTA) button with a website URL.
2. Enable click tracking by clicking the designated button in the interface.

The link will be shortened to the Braze domain, or the custom domain specified for the subscription group, and personalized for the user.

Any static URLs that start with `http://` or `https://` will be shortened. Shortened URLs that contain Liquid personalization (such as user-level tracking targeting) will be valid for two months.

![WhatsApp message composer with content body and a button.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/message_composer.png?52b6d3b215bd5e3616c095e1e7c3ca12)

### Template messages

We recommend enabling click tracking for template messages through the **WhatsApp Template Builder** in Braze. This enablement method automatically handles the URL formatting requirements, so you don't need to manually configure anything in WhatsApp Business Manager.

If you're creating templates directly in WhatsApp Business Manager instead, see [Configuring click tracking from WhatsApp Business Manager](#configuring-click-tracking-from-whatsapp-business-manager).

#### Use the Template Builder

When creating a template in the Template Builder, click tracking is configured in the **Settings** tab.

##### Step 1: Enable click tracking

In the Template Builder, go to the **Settings** tab. In **Link options**, select the **Click tracking** checkbox. When enabled, all links in your template (in both the message body and CTA website buttons) are shortened and tracked.

![Settings tab in the Template Builder showing the Link options section with the Click tracking checkbox enabled and a Custom domain dropdown.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/template_builder_settings.png?808f5eb3d1e3efe5773f90f7b574a051)

##### Step 2: Select a custom domain (optional)

Under **Custom domain**, select the domain you'd like to use for shortened links. The dropdown shows all custom tracking domains configured for your workspace. If you don't select one, Braze uses the default `brz.ai` domain.

To add or change domains, select **Subscription Group Management**.

**Important:**


After a template is submitted to Meta for approval, the tracking domain cannot be changed. Confirm you've selected the correct domain before submitting.



##### Step 3: Add your destination URLs

Go back to the **Compose** tab and add your message content.

- **For CTA website buttons:** Enter the destination URL in the **Click tracking URL** field. Braze stores your destination URL and automatically formats the button's website URL with the tracking domain and a variable placeholder (for example, `https://brz.ai/{{1}}`). This placeholder is what is submitted to Meta. At send time, Braze generates the full tracked URL for each user and populates the variable.
- **For body text links:** Enter URLs directly in the body. 

You can preview the tracked URL format for each button directly below the **Website URL** field (for example, `https://brz.ai/XXXXXXXX`).

![Call to Action buttons section showing a Visit website button with Website URL pre-filled to the tracked format and a Click tracking URL field for the destination.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/template_builder_compose.png?b87a9c117bd9a796e3452c469d8e6e98){: style="max-width:70%;"}

##### Update destination URLs after submission

After a template is submitted to Meta, the tracking domain is locked, but the destination URL remains editable at any time. To update where a link points, edit the **Click tracking URL** field for that button. The tracked URL format stays the same; Braze redirects users to the new destination at send time.

#### Configure click tracking from WhatsApp Business Manager

If you're creating templates in WhatsApp Business Manager rather than the Template Builder, follow these steps so click tracking works correctly when the template is used in Braze.

##### Step 1: Build a click-tracking supported template in WhatsApp Business Manager

1. In your WhatsApp Business Manager, create a base URL that is either your custom domain or `brz.ai`.
2. Make sure that the links included in the template are compatible with click tracking.
3. Don’t change the template variables after it’s set up as a campaign in Braze; downstream changes can’t be incorporated.
4. For CTA button links, select **Dynamic**, and then provide the base URL (`brz.ai` or your custom domain).

![Section to create a call to action.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/create_cta.png?281821522389508bfb91ab42eaa6eb04){: style="max-width:70%;"}

{: start="5"}
5. For links in the body text, when writing the template in your WhatsApp Business Manager, remove any inserted spaces for links contained in the body that you want to track.

![Textbox to enter the content body for the call to action.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/cta_textbox.png?07f38fd99c8f8ac34279dadb759bb9fb){: style="max-width:70%;"}

##### Step 2: Complete your template in Braze

When composing, Braze automatically detects which templates have supportable URL domains, both in the body text and for CTA buttons. The status is shown at the bottom of the template.

![Link Status section showing an active status for click tracking.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/link_status.png?58590de537433a1d8b97cb730f088d5d){: style="max-width:70%;"}

- **Supported links:** Links submitted with the matching base URL have have click tracking enabled.
- **Partially-supported links:** If some links in a template are submitted as full URLs, click tracking **won't** be applied to those links.
- **Unsupported links:** Links without an approved base URL **won't** have click tracking capabilities.

The destination URL needs to be provided for any link with a base URL that matches either `brz.ai` or your custom domain.

![Buttons section with fields for a button name, website URL, and click tracking URL.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/buttons.png?4016bb1edd3783136efb9505c7313af3){: style="max-width:70%;"}

**Important:**


**Sending template messages via the API**: WhatsApp click tracking (using `brz.ai` or a custom tracking domain and the **Click tracking URL** field in the message composer) isn't supported when sending WhatsApp template messages through the [`/messages/send` endpoint](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_messages/).

If you send a template message through the API, you can populate CTA URL variables (using `button_variables`), but Braze doesn't generate a click-tracking URL or redirect link in the API request flow. To use click tracking, send the template from the Braze dashboard or via a Braze campaign trigger.









## Liquid personalization in URLs

You can dynamically construct your URL directly within the Braze composer, allowing you to add dynamic UTM parameters to your URLs or send users unique links (such as directing users to their abandoned cart or to a specific product that is back in stock).
URLs can be dynamically generated through the use of any supported Liquid personalization tags.


```
https://example.com/?campaign_utm={{campaign.${api_id}}}&user_attribute={{custom_attribute.${attribute1}}}
```


We also support the shortening of custom-defined Liquid variables, such as in these examples:


```liquid
{% assign url_var = {{event_properties.${url_slug}}} %}
https://example.com/{{url_var}}
```


## Shorten URLs rendered by Liquid variables

Braze shortens URLs that are rendered by Liquid, even those included in API-trigger properties. For example, if `{{api_trigger_properties.${url_value}}}` represents a valid URL, we will shorten and track that URL before sending the WhatsApp message.

## Testing

Before launching your campaign or Canvas, it’s best practice to preview and test your message first. To do so, go to the **Test** tab to preview and send a WhatsApp to content test groups or an individual user.

This preview will update with relevant personalization and the shortened URL. 

**Important:**


If a draft is created within an active Canvas, a shortened URL won’t be generated. The actual shortened URL is generated when the Canvas draft is made active.



## Reporting

When click tracking is turned on or used with supported templates, the WhatsApp performance table includes the column **Total Clicks** that shows a count of click events per variant and an associated click rate. For more details on WhatsApp metrics, refer to [WhatsApp message performance](https://www.braze.com/docs/user_guide/channels/whatsapp/reporting/).

![WhatsApp Message Canvas step.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/canvas_step.png?ab23bbc44f1e832fd27353869cbd1c71){: style="max-width:30%;"}

Click data will be automatically reported in the analytics dashboard.

![WhatsApp message performance table.](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/message_performance.png?74f4716375ca6a37f4228e808dda2bb8)

## Retargeting users 

You can use the `Clicked/Opened Step` filter and `clicked tracked WhatsApp link` interaction to segment users based on their interactions with the links.

![Filter group with a filter for "clicked tracked WhatsApp link".](https://www.braze.com/docs/assets/img/whatsapp/click_tracking/filter_group.png?de7e134210e3faa18722b8e774866dc0)







### Do I know which individual users are clicking on a URL?

Yes. When click tracking is turned on (or enabled based on template configuration), you can retarget users who have clicked URLs by leveraging the WhatsApp retargeting filters or the WhatsApp click events (`users.messages.whatsapp.Click`) sent by Currents.

### Do previews on the WhatsApp device count as clicks? 

No, they do not contribute to the click rate for WhatsApp messages. 

