const AsyncCache = require('async-cache');
const google = require('googleapis');
const Promise = require('bluebird');

const logger = require('./logger');
const User = require('../record/User');

const admin = google.admin('directory_v1');

module.exports = function async_user_cache(auth_client) {
    const cache = new AsyncCache({
        load(email, callback) {
            const options = {
                auth: auth_client,
                userKey: email,
                viewType: 'domain_public'
            };

            Promise.fromCallback(cb => admin.users.get(options, cb)).then(response => callback(null, User.from_json(response))).catch(error => callback(null, User.as_unknown(email)));
        }
    });

    return function (email, source = null) {
        return Promise.fromCallback(cb => cache.get(email, cb)).tap(function (user) {
            if (user.is_unknown) {
                const details = source ? ` (${source})` : '';

                logger.warn(`Could not get data for user "${email}"${details}`);
            }
        });
    };
};