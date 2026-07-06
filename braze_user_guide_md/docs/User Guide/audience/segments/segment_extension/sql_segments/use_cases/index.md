<div id='api_vgkxwfoqoobq' class='api_div' data-search-keywords='select users by how many times an event has occurred event'>
<h2 id="select-users-by-how-many-times-an-event-has-occurred">Select users by how many times an event has occurred</h2>
<div class="api_tags" data-tags="Event" data-tags-lower="event"></div>

<p>Select users that opened a certain email campaign more than once in the past.</p>

<p>This also works for in-app message capping by the number of impressions, such as selecting users with more than three impressions as a segment exclusion on the same campaign.</p>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span> <span class="n">user_id</span> <span class="k">FROM</span> <span class="nv">"USERS_MESSAGES_EMAIL_OPEN_SHARED"</span>
<span class="k">WHERE</span> <span class="n">campaign_api_id</span><span class="o">=</span><span class="s1">'8f7026dc-e9b7-40e6-bdc7-96cf58e80faa'</span>
<span class="k">GROUP</span> <span class="k">BY</span> <span class="n">user_id</span>
<span class="k">HAVING</span> <span class="k">count</span><span class="p">(</span><span class="o">*</span><span class="p">)</span> <span class="o">&gt;</span> <span class="mi">1</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_oybluaofrhyl' class='api_div' data-search-keywords='select users that performed an action and sum up a property value property'>
<h2 id="select-users-that-performed-an-action-and-sum-up-a-property-value">Select users that performed an action and sum up a property value</h2>
<div class="api_tags" data-tags="Property" data-tags-lower="property"></div>

<p>Select users that made a bet on sports with the sum of all of their bets being greater than a certain amount.</p>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
</pre></td><td class="rouge-code"><pre><span class="k">select</span> <span class="n">user_id</span> <span class="k">from</span> <span class="nv">"USERS_BEHAVIORS_CUSTOMEVENT_SHARED"</span>
<span class="k">where</span> <span class="n">name</span><span class="o">=</span><span class="s1">'Bet On Sports'</span>
<span class="k">group</span> <span class="k">by</span> <span class="mi">1</span> <span class="k">having</span> <span class="k">sum</span><span class="p">(</span><span class="n">get_path</span><span class="p">(</span><span class="n">parse_json</span><span class="p">(</span><span class="n">properties</span><span class="p">),</span> <span class="s1">'amount'</span><span class="p">))</span> <span class="o">&gt;</span> <span class="mi">150</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_xqrdrlsroilg' class='api_div' data-search-keywords='select users based on how many times an event occurred in a time range event, time range'>
<h2 id="select-users-based-on-how-many-times-an-event-occurred-in-a-time-range">Select users based on how many times an event occurred in a time range</h2>
<div class="api_tags" data-tags="Event, Time range" data-tags-lower="event, time range"></div>

<p>Select users with more than three email opens in the last 30 days.</p>

<p>This also works for determining the engagement levels of users, such as highly responsive users across different channels.</p>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span> <span class="n">user_id</span><span class="p">,</span> <span class="k">COUNT</span><span class="p">(</span><span class="k">DISTINCT</span> <span class="n">id</span><span class="p">)</span> <span class="k">AS</span> <span class="n">num_emails_opened</span>
<span class="k">FROM</span> <span class="n">USERS_MESSAGES_EMAIL_OPEN_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">30</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">())</span> <span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">()</span>
<span class="k">GROUP</span> <span class="k">BY</span> <span class="n">user_id</span><span class="p">;</span>
<span class="k">HAVING</span> <span class="k">COUNT</span><span class="p">(</span><span class="k">DISTINCT</span> <span class="n">id</span><span class="p">)</span> <span class="o">&gt;</span> <span class="mi">3</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_wfnytgbpnpvq' class='api_div' data-search-keywords='select users that recorded at least one event across multiple time ranges event, time range'>
<h2 id="select-users-that-recorded-at-least-one-event-across-multiple-time-ranges">Select users that recorded at least one event across multiple time ranges</h2>
<div class="api_tags" data-tags="Event, Time range" data-tags-lower="event, time range"></div>

