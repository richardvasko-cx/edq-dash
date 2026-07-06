# Set up orchestration

> BrazeAI Decisioning Studio™ Go needs to connect to your Customer Engagement Platform (CEP) to orchestrate personalized communications. This article explains how to set up the integration for each supported CEP.

## Supported CEPs

Decisioning Studio Go supports the following Customer Engagement Platforms:

| CEP | Integration Type | Key Features |
|-----|-----------------|--------------|
| **Braze** | API-triggered campaigns | Native integration, real-time triggering |
| **Salesforce Marketing Cloud** | Journey Builder with API Events | SQL query automation, data extensions |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Supported CEPs" }

Select your CEP below to get started with the integration setup.




## Set up Braze integration

To integrate Decisioning Studio Go with Braze, you'll create an API key, configure an API-triggered campaign, and provide the necessary identifiers to the Decisioning Studio Go portal.

### Step 1: Create a REST API key

1. In the Braze dashboard, go to **Settings** > **APIs and Identifiers** > **API Keys**.
2. Select **Create API Key**.
3. Enter a name for your API key. An example is "DecisioningStudioGoEmail".
4. Select the permissions based on the following categories:
    - **User Data:** select `users.track`, `users.delete`, `users.export.ids`, `users.export.segment`
    - **Messages:** select `messages.send`
    - **Campaigns:** select all listed permissions
    - **Canvas:** select all listed permissions
    - **Segments:** select all listed permissions
    - **Templates:** select all listed permissions

{: start="5"}
5. Select **Create API key**.
6. Copy the API key and paste it into your BrazeAI Decisioning Studio™ Go portal.

### Step 2: Locate your email display name

1. In the Braze dashboard, go to **Settings** > **Email Preferences**.
2. Locate the display name to be used with BrazeAI Decisioning Studio™ Go.
3. Copy and paste the **From Display Name** into the BrazeAI Decisioning Studio™ Go portal as the **Email Display Name**.
4. Copy and paste the associated email address into your BrazeAI Decisioning Studio™ Go portal as the **From email address**, which combines the local part and the domain.

### Step 3: Find your Braze URL and App ID

**To find your Braze URL:**
1. Go to the Braze dashboard.
2. In your browser window, your Braze URL starts with `https://` and ends with `braze.com`. An example Braze URL is `https://dashboard-01.braze.com`.

**To find your App ID (API Key):**

**Note:**


Braze offers app IDs (referred to as API keys in the Braze dashboard) that you can use for tracking purposes, such as to associate activity with a specific app in your workspace. If you use app IDs, BrazeAI Decisioning Studio™ Go supports associating an app ID with each experimenter.<br><br>If you do not use app IDs, you can enter any string of characters as a placeholder.



1. In the Braze dashboard, go to **Settings** > **App Settings**.
2. Go to the app you want to track.
3. Copy and paste the **API Key** into your BrazeAI Decisioning Studio™ Go portal.

### Step 4: Create an API-triggered campaign

1. In the Braze dashboard, go to **Messaging** > **Campaigns**.
2. Select **Create campaign**.
3. For your campaign type, select **API campaign**.
4. Enter a name for your campaign. An example is "Decisioning Studio Go Email".

