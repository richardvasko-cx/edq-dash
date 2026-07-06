<div id='api_cghnjsvyrpcr' class='api_div' data-search-keywords='anniversaries and holidays anniversaries and holidays'>
<h2 id="anniversaries-and-holidays">Anniversaries and holidays</h2>

<div class="api_tags" data-tags="Anniversaries and holidays" data-tags-lower="anniversaries and holidays"></div>

<ul>
  <li><a href="#anniversary-year">Personalize messages based on a user’s anniversary year</a></li>
  <li><a href="#birthday-week">Personalize messages based on a user’s birthday week</a></li>
  <li><a href="#birthday-month">Send campaigns to users in their birthday month</a></li>
  <li><a href="#holiday-avoid">Avoid sending messages on major holidays</a></li>
</ul>

<h3 id="anniversary-year">Personalize messages based on a user’s anniversary year</h3>

<p>This use case shows how to calculate a user’s app anniversary based on their initial sign-up date and display different messages based on how many years they are celebrating.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">this_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%B"</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">this_day</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%d"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">anniversary_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${registration_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%B"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">anniversary_day</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${registration_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%d"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">anniversary_year</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${registration_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y"</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">this_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="nv">anniversary_month</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">this_day</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="nv">anniversary_day</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">anniversary_year</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'2021'</span><span class="w"> </span><span class="cp">%}</span>
Exactly one year ago today we met for the first time!

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">anniversary_year</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'2020'</span><span class="w"> </span><span class="cp">%}</span>
Exactly two years ago today we met for the first time!

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">anniversary_year</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'2019'</span><span class="w"> </span><span class="cp">%}</span>
Exactly three years ago today we met for the first time!

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Not<span class="w"> </span><span class="nv">same</span><span class="w"> </span><span class="nv">year</span><span class="s2">") %}
{% endif %}

{% else %} 
{% abort_message("</span><span class="nv">Not</span><span class="w"> </span><span class="nv">same</span><span class="w"> </span><span class="nv">day</span><span class="s2">") %} 
{% endif %}

{% else %}
{% abort_message("</span><span class="nv">Not</span><span class="w"> </span><span class="nv">same</span><span class="w"> </span><span class="nv">month</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Explanation:</strong> Here, we use the reserved variable <code class="language-plaintext highlighter-rouge">now</code> to template in the current date and time in <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601</a> format. The filters <code class="language-plaintext highlighter-rouge">%B</code> (month like “May”) and <code class="language-plaintext highlighter-rouge">%d</code> (day like “18”) format the current month and day. We then use the same date and time filters on the <code class="language-plaintext highlighter-rouge">signup_date</code> values to ensure we can compare the two values using conditional tags and logic.</p>

<p>Then we repeat three more variable statements to get the <code class="language-plaintext highlighter-rouge">%B</code> and <code class="language-plaintext highlighter-rouge">%d</code> for the <code class="language-plaintext highlighter-rouge">signup_date</code>, but also adding <code class="language-plaintext highlighter-rouge">%Y</code> (year like “2021”). This forms the date and time of the <code class="language-plaintext highlighter-rouge">signup_date</code> into just the year. Knowing the day and month lets us check if the user’s anniversary is today, and knowing the year tells us how many years it’s been—which lets us know how many years to congratulate them on!</p>

<p><strong>Tip:</strong></p>

<p>You can create as many conditions as years you’ve been collecting sign-up dates.</p>

<h3 id="birthday-week">Personalize messages based on a user’s birthday week</h3>

<p>This use case shows how to find a user’s birthday, compare it to the current date, and then display special birthday messages before, during, and after their birthday week.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">this_week</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%W'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">birthday_week</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{${date_of_birth}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%W'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_week</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{this_week}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">next_week</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{this_week}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">birthday_week_conversion</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{birthday_week}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{last_week}}<span class="w"> </span><span class="o">==</span><span class="w"> </span>{{birthday_week_conversion}}<span class="w"> </span><span class="cp">%}</span>
Happy birthday for last week!
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{birthday_week}}<span class="w"> </span><span class="o">==</span><span class="w"> </span>{{this_week}}<span class="w"> </span><span class="cp">%}</span>
Happy birthday for this week!
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{next_week}}<span class="w"> </span><span class="o">==</span><span class="w"> </span>{{birthday_week_conversion}}<span class="w"> </span><span class="cp">%}</span>
Happy birthday for next week!
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
No birthday for you!
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Explanation:</strong> Similar to the <a href="#anniversary-year">anniversary year</a> use case, here we take the reserved variable <code class="language-plaintext highlighter-rouge">now</code> and use the <code class="language-plaintext highlighter-rouge">%W</code> filter (week such as week 12 out of 52 in a year) to get the number week of the year that the user’s birthday falls within. If the user’s birthday week matches the current week, we send them a message congratulating them!</p>

<p>We also include statements for <code class="language-plaintext highlighter-rouge">last_week</code> and <code class="language-plaintext highlighter-rouge">next_week</code> to further personalize your messaging.</p>

<h3 id="birthday-month">Send campaigns to users in their birthday month</h3>

<p>This use case shows how to calculate a user’s birthday month, check if their birthday falls in the current month, and if so, send a special message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">this_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%B"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">birth_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{${date_of_birth}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%B"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{this_month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span>{{birth_month}}<span class="w"> </span><span class="cp">%}</span>
Message body 
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Not<span class="w"> </span><span class="nv">their</span><span class="w"> </span><span class="nv">birthday</span><span class="w"> </span><span class="nv">month</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Explanation:</strong> Similar to the <a href="#birthday-week">birthday week</a> use case, except here we use the <code class="language-plaintext highlighter-rouge">%B</code> filter (month like “May”) to calculate which users have a birthday this month. A potential application could be addressing birthday users in a monthly email.</p>

<h3 id="holiday-avoid">Avoid sending messages on major holidays</h3>

<p>This use case shows how to send messages during the holiday period while avoiding the days of major holidays, when engagement is likely to be low.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%Y-%m-%d'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"2023-12-24"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"2023-12-25"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"2023-12-26"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
Message if today isn't one of the provided holidays.
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Explanation:</strong> Here we assign the term <code class="language-plaintext highlighter-rouge">today</code> to the reserved variable <code class="language-plaintext highlighter-rouge">now</code> (the current date and time), using the filters <code class="language-plaintext highlighter-rouge">%Y</code> (year like “2023”), <code class="language-plaintext highlighter-rouge">%m</code> (month like “12”), and <code class="language-plaintext highlighter-rouge">%d</code> (day like “25”) to format the date. We then run our conditional statement to say that if the variable <code class="language-plaintext highlighter-rouge">today</code> matches the holiday days of your choice, then the message will be aborted.</p>

<p>The example provided uses Christmas Eve, Christmas Day, and Boxing Day (the day after Christmas).</p>

</div>

<div id='api_cnwglnmrlyrj' class='api_div' data-search-keywords='app usage app usage'>
<h2 id="app-usage">App usage</h2>

<div class="api_tags" data-tags="App usage" data-tags-lower="app usage"></div>

<ul>
  <li><a href="#app-session-language">Send messages in a user’s language if they haven’t logged a session</a></li>
  <li><a href="#app-last-opened">Personalize messages based on when a user last opened the app</a></li>
  <li><a href="#app-last-opened-less-than">Show a different message if a user last used the app less than three days ago</a></li>
</ul>

<h3 id="app-session-language">Send messages in a user’s language if they haven’t logged a session</h3>

