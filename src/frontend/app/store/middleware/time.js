import { ZonedDateTime } from 'js-joda';

import { set_time } from 'app/store/action/application';

export default interval => store => {
    setInterval(function () {
        const zone = store.getState().getIn(['application', 'time_zone']);
        const time = ZonedDateTime.now().withZoneSameInstant(zone);
        store.dispatch(set_time(time));
    }, interval);

    return next => action => next(action);
};
