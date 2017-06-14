import { Map as ImmutableMap } from 'immutable';

import User from 'record/User';
import * as CalendarsActions from 'app/store/action/calendars';
import update_map_differential from './update_map_differential';

const INITIAL_STATE = new ImmutableMap();

export default function (state = INITIAL_STATE, action = null) {
    switch (action.type) {
        case CalendarsActions.LOAD_SUCCESSFUL: {
            const current_map = state;
            const next_map = new ImmutableMap(action.payload.users.map(user => [user.email, User.fromJSON(user)]));

            return update_map_differential(current_map, next_map, user => user.email);
        }

        default:
            return state;
    }
}