![An API campaign named "Decisioning Studio Go Email".](https://www.braze.com/docs/assets/img/decisioning_studio_go/api_campaign_name.png?429baa3743dcb8c78bdd2596fd6786f8)

{: start="5"}
5. For your messaging channel, select **Email**.

![Option to select your messaging channel for API campaign.](https://www.braze.com/docs/assets/img/decisioning_studio_go/select_api_campaign.png?48ab7df187f54bda0809ea2f1e583966)

{: start="6"}
6. In **Additional Options**, select the **Allow users to become re-eligible to receive campaign** checkbox.
7. For the time to become re-eligible, enter **1** and select **Hours** from the dropdown.

![Re-eligibility for the API campaign selected.](https://www.braze.com/docs/assets/img/decisioning_studio_go/additional_options.png?db2f7a262ffe675bf4d75be42ff04f35)

{: start="8"}
8. Select **Save Campaign**.

### Step 5: Copy your campaign and message IDs

1. In your API campaign, copy the **Campaign ID**. Then, go to the BrazeAI Decisioning Studio™ Go portal and paste the **Campaign ID**.

![An example message variation ID to be copy and pasted.](https://www.braze.com/docs/assets/img/decisioning_studio_go/campaign_id.png?03dfdd036d3628004772b0a8e6c2aef6)

{: start="2"}
2. Copy the **Message Variation ID**. Then, go to the BrazeAI Decisioning Studio™ Go portal and paste the **Message Variation ID**.

### Step 6: Locate a test user ID

To test your integration, you'll need a user ID:

If your workspace uses [identifier field-level encryption](https://www.braze.com/docs/user_guide/data/infrastructure/field_level_encryption/), any new test user you create with the `/users/track` endpoint must follow the email requirements for encrypted workspaces. Send the `email` field as the Base64-encoded HMAC-SHA256 hash of the downcased email value, and send `email_encrypted` as the encrypted email value generated with your configured PII encryption keys.

1. In the Braze dashboard, go to **Audience** > **Search Users**.
2. Search for the user by their external user ID, user alias, email, phone number, or push token.
3. Copy the user ID to reference in your setup.

![Example user profile from locating a user with their ID.](https://www.braze.com/docs/assets/img/decisioning_studio_go/user_id.png?7a9866de961524ea6dfa779590993b4d)




## Set up SFMC integration

To integrate Decisioning Studio Go with Salesforce Marketing Cloud, you'll set up an app package, create a data query automation, and build a Journey to handle triggered sends.

### Part 1: Set up an SFMC app package

1. Go to your Marketing Cloud home page.
2. Open the menu in the global header and select **Setup**.
3. Go to **Apps** under **Platform Tools** in the side panel navigation, then select **Installed Packages**.
4. Select **New** to create an app package.
5. Give the app package a name and description.

![An app package with the name "Experimenter 1 - Test 5".](https://www.braze.com/docs/assets/img/decisioning_studio_go/sfmc_app_package1.png?217ae37344a5df98573523eec03afb2e)

{: start="6"}
6. Select **Add Component**.
7. For the **Component Type**, select **API Integration**. Then, select **Next**.
8. For the **Integration Type**, select **Server-to-server**. Then, select **Next**.
9. Select the following recommended scopes for your app package only:
    - Channels > Email > Read, Write, Send
    - Channels > OTT > Read
    - Channels > Push > Read
    - Channels > SMS > Read
    - Channels > Social > Read
    - Channels > Web > Read
    - Assets > Documents and Images > Read, Write
    - Assets > Saved Content > Read, Write
    - Automation > Automations > Read, Write, Execute
    - Automation > Journeys > Read, Write, Execute, Activate/Stop/Pause/Send/Schedule
    - Contacts > Audiences > Read
    - Contacts > List and Subscribers > Read, Write
    - Cross Cloud Platform > Market Audience > View
    - Cross Cloud Platform > Market Audience Member > View
    - Cross Cloud Platform > Marketing Cloud Connect > Read
    - Data > Data Extensions > Read, Write
    - Data > File Locations > Read
    - Data > Tracking Events > Read, Write
    - Event notifications > Callbacks > Read
    - Event notifications > Subscriptions > Read

**Show image of recommended scopes**



![The recommended scopes for Salesforce Marketing Cloud app package.](https://www.braze.com/docs/assets/img/decisioning_studio_go/app_package_scopes.png?a5ac9fa88075712d473d62ce25a00359)




{: start="10"}
10. Select **Save**.
11. Copy and paste the following fields into the BrazeAI Decisioning Studio™ Go portal: **Client Id**, **Client Secret**, **Authentication Base URI**, **REST Base URI**, **SOAP Base URI**.

### Part 2: Set up a data query automation

#### Step 1: Create a new automation

1. From your Salesforce Marketing Cloud home, go to **Journey Builder** and select **Automation Studio**.

![Automation Studio option in Journey Builder navigation.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query13.png?d3d71d8bddb8bfe1668209b02d780a7b)

{: start="2"}
2. Select **New Automation**.
3. Drag and drop a **Schedule** node as the **Starting Source**.

!["Schedule" as the starting source of a Journey.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query14.png?a40f60bcffa9d39dd6d8eeac2e620341)

{: start="4"}
4. In the **Schedule** node, select **Configure**.
5. Set the following for the schedule:
    - **Start Date:** Tomorrow's calendar day
    - **Time:** **12:00 AM**
    - **Time Zone:** **(GMT-05:00) Eastern (US & Canada)**
6. For **Repeat**, select **Daily**.
7. Set this schedule to never end.
8. Select **Done** to save the schedule.

![An example schedule defined for January 25, 2024 at 12 am ET, to repeat every day.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query12.png?2159acbda0e4c81a15ac7fb708e9c3d2)

#### Step 2: Create your SQL queries

Next, create 2 SQL queries: a subscribers query and an engagement query. These queries allow BrazeAI Decisioning Studio™ Go to retrieve data to populate the audience and ingest engagement events.

**Subscribers query:**

1. Drag and drop an **SQL Query** into the canvas.
2. Select **Choose**.
3. Select **Create New Query Activity**.
4. Give the query a name and external key. We recommend using the suggested name and external key for the subscriber query provided in your BrazeAI Decisioning Studio™ Go portal.

![An example "OFE_Subscribers_query_Test5" and the external key.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query11.png?819e3eabea5a216ad6bc5a9b48591f9e)

{: start="5"}
5. Select **Next**.
6. In your BrazeAI Decisioning Studio™ Go portal, locate the System data SQL query under **Subscriber Query Resources**.
7. Copy and paste the query into the text box and select **Next**.

![An example query in the SQL Query section.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query10.png?d58bf5dc20202174cc0f76701751ca6b)

{: start="8"}
8. In your BrazeAI Decisioning Studio™ Go portal, in the **Resources to use** section, locate the external key of the target data extension. Then, paste it into the search bar to search.

![An external key pasted into the search bar](https://www.braze.com/docs/assets/img/decisioning_studio_go/query9.png?a67809d777060522c69109e9b312c3ae)

{: start="9"}
9. Select the data extension that matches the external key you searched for. The target data extension name is also provided in your BrazeAI Decisioning Studio™ Go portal to cross-reference. The **Data Extension** for the subscriber query should end in a `BASE_AUDIENCE_DATA` suffix.

![The data extension name that matches the example external key.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query8.png?626bc44cf11931ec8c8f7834b47fe735)

{: start="10"}
10. Select **Overwrite** then **Next**.

**Engagement query:**

1. Drag and drop an **SQL Query** into the canvas.

!["SQL Query" added as an activity in the Journey.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query7.png?84f95d1be08c0f2e8ebc834a2a8d6352)

{: start="2"}
2. Select **Choose**.
3. Select **Create New Query Activity**.
4. Give the query a name and external key. We recommend using the suggested name and external key for the engagement query provided in your BrazeAI Decisioning Studio™ Go portal.

![An example "OFE_Engagement_query" and the external key.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query6.png?1de21015047540c867d1c46c3c2e2e4d)

{: start="5"}
5. Select **Next**.
6. In your BrazeAI Decisioning Studio™ Go portal, locate the System data SQL query under **Engagement Query Resources**.
7. Copy and paste the query into the text box and select **Next**.

![An example query in the SQL Query section.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query5.png?f52e2e6e0d689df9f96f8ecaddd18a61)

{: start="8"}
8. Locate and select the target Data Extension for the Engagement Query specified in your BrazeAI Decisioning Studio™ Go portal.

**Tip:**


The target data extension name is also provided in your BrazeAI Decisioning Studio™ Go portal to cross-reference. Make sure you're looking at the target Data Extension for the Engagement Query. The **Data Extension** for the engagement query should end with an ENGAGEMENT_DATA suffix.



{: start="9"}
9. Select **Overwrite** then **Next**.

![The data extension name that matches the example external key.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query4.png?f322bcea635eebbc826d8bd40b45eb11)

#### Step 3: Run the automation

1. Give the automation a name and select **Save**.

![An example automation "OFE_Experimenter_Test5_Automation".](https://www.braze.com/docs/assets/img/decisioning_studio_go/query3.png?40c1ac6027697894f73f2fb92b56cb3b)

{: start="2"}
2. Next, select **Run Once** to confirm everything is working as expected.
3. Select both queries and select **Run**.

![An automation "OFE_Experimenter_Test5_Automation" with a list of selected SQL query activities to run.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query2.png?0d93d67252d5b5573a4172d9cdef86ba)

{: start="4"}
4. Select **Run Now**.

![A selected SQL Query activity.](https://www.braze.com/docs/assets/img/decisioning_studio_go/query1.png?b8533f08ac9301fcea9be3fd0ee19553)

Now, you can check to make sure the automation is running successfully. Contact Braze Support for further assistance if your automation isn't running as expected.

### Part 3: Create your SFMC Journey

#### Step 1: Set up the Journey

1. In Salesforce Marketing Cloud, go to **Journey Builder** > **Journey Builder**.
2. Select **Create New Journey**.
3. For your journey type, select **Multi-Step Journey**, then select **Create**.

![An API Event entry source connected to a Decision Split node and multiple Email nodes.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey1.png?323b21481d912f5ad98dfbbe86f6fe8d)

#### Step 2: Build the Journey

**Create an entry source:**

1. For your entry source, drag **API Event** to the Journey Builder.

!["API Event" selected as the entry source.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey2.png?2bbe527f7af1432a2d29918af8e30701)

{: start="2"}
2. In the **API Event**, select **Create an event**.

![The "create an event" option in the API Event.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey3.png?6dfcfa7f119cf92cbc76fa583d98ba32)

{: start="3"}
3. Select **Select Data Extension**. Locate and select the data extension that BrazeAI Decisioning Studio™ Go will be writing recommendations to.
4. Select **Summary** to save your changes.
5. Select **Done** to save the API event.

![API event summary.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey4.png?57c1b654e3c0f45f34d4e61aff4428b1){: style="max-width:80%;"}

**Add a Decision Split:**

1. Drag and drop a **Decision Split** after the **API Entry Event**.
2. In the **Decision Split** details, select **Edit** for the first path.

![Decision Split details with the "Edit" button.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey5.png?220de266369472dd40cc1b2e5f150993)

{: start="3"}
3. Update the **Decision Split** to use the template ID passed in by the recommendations data extension. Locate the appropriate field under **Journey Data**.

![The Journey Data section in Path 1 of the Decision Split.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey6.png?245bcc88a9b6ec52dfebfed1e4102d09)

{: start="4"}
4. Select your entry event and locate the desired template ID field, then drag it into the workspace.

![The email template ID to include.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey7.png?fbc4e0ddca53139339cc2d6dd7238a7a)

{: start="5"}
5. Enter the template ID of your first email template, then select **Done**.
6. Select **Summary** to save this path.
7. Add a path for each of your email templates, then repeat steps 4-6 above to set the filter criteria so that the template ID matches the ID value of each template.
8. Select **Done** to save the **Decision Split** node.

![Two paths in a Decision Split for each email template ID.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey10.png?f061a993b399f97512a2138a65cf6eb7){: style="max-width:65%;"}

**Add an Email for each Decision Split:**

1. Drag an **Email** node into each path of the **Decision Split**.
2. Select **Email**, then select the appropriate template that should go in each Path (meaning the template with the ID value should match the logic in your Decision Split).

![An Email node added to the Journey.](https://www.braze.com/docs/assets/img/decisioning_studio_go/journey9.png?aecf1f542d0e23aeb14e579136d01b34)

#### Step 3: Activate the Journey

After setting up your Journey, activate it and share the following details with the BrazeAI Decisioning Studio™ Go team:

* Journey ID
* Journey name
* API event definition key
* Recommendations data extension external key

**Note:**


The BrazeAI Decisioning Studio™ Go portal shows you the SFMC automation it provisioned to export the subscribers and engagement data once daily. If you open this automation in SFMC, make sure to unpause and turn it back to live.



1. In the BrazeAI Decisioning Studio™ Go portal, copy the **Journey name**.
2. Next, in Salesforce Marketing Cloud Journey Builder, paste the Journey name into the search bar.
3. Select the Journey name. Note that the Journey is currently in Draft status.
4. Select **Validate**.

![The completed Journey to activate.](https://www.braze.com/docs/assets/img/decisioning_studio_go/activate3.png?6c8fb8283fc655245e0802d9fb0ae561)

{: start="5"}
5. Then, review the validation results and select **Activate**.

![Recommendations listed in the Validation Rules section.](https://www.braze.com/docs/assets/img/decisioning_studio_go/activate1.png?7242da57f53f1ebb98e4f2e67f305c2f){: style="max-width:60%;"}

{: start="6"}
6. In the **Activate Journey** summary, select **Activate** again.

![Summary for the Journey.](https://www.braze.com/docs/assets/img/decisioning_studio_go/activate2.png?11d95b0671db8218205c865591a20fab){: style="max-width:85%;"}

You're all set! You can now begin triggering sends through BrazeAI Decisioning Studio™ Go.




## Next steps

Now that you've set up orchestration, proceed to design your agent:

- [Design your agent](https://www.braze.com/docs/user_guide/brazeai/decisioning_studio/decisioning_studio_go/design_your_agent/)
