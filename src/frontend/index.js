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
import { load } from 'app/store/action/calendars';
import { hour_formatter } from 'date_formatter';
import { query_backlight_support, set_time } from 'app/store/action/application';

joda.use(joda_tz);

(async function () {
    try {
        await store.dispatch(load());
        await store.dispatch(query_backlight_support());
        await document_ready();

        window.set_time = function (time) {
            const new_time = joda.LocalTime.parse(time, hour_formatter).atDate(joda.LocalDate.now());

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
    } catch (error) {
        console.error(error);
    }
})();
