import { Map as ImmutableMap } from 'immutable';

import User from 'record/User';
import * as CalendarsActions from 'app/store/action/calendars';
import update_map_differential from './update_map_differential';

const INITIAL_STATE = new ImmutableMap();

export default function (state = INITIAL_STATE, action = null) {
    let new_state = state;

    switch (action.type) {
        case CalendarsActions.LOAD_SUCCESSFUL: {
            const current_map = new_state;
            const next_map = new ImmutableMap(action.payload.users.map(user => [user.email, User.fromJSON(user)]));

            new_state = update_map_differential(current_map, next_map, user => user.email);
            break;
        }

        default:
            break;
    }

    return new_state;
}
