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
import { query_backlight_support } from 'app/store/action/application';

joda.use(joda_tz);

(async function () {
    try {
        await store.dispatch(load());
        await store.dispatch(query_backlight_support());
        await document_ready();

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
