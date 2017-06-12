/* eslint-disable no-console */

const http = require('http');
const path = require('path');

const body_parser = require('body-parser');
const express = require('express');
const Joi = require('joi');
const Promise = require('bluebird');

const backlight_route = require('./route/backlight');

module.exports = function ({ bind_interface, bind_port, directory, datafile }) {
    const app = express();
    const server = http.Server(app); // eslint-disable-line new-cap

    app.use(express.static(directory));
    app.use(body_parser.json());
    app.get('/calendars.json', (request, response) => response.sendFile(datafile));

    backlight_route(app);
    app.get('*', (request, response) => response.sendFile(path.join(directory, 'index.html')));

    return Promise
        .fromCallback(cb => server.listen(bind_port, bind_interface, cb))
        .then(function () {
            const { address, port } = server.address();

            console.log(`Server listening on ${address} at port ${port}`);
            console.log(`File are being served from ${directory}`);
        });
};
