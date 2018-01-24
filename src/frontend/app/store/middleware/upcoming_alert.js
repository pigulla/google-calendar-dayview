import Layer from 'react-layer';
import React from 'react';
import { Provider } from 'react-redux';

import store from 'app/store/';
import AlertOverlay from 'app/component/AlertOverlay';
import {
    set_upcoming_handled,
    SET_UPCOMING,
    UNSET_UPCOMING,
    SET_UPCOMING_HANDLED
} from 'app/store/action/calendars';

export default ({ getState, dispatch }) => {
    const layer = new Layer(
        document.body,
        () => (// eslint-disable-line react/display-name
            <Provider store={store}>
                <AlertOverlay
                    event={getState().getIn(['calendars', 'upcoming', 'event'])}
                    dismiss={() => dispatch(set_upcoming_handled())}/>
            </Provider>
        )
    );

    return next => action => {
        const result = next(action);

        if (action.type === SET_UPCOMING) {
            layer.render();
        } else if (action.type === SET_UPCOMING_HANDLED || action.type === UNSET_UPCOMING) {
            layer.destroy();
        }

        return result;
    };
};
