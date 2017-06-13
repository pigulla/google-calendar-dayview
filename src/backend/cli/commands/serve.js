const path = require('path');

const fs = require('mz/fs');
const Joi = require('joi');
const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);

const { commandify, load_json } = require('~/cli/util');
const { calendars: calendars_schema } = require('~/config-schemas');
const server = require('~/server/');

const dist_dir = path.join(__dirname, '..', '..', '..', 'frontend');
const { ZoneId } = joda;

module.exports.command = 'serve';

module.exports.describe = 'Start server';

module.exports.builder = {
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
        default() {
            return dist_dir;
        },
        coerce(input) {
            return path.isAbsolute(input) ? input : path.join(process.cwd(), input);
        }
    },
    credentials: {
        type: 'string',
        description: 'Path to the credentials file',
        demandOption: true,
        requiresArg: true,
        normalize: true,
        coerce(input) {
            return path.isAbsolute(input) ? input : path.join(process.cwd(), input);
        }
    },
    token: {
        type: 'string',
        description: 'Path to the token file',
        demandOption: true,
        requiresArg: true,
        normalize: true,
        coerce(input) {
            return path.isAbsolute(input) ? input : path.join(process.cwd(), input);
        }
    },
    calendars: {
        type: 'string',
        description: 'Path to the calendar configuration file',
        demandOption: true,
        requiresArg: true,
        coerce(input) {
            // This function can not be asynchronous :-(
            const file = path.isAbsolute(input) ? input : path.join(process.cwd(), input);
            const buffer = fs.readFileSync(file, 'utf-8');
            const config = JSON.parse(buffer);
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
            if (!/^\d+$/.test(input)) {
                throw new Error('Invalid port');
            }

            return parseInt(input, 10);
        }
    },
    'refresh-after': {
        type: 'string',
        description: 'Refresh calendar data after this many seconds.',
        requiresArg: true,
        default: 5 * 60,
        coerce(input) {
            if (!/^\d+$/.test(input)) {
                throw new Error('Invalid refresh value');
            }

            return parseInt(input, 10);
        }
    }
};

module.exports.handler = commandify(async function (argv) {
    const credentials = await load_json(argv.credentials);
    const token = await load_json(argv.token);

    return server({
        bind_interface: argv.interface,
        bind_port: argv.port,
        directory: argv.directory,
        time_zone: argv['time-zone'],
        refresh_after: argv['refresh-after'],
        credentials,
        token,
        calendars: argv.calendars
    });
});
