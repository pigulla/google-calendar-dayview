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
        .find(event => event.in_progress_at(now.plusMinutes(40)) && !event.in_progress_at(now), this, null);

    // Technically, this check isn't needed but it keeps "action spam" down and there really is no point dispatching
    // an action that we know won't do anything anyway.
    if (upcoming !== previous) {
        if (upcoming) {
            dispatch(set_upcoming(upcoming));
        } else {
            dispatch(unset_upcoming());
        }
    }

    return result;
};
