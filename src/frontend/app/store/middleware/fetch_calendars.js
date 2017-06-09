import { load, LOAD_SUCCESSFUL, LOAD_FAILED } from 'app/store/action/calendars';

const triggers = new Set([LOAD_SUCCESSFUL, LOAD_FAILED]);

export default interval => store => next => action => {
    if (triggers.has(action.type)) {
        setTimeout(() => store.dispatch(load()), interval);
    }

    return next(action);
};
