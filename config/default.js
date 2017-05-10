/* eslint-disable no-process-env, prefer-template */

const path = require('path');

module.exports = {
    get out_directory() {
        return path.join(__dirname, '..', 'out');
    },

    get token_file() {
        const dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

        return path.join(dir, '.credentials', 'roomcalendar.json');
    },

    // See here: https://developers.google.com/google-apps/calendar/quickstart/nodejs#step_1_turn_on_the_api_name
    credentials: null,

    delay: 30,

    calendars: [],

    time_zone: 'Europe/Berlin',

    render_options: {
        client_refresh_interval_seconds: 30,
        start_of_day_hour: 7.5,
        grid_step_minutes: 30,
        day_length_hours: 10.5
    }
};
