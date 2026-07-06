<div class="api-glossary-preamble" markdown="1">

**Schema scope and related resources**



Storage schemas apply to the flat file event data we send to data warehouse storage partners (Google Cloud Storage, Amazon S3, and Microsoft Azure Blob Storage). Some event and destination combinations listed here are not yet generally available. For information on which events are supported by various partners, refer to our list of [available partners](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/setting_up_currents/available_partners/) and check their respective pages.

**Tip:**


These events are also available as SQL tables in the [Query Builder](https://www.braze.com/docs/user_guide/analytics/reports/query_builder/), [SQL Segment Extensions](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/sql_segments/), and [Snowflake Data Sharing](https://www.braze.com/docs/partners/data_and_analytics/data_warehouses/snowflake/). For SQL table schemas and column details, refer to the [SQL table reference](https://www.braze.com/docs/user_guide/audience/segments/segment_extension/sql_segments/sql_segments_tables/).



Contact your Braze representative or open a [support ticket](https://www.braze.com/docs/braze_support/) if you need access to additional event entitlements. If you can't find what you need on this page, check out our [Message Engagement Events Library](https://www.braze.com/docs/user_guide/data/distribution/braze_currents/event_glossary/message_engagement_events/) or our [Currents sample data examples](https://github.com/Appboy/currents-examples/tree/master/sample-data).




**Explanation of customer behavior and user event structure and platform values**



### Event structure

This customer behavior and user events breakdown shows what type of information is generally included in a customer behavior or user event. With a solid understanding of its components, your developers and business intelligence strategy team can use the incoming Currents event data to make data-driven reports and charts, and take advantage of other valuable data metrics.

![Breakdown of a user event showing a purchase event with the listed properties grouped by user-specific properties, behavior-specific properties, and device-specific properties](https://www.braze.com/docs/assets/img/customer_engagement_event.png?6e0d41fb6c24da197762d3dade067d61)

Customer behavior and user events are comprised of **user-specific** properties, **behavior-specific** properties, and **device-specific** properties.

### Platform values

Certain events return a `platform` value that specifies the platform of the user's device.
<br>The following table details the possible returned values:

| User device | Platform value |
| --- | --- |
| iOS | `ios` |
| Android | `android` |
| FireTV | `kindle` |
| Kindle | `kindle` |
| Web | `web` |
| tvOS | `tvos` |
| Roku | `roku` |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Platform values" }




**Considerations for customer behavior and user events**



- Currents drops events with excessively large payloads of greater than 900&nbsp;KB.
- Many of the events in this glossary are SDK-initiated. Some events, such as `token_state_change`, can be initiated by either the SDK or the backend (for example, in response to a push bounce). The `sdk_version`, `gender`, `language`, and `country` fields are only set for SDK-initiated events; for backend-initiated events, or when that information is not available or not set for the user, these fields may be `null`.




</div>

<!--overview-end-->

<div id='api_dfnmrogjbncx' class='api_div' data-search-keywords='random bucket number update events random bucket number app_group_id external_user_id id prev_random_bucket_number random_bucket_number time user_id'>
<h2 id="random-bucket-number-update-events">Random Bucket Number Update events</h2>

<div class="api_tags" data-tags="Random Bucket Number" data-tags-lower="random bucket number"></div>

<p>This user event occurs every time a new user is created within their workspace. During this event, each new user gets assigned a random bucket number that you can then use to create uniformly-distributed segments of random users. Use this to group together a range of random bucket number values and compare performance across your campaigns and campaign variants.</p>

<p><strong>Important:</strong></p>

<p>This Currents event is only available for customers that have purchased an “all events connector” and is only available for storage event connectors (such as Amazon S3, Microsoft Azure, and Google Cloud Storage).
<br /><br />To enable this event and schedule the backfill for existing users’ random bucket numbers in your workspace, contact your customer success manager.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.RandomBucketNumberUpdate</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"prev_random_bucket_number"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) Previous random bucket number"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"random_bucket_number"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) New random bucket number"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_ztvnpwvtfwgc' class='api_div' data-search-keywords='custom events custom events ad_id ad_id_type ad_tracking_enabled app_group_id app_id device_id device_model external_user_id id name os_version platform properties time timezone user_id adid event_properties event_type idfa insert_id library user event distinct_id token context device model type traits timestamp'>
<h2 id="custom-events">Custom events</h2>

<div class="api_tags" data-tags="Custom Events" data-tags-lower="custom events"></div>

<p>This event occurs when a specific custom event is triggered. Use this to track when users perform custom events in your application.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.CustomEvent</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"name"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Name of the custom event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Custom properties stored as a JSON encoded string"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"timezone"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Time zone of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="p">[</span><span class="err">Braze</span><span class="w"> </span><span class="err">Custom</span><span class="w"> </span><span class="err">Event</span><span class="p">]</span><span class="w"> </span><span class="err">(users.behaviors.CustomEvent)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"adid"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"idfa"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.CustomEvent</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"name"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Name of the custom event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"timezone"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Time zone of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="p">[</span><span class="err">Braze</span><span class="w"> </span><span class="err">Custom</span><span class="w"> </span><span class="err">Event</span><span class="p">]</span><span class="w"> </span><span class="err">(users.behaviors.CustomEvent)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$os"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.CustomEvent</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
      </span><span class="nl">"model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
      </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
    </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"name"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Name of the custom event"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<h4 id="property-details">Property details</h4>

<ul>
  <li>For Custom Events, the payload will also be populated with any <a href="/docs/user_guide/data/activation/events/custom_events/custom_event_properties#custom-event-properties">custom event properties</a> that are associated with the event.</li>
  <li>For <code class="language-plaintext highlighter-rouge">ad_id</code>, <code class="language-plaintext highlighter-rouge">ad_id_type</code>, and <code class="language-plaintext highlighter-rouge">ad_tracking_enabled</code>, you need to explicitly collect the iOS IDFA and Android Google ad ID through the native SDKs. Learn more about them here: <a href="/docs/developer_guide/analytics/managing_data_collection/?sdktab=swift">iOS</a>, <a href="/docs/developer_guide/sdk_integration/?sdktab=android#android_google-advertising-id">Android</a>.</li>
  <li>If you’re using Kafka to ingest <a href="/docs/user_guide/data/distribution/braze_currents/">Currents</a> data, contact your customer success manager or account manager to enable the feature flipper for sending <code class="language-plaintext highlighter-rouge">ad_id</code>.</li>
</ul>

</div>

<div id='api_oqgrglputkrp' class='api_div' data-search-keywords='install attribution events attribution app_group_id external_user_id id source time user_id device_id event_properties event_type insert_id library properties user event distinct_id token context device traits timestamp type'>
<h2 id="install-attribution-events">Install Attribution events</h2>

<div class="api_tags" data-tags="Attribution" data-tags-lower="attribution"></div>

<p>This event occurs when an app installation is attributed to a source. Use this to track where your app installs are coming from.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.InstallAttribution</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"source"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The source of the attribution"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Install</span><span class="w"> </span><span class="err">Attribution</span><span class="w"> </span><span class="err">(users.behaviors.InstallAttribution)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"source"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) The source of the attribution"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.InstallAttribution</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"source"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) The source of the attribution"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Install</span><span class="w"> </span><span class="err">Attribution</span><span class="w"> </span><span class="err">(users.behaviors.InstallAttribution)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"source"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) The source of the attribution"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Install</span><span class="w"> </span><span class="err">Attribution</span><span class="w"> </span><span class="err">(users.behaviors.InstallAttribution)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"source"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The source of the attribution"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_acdubqeayvye' class='api_div' data-search-keywords='location events locations ad_id ad_id_type ad_tracking_enabled alt_accuracy altitude app_group_id app_id device_id device_model external_user_id id latitude ll_accuracy longitude os_version platform time user_id adid event_properties event_type idfa insert_id library properties user event distinct_id token context device model type traits timestamp'>
<h2 id="location-events">Location events</h2>

<div class="api_tags" data-tags="Locations" data-tags-lower="locations"></div>

<p>This event is triggered when a user visits a specified location. Use this to track users triggering location events in your app.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.Location</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"alt_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Altitude accuracy of recorded location"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"altitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) [PII] Altitude of recorded location"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"latitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Latitude of recorded location"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ll_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Accuracy of the latitude and longitude of recorded location"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"longitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Longitude of recorded location"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Location</span><span class="w"> </span><span class="err">(users.behaviors.Location)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"adid"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"alt_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Altitude accuracy of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"altitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) [PII] Altitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"latitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Latitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ll_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Accuracy of the latitude and longitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"longitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Longitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"idfa"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.Location</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"alt_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Altitude accuracy of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"altitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) [PII] Altitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"latitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Latitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ll_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Accuracy of the latitude and longitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"longitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Longitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Location</span><span class="w"> </span><span class="err">(users.behaviors.Location)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"alt_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Altitude accuracy of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"altitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) [PII] Altitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"latitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Latitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ll_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Accuracy of the latitude and longitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"longitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Longitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$os"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Location</span><span class="w"> </span><span class="err">(users.behaviors.Location)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
      </span><span class="nl">"model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
      </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
    </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"alt_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Altitude accuracy of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"altitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) [PII] Altitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"latitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Latitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ll_accuracy"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Accuracy of the latitude and longitude of recorded location"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"longitude"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) [PII] Longitude of recorded location"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<h4 id="property-details">Property details</h4>