<p>This use case checks if a user has logged a session, and if not, includes logic to display a message based on the language manually collected via a custom attribute, if any. If there is no language information tied to their account, it will display the message in the default language. If a user has logged a session, it will pull any language information tied to the user and display the appropriate message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{${last_used_app_date}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="kc">nil</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{custom_attribute.${user_language}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
Message in English based on custom attribute
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{custom_attribute.${user_language}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'fr'</span><span class="w"> </span><span class="cp">%}</span>
Message in French based on custom attribute
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
Does not have language - Default language
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
Message in English based on Language
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'fr'</span><span class="w"> </span><span class="cp">%}</span>
Message in French based on Language
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
Has language - Default language
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Explanation:</strong> Here, we’re using two grouped <code class="language-plaintext highlighter-rouge">if</code> statements, nested. The first <code class="language-plaintext highlighter-rouge">if</code> statement checks to see if the user has started a session by checking if the <code class="language-plaintext highlighter-rouge">last_used_app_date</code> is <code class="language-plaintext highlighter-rouge">nil</code>. This is because <code class="language-plaintext highlighter-rouge">{{${language}}}</code> is auto-collected by the SDK when a user logs a session. If the user hasn’t logged a session, we won’t have their language yet, so this checks if any language-related custom attributes have been saved, and based on that information, will display a message in that language, if possible.</p>

<p>The second <code class="language-plaintext highlighter-rouge">if</code> statement just checks for the standard (default) attribute because the user doesn’t have <code class="language-plaintext highlighter-rouge">nil</code> for the <code class="language-plaintext highlighter-rouge">last_used_app_date</code>, which means they’ve logged a session, and we have their language.</p>

<p><strong>Note:</strong></p>

<p><a href="https://shopify.github.io/liquid/basics/types/#nil"><code class="language-plaintext highlighter-rouge">Nil</code></a> is a reserved variable that is returned when Liquid code has no results. <code class="language-plaintext highlighter-rouge">Nil</code> is treated as <code class="language-plaintext highlighter-rouge">false</code> in an <code class="language-plaintext highlighter-rouge">if</code> block.</p>

<h3 id="app-last-opened">Personalize messages based on when a user last opened the app</h3>

<p>This use case calculates the last time a user opened your app and will display a different personalized message depending on the length of time.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_used_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{${last_used_app_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">now</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_in_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{now}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span>{{last_used_date}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{difference_in_days}}<span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">3</span><span class="w"> </span><span class="cp">%}</span>
Happy to see you again!
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
It's been a while; here are some of our latest updates.
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="app-last-opened-less-than">Show a different message if a user last used the app less than three days ago</h3>

<p>This use case calculates how long ago a user used your app, and depending on the length of time, will display a different personalized message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_used_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{${last_used_app_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">now</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_in_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{now}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span>{{last_used_date}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{difference_in_days}}<span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">3</span><span class="w"> </span><span class="cp">%}</span>
Message for a recently active user
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
Message for a less active user
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_yjlcanppeohd' class='api_div' data-search-keywords='countdowns countdowns'>
<h2 id="countdowns">Countdowns</h2>

<div class="api_tags" data-tags="Countdowns" data-tags-lower="countdowns"></div>

<ul>
  <li><a href="#countdown-add-x-days">Add X days to today’s date</a></li>
  <li><a href="#countdown-difference-days">Calculate a countdown from a set point in time</a></li>
  <li><a href="#countdown-shipping-options">Create a countdown for specific shipping dates and priorities</a></li>
  <li><a href="#countdown-days">Create a countdown in days</a></li>
  <li><a href="#countdown-dynamic">Create a countdown from days to hours to minutes</a></li>
  <li><a href="#countdown-future-date">Show how many days left until a certain date</a></li>
  <li><a href="#countdown-custom-date-attribute">Display how many days left until a custom date attribute will arrive</a></li>
  <li><a href="#countdown-abort-window">Display how much time is left, and abort the message if there’s only X time left</a></li>
  <li><a href="#countdown-membership-expiry">In-app message to send X days before user’s membership ends</a></li>
  <li><a href="#countdown-personalize-language">Personalize in-app messages based on user’s date and language</a></li>
  <li><a href="#countdown-template-date">Template in the date 30 days from now, formatted as month and day</a></li>
</ul>

<h3 id="countdown-add-x-days">Add x days to today’s date</h3>

<p>This use case adds a specific number of days to the current date to reference and add in messages. For example, you may want to send a mid-week message that shows events in the area for the weekend.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
</pre></td><td class="rouge-code"><pre>Here are the movies we're showing on <span class="cp">{{</span><span class="w"> </span><span class="s2">"now"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="s1">'%s'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="mi">259200</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="s2">"%F"</span><span class="w"> </span><span class="cp">}}</span>!
</pre></td></tr></tbody></table></code></pre></div></div>

<p>The <code class="language-plaintext highlighter-rouge">plus</code> value will always be in seconds, so we end with the filter <code class="language-plaintext highlighter-rouge">%F</code> to translate the seconds to days.</p>

<p><strong>Important:</strong></p>

<p>You may want to include a URL or deep link to a list of events in your message so you can send the user to a list of actions that are happening in the future.</p>

<h3 id="countdown-difference-days">Calculate a countdown from a set point in time</h3>

<p>This use case calculates the difference in days between a specific date and the current date. This difference can be used to display a countdown to your users.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">event_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'2023-12-31'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">event_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
you have <span class="cp">{{</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="cp">}}</span> days left!
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="countdown-shipping-options">Create a countdown for specific shipping dates and priorities</h3>

<p>This use case captures different shipping options, calculates the length of time it would take to receive, and displays messages encouraging users to purchase in time to receive their package by a certain date.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
31
32
33
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">standard_shipping_start</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2023-12-10T00:00-05:00"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">standard_shipping_end</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2023-12-20T13:00-05:00"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">express_shipping_end</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2023-12-22T24:00-05:00"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">overnight_shipping_end</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2023-12-23T24:00-05:00"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_s</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">standard_shipping_end</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_s_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference_s</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mf">86400.00</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">round</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_e</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">express_shipping_end</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_e_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference_e</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mf">86400.00</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">round</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_o</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">overnight_shipping_end</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_o_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference_o</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mf">86400.00</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">round</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">&gt;=</span><span class="w"> </span><span class="nv">standard_shipping_start</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">&lt;=</span><span class="w"> </span><span class="nv">standard_shipping_end</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">difference_s_days</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
This is the last day to order with standard shipping, so your order gets here on time for Christmas Eve!
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">difference_s_days</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="cp">%}</span>
There is <span class="cp">{{</span><span class="nv">difference_s_days</span><span class="cp">}}</span> day left to order with standard shipping, so your order gets here on time for Christmas Eve!

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
There are <span class="cp">{{</span><span class="nv">difference_s_days</span><span class="cp">}}</span> days left to order with standard shipping so your order gets here on time for Christmas Eve!
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="nv">standard_shipping_end</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="nv">express_shipping_end</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">difference_e_days</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="cp">%}</span>
There is <span class="cp">{{</span><span class="nv">difference_e_days</span><span class="cp">}}</span> day left to order with express shipping, so your order gets here on time for Christmas Eve!
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
There are <span class="cp">{{</span><span class="nv">difference_e_days</span><span class="cp">}}</span> days left to order with express shipping so your order gets here on time for Christmas Eve!
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">&gt;=</span><span class="w"> </span><span class="nv">express_shipping_end</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="nv">overnight_shipping_end</span><span class="w"> </span><span class="cp">%}</span>
This is the last day for overnight shipping so your order gets here on time for Christmas Eve!
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Unable<span class="w"> </span><span class="nv">to</span><span class="w"> </span><span class="nv">order</span><span class="w"> </span><span class="nv">and</span><span class="w"> </span><span class="nv">ship</span><span class="w"> </span><span class="nv">in</span><span class="w"> </span><span class="nv">time</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="countdown-days">Create a countdown in days</h3>

<p>This use case calculates the time left between a specific event and the current date and displays how many days are left until the event.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">event_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${last_selected_event_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w">  </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="nv">event_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
Your order will arrive in <span class="cp">{{</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="cp">}}</span> days!
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You will need a custom attribute field with a <code class="language-plaintext highlighter-rouge">date</code> value.</p>

<h3 id="countdown-dynamic">Create a countdown from days to hours to minutes</h3>

<p>This use case calculates the time left between a specific event and the current date. Depending on the time left until the event, it will change the time value (days, hours, minutes) to display different personalized messages.</p>

<p>For example, if there are two days until a customer’s order arrives, you might say, “Your order will arrive in 2 days.” Whereas if there’s less than a day, you could change it to “Your order will arrive in 17 hours.”</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w">  </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">scheme_finish</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2017-10-13T10:30:30"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_seconds</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="nv">scheme_finish</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_minutes</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference_seconds</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">60</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_hours</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference_seconds</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">3600</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference_seconds</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{difference_minutes}}<span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">59</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span>{{difference_minutes}}<span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">1440</span><span class="w"> </span><span class="cp">%}</span>
You have <span class="cp">{{</span><span class="nv">difference_hours</span><span class="cp">}}</span> hours left till your order arrives!
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{difference_minutes}}<span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">59</span><span class="w"> </span><span class="cp">%}</span>
You have <span class="cp">{{</span><span class="nv">difference_minutes</span><span class="cp">}}</span> minutes left till your order arrives!
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
You have <span class="cp">{{</span><span class="nv">difference_days</span><span class="cp">}}</span> days left till your order arrives!
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You will need a custom attribute field with a <code class="language-plaintext highlighter-rouge">date</code> value. You will also need to set time thresholds of when you want the time to be displayed in days, hours, and minutes.</p>

<h3 id="countdown-future-date">Show how many days left until a certain date</h3>

<p>This use case calculates the difference between the current date and future event date and displays a message noting how many days until the event.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">event_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'2024-01-15'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">event_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
There are <span class="cp">{{</span><span class="nv">difference_days</span><span class="cp">}}</span> days until your birthday!
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="countdown-custom-date-attribute">Display how many days left until a custom date attribute will arrive</h3>

<p>This use case calculates the difference in days between the current and future dates and displays a message if the difference matches a set number.</p>

<p>In this example, a user will receive a message within two days of the custom date attribute. Otherwise, the message will not be sent.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%j'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">surgery_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${surgery_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%j'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{surgery_date}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span>{{today}}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">2</span><span class="w"> </span><span class="cp">%}</span>
Your surgery is in 2 days on <span class="cp">{{</span><span class="nv">custom_attribute</span>.${surgery_date}}}<span class="w">
</span>{%<span class="w"> </span><span class="nv">else</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">abort_message</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">endif</span><span class="w"> </span>%}<span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="countdown-abort-window">Display how much time is left, and abort the message if there’s only x time left</h3>

<p>This use case will calculate how long until a certain date, and depending on the length (skipping messaging if the date is too soon), will display different personalized messages.</p>

<p>For example, “You have x hours left to buy your ticket for London”, but don’t send the message if it’s within two hours of flight time for London.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w">  </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">dep_time</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{event_properties.${outboundDate}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time_to_dep</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">dep_time</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{time_to_dep}}<span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">7200</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("OutboundDate<span class="w"> </span><span class="nv">less</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="mi">2</span><span class="w"> </span><span class="nv">hours</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{time_to_dep}}<span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">7200</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span>{{time_to_dep}}<span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
Don't forget to buy your ticket to <span class="cp">{{</span><span class="nv">event_properties</span>.${toStation}}}<span class="w"> </span><span class="nv">within</span><span class="w"> </span><span class="nv">next</span><span class="w"> </span><span class="mi">24</span><span class="w"> </span>hours!<span class="w">
</span>{%<span class="w"> </span><span class="nv">else</span><span class="w"> </span>%}<span class="w">
</span><span class="nv">Still</span><span class="w"> </span><span class="nv">traveling</span><span class="w"> </span><span class="nv">to</span><span class="w"> </span>{{event_properties.${toStation}}}<span class="w"> </span><span class="nv">in</span><span class="w"> </span><span class="nv">more</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="mi">24</span><span class="w"> </span>hours?<span class="w"> </span><span class="nv">Book</span><span class="w"> </span>now!<span class="w">
</span>{%<span class="w"> </span><span class="nv">endif</span><span class="w"> </span>%}<span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You will need a custom event property.</p>

<h3 id="countdown-membership-expiry">In-app message to send x days before users’ membership ends</h3>

<p>This use case captures your membership expiry date, calculates how long until it expires, and displays different messages based on how long until your membership expires.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">membership_expiry</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${membership_expiry_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">membership_expiry</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">4</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">&lt;=</span><span class="w"> </span><span class="mi">7</span><span class="w"> </span><span class="cp">%}</span>
You have <span class="cp">{{</span><span class="nv">difference_days</span><span class="cp">}}</span> days left in your trial, make sure you upgrade!

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">2</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">&lt;=</span><span class="w"> </span><span class="mi">4</span><span class="w"> </span><span class="cp">%}</span>
HURRY! You have <span class="cp">{{</span><span class="nv">difference_days</span><span class="cp">}}</span> days left in your trial, make sure you upgrade!

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">2</span><span class="w"> </span><span class="cp">%}</span>
LAST CHANCE! You have <span class="cp">{{</span><span class="nv">difference_days</span><span class="cp">}}</span> days left in your trial. Make sure you upgrade!

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
You have few days left in your trial. Make sure to upgrade!
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="countdown-personalize-language">Personalize in-app messages based on users’ date and language</h3>

<p>This use case calculates a countdown to an event, and based on a user’s language setting, will display the countdown in their language.</p>

<p>For example, you might send a series of upsell messages to users once a month to let them know how long an offer is still valid with four in-app messages:</p>

<ul>
  <li>Initial</li>
  <li>2 days left</li>
  <li>1 day left</li>
  <li>Final day</li>
</ul>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">end_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2021-04-16T23:59:59"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">end_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">divided_by</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{difference_days}}<span class="w"> </span><span class="o">&gt;=</span><span class="w"> </span><span class="mi">3</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'de'</span><span class="w"> </span><span class="cp">%}</span>

Hallo, das Angebot gilt bis zum 16.04.

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'ch'</span><span class="w"> </span><span class="cp">%}</span>
Grüezi, das Angebot gilt bis zum 16.04.

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
The offer is valid until 16.04.

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
The offer is valid until 16.04.

