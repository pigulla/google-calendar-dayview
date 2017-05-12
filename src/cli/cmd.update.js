const fs = require('mz/fs');
const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);
const Joi = require('joi');
const Promise = require('bluebird');

const { commandify, load_json } = require('./util');
const update = require('../update');
const config_schema = require('../config-schema');
const { init_oauth_client } = require('../lib/oauth_client');

const { DateTimeFormatter, LocalDateTime, DateTimeParseException, ZoneId } = joda;
const input_formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"); // eslint-disable-line quotes

module.exports.command = 'update';

module.exports.describe = 'Update calendars';

module.exports.builder = {
    config: {
        type: 'string',
        description: 'Path to the configurations file',
        demandOption: true,
        requiresArg: true,
        coerce(input) {
            // This function can not be asynchronous :-(
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
        coerce(input) { // eslint-disable-line consistent-return
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
};

module.exports.handler = commandify(async function (argv) {
    const time_zone = ZoneId.of(argv.timezone);
    const now = argv.now.atZone(time_zone);
    const [credentials, token] = await Promise.join(load_json(argv.credentials), load_json(argv.token));
    const auth_client = init_oauth_client(credentials, token);

    await update(auth_client, argv.out, argv.config, now);
});
