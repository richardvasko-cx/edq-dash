# Set up KakaoTalk

> This article covers how to set up the [KakaoTalk messaging channel](https://www.braze.com/docs/kakaotalk/) in Braze, including how to set up users, reconcile user IDs, and create KakaoTalk test users.

## Prerequisites

| Requirement | Description |
| --- | --- |
| Account with a supported KakaoTalk partner | An account with a supported KakaoTalk partner, [CJ OliveNetworks](https://www.braze.com/partners/solutions-partners/cjolivenetworks/) or Infobip, is required to use the KakaoTalk messaging channel. |
| KakaoTalk Business channel | Your KakaoTalk account must be a KakaoTalk Business channel to send KakaoTalk messages through Braze. When you create an account, its default status is basic. To make your account a Business channel, you'll need to verify your business and provide relevant documentation. |
| KakaoTalk Sender Key | A valid KakaoTalk Sender Key. |
| Contact phone number | A contact phone number for your KakaoTalk channel's administrator. |
| Braze cluster IPs allowlisted | IP allowlist registration is required for all customers. Register the Braze IP addresses for your cluster before you integrate KakaoTalk in Braze. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Prerequisites" }

### Register Braze IP addresses {#register-braze-ip-addresses}

Register the Braze IP addresses for your cluster in your Comm.One dashboard.

1. In your Comm.One dashboard, go to **Account Management (계정 관리)**, select the menu icon, then select **View Details (자세히보기)**.
2. Select **Center & Upload IP Allowlist (센터&업로드 IP 화이트리스트)**.
3. Add the IP addresses for your Braze cluster. For the complete list of IPs by cluster, see [IP allowlisting](https://www.braze.com/docs/user_guide/channels/webhooks/create_a_webhook/#ip-allowlisting).

![Comm.One dashboard showing where you can add IP addresses.](https://www.braze.com/docs/assets/img/kakaotalk/register_braze_ip.png?2d0be1a442937b6067ee05c744a45f48)

### Types of KakaoTalk accounts

| Account type | Description |
| --- | --- |
| Basic channel | A standard KakaoTalk channel that any organization can set up. It enables broadcast messaging and 1:1 chat through KakaoTalk. |
| [Business channel](https://www.kakaocorp.com/page/service/service/KakaoTalkChannel) | An upgraded, business-verified KakaoTalk channel that requires an application and verification process. It offers enhanced features, such as {::nomarkdown}<ul><li>Verified badge</li><li>Appearance as a recommended channel</li><li>Support for business messaging</li></ul>{:/} |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Types of KakaoTalk accounts" }

#### Apply for a business channel 

Before starting the application, gather the following business documentation:
- Korean Business Registration Certificate
- ID of the Business Representative
- Employment Certificate
- Industry-specific Licenses

**Important:**


The information on your KakaoTalk Channel (such as channel name, profile image, and others) must exactly match the information on your official submitted documents.



After gathering your documentation, follow these steps:

1. Log into the [KakaoTalk Channel Admin Center](https://center-pf.kakao.com/).
2. Select the existing KakaoTalk channel you wish to upgrade.
3. In the **Management (관리)** section, select the option for **Business Channel Application (비즈니스 채널 신청)**.
4. Select the **Apply** or **Request button (신청)** to begin the process.
5. Provide the required information.
6. Wait for a notification with the review results.

## Integrate KakaoTalk

### Step 1: Connect the KakaoTalk channel to Braze

1. Go to **Partner Integrations** > **Technology Partners** and select your KakaoTalk provider.
2. Gather the required credentials for your provider (see below), then enter them into the **Technology Partners** page and save.
3. Use the newly saved credentials for sending.

#### CJ OliveNetworks

Go to your [Comm.One dashboard](https://ums.cjmplace.com/) and gather the following information.

| Field | Location |
| --- | --- |
| **Comm.One Login ID (로그인 아이디)** | Select your profile. |
| **Sender Key (발신프로필 키)** | Go to **Template Management (템플릿 관리)** > **Sender Profile Management (발신프로필 관리)**. |
| **Channel name (카카오톡 채널 프로필명)** | In your Comm.One dashboard, go to **Template Management (템플릿 관리)** > **Sender Profile Management (발신프로필 관리)**. |
| **Sender number (연락처)** | {::nomarkdown}<ol><li>Go to <b>Account Management (계정 관리)</b>, select the menu icon, then select <b>View Details (자세히보기)</b>.</li><li>Go to <b>Business Detailed Information (업체 상세 정보)</b> > <b>Company Information (기업정보)</b></li></ul>{:/} |
| **Credential (ID) & Password (비밀번호)** | Go to the same location for the **Sender number (사업자 등록번호)**, then go to **API** > **Brand Message (브랜드 메시지)**. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="CJ OliveNetworks" }




![Comm.One dashboard showing a censored login ID.](https://www.braze.com/docs/assets/img/kakaotalk/comm.one_login_id.png?85233af5a045ecdb0e8cf3d4e3d83566)




![Comm.One dashboard showing a censored Sender Key.](https://www.braze.com/docs/assets/img/kakaotalk/sender_key.png?fbf3a48b29aa1ea5345313d6a3aecfd9)

**Important:**


You can integrate a KakaoTalk Sender Key into only one workspace at a time. To use the same Sender Key in a different workspace, you must first archive the KakaoTalk subscription group in the original workspace, then contact [Braze Support](https://www.braze.com/docs/braze_support/) to remove the integration. After Braze removes the integration, you can set up the integration in the new workspace.



![Credentials for a Braze KakaoTalk channel.](https://www.braze.com/docs/assets/img/kakaotalk/cj_credentials.png?cc8384a6cd2afe8a96d223414b2095b8)




![Comm.One dashboard showing a censored channel name.](https://www.braze.com/docs/assets/img/kakaotalk/channel_profile_name.png?dae79e46075a4baa9f066255b6d4e7e4)




![Comm.One dashboard showing a censored credential ID and password.](https://www.braze.com/docs/assets/img/kakaotalk/id_and_password.png?e3afd263c808e9af5e13414c9d2b6576)




**Note:**


Only the channels mapped to a single common ID can be registered.



![Fields on the Technology Partners page for CJ OliveNetworks.](https://www.braze.com/docs/assets/img/kakaotalk/cj_olivenetworks.png?6f9431f9e2f487bf88f40b20a8077f8a){: style="max-width:30%;"}

#### Infobip

Go to your Infobip dashboard and gather the following information.

| Field | Location |
| --- | --- |
| **API Base URL** | Select **Developer Tools** > **API Keys**. |
| **API Key** | Select **Developer Tools** > **API Keys**. |
| **Sender name / Sender key** | Select **Channels and Numbers** > **Channels**, then select the **Senders** tab. |
| **Sender profile UUID** | Provided directly by Infobip. Contact Infobip if you don't have this information. |
| **Channel name** | Provided directly by Infobip. Contact Infobip if you don't have this information. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Infobip" }

## Set user profiles

User profiles must have phone numbers in E.164 format to message them through KakaoTalk. Phone numbers are shown on the user profile. KakaoTalk requires phone numbers to be in E.164 format (for example, `+821025749774`). This differs from some other messaging channels that may accept phone numbers in multiple formats.

![User profile for a test user with a phone number in E.164 format.](https://www.braze.com/docs/assets/img/kakaotalk/standard_phone_number.png?9c4078a79193c66f6aba02be394034e4){: style="max-width:50%;"}

### Import phone numbers

Import phone numbers by [uploading a CSV or using the API](https://www.braze.com/docs/user_guide/data/unification/user_data/import_users/) to create a user. Ensure phone numbers are in E.164 format before importing.
