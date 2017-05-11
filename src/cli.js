/* eslint-disable no-process-exit, no-console, no-unused-expressions, newline-per-chained-call */

const config = require('config');
const fs = require('mz/fs');
const Promise = require('bluebird');
const yargs = require('yargs');
const Joi = require('joi');

const config_schema = require('./config-schema');
const { init_oauth_client, get_oauth_url } = require('./oauth_client');
const update = require('./update');

// Workaround, see https://github.com/yargs/yargs/issues/510
function async_handler(fn) {
    return function (argv) {
        (async function () {
            await fn(argv);
        })().catch(function (error) {
            console.error(error);
            process.exit(2);
        });
    };
}

function get_config() {
    const result = Joi.validate(config, config_schema, { convert: false, presence: 'required' });

    if (result.error) {
        throw new Error(`Invalid configuration: ${result.error.message}`);
    }

    return result.value;
}

async function load_json(file) {
    const buffer = await fs.readFile(file);
    const json = JSON.parse(buffer.toString());

    return json;
}

yargs.command('auth-url', 'Generate authentication URL',
    {
        'credentials-file': {
            type: 'string',
            demandOption: true,
            requiresArg: true
        }
    },
    async_handler(async function (argv) {
        const credentials = await load_json(argv['credentials-file']);
        const client = init_oauth_client(credentials);
        const url = get_oauth_url(client);

        console.log(url);
    })
)
.command('get-token', 'Get authentication token',
    {
        'credentials-file': {
            type: 'string',
            demandOption: true,
            requiresArg: true
        },
        'code': {
            type: 'string',
            demandOption: true,
            requiresArg: true
        }
    },
    async_handler(async function (argv) {
        const credentials = await load_json(argv['credentials-file']);
        const auth_client = init_oauth_client(credentials);
        const token = await Promise.fromCallback(cb => auth_client.getToken(argv.code, cb));

        console.log(JSON.stringify(token, null, 4));
    })
)
.command('update', 'Update calendars',
    {
        'credentials-file': {
            type: 'string',
            demandOption: true,
            requiresArg: true
        },
        'token-file': {
            type: 'string',
            demandOption: true,
            requiresArg: true
        },
        'out-directory': {
            type: 'string',
            demandOption: true,
            requiresArg: true
        }
    },
    async_handler(async function (argv) {
        const credentials = await load_json(argv['credentials-file']);
        const token = await load_json(argv['token-file']);
        const auth_client = init_oauth_client(credentials, token);
        const cfg = get_config();

        await update(auth_client, argv['out-directory'], cfg);
    })
).help().strict().argv;
