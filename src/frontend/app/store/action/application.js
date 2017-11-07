import assert from 'assert-plus';
import { createAction } from 'redux-actions';
import { Duration, LocalTime, ZonedDateTime } from 'js-joda';

export const SET_TOUCH_CAPABILITY = 'APPLICATION_SET_TOUCH_CAPABILITY';
export const SET_IDLE = 'APPLICATION_SET_IDLE';
export const UNSET_IDLE = 'APPLICATION_UNSET_IDLE';
export const LAST_ACTIVITY = 'APPLICATION_LAST_ACTIVITY';
export const SET_TIME = 'APPLICATION_SET_TIME';
export const SET_TIME_ZONE = 'APPLICATION_SET_TIME_ZONE';
export const CONFIGURE_AGENDA = 'APPLICATION_CONFIGURE_AGENDA';

const do_set_touch_capability = createAction(SET_TOUCH_CAPABILITY);
const do_set_idle = createAction(SET_IDLE);
const do_unset_idle = createAction(UNSET_IDLE);
const do_last_activity = createAction(LAST_ACTIVITY);
const do_set_time = createAction(SET_TIME);
const do_configure_agenda = createAction(CONFIGURE_AGENDA);

export function set_touch_capability(capable) {
    assert.bool(capable, 'capable');

    return function (dispatch) {
        dispatch(do_set_touch_capability(capable));
    };
}

export function set_idle() {
    return function (dispatch) {
        dispatch(do_set_idle());
    };
}

export function unset_idle() {
    return function (dispatch) {
        dispatch(do_unset_idle());
    };
}

export function last_activity() {
    return function (dispatch) {
        dispatch(do_last_activity());
    };
}

export function set_time(time) {
    assert(time instanceof ZonedDateTime, 'time');

    return function (dispatch) {
        dispatch(do_set_time(time));
    };
}

export function configure_agenda(options) {
    assert.object(options, 'options');
    assert.optionalFinite(options.day_length, 'options.day_length');
    assert.optionalFinite(options.grid_step, 'options.grid_step');
    assert.optionalFinite(options.start_of_agenda, 'options.start_of_agenda');
    assert.optionalString(options.nav_header_height, 'options.nav_header_height');

    return function (dispatch) {
        dispatch(do_configure_agenda(Object.assign({}, options, {
            day_length: options.day_length === undefined ? undefined : Duration.ofHours(options.day_length),
            grid_step: options.grid_step === undefined ? undefined : Duration.ofMinutes(options.grid_step),
            start_of_agenda: options.start_of_agenda === undefined ? undefined : LocalTime.of(options.start_of_agenda)
        })));
    };
}