<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{difference_days}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">2</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'de'</span><span class="w"> </span><span class="cp">%}</span>
INSERT MESSAGE

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'ch'</span><span class="w"> </span><span class="cp">%}</span>
INSERT MESSAGE

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
INSERT MESSAGE

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
INSERT MESSAGE
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{difference_days}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'de'</span><span class="w"> </span><span class="cp">%}</span>
INSERT MESSAGE

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'ch'</span><span class="w"> </span><span class="cp">%}</span>
INSERT MESSAGE

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
INSERT MESSAGE

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
INSERT MESSAGE
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{difference_days}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'de'</span><span class="w"> </span><span class="cp">%}</span>
Hallo, das Angebot gilt noch heute.

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'ch'</span><span class="w"> </span><span class="cp">%}</span>
Hallo, das Angebot gilt noch heute.

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
Grüezi, das Angebot gilt noch heute.

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
Hi, the offer is only valid today.
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Calculation<span class="w"> </span><span class="nv">failed</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You will need to assign a <code class="language-plaintext highlighter-rouge">date</code> value and include abort logic if the given date falls outside of the date range. For exact day calculations, the assigned end date must include 23:59:59.</p>

<h3 id="countdown-template-date">Template in the date 30 days from now, formatted as month and day</h3>

<p>This use case will display the date 30 days from now to use in messaging.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">thirty_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">2592000</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%B %d"</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_depbguholxte' class='api_div' data-search-keywords='custom attribute custom attribute'>
<h2 id="custom-attribute">Custom attribute</h2>

<div class="api_tags" data-tags="Custom attribute" data-tags-lower="custom attribute"></div>

<ul>
  <li><a href="#attribute-matching">Personalize a message based on matching custom attributes</a></li>
  <li><a href="#attribute-monetary-difference">Subtract two custom attributes to display the difference as a monetary value</a></li>
  <li><a href="#attribute-first-name">Reference a user’s first name if their full name is stored in the first_name field</a></li>
</ul>

<h3 id="attribute-matching">Personalize a message based on matching custom attributes</h3>

<p>This use case checks if a user has specific custom attributes and, if so, will display different personalized messages.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">custom_attribute</span>.${hasShovel}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="kc">true</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span><span class="nv">custom_attribute</span>.${VisitToGroundTooTough}<span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
The ground is very hard. The dirt road goes East.
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">custom_attribute</span>.${hasShovel}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="kc">true</span><span class="w"> </span><span class="cp">%}</span>
The dirt road goes East.
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">custom_attribute</span>.${VisitToStart}<span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
The dirt road goes East.
The shovel here.
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
You are at a dead-end of a dirt road. The road goes to the east. In the distance, you can see that it will eventually fork off. The trees here are very tall royal palms, and they are spaced equidistant from each other.
There is a shovel here.
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="attribute-monetary-difference">Subtract two custom attributes to display the difference as a monetary value</h3>

<p>This use case captures two monetary custom attributes, then calculates and displays the difference to let users know how far they have to reach their goal.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">event_goal</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${last_selected_event_personal_goal}}}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">current_raised</span><span class="w"> </span><span class="o">=</span><span class="w">  </span>{{custom_attribute.${last_selected_event_personal_amount_raised}}}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="nv">event_goal</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">current_raised</span><span class="w"> </span><span class="cp">%}</span>
You only have $<span class="cp">{{</span><span class="w"> </span><span class="nv">difference</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">round</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">number_with_delimiter</span><span class="w"> </span><span class="cp">}}</span> left to raise!
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="attribute-first-name">Reference a user’s first name if their full name is stored in the first_name field</h3>

<p>This use case captures a user’s first name (if both first and last name are stored in a single field) and then uses this first name to display a welcome message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
</pre></td><td class="rouge-code"><pre><span class="cp">{{</span>${first_name}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">truncatewords</span><span class="p">:</span><span class="w"> </span><span class="mi">1</span><span class="p">,</span><span class="w"> </span><span class="s2">""</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">default</span><span class="p">:</span><span class="w"> </span><span class="s1">'hi'</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">name</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{${first_name}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">split</span><span class="p">:</span><span class="w"> </span><span class="s1">' '</span><span class="w"> </span><span class="cp">%}</span>
Hi <span class="cp">{{</span><span class="nv">name</span><span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="cp">}}</span>, here's your message!
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Explanation:</strong> The <code class="language-plaintext highlighter-rouge">split</code> filter turns the string held in <code class="language-plaintext highlighter-rouge">{{${first_name}}}</code> into an array. By using <code class="language-plaintext highlighter-rouge">{{name[0]}}</code>, we then only refer to the first item in the array, which is the user’s first name.</p>

</div>

<div id='api_nwktghcqbihd' class='api_div' data-search-keywords='custom event custom event attributes external_id'>
<h2 id="custom-event">Custom event</h2>

<div class="api_tags" data-tags="Custom event" data-tags-lower="custom event"></div>

<ul>
  <li><a href="#event-abort-push">Abort push notification if a custom event is within two hours of now</a></li>
  <li><a href="#event-three-times">Send a campaign each time a user performs a custom event three times</a></li>
  <li><a href="#event-purchased-one-category">Send a message to users who have only purchased from one category</a></li>
  <li><a href="#track">Track how many times a custom event occurred over the past month</a></li>
</ul>

<h3 id="event-abort-push">Abort push notification if a custom event is within two hours of now</h3>

<p>This use case calculates the time until an event, and depending on the amount of time left, will display different personalized messages.</p>

<p>For example, you may want to prevent a push from going out if a custom event property will pass in the next two hours. This example uses the scenario of an abandoned cart for a train ticket.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
10
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w">  </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">dep_time</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{event_properties.${outboundDate_Time}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time_to_dep</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">dep_time</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{time_to_dep}}<span class="w"> </span><span class="o">&lt;=</span><span class="w"> </span><span class="mi">7200</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("OutboundDate<span class="w"> </span><span class="nv">less</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="mi">2</span><span class="w"> </span><span class="nv">hours</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{time_to_dep}}<span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">7200</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span>{{time_to_dep}}<span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
Don't forget to buy your ticket to <span class="cp">{{</span><span class="nv">event_properties</span>.${toStation}}}<span class="w"> </span><span class="nv">within</span><span class="w"> </span><span class="nv">next</span><span class="w"> </span><span class="mi">24</span><span class="w"> </span><span class="nv">hours</span><span class="w">
</span>{%<span class="w"> </span><span class="nv">else</span><span class="w"> </span>%}<span class="w">
</span><span class="nv">Still</span><span class="w"> </span><span class="nv">traveling</span><span class="w"> </span><span class="nv">to</span><span class="w"> </span>{{event_properties.${toStation}}}<span class="w"> </span><span class="nv">in</span><span class="w"> </span><span class="nv">more</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="mi">24</span><span class="w"> </span>hours?<span class="w"> </span><span class="nv">Book</span><span class="w"> </span><span class="nv">now</span><span class="w">
</span>{%<span class="w"> </span><span class="nv">endif</span><span class="w"> </span>%}<span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="event-three-times">Send a campaign each time a user performs a custom event three times</h3>

<p>This use case checks if a user has performed a custom event three times, and if so, will display a message or send a campaign.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">cadence</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">custom_attribute</span>.${example}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">modulo</span><span class="p">:</span><span class="w"> </span><span class="mi">3</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">custom_attribute</span>.${example}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="nb">blank</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Error<span class="w"> </span><span class="nv">calculating</span><span class="w"> </span><span class="nv">cadence</span><span class="s2">") %}
{% elsif cadence != 0 %}
{% abort_message("</span><span class="nv">Skip</span><span class="w"> </span><span class="nv">message</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
Did you forget something in your shopping cart?
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You must have an event property of the custom event count or use a webhook to your Braze endpoint. This is to increment a custom attribute (<code class="language-plaintext highlighter-rouge">example_event_count</code>) every time the user performs the event. This example uses a cadence of three (1, 4, 7, 10, etc.). To start the cadence from zero (0, 3, 6, 9, etc.), remove <code class="language-plaintext highlighter-rouge">minus: 1</code>.</p>

<h3 id="event-purchased-one-category">Send a message to users who have only purchased from one category</h3>

<p>This use case captures a list of the categories a user has purchased from, and if only one purchase category exists, it will display a message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">category</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${categories_purchased}}}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">uniq_cat</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{category<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">uniq</span><span class="w"> </span><span class="cp">}}</span> %}
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{uniq_cat<span class="w"> </span>|<span class="w"> </span><span class="nv">size</span>}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">uniq_cat</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Purchase<span class="w"> </span><span class="nv">category</span><span class="w"> </span><span class="nv">doesn</span>'t<span class="w"> </span><span class="nv">exist</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="track">Track how many times a custom event occurred over the past month</h3>

<p>This use case calculates the number of times a custom event has been logged between the 1st of the current month and the previous month. You can then run an users/track call to update store this value as a custom attribute. Note that this campaign would need to run for two consecutive months before monthly data can be used.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
31
32
33
34
35
</pre></td><td class="rouge-code"><pre>
<span class="cp">{%</span><span class="w"> </span><span class="nt">capture</span><span class="w"> </span><span class="nv">body</span><span class="w"> </span><span class="cp">%}</span>
{
 "braze_id": "<span class="cp">{{</span>${braze_id}}}",<span class="w">
 </span><span class="s2">"fields_to_export"</span><span class="p">:</span><span class="w"> </span><span class="p">[</span><span class="s2">"custom_events"</span><span class="p">]</span><span class="w">
</span>}<span class="w">

</span>{%<span class="w"> </span><span class="nv">endcapture</span><span class="w"> </span>%}<span class="w">

</span>{%<span class="w"> </span><span class="nv">connected_content</span><span class="w"> </span>YOUR_BRAZE_ENDPOINT/users/export/ids<span class="w">
 </span><span class="p">:</span><span class="nv">method</span><span class="w"> </span><span class="nv">post</span><span class="w">
  </span><span class="p">:</span><span class="nv">headers</span><span class="w"> </span>{<span class="w"> </span><span class="s2">"Authorization"</span><span class="p">:</span><span class="w"> </span><span class="s2">"Bearer YOUR_API_KEY"</span><span class="w"> </span>}<span class="w">
  </span><span class="p">:</span><span class="nv">body</span><span class="w"> </span>{{body}}<span class="w">
 </span><span class="p">:</span><span class="nv">content_type</span><span class="w"> </span>application/json<span class="w">
 </span><span class="p">:</span><span class="nv">save</span><span class="w"> </span><span class="nv">response</span><span class="w">
  </span><span class="p">:</span><span class="nv">retry</span><span class="w"> </span>%}<span class="w">

</span>{%<span class="w"> </span><span class="nv">for</span><span class="w"> </span><span class="nv">custom_event</span><span class="w"> </span><span class="nv">in</span><span class="w"> </span><span class="nv">response</span><span class="p">.</span><span class="nv">users</span><span class="p">[</span><span class="mi">0</span><span class="p">].</span><span class="nv">custom_events</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">assign</span><span class="w"> </span><span class="nv">ce_name</span><span class="w"> </span>=<span class="w"> </span><span class="nv">custom_event</span><span class="p">.</span><span class="nv">name</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">comment</span><span class="w"> </span>%}<span class="w"> </span><span class="nv">The</span><span class="w"> </span><span class="nv">following</span><span class="w"> </span><span class="nv">custom</span><span class="w"> </span><span class="nv">event</span><span class="w"> </span><span class="nv">name</span><span class="w"> </span><span class="nv">will</span><span class="w"> </span><span class="nv">need</span><span class="w"> </span><span class="nv">to</span><span class="w"> </span><span class="nv">be</span><span class="w"> </span><span class="nv">amended</span><span class="w"> </span><span class="nv">for</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">target</span><span class="w"> </span><span class="nv">custom</span><span class="w"> </span><span class="nv">event</span>.<span class="w"> </span>{%<span class="w"> </span><span class="nv">endcomment</span><span class="w"> </span>%}<span class="w">

</span>{%<span class="w"> </span><span class="nv">if</span><span class="w"> </span><span class="nv">ce_name</span><span class="w"> </span>==<span class="w"> </span><span class="s2">"Project Exported"</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">comment</span><span class="w"> </span>%}{{custom_event.name}}:<span class="w"> </span>{{custom_event.count}}{%<span class="w"> </span><span class="nv">endcomment</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">assign</span><span class="w"> </span><span class="nv">current_count</span><span class="w"> </span>=<span class="w"> </span><span class="nv">custom_event</span><span class="p">.</span><span class="nv">count</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">endif</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">endfor</span><span class="w"> </span>%}<span class="w">

</span>{%<span class="w"> </span><span class="nv">assign</span><span class="w"> </span><span class="nv">prev_month_count</span><span class="w"> </span>=<span class="w"> </span>{{custom_attribute.${projects_exported_prev_month}}}<span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">assign</span><span class="w"> </span><span class="nv">latest_count</span><span class="w"> </span>=<span class="w"> </span><span class="nv">current_count</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">prev_month_count</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">now</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"now"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%s"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">yesterday</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{now}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="mi">86400</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">previous_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{yesterday}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%B"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">previous_year</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{yesterday}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%y"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">formatted_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">previous_month</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">downcase</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">The Custom Event name that is being tracked will be needed to be amended for the target Custom Event in the Attribute Name below. </span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<div class="language-json highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
</pre></td><td class="rouge-code"><pre><span class="nl">"attributes"</span><span class="p">:</span><span class="w"> </span><span class="p">[</span><span class="w">
  </span><span class="p">{</span><span class="w">
    </span><span class="nl">"external_id"</span><span class="p">:</span><span class="s2">"{{${user_id}}}"</span><span class="p">,</span><span class="w">
       </span><span class="nl">"projects_exported_{{formatted_month}}_{{previous_year}}"</span><span class="p">:</span><span class="w"> </span><span class="s2">"{{latest_count}}"</span><span class="w">
  </span><span class="p">}</span><span class="w">
</span><span class="p">]</span><span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_jdwbbcueoawk' class='api_div' data-search-keywords='language language'>
<h2 id="language">Language</h2>

<div class="api_tags" data-tags="Language" data-tags-lower="language"></div>

<ul>
  <li><a href="#language-display-month">Display month names in a different language</a></li>
  <li><a href="#language-image-display">Display an image based on a user’s language</a></li>
  <li><a href="#language-personalize-message">Personalize messaging based on day of the week and user’s language</a></li>
</ul>

<h3 id="language-display-month">Display month names in a different language</h3>

<p>This use case will display the current date, month, and year, with the month in a different language. The example provided uses Swedish.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">day</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%e"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">year</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w">  </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%B"</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'January'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> Januari <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'February'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> Februari <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'March'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> Mars <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'April'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> April <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'May'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> Maj <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'June'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> Juni <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'July'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> Juli <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'August'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> Augusti <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'September'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> September <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'October'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> Oktober <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'November'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> November <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{month}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'December'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">day</span><span class="cp">}}</span> December <span class="cp">{{</span><span class="nv">year</span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="language-image-display">Display an image based on a user’s language</h3>

<p>This use case will display an image based on a user’s language. Note that this use case has only been tested with images uploaded to the Braze media library.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
English image URL (for example, https://cdn-staging.braze.com/appboy/communication/assets/image_assets/images/60aecba96a93150c749b4d57/original.png?1622068137)
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'ru'</span><span class="w"> </span><span class="cp">%}</span>
Russian image URL
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'es'</span><span class="w"> </span><span class="cp">%}</span>
Spanish image URL
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
Fallback image URL
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="language-personalize-message">Personalize messaging based on day of the week and user’s language</h3>

<p>This use case checks the current day of the week and, based on the day, if the user’s language is set to one of the language options provided, it will display a specific message in their language.</p>

<p>The example provided stops on Tuesday but can be repeated for each day of the week.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
31
32
33
34
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w">  </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%A'</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'Monday'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'es'</span><span class="w"> </span><span class="cp">%}</span>
Compra hoy y lleva tu aprendizaje de idiomas a niveles más altos. 🚀

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
Purchase today and take your language learning to the next level. 🚀

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'zh'</span><span class="w"> </span><span class="cp">%}</span>
今天就购买并将您的语言提高到一个新水平吧。🚀

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
It's Monday, but the language doesn't match 
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'Tuesday'</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'zh'</span><span class="w"> </span><span class="cp">%}</span>
不要忘记解锁以获取完整版本哦。🔓

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'en'</span><span class="w"> </span><span class="cp">%}</span>
Don't forget to unlock the full version of your language. 🔓

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'ja'</span><span class="w"> </span><span class="cp">%}</span>
すべての機能を使ってみませんか 🔓

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>${language}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'es'</span><span class="w"> </span><span class="cp">%}</span>
No te olivides de desbloquear la versión completa del programa de idiomas. 🔓

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
tuesday default
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_gxisxvuzrhfg' class='api_div' data-search-keywords='miscellaneous miscellaneous'>
<h2 id="miscellaneous">Miscellaneous</h2>

