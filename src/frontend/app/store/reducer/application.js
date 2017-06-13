import { ZoneId, ZonedDateTime, Duration, LocalTime } from 'js-joda';
import { Map as ImmutableMap } from 'immutable';

import * as Actions from 'app/store/action/application';

const INITIAL_STATE = new ImmutableMap({
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

export default function (previous_state = INITIAL_STATE, action = null) {
    let new_state = previous_state;

    switch (action.type) {
        case Actions.LAST_ACTIVITY: {
            new_state = new_state.set('last_activity', new_state.get('time'));
            break;
        }

        case Actions.SET_IDLE: {
            new_state = new_state.set('is_idle', true);
            break;
        }

        case Actions.UNSET_IDLE: {
            new_state = new_state.set('is_idle', false);
            break;
        }

        case Actions.SET_TIME: {
            new_state = new_state.set('time', action.payload.atZone(new_state.get('time_zone')));
            break;
        }

        case Actions.SET_TIME_ZONE: {
            new_state = new_state.set('time_zone', action.payload);
            new_state = new_state.set('time', new_state.get('time').withZoneSameInstant(action.payload));
            break;
        }

        case Actions.CONFIGURE_AGENDA: {
            new_state = agenda_config_keys
                .filter(key => action.payload[key] !== undefined)
                .reduce((state, key) => state.setIn(['agenda_config', key], action.payload[key]), new_state);
            break;
        }

        default:
            break;
    }

    return new_state;
}
