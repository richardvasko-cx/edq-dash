# About landing pages

> Braze landing pages are standalone web pages that can drive your user acquisition and engagement strategy.

Use landing pages to grow your audience, capture user data, promote special offers, and support multichannel campaigns. For a reference of landing page drag-and-drop blocks, see [Editor blocks (landing pages)](https://www.braze.com/docs/user_guide/messaging/design_and_edit/editor_blocks/?sdktab=landing%20pages).

**Note:**


Landing page and custom domain availability depends on your Braze package. Contact your account manager or customer success manager to get started.



<iframe width="560" height="315" src="https://www.youtube.com/embed/" title="Video" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="media_embed "></iframe>



## Prerequisites

Before you can access, create, and publish landing pages, you either need administrator [permissions](https://www.braze.com/docs/user_guide/administer/global/user_management/permissions/#list-of-permissions) or all the following permissions:

- View Landing Pages
- Edit Landing Page Drafts
- Publish Landing Pages



## Plan tiers

The number of published landing pages, custom domains, and features you can use depends on your plan type: free or pro (incremental).

| Feature                                                                                                   | Free tier     | Pro tier (incremental)     |
| :---------------------------------------------------------------------------------------------------------------- | :--------------- | ----------------- |
| Published landing pages                                                                 | Five per company | 20 additional |
| Custom domains          | One per company | Five additional |
| [Liquid personalization](https://www.braze.com/docs/user_guide/messaging/landing_pages/personalize_landing_pages/) | Not available | Available |
| Prefilled form fields | Not available | Available |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Plan tiers" }

## Adding Google Tag Manager to a landing page

To add Google Tag Manager to your landing pages, add a **Custom Code** block to your landing page in the drag-and-drop editor, then insert the Tag Manager code into the block. Make sure to add a data layer before the Tag Manager code, such as in this example:

```
<script>
window.dataLayer = window.dataLayer || [];
</script>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

For details on implementing Google Tag Manager, see [Google's documentation](https://developers.google.com/tag-platform/tag-manager/datalayer#installation).

## Frequently asked questions

### What's the maximum size for landing pages?

The landing page body size can be up to 500 KB.

### Can landing pages handle high-traffic scenarios?

Yes, non-personalized landing pages can handle high-traffic scenarios effectively. When a non-personalized landing page is first requested, Braze caches it through Cloudflare. This means all subsequent requests for the same link are served from cache, so performance is not degraded on high-volume requests. This cache lasts 24 hours, and cached page views don't count toward rate limits.

For personalized landing pages (using Liquid personalization), rate limits apply to uncached requests. To maintain optimal performance, see [Personalization considerations](https://www.braze.com/docs/user_guide/messaging/landing_pages/personalize_landing_pages/#personalization-considerations).

### Are there any technical requirements to publish a landing page?

No, there aren't any technical requirements.

### Is there an HTML editor for landing pages?

Yes. Use the **Custom Code** block in the drag-and-drop editor to add or edit HTML.

### Can I create a webhook inside a landing page?

No, but the **Submitted a Landing Page form** event can act as a trigger for Canvases or webhook campaigns:

- **Canvas:** Use the **Submitted a Landing Page form** event as a Canvas entry trigger and add a webhook step.
- **Campaign:** Use the **Submitted a Landing Page form** event to trigger based on form submission. 

When the page isn't sent through a Braze channel (such as through a website or ad), a new user profile may be created on submission—even if that person already exists in Braze. To handle this, set up a Canvas triggered by **Submitted a Landing Page form** and add a Braze-to-Braze webhook step that calls the [`/users/merge`](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/) endpoint to merge the new profile into the existing one.

When you use the `landing_page_url` Liquid tag to share the page, form submissions are automatically tied to the existing user profile. You can then reference the user attributes submitted on the landing page through Liquid for subsequent templating. 