<ul>
  <li>For <code class="language-plaintext highlighter-rouge">ad_id</code>, <code class="language-plaintext highlighter-rouge">ad_id_type</code>, and <code class="language-plaintext highlighter-rouge">ad_tracking_enabled</code>, you need to explicitly collect the iOS IDFA and Android Google ad ID through the native SDKs. Learn more about them here: <a href="/docs/developer_guide/analytics/managing_data_collection/?sdktab=swift">iOS</a>, <a href="/docs/developer_guide/sdk_integration/?sdktab=android#android_google-advertising-id">Android</a>.</li>
  <li>If you’re using Kafka to ingest <a href="/docs/user_guide/data/distribution/braze_currents/">Currents</a> data, contact your customer success manager or account manager to enable the feature flipper for sending <code class="language-plaintext highlighter-rouge">ad_id</code>.</li>
</ul>

</div>

<div id='api_hoqzbyvzgsrv' class='api_div' data-search-keywords='purchase events purchases ad_id ad_id_type ad_tracking_enabled app_group_id app_id currency device_id device_model external_user_id id os_version platform price product_id properties time user_id adid event_properties event_type idfa insert_id library user event distinct_id token context device model type traits timestamp'>
<h2 id="purchase-events">Purchase events</h2>

<div class="api_tags" data-tags="Purchases" data-tags-lower="purchases"></div>

