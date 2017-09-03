const Promise = require('bluebird');
const fs = require('mz/fs');

const { commandify, load_json } = require('~/cli/util');
const { init_oauth_client } = require('~/lib/oauth_client');

const STDOUT = '-';

module.exports.command = 'get-token';

module.exports.describe = 'Get authentication token';

module.exports.builder = {
    credentials: {
        type: 'string',
        description: 'Path to the credentials file',
        demandOption: true,
        requiresArg: true,
        normalize: true
    },
    outfile: {
        type: 'string',
        description: `Path to the output token file. Use "${STDOUT}" to write to stdout.`,
        default: STDOUT,
        defaultDescription: '(stdout)',
        requiresArg: true,
        normalize: true
    },
    code: {
        type: 'string',
        description: 'The code from the authentication page',
        demandOption: true,
        requiresArg: true
    }
};

module.exports.handler = commandify(async function (argv) {
    const credentials = await load_json(argv.credentials);
    const auth_client = init_oauth_client(credentials);
    const token = await Promise.fromCallback(cb => auth_client.getToken(argv.code, cb));
    const json = JSON.stringify(token, null, 4);

    if (argv.outfile === STDOUT) {
        console.log(json);
    } else {
        await fs.writeFile(argv.outfile, json);
    }
});
