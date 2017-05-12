const { Record } = require('immutable');

class Calendar extends Record({
    id: null,
    name: null,
    color_scheme: null,
    events: null
}) {}

module.exports = Calendar;