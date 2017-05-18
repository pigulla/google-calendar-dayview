/* eslint-disable no-process-env */

const webpack_merge = require('webpack-merge');

const env = process.env.NODE_ENV || 'development';

const base = require('./webpack.base');
const override = require(`./webpack.${env}`);

module.exports = webpack_merge(base, override);
