const assert = require('assert-plus');
const google = require('googleapis');
const Promise = require('bluebird');

class UserCache {
    constructor(auth_client) {
        assert.object(auth_client, 'auth_client');

        this._cache = new Map();
        this._admin = google.admin('directory_v1');
        this._auth_client = auth_client;
    }

    async get(email) {
        if (!this._cache.has(email)) {
            const user = await this._load(email);

            this._cache.set(email, user);
        }

        return this._cache.get(email);
    }


    async _load(email) {
        const options = {
            auth: this._auth_client,
            userKey: email,
            viewType: 'domain_public'
        };

        const response = await Promise.fromCallback(cb => this._admin.users.get(options, cb));

        return response.name.fullName;
    }
}

module.exports = UserCache;
