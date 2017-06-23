/* eslint-disable no-console */

const http = require('http');
const path = require('path');

const assert = require('assert-plus');
const body_parser = require('body-parser');
const express = require('express');
const Promise = require('bluebird');

const backlight_route = require('./route/backlight');
const calendars_route = require('./route/calendars');

module.exports = async function (config) {
    assert.object(config, 'config');
    assert.string(config.bind_interface, 'config.bind_interface');
    assert.finite(config.bind_port, 'config.bind_port');
    assert.string(config.directory, 'config.directory');
    assert.object(config.time_zone, 'config.time_zone');
    assert.object(config.credentials, 'config.credentials');
    assert.object(config.token, 'config.token');
    assert.object(config.calendars, 'config.calendars');
    assert.finite(config.refresh_after, 'config.refresh_after');

    const {
        bind_interface, bind_port, directory, time_zone,
        credentials, token, calendars, refresh_after
    } = config;

    const app = express();
    const server = http.Server(app); // eslint-disable-line new-cap

    app.use(express.static(directory));
    app.use(body_parser.json());

    backlight_route(app);
    await calendars_route(app, { time_zone, credentials, token, calendars, refresh_after });

    app.get('*', (request, response) => response.sendFile(path.join(directory, 'index.html')));

    return Promise
        .fromCallback(cb => server.listen(bind_port, bind_interface, cb))
        .tap(function () {
            const { address, port } = server.address();

            console.log(`Server listening on ${address} at port ${port}`);
            console.log(`Static files are being served from ${directory}`);
        });
};
