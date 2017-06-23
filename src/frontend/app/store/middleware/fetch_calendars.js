import { KEY, LIFECYCLE } from 'redux-pack/src/constants';

import { load, LOAD } from 'app/store/action/calendars';

const lifecycle_triggers = new Set([LIFECYCLE.FAILURE, LIFECYCLE.SUCCESS]);

export default interval => store => next => action => {
    if (action.type === LOAD && lifecycle_triggers.has(action.meta[KEY.LIFECYCLE])) {
        setTimeout(() => store.dispatch(load()), interval);
    }

    return next(action);
};
