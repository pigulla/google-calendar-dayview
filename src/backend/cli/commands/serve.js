const http = require('http');
const path = require('path');

const express = require('express');

const { commandify } = require('~/cli/util');

module.exports.command = 'serve';

module.exports.describe = 'Start server';

module.exports.builder = {
    interface: {
        type: 'string',
        description: 'The interface to listen on',
        requiresArg: true,
        default: '127.0.0.1'
    },
    datafile: {
        type: 'string',
        description: 'The data file generated via the "update" command. Paths will be relative to the current working directory',
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

module.exports.handler = commandify(async function (argv) {
    const dist_dir = path.join(__dirname, '..', '..', '..', 'frontend');
    const app = express();
    const server = http.Server(app);

    app.use(express.static(dist_dir));
    app.get('/calendars.json', (request, response) => response.sendFile(argv.datafile));
    app.get('*', (request, response) => response.sendFile(path.join(dist_dir, 'index.html')));

    server.listen(argv.port, argv.interface, function () {
        const { address, port } = server.address();

        console.log(`Server listening on ${address} at port ${port}`);
    });
});
