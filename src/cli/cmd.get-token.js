const { commandify, load_json } = require('./util');
const { init_oauth_client } = require('../lib/oauth_client');

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

    console.log(JSON.stringify(token, null, 4));
});
