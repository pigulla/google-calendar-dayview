import assert from 'assert-plus';
import throttle from 'lodash.throttle';
import { Duration } from 'js-joda';

import {
    set_touch_capability,
    set_idle,
    unset_idle,
    last_activity,
    LAST_ACTIVITY,
    SET_TIME
} from 'app/store/action/application';

const triggers = new Set([LAST_ACTIVITY, SET_TIME]);
const idle_after = Duration.ofSeconds(60);

export default (document, wait) => ({ getState, dispatch }) => {
    assert.object(document, 'document');
    assert.finite(wait, 'wait');

    const on_activity = throttle(() => dispatch(last_activity()), wait, { leading: true, trailing: true });

    document.addEventListener('touchstart', on_touch_start);
    document.addEventListener('touchstart', on_activity);
    document.addEventListener('mousemove', on_activity);
    document.addEventListener('click', on_activity);
    document.addEventListener('keydown', on_activity);

    function on_touch_start() {
        dispatch(set_touch_capability(true));
        document.removeEventListener('touchstart', on_touch_start);
    }

    return next => action => {
        const result = next(action);

        if (triggers.has(action.type)) {
            const upcoming_state = getState().getIn(['calendars', 'upcoming']);
            const upcoming_event = upcoming_state ? upcoming_state.get('event') : null;
            const last = getState().getIn(['application', 'last_activity']);
            const time = getState().getIn(['application', 'time']);
            const is_idle = getState().getIn(['application', 'is_idle']);

            const idle_time = Duration.between(last, time);

            if (!is_idle && idle_time.compareTo(idle_after) > 0 && !upcoming_event) {
                dispatch(set_idle());
            } else if (is_idle && (idle_time.compareTo(idle_after) < 0 || upcoming_event)) {
                dispatch(unset_idle());
            }
        }

        return result;
    };
};
