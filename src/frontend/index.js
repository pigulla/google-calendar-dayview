/* eslint-disable no-console */

import 'whatwg-fetch';
import 'assets/styles/main.scss';

import document_ready from 'document-ready-promise';
import React from 'react';
import ReactDOM from 'react-dom';
import joda_tz from 'js-joda-timezone';
import * as joda from 'js-joda';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import routes from 'app/routes';
import store from 'app/store/';

import time_service from 'app/service/time';
import calendar_service from 'app/service/calendars';

joda.use(joda_tz);


import { set_primary } from 'app/store/action/calendars';
import { set_time } from 'app/store/action/application';
import { hour_formatter } from 'date_formatter';

(async function () {
    time_service.start();

    await calendar_service.start();
    await document_ready();

    window.set_primary = function (id) {
        store.dispatch(set_primary(id));
    };
    window.set_time = function (time) {
        const new_time = joda.LocalTime.parse(time, hour_formatter);

        store.dispatch(set_time(new_time));
    };


    ReactDOM.render(
        <Provider store={store}>
            <Router>
                {routes}
            </Router>
        </Provider>,
        document.getElementById('root')
    );
})().catch(function (error) {
    console.error(error);
});

