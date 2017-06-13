import assert from 'assert-plus';
import JSONs from 'json-strictify';
import { createAction } from 'redux-actions';
import { Duration, LocalTime, ZoneId, LocalDateTime } from 'js-joda';

export const SET_IDLE = 'APPLICATION_SET_IDLE';
export const UNSET_IDLE = 'APPLICATION_UNSET_IDLE';
export const LAST_ACTIVITY = 'APPLICATION_LAST_ACTIVITY';
export const SET_TIME = 'APPLICATION_SET_TIME';
export const SET_TIME_ZONE = 'APPLICATION_SET_TIME_ZONE';
export const CONFIGURE_AGENDA = 'APPLICATION_CONFIGURE_AGENDA';
export const QUERY_BACKLIGHT_SUPPORT_START = 'APPLICATION_QUERY_BACKLIGHT_SUPPORT_START';
export const QUERY_BACKLIGHT_SUPPORT_SUCCESSFUL = 'APPLICATION_QUERY_BACKLIGHT_SUPPORT_SUCCESSFUL';
export const QUERY_BACKLIGHT_SUPPORT_FAILED = 'APPLICATION_QUERY_BACKLIGHT_SUPPORT_FAILED';
export const SET_BRIGHTNESS_START = 'APPLICATION_SET_BRIGHTNESS_START';
export const SET_BRIGHTNESS_SUCCESSFUL = 'APPLICATION_SET_BRIGHTNESS_SUCCESSFUL';
export const SET_BRIGHTNESS_FAILED = 'APPLICATION_SET_BRIGHTNESS_FAILED';

const do_set_idle = createAction(SET_IDLE);
const do_unset_idle = createAction(UNSET_IDLE);
const do_last_activity = createAction(LAST_ACTIVITY);
const do_set_time = createAction(SET_TIME);
const do_set_time_zone = createAction(SET_TIME_ZONE);
const do_configure_agenda = createAction(CONFIGURE_AGENDA);
const query_backlight_support_start = createAction(QUERY_BACKLIGHT_SUPPORT_START);
const query_backlight_support_successful = createAction(QUERY_BACKLIGHT_SUPPORT_SUCCESSFUL);
const query_backlight_support_failed = createAction(QUERY_BACKLIGHT_SUPPORT_FAILED);
const set_brightness_start = createAction(SET_BRIGHTNESS_START);
const set_brightness_successful = createAction(SET_BRIGHTNESS_SUCCESSFUL);
const set_brightness_failed = createAction(SET_BRIGHTNESS_FAILED);

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
    assert(time instanceof LocalDateTime, 'time');

    return function (dispatch) {
        dispatch(do_set_time(time));
    };
}

export function set_time_zone(time_zone) {
    assert(time_zone instanceof ZoneId, 'time_zone');

    return function (dispatch) {
        dispatch(do_set_time_zone(time_zone));
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

export function query_backlight_support() {
    return async function (dispatch) {
        dispatch(query_backlight_support_start());

        try {
            const response = await fetch('/backlight');
            const json = await response.json();

            dispatch(query_backlight_support_successful(json));
        } catch (error) {
            dispatch(query_backlight_support_failed(error));
        }
    };
}

export function set_brightness(brightness) {
    assert.finite(brightness, 'brightness');

    return async function (dispatch) {
        dispatch(set_brightness_start());

        try {
            await fetch('/backlight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSONs.stringify({ brightness })
            });

            dispatch(set_brightness_successful());
        } catch (error) {
            dispatch(set_brightness_failed(error));
        }
    };
}
