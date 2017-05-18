const { Record, Set: ImmutableSet, List: ImmutableList } = require('immutable');

const Event = require('./Event');
const Theme = require('./Theme');

class Calendar extends Record({
    id: null,
    name: null,
    theme: null,
    events: null,
    background_image: null
}) {
    static fromJSON(json) {
        const events = json.events.map(item => Event.fromJSON(item));

        return new Calendar(Object.assign({}, json, {
            theme: Theme.fromJSON(json.theme),
            events: new ImmutableList(events)
        }));
    }

    toJSON() {
        // Unlike v3, Immutable v4 does not do deep conversion by default so this is future-proofing
        return Object.assign({}, super.toJSON(), {
            theme: this.theme.toJSON()
        });
    }

    get all_users() {
        return this.events.reduce((users, event) => users.concat(event.all_users), new ImmutableSet());
    }
}

module.exports = Calendar;
