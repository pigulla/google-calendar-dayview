import { Map as ImmutableMap } from 'immutable';

import * as Actions from 'app/store/action/backend_capability';

const INITIAL_STATE = new ImmutableMap({
    backlight_power: false,
    backlight_brightness: false
});

export default function (previous_state = INITIAL_STATE, action = null) {
    let new_state = previous_state;

    switch (action.type) {
        case Actions.QUERY_BACKLIGHT_SUPPORT_SUCCESSFUL: {
            const { brightness, power } = action.payload;
            new_state = new_state.set('backlight_power', power);
            new_state = new_state.set('backlight_brightness', brightness);
            break;
        }

        case Actions.QUERY_BACKLIGHT_SUPPORT_FAILED: {
            new_state = new_state.set('backlight_power', false);
            new_state = new_state.set('backlight_brightness', false);
            break;
        }

        default:
            break;
    }

    return new_state;
}