<p>This event occurs when a user makes a purchase. Use this data to track when users purchase something in the application.</p>

<p><strong>Tip:</strong></p>

<p>Purchases are special custom events and come with a JSON encoded string of custom event properties the same way custom events do.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.Purchase</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"currency"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Currency of the purchase"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"price"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) Price of the purchase"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"product_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) ID of the product purchased"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Custom properties stored as a JSON encoded string"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Purchase</span><span class="w"> </span><span class="err">(users.behaviors.Purchase)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"adid"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"currency"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Currency of the purchase"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"idfa"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"price"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) Price of the purchase"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"productId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) ID of the product purchased"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.Purchase</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"currency"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Currency of the purchase"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"price"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) Price of the purchase"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"product_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) ID of the product purchased"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Purchase</span><span class="w"> </span><span class="err">(users.behaviors.Purchase)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"currency"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Currency of the purchase"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$os"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"price"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) Price of the purchase"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"product_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) ID of the product purchased"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Purchased</span><span class="w"> </span><span class="err">(users.behaviors.Purchase)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
      </span><span class="nl">"model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
      </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
    </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"ad_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Advertising identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_id_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) One of ['ios_idfa', 'google_ad_id', 'windows_ad_id', 'roku_ad_id']"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ad_tracking_enabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Whether advertising tracking is enabled for the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"currency"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Currency of the purchase"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"price"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, float) Price of the purchase"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"product_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) ID of the product purchased"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<h4 id="property-details">Property details</h4>

<ul>
  <li>For Purchase events, the payload will also be populated with any <a href="/docs/user_guide/data/activation/events/purchase_events#purchase-properties">purchase event properties</a> that are associated with the event.</li>
  <li>For <code class="language-plaintext highlighter-rouge">ad_id</code>, <code class="language-plaintext highlighter-rouge">ad_id_type</code>, and <code class="language-plaintext highlighter-rouge">ad_tracking_enabled</code>, you need to explicitly collect the iOS IDFA and Android Google ad ID through the native SDKs. Learn more about them here: <a href="/docs/developer_guide/analytics/managing_data_collection/?sdktab=swift">iOS</a>, <a href="/docs/developer_guide/sdk_integration/?sdktab=android#android_google-advertising-id">Android</a>.</li>
  <li>If you’re using Kafka to ingest <a href="/docs/user_guide/data/distribution/braze_currents/">Currents</a> data, contact your customer success manager or account manager to enable the feature flipper for sending <code class="language-plaintext highlighter-rouge">ad_id</code>.</li>
</ul>

</div>

<div id='api_gfmfrbsiuogw' class='api_div' data-search-keywords='first session events sessions app_group_id app_id country device_id device_model external_user_id gender id language os_version platform sdk_version session_id time timezone user_id event_properties event_type insert_id library properties user event distinct_id token context device model type traits timestamp'>
<h2 id="first-session-events">First Session events</h2>