<p>Select users that made a purchase in each of the last four quarters. This user segment can be used with <a href="/docs/partners/canvas_audience_sync/">audience sync</a> to identify high-value lookalike customers for acquisition.</p>

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
</pre></td><td class="rouge-code"><pre><span class="n">ELECT</span> <span class="k">DISTINCT</span> <span class="n">user_id</span>
<span class="k">FROM</span> <span class="n">USERS_BEHAVIORS_PURCHASE_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">90</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">())</span> <span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">()</span>
<span class="k">INTERSECT</span>
<span class="k">SELECT</span> <span class="k">DISTINCT</span> <span class="n">user_id</span>
<span class="k">FROM</span> <span class="n">USERS_BEHAVIORS_PURCHASE_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">180</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">())</span> <span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">91</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">())</span>
<span class="k">INTERSECT</span>
<span class="k">SELECT</span> <span class="k">DISTINCT</span> <span class="n">user_id</span>
<span class="k">FROM</span> <span class="n">USERS_BEHAVIORS_PURCHASE_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">270</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">())</span> <span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">181</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">())</span>
<span class="k">INTERSECT</span>
<span class="k">SELECT</span> <span class="k">DISTINCT</span> <span class="n">user_id</span>
<span class="k">FROM</span> <span class="n">USERS_BEHAVIORS_PURCHASE_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">365</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">())</span> <span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">271</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">());</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_cpdfdpwhalph' class='api_div' data-search-keywords='select any purchase with certain properties purchase, property'>
<h2 id="select-any-purchase-with-certain-properties">Select any purchase with certain properties</h2>
<div class="api_tags" data-tags="Purchase, Property" data-tags-lower="purchase, property"></div>

<p>Select customers that made any purchase that contains the property <code class="language-plaintext highlighter-rouge">“type = shops”</code> in 14 days.</p>

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
16
17
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span>
<span class="n">user_id</span>
<span class="k">FROM</span>
<span class="n">USERS_BEHAVIORS_PURCHASE_SHARED</span>
<span class="k">WHERE</span>
<span class="n">product_id</span> <span class="k">IS</span> <span class="k">NOT</span> <span class="k">NULL</span>
<span class="k">AND</span>
<span class="n">get_path</span><span class="p">(</span>
<span class="n">parse_json</span><span class="p">(</span><span class="n">properties</span><span class="p">),</span>
<span class="s1">'propertyname'</span>
<span class="p">)</span> <span class="o">=</span> <span class="s1">'propertyvalue'</span>
<span class="k">AND</span>
<span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="n">DATEADD</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="o">-</span><span class="mi">14</span><span class="p">,</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">())</span>
<span class="k">AND</span>
<span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="k">CURRENT_TIMESTAMP</span><span class="p">()</span>
<span class="k">GROUP</span> <span class="k">BY</span> <span class="mi">1</span>
<span class="k">HAVING</span> <span class="k">COUNT</span><span class="p">(</span><span class="n">id</span><span class="p">)</span> <span class="o">&gt;</span> <span class="mi">0</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_vpjmxwpftgcy' class='api_div' data-search-keywords='select users that were sent a message that wasn’t delivered message, delivery'>
<h2 id="select-users-that-were-sent-a-message-that-wasnt-delivered">Select users that were sent a message that wasn’t delivered</h2>
<div class="api_tags" data-tags="Message, Delivery" data-tags-lower="message, delivery"></div>

