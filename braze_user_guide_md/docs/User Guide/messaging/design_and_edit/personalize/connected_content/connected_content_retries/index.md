# Use retry logic for Connected Content

> This page covers how to add retries to your Connected Content calls.

## How retries work 

Because Connected Content relies on receiving data from APIs, an API might be intermittently unavailable while Braze makes the call. In this case, Braze supports retry logic to re-attempt the request using exponential backoff.

**Note:**


Connected Content `:retry` is not available for in-app messages.



## Using retry logic

To use retry logic, add the `:retry` tag to the Connected Content call, as shown in the following code snippet:


```
{% connected_content https://yourwebsite.com/api/endpoint :retry %}
{% connected_content https://www.braze.com :save my_content :basic_auth auth_name :retry %}
```


When a `:retry` tag is included in the Connected Content call, Braze will attempt to retry the call up to five times.

### Retry outcomes

#### When a retry succeeds

If a retried attempt is successful, the message is sent and no further retries are attempted for that message.

#### When the API call fails and retries are enabled

If the API call fails and this is enabled, Braze will retry the call while respecting the [rate limit](https://www.braze.com/docs/user_guide/messaging/messaging_fundamentals/frequency_capping#delivery-speed-rate-limiting) you set for each resend. Braze will move any failed messages to the back of the queue and add additional minutes, if necessary, to the total minutes it would take to send your message.

If the Connected Content call errors out over five times, the message is aborted, similar to how an [abort message tag](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/connected_content/aborting_connected_content/) is triggered.

## Connected Content calls with abort and retry logic

If a Connected Content call uses abort logic for the same condition as the retry logic, the abort logic takes precedence. This prevents any retries from being attempted. Retry logic already resends the call before aborting it if the status code is unsuccessful. Because both target the same status code behavior, you can remove the abort logic and the call still aborts if all retries fail.