<div class="api_tags" data-tags="Sessions" data-tags-lower="sessions"></div>

<p>This event occurs when a user starts their first session in your application. Use this data to track when users start sessions.</p>

<p><strong>Tip:</strong></p>

<p>When a user starts their first session, both a <code class="language-plaintext highlighter-rouge">FirstSession</code> and a <code class="language-plaintext highlighter-rouge">SessionStart</code> event are fired.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.app.FirstSession</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"country"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [DEPRECATED]"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"gender"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [DEPRECATED]"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"language"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [DEPRECATED]"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"sdk_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [DEPRECATED]"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) UUID of the session"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"timezone"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Time zone of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">First</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">(users.behaviors.app.FirstSession)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.app.FirstSession</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"timezone"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Time zone of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">First</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">(users.behaviors.app.FirstSession)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$os"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">First</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">(users.behaviors.app.FirstSession)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
      </span><span class="nl">"model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
      </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
    </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_phewblhobzzd' class='api_div' data-search-keywords='session end events sessions app_group_id app_id device_id device_model duration external_user_id id os_version platform session_id time user_id event_properties event_type insert_id library properties user event distinct_id token context device model type traits timestamp'>
<h2 id="session-end-events">Session End events</h2>

<div class="api_tags" data-tags="Sessions" data-tags-lower="sessions"></div>

<p>This occurs when a user exits your application, therefore ending their current session. Use this data to track when sessions end, and along with the appropriate session start event, calculate the duration of their time in a session.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.app.SessionEnd</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"duration"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Duration of the session in seconds"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) UUID of the session"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">End</span><span class="w"> </span><span class="err">(users.behaviors.app.SessionEnd)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"duration"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Duration of the session in seconds"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.app.SessionEnd</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"duration"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Duration of the session in seconds"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">End</span><span class="w"> </span><span class="err">(users.behaviors.app.SessionEnd)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"duration"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Duration of the session in seconds"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$os"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">Ended</span><span class="w"> </span><span class="err">(users.behaviors.app.SessionEnd)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
      </span><span class="nl">"model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
      </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
    </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"duration"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, float) Duration of the session in seconds"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_sipbpcapsnut' class='api_div' data-search-keywords='session start events sessions app_group_id app_id device_id device_model external_user_id id os_version platform session_id time user_id event_properties event_type insert_id library properties user event distinct_id token context device model type traits timestamp'>
<h2 id="session-start-events">Session Start events</h2>

<div class="api_tags" data-tags="Sessions" data-tags-lower="sessions"></div>

<p>This event occurs when a user starts a session. Use this data to track when users start sessions.</p>

<p><strong>Tip:</strong></p>

<p>When a user starts their first session, both a <code class="language-plaintext highlighter-rouge">FirstSession</code> and a <code class="language-plaintext highlighter-rouge">SessionStart</code> event are fired.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.app.SessionStart</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) UUID of the session"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">Start</span><span class="w"> </span><span class="err">(users.behaviors.app.SessionStart)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.app.SessionStart</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"os_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">Start</span><span class="w"> </span><span class="err">(users.behaviors.app.SessionStart)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$os"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the operating system of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) UUID of the session"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Session</span><span class="w"> </span><span class="err">Started</span><span class="w"> </span><span class="err">(users.behaviors.app.SessionStart)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
      </span><span class="nl">"model"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Model of the device"</span><span class="p">,</span><span class="w">
      </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="w">
    </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"session_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) UUID of the session"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_bsbmwhiqdcib' class='api_div' data-search-keywords='live activity push to start token change events live activity, push to start token activity_attributes_type app_group_id app_id device_id external_user_id id ios_push_token_apns_gateway push_to_start_token push_token_state_change_type sdk_version time user_id event_properties event_type insert_id library properties user event distinct_id token context device traits timestamp type'>
<h2 id="live-activity-push-to-start-token-change-events">Live Activity Push To Start Token Change events</h2>

<div class="api_tags" data-tags="Live Activity, Push To Start Token" data-tags-lower="live activity, push to start token"></div>

