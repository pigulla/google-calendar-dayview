const fs = require('mz/fs');
const Joi = require('joi');
const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);
const JSONs = require('json-strictify');

const { commandify, load_json } = require('~/cli/util');
const { init_oauth_client } = require('~/cli/lib/oauth_client');
const { calendars: calendars_schema } = require('~/config-schemas');
const load_calendars = require('~/cli/lib/load_calendars');

const { DateTimeFormatter, LocalDate, ZonedDateTime, DateTimeParseException, ZoneId } = joda;
const input_formatter = DateTimeFormatter.ofPattern('yyyy-MM-dd');

module.exports.command = 'update';

module.exports.describe = 'Update calendars';

module.exports.builder = {
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
        description: 'Output file',
        demandOption: true,
        requiresArg: true,
        normalize: true,
        default: 'calendars.json'
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
    'resolve-users': {
        type: 'boolean',
        description: "Resolve users' names (show real name instead of their email address)",
        default: true
    },
    day: {
        type: 'string',
        description: 'The day whose events are to be loaded',
        requiresArg: true,
        defaultDescription: '(today)',
        default() {
            return LocalDate.now();
        },
        coerce(input) { // eslint-disable-line consistent-return
            if (input instanceof LocalDate) {
                return input;
            } else if (input.length === 0) {
                // Apparently requiresArg doesn't trigger for empty options if a default is available
                throw new Error('Missing argument value: day');
            }

            try {
                return LocalDate.parse(input, input_formatter);
            } catch (error) {
                if (error instanceof DateTimeParseException) {
                    const example = input_formatter.format(LocalDate.now());

                    throw new Error(`Invalid value for option 'day' (expected something like "${example}")`);
                }

                throw error;
            }
        }
    },
    calendars: {
        type: 'string',
        description: 'Path to the calendar configuration file',
        demandOption: true,
        requiresArg: true,
        coerce(input) {
            // This function can not be asynchronous :-(
            const buffer = fs.readFileSync(input, 'utf-8');
            const config = JSON.parse(buffer);
            const result = Joi.validate(config, calendars_schema, { convert: false });

            if (result.error) {
                throw new Error(`Invalid calendar configuration: ${result.error.message}`);
            }

            return result.value;
        }
    }
};

module.exports.handler = commandify(async function (argv) {
    const primary_calendar_id = argv.primary_calendar_id || argv.calendars[0].id;

    if (!argv.calendars.map(calendar => calendar.id).includes(primary_calendar_id)) {
        throw new Error(`Primary calender "${primary_calendar_id}" was not found`);
    }

    const credentials = await load_json(argv.credentials);
    const token = await load_json(argv.token);
    const oauth_client = init_oauth_client(credentials, token);

    const { calendars, users } = await load_calendars(oauth_client, argv.calendars, argv.day, argv.timeZone);
    const data = {
        updated: ZonedDateTime.now(),
        calendars,
        users
    };

    await fs.writeFile(argv.out, JSONs.stringify(data, null, 4));
});
