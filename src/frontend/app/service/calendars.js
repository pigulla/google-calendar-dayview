import Service from './Service';
import store from 'app/store/';
import { load } from 'app/store/action/calendars';

export default new Service({
    interval: 5 * 1000,

    fn() {
        return store.dispatch(load());
    }
});