<p>This event occurs when Braze syncs the Live Activity push to start token with the user.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.liveactivity.PushToStartTokenChange</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"activity_attributes_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity attribute type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_to_start_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity push to start token"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"sdk_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the Braze SDK in use during the event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Live</span><span class="w"> </span><span class="err">Activity</span><span class="w"> </span><span class="err">Push</span><span class="w"> </span><span class="err">To</span><span class="w"> </span><span class="err">Start</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">Change</span><span class="w"> </span><span class="err">(users.behaviors.liveactivity.PushToStartTokenChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"activity_attributes_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity attribute type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_to_start_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity push to start token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.liveactivity.PushToStartTokenChange</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"activity_attributes_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity attribute type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_to_start_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity push to start token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Live</span><span class="w"> </span><span class="err">Activity</span><span class="w"> </span><span class="err">Push</span><span class="w"> </span><span class="err">To</span><span class="w"> </span><span class="err">Start</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">Change</span><span class="w"> </span><span class="err">(users.behaviors.liveactivity.PushToStartTokenChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"activity_attributes_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity attribute type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_to_start_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity push to start token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Live</span><span class="w"> </span><span class="err">Activity</span><span class="w"> </span><span class="err">Push</span><span class="w"> </span><span class="err">To</span><span class="w"> </span><span class="err">Start</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">Changed</span><span class="w"> </span><span class="err">(users.behaviors.liveactivity.PushToStartTokenChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"activity_attributes_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity attribute type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_to_start_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity push to start token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_vdylvbvnkgch' class='api_div' data-search-keywords='live activity update token change events live activity, update token activity_id app_group_id app_id device_id external_user_id id ios_push_token_apns_gateway push_token_state_change_type sdk_version time update_token user_id event_properties event_type insert_id library properties user event distinct_id token context device traits timestamp type'>
<h2 id="live-activity-update-token-change-events">Live Activity Update Token Change events</h2>

<div class="api_tags" data-tags="Live Activity, Update Token" data-tags-lower="live activity, update token"></div>

<p>This event occurs when Braze syncs Live Activity update token with the user</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.liveactivity.UpdateTokenChange</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"activity_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity identifier"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"sdk_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the Braze SDK in use during the event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"update_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity update token"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Live</span><span class="w"> </span><span class="err">Activity</span><span class="w"> </span><span class="err">Update</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">Change</span><span class="w"> </span><span class="err">(users.behaviors.liveactivity.UpdateTokenChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"activity_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"update_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity update token"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.liveactivity.UpdateTokenChange</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"activity_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"update_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity update token"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Live</span><span class="w"> </span><span class="err">Activity</span><span class="w"> </span><span class="err">Update</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">Change</span><span class="w"> </span><span class="err">(users.behaviors.liveactivity.UpdateTokenChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"activity_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"update_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity update token"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Live</span><span class="w"> </span><span class="err">Activity</span><span class="w"> </span><span class="err">Update</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">Changed</span><span class="w"> </span><span class="err">(users.behaviors.liveactivity.UpdateTokenChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"activity_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity identifier"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) ID of the device on which the event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"update_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Live Activity update token"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_hgswsnwtzros' class='api_div' data-search-keywords='push notification token state change events push, token state change app_group_id app_id external_user_id id ios_push_token_apns_gateway platform push_token push_token_created_at push_token_device_id push_token_foreground_push_disabled push_token_provisionally_opted_in push_token_state_change_type push_token_updated_at sdk_version time time_ms user_id web_push_token_public_key web_push_token_user_auth web_push_token_vapid_public_key event_properties event_type insert_id library properties user event distinct_id token context device traits timestamp type'>
<h2 id="push-notification-token-state-change-events">Push Notification Token State Change events</h2>

<div class="api_tags" data-tags="Push, Token State Change" data-tags-lower="push, token state change"></div>

<p>This event occurs when a push token is inserted, updated, or removed. Use this to track the states of push tokens.</p>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.pushnotification.TokenStateChange</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Push token of the event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token_created_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was created"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token_device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Device id of the push token"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token_foreground_push_disabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Foreground push disabled flag of the push token"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token_provisionally_opted_in"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Provisionally opted in flag of the push token"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"push_token_updated_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was last updated"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"sdk_version"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Version of the Braze SDK in use during the event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time_ms"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, long) Time in millisecond when the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"web_push_token_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Public key of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"web_push_token_user_auth"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) User auth of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"web_push_token_vapid_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) VAPID public key of the push token, only applies to web push tokens"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Push</span><span class="w"> </span><span class="err">Notification</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">State</span><span class="w"> </span><span class="err">Change</span><span class="w"> </span><span class="err">(users.behaviors.pushnotification.TokenStateChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Push token of the event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_created_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was created"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Device id of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_foreground_push_disabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Foreground push disabled flag of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_provisionally_opted_in"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Provisionally opted in flag of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_updated_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was last updated"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time_ms"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, long) Time in millisecond when the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Public key of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_user_auth"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) User auth of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_vapid_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) VAPID public key of the push token, only applies to web push tokens"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Amplitude"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"library"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.behaviors.pushnotification.TokenStateChange</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The name of the event type"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Push token of the event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_created_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was created"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Device id of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_foreground_push_disabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Foreground push disabled flag of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_provisionally_opted_in"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Provisionally opted in flag of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_updated_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was last updated"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time_ms"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, long) Time in millisecond when the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Public key of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_user_auth"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) User auth of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_vapid_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) VAPID public key of the push token, only applies to web push tokens"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Push</span><span class="w"> </span><span class="err">Notification</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">State</span><span class="w"> </span><span class="err">Change</span><span class="w"> </span><span class="err">(users.behaviors.pushnotification.TokenStateChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Mixpanel"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"$partner_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"braze"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"distinct_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"$insert_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"platform"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Platform of the device"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Push token of the event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_created_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was created"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Device id of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_foreground_push_disabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Foreground push disabled flag of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_provisionally_opted_in"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Provisionally opted in flag of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_updated_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was last updated"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time_ms"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, long) Time in millisecond when the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The Mixpanel API token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Public key of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_user_auth"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) User auth of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_vapid_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) VAPID public key of the push token, only applies to web push tokens"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">Push</span><span class="w"> </span><span class="err">Notification</span><span class="w"> </span><span class="err">Token</span><span class="w"> </span><span class="err">State</span><span class="w"> </span><span class="err">Changed</span><span class="w"> </span><span class="err">(users.behaviors.pushnotification.TokenStateChange)</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"anonymousId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"context"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"device"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">},</span><span class="w">
    </span><span class="nl">"traits"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"> </span><span class="p">}</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"event"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The event type name, as it is exported to Segment"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"messageId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w">
    </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"ios_push_token_apns_gateway"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) APNS gateway of the push token, only applies to iOS push tokens, 1 for development, 2 for production"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Push token of the event"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_created_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was created"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_device_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Device id of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_foreground_push_disabled"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Foreground push disabled flag of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_provisionally_opted_in"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) Provisionally opted in flag of the push token"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_state_change_type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) A description of the push token state change type"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"push_token_updated_at"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, int) UNIX timestamp at which the push token was last updated"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"time_ms"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, long) Time in millisecond when the event happened"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Public key of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_user_auth"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) User auth of the push token, only applies to web push tokens"</span><span class="p">,</span><span class="w">
    </span><span class="nl">"web_push_token_vapid_public_key"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) VAPID public key of the push token, only applies to web push tokens"</span><span class="w">
  </span><span class="p">},</span><span class="w">
  </span><span class="nl">"timestamp"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"type"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"track"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"userId"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<h4 id="property-details">Property details</h4>

