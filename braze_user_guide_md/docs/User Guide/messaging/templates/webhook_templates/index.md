# Create a webhook template

> As you build and customize your webhooks, you can create and leverage webhook templates for later use within the Braze platform. This way, you can consistently build a variety of webhooks across your different campaigns.

## Step 1: Go to the webhook template editor

In the Braze dashboard, go to **Content** > **Webhook**.

![The "Webhook Templates" page with predesigned and saved webhook templates.](https://www.braze.com/docs/assets/img_archive/webhook_template_campaign.png?4486c4ebec9e8ba572a969b0977f5aea)

## Step 2: Choose your template

From here, you can choose to create a new template, use one of the predesigned webhook templates, or edit an existing template.

For example, if you're using [LINE](https://www.braze.com/docs/user_guide/channels/line/) as a messaging channel, you can set up several webhooks using the predesigned templates for **LINE Carousel** or **LINE Image**.

## Step 3: Fill out template details

1. Give your webhook template a unique name.
2. (Optional) Add a template description to explain how this template is intended to be used.
3. Add [teams](https://www.braze.com/docs/user_guide/administer/global/user_management/teams/) and [tags](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/tags/) as needed to help find and filter for your template.

## Step 4: Build your template

1. Enter the webhook URL.
2. Select the HTTP method.
3. Add a request body. This can be either **JSON Key/Value Pairs** or **Raw Text**.
4. (Optional) Add a request header. This may be required by your webhook destination.

![The "Compose" tab when creating a webhook template. Available fields are webhook URL, HTTP method, request body, and request headers. You can also add languages.](https://www.braze.com/docs/assets/img_archive/Webhook_template_test.png?c87609572f82662db7e492dc0d730d7a){: style="max-width:90%"}

## Step 5: Test your template

To see how your webhook looks before sending it to your users, you can send a test webhook using the **Test** tab. Here, you can select to preview the message as a random user, existing user, or custom user.

## Step 6: Save your template

Be sure to save your template by selecting **Save Template**. You're now ready to use this template in any campaign you choose.

**Note:**


Edits made to an existing template aren't reflected in campaigns that were created using previous versions of that template.



## Managing your templates

You can [duplicate and archive](https://www.braze.com/docs/user_guide/messaging/templates/managing_templates/) webhook templates to help better organize and manage your list of templates.

