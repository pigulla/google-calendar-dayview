/* eslint-disable no-process-env */

import { applyMiddleware, compose, createStore } from 'redux';
import thunk_middleware from 'redux-thunk';
import { Map as ImmutableMap } from 'immutable';
import { composeWithDevTools } from 'redux-devtools-extension';

import { upcoming_alert, upcoming_event, fetch_calendars, time } from 'app/store/middleware/';
import reducer from 'app/store/reducer/';

let enhancer;

if (process.env.NODE_ENV === 'production') {
    enhancer = compose(applyMiddleware(
        upcoming_event,
        upcoming_alert,
        fetch_calendars(60 * 1000),
        time(5 * 1000),
        thunk_middleware
    ));
} else {
    enhancer = composeWithDevTools(applyMiddleware(
        upcoming_event,
        upcoming_alert,
        fetch_calendars(60 * 1000),
        time(1 * 1000),
        thunk_middleware
    ));
}

const store = createStore(reducer, new ImmutableMap(), enhancer);

export default store;
