# Dashboard tools for personalization

> Use Braze dashboard tools to insert Liquid personalization without writing every tag by hand. The **Add Personalization** flow builds the right syntax for you, and the Liquid editor helps you read and extend templates quickly.

For Liquid syntax rules, supported tags, and advanced patterns, refer to [Using Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/using_liquid/) and [Supported personalization tags](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/supported_personalization_tags/).

## Add Personalization in composers and settings

The **Add Personalization** tool appears near templated text fields across the dashboard, including:

- **Campaign and Canvas steps** for channels that support Liquid in the body or headers (for example, email, push, SMS, in-app messages, Content Cards, and webhooks).
- **Drag-and-drop editors**, where the control is often in the block or editor toolbar. For example, in drag-and-drop in-app messages you can select **Add Personalization**, choose a personalization type, and then place the generated snippet into your content before previewing under **Preview & Test**. For more channel-specific notes, see your channel’s drag-and-drop or composer article (such as [In-app message style settings](https://www.braze.com/docs/user_guide/channels/in_app_messages/customize/style_settings/#adding-liquid) or [Create an email with drag-and-drop](https://www.braze.com/docs/user_guide/channels/email/drag_and_drop/)).
- **Specialized composers** that expose a personalization picker—for example, [item recommendations](https://www.braze.com/docs/user_guide/brazeai/item_recommendations/using_recommendations/) use **Personalization Type** options like **Item Recommendation** inside the same style of window.
- **Landing pages**, where you can add Liquid personalization in the drag-and-drop editor or in page and block settings. For details, see [Personalize landing pages](https://www.braze.com/docs/user_guide/messaging/landing_pages/personalize_landing_pages/).

## Insert pre-formatted variables and defaults

The **Add Personalization** tool helps you insert Liquid with optional default values so empty profile data doesn’t break your copy.

![The Add Personalization modal that appears after selecting insert personalization. The modal has fields for personalization type, attribute, optional default value, and displays a preview of the Liquid syntax.](https://www.braze.com/docs/assets/img_archive/insert_liquid_var_arrow.png?b9fe52fd1f178d3fe9c1a3bca45eec73){: style="max-width:90%;"}

The tool inserts Liquid with your specified default value at the point where your cursor was. The insertion point is also specified by the preview box, which has the before and after text. If a block of text is highlighted, the highlighted text will be replaced.

![A GIF of the Add Personalization modal that shows the user inserting "fellow traveler" as a default value, and the modal replacing the highlighted text "name" in the composer with the Liquid snippet.](https://www.braze.com/docs/assets/img_archive/insert_var_shot.gif?498223ac1dd3a3dab9e1da5eccdf9626)

You can still type `{{` in many composers to use autocomplete, or paste tags from elsewhere; for details, see [Inserting tags](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/using_liquid/#inserting-tags) in **Using Liquid**.

### Assign variables


Some operations in Liquid require you to store the value you want to manipulate as a variable. This is often the case if your Liquid statement includes multiple attributes, event properties, or filters.

For example, let's say you want to add two custom data integers together. 

#### Incorrect Liquid example

You can't use:

```liquid
{{custom_attribute.${one}}} | plus: {{custom_attribute.${two}}}
```

This Liquid doesn't work because you can't reference multiple attributes in one line; you need to assign a variable to at least one of these values before the math functions take place. Adding two custom attributes would require two lines of Liquid: one to assign the custom attribute to a variable, and one to perform the addition.

#### Correct Liquid example

You can use:

```liquid
{% assign value_one = {{custom_attribute.${one}}} %}
{% assign result = value_one | plus: {{custom_attribute.${two}}} %}
```

#### Tutorial: Using variables to calculate a balance

Let's calculate a user's current balance by adding their gift card balance and rewards balance:

First, use the `assign` tag to substitute the custom attribute of `current_rewards_balance` with the term "balance". This means that you now have a variable named `balance`, which you can manipulate.

```liquid
{% assign balance = {{custom_attribute.${current_rewards_balance}}} %}
```

Next, we'll use the `plus` filter to combine each user's gift card balance with their rewards balance, signified by `{{balance}}`.

```liquid
{% assign balance = {{custom_attribute.${current_rewards_balance}}} %}
You have ${{custom_attribute.${giftcard_balance} | plus: {{balance}}}} to spend!
```


**Tip:**


Find yourself assigning the same variables in every message? Instead of writing out the `assign` tag over and over again, you can save that tag as a Content Block and put it at the top of your message instead.<br><br>

1. [Create a Content Block](https://www.braze.com/docs/user_guide/messaging/design_and_edit/content_blocks/#create-a-content-block).
2. Give your Content Block a name (no spaces or special characters).
3. Select **Edit** at the bottom of the page.
4. Enter your `assign` tags.

As long as the Content Block is at the top of your message, every time the variable is inserted into your message as an object, it will refer to your chosen custom attribute!



## Liquid editor enhancements

These dashboard behaviors make Liquid easier to work with while you compose messages.

### Color labels

Each Liquid element corresponds to a color, allowing you to differentiate your Liquid at-a-glance in your Liquid editor.

![Diagram of various color labels for different Liquid elements.](https://www.braze.com/docs/assets/img/liquid_color_code.png?c13bd4ac2644a38a1f76388085343058)

### Predictive Liquid

You can also use predictive Liquid for custom attributes, attribute names, and more as you build your personalized messages.

![Braze recommending different Liquid attributes as more text is entered into a field.](https://www.braze.com/docs/assets/img/liquid_auto_complete.gif?195c23ff1c355ed59c63f74b5896e603){: style="max-width:70%;"}

## Next steps

- [Using Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/using_liquid/) — syntax, `assign`, conditionals, and filters in Braze
- [Setting default values](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/setting_default_values/) — defaults in Liquid beyond the modal
- [Filters](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/filters/) — format dates, math, strings, and more