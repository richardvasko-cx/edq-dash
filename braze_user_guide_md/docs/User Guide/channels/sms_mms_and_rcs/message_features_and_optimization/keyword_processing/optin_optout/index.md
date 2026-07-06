# Opt-in and opt-out keywords

> Regulations require that there are responses to all opt-in, opt-out, and help/info keyword responses. Braze automatically processes the following _exact, single-word, case-insensitive_ messages, automatically updating the [subscription group state](https://www.braze.com/docs/sms_rcs_subscription_groups/) for the user and their associated phone number on all inbound requests.

## Default keywords

Braze processes the following keywords automatically and updates the subscription group state for the phone number on all inbound requests. Note that these default keywords and responses may also be customized, and you can add [custom keywords](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/keyword_handling/).

**Tip:**


Interested in expanding your opt-out processing? Try [fuzzy opt-out](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/fuzzy_opt_out/), a feature that attempts to recognize when an inbound message does not match an opt-out keyword, but indicates opt-out intent.



| Type | Keyword | Change |
|-|-------|---|
|Opt-in| `START`<br> `YES`<br> `UNSTOP` | Any inbound request with one of these `Opt-In` keywords will result in a subscription group state change to `subscribed`. Additionally, the pool of senders associated with that subscription group will now be able to send an SMS, MMS, or RCS message to that customer (depending on the type of messaging the senders support). <br><br>User will receive your defined Opt-In auto response.  |
|Opt-out| `STOP`<br> `STOPALL`<br> `UNSUBSCRIBE`<br> `CANCEL`<br> `END`<br> `QUIT` | Any inbound request with one of these `Opt-Out` keywords will result in a subscription group state change to `unsubscribed`. Additionally, the pool of numbers associated with that subscription group will no longer be able to send messages to that customer.<br><br>User will receive your defined Opt-Out auto response. |
| Help | `HELP`<br> `INFO` | User will receive your defined Help auto response. |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Default keywords" }

Only the **exact, single-word message** will be processed (case insensitive). Keywords such as `STOP PLEASE` will be ignored unless [fuzzy opt-out](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/fuzzy_opt_out/) is turned on.

If a recipient uses the keywords `HELP` or `INFO`, a response will be triggered automatically. The default response for these automatic response messages will be set during your [onboarding](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_setup/subscription_groups/) and phone number procurement period. Note that you may continue to update these responses after the initial onboarding period.

**Tip:**


Interested in expanding your opt-out processing? Try [fuzzy opt-out](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_features_and_optimization/keyword_processing/fuzzy_opt_out/), a feature that attempts to recognize when an inbound message does not match an opt-out keyword, but indicates opt-out intent.



## Handle natural language opt-outs

You can create a [Braze Agent](https://www.braze.com/docs/user_guide/brazeai/agents/) that uses sentiment analysis to help capture opt-out intent that falls outside of standard or custom keywords (such as “Please don’t text me”). See [Handle natural language opt-outs in the Agent Console](https://www.braze.com/docs/user_guide/channels/sms_mms_and_rcs/message_setup/subscription_groups/#handle-natural-language-opt-outs-in-the-agent-console) for steps.
