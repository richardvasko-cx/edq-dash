<div class="api-glossary-preamble" markdown="1">

**Important:**


User profile events are in beta. Contact your customer success manager or account manager for access.



**Tip:**


These events are also available as SQL tables in the [Query Builder](https://www.braze.com/docs/user_guide/analytics/query_builder/), [SQL Segment Extensions](https://www.braze.com/docs/user_guide/engagement_tools/segments/sql_segments/), and [Snowflake Data Sharing](https://www.braze.com/docs/partners/data_and_analytics/data_warehouses/snowflake/). For SQL table schemas and column details, refer to the [SQL table reference](https://www.braze.com/docs/user_guide/engagement_tools/segments/segment_extension/sql_segments/sql_segments_tables/).



Contact your Braze representative or open a [support ticket](https://www.braze.com/docs/braze_support/) if you need access to additional event entitlements. If you can't find what you need on this page, see the [Customer Behavior Events Library](https://www.braze.com/docs/user_guide/data/braze_currents/event_glossary/customer_behavior_events/), [Message Engagement Events Library](https://www.braze.com/docs/user_guide/data/braze_currents/event_glossary/message_engagement_events/), or [Currents sample data examples](https://github.com/Appboy/currents-examples/tree/master/sample-data).

**Explanation of user profile update event structure**



### Event structure

This customer behavior and user events breakdown shows what type of information is generally included in a user profile update event. With a solid understanding of its components, your developers and business intelligence strategy team can use the incoming Currents event data to make data-driven reports and charts, and take advantage of other valuable data metrics.

**Important:**


Storage schemas apply to flat file event data sent to data warehouse storage partners, such as Google Cloud Storage, Amazon S3, and Microsoft Azure Blob Storage. Some event and destination combinations listed here are not yet generally available. For information about supported events by partner, see [available partners](https://www.braze.com/docs/user_guide/data/braze_currents/available_partners/) and the related partner pages.

Currents drops events with payloads larger than 900 KB.






</div>

<!--overview-end-->

<div id='api_synngbhsrkkq' class='api_div' data-search-keywords='user profile update events profile app_group_id app_id archived country custom_attributes dob email_address external_user_id first_name gender home_city id language last_name phone_number time time_ms timezone update_source user_id'>
<h2 id="user-profile-update-events">User Profile Update events</h2>

<div class="api_tags" data-tags="Profile" data-tags-lower="profile"></div>

<p>This represents the profile updates for a user.</p>

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
</pre></td><td class="rouge-code"><pre><span class="err">//</span><span class="w"> </span><span class="err">users.profile.Update</span><span class="w">

</span><span class="p">{</span><span class="w">
  </span><span class="nl">"app_group_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app group this user belongs to"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"app_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) API ID of the app on which this event occurred"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"archived"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, boolean) When set to True, indicates that this user was archived within Braze"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"country"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Country of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"custom_attributes"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Valid JSON string of the updated custom attributes"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"dob"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Date of birth of the user in format </span><span class="se">\"</span><span class="s2">YYYY-MM-DD</span><span class="se">\"</span><span class="s2">"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"email_address"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Email address of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"external_user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] External ID of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"first_name"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] First name of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"gender"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Gender of the user, one of ['M', 'F', 'O', 'N', 'P']"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"home_city"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Home city of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) Globally unique ID for this event"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"language"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Language of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"last_name"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Last name of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"phone_number"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) [PII] Phone number of the user in e.164 format"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, int) UNIX timestamp at which the event happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"time_ms"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, long) Time in milliseconds when the update happened"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"timezone"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(optional, string) Time zone of the user"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"update_source"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) The source of this update"</span><span class="p">,</span><span class="w">
  </span><span class="nl">"user_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"(required, string) [PII] Braze user ID of the user who performed this event"</span><span class="w">
</span><span class="p">}</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>
