# API email preference center

> Setting up a preference center provides a one-stop shop for your users to edit and manage their notification preferences for your [email messaging](https://www.braze.com/docs/user_guide/channels/email/). This article includes steps for building an API-generated preference center, but you can also build a preference center using the [drag-and-drop editor](https://www.braze.com/docs/user_guide/audience/subscription_preferences/preference_center/dnd_preference_center/).

In the Braze dashboard, go to **Audience** > **Email Preference Centers**.

This is where you can manage and view each subscription group. Each subscription group you create is added to this preference center list. You can create multiple preference centers.

**Important:**


The preference center is intended to be used within the Braze email channel. The preference center links are dynamic based on each user and cannot be hosted externally.



## Create a preference center with API

By using the [Preference Center Braze endpoints](https://www.braze.com/docs/api/endpoints/preference_center), you can create a preference center, a website hosted by Braze, that can display your user's subscription state and subscription group statuses. Using HTML and CSS, your developer team can build the preference center using HTML and CSS so that the styling of the page matches your brand guidelines.

Using Liquid enables you to retrieve the names of your subscription groups, and each user's status. This way, Braze stores and retrieves this data when the page is loaded.

### Prerequisites

| Requirement | Description |
|---|---|
| Enabled preference center | Your Braze dashboard has permissions to use the preference center feature. |
| Valid workspace with an email, SMS, or WhatsApp subscription group | A working workspace with valid users and an email, SMS, or WhatsApp subscription group. |
| Valid user | A user with an email address and an external ID. |
| Generated API key with preference center permissions | In the Braze dashboard, go to **Settings** > **API Keys** to confirm that you have access to an API key with preference center permissions. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites" }

### Step 1: Use the Create preference center endpoint

Let's begin building a preference center using the [Create preference center endpoint](https://www.braze.com/docs/api/endpoints/preference_center/post_create_preference_center/). To customize your preference center, you can include HTML that aligns with your branding in the `preference_center_page_html` field and `confirmation_page_html` field.

The [Generate preference center URL endpoint](https://www.braze.com/docs/api/endpoints/preference_center/get_create_url_preference_center/) allows you to grab the preference center URL for a specific user outside of an email that is sent through Braze.

**Note:**


Braze renders `confirmation_page_html` in an iframe that uses a `data:` URL. Browsers treat `data:` URLs as opaque origins. As a result, scripts in that iframe can't load additional external resources, and navigating the parent window or communicating across frames from that page fails.<br><br>Instead, you can link to external content, such as a hosted survey URL, instead of embedding scripts. If you must embed a third-party tool and the vendor allows it, use an `<iframe>` whose `src` points to the tool's hosted HTTPS URL.



### Step 2: Include in your email campaign









































To place a link to the preference center in your emails, use the following Liquid tag in the desired place in your email, similar to the way you would insert unsubscribe URLs.


```liquid
{{preference_center.${kitchenerie_preference_center_example}}}
```


You can also use a combination of HTML that includes Liquid. For example, you can paste the following as the URL in either the HTML editor or drag-and-drop editor. This shows the basic preference center layout that lists all of the email subscription groups automatically. If you use [link aliasing](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/link_aliasing/), add a trailing question mark (`?`) after the Liquid tag so Braze can append tracking parameters.


```html
<a href="{{preference_center.${kitchenerie_preference_center_example}}}?">Edit your preferences</a>
```


The preference center has a checkbox that allows your users to unsubscribe from all emails. Note that you cannot save these preferences if sent as a test message.

**Important:**


The above Liquid tag only works when launching a campaign or Canvas. Sending a test email does not generate a valid link. To verify the preference center link, launch the message in a campaign targeting only your test profile.



#### Edit a preference center

You can edit and update your preference center by using the [Update preference center endpoint](https://www.braze.com/docs/api/endpoints/preference_center/put_update_preference_center/). 

#### Identify preference centers and details

To identify your preference centers, use the [View details for preference center endpoint](https://www.braze.com/docs/api/endpoints/preference_center/get_view_details_preference_center/) to return related information such as the last updated timestamp, the preference center ID, and more.

## Customize a preference center

Braze manages the subscription state updates from the preference center, which keeps the preference center in sync. However, you can also create and host your own preference center using the [subscription groups APIs](https://www.braze.com/docs/api/endpoints/subscription_groups/) with the following options.

### Option 1: Link with string query parameters

Use query string field-value pairs in the body of the URL to pass the user ID and email category to the page so users only need to confirm their choice to unsubscribe. This option is good for those who store a user identifier in a hashed format and do not already have a subscription center.

For this option, each email category requires its own specific unsubscribe link:<br>
`http://mycompany.com/query-string-form-fill?field_id=John&field_category=offers`

**Tip:**


It is also possible to hash the user's external ID at the point of send using a Liquid filter. This will convert the `user_id` to an MD5 hash value, for example:

```liquid
{% assign my_string = ${user_id} | md5 %}
My encoded string is: {{my_string}}
```




### Option 2: Authenticate with JSON web token

Use a [JSON web token](https://auth0.com/learn/json-web-tokens/) to authenticate users to a part of your web server (for example, account preferences) that is normally behind a layer of authentication such as username and password login. 

This approach does not require query string value-pairs embedded in the URL as these can be passed in the JSON web token's payload, for example:

```json
{
    "user_id": "1234567890",
    "name": "John Doe",
    "category": "offers"
}
```

## Frequently asked questions

### I haven't created a preference center. Why am I seeing "PreferenceCenterBrazeDefault" on my dashboard?

This is used to render the preference center when legacy Liquid `${preference_center_url}` is used, meaning Canvas steps or templates that reference either `${preference_center_url}` or `preference_center.${PreferenceCenterBrazeDefault}` won't work. This also applies to previously sent messages that included the legacy Liquid or "PreferenceCenterBrazeDefault" as part of the message. 

If you reference `${preference_center_url}` in a new message again, a preference center named "PreferenceCenterBrazeDefault" will be created again.

### Do preference centers support multiple languages?

No. However, you can leverage Liquid when writing the HTML for custom opt-in and opt-out pages. If you're using dynamic links to manage unsubscribes, this is a single link. 

For example, if you're tracking the unsubscribe rate for Spanish-speaking users, you would need to either use separate campaigns or leverage analytics around Currents (such as looking at when a user unsubscribes and checking the preferred language of that user).

As another example, for tracking unsubscribe rates for Spanish-speaking users, you could add a query parameter string like `?Spanish=true` to the unsubscribe URL if the user's language is Spanish and use a regular unsubscribe link otherwise:


```liquid
{% if ${language} == 'spanish' %} "${unsubscribe_url}?spanish=true"
{% else %}
${unsubscribe_url}
{% endif %}
```


Then, through Currents, you could identify which users speak Spanish and how many click events there were for that unsubscribe link.

### Are both unsubscribe links and email preference centers required for sending?

No. If you see the message "Your Email Body does not include an unsubscribe link" when composing an email campaign, this warning is expected if your unsubscribe link is in a Content Block.

### How do I update the default browser icon?

By default, the icon next to the browser tab name (favicon) uses the Braze logo. To add a custom favicon, you set it via the `links-tags` attribute in your Create or Update [Preference Center API call](https://www.braze.com/docs/api/endpoints/preference_center). Braze then injects the `<link rel="icon" ...>` tag into the hosted page for you.


```
{
  "name": "MyPreferenceCenter",
  "preference_center_title": "Email Preferences",
  "preference_center_page_html": "<!doctype html> ...",
  "confirmation_page_html": "<!doctype html> ...",
  "state": "active",
  "options": {
    "links-tags": [
      {
        "rel": "icon",
        "type": "image/png",
        "sizes": "32x32",
        "href": "https://yourcdn.com/path/to/favicon-32x32.png"
      },
      {
        "rel": "shortcut icon",
        "type": "image/x-icon",
        "href": "https://yourcdn.com/path/to/favicon.ico"
      },
      {
        "rel": "apple-touch-icon",
        "sizes": "180x180",
        "href": "https://yourcdn.com/path/to/apple-touch-icon.png"
      }
    ]
  }
}
```

