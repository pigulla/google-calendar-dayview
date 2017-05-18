import assert from 'assert-plus';
import { createAction } from 'redux-actions';

export const SET_PRIMARY = 'CALENDARS_SET_PRIMARY';
export const LOAD_START = 'CALENDARS_LOAD_START';
export const LOAD_SUCCESSFUL = 'CALENDARS_LOAD_SUCCESSFUL';
export const LOAD_FAILED = 'CALENDARS_LOAD_FAILED';

const do_set_primary = createAction(SET_PRIMARY);
const load_start = createAction(LOAD_START);
const load_successful = createAction(LOAD_SUCCESSFUL);
const load_failed = createAction(LOAD_FAILED);

export function set_primary(calendar_id) {
    assert.string(calendar_id, 'calendar_id');

    return function (dispatch) {
        dispatch(do_set_primary(calendar_id));
    };
}

export function load() {
    return async function (dispatch) {
        dispatch(load_start());

        try {
            const response = await fetch('/calendars.json');
            const json = await response.json();

            dispatch(load_successful(json));
        } catch (error) {
            dispatch(load_failed(error));
        }
    };
}
