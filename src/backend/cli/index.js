#!/usr/bin/env node

/* eslint-disable no-unused-expressions */

const yargs = require('yargs');

yargs
    .commandDir('./commands')
    .env('DAYVIEW')
    .config('config')
    .help()
    .strict()
    .demandCommand(1, 'You must specify a command')
    .wrap(yargs.terminalWidth())
    .argv;
