import { ZoneId, ZonedDateTime, Duration, LocalTime } from 'js-joda';
import { Map as ImmutableMap } from 'immutable';
import { handle } from 'redux-pack';

import * as Actions from 'app/store/action/application';
import { LOAD as LOAD_CALENDARS } from 'app/store/action/calendars';

const INITIAL_STATE = new ImmutableMap({
    touch_capable: false,
    time_zone: ZoneId.systemDefault(),
    last_activity: ZonedDateTime.now(),
    is_idle: false,
    time: ZonedDateTime.now(),
    agenda_config: new ImmutableMap({
        day_length: Duration.ofHours(11),
        grid_step: Duration.ofMinutes(30),
        start_of_agenda: LocalTime.of(8),
        nav_header_height: '10vh'
    })
});

const agenda_config_keys = [...INITIAL_STATE.get('agenda_config').keys()];

export default function (state = INITIAL_STATE, action = null) {
    switch (action.type) {
        case LOAD_CALENDARS: {
            return handle(state, action, {
                success(prev_state) {
                    return state.set('time_zone', ZoneId.of(action.payload.time_zone));
                }
            });
        }

        case Actions.SET_TOUCH_CAPABILITY: {
            return state.set('touch_capable', action.payload);
        }

        case Actions.LAST_ACTIVITY: {
            return state.set('last_activity', state.get('time'));
        }

        case Actions.SET_IDLE: {
            return state.set('is_idle', true);
        }

        case Actions.UNSET_IDLE: {
            return state.set('is_idle', false);
        }

        case Actions.SET_TIME: {
            return state.set('time', action.payload);
        }

        case Actions.CONFIGURE_AGENDA: {
            return agenda_config_keys
                .filter(key => action.payload[key] !== undefined)
                .reduce((s, key) => s.setIn(['agenda_config', key], action.payload[key]), state);
        }

        default:
            return state;
    }
}
