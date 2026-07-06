# LINE message types

> This article covers the LINE message types you can compose, including aspects and limitations.

When you compose a LINE message, you can drag-and-drop message types into the composer and then customize them.

![Message types panel with message types to drag into the composer editor, including text, image, rich message, and card-based message.](https://www.braze.com/docs/assets/img/line/line_message_types.png?177254fda08bca271af75c0bf6352816){: style="max-width:40%;"}

## Text

A LINE text message can contain up to 5,000 characters and include emojis and Liquid personalization.

Use cases include:
- Announce a limited-time promotion for clearance stock
- Send personalized birthday greetings with unique promotion cards
- Share quick updates about upcoming events

![A text message reminding the user not to forget about a Black Friday party and the potential to save up to 80% before midnight.](https://www.braze.com/docs/assets/img/line/line_text_message.png?daecaf807e6621b97d2f8e45d2610915){: style="max-width:40%;"}

## Image

A LINE image message can be added through the [media library](https://www.braze.com/docs/user_guide/messaging/design_and_edit/media_library/), a URL, or Liquid. These images are standalone and don't contain clickable links.

Use cases include:
- Showcase a vacation destination to inspire users to look into purchasing plane tickets
- Highlight end-of-season promotions to encourage users to stock up on next year's winter clothes with great deals
- Start a visual countdown to a storewide annual sale

![An image message promoting a toaster sale.](https://www.braze.com/docs/assets/img/line/line_image_message.png?f110c0b15531fc62f38e3355176f13fa){: style="max-width:40%;"}

### URL image

Use URL images for use cases that incorporate:
- Liquid dynamic images by including the Liquid in your image source attribute. For example, you can insert  `https://example.com/images/?imageBanner={{first_name}}`  as the image URL to include a user's first name in the image
- [Connected Content](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content/) by pulling images directly from your web server or publicly accessible APIs
- [Braze catalogs](https://www.braze.com/docs/user_guide/data/activation/catalogs/) by accessing images from imported CSV files and API endpoints

| **Specifications** | **Recommended properties** |
|--------------------------|----------------------------|
| Image file URL length | 2,000 characters maximum  |
| Image format          | PNG, JPEG             |
| File size     |  10&nbsp;MB maximum |
{: .reset-td-br-1 .reset-td-br-2 aria-label="URL image" }

## Rich messages (image map)

A LINE rich message is an image that contains one or more links that are opened by selecting specific areas on the image. Select a rich message templates to choose how the links are mapped onto the image.

Use cases include:
- Display a grid of newly arrived handbags with links to each bag's respective product page
- Present an interactive menu that starts an combo order by selecting an item
- Lay out multiple promotions for users to choose by selecting a grid square

![A six-square rich message with a photo of a black-and-white grid that users can tap to receive a random offer.](https://www.braze.com/docs/assets/img/line/line_rich_message.png?31b020077fe88a89692b5081529605da)

### Image map 

| **Specifications** | **Recommended properties** |
|--------------------------|----------------------------|
| Image file URL length | 2,000 characters maximum  |
| Image format          | PNG (can be transparent), JPEG             |
| Aspect ratio          | 1:1 (width:height)
| File size     |  10&nbsp;MB maximum |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Image map" }

### URI link 

| **Specifications** | **Recommended properties** |
|--------------------------|----------------------------|
| Character count      | 1,000 maximum |
| Schemes              | HTTP, HTTPS, LINE, tel |
{: .reset-td-br-1 .reset-td-br-2 aria-label="URI link" }

### Text 

A text rich message can contain up to 400 characters.

## Card-based (carousel)

A LINE card-based message allows users to scroll through multiple messages, like a carousel, and take action on the messages most relevant to them by selecting a card or a card's buttons.

Use cases include:
- Display promotions for specific menu items
- Highlight this season's best-selling jackets
- Present a sampling of cooking tools and gadgets that are included in a kit

![A card-based message with at least two cards that promote sandwiches in the composer editor.](https://www.braze.com/docs/assets/img/line/line_card_message.png?707577e0be709f738e2dadc1d5ceb291)

### Message

| **Specifications** | **Recommended properties** |
|--------------------------|----------------------------|
| Columns                  | 10 maximum |
| Aspect ratio             | Rectangle: 1.51:1 <br> Square: 1:1  |
| Title                    | 40 characters maximum
{: .reset-td-br-1 .reset-td-br-2 aria-label="Message" }


### Image

| **Specifications** | **Recommended properties** |
|--------------------------|----------------------------|
| Image URL                 | 2,000 characters maximum |
| Image format              | JPEG or PNG |
| Width                     | 1,024 pixels  |
| File size                 | 1 MB |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Image" }


### Text

| **Specifications** | **Recommended properties** |
|-------------------------|----------------------------|
| Characters              | 120 maximum (no image or title) <br> 60 maximum (message with an image or title)  |
| Actions                 | 3 maximum |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Text" }


