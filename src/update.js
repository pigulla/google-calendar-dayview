// https://console.developers.google.com/apis/dashboard?project=still-sensor-166710

const assert = require('assert-plus');
const { List: ImmutableList } = require('immutable');
const Promise = require('bluebird');
const path = require('path');
const fs = require('mz/fs');
const google = require('googleapis');
const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);

const { ZonedDateTime, ZoneId, ChronoUnit } = joda;

const Event = require('./record/Event');
const init_oauth_client = require('./init_oauth_client');
const async_user_cache = require('./async_user_cache');
const Calendar = require('./record/Calendar');
const { render_css, render_dayview, render_index } = require('./render');
const rfc3339_formatter = require('./rfc3339_date_formatter');


module.exports = function update(config, logger) {
    const calendar_configs = config.get('calendars');
    const time_zone = config.get('time_zone');
    const credentials = config.get('credentials');
    const token_file = config.get('token_file');
    const out_directory = config.get('out_directory');
    const render_options = config.get('render_options');

    async function load_calendars() {
        const oauth_client = await init_oauth_client(credentials, token_file);
        const user_cache = async_user_cache(oauth_client);

        const calendars = await Promise.map(calendar_configs, async function (calendar_config) {
            const raw_events = await get_todays_events(oauth_client, calendar_config.id);
            const events = await Promise
                .map(raw_events, event => Event.fromJSON(event, user_cache))
                .filter(event => event.confirmed);

            return new Calendar({
                events: new ImmutableList(events),
                ...calendar_config
            });
        });

        return new ImmutableList(calendars);
    }

    async function write_styles() {
        const css = await render_css(render_options);
        const css_file = path.join(out_directory, 'styles.css');

        return fs.writeFile(css_file, css);
    }

    async function write_calendars(calendars) {
        await Promise.map(calendars.toArray(), async function (calendar, i) {
            const prev_url = `${calendars.get(i - 1).id}.html`;
            const next_url = `${calendars.get((i + 1) % calendars.size).id}.html`;
            const html = await render_dayview(calendar, prev_url, next_url, time_zone, render_options);
            const out_file = path.join(out_directory, `${calendar.id}.html`);

            return fs.writeFile(out_file, html);
        });
    }

    async function get_todays_events(auth_client, calendar_id) {
        assert.string(time_zone, 'time_zone');
        assert.object(auth_client, 'auth_client');
        assert.string(calendar_id, 'calendar_id');

        const start_of_day = ZonedDateTime.now(ZoneId.of(time_zone)).truncatedTo(ChronoUnit.DAYS);
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
            timeZone: time_zone
        };

        const response = await Promise.fromCallback(cb => calendar.events.list(options, cb));

        return response.items;
    }

    async function write_index() {
        const main_calendar_id = calendar_configs[0].id;
        const out_file = path.join(out_directory, 'index.html');
        const html = await render_index(main_calendar_id);

        await fs.writeFile(out_file, html);
    }

    return Promise.join(
        write_styles(),
        write_index(),
        load_calendars().then(write_calendars)
    );
};