<ul>
  <li>The <code class="language-plaintext highlighter-rouge">push_token_foreground_push_disabled</code> field indicates whether the push token can receive foreground or background push.
    <ul>
      <li>If the user explicitly allowed push notification permission on their device, this is <code class="language-plaintext highlighter-rouge">false</code>, and the token can receive foreground push notifications.</li>
      <li>If the user explicitly denied push notification permission on their device, this is <code class="language-plaintext highlighter-rouge">true</code>, and the token is only allowed with background push notifications.</li>
      <li>If push permission has not yet been determined (for example, the user hasn’t responded to the OS prompt), this is <code class="language-plaintext highlighter-rouge">true</code>, and the token is only allowed with background push notifications.</li>
      <li>This field can be <code class="language-plaintext highlighter-rouge">null</code> (or empty, depending on your destination format) for older SDK token registrations that haven’t yet reported permission status and for web push tokens. Treat <code class="language-plaintext highlighter-rouge">null</code> the same as <code class="language-plaintext highlighter-rouge">false</code> (foreground-pushable), because Braze still attempts to send foreground push notifications to those tokens.</li>
      <li>A push send attempt does not update this field. If a send succeeds, no <code class="language-plaintext highlighter-rouge">TokenStateChange</code> event is emitted. If a send bounces because the token is invalid, Braze emits a <code class="language-plaintext highlighter-rouge">remove</code> event and deletes the token.</li>
      <li>This field only changes when Braze ingests a token state update from the SDK (for example, a later session sync that reports push permission status).</li>
    </ul>
  </li>
  <li>The <code class="language-plaintext highlighter-rouge">push_token_provisionally_opted_in</code> field only applies to iOS push tokens.
    <ul>
      <li>If you have <a href="/docs/user_guide/channels/push/platform_specific_resources/ios/notification_options#provisional-push">Provisional Authorization</a> set up, provisional tokens have this field set to <code class="language-plaintext highlighter-rouge">true</code>. All other push tokens are <code class="language-plaintext highlighter-rouge">false</code>.</li>
    </ul>
  </li>
  <li>The <code class="language-plaintext highlighter-rouge">sdk_version</code> field only populates if the token state change is initiated by SDK.
    <ul>
      <li>If there is a <code class="language-plaintext highlighter-rouge">changeUser</code> SDK event that triggers the token to move from one user to another, the <code class="language-plaintext highlighter-rouge">sdk_version</code> field populates.</li>
      <li>If there is a push bounce (for example, due to uninstall), the <code class="language-plaintext highlighter-rouge">sdk_version</code> field is blank.</li>
    </ul>
  </li>
  <li>Whenever a push token enters Braze, its lifecycle events are recorded. There are three types of token change events (“add”, “update”, and “remove”) recorded in the <code class="language-plaintext highlighter-rouge">push_token_state_change_type</code> field.</li>