<div class="api_tags" data-tags="Miscellaneous" data-tags-lower="miscellaneous"></div>

<ul>
  <li><a href="#misc-avoid-blocked-emails">Avoid sending emails to customers that have blocked marketing emails</a></li>
  <li><a href="#misc-personalize-content">Use a customer’s subscription state to personalize content in messages</a></li>
  <li><a href="#misc-capitalize-words-string">Capitalize the first letter of every word in a string</a></li>
  <li><a href="#misc-compare-array">Compare custom attribute value against an array</a></li>
  <li><a href="#misc-event-reminder">Create an upcoming event reminder</a></li>
  <li><a href="#misc-string-in-array">Find a string within an array</a></li>
  <li><a href="#misc-largest-value">Find the largest value in an array</a></li>
  <li><a href="#misc-smallest-value">Find the smallest value in an array</a></li>
  <li><a href="#misc-query-end-of-string">Query the end of a string</a></li>
  <li><a href="#misc-query-array-values">Query values in an array from a custom attribute with multiple combinations</a></li>
  <li><a href="#phone-number">Format a string into a phone number</a></li>
</ul>

<h3 id="misc-avoid-blocked-emails">Avoid sending emails to customers that have blocked marketing emails</h3>

<p>This use case takes a list of blocked users saved in a Content Block and checks those blocked users are not communicated to or targeted in upcoming campaigns or Canvases.</p>

<p><strong>Important:</strong></p>

<p>To use this Liquid, first save the list of blocked emails within a Content Block. The list should have no additional spaces or characters inserted between email addresses (for example, <code class="language-plaintext highlighter-rouge">test@braze.com,abc@braze.com</code>).</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">blocked_emails</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{content_blocks.${BlockedEmailList}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">split</span><span class="p">:</span><span class="w"> </span><span class="s1">','</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">for</span><span class="w"> </span><span class="nv">email</span><span class="w"> </span><span class="nt">in</span><span class="w"> </span><span class="nv">blocked_emails</span><span class="w"> </span><span class="cp">%}</span>
    <span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{${email_address}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="nv">email</span><span class="w"> </span><span class="cp">%}</span>
    <span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Email<span class="w"> </span><span class="nv">is</span><span class="w"> </span><span class="nv">blocked</span>")<span class="w"> </span><span class="cp">%}</span>
    <span class="cp">{%</span><span class="w"> </span><span class="kr">break</span><span class="w"> </span><span class="cp">%}</span>
    <span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endfor</span><span class="w"> </span><span class="cp">%}</span> 
Your message here!
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Explanation:</strong> Here we check if your potential recipient’s email is in this list by referencing the Content Block of blocked emails. If the email is found, the message will not send.</p>

<p><strong>Note:</strong></p>

<p>Content Blocks have a size limit of 5 MB.</p>

<h3 id="misc-personalize-content">Use a customer’s subscription state to personalize content in messages</h3>

<p>This use case takes a customer’s subscription state to send personalized content. Customers are who subscribed to a specific subscription group will receive an exclusive message for email subscription groups.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{subscribed_state.${subscription_group_id}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'subscribed'</span><span class="w"> </span><span class="cp">%}</span>
This is an exclusive message for subscribed users!
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span> This is the default message for other users.
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="misc-capitalize-words-string">Capitalize the first letter of every word in a string</h3>

<p>This use case takes a string of words, splits them into an array, and capitalizes the first letter of each word.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">words_array</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${address}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">split</span><span class="p">:</span><span class="w"> </span><span class="s1">' '</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">for</span><span class="w"> </span><span class="nv">words</span><span class="w"> </span><span class="nt">in</span><span class="w"> </span>{{words_array}}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="w"> </span><span class="nv">words</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">capitalize</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">append</span><span class="p">:</span><span class="w"> </span><span class="s1">' '</span><span class="w"> </span><span class="cp">}}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endfor</span><span class="w"> </span><span class="cp">%}</span> 
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Explanation:</strong> Here we’ve assigned a variable to our chosen string attribute, and used the <code class="language-plaintext highlighter-rouge">split</code> filter to split the string into an array. We’ve then used the <code class="language-plaintext highlighter-rouge">for</code> tag to assign the variable <code class="language-plaintext highlighter-rouge">words</code> to each of the items in our newly created array, before displaying those words with the <code class="language-plaintext highlighter-rouge">capitalize</code> filter and the <code class="language-plaintext highlighter-rouge">append</code> filter to add spaces between each of the terms.</p>

<h3 id="misc-compare-array">Compare custom attribute value against an array</h3>

<p>This use case takes a list of favorite stores, checks if any of a user’s favorite stores are in that list, and if so, will display a special offer from those stores.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">favorite_stores</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'Target,Walmart,Costco'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">split</span><span class="p">:</span><span class="w"> </span><span class="s1">','</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">for</span><span class="w"> </span><span class="nv">store</span><span class="w"> </span><span class="nt">in</span><span class="w"> </span><span class="nv">favorite_stores</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{custom_attribute.${favorited_stores}}}<span class="w"> </span><span class="ow">contains</span><span class="w"> </span>{{store}}<span class="w"> </span><span class="cp">%}</span>
Today's offer from <span class="cp">{{</span><span class="nv">store</span><span class="cp">}}</span>

