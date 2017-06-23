/* eslint-disable no-process-env */

import { applyMiddleware, compose, createStore } from 'redux';
import thunk_middleware from 'redux-thunk';
import { middleware as redux_pack_middleware } from 'redux-pack';
import { Map as ImmutableMap } from 'immutable';
import { composeWithDevTools } from 'redux-devtools-extension';

import { SET_TIME, LAST_ACTIVITY } from 'app/store/action/application';
import reducer from 'app/store/reducer/';
import {
    activity,
    upcoming_alert,
    upcoming_event,
    fetch_calendars,
    time
} from 'app/store/middleware/';

let enhancer;

if (process.env.NODE_ENV === 'production') {
    enhancer = compose(applyMiddleware(
        thunk_middleware,
        redux_pack_middleware,
        activity(document, 15 * 1000),
        upcoming_event,
        upcoming_alert,
        fetch_calendars(60 * 1000),
        time(1 * 1000)
    ));
} else {
    const composeEnhancers = composeWithDevTools({
        actionsBlacklist: [SET_TIME, LAST_ACTIVITY]
    });

    enhancer = composeEnhancers(applyMiddleware(
        thunk_middleware,
        redux_pack_middleware,
        activity(document, 5 * 1000),
        upcoming_event,
        upcoming_alert,
        fetch_calendars(60 * 1000),
        time(1 * 1000)
    ));
}

const store = createStore(reducer, new ImmutableMap(), enhancer);

export default store;