</ul>

<h4 id="event-types">Event types</h4>

<h5 id="add">Add</h5>

<p>An “add” event is ingested when a new token is registered. This happens when a user opens the app on a new device for the first time, or when a token is set through the <a href="/docs/api/endpoints/user_data/post_user_track/"><code class="language-plaintext highlighter-rouge">/users/track</code></a> endpoint with <code class="language-plaintext highlighter-rouge">push_tokens</code> for a user that didn’t previously have one.</p>

<p><strong>Note:</strong></p>

<p>For iOS Swift SDK 13.3.0 and later, and Android SDK 40.0.0 and later, push permission status and push token are sent together. For new registrations from these SDKs, <code class="language-plaintext highlighter-rouge">push_token_foreground_push_disabled</code> is populated on the “add” event (typically <code class="language-plaintext highlighter-rouge">false</code> when notifications are enabled).<br /><br /></p>

<p>Older token registrations can still have this field as <code class="language-plaintext highlighter-rouge">null</code> until the SDK later reports push permission status. Web push tokens can also have this field as <code class="language-plaintext highlighter-rouge">null</code> by design.</p>

<h5 id="update">Update</h5>

<p>An “update” event is ingested when a property changes on an existing token without the token string itself changing. The token has the same string, same user, and same app, but one or more of the following fields changed: <code class="language-plaintext highlighter-rouge">foreground_push_disabled</code>, APNs gateway, web push keys, <code class="language-plaintext highlighter-rouge">provisionally_opted_in</code>, or <code class="language-plaintext highlighter-rouge">device_id</code>. These updates come from token state sync events (for example, when the SDK reports a new permission state), not from push send outcomes.</p>

<p><strong>Note:</strong></p>

<p>In most cases, app reinstall or backup restore results in a new “add” event with a new <code class="language-plaintext highlighter-rouge">push_token</code> and new <code class="language-plaintext highlighter-rouge">device_id</code> (because the SDK generates a new <code class="language-plaintext highlighter-rouge">device_id</code> and the OS provides a new push token string). This creates two separate token and device entries on the user profile, and the older entry is cleaned up later through uninstall tracking or campaign send.<br /><br /></p>

<p>It would be extremely rare for only the <code class="language-plaintext highlighter-rouge">device_id</code> to change without the <code class="language-plaintext highlighter-rouge">push_token</code> changing (this would require the OS to return the same token string after reinstall).</p>

<h5 id="remove">Remove</h5>

<p>A standalone “remove” event is ingested when Braze removes a token. This can happen for several reasons:</p>

<ul>
  <li>Push bounce (APNs, FCM, or HMS reports the token as invalid or expired)</li>
  <li>Uninstall detection through silent push</li>
  <li>Token removed through the REST API or APNs feedback service</li>
</ul>

<p>When a push bounce triggers token removal, Braze emits <code class="language-plaintext highlighter-rouge">push_token_state_change_type = "remove"</code> for that token. It does not emit an “update” event that changes <code class="language-plaintext highlighter-rouge">push_token_foreground_push_disabled</code>.</p>

<h5 id="add-and-remove-pairs">Add and remove pairs</h5>

<p>Add and remove pairs fall into two categories:</p>

<p><strong>Token string refresh (same user):</strong> The OS rotates the token string on the same device (for example, APNs or FCM token rotation). The “add” event (new token) and “remove” event (old token) have the same <code class="language-plaintext highlighter-rouge">user_id</code>, same <code class="language-plaintext highlighter-rouge">device_id</code>, different <code class="language-plaintext highlighter-rouge">push_token</code>, and identical <code class="language-plaintext highlighter-rouge">time_ms</code>.</p>

