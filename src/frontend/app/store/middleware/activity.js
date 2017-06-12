import assert from 'assert-plus';
import throttle from 'lodash.throttle';
import { Duration } from 'js-joda';

import { set_idle, unset_idle, last_activity, LAST_ACTIVITY, SET_TIME } from 'app/store/action/application';

const triggers = new Set([LAST_ACTIVITY, SET_TIME]);
const idle_after = Duration.ofSeconds(15);

export default (document, wait) => ({ getState, dispatch }) => {
    assert.object(document, 'document');
    assert.finite(wait, 'wait');

    const handler = throttle(() => dispatch(last_activity()), wait, { leading: true, trailing: true });

    document.addEventListener('touchstart', handler);
    document.addEventListener('mousemove', handler);
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);

    return next => action => {
        const result = next(action);

        if (triggers.has(action.type)) {
            const last = getState().getIn(['application', 'last_activity']);
            const time = getState().getIn(['application', 'time']);
            const is_idle = getState().getIn(['application', 'is_idle']);

            const idle_time = Duration.between(last, time);

            if (!is_idle && idle_time.compareTo(idle_after) > 0) {
                dispatch(set_idle());
            } else if (is_idle && idle_time.compareTo(idle_after) < 0) {
                dispatch(unset_idle());
            }
        }

        return result;
    };
};
