# Add-to-calendar links

> When promoting an event, sale, or appointment, you can help users easily save the event to their calendar by adding an "add to calendar" link to your emails.

To do so, draft your email and determine where you want your links to be. Then add two options: one for Google Calendar and one for other calendars (such as iCal or Outlook). For example, "Add to Google Calendar" and "Add to iCal or Outlook".

![Link dialog when adding a link in the dashboard. The "Link Info" tab is selected and the text is set to "Add to Google Calendar".](https://www.braze.com/docs/assets/img_archive/calendar_1.png?2d414e8f6ddf2aeefed3d07bf75114c7){: style="max-width:50%"}

## URL format

Add the following URL to your links, replacing the placeholders. The only difference between these two URLs is that Google Calendar needs an additional parameter: `&format=gcal`.




```
https://ics.agical.io/?subject=EVENT_SUBJECT&location=EVENT_LOCATION&dtstart=START_TIME&dtend=END_TIME&description=EVENT_DESCRIPTION&format=gcal
```




```
https://ics.agical.io/?subject=EVENT_SUBJECT&location=EVENT_LOCATION&dtstart=START_TIME&dtend=END_TIME&description=EVENT_DESCRIPTION
```




Replace the following:

- `EVENT_SUBJECT`: Title of the event
- `EVENT_LOCATION`: Location of the event
- `START_TIME`: The event's start time in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) as UTC
- `END_TIME`: The event's end time in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) as UTC
- `EVENT_DESCRIPTION`: Description of the event

Replace any spaces with the HTML escape code `%20`. For example, a subject of "Meet Braze" would be "Meet%20Braze".

Here's an example of an "Add to Google Calendar" URL:

```
https://ics.agical.io/?subject=Meet%20Braze&location=114%20Sansome%20Street&dtstart=2021-06-24T15:00:00Z&dtend=2021-06-24T16:00:00Z&description=Braze%20Party&format=gcal
```

### Additional parameters

The following parameters are optional and can be used to define additional aspects of an event.

- **Organizer name:** `&organizer=name`
- **Attach URL related to event:** `&attach=http://www.example.com/`
- **Duration:** `duration=30M`, as an alternative to the event end time (dtend), specify a duration like 1H or 30M
- **Reminder alarm time, in minutes:** `&reminder=15`
- **All day event:** `&allday=1`
- **UID:** optional parameter to hard-code the unique identifier for the event allowing some calendar apps the ability to update the event over time. The string @ics.agical.io is automatically appended to the value.

You can also add additional parameters for recurring events:
- **Weekly events:** `&recur=weekly`
- **Monthly events:** `&recur=monthly`
- **End of recurrence:** `&recuruntil=END_DATE`, where `END_DATE` is the date and time the recurrence ends in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) as UTC

## Link behavior

When a user clicks on the link, calendars automatically transform the UTC timestamps in the URLs to reflect the user's time zone set in their calendar.

For example, if you open the example "Add to Google Calendar" link and your calendar is set to CST, the event's time will pre-populate according to what 3 pm UTC is in CST (10 am).

### Google Calendar

When clicked, Google Calendar opens in a new tab or window with the event's details pre-populated in the invite and ready for a user to save. This happens on both mobile and desktop.

![Google Calendar dialog to add an event with the event's details added and ready to save.](https://www.braze.com/docs/assets/img_archive/calendar_2.png?b2c3542398a10ce68853c9069c979b90){: style="max-width:75%"}

### iCal or Outlook

When clicked on desktop, an ICS file is downloaded. The user then needs to open the ICS file, which will open iCal or Outlook and prompt the user to add the event to their calendar.

![iCal calendar with a dialog for adding a new event, which prompts the user to select a calendar and confirm.](https://www.braze.com/docs/assets/img_archive/calendar_3.png?513edbe9e27d1e315729cf4d7379cb28){: style="max-width:75%"}

![iCal calendar with the event added.](https://www.braze.com/docs/assets/img_archive/calendar_4.png?58a31bee33e51a5f216caf403457424e){: style="max-width:81%"}

On mobile, users need to press and hold the link, which prompts them to add it to their calendar.

![iOS pop-up when you press and hold on a calendar link, which includes a button to "Add to Calendar".](https://www.braze.com/docs/assets/img_archive/calendar_5.png?b52a6567f3b872fcaecf076a76f592cf){: style="max-width:50%"}

For more information, refer to:
* [Create events for Google Calendar](https://developers.google.com/calendar/api/guides/create-events)
* [Create an Add to calendar link in an email message](https://support.microsoft.com/en-us/office/create-an-add-to-calendar-link-in-an-email-message-34f8ea28-322a-4867-b423-2998f9634e59)


