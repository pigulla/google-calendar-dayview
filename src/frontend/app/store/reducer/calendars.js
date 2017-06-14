import assert from 'assert-plus';
import { handle } from 'redux-pack';
import { OrderedMap, Map as ImmutableMap } from 'immutable';
import { ZonedDateTime } from 'js-joda';

import Calendar from 'record/Calendar';
import * as Actions from 'app/store/action/calendars';
import update_map_differential from './update_map_differential';

const INITIAL_STATE = new ImmutableMap({
    updated: null,
    primary: null,
    upcoming: null,
    all: new OrderedMap()
});

function update_primary_from_localstorage(state) {
    const stored_name = localStorage.getItem('primary');

    if (state.get('all').has(stored_name)) {
        const new_primary = state.getIn(['all', stored_name]);

        return state.set('primary', new_primary);
    } else {
        const default_primary = state.get('all').first();

        localStorage.removeItem('primary');
        return state.set('primary', default_primary);
    }
}

export default function (state = INITIAL_STATE, action = null) {
    switch (action.type) {
        case Actions.SET_PRIMARY: {
            const name = action.payload;
            const primary = state.get('all').find(calendar => calendar.name === name);

            assert(primary instanceof Calendar, 'primary');

            localStorage.setItem('primary', primary.id);
            return state.set('primary', primary);
        }

        case Actions.UNSET_UPCOMING: {
            return state.set('upcoming', null);
        }

        case Actions.SET_UPCOMING: {
            assert.object(action.payload, 'action.payload');

            return state.set('upcoming', new ImmutableMap({
                event: action.payload,
                handled: false
            }));
        }

        case Actions.SET_UPCOMING_HANDLED: {
            assert.object(state.get('upcoming'), 'state.upcoming');

            return state.setIn(['upcoming', 'handled'], true);
        }

        case Actions.LOAD: {
            return handle(state, action, {
                success(prev_state) {
                    let new_state = prev_state;
                    const current_map = prev_state.get('all');
                    const next_map = new ImmutableMap(action.payload.calendars.map(v => [v.id, Calendar.fromJSON(v)]));

                    new_state = new_state.set('updated', ZonedDateTime.parse(action.payload.updated));
                    new_state = new_state.set('all', update_map_differential(current_map, next_map));

                    if (!new_state.get('all').includes(new_state.get('primary'))) {
                        new_state = update_primary_from_localstorage(new_state);
                    }

                    return new_state;
                },
                failure(prev_state) {
                    console.error(action.type, action.payload); // eslint-disable-line no-console
                }
            });
        }

        default:
            return state;
    }
}
