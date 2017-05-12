const { commandify, load_json } = require('./util');
const { init_oauth_client, get_oauth_url } = require('../lib/oauth_client');

module.exports.command = 'auth-url';

module.exports.describe = 'Generate authentication URL';

module.exports.builder = {
    credentials: {
        type: 'string',
        description: 'Path to the credentials file',
        demandOption: true,
        requiresArg: true,
        normalize: true
    }
};

module.exports.handler = commandify(async function (argv) {
    const credentials = await load_json(argv.credentials);
    const client = init_oauth_client(credentials);
    const url = get_oauth_url(client);

    console.log(url);
});