<span class="cp">{%</span><span class="w"> </span><span class="kr">break</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("No<span class="w"> </span><span class="nv">attribute</span><span class="w"> </span><span class="nv">found</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endfor</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>This sequence has a <code class="language-plaintext highlighter-rouge">break</code> tag in the primary conditional statement. This causes the loop to stop when a match is found. If you want to display many or all matches, remove the <code class="language-plaintext highlighter-rouge">break</code> tag.</p>

<h3 id="misc-event-reminder">Create an upcoming event reminder</h3>

<p>This use case allows users to set up upcoming reminders based on custom events. The example scenario allows a user to set a reminder for a policy renewal date that is 26 or more days away, where reminders are sent 26, 13, 7, or 2 days before the policy renewal date.</p>

<p>With this use case, the following should go in the body of a <a href="/docs/user_guide/channels/webhooks/create_a_webhook/">webhook campaign</a> or Canvas step.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">
Depending on how the reminder_capture property is passed to Braze, with/without a timestamp, the number of days could impact whether a user falls on either side of the 26/13/7/2-day windows.
Once users have been assigned to a Reminder journey/flow, they are then scheduled to enter a subsequent Canvas.
This 'Event Listener' can be used to split out users into different journeys based on the Custom Event properties sent to Braze.
</span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">
When testing, make sure the campaign ID, campaign API endpoint, Canvas ID, Canvas API endpoint are entered correctly. In this example, the Canvas ID and Canvas API endpoint have been set up for sharing with the client. In practice, this can be testing using a campaign ID and Campaign API endpoint.
</span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">
The following step calculates how much there is between today's date and the Reminder Date as 'time_to_reminder'.
</span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"now"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%s'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">reminder_start_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{event_properties.${reminder_date}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%s'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time_to_reminder</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">reminder_start_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">
The following step checks if the time_to_reminder is more than 26 days away; if this is true, then the user is scheduled to enter the subsequent Canvas 26 days before the reminder_date.
The time is converted from 'seconds from 1970' to the appropriate Reminder Date in the required ISO 8601 format.
N.B. Additional time zones would need to be catered for by adding an additional API Schedule property of "in_local_time"
</span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{time_to_reminder}}<span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">2246400</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time_to_first_message</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">reminder_start_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">2246400</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="w"> </span><span class="nv">time_to_first_message</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%Y-%m-%dT%H:%M'</span><span class="w"> </span><span class="cp">}}</span>
{
"canvas_id": "954e15bc-af93-9dc8-a863-ad2580f1750e",
"recipients": [
{
"external_user_id": "<span class="cp">{{</span>${user_id}}}"<span class="w">
</span>}<span class="w">
</span><span class="p">],</span><span class="w">
</span><span class="s2">"trigger_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span>{<span class="w">
</span><span class="s2">"enquiry_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${reminder_id}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"reminder_date"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${reminder_date} | date: '%Y-%m-%dT%H:%M:%S+0000'}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_X"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_x}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_Y"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_y}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_Z"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_z}}}"</span><span class="w">
</span>},<span class="w">

</span><span class="s2">"schedule"</span><span class="p">:</span><span class="w"> </span>{<span class="w">
</span><span class="s2">"time"</span><span class="p">:</span><span class="w"> </span><span class="s2">"{{ time_to_first_message | date: '%Y-%m-%dT%H:%M:%S+0000' }}"</span><span class="w">
</span>}<span class="w">
</span>}<span class="w">

</span>{%<span class="w"> </span><span class="nv">comment</span><span class="w"> </span>%}<span class="w">
</span><span class="nv">The</span><span class="w"> </span><span class="nv">following</span><span class="w"> </span><span class="nv">step</span><span class="w"> </span><span class="nv">checks</span><span class="w"> </span><span class="nv">if</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">time_to_reminder</span><span class="w"> </span><span class="nv">is</span><span class="w"> </span><span class="nv">less</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="mi">26</span><span class="w"> </span><span class="nv">days</span><span class="w"> </span><span class="nv">away</span><span class="w"> </span><span class="nv">but</span><span class="w"> </span><span class="nv">more</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="mi">13</span><span class="w"> </span><span class="nv">days</span><span class="w"> </span><span class="nv">away</span>.<span class="w">
</span><span class="nv">Users</span><span class="w"> </span><span class="nv">are</span><span class="w"> </span><span class="nv">scheduled</span><span class="w"> </span><span class="nv">to</span><span class="w"> </span><span class="nv">enter</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">journey</span><span class="w"> </span><span class="nv">on</span><span class="w"> </span><span class="nv">day</span><span class="w"> </span><span class="mi">13</span>.<span class="w">
</span>{%<span class="w"> </span><span class="nv">endcomment</span><span class="w"> </span>%}<span class="w">

</span>{%<span class="w"> </span><span class="nv">elsif</span><span class="w"> </span><span class="mi">1123200</span><span class="w"> </span>&gt;<span class="w"> </span>{{time_to_reminder}}<span class="w"> </span><span class="nv">and</span><span class="w"> </span>{{time_to_reminder}}<span class="w"> </span>&lt;<span class="w"> </span><span class="mi">2246399</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">assign</span><span class="w"> </span><span class="nv">time_to_first_message</span><span class="w"> </span>=<span class="w"> </span><span class="nv">reminder_start_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">1123200</span><span class="w"> </span><span class="cp">%}</span>

{
"canvas_id": "954e15bc-af93-9dc8-a863-ad2580f1750e",
"recipients": [
{
"external_user_id": "<span class="cp">{{</span>${user_id}}}"<span class="w">
</span>}<span class="w">
</span><span class="p">],</span><span class="w">
</span><span class="s2">"trigger_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span>{<span class="w">
</span><span class="s2">"enquiry_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${reminder_id}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"reminder_date"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${reminder_date} | date: '%Y-%m-%dT%H:%M:%S+0000'}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_X"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_x}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_Y"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_y}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_Z"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_z}}}"</span><span class="w">
</span>},<span class="w">

</span><span class="s2">"schedule"</span><span class="p">:</span><span class="w"> </span>{<span class="w">
</span><span class="s2">"time"</span><span class="p">:</span><span class="w"> </span><span class="s2">"{{ time_to_first_message | date: '%Y-%m-%dT%H:%M:%S+0000' }}"</span><span class="w">
</span>}<span class="w">
</span>}<span class="w">

</span>{%<span class="w"> </span><span class="nv">comment</span><span class="w"> </span>%}<span class="w">
</span><span class="nv">The</span><span class="w"> </span><span class="nv">following</span><span class="w"> </span><span class="nv">step</span><span class="w"> </span><span class="nv">checks</span><span class="w"> </span><span class="nv">if</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">time_to_reminder</span><span class="w"> </span><span class="nv">is</span><span class="w"> </span><span class="nv">less</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="mi">13</span><span class="w"> </span><span class="nv">days</span><span class="w"> </span><span class="nv">away</span><span class="w"> </span><span class="nv">but</span><span class="w"> </span><span class="nv">more</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="nv">seven</span><span class="w"> </span><span class="nv">days</span><span class="w"> </span><span class="nv">away</span>.<span class="w">
</span><span class="nv">Users</span><span class="w"> </span><span class="nv">are</span><span class="w"> </span><span class="nv">scheduled</span><span class="w"> </span><span class="nv">to</span><span class="w"> </span><span class="nv">enter</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">journey</span><span class="w"> </span><span class="nv">on</span><span class="w"> </span><span class="nv">day</span><span class="w"> </span><span class="mi">7</span>.<span class="w">
</span>{%<span class="w"> </span><span class="nv">endcomment</span><span class="w"> </span>%}<span class="w">

</span>{%<span class="w"> </span><span class="nv">elsif</span><span class="w"> </span><span class="mi">604800</span><span class="w"> </span>&gt;<span class="w"> </span>{{time_to_reminder}}<span class="w"> </span><span class="nv">and</span><span class="w"> </span>{{time_to_reminder}}<span class="w"> </span>&lt;<span class="w"> </span><span class="mi">1123199</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">assign</span><span class="w"> </span><span class="nv">time_to_first_message</span><span class="w"> </span>=<span class="w"> </span><span class="nv">reminder_start_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">604800</span><span class="w"> </span><span class="cp">%}</span>

{
"canvas_id": "954e15bc-af93-9dc8-a863-ad2580f1750e",
"recipients": [
{
"external_user_id": "<span class="cp">{{</span>${user_id}}}"<span class="w">
</span>}<span class="w">
</span><span class="p">],</span><span class="w">
</span><span class="s2">"trigger_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span>{<span class="w">
</span><span class="s2">"enquiry_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${reminder_id}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"reminder_date"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${reminder_date} | date: '%Y-%m-%dT%H:%M:%S+0000'}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_X"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_x}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_Y"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_y}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_Z"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_z}}}"</span><span class="w">
</span>},<span class="w">

</span><span class="s2">"schedule"</span><span class="p">:</span><span class="w"> </span>{<span class="w">
</span><span class="s2">"time"</span><span class="p">:</span><span class="w"> </span><span class="s2">"{{ time_to_first_message | date: '%Y-%m-%dT%H:%M:%S+0000' }}"</span><span class="w">
</span>}<span class="w">
</span>}<span class="w">

</span>{%<span class="w"> </span><span class="nv">comment</span><span class="w"> </span>%}<span class="w">
</span><span class="nv">The</span><span class="w"> </span><span class="nv">following</span><span class="w"> </span><span class="nv">step</span><span class="w"> </span><span class="nv">checks</span><span class="w"> </span><span class="nv">if</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">time_to_reminder</span><span class="w"> </span><span class="nv">is</span><span class="w"> </span><span class="nv">less</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="nv">seven</span><span class="w"> </span><span class="nv">days</span><span class="w"> </span><span class="nv">away</span><span class="w"> </span><span class="nv">but</span><span class="w"> </span><span class="nv">more</span><span class="w"> </span><span class="nv">than</span><span class="w"> </span><span class="nv">two</span><span class="w"> </span><span class="nv">days</span><span class="w"> </span><span class="nv">away</span>.<span class="w">
</span><span class="nv">Users</span><span class="w"> </span><span class="nv">are</span><span class="w"> </span><span class="nv">scheduled</span><span class="w"> </span><span class="nv">to</span><span class="w"> </span><span class="nv">enter</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">journey</span><span class="w"> </span><span class="nv">on</span><span class="w"> </span><span class="nv">day</span><span class="w"> </span><span class="mi">2</span>.<span class="w">
</span>{%<span class="w"> </span><span class="nv">endcomment</span><span class="w"> </span>%}<span class="w">

