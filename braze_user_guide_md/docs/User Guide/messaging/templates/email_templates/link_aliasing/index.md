# [![Braze Learning course](https://www.braze.com/docs/assets/img/bl_icon3.png?5f6465f63e399dec15d7020b6f4d2452)](https://learning.braze.com/link-aliasing){: style="float:right;width:120px;border:0;" class="noimgborder"}Link aliasing
 
> Use link aliasing to create recognizable, user-generated names to identify links sent in email messages from Braze. These links are available for segmentation retargeting, action-based triggering, and link analytics.

## About link aliasing

With link aliasing, you can create user-generated names to identify and track links sent in emails. This way, you can efficiently use these recognizable link aliases in your emails to track engagement and analyze campaign performance, without needing to reference the full link.

With link aliasing, you can:

- **Retarget users who have clicked specific links:** Identify and target users who have clicked a link.
- **Create action-based triggers:** Send an email when a user clicks a link.
- **Analyze metrics:** Compare how many users have clicked Link A versus Link B.

### How it works

Braze uniquely identifies links within emails by appending an extra parameter called the `lid` (also known as the link identifier) to every link URL. This `lid` value allows Braze to track, monitor, and aggregate user interactions with the link even if the rest of the URL parameters may differ. This helps to provide insights into how users engage with the content in your email campaigns.

Link identifiers will also be updated if an email campaign, Canvas with an email message, or Content Block is duplicated.

## Creating a link alias

**Important:**


**Link Management** appears in the campaign or Canvas email composer when Braze enables link management for your account. To create and edit **link aliases**, link aliasing must be turned on. If **Link Management** is missing, contact your account manager to turn on link aliasing.



To create a link alias, open your email body in the campaign or Canvas component, then open **Link Management** from the **Content** area. The drag-and-drop and HTML composers use the same sidebar layout:

### Drag-and-drop editor

