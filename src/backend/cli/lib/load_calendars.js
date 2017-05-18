const assert = require('assert-plus');
const google = require('googleapis');
const Promise = require('bluebird');
const { Set: ImmutableSet } = require('immutable');

const logger = require('./logger');
const Event = require('@/record/Event');
const Calendar = require('@/record/Calendar');
const Theme = require('@/record/Theme');
const User = require('@/record/User');
const { rfc3339 } = require('@/date_formatter');

function load_user(auth_client, email) {
    const admin = google.admin('directory_v1');
    const options = {
        auth: auth_client,
        userKey: email,
        viewType: 'domain_public'
    };

    return Promise
        .fromCallback(cb => admin.users.get(options, cb))
        .then(response => User.parse(response))
        .catch(error => User.as_unknown(email));
}

/**
 * @param {object} oauth_client
 * @param {Array.<object>} calendars_configs
 * @param {joda.LocalDate} day
 * @returns {Promise.<Immutable.List>}
 */
async function load_calendars(oauth_client, calendars_configs, day, time_zone) {
    const start_of_day = day.atStartOfDayWithZone(time_zone);
    const end_of_day = start_of_day.plusDays(1).minusNanos(1);

    const calendars = await Promise.mapSeries(calendars_configs, async function (calendar_config) {
        const raw_events = await get_events(oauth_client, calendar_config.id, start_of_day, end_of_day);
        const { theme, ...config } = calendar_config;
        const events = raw_events
            .map(event => Event.parse(event))
            .filter(event => event.confirmed);

        logger.debug(`Calendar "${calendar_config.name}" loaded successfully`);

        return new Calendar({
            ...config,
            theme: Theme.fromJSON(theme),
            events
        });
    });

    const users = await Promise
        .resolve(calendars)
        .reduce((people, calendar) => people.concat(calendar.all_users), new ImmutableSet())
        .map(email => load_user(oauth_client, email), { concurrency: 5 });

    return { calendars, users };
}

/**
 * @param {object} oauth_client
 * @param {string} calendar_id
 * @param {joda.ZonedDateTime} from
 * @param {joda.ZonedDateTime} to
 * @returns {Promise.<Array.<object>>}
 */
async function get_events(auth_client, calendar_id, from, to) {
    assert.object(auth_client, 'auth_client');
    assert.string(calendar_id, 'calendar_id');

    // See https://developers.google.com/google-apps/calendar/v3/reference/events/list
    const calendar = google.calendar('v3');
    const params = {
        auth: auth_client,
        calendarId: calendar_id,
        timeMin: rfc3339(from),
        timeMax: rfc3339(to),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
        timeZone: from.zone().id()
    };

    const response = await Promise.fromCallback(cb => calendar.events.list(params, cb));

    return response.items;
}

module.exports = load_calendars;