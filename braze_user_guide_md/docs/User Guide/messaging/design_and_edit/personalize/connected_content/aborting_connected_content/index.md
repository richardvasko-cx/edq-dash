# Abort Connected Content {#aborting-connected-content}

> When you use Liquid templating, you have the option to abort messages with conditional logic. This page covers best practices when doing so.

In the following example, the conditionals `connected.recommendations.size < 5` and `connected.foo.bar == nil` specify situations that would cause the message to be aborted.


```
{% connected_content https://example.com/webservice.json :save connected %}
   {% if connected.recommendations.size < 5 or connected.foo.bar == nil %}
     {% abort_message() %}
   {% endif %}
```


## Specify an abort reason

You can also specify an abort reason, which will be saved to the [Message Activity Log](https://www.braze.com/docs/user_guide/administer/global/workspace_settings/logs_and_alerts/message_activity_log/). This abort reason must be a string and cannot contain Liquid.


`{% abort_message('Could not get enough recommendations') %}`


**Important:**


Braze doesn't count aborted messages toward the send count in your Braze account or in Currents.



## Connected Content calls with abort and retry logic

If a Connected Content call uses abort logic for the same condition as the retry logic, the abort logic takes precedence. This prevents any retries from being attempted. Retry logic already resends the call before aborting it if the status code is unsuccessful. Because both target the same status code behavior, you can remove the abort logic and the call still aborts if all retries fail.
