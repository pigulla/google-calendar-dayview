#!/usr/bin/env node


/* eslint-disable no-process-exit, no-console, no-unused-expressions, newline-per-chained-call */

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

const input_formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"); // eslint-disable-line quotes

// Workaround, see https://github.com/yargs/yargs/issues/510
function sync(fn) {
    return function (...args) {
        (async function () {
            await fn(...args);
        })().catch(function (error) {
            console.error(error);
            process.exit(2);
        });
    };
}

async function load_json(file) {
    const buffer = await fs.readFile(file);
    const json = JSON.parse(buffer.toString());

    return json;
}

yargs.command('auth-url', 'Generate authentication URL', {
    credentials: {
        type: 'string',
        demandOption: true,
        requiresArg: true
    }
}, sync(async function (argv) {
    const credentials = await load_json(argv.credentials);
    const client = init_oauth_client(credentials);
    const url = get_oauth_url(client);

    console.log(url);
})).command('get-token', 'Get authentication token', {
    credentials: {
        type: 'string',
        demandOption: true,
        requiresArg: true
    },
    code: {
        type: 'string',
        demandOption: true,
        requiresArg: true
    }
}, sync(async function (argv) {
    const credentials = await load_json(argv.credentials);
    const auth_client = init_oauth_client(credentials);
    const token = await Promise.fromCallback(cb => auth_client.getToken(argv.code, cb));

    console.log(JSON.stringify(token, null, 4));
})).command('update', 'Update calendars', {
    config: {
        type: 'string',
        description: 'Path to the configurations file',
        demandOption: true,
        requiresArg: true,
        coerce(input) {
            const buffer = fs.readFileSync(input, 'utf-8');
            const config = JSON.parse(buffer);
            const result = Joi.validate(config, config_schema, { convert: false });

            if (result.error) {
                throw new Error(`Invalid configuration: ${result.error.message}`);
            }

            return result.value;
        }
    },
    credentials: {
        type: 'string',
        description: 'Path to the credentials file',
        demandOption: true,
        requiresArg: true,
        normalize: true
    },
    token: {
        type: 'string',
        description: 'Path to the token file',
        demandOption: true,
        requiresArg: true,
        normalize: true
    },
    out: {
        type: 'string',
        description: 'Target directory',
        demandOption: true,
        requiresArg: true,
        normalize: true
    },
    timezone: {
        type: 'string',
        description: 'Time zone to use',
        requiresArg: true,
        defaultDescription: '(system)',
        default() {
            return ZoneId.systemDefault().id();
        }
    },
    now: {
        type: 'string',
        description: 'Override current date and time',
        requiresArg: true,
        defaultDescription: '(now)',
        default() {
            return LocalDateTime.now();
        },
        coerce(input) {
            // eslint-disable-line consistent-return
            if (input instanceof LocalDateTime) {
                return input;
            } else if (input.length === 0) {
                // Apparently requiresArg doesn't trigger for empty options id a default is available
                throw new Error('Missing argument value: now');
            }

            try {
                return LocalDateTime.parse(input, input_formatter);
            } catch (error) {
                if (error instanceof DateTimeParseException) {
                    const example = input_formatter.format(LocalDateTime.now());

                    throw new Error(`Invalid value for option 'now' (expected something like "${example}")`);
                }

                throw error;
            }
        }
    }
}, sync(async function (argv) {
    const time_zone = ZoneId.of(argv.timezone);
    const now = argv.now.atZone(time_zone);
    const credentials = await load_json(argv.credentials);
    const token = await load_json(argv.token);
    const auth_client = init_oauth_client(credentials, token);

    await update(auth_client, argv.out, argv.config, now);
})).help().strict().demandCommand(1, 'You must specify a command').argv;