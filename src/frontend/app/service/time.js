import { LocalDateTime } from 'js-joda';

import Service from './Service';
import store from 'app/store/';
import { set_time } from 'app/store/action/application';

export default new Service({
    interval: 15 * 1000,

    fn() {
        // const now = LocalDateTime.parse('2017-05-17T11:28:20.447');
        const now = LocalDateTime.now();

        store.dispatch(set_time(now));
    }
});
