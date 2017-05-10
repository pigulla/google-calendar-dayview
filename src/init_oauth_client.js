/* eslint-disable no-console */

// Based on: https://developers.google.com/google-apps/calendar/quickstart/nodejs

const path = require('path');
const assert = require('assert-plus');

const clipboardy = require('clipboardy');
const fs = require('mz/fs');
const GoogleAuth = require('google-auth-library');
const Promise = require('bluebird');
const readline = require('readline');

// If modifying these scopes, delete your previously saved credentials
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
];

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @parma {string} token_dir
 */
async function init_oauth_client(credentials, token_file) {
    assert.object(credentials, 'credentials');
    assert.string(token_file, 'token_file');

    const client_secret = credentials.installed.client_secret;
    const client_id = credentials.installed.client_id;
    const redirect_url = credentials.installed.redirect_uris[0];
    const auth = new GoogleAuth();
    const auth_client = new auth.OAuth2(client_id, client_secret, redirect_url);

    try {
        const token = await fs.readFile(token_file);

        auth_client.credentials = JSON.parse(token);
    } catch (error) {
        await get_new_token(auth_client, token_file);
    }

    return auth_client;
}

async function read_line(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const code = await Promise.fromCallback(function (cb) {
        rl.question(prompt, function (input) {
            rl.close();
            cb(null, input);
        });
    });

    return code;
}

/**
 *
 * @param {mixed} data
 * @returns {boolean}
 */
async function try_copy_to_clipboard(data) {
    try {
        await clipboardy.write(data);
        return true;
    } catch (error) {
        return error;
    }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} auth_client The OAuth2 client to get token for.
 */
async function get_new_token(auth_client, token_file) {
    const auth_url = auth_client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    const copied = await try_copy_to_clipboard(auth_url);

    console.log(
        `Authorize this app by visiting this url${copied ? ' (also copied to your clipboard)' : ''}:\n${auth_url}`
    );

    const code = await read_line('Enter the code from that page here: ');
    const token = await Promise.fromCallback(cb => auth_client.getToken(code, cb));

    auth_client.credentials = token;
    await store_token(token, token_file);

    return auth_client;
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
async function store_token(token, token_file) {
    try {
        await fs.mkdir(path.dirname(token_file));
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }

    await fs.writeFile(token_file, JSON.stringify(token));

    console.log(`Token stored to ${token_file}`);
}

module.exports = init_oauth_client;