<p>Select users that have been sent an SMS campaign or Canvas, but the message did not make it to the carrier. For example, the message might have been stopped by a queue overflow.</p>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span>
<span class="n">user_id</span>
<span class="k">FROM</span>
<span class="n">USERS_MESSAGES_SMS_SEND_SHARED</span>
<span class="k">WHERE</span>
<span class="n">CANVAS_ID</span><span class="o">=</span><span class="s1">'63067c50740cc3377f8200d5'</span>
<span class="k">AND</span> <span class="n">TO_PHONE_NUMBER</span> <span class="k">NOT</span> <span class="k">IN</span> <span class="p">(</span><span class="k">SELECT</span> <span class="n">TO_PHONE_NUMBER</span> <span class="k">FROM</span> <span class="n">USERS_MESSAGES_SMS_CARRIERSEND_SHARED</span> <span class="k">WHERE</span> <span class="n">CANVAS_ID</span><span class="o">=</span><span class="s1">'63067c50740cc3377f8200d5'</span><span class="p">)</span>
<span class="k">GROUP</span> <span class="k">BY</span> <span class="mi">1</span>
<span class="k">HAVING</span> <span class="k">COUNT</span><span class="p">(</span><span class="n">id</span><span class="p">)</span> <span class="o">&gt;</span> <span class="mi">0</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_akfrrrvsboim' class='api_div' data-search-keywords='find all sms messages that were sent but didn’t reach the carrier because of queue overflow message, carrier'>
<h2 id="find-all-sms-messages-that-were-sent-but-didnt-reach-the-carrier-because-of-queue-overflow">Find all SMS messages that were sent but didn’t reach the carrier because of queue overflow</h2>
<div class="api_tags" data-tags="Message, Carrier" data-tags-lower="message, carrier"></div>

<p>This can be repurposed for other types of messages sent from a particular Canvas that weren’t delivered.</p>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span>
<span class="n">user_id</span>
<span class="k">FROM</span>
<span class="n">USERS_MESSAGES_SMS_SEND_SHARED</span>
<span class="k">WHERE</span>
<span class="n">CANVAS_ID</span><span class="o">=</span><span class="s1">'id pulled from URL'</span>
<span class="k">AND</span> <span class="n">TO_PHONE_NUMBER</span> <span class="k">NOT</span> <span class="k">IN</span> <span class="p">(</span><span class="k">SELECT</span> <span class="n">TO_PHONE_NUMBER</span> <span class="k">FROM</span> <span class="n">USERS_MESSAGES_SMS_CARRIERSEND_SHARED</span> <span class="k">WHERE</span> <span class="n">CANVAS_ID</span><span class="o">=</span><span class="s1">'id pulled from URL'</span><span class="p">)</span>
<span class="k">GROUP</span> <span class="k">BY</span> <span class="mi">1</span>
<span class="k">HAVING</span> <span class="k">COUNT</span><span class="p">(</span><span class="n">id</span><span class="p">)</span> <span class="o">&gt;</span> <span class="mi">0</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>
<p><code class="language-plaintext highlighter-rouge">CANVAS_ID</code> is the number after <code class="language-plaintext highlighter-rouge">/canvas/</code> in your Canvas URL.</p>
</div>

<div id='api_aghadxrmhkkt' class='api_div' data-search-keywords='select users that made any purchase with a property array containing a specific value purchase, property'>
<h2 id="select-users-that-made-any-purchase-with-a-property-array-containing-a-specific-value">Select users that made any purchase with a property array containing a specific value</h2>
<div class="api_tags" data-tags="Purchase, Property" data-tags-lower="purchase, property"></div>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span> <span class="k">DISTINCT</span> <span class="n">EXTERNAL_USER_ID</span>
<span class="k">FROM</span> <span class="nv">"USERS_BEHAVIORS_PURCHASE_SHARED"</span><span class="p">,</span>
<span class="k">LATERAL</span> <span class="n">FLATTEN</span><span class="p">(</span><span class="k">input</span><span class="o">=&gt;</span><span class="n">parse_json</span><span class="p">(</span><span class="n">properties</span><span class="p">):</span><span class="n">modifiers</span><span class="p">)</span> <span class="k">as</span> <span class="n">f</span>
<span class="k">WHERE</span> <span class="n">f</span><span class="p">.</span><span class="n">VALUE</span><span class="p">::</span><span class="n">STRING</span> <span class="o">=</span> <span class="s1">'Bacon'</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_lculborncehn' class='api_div' data-search-keywords='find all users that had multiple 30003 errors and 0 deliveries error, delivery'>
<h2 id="find-all-users-that-had-multiple-30003-errors-and-0-deliveries">Find all users that had multiple 30003 errors and 0 deliveries</h2>
<div class="api_tags" data-tags="Error, Delivery" data-tags-lower="error, delivery"></div>

