const path = require('path');

const fs = require('mz/fs');
const Joi = require('joi');
const yargs = require('yargs');
const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);

const { commandify, load_json } = require('~/cli/util');
const { calendars: calendars_schema } = require('~/config-schemas');
const server = require('~/server/');

const dist_dir = path.join(__dirname, '..', '..', '..', 'frontend');
const { ZoneId } = joda;

function absolutize(input) {
    return path.isAbsolute(input) ? input : path.join(process.cwd(), input);
}

function parse_json(argument_name) {
    return function (input) {
        try {
            const result = JSON.parse(input);
            return result;
        } catch (error) {
            throw new Error(`Error parsing JSON for argument "${argument_name}": ${error.message}`);
        }
    };
}

function to_int(input, message) {
    if (!/^\d+$/.test(input)) {
        throw new Error(message);
    }

    return parseInt(input, 10);
}

module.exports.command = 'serve';

module.exports.describe = 'Start server';

module.exports.builder = function () {
    return yargs.options({
        interface: {
            type: 'string',
            description: 'The interface to listen on',
            requiresArg: true,
            default: '127.0.0.1'
        },
        directory: {
            type: 'string',
            description:
            'The directory from which the static files will be served. ' +
            'Path will be relative to the current working directory.',
            requiresArg: true,
            normalize: true,
            default: dist_dir,
            coerce: absolutize
        },
        credentials: {
            type: 'string',
            description: 'Path to the credentials file',
            requiresArg: true,
            normalize: true,
            coerce: absolutize,
            conflicts: ['credentials-json']
        },
        'credentials-json': {
            type: 'string',
            description: 'The credentials file as a JSON-parsable string',
            requiresArg: true,
            coerce: parse_json('credentials-json')
        },
        token: {
            type: 'string',
            description: 'Path to the token file',
            requiresArg: true,
            normalize: true,
            coerce: absolutize,
            conflicts: ['token-json']
        },
        'token-json': {
            type: 'string',
            description: 'The token file as JSON-parsable string',
            requiresArg: true,
            coerce: parse_json('token-json')
        },
        calendars: {
            type: 'string',
            description: 'Path to the calendar configuration file',
            requiresArg: true,
            conflicts: ['calendars-json'],
            coerce(input) {
                // This function can not be asynchronous :-(
                const file = absolutize(input);
                let buffer;

                try {
                    buffer = fs.readFileSync(file, 'utf-8');
                } catch (error) {
                    throw new Error(`Error loading calendar file "${file}": ${error.message}`);
                }

                const config = JSON.parse(buffer);
                const result = Joi.validate(config, calendars_schema, {convert: false});

                if (result.error) {
                    throw new Error(`Invalid calendar configuration: ${result.error.message}`);
                }

                return result.value;
            }
        },
        'calendars-json': {
            type: 'string',
            description: 'The calendars file as JSON-parsable string',
            requiresArg: true,
            coerce(input) {
                const config = parse_json('calendars-json')(input);
                const result = Joi.validate(config, calendars_schema, { convert: false });

                if (result.error) {
                    throw new Error(`Invalid calendar configuration: ${result.error.message}`);
                }

                return result.value;
            }
        },
        'time-zone': {
            type: 'string',
            description: 'Time zone to use',
            requiresArg: true,
            defaultDescription: '(system)',
            default() {
                return ZoneId.systemDefault().id();
            },
            coerce(input) {
                return input instanceof ZoneId ? input : ZoneId.of(input);
            }
        },
        port: {
            type: 'string',
            description: 'The port to listen on',
            requiresArg: true,
            default: 8080,
            coerce(input) {
                return to_int(input, 'Invalid value for option "port"');
            }
        },
        'refresh-after': {
            type: 'string',
            description: 'Refresh calendar data after this many seconds.',
            requiresArg: true,
            default: 5 * 60,
            coerce(input) {
                return to_int(input, 'Invalid value for option "refresh-after"');
            }
        }
    }).check(function (argv, options) {
        if (argv.credentials === undefined && argv.credentialsJson === undefined) {
            throw new Error('Either "credentials" or "credentials-json" can be specified');
        } else if (argv.calendars === undefined && argv.calendarsJson === undefined) {
            throw new Error('Either "calendars" or "calendars-json" can be specified');
        } else if (argv.token === undefined && argv.tokenJson === undefined) {
            throw new Error('Either "token" or "token-json" can be specified');
        }

        return true;
    });
};

module.exports.handler = commandify(async function (argv) {
    const credentials = argv.credentialsJson || await load_json(argv.credentials);
    const token = argv.tokenJson || await load_json(argv.token);

    return server({
        bind_interface: argv.interface,
        bind_port: argv.port,
        directory: argv.directory,
        time_zone: argv.timeZone,
        refresh_after: argv.refreshAfter,
        credentials,
        token,
        calendars: argv.calendarsJson || argv.calendars
    });
});
