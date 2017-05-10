/* eslint-disable no-console */

const config = require('config');
const bunyan = require('bunyan');
const Promise = require('bluebird');

const update = require('./update');
const init_oauth_client = require('./init_oauth_client');

const logger = bunyan.createLogger({
    name: 'roomcalendar',
    level: bunyan.DEBUG
});
const delay = config.get('delay') * 1000;

/* eslint-disable no-constant-condition, no-await-in-loop */
(async function () {
    const credentials = config.get('credentials');
    const token_file = config.get('token_file');

    const oauth_client = await init_oauth_client(credentials, token_file);

    while (true) {
        try {
            await update(oauth_client, config, logger);

            logger.info('Update successful');
        } catch (error) {
            logger.error(error, `Update failed: ${error.message}`);
        }

        logger.debug(`Waiting ${(delay / 1000).toFixed(1)}s`);
        await Promise.delay(delay);
    }
})();