<p>That is helpful for solving situations when you want to stop sending to users that are failing to receive messages but aren’t getting marked as invalid because they don’t have the required error code. You can either retarget these users to update their phone number or unsubscribe them.</p>

<p>This query uses the incremental editor and looks for users with three or more rejected sends in the last 90 days and zero deliveries.</p>

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
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span>
  <span class="err">$</span><span class="nb">date</span><span class="p">(</span><span class="nb">time</span><span class="p">),</span> <span class="n">user_id</span><span class="p">,</span> <span class="k">COUNT</span><span class="p">(</span><span class="n">id</span><span class="p">)</span>
<span class="k">FROM</span>
  <span class="n">USERS_MESSAGES_SMS_REJECTION_SHARED</span>
<span class="k">WHERE</span>
  <span class="n">provider_error_code</span> <span class="o">=</span> <span class="s1">'30003'</span> 
  <span class="k">AND</span>
  <span class="nb">time</span> <span class="o">&gt;</span> <span class="err">$</span><span class="n">start_date</span>
    <span class="k">AND</span> <span class="n">TO_PHONE_NUMBER</span> <span class="k">NOT</span> <span class="k">IN</span> <span class="p">(</span><span class="k">SELECT</span> <span class="n">TO_PHONE_NUMBER</span> <span class="k">FROM</span> <span class="n">USERS_MESSAGES_SMS_DELIVERY_SHARED</span><span class="p">)</span>
<span class="k">GROUP</span> <span class="k">BY</span> <span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_tcsvkagxfbiy' class='api_div' data-search-keywords='find users with specific event properties and event counts in a time range event, property, time range'>
<h2 id="find-users-with-specific-event-properties-and-event-counts-in-a-time-range">Find users with specific event properties and event counts in a time range</h2>
<div class="api_tags" data-tags="Event, Property, Time range" data-tags-lower="event, property, time range"></div>

<p>Find users that meet the following conditions simultaneously:</p>

<ul>
  <li>Transacted a total value greater than $500 (the sum of multiple <code class="language-plaintext highlighter-rouge">Transact</code> events)</li>
  <li>Transacted at the mall <code class="language-plaintext highlighter-rouge">Funan</code></li>
  <li>Transacted more than three times in the past 90 days</li>