1. Select **Edit Email Body** to open the drag-and-drop composer.
2. In the composer sidebar, select **Content** (alongside **Sending Settings** and **Preview & Test**). For more on this layout, see [Create an email with drag-and-drop](https://www.braze.com/docs/user_guide/channels/email/drag_and_drop/).
3. In the **Content** submenu, select **Link Management** (it appears under **Design and Build**). If the submenu is collapsed, expand it using the arrow control on the sidebar.

### HTML editor

1. Go to your email body in the composer.
2. In the composer sidebar, select **Content**.
3. In the **Content** submenu, select **Link Management** under **Design and Build**.

In **Link Management**:

1. Braze automatically generates unique default link aliases for each of your links.
2. Give the alias a name. Aliases must be uniquely named per email campaign variant or Canvas component.

You can also set an alias that will be used to reference a specific link when dealing with reporting or segmentation.

![Link Management page with four link aliases.](https://www.braze.com/docs/assets/img/link_aliasing_composer.png?f2c43a0aa2a35a4d686736e1b22f54ea)

**Note:**


Link aliasing is only supported in `href` attributes within HTML anchor tags where it is safe to append a query parameter. It's best practice to include a question mark (?) at the end of your link so that Braze can easily append the `lid` value. Without appending the `lid` value, Braze will not recognize the URL for link aliasing.



## Managing link aliases

To view all of your tracked link aliases, do the following:

1. Go to **Settings** > **Email Preferences** under **Workspace Settings**.
2. Select the **Link Aliasing Settings** tab.

Here, you can sort, search, and turn off tracking for link aliases.

![Tracked Link Aliases page that shows active and inactive link aliases associated with various campaigns.](https://www.braze.com/docs/assets/img/tracked_aliases.png?0d96912ea5f07a7b2403ac05d7fb3dbe)

**Tip:**


Use the [List link alias for campaign](https://www.braze.com/docs/get_campaign_link_alias/) and [List link alias for Canvas](https://www.braze.com/docs/get_canvas_link_alias/) endpoints to extract the `alias` set in each message variant in a campaign or an email-specific Canvas component.



Braze recommends evaluating the links within the email, adding link templates, and providing a naming convention that works for segmentation and reporting purposes. This helps you keep track of all links.

When link aliasing is turned on, messages, Content Blocks, and link templates are not modified. Any existing messages using link templates or Content Blocks will be the same. However, when you update a message, link alias markup will apply to all of the links, so you'll need to reapply the link templates for the links to be visible.

## How links are updated with link aliasing

The following tables provide examples of links in an email body, link aliasing results, and explanations for how the original link is updated with link aliasing.

### Permalink

**Logic:** Braze inserts a question mark (?) and adds the first query parameter into the URL.

| Link in email body    | Link with aliasing                     |
|-----------------------|----------------------------------------|
| `https://www.braze.com` | `https://www.braze.com?lid=slfdldtqdhdk` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Permalink" }

### Link with more query parameters

**Logic:** Braze detects other query parameters and appends `lid=` to the end of the URL.

| Link in email body                                            | Link with aliasing                                                             |
|---------------------------------------------------------------|--------------------------------------------------------------------------------|
| `https://www.braze.com?utm_campaign=retention&utm_source=email` | `https://www.braze.com?utm_campaign=retention&utm_source=email&lid=0goty30mviyz` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Link with more query parameters" }

### HTML link

**Logic:** Braze recognizes a link is a URL and already has a question mark (?) present, so the `lid` query parameter is appended after the question mark.

| Link in email body                                                | Link with aliasing                                                                |
|-------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `<a href="{{custom_attribute.{product_url}}}?">` | `<a href="{{custom_attribute.{product_url}}}?lid=ac7a548g5kl7">` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="HTML link" }

### Link with anchor

**Logic:** Braze expects the URL to use a standard structure where anchors (#) are present after a question mark (?). Because Braze reads from left to right, the question mark and `lid` value are appended before the anchor.

| Link in email body                               | Link with aliasing                                                |
|--------------------------------------------------|-------------------------------------------------------------------|
| `https://www.braze.com#bookmark1?utm_source=email` | `https://www.braze.com?lid=eqslgd5a9m3y#bookmark1?utm_source=email` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Link with anchor" }

### Link with anchor and capture tag

**Logic:** When using link aliasing with URLs that contain anchors (#), Braze expects the anchor to be placed after the query parameters. This means that the `lid` value must be appended **before** the anchor for proper tracking, and since Braze reads the URL from left to right, the question mark (?) and `lid` should come before the anchor.

| Link in email body                                                                        | Link with aliasing                                                                                           |
|-------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `<a href="https://www.braze.com/promotions#special-offer">Check out our special offer!</a>`  | `<a href="https://www.braze.com/promotions?lid={{link_alias}}#special-offer">Check out our special offer!</a>`  |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Link with anchor and capture tag" }

## Tracking link aliases

In the composer sidebar, select **Content** > **Link Management** (under **Design and Build**), and then select which aliases you want **tracked**. Tracked aliases are available in segmentation filters that reference link aliases (see [Segmentation filters](#segmentation-filters)). You can also send action-based messages or move users through a Canvas when they click a link alias in email—see [Action-based filters](#action-based-filters). The **tracked** setting does not change whether clicks on that link count in email performance reporting.

**Tip:**


To track link engagement metrics, make sure your link precedes with either HTTP or HTTPS. To turn off click tracking for specific links, refer to [Universal links and App Links](https://www.braze.com/docs/user_guide/channels/email/customize/universal_links_and_app_links/#turning-off-click-tracking-on-a-link-to-link-basis).



Braze allows you to select unlimited links to track, though you may only retarget users on the most recent links they have opened. User profiles include their 100 most recently clicked links. For example, if you track 500 links and a user clicks on all 500 of them, you can retarget or create segments based on the 100 most recently clicked links.

![The Link Management tab with two selected links.](https://www.braze.com/docs/assets/img/link_management_dnd.png?cf4a290c4e08c9b5aa7d57c23f20c221)

**Note:**


Braze only tracks up to the last 100 clicked link aliases at the profile level. 



### Action-based filters
 
You can create action-based messages targeting any link (tracked or not tracked) or retarget users based on whether they clicked an alias across any email campaign or Canvas component.

![Action-Based Options to target users who have clicked an alias in a Canvas component or interacted with a campaign.](https://www.braze.com/docs/assets/img/link_aliasing_action_based_filters.png?b0b5cd8c547e577641e1c18b1a3edb00)

### Segmentation filters

In Braze, if you have a link alias in your email and a user clicks on it, the event is recorded in the user's profile with the alias.

If you use the "Clicked Alias in Any Campaign or Canvas Step" segmentation filter and later decide to rename this link alias, the previous click data in the user profile is **not** updated, meaning it still shows as the previous link alias. So, if you target users based on the new link alias, it does not include the data from the previous link alias.

If you use the "Clicked Alias in Campaign" or "Clicked Alias in Canvas" segmentation filter, this filters your users by whether they clicked a specific alias in a specific campaign or Canvas. If multiple users share the same email address and the link alias is clicked, all other users who share the email address have their user profiles updated. These profiles are also updated by delivery and open events, not just click events. 

The following segmentation filters apply to click events that are tracked at the time the event is processed. This means untracked links won't remove existing data and tracking a link won't backfill the data. For more details, see [Segmentation filters](https://www.braze.com/docs/user_guide/audience/segments/segmentation_filters/).

#### Untracking links

Untracking a link won't reallocate existing segments with the filter to the untracked alias. The old data will remain on the user profiles until it’s replaced by newer data. 

Links in archived messages are automatically untracked. However, if archived messages are unarchived, the links will need to be tracked again. When link aliases are tracked, link reporting is indexed by the alias instead of top-level domains or full URLs.

To view all of the links in your email campaign and their respective total clicks, go to **Message Analytics** > **Email Performance** > **Preview & Heatmap**, and select the **Show Heatmap** toggle.

![Link Table by Total Clicks panel with link aliases and their total clicks.](https://www.braze.com/docs/assets/img/link_alias_total_clicks.png?b6325da86880e914ca4402ab30e29a34){: style="max-width:60%;"}

### Email clicks event

If you export your engagement data with Currents, an email click event will be slightly different if you have link aliasing enabled. It will have two additional fields for the [email clicks event](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events#email-clicks-events/) when link aliasing is turned on: `link_id` and `link_alias`.

```json
// Email Click: users.messages.email.Click
{
  "id": (string) unique ID of this event,
  "user_id": (string) Braze user ID of the user,
  "external_user_id": (string) External ID of the user,
  "time": (int) 10-digit UTC time of the event in seconds since the epoch,
  "timezone": (string) IANA time zone of the user at the time of the event,
  "campaign_id": (string) ID of the campaign if from a campaign,
  "campaign_name": (string) name of the campaign,
  "message_variation_id": (string) ID of the message variation if from a campaign,
  "message_variation_name": (string) the name of the message variation if from a campaign,
  "canvas_id": (string) ID of the Canvas if from a Canvas,
  "canvas_name": (string) name of the Canvas,
  "canvas_variation_id": (string) ID of the Canvas variation the user is in if from a Canvas,
  "canvas_variation_name": (string) name of the Canvas variation the user is in if from a Canvas,
  "canvas_step_id": (string) ID of the step for this message if from a Canvas,
  "canvas_step_name": (string) name of the step for this message if from a Canvas,
  "send_id": (string) ID of the message if specified for the campaign (See Send Identifier under API Identifier Types),
  "dispatch_id": (string) ID of the message dispatch (unique ID for each 'transmission' sent from the Braze platform). Users who are sent a schedule message get the same dispatch_id. Action-based or API-triggered messages get a unique dispatch_id per user.,
  "email_address": (string) email address for this event,
  "url": (string) the URL that was clicked (Email Click events only),
  "user_agent": (string) description of the user's system and browser for the event (Email Click and Open events only),
  "ip_pool": (string) IP pool used for message sending,
  "link_id": (string) unique value generated by Braze for the URL,
  "link_alias": (string) alias name set when the message was sent
}
```

**Update:**


The behavior for `dispatch_id` differs between Canvas and campaigns because Braze treats Canvas steps (except for Entry Steps, which can be scheduled) as triggered events, even when they are "scheduled". Learn more about [`dispatch_id` behavior](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/dispatch_id/) in Canvas and campaigns.

_Update noted in August 2019._



## Link aliasing in Content Blocks

New Content Blocks will have their links modified where Braze will append a `lid=` to each link where applicable. This placeholder value is resolved when inserted into an email message variant.

To modify the links within existing Content Blocks that were created before Braze enabled link aliasing, duplicate the existing Content Blocks, then modify the links within the duplicated Content Blocks.

When a Content Block without a `lid` value is inserted into a new message, the links from that Content Block are not tracked with an alias. When a new Content Block is inserted into an "old" message variant, the links from that message variant will be recognized by link aliasing. Links from the Content Block are also recognized. However, "old" Content Blocks cannot nest "new" Content Blocks.

**Tip:**


For Content Blocks, Braze recommends creating copies of existing Content Blocks to use in new messages. This can be done by bulk duplicating to prevent scenarios where you might reference a Content Block that has not been enabled for link aliasing in a new message.



## Link aliasing for URLs generated by Liquid

For URLs that are generated by Liquid (for example, `assign` in the HTML, values pulled from a Content Block, or Liquid in a custom attribute), Braze needs a clear place to insert the `lid` query parameter. In most cases, when Liquid remains in the URL, Braze does not infer whether to start a new query string with `?` or join an existing query with `&` unless you add that delimiter yourself.

Do the following:

- If the URL does **not** already include a query string, append `?` after the Liquid (for example, `?`).
- If the URL **already** includes `?` and query parameters, append `&` after the Liquid (for example, `&`).

**Note:**


When you use [link templates](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/link_template/) with Liquid-generated URLs, Braze may conservatively normalize the rendered URL after Liquid runs when it contains exactly two `?` characters used as query separators. The second `?` may be rewritten to `&` so Braze changes as little of the URL as possible. <br><br>Braze does not try to fix every duplicate-`?` pattern, and handling of more complex URLs stays intentionally limited. Add the correct `?` or `&` in your markup first, and treat any normalization as a limited safeguard—not a substitute for well-formed URLs or for getting links recognized in **Link Management** when no delimiter is present.



Without a trailing `?` or `&` (or another supported insertion point), link aliasing does not recognize the URL, **Link Management** does not list it, and link templates do not apply.

### URL fragments (`#`) and tracking parameters

The fragment (`#` and everything after it) is not sent to the server on a normal link request. Braze inserts `lid` into the query string, which must appear before the `#`. If your `href` has Liquid and a `#` fragment but no `?` or `&` before the `#`, Braze cannot safely append `lid`, so the link may not appear in **Link Management** or track as a link alias.

This is especially common in the drag-and-drop editor when a button URL mixes Liquid with a hash-based pattern (for example, a static path, then `#`, then additional key-value pairs). In that case, add `?` immediately before the `#` so the query string (including `lid`) is parsed before the fragment.


```text
https://example.com/campaign/to/abc123?#user_id={{${user_id}}}&source=email
```


In the previous example, the `?` before `#` gives Braze a query segment to append `lid`. Without it, the link may not appear in **Link Management**.

### Drag-and-drop editor considerations

In the drag-and-drop editor, fields that hold a link (such as a button **URL**) validate the underlying `href` before Liquid runs. Spaces, line breaks, and other characters that are not URL-safe can cause unexpected behavior when Braze appends link templates or link aliasing parameters. When you need branching Liquid for the destination, set the URL in an HTML block (see the following section) and reference a single variable in the drag-and-drop URL field instead of putting complex Liquid directly in that field.

### Content Block example


If a Content Block contains a link such as `https://www.braze.com/{{custom_attribute.${offer_id}}}` with no trailing `?` or `&`, Braze does not know where to append `lid`, so the link is not picked up for **Link Management**. Add `?` or `&` at the end of the URL in the Content Block (depending on whether a query string already exists), save the Content Block, and the link can be recognized.


### Reporting when the URL varies per user

Each distinct `href` in the message maps to **one** link ID and one link alias for **Link Management** and alias-based reporting. When link aliases are tracked, in-dashboard email reporting is indexed by the alias rather than by every possible resolved URL.

Use the following approaches in Braze first:

- **Campaign and Canvas email analytics:** Review aggregate clicks by link from **Message Analytics** > **Email Performance** > **Preview & Heatmap** with **Show Heatmap** turned on, as described in [Untracking links](#untracking-links).
- **Per-recipient clicks in Query Builder:** Run the **Email URLs clicked** [Query Builder template](https://www.braze.com/docs/user_guide/analytics/reports/query_builder/query_templates/#email-templates) for a campaign or Canvas. The template surfaces de-personalized links for summary counts; the CSV export includes the user IDs of clickers, the link they clicked, and a timestamp. (De-personalized URLs strip Liquid tags for the summary view; see the template description for details.)
- **Alias-level breakdowns in the composer:** If you need each destination (for example, each `offer_id`) to appear as its own row in **Link Management** and in alias-based reporting, use separate `href` values (and therefore separate aliases)—for example, distinct links per branch—instead of one link whose path changes per user.

If you also use streaming engagement exports, email click events include a **`url`** field; see [Email clicks event](#email-clicks-event) on this page for how that payload relates to link aliasing.

### Example

Use this pattern when the assigned URL has no query parameters:


```liquid
{% assign link1 = "https://www.braze1.com" %}

<a href="{{link1}}?">Visit Braze</a>
```


If the assigned URL already contains `?` and query parameters, append `&` after the Liquid instead of `?`:


```liquid
{% assign link_with_params = "https://www.braze1.com?campaign=test" %}

<a href="{{link_with_params}}&">Visit Braze</a>
```


### URLs with conditional Liquid

When conditional Liquid tags are used inside an `href` (for example, to set a URL with `{% if %}`, `{% elsif %}`, or `{% unless %}`), link aliasing does not apply to those links. This means these links do not appear in **Link Management** and do not receive a `lid` for click tracking.

**Recommended:** Build the final URL in an HTML block with `assign` (or `{% capture %}`), then reference that variable wherever you need the link. In the drag-and-drop editor, paste the variable into the button **URL** field with a trailing `?` or `&` as appropriate—for example, `?`.


```liquid
{% if {{custom_attribute.${account_tier}}} == "pro" %}
{% assign url = "https://example.com/pro/verify" %}
{% else %}
{% assign url = "https://example.com/retail/account" %}
{% endif %}
```


In the button **URL** field (drag-and-drop) or in HTML, point the `href` at the variable with a delimiter:


```liquid
<a href="{{ url }}?">Go to account</a>
```


Alternatively, you can capture the URL into one variable:


```liquid
{% capture url %}
  {%- if condition -%}
    https://example.com/url1
  {%- else -%}
    https://example.com/url2
  {%- endif -%}
{% endcapture %}

<a href="{{ url }}?">Go to account</a>
```


## Troubleshooting

### Destinations that don't accept the `lid` parameter

When you send a test message from the email editor, Braze appends `lid={{placeholder}}` to your links (the placeholder becomes a unique value at send time). If the destination site or API doesn't tolerate extra query parameters, the link can work in the editor, but fail when opened from the email.

Without the `lid` value, Braze doesn't treat the URL as link-aliased for tracking and segmentation. We recommend updating your backend or site so it ignores the `lid` query parameter when present. That preserves link aliasing, reporting, and segment use cases described in this article.

Alternatively, you can turn off link aliasing in the dashboard while you plan a backend change. Go to **Settings** > **Email Preferences** > **Link Aliasing Settings**. 

If you can't change your destination systems, contact [Braze Support](https://www.braze.com/docs/braze_support/) to disable link aliasing for your workspace. Note the following considerations if link aliasing is turned off for your workspace:

- New email messages and Content Blocks typically won't receive new link-alias markup (such as the `lid` query parameter).
- Existing messages that were created while link aliasing was on can still contain link-alias markup in the HTML. You may need to manually remove leftover `lid` parameters where you no longer want them.
- If you edit an existing campaign, Canvas email step, or Content Block, you may need to add link templates again so templated links display correctly.
- Click reporting for sends that went out while link aliasing was on may not line up cleanly with reporting after the feature is turned off.
- Segments that use link-alias-based filters (for example, **Clicked Alias** filters) can stop returning the audiences you expect.