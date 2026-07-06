# Array of objects

> This page covers how to use an array of objects to group related attributes. For example, you may have a group of pet objects, song objects, and account objects that all belong to one user. These arrays of objects can be used to personalize your messaging with Liquid, or create audience segments if any element within an object matches the criteria.

## Supported data types

The following data types are supported:

<table aria-label="Supported data types">
  <thead>
    <tr>
      <th>Data Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Number</td>
      <td>A numeric value, such as <code>1</code> or <code>5.5</code>.</td>
    </tr>
    <tr>
      <td>String</td>
      <td>A text value, such as <code>"Hello"</code> or <code>"The Hobbit"</code>.</td>
    </tr>
    <tr>
      <td>Boolean</td>
      <td>A value that evaluates to either <code>true</code> or <code>false</code>.</td>
    </tr>
    <tr>
      <td>Array</td>
      <td>A list of values, such as <code>["red", "blue", "green"]</code>.</td>
    </tr>
    <tr>
      <td>Time</td>
      <td>
        A timestamp value used for date and time comparisons. When filtering a nested time custom attribute, you can choose:<br><br>
        <ul>
          <li><strong>Day of Year</strong>: Checks only the month and day for comparison, such as <code>03-15</code>.</li>
          <li><strong>Time</strong>: Compares the full timestamp, including the year, such as <code>2023-03-15T12:00:00Z</code>.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Object</td>
      <td>A structured value with key–value pairs, such as <code>{"author": "Tolkien"}</code>.</td>
    </tr>
    <tr>
      <td>Array of objects</td>
      <td>
        A list of objects, such as <code>[{"title": "The Hobbit"}, {"title": "Dune"}]</code>. 
        For more information, refer to 
        <a href="/docs/array_of_objects/">Arrays of objects</a>.
      </td>
    </tr>
  </tbody>
</table>
{: .reset-td-br-1 .reset-td-br-2 aria-label="Supported data types" }


## Considerations

