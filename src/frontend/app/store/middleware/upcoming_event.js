import I, { is } from 'immutable';
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
    const previous = state.getIn(['calendars', 'upcoming', 'event'], null);

    if (!calendar) {
        return result;
    }

    const upcoming = calendar.events
        .find(event => event.in_progress_at(now.plusMinutes(3)) && !event.in_progress_at(now), this, null);

    if (!is(previous, upcoming)) {
        dispatch(upcoming ? set_upcoming(upcoming) : unset_upcoming());
    }

    return result;
};
