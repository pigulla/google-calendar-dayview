const clipboardy = require('clipboardy');
const { commandify, load_json } = require('~/cli/util');
const { init_oauth_client, get_oauth_url } = require('~/lib/oauth_client');

module.exports.command = 'auth-url';

module.exports.describe = 'Generate authentication URL';

module.exports.builder = {
    credentials: {
        type: 'string',
        description: 'Path to the credentials file',
        demandOption: true,
        requiresArg: true,
        normalize: true
    },
    silent: {
        type: 'boolean',
        description: 'Just output the URL and nothing else',
        default: false
    }
};

module.exports.handler = commandify(async function (argv) {
    const credentials = await load_json(argv.credentials);
    const client = init_oauth_client(credentials);
    const url = get_oauth_url(client);

    if (!argv.silent) {
        await clipboardy.write(url);
        console.log('Please open the following URL in your browser (it was also copied to your clipboard):\n');
    }

    console.log(url);
});