- Arrays of objects are intended for custom attributes sent through the API. CSV uploads are not supported. This is because commas in the CSV file will be interpreted as a column separator, and commas in values will cause parsing errors. 
- Arrays of objects have no limit on the number of items but do have a maximum size of 100&nbsp;KB. If an update (such as `$add` or `$update`) causes the array to exceed this limit, Braze drops the update, and the attribute is unchanged. The API request still returns a success response. To keep the array under the limit so that new items can be added, use `$remove` to delete items from the array first.
- Not all Braze Partners support arrays of objects. Refer to the [Partner documentation](https://www.braze.com/docs/partners/home) to confirm if the integration supports this feature.

Updating or removing items in an array requires identifying the item by key and value, so consider including a unique identifier for each item in the array. The uniqueness is scoped only to the array and is useful if you want to update and remove specific objects from your array. This is not enforced by Braze.

**Important:**


When a nested custom attribute in your request contains any invalid values (such as invalid time formats or `null` values), Braze drops all nested custom attribute updates in the request from processing. This applies to all nested structures within that specific attribute. Verify that all values within nested custom attributes are valid before sending. For more information, refer to [Create and update users](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/#how-does-userstrack-handle-invalid-nested-custom-attributes).



**Tip:**


For more information on using arrays of objects for user attributes objects, refer to [User attributes object](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#migrating-push-tokens).



## API example




The following is a `/users/track` example with a `pets` array. To capture the properties of the pets, send an API request that lists `pets` as an array of objects. Note that each object has been assigned a unique `id` that can be referenced later when making updates.

```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "pets": [
        {
          "id": 1,
          "type": "dog",
          "breed": "beagle",
          "name": "Gus"
        },
        {
          "id": 2,
          "type": "cat",
          "breed": "calico",
          "name": "Gerald"
        }
      ]
    }
  ]
}
```



Add another item to the array using the `$add` operator. The following example shows adding three more pet objects to the user's `pets` array.

```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "pets": {
        "$add": [
          {
            "id": 3,
            "type": "dog",
            "breed": "corgi",
            "name": "Doug"
          },
          {
            "id": 4,
            "type": "fish",
            "breed": "salmon",
            "name": "Larry"
          },
           {
            "id": 5,
            "type": "bird",
            "breed": "parakeet",
            "name": "Mary"
          }
        ]
      }
    }
  ]
}
```



Update values for specific objects within an array using the `_merge_objects` parameter and the `$update` operator. Similar to updates to simple [nested custom attribute](https://www.braze.com/docs/nested_custom_attribute_support/#api-request-body) objects, this performs a deep merge.

Note that `$update` can't be used to remove a nested property from an object inside an array. To do this, you'll need to remove the entire item from the array and then add the object without that specific key (using a combination of `$remove` and `$add`).

The following example shows updating the `breed` property to `goldfish` for the object with an `id` of `4`. This request example also updates the object with `id` equals `5` with a new `name` of `Annette`. Since the `_merge_objects` parameter is set to `true`, all other fields for these two objects remain the same.

```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "_merge_objects": true,
      "pets": {
        "$update": [
          {
            "$identifier_key": "id",
            "$identifier_value": 4,
            "$new_object": {
              "breed": "goldfish"
            }
          },
          {
            "$identifier_key": "id",
            "$identifier_value": 5,
            "$new_object": {
              "name": "Annette"
            }
          }
        ]
      }
    }
  ]
}
```

**Warning:**


You must set `_merge_objects` to true, or your objects will be overwritten. `_merge_objects` is false by default.






Remove objects from an array using the `$remove` operator in combination with a matching key (`$identifier_key`) and value (`$identifier_value`).

The following example shows removing any object in the `pets` array that has an `id` with a value of `1`, an `id` with a value of `2`, and a `type` with a value of `dog`. If there are multiple objects with the `type` value of `dog`, all matching objects will be removed.

```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "pets": {
        "$remove": [
          // Remove by ID
          {
            "$identifier_key": "id",
            "$identifier_value": 1
          },
          {
            "$identifier_key": "id",
            "$identifier_value": 2
          },
          // Remove any dog
          {
            "$identifier_key": "type",
            "$identifier_value": "dog"
          }
        ]
      }
    }
  ]
}
```



### Processing order

When a single `/users/track` request includes `$add`, `$remove`, and `$update` operations for the same array attribute, Braze processes them in this order:

1. `$add`
2. `$remove`
3. `$update`

Because `$add` runs before `$remove`, you can't use a `$remove` followed by `$add` as an upsert mechanism within a single request. The `$add` is processed first, then the `$remove` deletes the item. To upsert, send the `$remove` in a separate request before the `$add`.

### Timestamps

When including fields like timestamps in an array of objects, use the `$time` format instead of plain strings or Unix epoch integers.

```json
{
  "attributes": [
    {
      "external_id": "user123",
      "purchases": [
        {
          "item_name": "T-shirt",
          "price": 19.99,
          "purchase_time": {
            "$time": "2020-05-28"
          }
        }
      ]
    }
  ]
}
```

**Tip:**


For more information, see [Nested Custom Attributes](https://www.braze.com/docs/user_guide/data/activation/attributes/nested_custom_attribute_support/).



## SDK example





```kotlin
val json = JSONArray()
    .put(JSONObject()
        .put("id", 1)
        .put("type", "dog")
        .put("breed", "beagle")
        .put("name", "Gus"))
    .put(JSONObject()
        .put("id", 2)
        .put("type", "cat")
        .put("breed", "calico")
        .put("name", "Gerald")
    )

braze.getCurrentUser { user ->
    user.setCustomUserAttribute("pets", json)
}
```



```kotlin
val json = JSONObject()
    .put("\$add", JSONArray()
        .put(JSONObject()
            .put("id", 3)
            .put("type", "dog")
            .put("breed", "corgi")
            .put("name", "Doug"))
        .put(JSONObject()
            .put("id", 4)
            .put("type", "fish")
            .put("breed", "salmon")
            .put("name", "Larry"))
        .put(JSONObject()
            .put("id", 5)
            .put("type", "bird")
            .put("breed", "parakeet")
            .put("name", "Mary")
        )
    )

braze.getCurrentUser { user ->
    user.setCustomUserAttribute("pets", json, true)
}
```



```kotlin
val json = JSONObject()
    .put("\$update", JSONArray()
        .put(JSONObject()
            .put("\$identifier_key", "id")
            .put("\$identifier_value", 4)
            .put("\$new_object", JSONObject()
                .put("breed", "goldfish")
            )
        )
        .put(JSONObject()
            .put("\$identifier_key", "id")
            .put("\$identifier_value", 5)
            .put("\$new_object", JSONObject()
                .put("name", "Annette")
            )
        )
    )

braze.getCurrentUser { user ->
    user.setCustomUserAttribute("pets", json, true)
}
```



```kotlin
val json = JSONObject()
    .put("\$remove", JSONArray()
        .put(JSONObject()
            .put("\$identifier_key", "id")
            .put("\$identifier_value", 1)
        )
        .put(JSONObject()
            .put("\$identifier_key", "id")
            .put("\$identifier_value", 2)
        )
        .put(JSONObject()
            .put("\$identifier_key", "type")
            .put("\$identifier_value", "dog")
        )
    )

braze.getCurrentUser { user ->
    user.setCustomUserAttribute("pets", json, true)
}
```







```swift
let json: [[String: Any?]] = [
  [
    "id": 1,
    "type": "dog",
    "breed": "beagle",
    "name": "Gus"
  ],
  [
    "id": 2,
    "type": "cat",
    "breed": "calico",
    "name": "Gerald"
  ]
]

braze.user.setCustomAttribute(key: "pets", array: json)
```



```swift
let json: [String: Any?] = [
  "$add": [
    [
      "id": 3,
      "type": "dog",
      "breed": "corgi",
      "name": "Doug"
    ],
    [
      "id": 4,
      "type": "fish",
      "breed": "salmon",
      "name": "Larry"
    ],
    [
      "id": 5,
      "type": "bird",
      "breed": "parakeet",
      "name": "Mary"
    ]
  ]
]

braze.user.setCustomAttribute(key: "pets", dictionary: json, merge: true)
```



```swift
let json: [String: Any?] = [
  "$update": [
    [
      "$identifier_key": "id",
      "$identifier_value": 4,
      "$new_object": [
        "breed": "goldfish"
      ]
    ],
    [
      "$identifier_key": "id",
      "$identifier_value": 5,
      "$new_object": [
        "name": "Annette"
      ]
    ]
  ]
]

braze.user.setCustomAttribute(key: "pets", dictionary: json, merge: true)
```



```swift
let json: [String: Any?] = [
  "$remove": [
    [
      "$identifier_key": "id",
      "$identifier_value": 1,
    ],
    [
      "$identifier_key": "id",
      "$identifier_value": 2,
    ],
    [
      "$identifier_key": "type",
      "$identifier_value": "dog",
    ]
  ]
]

braze.user.setCustomAttribute(key: "pets", dictionary: json, merge: true)
```



**Important:**


Nested custom attributes are not supported for AppboyKit.







```javascript
import * as braze from "@braze/web-sdk";
const json = [{
  "id": 1,
  "type": "dog",
  "breed": "beagle",
  "name": "Gus"
}, {
  "id": 2,
  "type": "cat",
  "breed": "calico",
  "name": "Gerald"
}];
braze.getUser().setCustomUserAttribute("pets", json);
```



```javascript
import * as braze from "@braze/web-sdk";
const json = {
  "$add": [{
    "id":  3,
    "type":  "dog",
    "breed":  "corgi",
    "name":  "Doug",
  }, {
    "id":  4,
    "type":  "fish",
    "breed":  "salmon",
    "name":  "Larry",
  }, {
    "id":  5,
    "type":  "bird",
    "breed":  "parakeet",
    "name":  "Mary",
  }]
};
braze.getUser().setCustomUserAttribute("pets", json, true);
```



```javascript
import * as braze from "@braze/web-sdk";
const json = {
  "$update": [
    {
      "$identifier_key": "id",
      "$identifier_value": 4,
      "$new_object": {
        "breed": "goldfish"
      }
    },
    {
      "$identifier_key": "id",
      "$identifier_value": 5,
      "$new_object": {
        "name": "Annette"
      }
    }
  ]
};
braze.getUser().setCustomUserAttribute("pets", json, true);
```



```javascript
import * as braze from "@braze/web-sdk";
const json = {
  "$remove": [
    {
      "$identifier_key": "id",
      "$identifier_value": 1,
    },
    {
      "$identifier_key": "id",
      "$identifier_value": 2,
    },
    {
      "$identifier_key": "type",
      "$identifier_value": "dog",
    }
  ]
};
braze.getUser().setCustomUserAttribute("pets", json, true);
```





## Liquid templating

You can use this `pets` array to personalize a message. The following Liquid templating example shows how to reference the custom attribute object properties saved from the preceding API request and use them in your messaging.


```liquid
{% assign pets = {{custom_attribute.${pets}}} %} 
 
{% for pet in pets %}
I have a {{pet.type}} named {{pet.name}}! They are a {{pet.breed}}.
{% endfor %} 
```


In this scenario, you can use Liquid to loop through the `pets` array and print out a statement for each pet. [Assign a variable](https://www.braze.com/docs/user_guide/messaging/design_and_edit/personalize/liquid/using_liquid/#assigning-variables) to the `pets` custom attribute and use dot notation to access properties on an object. Specify the name of the object, followed by a period `.`, followed by the property name.

## Segmentation

When segmenting users based on arrays of objects, a user will qualify for the segment if any object in the array matches the criteria. 

Create a new segment and select **Nested Custom Attribute** as your filter. Then search for and select the name of your array of objects.

![Filter by array of objects.](https://www.braze.com/docs/assets/img_archive/array_of_objects_segmenting_1.gif?654b66ec7081d8ccdd32323cdf3265e9)

Use dot notation to specify which field in the array of objects you want to use. Start the text field with an empty set of square brackets `[]` to tell Braze that you're looking inside an array of objects. After that, add a period `.`, followed by the name of the field you want to use.

For example, if you want to filter a `top_3_movies` array of objects based on the `type` field, enter `[].type` and choose the movies to filter for, such as `Fantasy Movie`.


### Levels of nesting

You can create a segment with up to one level of array nesting (array within another array). For example, given the following attributes, you can make a segment for `pets[].name` contains `Gus`, but you can't make a segment for `pets[].nicknames[]` contains `Gugu`.


```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "pets": [
        {
          "id": 1,
          "type": "dog",
          "breed": "beagle",
          "name": "Gus",
          "nicknames": [
            "Gugu",
            "Gusto"
          ]
        },
        {
          "id": 2,
          "type": "cat",
          "breed": "calico",
          "name": "Gerald",
          "nicknames": [
            "GeGe",
            "Gerry"
          ]
        }
      ]
    }
  ]
}
```


## Data points

Data points are logged differently depending on whether you create, update, or remove a property.




Creating a new array logs one data point for each attribute in an object. This example costs eight data points—each pet object has four attributes and there are two objects.

```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "pets": [
        {
          "id": 1,
          "type": "dog",
          "breed": "beagle",
          "name": "Gus"
        },
        {
          "id": 2,
          "type": "cat",
          "breed": "calico",
          "name": "Gerald"
        }
      ]
    }
  ]
}
```



Updating an existing array logs one data point for each property added. This example costs two data points as it only updates one property in each of the two objects.

```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "_merge_objects": true,
      "pets": {
        "$update": [
          {
            "$identifier_key": "id",
            "$identifier_value": 4,
            "$new_object": {
              "breed": "goldfish"
            }
          },
          {
            "$identifier_key": "id",
            "$identifier_value": 5,
            "$new_object": {
              "name": "Annette"
            }
          }
        ]
      }
    }
  ]
}
```



Removing an object from an array logs one data point for each removal criteria you send. This example costs three data points, even though you may be removing multiple dogs with this statement.

```json
{
  "attributes": [
    {
      "external_id": "user_id",
      "pets": {
        "$remove": [
          // Remove by ID
          {
            "$identifier_key": "id",
            "$identifier_value": 1
          },
          {
            "$identifier_key": "id",
            "$identifier_value": 2
          },
          // Remove any dog
          {
            "$identifier_key": "type",
            "$identifier_value": "dog"
          }
        ]
      }
    }
  ]
}
```



