# Security events export with Amazon S3

> You can automatically export security events to Amazon S3, a cloud storage provider, with a daily job that runs at midnight UTC. After setting up, you don't need to manually export security events from the dashboard. The job exports the security events for the past 24 hours in CSV format to your configured S3 storage. The CSV file has the same structure as a manually exported report.

**Note:**


The 10,000-row limit applies only to the manual CSV report download from the dashboard. Security event exports to S3 aren't subject to this row limit.



Braze supports two different S3 authentication and authorization methods for setting up Amazon S3 export:

- AWS secret access key method
- AWS role ARN method

## AWS secret access key method

This method generates a secret key and an access key ID that allows Braze to authenticate as a user on your AWS account to write data to your bucket.

### Step 1: Create an Identity and Access Management (IAM) user

To retrieve your secret access key and access key ID, you’ll need to create an IAM user, following the instructions in [Setting up your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started-account-iam.html#create-an-admin).

### Step 2: Get credentials

1. After creating a new user, generate the access key and download your access key ID and secret access key.

![A summary page for a role called "liyu-chen-test".](https://www.braze.com/docs/assets/img/security_export/credentials1.png?fda727b860ccdbba2be9bc20fbab87a8)

{: start="2"}
2. Take note of these credentials somewhere or download the credential files, because you’ll need to input these into Braze later on.

![Fields containing the access key and secret access key.](https://www.braze.com/docs/assets/img/security_export/retrieve_access_keys.png?3d6c06ae42ec03c5587087235a3fd6ed)

### Step 3: Create policy

1. Go to **IAM** (Identity and Access Management) > **Policies** > **Create Policy** to add permissions for your user. 
2. Select **Create Your Own Policy**, which gives limited permissions so Braze can only access the specified buckets.
3. Specify a policy name of your choice.
4. Input the following code snippet into the **Policy Document** section. Be sure to replace "INSERTBUCKETNAME" with your bucket name. Without these permissions, the integration will fail a credentials check and not be created.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
            "Resource": ["arn:aws:s3:::INSERTBUCKETNAME"]
        },
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            "Resource": ["arn:aws:s3:::INSERTBUCKETNAME*", "arn:aws:s3:::INSERTBUCKETNAME/", "arn:aws:s3:::INSERTBUCKETNAME"]
        }
    ]
}
```

### Step 4: Attach policy

1. After creating a new policy, go to **Users** and select your specific user. 
2. In the **Permissions** tab, select **Add Permissions**, directly attach the policy, and then select that policy. 

Now, you’re ready to link your AWS credentials to your Braze account!

### Step 5: Link Braze to AWS

1. In Braze, go to **Settings** > **Company Settings** > **Admin Settings** > **Security Settings** and scroll to the **Security Event Download** section.
2. Toggle on **Export to AWS S3** under **Export to cloud storage** and select **AWS secret access key**, which enables the S3 export. 
3. Input the following:
- AWS access key ID
- AWS secret access key
    - When inputting this key, first select **Test Credentials** to confirm your credentials work.
- AWS bucket name 

![The "Security Event Download" page with populated Braze account and Braze external IDs.](https://www.braze.com/docs/assets/img/security_export/security_event_download1.png?6efde7724578e65aa575dc88d7a61aa8)

{: start="4"}
4. Select **Save Changes**. 

!["Save changes" button.](https://www.braze.com/docs/assets/img/security_export/save_changes_button.png?307f43dc48263342c1bedd7b9e1e7eee){: style="max-width:50%;"}

You’ve integrated AWS S3 into your Braze account!

## AWS role ARN method

The AWS role ARN method generates a role Amazon Resource Name (ARN) that allows the Braze Amazon account to authenticate as a member of that role.

### Step 1: Create policy

1. Sign in to the AWS management console as an account administrator. 
2. In the AWS console, go to the **IAM** (Identity and Access Management) section > **Policies**, and then select **Create Policy**.

![A page with a list of policies and button to "Create policy".](https://www.braze.com/docs/assets/img/security_export/policies.png?6d86fe2247881ab8c83386db6d403ab9)

{: start="3"}
3. Open the **JSON** tab and input the following code snippet into the **Policy Document** section. Be sure to replace `INSERTBUCKETNAME` with your bucket name. 

```json
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
            "Resource": ["arn:aws:s3:::INSERTBUCKETNAME"]
        },
        {
            "Effect": "Allow",
            "Action": ["s3:PutObject", "s3:GetObject","s3:DeleteObject"],
            "Resource": ["arn:aws:s3:::INSERTBUCKETNAME/*"]
        }
    ]
}
```

{: start="4"}
4. Select **Next** after reviewing the policy.

![A page that allows you to review your policy and optionally add permissions.](https://www.braze.com/docs/assets/img/security_export/specify_permissions.png?28a6689cbed4a351e2c62d5f305aef1d)

{: start="5"}
5. Give the policy a name and description, and then select **Create Policy**.

![A page to review and create your policy.](https://www.braze.com/docs/assets/img/security_export/review_and_create.png?198cc7420e2664188017f8678c2e7342)

### Step 2: Create role

1. In Braze, go to **Settings** > **Company Settings** > **Admin Settings** > **Security Settings** and scroll to the **Security Event Download** section. 
2. Select **AWS Role ARN**. 
3. Take note of the identifiers, Braze account ID, and Braze external ID needed to create your role.

![The "Security Event Download" page with populated Braze account and Braze external IDs.](https://www.braze.com/docs/assets/img/security_export/security_event_download2.png?d8648c7d8bdc4813cf5747f2f4d0dfc8)

4. In the AWS console, go to the **IAM** (Identity and Access Management) section > **Roles** > **Create Role**. 
5. Select **Another AWS Account** as the trusted entity selector type. 
6. Provide your Braze account ID, check the **Require external ID** box, and then enter your Braze external ID. 
7. Select **Next** when complete.

![A page with options to select a trusted entity type and provide information about your AWS account.](https://www.braze.com/docs/assets/img/security_export/select_trusted_entity.png?238089f9607786a2b82bcd649083bbc5)

### Step 3: Attach policy

1. Search for the policy you created earlier in the search bar, and then place a checkmark next to the policy to attach it. 
2. Select **Next**.

![A list of policies with columns for their type and description.](https://www.braze.com/docs/assets/img/security_export/add_permissions.png?ef23d4f17651b56a0cbdd2de64998fc2)

{: start="3"}
3. Give the role a name and a description, and select **Create Role**.

![Fields to provide role details, such as the name, description, trust policy, permissions, and tags.](https://www.braze.com/docs/assets/img/security_export/name_review_create.png?8fa678143b8355b43748274d50f5de44)

Your newly created role will appear in the list!

### Step 4: Link to Braze AWS

1. In the AWS Console, find your newly created role in the list. Select the name to open up the details of that role, and take note of the **ARN**.

![The summary page for a role called "security-event-export-olaf".](https://www.braze.com/docs/assets/img/security_export/credentials2.png?9733cef1900870b97dc585b144835ccb)

{: start="2"}
2. In Braze, go to **Settings** > **Company Settings** > **Admin Settings** > **Security Settings** and scroll to the **Security Event Download** section.

!["Security Event Download" section with a toggle turned on for "Export to AWS S3".](https://www.braze.com/docs/assets/img/security_export/security_event_download3.png?d8648c7d8bdc4813cf5747f2f4d0dfc8)

{: start="3"}
3. Make sure **AWS role ARN** is selected, then input your role ARN and AWS S3 bucket name in the designated fields. 
4. Select **Test Credentials** to confirm your credentials work properly.
5. Select **Save Changes**. 

!["Save changes" button.](https://www.braze.com/docs/assets/img/security_export/save_changes_button.png?307f43dc48263342c1bedd7b9e1e7eee){: style="max-width:40%;"}

You’ve integrated AWS S3 into your Braze account!