<p><strong>Token moves between users:</strong> A token moves from one user to another. The “add” event (new user) and “remove” event (old user) have different <code class="language-plaintext highlighter-rouge">user_id</code>, same <code class="language-plaintext highlighter-rouge">device_id</code>, same <code class="language-plaintext highlighter-rouge">push_token</code>, and different <code class="language-plaintext highlighter-rouge">time_ms</code> (typically less than 100 milliseconds apart). This is triggered by any of the following:</p>

<ul>
  <li>The SDK calls <code class="language-plaintext highlighter-rouge">changeUser</code> from an anonymous profile to an identified profile. The “remove” event has an empty <code class="language-plaintext highlighter-rouge">external_user_id</code>.</li>
  <li>The SDK calls <code class="language-plaintext highlighter-rouge">changeUser</code> from one identified profile to another. Both events have a non-empty <code class="language-plaintext highlighter-rouge">external_user_id</code>.</li>
  <li>The <a href="/docs/api/endpoints/user_data/post_users_merge/"><code class="language-plaintext highlighter-rouge">/users/merge</code></a> endpoint or duplicate user cleanup moves the orphaned user’s tokens to the surviving user.</li>
</ul>

<p><strong>Note:</strong></p>

<p>If an anonymous profile is identified through the <a href="/docs/api/endpoints/user_data/post_user_identify/"><code class="language-plaintext highlighter-rouge">/users/identify</code></a> endpoint, the <code class="language-plaintext highlighter-rouge">user_id</code> does not change and no token state change event is emitted.</p>

<h4 id="querying-for-the-latest-active-token-state">Querying for the latest active token state</h4>

<p>To determine the current push token state for each user, partition token state change events by <code class="language-plaintext highlighter-rouge">push_token</code>, <code class="language-plaintext highlighter-rouge">user_id</code>, and <code class="language-plaintext highlighter-rouge">app_id</code>, then order by <code class="language-plaintext highlighter-rouge">time_ms</code> descending and filter out “remove” events. Internally, a token is keyed by its token string and <code class="language-plaintext highlighter-rouge">app_id</code> per user. Using <code class="language-plaintext highlighter-rouge">device_id</code> as a partition key is not recommended because <code class="language-plaintext highlighter-rouge">device_id</code> is a mutable attribute, and partitioning by it could split a single token’s lifecycle across multiple partitions.</p>

<p>The following SQL query returns the latest active token state per user in Snowflake:</p>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
</pre></td><td class="rouge-code"><pre><span class="k">WITH</span> <span class="n">latest_token_state</span> <span class="k">AS</span> <span class="p">(</span>
  <span class="k">SELECT</span> <span class="o">*</span><span class="p">,</span>
    <span class="n">ROW_NUMBER</span><span class="p">()</span> <span class="n">OVER</span> <span class="p">(</span>
      <span class="k">PARTITION</span> <span class="k">BY</span> <span class="n">PUSH_TOKEN</span><span class="p">,</span> <span class="n">USER_ID</span><span class="p">,</span> <span class="n">APP_ID</span>
      <span class="k">ORDER</span> <span class="k">BY</span> <span class="n">COALESCE</span><span class="p">(</span><span class="n">TIME_MS</span><span class="p">,</span> <span class="nb">TIME</span> <span class="o">*</span> <span class="mi">1000</span><span class="p">)</span> <span class="k">DESC</span>
    <span class="p">)</span> <span class="k">AS</span> <span class="n">rn</span>
  <span class="k">FROM</span> <span class="n">USERS_BEHAVIORS_PUSHNOTIFICATION_TOKENSTATECHANGE</span>
<span class="p">)</span>
<span class="k">SELECT</span>
  <span class="n">PUSH_TOKEN</span><span class="p">,</span> <span class="n">USER_ID</span><span class="p">,</span> <span class="n">EXTERNAL_USER_ID</span><span class="p">,</span> <span class="n">PUSH_TOKEN_DEVICE_ID</span><span class="p">,</span>
  <span class="n">PUSH_TOKEN_STATE_CHANGE_TYPE</span><span class="p">,</span> <span class="n">PUSH_TOKEN_FOREGROUND_PUSH_DISABLED</span><span class="p">,</span>
  <span class="n">TIME_MS</span><span class="p">,</span> <span class="n">PLATFORM</span><span class="p">,</span> <span class="n">APP_ID</span>
<span class="k">FROM</span> <span class="n">latest_token_state</span>
<span class="k">WHERE</span> <span class="n">rn</span> <span class="o">=</span> <span class="mi">1</span>
  <span class="k">AND</span> <span class="n">PUSH_TOKEN_STATE_CHANGE_TYPE</span> <span class="o">!=</span> <span class="s1">'remove'</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>

</div>
