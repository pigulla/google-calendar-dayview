#!/usr/bin/env node

// /* eslint-disable no-process-exit, no-console, no-unused-expressions, newline-per-chained-call */

const config = require('config');
const fs = require('mz/fs');
const Promise = require('bluebird');
const yargs = require('yargs');
const Joi = require('joi');
const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);

const config_schema = require('./config-schema');
const { init_oauth_client, get_oauth_url } = require('./lib/oauth_client');
const update = require('./update');

const { DateTimeFormatter, LocalDateTime, DateTimeParseException, ZoneId } = joda;
const time_zone = ZoneId.of(config.get('options.time_zone'));

const input_formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"); // eslint-disable-line quotes

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
            description: 'Path to the credentials file',
            demandOption: true,
            requiresArg: true,
            normalize: true
        },
        'token-file': {
            type: 'string',
            description: 'Path to the token file',
            demandOption: true,
            requiresArg: true,
            normalize: true
        },
        'out-directory': {
            type: 'string',
            description: 'Target directory',
            demandOption: true,
            requiresArg: true,
            normalize: true
        },
        'now': {
            type: 'string',
            description: 'Override current date and time',
            requiresArg: true,
            defaultDescription: '(now)',
            default() {
                const now = LocalDateTime.now().atZone(time_zone);

                return input_formatter.format(now);
            },
            coerce(input) { // eslint-disable-line consistent-return
                // Apparently requiresArg doesn't trigger for empty options id a default is available
                if (input.length === 0) {
                    throw new Error('Missing argument value: now');
                }

                try {
                    const now = LocalDateTime.parse(input, input_formatter).atZone(time_zone);

                    return input_formatter.format(now);
                } catch (error) {
                    if (error instanceof DateTimeParseException) {
                        const example = input_formatter.format(LocalDateTime.now());

                        throw new Error(`Invalid value for option 'now' (expected something like "${example}")`);
                    }

                    throw error;
                }
            }
        }
    },
    async_handler(async function (argv) {
        const now = LocalDateTime.parse(argv.now, input_formatter).atZone(time_zone);
        const credentials = await load_json(argv['credentials-file']);
        const token = await load_json(argv['token-file']);
        const auth_client = init_oauth_client(credentials, token);
        const cfg = get_config();

        await update(auth_client, argv['out-directory'], cfg, now);
    })
).help().strict().demandCommand(1, 'You must specify a command').argv;
