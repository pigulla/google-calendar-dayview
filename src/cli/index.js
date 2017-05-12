#!/usr/bin/env node

/* eslint-disable no-unused-expressions */

require('yargs')
    .command(require('./cmd.update'))
    .command(require('./cmd.get-token'))
    .command(require('./cmd.auth-url'))
    .help()
    .strict()
    .demandCommand(1, 'You must specify a command')
    .argv;
