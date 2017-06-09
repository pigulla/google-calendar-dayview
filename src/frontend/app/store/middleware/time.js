import { LocalDateTime } from 'js-joda';

import { set_time } from 'app/store/action/application';

export default interval => store => {
    setInterval(() => store.dispatch(set_time(LocalDateTime.now().plusMinutes(88))), interval);

    return next => action => next(action);
};
