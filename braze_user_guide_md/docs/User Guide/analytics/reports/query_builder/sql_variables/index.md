# Query Builder SQL variables

> Learn how to use SQL variables in the Query Builder, so you can reuse your queries and avoid hard-coding any data in your code.

## Why use SQL variables?

The benefits of using SQL variables include:

- Save time by creating a campaign variable to select from a list when creating your report, instead of pasting in campaign IDs.
- Swap in values by adding variables that allow you to reuse the report for slightly different use cases in the future (such as a different custom event).
- Reduce user error when editing your SQL by reducing the amount of editing needed for each report. Teammates that are more comfortable with SQL can create reports that less technical teammates can then use.

## Using variables

### Step 1: Add a variable

To add a variable to your query, use the following syntax:


```sql
{{variable_type.${custom_label}}}
```


Replace the following:

| Placeholder      | Description                                                                                                                              |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `variable_type`   | The predefined variable type you'd like to use, such as `campaign` or `catalog_fields`. For the full list, see [Supported variable types](#variable-types). |
| `custom_label` | The label used to identify the variable in the **Variables** tab of your Query Builder. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Step 1: Add a variable" }

In the following example, the total number of users between the first and last day of a month is queried for a campaign. Each variable will be assigned a value in the next step.


```sql
SELECT COUNT(*) AS total_users
FROM USERS_CAMPAIGNS_REVENUE_SHARED
WHERE campaign_id = '{{campaign.${Campaign}}}'
  AND TIME > '{{start_date.${Month First Day}}}'
  AND TIME < '{{end_date.${Month Last Day}}}';
```


### Step 2: Assign a value

By default, the **Variables** tab isn't shown in the Query Builder. It only appears after adding your first variable to the query. There, you'll be able to assign it a value. The specific values you can choose will depend on that specific variable's [type](#variable-types).

In the following example, the "Summer Feature Launch" campaign is assigned as a value, along with the first and last days of June 2025.

