import assert from 'assert-plus';
import { createAction } from 'redux-actions';

export const UNSET_UPCOMING = 'CALENDARS_UNSET_UPCOMING';
export const SET_UPCOMING = 'CALENDARS_SET_UPCOMING';
export const SET_UPCOMING_HANDLED = 'CALENDARS_SET_UPCOMING_HANDLED';
export const SET_PRIMARY = 'CALENDARS_SET_PRIMARY';
export const LOAD = 'CALENDARS_LOAD';

const do_unset_upcoming = createAction(UNSET_UPCOMING);
const do_set_upcoming = createAction(SET_UPCOMING);
const do_set_upcoming_handled = createAction(SET_UPCOMING_HANDLED);
const do_set_primary = createAction(SET_PRIMARY);

export function unset_upcoming() {
    return function (dispatch) {
        dispatch(do_unset_upcoming());
    };
}

export function set_upcoming(event) {
    assert.object(event, 'event');

    return function (dispatch) {
        dispatch(do_set_upcoming(event));
    };
}

export function set_upcoming_handled() {
    return function (dispatch) {
        dispatch(do_set_upcoming_handled());
    };
}

export function set_primary(name) {
    assert.string(name, 'name');

    return function (dispatch) {
        dispatch(do_set_primary(name));
    };
}

export function load() {
    return {
        type: LOAD,
        promise: (async () => {
            const response = await fetch('/calendars.json');
            return response.json();
        })()
    };
}