</ul>

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
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span>
<span class="n">USER_ID</span>
<span class="k">FROM</span>
<span class="n">USERS_BEHAVIORS_CUSTOMEVENT_SHARED</span>
<span class="k">WHERE</span>
<span class="nb">TIME</span> <span class="o">&gt;</span> <span class="err">$</span><span class="n">start_date</span>
<span class="k">AND</span> <span class="n">NAME</span> <span class="o">=</span> <span class="s1">'Transact'</span>
<span class="k">AND</span> <span class="n">get_path</span><span class="p">(</span><span class="n">parse_json</span><span class="p">(</span><span class="n">properties</span><span class="p">),</span> <span class="s1">'mall'</span><span class="p">)</span> <span class="o">=</span> <span class="s1">'Funan'</span>
<span class="k">GROUP</span> <span class="k">BY</span>
<span class="n">USER_ID</span>
<span class="k">HAVING</span>
<span class="k">SUM</span><span class="p">(</span><span class="n">get_path</span><span class="p">(</span><span class="n">parse_json</span><span class="p">(</span><span class="n">properties</span><span class="p">),</span> <span class="s1">'total_value'</span><span class="p">))</span> <span class="o">&gt;</span> <span class="mi">500</span>
<span class="k">AND</span> <span class="k">COUNT</span><span class="p">(</span><span class="o">*</span><span class="p">)</span> <span class="o">&gt;</span> <span class="mi">3</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_ofrosfxrrwge' class='api_div' data-search-keywords='select users whose most recent session was on a specific device model session, device'>
<h2 id="select-users-whose-most-recent-session-was-on-a-specific-device-model">Select users whose most recent session was on a specific device model</h2>
<div class="api_tags" data-tags="Session, Device" data-tags-lower="session, device"></div>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
</pre></td><td class="rouge-code"><pre><span class="k">select</span> <span class="n">user_id</span><span class="p">,</span> <span class="n">external_user_id</span><span class="p">,</span> <span class="n">device_id</span><span class="p">,</span> <span class="n">platform</span><span class="p">,</span> <span class="n">os_version</span><span class="p">,</span> <span class="n">device_model</span><span class="p">,</span> <span class="n">to_timestamp</span><span class="p">(</span><span class="k">max</span><span class="p">(</span><span class="nb">time</span><span class="p">))</span> <span class="n">last_session</span>
<span class="k">from</span> <span class="n">users_behaviors_app_sessionstart</span>
<span class="k">where</span> <span class="n">app_group_id</span> <span class="o">=</span> <span class="s1">''</span>
<span class="k">and</span> <span class="n">date_trunc</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="n">to_timestamp</span><span class="p">(</span><span class="nb">time</span><span class="p">))</span> <span class="o">&lt;=</span> <span class="n">to_timestamp</span><span class="p">(</span><span class="s1">'2023-08-07'</span><span class="p">)</span>
<span class="k">and</span> <span class="n">device_model</span> <span class="o">=</span> <span class="s1">''</span>
<span class="k">group</span> <span class="k">by</span> <span class="n">user_id</span><span class="p">,</span> <span class="n">external_user_id</span><span class="p">,</span> <span class="n">device_id</span><span class="p">,</span> <span class="n">platform</span><span class="p">,</span> <span class="n">os_version</span><span class="p">,</span> <span class="n">device_model</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_xrdrwaibdshm' class='api_div' data-search-keywords='find users that selected the second button of an in-app message in a specific time range time range'>
<h2 id="find-users-that-selected-the-second-button-of-an-in-app-message-in-a-specific-time-range">Find users that selected the second button of an in-app message in a specific time range</h2>
<div class="api_tags" data-tags="Time range" data-tags-lower="time range"></div>

