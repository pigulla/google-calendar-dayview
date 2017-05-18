import application from './application';
import calendars from './calendars';
import users from './users';

const reducers = {
    application,
    calendars,
    users
};

/**
 * @param {Immutable.Map} state
 * @param {Object} action
 * @return {Immutable.Map}
 */
export default function (state, action = null) {
    return Object
        .entries(reducers)
        .reduce(function (new_state, [key, reducer]) {
            return new_state.set(key, reducer(state.get(key), action));
        }, state);
}
