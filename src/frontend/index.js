/* eslint-disable no-console */

import 'whatwg-fetch';
import 'assets/styles/main.scss';

import * as joda from 'js-joda';
import document_ready from 'document-ready-promise';
import joda_tz from 'js-joda-timezone';
import padStart from 'string.prototype.padstart';
import Promise from 'bluebird';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import routes from 'app/routes';
import store from 'app/store/';
import { load } from 'app/store/action/calendars';
import { query_backlight_support } from 'app/store/action/backend_capability';

padStart.shim();
joda.use(joda_tz);

(async function () {
    try {
        await Promise.join(
            store.dispatch(load()),
            store.dispatch(query_backlight_support()),
            document_ready()
        );

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
