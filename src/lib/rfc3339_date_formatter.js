const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);

const { DateTimeFormatter } = joda;

module.exports = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ"); // eslint-disable-line quotes
