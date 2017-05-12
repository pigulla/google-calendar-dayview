/* eslint-disable no-console, no-process-exit */

const fs = require('mz/fs');

// Workaround, see https://github.com/yargs/yargs/issues/510
function commandify(fn) {
    return function (...args) {
        (async function () {
            await fn(...args);
        })().catch(function (error) {
            console.error(error);
            process.exit(2);
        });
    };
}


async function load_json(file) {
    const buffer = await fs.readFile(file, 'utf-8');
    const json = JSON.parse(buffer);

    return json;
}

module.exports = {
    commandify,
    load_json
};
