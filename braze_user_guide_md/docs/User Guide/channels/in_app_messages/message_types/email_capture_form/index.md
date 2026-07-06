# Email capture form {#email-capture-form}

> Email capture messages let you prompt users of your site to submit their email address. Braze adds the address to their user profile for use in all your messaging campaigns.

This message type is available in the [traditional editor](https://www.braze.com/docs/user_guide/channels/in_app_messages/traditional/).

## How it works

When an end user enters their email address in this form, Braze adds the email address to their user profile.

- For [anonymous users](https://www.braze.com/docs/user_guide/data/unification/user_data/user_profile_lifecycle#anonymous-user-profiles) who don't yet have an account, the email address is stored on the anonymous user profile tied to the user's device.
- If an email address already exists on the user profile, the newly entered email address overwrites the existing email address.
- If the known user has an email address that is flagged as having [hard bounced](https://www.braze.com/docs/user_guide/channels/email/reporting/analytics_glossary/#hard-bounce), Braze checks whether the newly entered email address differs from the address on their Braze profile. If the provided email address is different, Braze updates the email address and removes the hard bounce status.
- If a user enters an invalid email address, they see the error message: "Please enter a valid email."
    - Invalid email addresses: 
        - `example`
        - `example@`
        - `@gmail.com`
        - `example@gmail`
    - Valid email addresses: 
        - `example@gmail.com`
        - `example@gnail.com` (with a typo)
    - For more information on email validation in Braze, refer to [Email technical guidelines and notes](https://www.braze.com/docs/user_guide/channels/email/email_setup/email_validation/).

**More on identified versus anonymous users**



The email capture form sets the email address on the currently active user profile in Braze. Behavior differs based on whether the user is identified (logged in, `changeUser` called) or not.

If an anonymous user enters their email in the form and submits it, Braze adds the email address to their profile. If `changeUser` is called later on in their web journey and a new `external_id` is assigned (such as when a new user registers with the service), all anonymous user profile data is merged including the email address.

If `changeUser` is called with an existing `external_id`, the anonymous user profile is orphaned and [specific user profile data fields](https://www.braze.com/docs/api/endpoints/user_data/post_users_merge/#merge_updates-behavior) that do not already exist on the identified user are merged, but any fields that do already exist are lost, including the email address.

For more information, refer to the [User profile lifecycle](https://www.braze.com/docs/user_guide/data/unification/user_data/user_profile_lifecycle/).




## Step 1: Create an in-app message campaign

To navigate to this option, you must create an in-app messaging campaign. From there, depending on your use case, set **Send To** to either **Web Browsers**, **Mobile Apps**, or **Both Mobile Apps & Web Browsers**, then select **Email Capture Form** as your **Message Type**.

**Note:**


**Targeting web users?** <br>To enable HTML in-app messages through the Web SDK, you must supply the `allowUserSuppliedJavascript` initialization option to Braze, for example, `braze.initialize('YOUR-API_KEY', {allowUserSuppliedJavascript: true})`. This is for security reasons since HTML in-app messages can execute JavaScript, so we require a site maintainer to enable them.



## Step 2: Customize the form {#customizable-features}

Next, customize your form as needed. Customize the following features for your email capture form:

- Header, body, and submit button text
- An optional image
- An optional "Terms of Service" link
- Different colors for the header and body text, buttons, and background
- Key-value pairs
- Style for header and body text, buttons, button border color, background, and overlay
- Submit button
    - Note that the submit button appears only after the user enters a valid email address. This helps you collect complete email addresses.

![Composer for email capture form.](https://www.braze.com/docs/assets/img/email_capture.png?55676feb205f00f5cf6eca6e76cad3e6)

If you need to make further customization, choose **Custom Code** for your **Message Type**. Use this [email capture modal template](https://github.com/braze-inc/in-app-message-templates/tree/master/braze-templates/5-email-capture-modal) from the [Braze Templates](https://github.com/braze-inc/in-app-message-templates/tree/master/braze-templates) GitHub repository as your starter code.

## Step 3: Set your entry audience

If you’re using an in-app message to capture user emails, you may want to limit the audience to users who haven’t already provided this information.

- **To target users without an email address:** Use the filter `Email Available` is `false`. This makes the form only appear to users who don’t have an email on file, helping you avoid redundant prompts for known users.
- **To target anonymous users without external IDs:** Use the filter `External User ID` `is blank`. This is useful when you want to identify users who haven’t been authenticated or registered yet.

You can also combine the two filters using `AND` logic, if desired. This makes the form only appear to users who are missing both an email address and an external user ID—ideal for capturing new leads or prompting account creation.

## Step 4: Target users who filled out the form (optional)

After you've launched the email capture form and collected email addresses from your users, you can target users who filled out the form.

1. In any segment filter in Braze, select the filter `Clicked/Opened Campaign`.
2. From the dropdown, select `clicked in-app message button 1`.
3. Select your email capture form campaign.
