import assert from 'assert-plus';
import { createAction } from 'redux-actions';
import { Duration, LocalTime, ZoneId, LocalDateTime } from 'js-joda';

export const SET_TIME = 'APPLICATION_SET_TIME';
export const SET_TIME_ZONE = 'APPLICATION_SET_TIME_ZONE';
export const CONFIGURE_AGENDA = 'APPLICATION_CONFIGURE_AGENDA';

const do_set_time = createAction(SET_TIME);
const do_set_time_zone = createAction(SET_TIME_ZONE);
const do_configure_agenda = createAction(CONFIGURE_AGENDA);

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

window.configure_agenda = configure_agenda;
