# [![Braze Learning course](https://www.braze.com/docs/assets/img/bl_icon3.png?5f6465f63e399dec15d7020b6f4d2452)](https://learning.braze.com/the-braze-support-portal/){: style="float:right;width:120px;border:0;" class="noimgborder"}Braze Support

> Learn how to access the Braze Support Portal, submit and track support cases, and provide the information needed for efficient troubleshooting.

## Access the Support Portal

To contact the Braze Support team, navigate to the Braze dashboard and select **Support**. The menu offers two options:

- **Get help with Operator** opens BrazeAI Operator<sup>TM</sup>, which can troubleshoot your issue on the spot using context from your conversation and the current screen. If Operator is unable to resolve your issue, you can ask it to draft a support ticket based on your conversation. For more information, see [file support tickets with BrazeAI Operator](https://www.braze.com/docs/user_guide/brazeai/operator/support_tickets).
- **Get help** takes you directly to the Braze Support Portal (if you are a designated support contact) or our standard support form, where you can submit and track cases. If you're unsure whether you are a Braze support contact, contact your company's Braze administrator, Braze success manager, or account owner.

![The "Support" dropdown showing "Get help with Operator" and "Get help" options.](https://www.braze.com/docs/assets/img_archive/get_help.png?3414bae38e8e3849be6f6a4701adbad4){: style="max-width:50%;"}


## Adding designated support contacts

Designated support contacts can access all support cases for your company, regardless of who submitted them. You can set users as designated support contacts directly from the **Edit user** page. 

1. Go to **Settings** > **Company Users**, then search for the user by their name or email address.
2. Either select the user name or hover over the user name row to display a menu. 
3. In the menu, select **Edit** to be redirected to the **Edit user** page.
4. Check the checkbox for **Set this user as a Designated Support Contact for Braze Support Portal**.

![The checkbox for setting a user as a designated support contact.](https://www.braze.com/docs/assets/img_archive/designated_support_contact.png?10b8f12100a26c617b7ea7c1f3ecaa4e){: style="max-width:70%;"}

### Gaining access

After a user is designated as a support contact, the Braze Support Portal sends that user a welcome email with instructions to set up their access.

## View cases from your company

If you're a designated support contact, use the **My Org's** filter views in the support portal to view all cases submitted by users in your company. Cases from all submission channels (BrazeAI Operator<sup>TM</sup>, web form, email, or portal) are included in these views.

## Provide developer console screenshots

When communicating with support, you may find you need to access your developer console to provide additional information:
- Chrome
  1. Right-click on the webpage and select **Inspect**.
  2. Select the **Console** tab in the window that opens.
  3. Take a screenshot of the console tab.<br><br>
- Firefox
  1. Right-click on the webpage and select **Inspect Element**.
  2. Select the **Console** tab in the window that opens.
  3. Take a screenshot of the console tab.<br><br>
- Safari
  1. Go to Safari in the menu bar at the top of your screen and then select **Preferences**.
  2. Select **Advanced** and then check the checkbox next to **Show Develop menu in menu bar**. You can then exit the window.
  3. Right-click on the webpage and select **Inspect Element**.
  4. Select the **Console** tab in the window that opens.
  5. Take a screenshot of the console tab.

## Best practices for submitting a support case

### Provide as much information as possible

The more insights you can offer, the better. Include specifics like the workspace, the URL to the campaign or segment, and any relevant external IDs. This can help us troubleshoot your issue more efficiently.

### Provide a sample of users

Share a sampling of users rather than the entire affected segment. Providing a smaller number of users helps us narrow our scope and speed up our investigations.

### Attach network logs (HAR logs)

If you contact Support, it'll be useful to have the impacted user collect network logs (HAR logs) from their browser while the issue occurs. This will display the network requests between the browser and the server for the individual components of a webpage, as well as the Braze dashboard the user is trying to open.

Have the affected user do the following:

1. Open their developer tools. If using Chrome, this can be done using the keyboard shortcut `option` + `⌘` + `J` (on macOS). If using Windows or Linux, this can be done using the shortcut `shift` + `CTRL` + `J`.
2. Select **Network** > **Fetch/XHR** or **XHR**.
3. Capture a screen recording or screenshot showing the **Name**, **Status**, **Size**, and **Time** for the elements.<br><br>![The "Fetch/XHR" tab in a Chrome browser.](https://www.braze.com/docs/assets/img/network_xhr.png?3ecb836430236b3373a729e850edbc8d){: style="max-width:60%;"}

Then, attach the user's recording or screenshot to the Support ticket. This information can help Support's investigation.

### Clarify expected versus actual behavior

Let us know what you were expecting and what actually happened. This can help us narrow down the possible causes of the issue.

### Attach relevant images

Consider attaching a screenshot to illustrate the problem. Providing these images can significantly aid our understanding of the issue and speed up the resolution process.

### Assess the impact

Select the appropriate severity level to help us assign the right resources to address the problem. 

**Important:**


Marking an issue as "Critical" means your production instance is down, and all work within Braze has stopped.



## Troubleshooting dashboard load issues

If the Braze dashboard isn't loading correctly, try the following before you contact Support:

1. Open the dashboard in a different browser or an incognito or private window.
2. [Clear your browser cache and cookies](https://www.braze.com/docs/user_guide/administer/personal/accessing_your_account/#clearing-your-browser-cache-and-cookies).
3. Disable ad blockers and browser extensions, then reload the dashboard.
4. If you use a VPN, disconnect and try again.

If your browser developer console shows `ERR_BLOCKED_BY_CLIENT`, an extension or ad blocker is blocking dashboard resources. Disable the blocker for your Braze dashboard URL and reload the page.

## Troubleshooting access

If you receive an error when logging into the Braze Support Portal, such as `Check your entry`, make sure you followed the link in your welcome email to set a password for the portal. If you've done that or were previously able to log into the portal, create a Support ticket.
