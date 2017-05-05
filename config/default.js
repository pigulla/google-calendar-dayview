/* eslint-disable no-process-env, prefer-template */

module.exports = {
    calendar_id: null,

    get token_dir() {
        return (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
    },

    // See here: https://developers.google.com/google-apps/calendar/quickstart/nodejs#step_1_turn_on_the_api_name
    credentials: null
};
