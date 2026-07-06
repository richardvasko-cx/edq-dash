# Conditional messaging logic

> [Tags](https://docs.shopify.com/themes/liquid-documentation/tags) allow you to include programming logic in your messaging campaigns. Tags can be used for executing conditional statements as well as for advanced use cases, like assigning variables or iterating through a block of code. <br><br>This page covers how tags can and should be used, such as how to account for null, nil, and blank attribute values, and how to reference custom attributes.

## Formatting tags


A tag must be wrapped in `{% %}`.


To make your life a bit easier, Braze has included color-formatting that will activate in green and purple if you've correctly formatted your Liquid syntax. Green formatting can help identify tags, while purple formatting highlights areas that contain personalization.

If you're having a hard time using conditional messaging, try writing out the conditional syntax before you insert your custom attributes and other Liquid elements.

For example, add the following into the message field first:  

```liquid
{% if X >0 %}
{% else %}
{% endif %}
```

Be sure it highlights in green, then replace the `X` with your chosen Liquid or Connected Content using the blue `+` in the message field corner, and the `0` with your desired value.
<br><br>
Then, add your message variations as you need them between the `else` conditionals:
```liquid
{% if {{custom_attribute.${total_spend}}} >0 %}
Thanks for purchasing! Here's another 10% off!
{% else %}
Buy now! Would 5% off convince you?
{% endif %}
```


## Conditional logic

You can include many types of [intelligent logic within messages](http://docs.shopify.com/themes/liquid-documentation/basics), such as a conditional statement. The following example uses [conditionals](http://docs.shopify.com/themes/liquid-documentation/tags/control-flow-tags) to internationalize a campaign:


```liquid
{% if ${language} == 'en' %}
This is a message in English from Braze!
{% elsif ${language} == 'es' %}
Este es un mensaje en español de Braze !
{% elsif ${language} == 'zh' %}
这是一条来自Braze的中文消息。
{% else %}
This is a message from Braze! This is going to go to anyone who did not match the other specified languages!
{% endif %}
```

### Conditional tags

#### `if` and `elsif`

Conditional logic begins with the `if` tag, which states the first condition to check. Subsequent conditions use the `elsif` tag and will be checked if the previous conditions are not met. In this example, if a user's device isn't set to English, this code will check to see if the user's device is set to Spanish, and if that fails, it will check if the device is set to. If the user's device meets one of these conditions, the user will receive a message in the relevant language.

#### `else`

You have the option to include an `{% else %}` statement in your conditional logic. If none of the conditions that you set are met, the `{% else %}` statement specifies the message that should be sent. In this example, we default to English if a user’s language is not English, Spanish, or Chinese.

#### `case` and `when`

`{% case %}`, `{% when %}`, and `{% endcase %}` work like a switch statement: you set one expression after `case`, and each `when` branch runs when that expression equals the listed value (Liquid uses equality behind the scenes, similar to chaining `if` and `elsif` with `==`). You can list multiple values in one `when` tag by separating them with a comma or `or`. Use `{% else %}` for a fallback when nothing matches, then close with `{% endcase %}`.

Make sure to match the format of your `when` values to the data type. For text (such as a language code), use quotes: `{% when 'es' %}`. For numbers, omit quotes: `{% when 2 %}`.

```liquid
{% assign handle = 'cake' %}
{% case handle %}
{% when 'cake' %}
This is a cake
{% when 'cookie' %}
This is a cookie
{% else %}
This is not a cake nor a cookie
{% endcase %}
```

You can use the same pattern with Braze personalization tags or other Liquid expressions in place of `handle`. For more syntax options, see Shopify's [`case` tag documentation](https://shopify.dev/docs/api/liquid/tags/case).

#### `endif`

The `{% endif %}` tag signals that you've finished an `if` block. You must include the `{% endif %}` tag in any message that uses `if`, `elsif`, `unless`, or `else` in that chain. If you don't include an `{% endif %}` tag, you'll get an error as Braze will be unable to parse your message. If you use `{% case %}` instead, close the block with `{% endcase %}`, not `{% endif %}`.

{% mdexp_alert note %}
In `if`, `elsif`, and `unless` tags, you can use operators but not filters. In `case` and `when` tags, each branch matches when the `case` expression equals a `when` value; filters aren't supported in those expressions either. To evaluate a filtered value, assign the filter result to a variable first, then reference that variable in your `case` or `when` clause. For more details, see [Where to use operators and filters](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/using_liquid#where-to-use-operators-and-filters).
{% endmdexp_alert %}

### Tutorial: Deliver location-based content

When you're finished with this tutorial, you'll be able to use tags with "if", "elsif", and "else" statements to deliver content based on a user's location.

1. Begin with an `if` tag to establish what message should be sent when the user's city is in New York. If the user's city is New York, this first condition is met and the user will receive a message specifying their New Yorker identity.

```liquid
{% if ${city} == "New York" %}
  🎉 Hey there, New Yorker! We're excited to offer you a special deal! 
  Get 20% off your next sandwich at your local Sandwich Emperor. 
  Just show this message at the counter to redeem your offer!
```

{: start="2"}
2. Next, use the `elseif` tag to establish what message should be sent if the user's city is in Los Angeles.

```liquid
{% elsif ${city} == "Los Angeles" %}
  🌞 Hello, Los Angeles! Enjoy a sunny day with a delicious sandwich! 
  Present this message at our LA restaurant for a 20% discount on your next order!
```

{: start="3"}
3. Let's use another `elseif` tag to establish what message should be sent if the user's city is in Chicago.

```liquid
{% elsif ${city} == "Chicago" %}
  🍕 Chicago, we have a treat for you! 
  Swing by our restaurant and get 20% off your favorite sandwich. 
  Just show this message to our staff!
```

{: start="4"}
4. Now, let's use the `{% else %}` tag to specify what message should be sent if the user's city isn't in San Francisco, New York, or Chicago.

```liquid
{% else %}
 🥪 Craving a sandwich? Visit us at any of our locations for a delicious meal! 
  Check our website for the nearest restaurant to you!
```

{: start="5"}
5. Finally, we'll use the `{% endif %}` tag to specify that our conditional logic is done.

```liquid
{% endif %}
```



**Full Liquid code**




```liquid
{% if ${city} == "New York City" %}
  🎉 Hey there, New Yorker! We're excited to offer you a special deal! 
  Get 20% off your next sandwich at our New York location. 
  Just show this message at the counter to redeem your offer!
{% elsif ${city} == "Los Angeles" %}
  🌞 Hello, Los Angeles! Enjoy a sunny day with a delicious sandwich! 
  Present this message at our LA restaurant for a 20% discount on your next order!
{% elsif ${city} == "Chicago" %}
  🍕 Chicago, we have a treat for you! 
  Swing by our restaurant and get 20% off your favorite sandwich. 
  Just show this message to our staff!
{% else %}
  🥪 Craving a sandwich? Visit us at any of our locations for a delicious meal! 
  Check our website for the nearest restaurant to you!
{% endif %}
```





## Accounting for null, nil, and blank attribute values

Conditional logic is a useful way to account for attribute values that aren't set in user profiles.

### Null and nil attribute values

A null or nil value occurs when the value of a custom attribute hasn't been set. For example, a user who hasn't yet set their first name won't have a first name logged in Braze.

In some circumstances, you may wish to send a completely different message to users who have a first name set and users who don't have a first name set.

The following tag allows you to specify a message for users with a null "first name" attribute:


```liquid
{% if ${first_name} == null %}
  ....
{% endif %}
```
 

![An example message in the Braze dashboard, using a null 'first name' attribute.](https://www.braze.com/docs/assets/img/value_null.png?8d7c9d806c7cb49735117c25cca31587){: style="max-width:60%;"}


```liquid
{% if ${first_name} == null %}
We're having a sale! Hurry up and get 10% off all items today only!
{% else %}
Hey {{${first_name} | default: 'there'}}, we're having a sale! Hurry up and get 10% off all items today only!
{% endif %}
```

Note that a null attribute value isn't strictly associated with a value type (for example, a "null" string is the same as a "null" array), so in the example above, the null attribute value is referencing an unset first name, which would be a string.



### Blank attribute values

A blank value occurs when the attribute on a user profile isn't set, is set with a whitespace string (` `), or is set as `false`. Blank values should be checked before other variables to avoid a Liquid processing error.

The following tag allows you to specify a message for users that have a blank "first name" attribute.


```liquid
{% if ${first_name} == blank %}
  ....
{% endif %}
```
 

## Referencing custom attributes

After you have [created custom attributes](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes#managing-custom-attributes), you can reference these custom attributes in your Liquid messaging.

When using conditional logic, you'll need to know the custom attribute's data type to ensure you're using the correct syntax. From the **Custom Attributes** page in the dashboard, look for the data type associated with your custom attribute, then reference the following examples listed for each data type.

![Selecting a data type for a custom attribute. The example provided shows an attribute of Favorite_Category with a data type of string.](https://www.braze.com/docs/assets/img_archive/custom_attribute_data_type.png?f86832d291808bf7066630819c1df6fa){: style="max-width:80%;"}

**Tip:**


Strings and arrays require straight apostrophes around them, while booleans and integers will never have apostrophes.



#### Boolean

[Booleans](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes#booleans) are binary values, and can be set to either `true` or `false`, such as `registration_complete: true`. Boolean values don't have apostrophes around them.



```liquid
{% if {{custom_attribute.${registration_complete}}} == true %}
```



#### Number

[Numbers](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes#numbers) are numeric values, which can be integers or floats. For example, a user may have `shoe_size: 10` or `levels_completed: 287`. Number values don't have apostrophes around them.



```liquid
{% if {{custom_attribute.${shoe_size}}} == 10 %}
```



You can also use other [basic operators](https://shopify.dev/docs/themes/liquid/reference/basics/operators) such as less than (<) or greater than (>) for integers:



```liquid
{% if {{custom_attribute.${flyer_miles}}} >= 500 %}
```



#### String

A [string](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes#strings) is made up of alphanumeric characters and stores a piece of data about your user. For example, you may have `favorite_color: red` or `phone_number: 3025981329`. String values must have apostrophes around them.



```liquid
{% if {{custom_attribute.${favorite_color}}} == 'blue' %}
```



For strings, you can use both "==" or "contains" in your Liquid.

#### Array

An [array](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes#arrays) is a list of information about your user. For example, a user may have `last_viewed_shows: stranger things, planet earth, westworld`. Array values must have apostrophes around them.



```liquid
{% if {{custom_attribute.${last_viewed_shows}}} contains 'homeland' %}
```



For arrays, you must use "contains" and can't use "==". 

#### Time

A time stamp of when an event took place. [Time](https://www.braze.com/docs/user_guide/data/activation/attributes/custom_attributes#time) values must have a [math filter](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/filters#math-filters) on them to be used in conditional logic.



```liquid
{% assign expire = {{custom_attribute.${subscription_end_date}}} | plus: 0 %} 
```




