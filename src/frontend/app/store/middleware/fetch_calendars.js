import { load } from 'app/store/action/calendars';

export default interval => store => {
    setInterval(() => store.dispatch(load()), interval);

    return next => action => next(action);
};
