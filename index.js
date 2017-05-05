'use strict';

/* eslint-disable no-console */

// https://console.developers.google.com/apis/dashboard?project=still-sensor-166710

const assert = require('assert-plus');
const Promise = require('bluebird');
const config = require('config');
const fs = require('mz/fs');
const google = require('googleapis');
const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);

const { ZonedDateTime, ZoneId, DateTimeFormatter, ChronoUnit, Duration } = joda;

const Event = require('./src/record/Event');
const init_oauth_client = require('./init_oauth_client');
const UserCache = require('./UserCache');
const render = require('./src/render');

const rfc3339_formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ"); // eslint-disable-line quotes

async function main() {
    const oauth_client = await init_oauth_client();
    const user_cache = new UserCache(oauth_client);

    const events = await get_todays_events(oauth_client, config.get('calendar_id'));
    const parsed_events = await Promise.mapSeries(events, event => Event.fromJSON(event, user_cache));
    const { html, css } = await render(parsed_events);

    await fs.writeFile('./out/index.html', html);
    await fs.writeFile('./out/styles.css', css);

    // if (events.length === 0) {
    //     console.log('No upcoming events found.');
    // } else {
    //     console.log('Upcoming 10 events:');
    //     for (let i = 0; i < events.length; i++) {
    //         const event = events[i];
    //         const start = event.start.dateTime || event.start.date;
    //
    //         console.log('%s - %s', start, event.summary);
    //     }
    // }
}

(async function () {
    try {
        await main();
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
})();

async function do_stuff(auth_client) {
    const admin = google.admin('directory_v1');
    const options = {
        auth: auth_client,
        userKey: 'miriam.pabst@finanzchef24.de',
        viewType: 'domain_public'
    };

    const response = await Promise.fromCallback(cb => admin.users.get(options, cb));

    console.dir(response);
}

// async function parse_event(event, user_cache) {
//     const start = ZonedDateTime.parse(event.start.dateTime);
//     const end = ZonedDateTime.parse(event.end.dateTime);
//     const participant_emails = event.attendees
//         .filter(attendee => !attendee.resource)
//         .filter(attendee => attendee.responseStatus === 'accepted')
//         .map(attendee => attendee.email);
//     const confirmed = event.attendees
//         .filter(attendee => attendee.self && attendee.responseStatus === 'accepted')
//         .length > 0;
//     const participants = await Promise.mapSeries(participant_emails, email => user_cache.get(email));
//
//     return Object.freeze({
//         id: event.id,
//         confirmed,
//         participants: Object.freeze(participants),
//         link: event.htmlLink,
//         created: ZonedDateTime.parse(event.created),
//         updated: ZonedDateTime.parse(event.updated),
//         start,
//         end,
//         duration: Duration.between(start, end),
//         summary: event.summary,
//         creator: await user_cache.get(event.creator.email),
//         organizer: await user_cache.get(event.organizer.email)
//     });
// }

async function get_todays_events(auth_client, calendar_id) {
    assert.object(auth_client, 'auth_client');
    assert.string(calendar_id, 'calendar_id');

    const start_of_day = ZonedDateTime.now(ZoneId.of('Europe/Berlin')).truncatedTo(ChronoUnit.DAYS);
    const end_of_day = start_of_day.plusDays(1).minusNanos(1);

    // See https://developers.google.com/google-apps/calendar/v3/reference/events/list
    const calendar = google.calendar('v3');
    const options = {
        auth: auth_client,
        calendarId: calendar_id,
        timeMin: rfc3339_formatter.format(start_of_day),
        timeMax: rfc3339_formatter.format(end_of_day),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
        timeZone: 'Europe/Berlin'
    };

    const response = await Promise.fromCallback(cb => calendar.events.list(options, cb));

    return response.items;
}