</span>{%<span class="w"> </span><span class="nv">elsif</span><span class="w"> </span>{{time_to_reminder}}<span class="w"> </span>&lt;<span class="w"> </span><span class="mi">604799</span><span class="w"> </span><span class="nv">and</span><span class="w"> </span>{{time_to_reminder}}<span class="w"> </span>&gt;<span class="w"> </span><span class="mi">172860</span><span class="w"> </span>%}<span class="w">
</span>{%<span class="w"> </span><span class="nv">assign</span><span class="w"> </span><span class="nv">time_to_first_message</span><span class="w"> </span>=<span class="w"> </span><span class="nv">reminder_start_date</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">172800</span><span class="w"> </span><span class="cp">%}</span>

{
"canvas_id": "954e15bc-af93-9dc8-a863-ad2580f1750e",
"recipients": [
{
"external_user_id": "<span class="cp">{{</span>${user_id}}}"<span class="w">
</span>}<span class="w">
</span><span class="p">],</span><span class="w">
</span><span class="s2">"trigger_properties"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span>{<span class="w">
</span><span class="s2">"enquiry_id"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${reminder_id}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"reminder_date"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${reminder_date} | date: '%Y-%m-%dT%H:%M:%S+0000'}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_X"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_x}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_Y"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_y}}}"</span><span class="p">,</span><span class="w">
</span><span class="s2">"message_personalisation_Z"</span><span class="w"> </span><span class="p">:</span><span class="w"> </span><span class="s2">"{{event_properties.${property_z}}}"</span><span class="w">
</span>},<span class="w">

</span><span class="s2">"schedule"</span><span class="p">:</span><span class="w"> </span>{<span class="w">
</span><span class="s2">"time"</span><span class="p">:</span><span class="w"> </span><span class="s2">"{{ time_to_first_message | date: '%Y-%m-%dT%H:%M:%S+0000' }}"</span><span class="w">
</span>}<span class="w">
</span>}<span class="w">
</span>{%<span class="w"> </span><span class="nv">endif</span><span class="w"> </span>%}<span class="w">
</span></pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You will need a custom event <code class="language-plaintext highlighter-rouge">reminder_capture</code>, and the custom event properties must include at least:</p>

<ul>
  <li><code class="language-plaintext highlighter-rouge">reminder-id</code>: Identifier of the custom event</li>
  <li><code class="language-plaintext highlighter-rouge">reminder_date</code>: User-submitted date when their reminder is due</li>
  <li><code class="language-plaintext highlighter-rouge">message_personalisation_X</code>: Any properties needed to personalize the message at the time of sending</li>
</ul>

<h3 id="misc-string-in-array">Find a string within an array</h3>

<p>This use case checks if a custom attribute array contains a specific string, and if it exists, will display a specific message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">custom_attribute</span>.${PartnershipProgramsNotLinked}<span class="w"> </span><span class="ow">contains</span><span class="w"> </span><span class="s1">'Hertz'</span><span class="w"> </span><span class="cp">%}</span>
Link your Hertz account to use Hertz Fast Lane.
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="misc-largest-value">Find the largest value in an array</h3>

<p>This use case calculates the highest value in a given custom attribute array to use in user messaging.</p>

<p>For example, you may want to show a user what the current high score is or the highest bid on an item.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">maxValue</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">for</span><span class="w"> </span><span class="nv">attribute</span><span class="w"> </span><span class="nt">in</span><span class="w"> </span>{{custom_attribute.${array_attribute}}}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">compareValue</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{attribute<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="cp">}}</span> %}
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">compareValue</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="nv">maxValue</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">maxValue</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">compareValue</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endfor</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">maxValue</span><span class="cp">}}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You must use a custom attribute that has an integer value and is part of an array (list).</p>

<h3 id="misc-smallest-value">Find the smallest value in an array</h3>

<p>This use case calculates the lowest value in a given custom attribute array to use in user messaging.</p>

<p>For example, you may want to show a user what the lowest score is or the cheapest item.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">minValue</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">custom_attribute</span>.${array_attribute}[0]<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">for</span><span class="w"> </span><span class="nv">attribute</span><span class="w"> </span><span class="nt">in</span><span class="w"> </span>{{custom_attribute.${array_attribute}}}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">compareValue</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{attribute<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="cp">}}</span> %}
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">compareValue</span><span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="nv">minValue</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">minValue</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">compareValue</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endfor</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">minValue</span><span class="cp">}}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You must use a custom attribute that has an integer value and is part of an array (list).</p>

<h3 id="misc-query-end-of-string">Query the end of a string</h3>

<p>This use case queries the end of a string to use in messaging.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">interest</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{custom_attribute.${Buyer<span class="w"> </span><span class="nv">Interest</span>}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">first</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">marketplace</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">interest</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">split</span><span class="p">:</span><span class="w"> </span><span class="s2">""</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">reverse</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">join</span><span class="p">:</span><span class="w"> </span><span class="s2">""</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">truncate</span><span class="p">:</span><span class="w"> </span><span class="mi">4</span><span class="p">,</span><span class="w"> </span><span class="s2">""</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{marketplace}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'3243'</span><span class="w"> </span><span class="cp">%}</span>

Your last marketplace search was on <span class="cp">{{</span><span class="nv">custom_attribute</span>.${Last<span class="w"> </span><span class="nv">marketplace</span><span class="w"> </span><span class="nv">buyer</span><span class="w"> </span><span class="nv">interest</span>}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%d.%m.%Y'</span><span class="cp">}}</span>. Check out all of our new offers.

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>()<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="misc-query-array-values">Query values in an array from a custom attribute with multiple combinations</h3>

<p>This use case takes a list of soon-to-be-expired shows, checks if any of a user’s favorite shows are in that list, and if so, will display a message notifying the user that they will expire soon.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">expired_shows</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'Modern Family,The Rookie,Body of Proof,Felicity'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">split</span><span class="p">:</span><span class="w"> </span><span class="s1">','</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">for</span><span class="w"> </span><span class="nv">show</span><span class="w"> </span><span class="nt">in</span><span class="w"> </span><span class="nv">expired_shows</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{custom_attribute.${Favorite<span class="w"> </span><span class="nv">Shows</span>}}}<span class="w"> </span><span class="ow">contains</span><span class="w"> </span>{{show}}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">new_shows</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">new_shows</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">append</span><span class="p">:</span><span class="w"> </span>{{show}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">append</span><span class="p">:</span><span class="w"> </span><span class="s1">'*'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endfor</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">new_shows_clean</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">new_shows</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">split</span><span class="p">:</span><span class="w"> </span><span class="s1">'*'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">new_shows_clean</span><span class="p">.</span><span class="nf">size</span><span class="w"> </span><span class="o">!=</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>

All episodes of <span class="cp">{{</span><span class="nv">new_shows_clean</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">join</span><span class="p">:</span><span class="w"> </span><span class="s1">', '</span><span class="w"> </span><span class="cp">}}</span> expire on 9/8 - watch them now before they're gone!

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Not<span class="w"> </span><span class="nv">found</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Important:</strong></p>

<p>You will need to find matches between the arrays first, then build logic at the end to split up the matches.</p>

<h3 id="phone-number">Format a string into a phone number</h3>

<p>This use case shows you how to index the <code class="language-plaintext highlighter-rouge">phone_number</code> user profile field (by default, formatted as a string of integers), and reformat it based on your local phone number standards. For example, 1234567890 to (123)-456-7890.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">phone</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{${phone_number}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">remove</span><span class="p">:</span><span class="w"> </span><span class="s2">"-"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">split</span><span class="p">:</span><span class="w"> </span><span class="s1">''</span><span class="w"> </span><span class="cp">%}</span>

(<span class="cp">{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="w"> </span><span class="cp">}}{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">1</span><span class="p">]</span><span class="w"> </span><span class="cp">}}{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">2</span><span class="p">]</span><span class="w"> </span><span class="cp">}}</span>)-<span class="cp">{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">3</span><span class="p">]</span><span class="w"> </span><span class="cp">}}{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">4</span><span class="p">]</span><span class="w"> </span><span class="cp">}}{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">5</span><span class="p">]</span><span class="w"> </span><span class="cp">}}</span>-<span class="cp">{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">6</span><span class="p">]</span><span class="w"> </span><span class="cp">}}{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">7</span><span class="p">]</span><span class="w"> </span><span class="cp">}}{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">8</span><span class="p">]</span><span class="w"> </span><span class="cp">}}{{</span><span class="w"> </span><span class="nv">phone</span><span class="p">[</span><span class="mi">9</span><span class="p">]</span><span class="w"> </span><span class="cp">}}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_aztnnnfnyutz' class='api_div' data-search-keywords='platform targeting platform targeting'>
<h2 id="platform-targeting">Platform targeting</h2>

<div class="api_tags" data-tags="Platform targeting" data-tags-lower="platform targeting"></div>

<ul>
  <li><a href="#platform-device-os">Differentiate copy by device OS</a></li>
  <li><a href="#platform-target">Target only a specific platform</a></li>
  <li><a href="#platform-target-ios-version">Target only iOS devices with a specific OS version</a></li>
  <li><a href="#platform-target-web">Target only Web browsers</a></li>
  <li><a href="#platform-target-carrier">Target a specific mobile carrier</a></li>
</ul>

<h3 id="platform-device-os">Differentiate copy by device OS</h3>

<p>This use case checks what platform a user is on, and depending on their platform, will display specific messaging.</p>

<p>For example, you may want to show mobile users shorter versions of message copy while showing other users the regular, longer version of the copy. You could also show mobile users certain messaging relevant to them but wouldn’t be relevant to Web users. For example, iOS messaging might talk about Apple Pay, but Android messaging should mention Google Pay.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">targeted_device</span>.${platform}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"ios"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">targeted_device</span>.${platform}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"android"</span><span class="w"> </span><span class="cp">%}</span>
This is a shorter copy.

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
This is the regular copy and much longer than the short version. 
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Note:</strong></p>

<p>Liquid is case-sensitive, <code class="language-plaintext highlighter-rouge">targeted_device.${platform}</code> returns the value in all lowercase.</p>

<h3 id="platform-target">Target only a specific platform</h3>

<p>This use case will capture the users’ device platform, and depending on the platform, will display a message.</p>

<p>For example, you may want to only send a message to Android users. This can be used as an alternative to selecting an app within the Segmentation tool.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{targeted_device.${platform}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'android'</span><span class="w"> </span><span class="cp">%}</span> 

This is a message for an Android user! 

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>  
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="platform-target-ios-version">Target only devices with a specific OS version</h3>

<p>This use case checks if a user’s OS version falls within a certain set of versions and if so, will display a specific message.</p>

<p>The example used sends a warning to users on an OS version 10.0 or earlier that they are phasing out support for the user’s device OS.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.0"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.0.1"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.0.2"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.0.3"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.1"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.2"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.2.1"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.3"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.3.1"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.3.2"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.3.3"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"10.3.4"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"9.3.1"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"9.3.2"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"9.3.3"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"9.3.4"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"9.3.5"</span><span class="w"> </span><span class="cp">%}</span>

We are phasing out support for your device's operating system. Be sure to update to the latest software for the best app experience.

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="platform-target-web">Target only web browsers</h3>

<p>This use case checks if a user’s target device runs on Mac or Windows and, if so, will display a specific message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'Mac'</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'Windows'</span><span class="w"> </span><span class="cp">%}</span>

