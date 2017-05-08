/* eslint-disable no-console */

const config = require('config');
const bunyan = require('bunyan');
const Promise = require('bluebird');

const update = require('./update');

const logger = bunyan.createLogger({
    name: 'roomcalendar',
    level: bunyan.DEBUG
});
const delay = config.get('delay') * 1000;

/* eslint-disable no-constant-condition, no-await-in-loop */
(async function () {
    while (true) {
        try {
            await update(config, logger);

            logger.info('Update successful');
        } catch (error) {
            logger.error(`Update failed: ${error.message}`);
        }

        logger.debug(`Waiting ${(delay / 1000).toFixed(1)}s`);
        await Promise.delay(delay);
    }
})();
