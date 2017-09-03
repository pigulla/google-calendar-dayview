const { LocalDate, ZonedDateTime, Duration } = require('js-joda');

const load_calendars = require('~/server/lib/load_calendars');
const { init_oauth_client } = require('~/lib/oauth_client');

module.exports = async function (app, { time_zone, credentials, token, calendars, refresh_after }) {
    const cache_for = Duration.ofSeconds(refresh_after);
    const oauth_client = init_oauth_client(credentials, token);
    let data = await load();

    async function load() {
        console.log('Refreshing calendars');

        const result = await load_calendars(oauth_client, calendars, LocalDate.now(), time_zone);
        return {
            updated: ZonedDateTime.now(),
            calendars: result.calendars,
            users: result.users
        };
    }

    app.get('/calendars.json', async function (request, response) {
        const refresh_required = Duration.between(data.updated, ZonedDateTime.now()).compareTo(cache_for) > 0;

        if (refresh_required) {
            data = await load();
        }

        response.json(data).end();
    });
};
