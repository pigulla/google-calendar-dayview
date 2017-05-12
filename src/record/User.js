const { Record } = require('immutable');

class User extends Record({
    id: null,
    email: null,
    first_name: null,
    last_name: null
}) {
    static from_json(json) {
        return new User({
            id: json.id,
            email: json.primaryEmail,
            first_name: json.name.givenName,
            last_name: json.name.familyName
        });
    }

    static as_unknown(email) {
        return new User({ email });
    }

    get is_unknown() {
        return this.first_name === null || this.last_name === null;
    }

    get full_name() {
        return this.is_unknown ? this.email : `${this.first_name} ${this.last_name}`;
    }

    get abbreviated_full_name() {
        return this.is_unknown ? this.email : `${this.first_name.substr(0, 1)}. ${this.last_name}`;
    }
}

module.exports = User;
