/* eslint-disable no-process-env, prefer-template */

const path = require('path');

module.exports = {
    get out_directory() {
        return path.join(__dirname, '..', 'out');
    },

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
