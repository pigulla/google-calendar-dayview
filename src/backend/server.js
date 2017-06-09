'use strict';

const http = require('http');
const path = require('path');

const assert = require('assert-plus');
const express = require('express');

assert.string(process.env.CALENDARS_FILE, 'process.env.CALENDARS_FILE');
assert.string(process.env.PORT, 'process.env.PORT');
assert.string(process.env.INTERFACE, 'process.env.INTERFACE');

const dist_dir = path.join(__dirname, '..', 'frontend');
const app = express();
const server = http.Server(app);

app.use(express.static(dist_dir));
app.get('/calendars.json', (request, response) => response.sendFile(process.env.CALENDARS_FILE));
app.get('*', (request, response) => response.sendFile(path.join(dist_dir, 'index.html')));

server.listen(process.env.PORT, process.env.INTERFACE, function () {
    const { address, port } = server.address();
    console.log(`Server listening on ${address} at port ${port}`);
});