<div class="language-sql highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span> <span class="k">DISTINCT</span> <span class="n">USER_ID</span><span class="p">,</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span>
<span class="k">FROM</span> <span class="n">USERS_MESSAGES_INAPPMESSAGE_CLICK_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="s1">'2023-08-03'</span><span class="p">::</span><span class="n">timestamp_ntz</span>
<span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="s1">'2023-08-09'</span><span class="p">::</span><span class="n">timestamp_ntz</span>
<span class="k">AND</span> <span class="n">BUTTON_ID</span> <span class="o">=</span> <span class="s1">'1'</span>
<span class="k">AND</span> <span class="n">CAMPAIGN_ID</span> <span class="o">=</span> <span class="s1">'64c8cd9c4d38d13091957b1c'</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_zqhyecamsdja' class='api_div' data-search-keywords='find users that purchased in each of the last three calendar months purchase, time range'>
<h2 id="find-users-that-purchased-in-each-of-the-last-three-calendar-months">Find users that purchased in each of the last three calendar months</h2>
<div class="api_tags" data-tags="Purchase, Time range" data-tags-lower="purchase, time range"></div>

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
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span> <span class="k">DISTINCT</span> <span class="n">user_id</span>
<span class="k">FROM</span> <span class="n">USERS_BEHAVIORS_PURCHASE_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="s1">'2023-09-01'</span><span class="p">::</span><span class="n">timestamp_ntz</span>
<span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="s1">'2023-09-30'</span><span class="p">::</span><span class="n">timestamp_ntz</span>
<span class="k">INTERSECT</span>
<span class="k">SELECT</span> <span class="k">DISTINCT</span> <span class="n">user_id</span>
<span class="k">FROM</span> <span class="n">USERS_BEHAVIORS_PURCHASE_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="s1">'2023-10-01'</span><span class="p">::</span><span class="n">timestamp_ntz</span>
<span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="s1">'2023-10-31'</span><span class="p">::</span><span class="n">timestamp_ntz</span>
<span class="k">INTERSECT</span>
<span class="k">SELECT</span> <span class="k">DISTINCT</span> <span class="n">user_id</span>
<span class="k">FROM</span> <span class="n">USERS_BEHAVIORS_PURCHASE_SHARED</span>
<span class="k">WHERE</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="s1">'2023-11-01'</span><span class="p">::</span><span class="n">timestamp_ntz</span>
<span class="k">AND</span> <span class="n">to_timestamp_ntz</span><span class="p">(</span><span class="nb">time</span><span class="p">)</span> <span class="o">&lt;=</span> <span class="s1">'2023-11-30'</span><span class="p">::</span><span class="n">timestamp_ntz</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_gqoegmunziln' class='api_div' data-search-keywords='select users that completed a custom event with a specific property when property is an integer event, property'>
<h2 id="select-users-that-completed-a-custom-event-with-a-specific-property-when-property-is-an-integer">Select users that completed a custom event with a specific property when property is an integer</h2>
<div class="api_tags" data-tags="Event, Property" data-tags-lower="event, property"></div>

<p>Sending a message to users that watched a series in the last six months and are about to leave the platform.</p>

<p>The property is the title ID; you would otherwise need to include 100+ title IDs in a filter. The incremental Segment Extension can be optimized for cost and you can specify the date range in the header.</p>

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
</pre></td><td class="rouge-code"><pre><span class="k">SELECT</span> 
  <span class="err">$</span><span class="nb">date</span><span class="p">(</span><span class="nb">time</span><span class="p">),</span> 
  <span class="n">USER_ID</span><span class="p">,</span> 
  <span class="k">COUNT</span><span class="p">(</span><span class="o">*</span><span class="p">)</span>
<span class="k">FROM</span> 
  <span class="n">USERS_BEHAVIORS_CUSTOMEVENT_SHARED</span>
