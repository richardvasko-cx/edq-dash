# Location tracking

> Location collection captures a user's most recent location when the app was opened using GPS location data. You can use this information to segment data based on users who were in a defined location.

## Enabling location tracking

To enable location collection on your app, refer to the developer guide for the platform you're using:

- [iOS](https://www.braze.com/docs/developer_guide/analytics/tracking_location/?sdktab=swift)
- [Android](https://www.braze.com/docs/developer_guide/analytics/tracking_location/?sdktab=android)
- [Web](https://www.braze.com/docs/developer_guide/analytics/tracking_location/?sdktab=web)

In general, mobile apps use the device's GPS chip and other systems (such as Wi-Fi scanning) to track a user's location. Web apps use WPS (Wi-Fi Positioning System) to track a user's location. All of these platforms require users to opt in to location tracking. The accuracy of your location tracking data may be affected by whether or not your users have Wi-Fi enabled on their devices. Android users can also choose different location modes—users that are on "Battery saving" or "Device only" mode may have inaccurate data.

### SDK user location by IP address

Braze detects user locations from the geolocated country using the IP address from the start of the first SDK session. 

Previously, Braze used the country code from the device locale during SDK user creation and for the duration of the first session. Only after processing the first session start would the IP address be used for setting the more reliable country on the user. This meant that user country was set with greater accuracy only from the second session onward, only after the first session start was processed.

Now, Braze uses the IP address to set the country value on user profiles created through the SDK, and that IP-based country setting is available during and after the first session.

#### Automatic location collection

When enabled, automatic location collection in the SDK is separate from IP-based country behavior. It relates to device location signals such as GPS when the user has granted permission, which powers filters like `Most Recent Location`. It does not automatically populate fine-grained fields such as city from IP alone. 

For city or postal-level targeting, use [`setLastKnownLocation()`](https://www.braze.com/docs/developer_guide/analytics/tracking_location/) (see the SDK article for your platform), your own IP geolocation service writing custom attributes, or [Location targeting](https://www.braze.com/docs/user_guide/audience/segments/location_targeting/) with the data you collect.

## Location targeting

Using location tracking data and segments, you can set up location-based campaigns and strategies. For example, you may want to run a promotional campaign for users who live in a particular region or exclude users in a region that has stricter regulations.

Refer to [Location targeting](https://www.braze.com/docs/user_guide/audience/segments/location_targeting/) for more information on creating a location segment.

## Hard setting the default location attribute

You can also use the [`users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/) in our API to update the [`current_location`](https://www.braze.com/docs/api/objects_filters/user_attributes_object/#migrating-push-tokens) standard attribute. An example is:

```
https://[your_braze_rest_endpoint]/users/track
Content-Type: application/json
Authorization: Bearer YOUR-REST-API-KEY
{
  "attributes": [ 
 	{
 	  "external_id" : "XXX",
 	  "current_location" : {"longitude":-0.118092, "latitude": 51.509865}
      }
   ]
}
```

## Partnership support for beacon and geofence

Combining existing beacon or geofence support with our targeting and messaging features gives you more information about your users' physical actions so you can message them accordingly. You can leverage location tracking with some of our partners: 

- [Radar](https://www.braze.com/docs/partners/message_personalization/location/radar/)
- [Infillion](https://www.braze.com/docs/partners/message_personalization/location/infillion/)
- [Foursquare](https://www.braze.com/docs/partners/message_personalization/location/foursquare/)

## Differences between geofences and location tracking

In Braze, geofences and location tracking serve different purposes:

| | Location tracking | Geofences |
|---|---|---|
| Purpose | Segment users based on where they were | Trigger messaging when users enter or exit an area |
| Typical use | `Most Recent Location` and related filters | Real-time campaigns on geofence enter or exit |
| When location is evaluated | Updated when the app is open (session start); reflects the user's last known location | Monitored by the OS when location permissions allow, including when the app is in the background or closed |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Location tracking compared to geofences" }

- **Location tracking:** Collect and store each user's most recent location on their profile. You use this data for backward-looking segmentation—for example, the `Most Recent Location` filter targets users based on where they last opened your app, not necessarily where they are in real time.
- **Geofences:** Define virtual boundaries around a latitude, longitude, and radius. When a user enters or exits a boundary, Braze can trigger actions such as sending a campaign. Geofences require additional SDK setup beyond basic location tracking.

Both features require users to grant location permissions. If a user opts out of location tracking, previously stored location data isn't automatically removed from their profile, but new location data isn't collected.


## Frequently asked questions

### When does Braze collect location data?

Braze only collects location when the application is open in the foreground. As a result, our `Most Recent Location` filter targets users based upon where they last opened the application (also referred to as session start).

You should also keep the following nuances in mind:

- If location is disabled, the `Most Recent Location` filter shows the last location recorded.
- If a user has ever had a location stored on their profile, they qualify for the `Location Available` filter, even if they've opted out of location tracking since then.

### What's the difference between the Most Recent Device Locale and Most Recent Location filters?

The `Most Recent Device Locale` comes from the user's device settings. For example, this appears for iPhone users in their device at **Settings** > **General** > **Language & Region**. This filter is used to capture language and regional formatting, such as dates and addresses, and is independent of the `Most Recent Location` filter.

The `Most Recent Location` is the last known GPS location of the device. This is updated on session start and is stored on the user's profile.

### If a user opts out of location tracking, is their previous location data removed from Braze?

No. If a user has ever had a location stored on their profile, that data is not automatically removed if they later opt out of location tracking.

## Troubleshooting

### No users have available locations

Braze captures a user's most recent location by default through the SDK. This typically means that the "recent location" is the location from which your user most recently used your app. If you send Braze background location data, you may have more granular data available.

If no users have available locations, two quick checks can help you confirm data collection and date transfer.

#### Data collection

Confirm that your app is collecting location data:

- For iOS, this means that users opt-in to share their location data via a prompt at some point in the user journey. 
- For Android, confirm that your app asks for fine or coarse location permissions at installation.

To see whether user location data is being sent to Braze, use the **Location Available** filter. This filter allows you to see the percentage of users with a "most recent location".

![A "Test Location" segment that uses the "Location Available" filter.](https://www.braze.com/docs/assets/img_archive/trouble7.png?d30ce18b169a7c5525b549b70c4f9da3)

#### Data transfer

Confirm that your developers are passing location data to Braze. Normally, the passing of location data is handled automatically by the SDK after the user gives permissions, but your developers may have disabled location tracking in Braze. More information on location tracking can be found for:
- [Android](https://www.braze.com/docs/developer_guide/analytics/tracking_location?sdktab=android)
- [iOS](https://www.braze.com/docs/developer_guide/analytics/tracking_location?sdktab=swift)
- [Web](https://www.braze.com/docs/developer_guide/analytics/tracking_location?sdktab=web)