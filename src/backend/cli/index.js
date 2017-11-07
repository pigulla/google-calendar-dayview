#!/usr/bin/env node

/* eslint-disable no-unused-expressions */

const yargs = require('yargs');

yargs
    .commandDir('./commands')
    .config('config')
    .help()
    .strict()
    .env('GCD')
    .demandCommand(1, 'You must specify a command')
    .wrap(yargs.terminalWidth())
    .argv;