![The "Variable" tab in the Query Builder showing the given example.](https://www.braze.com/docs/assets/img/query_builder_example.png?abd94c9f1b311e0d64395725881b3b5f)

## General variable types {#variable-types}

### Number

`number` can be used in combination with other non-string variables. Accepts any positive or negative number, including decimal numbers, such as `5.5`.




```sql
some_number_column < {{number.${custom_label}}}
```




### String

For changing repetitive string values between report runs. Use this variable to avoid hardcoding a value multiple times in your SQL.




```sql
'{{string.${add a string here.}}}'
```




### List {#list}

For selecting from a list of options.






```sql
{{options.${metrics} | is_radio_button: 'true' | options: '[{"label": "test", "value": "test_value"}, {"label": "test2", "value": "test_value2"}]'}}
```









```sql
{{options.${metrics} | is_multi_select: 'true' | options: '[{"label": "test", "value": "test_value"}, {"label": "test2", "value": "test_value2"}]'}}
```






#### Radio button

For showing options as radio buttons instead of a select dropdown in the **Variables** tab. This cannot be used on its own&#8212;it must be used in combination with a [list](#list).



```sql
is_radio_button: 'true'
```



![An example radio button rendered in Braze.](https://www.braze.com/docs/assets/img_archive/sql_variables_campaigns.png?e1555477414b58a1bc73b28d70072345){: style="max-width:50%;"}

#### Multi-select

For whether the select dropdown allows a single or multi-select. This cannot be used on its own&#8212;it must be used in combination with a [list](#list).



```sql
is_multi_select: 'true'
```



![An example multi-select list rendered in Braze.](https://www.braze.com/docs/assets/img_archive/sql_variables_productname.png?fab3ae0ecdc3910891ea039c33ba3882){: style="max-width:50%;"}

#### Options 

For providing the list of selectable options in the form of a label and value. The label is what gets shown and the value is what the variable gets replaced with when the option is selected. This cannot be used on its own&#8212;it must be used in combination with a [list](#list).



```sql
options: '[{"label": "test", "value": "test_value"}, {"label": "test2", "value": "test_value2"}]'
```



## Braze-specific variable types

### Date range

For displaying a calendar to select dates from. Replace `start_date` and `end_date` with a Unix timestamp in seconds for a specified date in UTC, such as `1696517353`. Optionally, you can set only a `start_date` or `end_date` to only display a single date in the calendar. If the labels of your `start_date` and `end_date` don't match, they'll be treated as two separate dates, rather than a date range.




```
time > {{start_date.${custom_label}}} AND time < {{end_date.${custom_label}}}
```




You can set the date range to any of the following options. If both `start_date` and `end_date` are used and share the same label all options will be shown. Otherwise, if only one is used, then only the specified option will be displayed.

| Option | Description | Required values |
| --- | --- | --- |
| Relative | Specifies the past X days | Requires `start_date` |
| Start date | Specifies a start date | Requires `start_date` |
| End date | Specifies an end date | Requires `end_date` |
| Date range | Specifies both a start and end date | Requires both `start_date` and `end_date` |
{: .reset-td-br-1 .reset-td-br-2 .reset-td-br-3 aria-label="Date range" }

Your Liquid will be used to display a calendar within the given date range:

![An example calendar rendered in Braze.](https://www.braze.com/docs/assets/img_archive/query_builder_time_range.png?9df6c2f0d39e53a0524e0b2e15352486){: style="max-width:50%;"}

### Campaigns



For selecting one campaign. Sharing the same label with a Canvas will result in a radio button within the **Variables** tab that for selecting either Canvas or campaign.




```sql
campaign_id = '{{campaign.${custom_label}}}'
```






For multi-selecting campaigns. Sharing the same label with a Canvas will result in a radio button within the **Variables** tab for selecting either Canvas or campaign.

- **Replacement value:** Campaigns BSON IDs




```sql
campaign_id IN ({{campaigns.${custom_label}}})
```






For selecting campaign variants that belong to the selected campaign. It must be used in conjunction with a campaign or campaigns variable.

- **Replacement value:** Campaign variants API IDs, strings delimited by commas such as `api-id1, api-id2`.




```sql
message_variation_api_id IN ({{campaign_variants.${custom_label}}})
```






**Important:**


All campaign and Canvas variables must use the same identifiers in order to sync states within a single group.



### Canvases



For selecting one Canvas. Sharing the same label with a campaign will result in a radio button within the **Variables** tab that for selecting either Canvas or campaign.

- **Replacement value:** Canvas BSON ID




```sql
canvas_id = '{{canvas.${custom_label}}}'
```






For selecting multiple Canvases. Sharing the same label with a campaign will result in a radio button within the **Variables** tab for selecting either Canvas or campaign.

- **Replacement value:** Canvases BSON IDs




```sql
canvas_id IN ({{canvases.${custom_label}}})
```






For selecting Canvas variants that belong to a chosen Canvas. It must be used with a Canvas or Canvases variable. Set to one or more Canvas variants API IDs, as a comma-separated string, such as in `api-id1, api-id2`.




```sql
canvas_variation_api_id IN ({{canvas_variants.${custom_label}}})
```






For selecting a Canvas step that belongs to a chosen Canvas. It must be used with a Canvas variable.




```sql
canvas_step_api_id = '{{canvas_step.${custom_label}}}'
```






For selecting Canvas steps that belong to chosen Canvases. It must be used with a Canvas or Canvases variable.




```sql
canvas_step_api_id IN ({{canvas_steps.${custom_label}}})
```






**Important:**


All campaign and Canvas variables must use the same identifiers in order to sync states within a single group.



### Products

`products` is used to select one or more products from the Braze dashboard.




```sql
({{products.${custom_label}}})
```





```sql
SELECT product_name
FROM FULL_GAME_AND_DLC
WHERE product_id IN ({{products.${Games with DLC}}});
```




### Custom events

Select one or more custom events or custom event properties from a list.



`custom_events` is used to select one or more custom events from the Braze dashboard.




```sql
'{{custom_events.${custom_label}}}'
```





```sql
SELECT event_name
FROM CUSTOM_EVENTS_TABLE
WHERE event_name IN ({{custom_events.${Purchased Game}}}); 
```






`custom_event_properties` is used to select one or more properties from the currently-select custom event.  Requires a set `custom_events` variable.




```sql
name = '{{custom_event_properties.${property names)}}}'
```






### Workspace

`workspace` is used to select a single workspace from the Braze dashboard.




```sql
workspace_id = '{{workspace.${app_group_id}}}'
```




### Catalogs

Select one or more catalogs or catalog fields from a list.



`catalogs` is used to select one or more catalogs from the Braze dashboard.




```sql
catalog_id = '{{catalogs.${catalog}}}'
```






`catalog_fields` is used to set one or more fields from the currently-selected catalog. Requires a set `catalogs` variable.




```sql
field_name = '{{catalog_fields.${custom_label}}}'
```






### Segments

For selecting segments that have [Analytics Tracking](https://www.braze.com/docs/user_guide/analytics/tracking/segment_analytics_tracking/) turned on. Set this to the segment analytics ID, which corresponds to the IDs stored in the `user_segment_membership_ids` column in the tables where this column is available.




```sql
{{segments.${analytics_segments}}}
```




### Tags

For selecting tags for campaigns and Canvases. Set to Campaigns and Canvases with single-quoted comma-separated BSON IDs that are associated with the selected tags.




```sql
{{tags.${some tags}}}
```




## Variable metadata

Metadata can be attached to a variable to change its behavior by appending the metadata with a pipe ( &#124; ) character following the variable label. The ordering of the metadata doesn't matter and you can append any number of them. Additionally, all types of metadata can be used for any variable, except for special metadata that is specific to certain variables (this will be indicated in those cases). The usage of all metadata is optional and is used to change the default's variable behavior.




```sql
{{string.${my var}| is_required: 'false' | description: 'My optional string var'}}
```




### Boolean

For knowing whether a variable's value is filled. This is useful for optional variables where you want to short-circuit a condition if a variable's value is not filled. Can be set to `true` or `false` depending on the other variable's value.




```sql
{{string.${type_name_has_no_value} | visible: 'false'}} or {{string.${type_name_has_value} | visible: 'false'}}
```




`type` and `name` refer to the referenced variable. For example, to short-circuit the following optional variable: `{{campaigns.${messaging}}`:


```sql
{{string.${campaigns_messaging_has_no_value}  | visible: 'false'}} OR campaign_id IN ({{campaigns.${messaging} | is_required: 'false'}})
```


### Visible

For whether variables are visible. All variables are visible by default in the **Variables** tab, where you can input values.

There are several special variables whose value is dependent on another variable, such as whether another variable has a value. These special variables are marked as not visible so they don't show in the **Variables** tab.



```sql
visible: 'false'
```



### Required

For whether variables are required by default. An empty value for a variable usually leads to an incorrect query.



```sql
required: 'false'
```



### Order

For selecting the position of the variable in the **Variables** tab.



```sql
order: '1'
```



### Include quotes



For surrounding the values of a variable with single quotes.



```sql
include_quotes: 'true'
```





For surrounding the values of a variable with double quotes.



```sql
include_double_quotes: 'true'
```





### Placeholder

For specifying the placeholder text shown in the variable's input field.



```sql
placeholder: 'enter some value'
```



### Description

For specifying the description text shown under the variable's input field.



```sql
description: 'some description'
```



### Default value

For specifying the default value for the variable when no value is specified.



```sql
default_value: '5'
```



### Hide label

For hiding the variable's label.



```sql
hide_label: 'true'
```


