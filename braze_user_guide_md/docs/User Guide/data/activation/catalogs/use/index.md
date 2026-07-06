# Using catalogs

> After creating a catalog, you can reference non-user data in your Braze campaigns through [Liquid](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/). You can use catalogs in all of your messaging channels, including anywhere in the drag-and-drop editor where Liquid is supported.

## Using catalogs in a message

The following video walks through how to use catalogs in a message.

<iframe width="560" height="315" src="https://www.youtube.com/embed/" title="Video" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="media_embed "></iframe>



### Step 1: Add personalization type {#step-one-personalization}

In the message composer of your choice, select the <i class="fas fa-plus-circle"></i> plus icon to open the **Add Personalization** modal and select **Catalog Items** for the **Personalization type**. Then, select your catalog name. Using our previous example, we'll select the "Games" catalog.

![](https://www.braze.com/docs/assets/img_archive/use_catalog_personalization.png?362644459eb9e05831c96632c4c703fb)

We can immediately see the following Liquid preview:


```liquid
{% catalog_items Games %}
```


### Step 2: Select catalog items

Next, it's time to add your catalog items! Using the dropdown, select the catalog items and the information to display. This information corresponds to the columns in your uploaded CSV file used to generate your catalog.

For example, to reference the title and price of our Tales game, we could select the `id` for Tales (1234) as the catalog item and request `title` and `price` for the displayed information.


```liquid
{% catalog_items Games 1234 %}
 
Get {{ items[0].title }} for just {{ items[0].price }}!
```


This renders as the following:

> Get Tales for just 7.49!

## Exporting catalogs

There are two ways you can export catalogs from the dashboard: 

- Hover over the catalog row in the **Catalogs** section. Then, select the **Export catalog** button.
- Select your catalog. Then, select the **Export catalog** button in the **Preview** tab of the catalog.

You'll receive an email to download the CSV file after initiating the export. You'll have up to four hours to retrieve this file.

## Additional use cases

### Multiple items

You aren't limited to one item in a message. Use the **Add Personalization** modal to add up to three catalog items at a time. To add more, select **Add Personalization** again in the composer and select additional catalog items and information to display.

Check out this example where we add the `id` of three games, Tales, Teslagrad, and Acaratus, for **Catalog Items** and select `title` for **Information to Display**.

![](https://www.braze.com/docs/assets/img_archive/catalog_multiple_items.png?fc8380c2670e9d911306fcbdf7429824){: style="max-width:70%" }

We can further personalize our message by adding some text around our Liquid:


```liquid
Get the ultimate trio {% catalog_items Games 1234 1235 1236 %}
{{ items[0].title }}, {{ items[1].title }}, and {{ items[2].title }} today!
```


This returns as the following:

```Get the ultimate trio Tales, Teslagrad, and Acaratus today!```

**Tip:**


Check out [selections](https://www.braze.com/docs/user_guide/data/activation/catalogs/selections/) to create groups of data for more personalized messaging!



### Using Liquid `if` statements

You can use catalog items to create conditional statements. For example, you can trigger a certain message to display when a specific item is selected in your campaign. You must declare the catalog (and, if applicable, the selection) before referencing `items` in an `if` statement.

#### With catalog items


```liquid
{% catalog_items Games 1234 %}
{% if items[0].on_sale == true %}
  {{ items[0].title }} is on sale! Get it for {{ items[0].price }}.
{% else %}
  Check out {{ items[0].title }} at full price.
{% endif %}
```


In this example, the `catalog_items` tag fetches item `1234` from the `Games` catalog, and then the `if` statement checks the `on_sale` field to display different messages.

#### With catalog selections


```liquid
{% catalog_selection_items item-list selections %} 
{% if items[0].venue_name.size > 10 %}
Message if the venue name's size is more than 10 characters. 
{% elsif items[0].venue_name.size <= 10 %}
Message if the venue name's size is 10 characters or fewer. 
{% else %} 
{% abort_message('no venue_name') %} 
{% endif %}
```


In this example, different messages display based on whether the `venue_name` field has more or fewer than 10 characters. If `venue_name` is blank, the message is aborted.

**Tip:**


To avoid Liquid syntax errors, select the **+** plus button in the message composer to insert catalog Liquid tags automatically.



### Using images {#using-images}

You can also reference images in the catalog to use in your messaging. To do so, use the `catalogs` tag and `item` object in the Liquid field for images.

For example, to add the `image_link` from our Games catalog to our promotional message for Tales, select the `id` for the **Catalog Items** field and `image_link` for the **Information to Display** field. This adds the following Liquid tags to our image field:


```liquid
{% catalog_items Games 1234 %}

{{ items[0].image_link }}
```


![Content Card composer with catalog Liquid tag used in the image field.](https://www.braze.com/docs/assets/img_archive/catalog_image_link1.png?689e837a65a865e1b3e4895665630725)

Here's what this looks like when the Liquid is rendered:

![Example Content Card with catalog Liquid tags rendered.](https://www.braze.com/docs/assets/img_archive/catalog_image_link2.png?29be11dbf7cb2a86f7c10c245e9fe659){: style="max-width:50%" }

**Important:**


In **HTML** channels such as email, avoid extra spaces or line breaks between the closing `{% catalog_items ... %}` tag and the Liquid that prints the image URL (for example, `{{ items[0].image_link }}`). Extra whitespace in the template can prevent the image URL from resolving correctly in the rendered message. Keep the URL expression immediately adjacent to the catalog tag, as in: `<img src="{% catalog_items Games 1234 %}{{ items[0].image_link }}">`.



### Templating catalog items

You can also use templating to dynamically pull catalog items based on custom attributes. For example, let's say a user has the custom attribute `wishlist`, which contains an array of game IDs from your catalog.

```json
{
    "attributes": [
        {
            "external_id": "user_id",
            "wishlist": ["1234", "1235"]
        }
    ]
}
```

**Note:**


JSON objects in catalogs are only ingested through the API. You can't upload a JSON object using a CSV file.



Using Liquid templating, you can dynamically pull out the wishlist IDs and then use them in your message. To do so, [assign a variable](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/using_liquid#assigning-variables) to your custom attribute, then use the **Add Personalization** modal to pull a specific item from the array. Variables referenced as the catalog item ID must be wrapped in curly brackets to be referenced properly, such as ``.

**Tip:**


Remember, arrays start at `0`, not `1`.



For example, to let a user know that Tales (an item in our catalog that they've wished for) is on sale, we can add the following to our message composer:


```liquid
{% assign wishlist = {{custom_attribute.${wishlist}}}%}
{% catalog_items Games {{ wishlist[0] }} %}

Get {{ items[0].title }} now for {{ items[0].price }}!
```


Which will display as the following:
> Get Tales now for just 7.49!

With templating, you can render a different catalog item for each user based on their individual custom attributes, event properties, or any other templatable field.

### Uploading a CSV

You can upload a CSV of new catalog items to add or catalog items to update. To delete a list of items, you can upload a CSV of item IDs to delete them.

### Using Liquid

You can also manually piece together catalogs with Liquid logic. However, note that if you type in an ID that doesn't exist, Braze will still return an items array without objects. We recommend that you include error handling, such as checking the size of the array and using an `if` statement to account for an empty array case.

#### Templating catalog items including Liquid

Similar to [Connected Content](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content/), you must use the `:rerender` flag in a Liquid tag to render a catalog item's Liquid content. Note that the `:rerender` flag is only one level deep, meaning it won't apply to any nested Liquid tag calls.

If a catalog item contains user profile fields (within a Liquid personalization tag), these values must be defined in Liquid earlier in the message and before the templating in order to render the Liquid properly. If the `:rerender` flag isn't provided, it will render the raw Liquid content.

For example, if a catalog named "Messages" has an item with this Liquid:

![](https://www.braze.com/docs/assets/img_archive/catalog_liquid_templating.png?ebfa424c2ffa9b438966e3656737ba8f){: style="max-width:80%;"}

To render the following Liquid content:


```liquid
Hi ${first_name},

{% catalog_items Messages greet_msg :rerender %}
{{ items[0].Welcome_Message }}
```


This will display as the following:


```
Hi Peter,

Welcome to our store, Peter!
```


**Note:**


Catalog Liquid tags can't be used recursively inside catalogs.



## Structuring your catalog data

When planning how to structure your catalog data, start from your intended use case and design the catalog around it. Each row in the catalog represents an item (with a unique `id`). The columns should contain the attributes for that item, such as URLs, description copy, image URLs, price, rating, size, or color.

### When to use standard catalog calls

With standard catalog calls, you match a value against the `id` column. By inserting a custom attribute or event property (as an ID string) into the catalog Liquid tag, you can pull multiple attributes for a single item into your message. Common use cases include:

- Recently viewed product or service
- Wishlist items
- Deals by location
- Product purchased
- Lifecycle stage content
- Most recently searched product or service

### When to use catalog selections

[Catalog selections](https://www.braze.com/docs/user_guide/data/activation/catalogs/selections/) let you filter across any column in your catalog and return up to 50 matching items. By inserting custom attributes or event properties into the selection filters, the results are personalized for each user. Common use cases include:

- Items where category equals a user's preference
- Items matching a user's preferred brand, cuisine, or size
- Subscription type or loyalty tier content
- Products within a user's average order value range

The key difference is that standard catalog calls look up a single known item by `id`, while catalog selections query across the catalog and return multiple items that match your filter criteria.

[1]: /docs/assets/img_archive/use_catalog_personalization.png?362644459eb9e05831c96632c4c703fb
[2]: /docs/assets/img_archive/catalog_multiple_items.png?fc8380c2670e9d911306fcbdf7429824