This message will display on your desktop web browser.

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p>The following use case checks if a web users is on iOS or Android and, if so, will display a specific message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'iOS'</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span>{{targeted_device.${platform}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'web'</span><span class="w"> </span><span class="cp">%}</span>

Content for iOS.

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{targeted_device.${os}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'android'</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span>{{targeted_device.${platform}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'web'</span><span class="w"> </span><span class="cp">%}</span>

Content for Android.

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="platform-target-carrier">Target a specific mobile carrier</h3>

<p>This use case checks if a user’s device carrier is Verizon, and if so, will display a specific message.</p>

<p>For push notifications and in-app message channels, you can specify the device carrier in your message body using Liquid. If the recipient’s device carrier doesn’t match, the message won’t be sent.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{targeted_device.${carrier}}}<span class="w"> </span><span class="ow">contains</span><span class="w"> </span><span class="s2">"verizon"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{targeted_device.${carrier}}}<span class="w"> </span><span class="ow">contains</span><span class="w"> </span><span class="s2">"Verizon"</span><span class="w"> </span><span class="cp">%}</span>

This is a message for Verizon users!

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_cwhxboffxsci' class='api_div' data-search-keywords='sms sms'>
<h2 id="sms">SMS</h2>

<div class="api_tags" data-tags="SMS" data-tags-lower="sms"></div>

<ul>
  <li><a href="#sms-keyword-response">Respond with different messages based on inbound SMS keyword</a></li>
</ul>

<h3 id="sms-keyword-response">Respond with different messages based on inbound SMS keyword</h3>

<p>This use case incorporates dynamic SMS keyword processing to respond to specific inbound messages with different message copy. For example, you can send different responses when someone texts “START” versus “JOIN”.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">inbound_message</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{sms.${inbound_message_body}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">downcase</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">strip</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">inbound_message</span><span class="w"> </span><span class="ow">contains</span><span class="w"> </span><span class="s1">'start'</span><span class="w"> </span><span class="cp">%}</span>
Thanks for joining our SMS program! Make sure your account is up to date for the best deals!

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">inbound_message</span><span class="w"> </span><span class="ow">contains</span><span class="w"> </span><span class="s1">'join'</span><span class="w"> </span><span class="cp">%}</span>
Thanks for joining our SMS program! Create an account to get the best deals!

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
Thanks for joining our SMS program!

<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_mqviwnltdvhc' class='api_div' data-search-keywords='time zones time zones'>
<h2 id="time-zones">Time zones</h2>

<div class="api_tags" data-tags="Time zones" data-tags-lower="time zones"></div>

<ul>
  <li><a href="#users-time-zone">Template in the user’s time zone</a></li>
  <li><a href="#personalize-timezone">Personalize a message depending on a user’s time zone</a></li>
  <li><a href="#time-append-cst">Append the CST time zone to a custom attribute</a></li>
  <li><a href="#time-insert-timestamp">Insert a timestamp</a></li>
  <li><a href="#time-canvas-window">Only send a Canvas push during a window of time in a user’s local time zone</a></li>
  <li><a href="#time-reocurring-iam-window">Send a reoccurring in-app message campaign between a window of time in a user’s local time zone</a></li>
  <li><a href="#time-weekdays-vs-weekends">Send different messages on weekdays versus weekends in a user’s local time zone</a></li>
  <li><a href="#time-of-day">Send different messages based on time of day in a user’s local time zone</a></li>
  <li><a href="#abort-send-time-hour-range">Abort a message outside an hour range at send time</a></li>
  <li><a href="#abort-fixed-timezone-window">Abort a message outside a time window in a fixed time zone</a></li>
</ul>

<p><strong>Note:</strong></p>

<p>If a user receives a message at an unexpected local time, their device or profile time zone may have changed (for example, after traveling). Local-time delivery uses the time zone on the profile at send time; users may need a new session in their usual region before values such as <code class="language-plaintext highlighter-rouge">{{${time_zone}}}</code> reflect what you expect. However, you can <a href="#users-time-zone">template in the user’s time zone</a>.</p>

<h3 id="users-time-zone">Template in the user’s time zone</h3>

<p>By default, dates and times in Liquid are rendered in Coordinated Universal Time (UTC). To display dates and times in the user’s local time zone, use the <code class="language-plaintext highlighter-rouge">time_zone</code> filter with the <code class="language-plaintext highlighter-rouge">date</code> filter.</p>

<h4 id="assign-local-date-and-time">Assign local date and time</h4>

<p>To assign a variable that reflects the current date and time in the user’s local time zone, use this format:</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">local_date_time</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span>{{${time_zone}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%B %e, %Y'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{{</span><span class="nv">local_date_time</span><span class="cp">}}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<ul>
  <li><code class="language-plaintext highlighter-rouge">now</code>: This retrieves the current date and time in UTC.</li>
  <li><code class="language-plaintext highlighter-rouge">time_zone</code>: This retrieves the user’s local time zone from the default attribute using the <code class="language-plaintext highlighter-rouge">{{${time_zone}}}</code> personalization tag.</li>
  <li><code class="language-plaintext highlighter-rouge">date</code>: This formats the user’s local date and time according to your specifications. In the previous example, the system displays a string formatted like “February 26, 2026”. For more formatting options, see <a href="strftime.net">strftime.net</a>.</li>
</ul>

<h4 id="apply-the-users-time-zone-with-custom-attributes">Apply the user’s time zone with custom attributes</h4>

