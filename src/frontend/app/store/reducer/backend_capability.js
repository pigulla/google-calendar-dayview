import { handle } from 'redux-pack';
import { Map as ImmutableMap } from 'immutable';

import * as Actions from 'app/store/action/backend_capability';

const INITIAL_STATE = new ImmutableMap({
    backlight_power: false,
    backlight_brightness: false
});

export default function (state = INITIAL_STATE, action = null) {
    switch (action.type) {
        case Actions.QUERY_BACKLIGHT_SUPPORT: {
            return handle(state, action, {
                success(prev_state) {
                    const { brightness, power } = action.payload;
                    return prev_state
                        .set('backlight_power', power)
                        .set('backlight_brightness', brightness);
                },
                failure(prev_state) {
                    console.error(action.type, action.payload); // eslint-disable-line no-console
                    return prev_state
                        .set('backlight_power', false)
                        .set('backlight_brightness', false);
                }
            });
        }

        default:
            return state;
    }
}
