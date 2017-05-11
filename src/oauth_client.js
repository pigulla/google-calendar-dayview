/* eslint-disable no-console */

const assert = require('assert-plus');
const GoogleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
];

function init_oauth_client(credentials, token = undefined) {
    assert.object(credentials, 'credentials');
    assert.optionalString(token, 'token');

    const { client_secret, client_id, redirect_uris } = credentials.installed;

    const auth = new GoogleAuth();
    const client = new auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (token) {
        client.credentials = token;
    }

    return client;
}

function get_oauth_url(client) {
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
}

module.exports = {
    init_oauth_client,
    get_oauth_url
};
