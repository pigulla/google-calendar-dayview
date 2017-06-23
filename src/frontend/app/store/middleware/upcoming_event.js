import { is } from 'immutable';
import { SET_TIME } from 'app/store/action/application';
import {
    set_upcoming,
    unset_upcoming,
    LOAD_SUCCESSFUL,
    SET_PRIMARY
} from 'app/store/action/calendars';

const triggers = new Set([SET_TIME, LOAD_SUCCESSFUL, SET_PRIMARY]);

export default ({ getState, dispatch }) => next => action => {
    const result = next(action);

    if (!triggers.has(action.type)) {
        return result;
    }

    const state = getState();
    const calendar = state.getIn(['calendars', 'primary']);
    const now = state.getIn(['application', 'time']);
    const upcoming_state = state.getIn(['calendars', 'upcoming']);
    const current_upcoming_event = upcoming_state ? upcoming_state.get('event') : null;

    if (!calendar) {
        return result;
    }

    const upcoming_event = calendar.events
        .find(event => event.in_progress_at(now.plusMinutes(3)) && !event.in_progress_at(now), this, null);

    if (!is(current_upcoming_event, upcoming_event)) {
        dispatch(upcoming_event ? set_upcoming(upcoming_event) : unset_upcoming());
    }

    return result;
};