<p>You can apply the <code class="language-plaintext highlighter-rouge">time_zone</code> filter to custom attributes, like this:</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
</pre></td><td class="rouge-code"><pre><span class="cp">{{</span><span class="nv">custom_attribute</span>.${date_time_attribute}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>{{${time_zone}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%a, %b %e, %Y'</span><span class="cp">}}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p>This outputs the <code class="language-plaintext highlighter-rouge">date_time_attribute</code> formatted as the abbreviated day of the week, followed by the abbreviated month, day, and four-digit year.</p>

<h3 id="personalize-timezone">Personalize a message depending on a user’s time zone</h3>

<p>This use case displays different messages based on a user’s time zone.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{${time_zone}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'xx'</span><span class="w"> </span><span class="cp">%}</span>
Message for time zone xx.
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span>{{${time_zone}}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'yy'</span><span class="w"> </span><span class="cp">%}</span>
Message for time zone yy.
<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Invalid<span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="nv">zone</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="time-append-cst">Append the CST time zone to a custom attribute</h3>

<p>This use case displays a custom date attribute in a given time zone.</p>

<p>Option 1:</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
</pre></td><td class="rouge-code"><pre><span class="cp">{{</span><span class="nv">custom_attribute</span>.${application_expires_date}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span><span class="o">-</span><span class="mi">0005</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%B, %d %Y'</span><span class="w"> </span><span class="cp">}}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p>Option 2:</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
</pre></td><td class="rouge-code"><pre><span class="cp">{{</span><span class="nv">custom_attribute</span>.${application_expires_date}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span><span class="s1">'America/Chicago'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%B %d %Y %z'</span><span class="w"> </span><span class="cp">}}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="time-insert-timestamp">Insert a timestamp</h3>

<p>This use case displays a message that includes a timestamp in their current time zone.</p>

<p>The following example provided will display the date as YYYY-mm-dd HH:MM:SS, such as 2021-05-03 10:41:04.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
</pre></td><td class="rouge-code"><pre><span class="cp">{{</span>${user_id}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">default</span><span class="p">:</span><span class="w"> </span><span class="s1">'You'</span><span class="cp">}}</span> received a campaign, rendered at (<span class="cp">{{</span><span class="w"> </span><span class="s2">"now"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>${time_zone}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y-%m-%d %H:%M:%S"</span><span class="w"> </span><span class="cp">}}</span>)
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="time-canvas-window">Only send a Canvas push during a window of time in a user’s local time zone</h3>

<p>This use case checks a user’s time in their local time zone, and if it falls within a set time, it will display a specific message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>${time_zone}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%H'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">20</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">8</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Outside<span class="w"> </span><span class="nv">allowed</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="nv">window</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

Here's a message that will send between 8 am and 8 pm!
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="time-reoccurring-iam-window">Send a reoccurring in-app message campaign between a window of time in a user’s local time zone</h3>

<p>This use case will display a message if a user’s current time falls within a set window.</p>

<p>For example, the following scenario lets a user know that a store is closed.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>${time_zone}<span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%H'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">21</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">10</span><span class="w"> </span><span class="cp">%}</span>

Store's closed. Come back between 11 am and 9 pm!

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Not<span class="w"> </span><span class="nv">sent</span><span class="w"> </span><span class="nv">because</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">store</span><span class="w"> </span><span class="nv">is</span><span class="w"> </span><span class="nv">open</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="time-weekdays-vs-weekends">Send different messages on weekdays versus weekends in a user’s local time zone</h3>

<p>This use case will check if a user’s current day of the week is Saturday or Sunday, and depending on the day, will display different messages.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>${time_zone}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%A"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span>{{today}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'Saturday'</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>{{today}}<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'Sunday'</span><span class="w"> </span><span class="cp">%}</span>
It's <span class="cp">{{</span><span class="nv">today</span><span class="cp">}}</span>, why don't you open the app for your transactions?

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
It's <span class="cp">{{</span><span class="nv">today</span><span class="cp">}}</span>, why don't you visit the store?
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="time-of-day">Send different messages based on time of day in a user’s local time zone</h3>

<p>This use case will display a message if a user’s current time falls outside a set window.</p>

<p>For example, you may want to tell a user about a time-sensitive opportunity that depends on the time of day.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>${time_zone}<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%H'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">20</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">8</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Outside<span class="w"> </span><span class="nv">allowed</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="nv">window</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

Check out this new bar after work today. HH specials!
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Note:</strong></p>

<p>This is the opposite of <a href="/docs/user_guide/messaging/messaging_fundamentals/delivery_and_entry_types/#time-based-options">Quiet Hours</a>.</p>

<h3 id="abort-send-time-hour-range">Abort a message outside an hour range at send time</h3>

<p>This use case aborts the message when the current hour falls outside a defined range. It uses the time at which the message is rendered, which is UTC by default unless you apply the <code class="language-plaintext highlighter-rouge">time_zone</code> filter, not the user’s local time zone. To send messages based on a user’s local time zone, <a href="#time-of-day">Send different messages based on time of day in a user’s local time zone</a>.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%H'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">20</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">8</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Outside<span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="nv">range</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

Check out this new bar after work today. HH specials!
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="abort-fixed-timezone-window">Abort a message outside a time window in a fixed time zone</h3>

<p>This use case aborts the message when the current time falls outside a defined window in a specific time zone (Singapore time in this example). You can use this pattern when you need a Quiet Hours-inspired rule that is tied to one region instead of each user’s <code class="language-plaintext highlighter-rouge">time_zone</code> attribute.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span><span class="s1">'Asia/Singapore'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%H'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">minute</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%M'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&lt;</span><span class="w"> </span><span class="mi">20</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">hour</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">21</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span>(hour<span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">21</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span><span class="nv">minute</span><span class="w"> </span><span class="o">&gt;</span><span class="w"> </span><span class="mi">45</span>)<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Not<span class="w"> </span><span class="nv">within</span><span class="w"> </span><span class="nv">eligible</span><span class="w"> </span><span class="nv">time</span><span class="w"> </span><span class="nv">of</span><span class="w"> </span><span class="mi">8</span><span class="w"> </span><span class="nv">pm</span>–9:45<span class="w"> </span><span class="nv">pm</span><span class="w"> </span><span class="nv">SGT</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

Sign up for our exclusive time-limited offer now!
</pre></td></tr></tbody></table></code></pre></div></div>

</div>

<div id='api_qsiwwkhufwzy' class='api_div' data-search-keywords='week/day/month week/day/month'>
<h2 id="weekdaymonth">Week/Day/Month</h2>

<div class="api_tags" data-tags="Week/Day/Month" data-tags-lower="week/day/month"></div>

<ul>
  <li><a href="#month-name">Pull the previous month’s name into a message</a></li>
  <li><a href="#month-end">Send a campaign at the end of every month</a></li>
  <li><a href="#day-of-month-last">Send a campaign on the last (weekday) of the month</a></li>
  <li><a href="#day-of-month">Send a different message each day of the month</a></li>
  <li><a href="#day-of-week">Send a different message each day of the week</a></li>
  <li><a href="#abort-specific-calendar-date">Abort a message on a specific calendar date</a></li>
  <li><a href="#abort-specific-weekday">Abort a message on a specific day of the week</a></li>
</ul>

<h3 id="month-name">Pull the previous month’s name into a message</h3>

<p>This use case will take the current month and display the previous month to be used in messaging.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%m"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span>{{today}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"January"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">2</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"February"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">3</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"March"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">4</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"April"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">5</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"May"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">6</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"June"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">7</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"July"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">8</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"August"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">9</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"September"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">10</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"October"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">11</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"November"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">last_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"December"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

Here's an overview of what your spending looked like in <span class="cp">{{</span><span class="nv">month</span><span class="cp">}}</span>.
</pre></td></tr></tbody></table></code></pre></div></div>

<p>You can alternatively use the following to get the same result.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_month_name</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y-%m-01"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%s'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="mi">1</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%B"</span><span class="w"> </span><span class="cp">%}</span>

Here's an overview of what your spending looked like in <span class="cp">{{</span><span class="nv">last_month_name</span><span class="cp">}}</span>.
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="month-end">Send a campaign at the end of every month</h3>

<p>This use case will check if the current date falls within a list of dates, and depending on the date, will display a specific message.</p>

<p><strong>Note:</strong></p>

<p>This does not account for leap years (February 29).</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
5
6
7
8
9
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%b %d'</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Jan 31"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Feb 28"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Mar 31"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Apr 30"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"May 31"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Jun 30"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Jul 31"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Aug 31"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Sep 30"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Oct 31"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Nov 30"</span><span class="w"> </span><span class="ow">or</span><span class="w"> </span><span class="nv">current_date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Dec 31"</span><span class="w"> </span><span class="cp">%}</span>

The date is correct

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Date<span class="w"> </span><span class="nv">is</span><span class="w"> </span><span class="nv">not</span><span class="w"> </span><span class="nv">listed</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="day-of-month-last">Send a campaign on the last (weekday) of the month</h3>

<p>This use case captures the current month and day and calculates if the current day falls within the last weekday of the month.</p>

<p>For example, you may want to send a survey to your users on the last Wednesday of the month asking for product feedback.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">Pull the day, day name, month, and year from today's date.</span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">current_day</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"now"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%d"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">current_day_name</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"now"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%a"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"now"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%b"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">current_year</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"now"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y"</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">Assign the correct number of days for the current month.</span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Jan"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">31</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Mar"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">31</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Apr"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">30</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"May"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">31</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Jun"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">30</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Jul"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">31</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Aug"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">31</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Sep"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">30</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Oct"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">31</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Nov"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">30</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Dec"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">31</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">Assign the correct number of days if the current month is February, taking into account leap years.</span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">leap_year_remainder</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">current_year</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">modulo</span><span class="p">:</span><span class="w"> </span><span class="mi">4</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">leap_year_remainder</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="mi">0</span><span class="w"> </span><span class="ow">and</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Feb"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">29</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">current_month</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Feb"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="mi">28</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">comment</span><span class="w"> </span><span class="cp">%}</span><span class="c">Check that today's date is within a week of the last day of the month. If not, abort the message. If so, check that today is Wednesday. If not, abort the message.</span><span class="cp">{%</span><span class="w"> </span><span class="nt">endcomment</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">diff_in_days</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="nv">last_day_of_month</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">minus</span><span class="p">:</span><span class="w"> </span><span class="nv">current_day</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">plus</span><span class="p">:</span><span class="w"> </span><span class="mi">1</span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">diff_in_days</span><span class="w"> </span><span class="o">&lt;=</span><span class="w"> </span><span class="mi">7</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">unless</span><span class="w"> </span><span class="nv">current_day_name</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s2">"Wed"</span><span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Wrong<span class="w"> </span><span class="nv">day</span><span class="w"> </span><span class="nv">of</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">week</span><span class="s2">") %} 
{% endunless %} 
{% else %} 
{% abort_message("</span><span class="nv">Not</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">last</span><span class="w"> </span><span class="nv">week</span><span class="w"> </span><span class="nv">of</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="nv">month</span>")<span class="w"> </span><span class="cp">%}</span> 
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="day-of-month">Send a different message each day of the month</h3>

<p>This use case checks if the current date matches one on a list, and depending on the day, will display a distinct message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>{{${time_zone}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y-%m-%d"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">day_1</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2019-12-01"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>{{${time_zone}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y-%m-%d"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">day_2</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2019-12-02"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>{{${time_zone}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y-%m-%d"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">day_3</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s2">"2019-12-03"</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">time_zone</span><span class="p">:</span><span class="w"> </span>{{${time_zone}}}<span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%Y-%m-%d"</span><span class="w"> </span><span class="cp">%}</span>

<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="nv">day_1</span><span class="w"> </span><span class="cp">%}</span>
Message for 2019-12-01

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="nv">day_2</span><span class="w"> </span><span class="cp">%}</span>
Message for 2019-12-02

<span class="cp">{%</span><span class="w"> </span><span class="nt">elsif</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="nv">day_3</span><span class="cp">%}</span>
Message for 2019-12-03

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("Date<span class="w"> </span><span class="nv">not</span><span class="w"> </span><span class="nv">listed</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="day-of-week">Send a different message each day of the week</h3>

<p>This use case checks the current day of the week, and depending on the day, will display a distinct message.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
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
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s2">"%A"</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">case</span><span class="w"> </span><span class="nv">today</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">when</span><span class="w"> </span><span class="s1">'Monday'</span><span class="w"> </span><span class="cp">%}</span>
Monday copy

<span class="cp">{%</span><span class="w"> </span><span class="nt">when</span><span class="w"> </span><span class="s1">'Tuesday'</span><span class="w"> </span><span class="cp">%}</span>
Tuesday copy

<span class="cp">{%</span><span class="w"> </span><span class="nt">when</span><span class="w"> </span><span class="s1">'Wednesday'</span><span class="w"> </span><span class="cp">%}</span>
Wednesday copy

<span class="cp">{%</span><span class="w"> </span><span class="nt">when</span><span class="w">  </span><span class="s1">'Thursday'</span><span class="w"> </span><span class="cp">%}</span>
Thursday copy

<span class="cp">{%</span><span class="w"> </span><span class="nt">when</span><span class="w">  </span><span class="s1">'Friday'</span><span class="w"> </span><span class="cp">%}</span>
Friday copy

<span class="cp">{%</span><span class="w"> </span><span class="nt">when</span><span class="w"> </span><span class="s1">'Saturday'</span><span class="w"> </span><span class="cp">%}</span>
Saturday copy

<span class="cp">{%</span><span class="w"> </span><span class="nt">when</span><span class="w"> </span><span class="s1">'Sunday'</span><span class="w"> </span><span class="cp">%}</span>
Sunday copy

<span class="cp">{%</span><span class="w"> </span><span class="nt">else</span><span class="w"> </span><span class="cp">%}</span>
Default copy
<span class="cp">{%</span><span class="w"> </span><span class="nt">endcase</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<p><strong>Note:</strong></p>

<p>You can replace the line “default copy” with <code class="language-plaintext highlighter-rouge">{% abort_message() %}</code> to prevent the message from sending if the day of the week is unknown.</p>

<h3 id="abort-specific-calendar-date">Abort a message on a specific calendar date</h3>

<p>This use case aborts the message on a chosen month and day every year (May 5 in the example). It compares the current date to an unambiguous month-day string built with the <code class="language-plaintext highlighter-rouge">date</code> filter.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">date</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%d/%m'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">date</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'05/05'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>('No<span class="w"> </span><span class="nv">message</span><span class="w"> </span><span class="nv">on</span><span class="w"> </span><span class="nv">the</span><span class="w"> </span><span class="mi">5</span><span class="nv">th</span><span class="w"> </span><span class="nv">of</span><span class="w"> </span><span class="nv">May</span>')<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

<h3 id="abort-specific-weekday">Abort a message on a specific day of the week</h3>

<p>This use case aborts the message when Liquid runs on a given weekday (<code class="language-plaintext highlighter-rouge">Wednesday</code> in the example). The <code class="language-plaintext highlighter-rouge">%A</code> filter returns the full English weekday name.</p>

<div class="language-liquid highlighter-rouge"><div class="highlight"><pre class="highlight"><code><table class="rouge-table"><tbody><tr><td class="rouge-gutter gl"><pre class="lineno">1
2
3
4
</pre></td><td class="rouge-code"><pre><span class="cp">{%</span><span class="w"> </span><span class="nt">assign</span><span class="w"> </span><span class="nv">weekday</span><span class="w"> </span><span class="o">=</span><span class="w"> </span><span class="s1">'now'</span><span class="w"> </span><span class="p">|</span><span class="w"> </span><span class="nf">date</span><span class="p">:</span><span class="w"> </span><span class="s1">'%A'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">if</span><span class="w"> </span><span class="nv">weekday</span><span class="w"> </span><span class="o">==</span><span class="w"> </span><span class="s1">'Wednesday'</span><span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">abort_message</span>("No<span class="w"> </span><span class="nv">message</span><span class="w"> </span><span class="nv">on</span><span class="w"> </span><span class="nv">Wednesdays</span>")<span class="w"> </span><span class="cp">%}</span>
<span class="cp">{%</span><span class="w"> </span><span class="nt">endif</span><span class="w"> </span><span class="cp">%}</span>
</pre></td></tr></tbody></table></code></pre></div></div>

</div>

Many examples in this library use the `abort_message` tag to skip a send when conditions aren't met. For a full reference on aborting sends with Liquid, including date- and time-based patterns, see [Abort Liquid Messages](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/aborting_messages/).
