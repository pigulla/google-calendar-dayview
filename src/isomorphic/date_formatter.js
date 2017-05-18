const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);

const { DateTimeFormatter } = joda;

const hour_formatter = DateTimeFormatter.ofPattern('HH:mm');
const rfc3339_formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ");

module.exports = {
    hour_formatter,
    rfc3339_formatter,

    // convenience functions
    hour: date => hour_formatter.format(date),
    rfc3339: date => rfc3339_formatter.format(date)
};
