var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const assert = require('assert-plus');
const { List: ImmutableList } = require('immutable');
const Promise = require('bluebird');
const path = require('path');
const fs = require('mz/fs');
const google = require('googleapis');
const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);

const { ChronoUnit } = joda;

const logger = require('./lib/logger');
const Event = require('./record/Event');
const async_user_cache = require('./lib/async_user_cache');
const Calendar = require('./record/Calendar');
const { render_css, render_dayview, render_index } = require('./lib/render');
const rfc3339_formatter = require('./lib/rfc3339_date_formatter');

module.exports = function update(oauth_client, out_directory, config, now) {
    assert.object(oauth_client, 'oauth_client');
    assert.string(out_directory, 'out_directory');
    assert.object(config, 'config');
    assert.object(now, 'now');

    const time_zone = now.zone();

    async function load_calendars() {
        const user_cache = async_user_cache(oauth_client);

        const calendars = await Promise.map(config.calendars, async function (calendar_config) {
            const raw_events = await get_todays_events(oauth_client, calendar_config.id);
            const events = await Promise.map(raw_events, event => Event.from_json(event, user_cache)).filter(event => event.confirmed);

            logger.debug(`Calendar "${calendar_config.name}" updated successfully`);

            return new Calendar(_extends({
                events: new ImmutableList(events)
            }, calendar_config));
        });

        return new ImmutableList(calendars);
    }

    async function write_styles() {
        const css = await render_css(config.options);
        const css_file = path.join(out_directory, 'styles.css');

        return fs.writeFile(css_file, css);
    }

    async function write_calendars(calendars) {
        await Promise.map(calendars.toArray(), async function (calendar, i) {
            const prev_url = `${calendars.get(i - 1).id}.html`;
            const next_url = `${calendars.get((i + 1) % calendars.size).id}.html`;
            const html = await render_dayview(calendar, prev_url, next_url, time_zone, config.options, now);
            const out_file = path.join(out_directory, `${calendar.id}.html`);

            return fs.writeFile(out_file, html);
        });
    }

    async function get_todays_events(auth_client, calendar_id) {
        assert.object(auth_client, 'auth_client');
        assert.string(calendar_id, 'calendar_id');

        const start_of_day = now.truncatedTo(ChronoUnit.DAYS);
        const end_of_day = start_of_day.plusDays(1).minusNanos(1);

        // See https://developers.google.com/google-apps/calendar/v3/reference/events/list
        const calendar = google.calendar('v3');
        const params = {
            auth: auth_client,
            calendarId: calendar_id,
            timeMin: rfc3339_formatter.format(start_of_day),
            timeMax: rfc3339_formatter.format(end_of_day),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: time_zone.id()
        };

        const response = await Promise.fromCallback(cb => calendar.events.list(params, cb));

        return response.items;
    }

    async function write_index() {
        const main_calendar_id = config.calendars[0].id;
        const out_file = path.join(out_directory, 'index.html');
        const html = await render_index(main_calendar_id);

        await fs.writeFile(out_file, html);
    }

    return Promise.join(write_styles(), write_index(), load_calendars().then(write_calendars));
};