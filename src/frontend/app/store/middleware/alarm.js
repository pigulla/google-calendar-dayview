import { SET_TIME } from 'app/store/action/application';
import { LOAD_SUCCESSFUL, SET_PRIMARY } from 'app/store/action/calendars';

const triggers = new Set([SET_TIME, LOAD_SUCCESSFUL, SET_PRIMARY]);

export default store => next => action => {
    next(action);

    if (triggers.has(action.type)) {
        const state = store.getState();
        const calendar = state.getIn(['calendars', 'primary']);
        const now = state.getIn(['application', 'time']);

        if (!calendar) {
            return;
        }

        calendar.events
            .filter(event => event.in_progress_at(now.plusMinutes(3)) && !event.in_progress_at(now))
            .toArray()
            .map(event => event.toJSON());
    }
};
