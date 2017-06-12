const path = require('path');

const { commandify } = require('~/cli/util');
const server = require('~/server/');

const dist_dir = path.join(__dirname, '..', '..', '..', 'frontend');

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
    datafile: {
        type: 'string',
        description:
            'The data file generated via the "update" command. ' +
            'Path will be relative to the current working directory.',
        demandOption: true,
        requiresArg: true,
        normalize: true,
        coerce(input) {
            return path.isAbsolute(input) ? input : path.join(process.cwd(), input);
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
    }
};

module.exports.handler = commandify(argv => server({
    bind_interface: argv.interface,
    bind_port: argv.port,
    directory: argv.directory,
    datafile: argv.datafile
}));
