const AsyncCache = require('async-cache');
const google = require('googleapis');
const Promise = require('bluebird');

const User = require('./record/User');

module.exports = function async_user_cache(auth_client) {
    const admin = google.admin('directory_v1');
    const cache = new AsyncCache({
        load(key, cb) {
            const options = {
                auth: auth_client,
                userKey: key,
                viewType: 'domain_public'
            };

            admin.users.get(options, function (error, response) {
                if (error) {
                    console.warn(`Error getting user info for "${key}" (${error.message})`);

                    return cb(null, new User({
                        id: null,
                        email: key,
                        first_name: null,
                        last_name: null
                    }));
                }

                cb(null, User.fromJSON(response));
            });
        }
    });

    return email => Promise.fromCallback(cb => cache.get(email, cb));
};