<span class="k">WHERE</span> 
  <span class="nb">TIME</span> <span class="o">&gt;</span> <span class="err">$</span><span class="n">start_date</span>
  <span class="k">AND</span> <span class="n">NAME</span> <span class="o">=</span> <span class="s1">'event name'</span>
  <span class="k">AND</span> <span class="p">(</span><span class="n">PARSE_JSON</span><span class="p">(</span><span class="n">PROPERTIES</span><span class="p">):</span><span class="n">property_name</span><span class="p">::</span><span class="nb">INT</span><span class="p">)</span> <span class="k">IN</span> <span class="p">(</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">)</span>
<span class="k">GROUP</span> <span class="k">BY</span> 
  <span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>
</div>

<div id='api_bilsgnjisgal' class='api_div' data-search-keywords='find the average number of emails a user receives daily message'>
<h2 id="find-the-average-number-of-emails-a-user-receives-daily">Find the average number of emails a user receives daily</h2>
<div class="api_tags" data-tags="Message" data-tags-lower="message"></div>

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
</pre></td><td class="rouge-code"><pre><span class="k">WITH</span> <span class="n">user_email_counts</span> <span class="k">AS</span> <span class="p">(</span>
  <span class="k">SELECT</span> 
    <span class="n">USER_ID</span><span class="p">,</span>
    <span class="k">COUNT</span><span class="p">(</span><span class="o">*</span><span class="p">)</span> <span class="k">AS</span> <span class="n">total_emails</span><span class="p">,</span>
    <span class="n">DATEDIFF</span><span class="p">(</span><span class="k">day</span><span class="p">,</span> <span class="k">MIN</span><span class="p">(</span><span class="n">TO_DATE</span><span class="p">(</span><span class="n">DATE_TRUNC</span><span class="p">(</span><span class="s1">'day'</span><span class="p">,</span> <span class="n">TO_TIMESTAMP_NTZ</span><span class="p">(</span><span class="nb">TIME</span><span class="p">)))),</span> <span class="k">MAX</span><span class="p">(</span><span class="n">TO_DATE</span><span class="p">(</span><span class="n">DATE_TRUNC</span><span class="p">(</span><span class="s1">'day'</span><span class="p">,</span> <span class="n">TO_TIMESTAMP_NTZ</span><span class="p">(</span><span class="nb">TIME</span><span class="p">)))))</span> <span class="k">AS</span> <span class="n">days</span>
  <span class="k">FROM</span> <span class="n">USERS_MESSAGES_EMAIL_SEND_SHARED</span>
  <span class="k">GROUP</span> <span class="k">BY</span> <span class="n">USER_ID</span>
  <span class="k">HAVING</span> <span class="k">COUNT</span><span class="p">(</span><span class="n">USER_ID</span><span class="p">)</span> <span class="o">&gt;</span> <span class="mi">1</span>
<span class="p">),</span>

<span class="c1">-- Then, calculate the average number of emails received by each user daily</span>
<span class="n">user_daily_average</span> <span class="k">AS</span> <span class="p">(</span>
  <span class="k">SELECT</span> 
    <span class="n">USER_ID</span><span class="p">,</span>
    <span class="n">days</span><span class="p">,</span>
    <span class="k">CASE</span> 
      <span class="k">WHEN</span> <span class="n">days</span> <span class="o">=</span> <span class="mi">0</span> <span class="k">THEN</span> <span class="n">total_emails</span>  <span class="c1">-- If the user received all emails in one day, the average for that user is the total number of emails</span>
      <span class="k">ELSE</span> <span class="n">total_emails</span> <span class="o">/</span> <span class="n">days</span>  <span class="c1">-- Otherwise, it's the total number of emails divided by the number of days</span>
    <span class="k">END</span> <span class="k">AS</span> <span class="n">daily_average</span>
  <span class="k">FROM</span> <span class="n">user_email_counts</span>
<span class="p">)</span>

<span class="c1">-- The total daily average is the average of all users</span>
<span class="k">SELECT</span> 
  <span class="k">AVG</span><span class="p">(</span><span class="n">daily_average</span><span class="p">)</span>
<span class="k">FROM</span> <span class="n">user_daily_average</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Tip:</strong></p>

<p>For SMS messages, replace <code class="language-plaintext highlighter-rouge">USERS_MESSAGES_EMAIL_SEND_SHARED</code> with <code class="language-plaintext highlighter-rouge">USERS_MESSAGES_SMS_SEND_SHARED</code> in the query. For Push notifications, replace <code class="language-plaintext highlighter-rouge">USERS_MESSAGES_EMAIL_SEND_SHARED</code> with <code class="language-plaintext highlighter-rouge">USERS_MESSAGES_SMS_SEND_SHARED</code> in the query</p>

</div>

<div id='api_kcfkoscjjojq' class='api_div' data-search-keywords='find the average number of emails a user receives weekly message'>
<h2 id="find-the-average-number-of-emails-a-user-receives-weekly">Find the average number of emails a user receives weekly</h2>
<div class="api_tags" data-tags="Message" data-tags-lower="message"></div>

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
</pre></td><td class="rouge-code"><pre><span class="k">WITH</span> <span class="n">user_email_counts</span> <span class="k">AS</span> <span class="p">(</span>
  <span class="k">SELECT</span> 
    <span class="n">USER_ID</span><span class="p">,</span>
    <span class="k">COUNT</span><span class="p">(</span><span class="o">*</span><span class="p">)</span> <span class="k">AS</span> <span class="n">total_emails</span><span class="p">,</span>
    <span class="n">DATEDIFF</span><span class="p">(</span><span class="n">week</span><span class="p">,</span> <span class="k">MIN</span><span class="p">(</span><span class="n">TO_DATE</span><span class="p">(</span><span class="n">DATE_TRUNC</span><span class="p">(</span><span class="s1">'week'</span><span class="p">,</span> <span class="n">TO_TIMESTAMP_NTZ</span><span class="p">(</span><span class="nb">TIME</span><span class="p">)))),</span> <span class="k">MAX</span><span class="p">(</span><span class="n">TO_DATE</span><span class="p">(</span><span class="n">DATE_TRUNC</span><span class="p">(</span><span class="s1">'week'</span><span class="p">,</span> <span class="n">TO_TIMESTAMP_NTZ</span><span class="p">(</span><span class="nb">TIME</span><span class="p">)))))</span> <span class="k">AS</span> <span class="n">weeks</span>
  <span class="k">FROM</span> <span class="n">USERS_MESSAGES_EMAIL_SEND_SHARED</span>
  <span class="k">GROUP</span> <span class="k">BY</span> <span class="n">USER_ID</span>
  <span class="k">HAVING</span> <span class="k">COUNT</span><span class="p">(</span><span class="n">USER_ID</span><span class="p">)</span> <span class="o">&gt;</span> <span class="mi">1</span>
<span class="p">),</span>

<span class="c1">-- Then, calculate the average number of emails received by each user weekly</span>
<span class="n">user_weekly_average</span> <span class="k">AS</span> <span class="p">(</span>
  <span class="k">SELECT</span> 
    <span class="n">USER_ID</span><span class="p">,</span>
    <span class="k">CASE</span> 
      <span class="k">WHEN</span> <span class="n">weeks</span> <span class="o">=</span> <span class="mi">0</span> <span class="k">THEN</span> <span class="n">total_emails</span>  <span class="c1">-- If the user received all emails in the same week, the average is the total number of emails</span>
      <span class="k">ELSE</span> <span class="n">total_emails</span> <span class="o">/</span> <span class="n">weeks</span>  <span class="c1">-- Otherwise, it's the total number of emails divided by the number of weeks</span>
    <span class="k">END</span> <span class="k">AS</span> <span class="n">weekly_average</span>
  <span class="k">FROM</span> <span class="n">user_email_counts</span>
<span class="p">)</span>

<span class="c1">-- The total weekly average is the average of all users</span>
<span class="k">SELECT</span> 
  <span class="k">AVG</span><span class="p">(</span><span class="n">weekly_average</span><span class="p">)</span> <span class="k">AS</span> <span class="n">average_weekly_emails</span>
<span class="k">FROM</span> <span class="n">user_weekly_average</span><span class="p">;</span>
</pre></td></tr></tbody></table></code></pre></div></div>
<p><strong>Tip:</strong></p>

<p>For SMS messages, replace <code class="language-plaintext highlighter-rouge">USERS_MESSAGES_EMAIL_SEND_SHARED</code> with <code class="language-plaintext highlighter-rouge">USERS_MESSAGES_SMS_SEND_SHARED</code> in the query. For Push notifications, replace <code class="language-plaintext highlighter-rouge">USERS_MESSAGES_EMAIL_SEND_SHARED</code> with <code class="language-plaintext highlighter-rouge">USERS_MESSAGES_SMS_SEND_SHARED</code> in the query</p>

</div>