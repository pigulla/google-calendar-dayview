/* eslint-disable no-process-env */

import { applyMiddleware, compose, createStore } from 'redux';
import thunk_middleware from 'redux-thunk';
import { Map as ImmutableMap } from 'immutable';
import { composeWithDevTools } from 'redux-devtools-extension';

import alarm_middlweare from 'app/store/middleware/alarm';
import reducer from 'app/store/reducer/';

let enhancer;

if (process.env.NODE_ENV === 'production') {
    enhancer = compose(
        applyMiddleware(thunk_middleware, alarm_middlweare)
    );
} else {
    enhancer = composeWithDevTools(
        applyMiddleware(thunk_middleware, alarm_middlweare)
    );
}


const store = createStore(reducer, new ImmutableMap(), enhancer);

export default store;
