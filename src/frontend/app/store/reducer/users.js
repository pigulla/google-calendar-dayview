import { handle } from 'redux-pack';
import { Map as ImmutableMap } from 'immutable';

import User from 'record/User';
import * as CalendarsActions from 'app/store/action/calendars';
import update_map_differential from './update_map_differential';

const INITIAL_STATE = new ImmutableMap();

export default function (state = INITIAL_STATE, action = null) {
    switch (action.type) {
        case CalendarsActions.LOAD: {
            return handle(state, action, {
                success(prev_state) {
                    const users = action.payload.users;
                    const current_map = prev_state;
                    const next_map = new ImmutableMap(users.map(user => [user.email, User.fromJSON(user)]));

                    return update_map_differential(current_map, next_map, user => user.email);
                }
            });
        }

        default:
            return state;
    }
}
