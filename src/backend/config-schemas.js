const Joi = require('joi');
const joda_timezone = require('js-joda-timezone');
const joda = require('js-joda').use(joda_timezone);

const hex_color_regex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(\d+\.)?\d+\s*\)$/;

module.exports.calendars = Joi.array().items(Joi.object({
    name: Joi.string().min(1).regex(/^[^\\.\\\\/]+$/),
    id: Joi.string().email(),
    background_image: Joi.string().min(1).allow(null).default(null),
    theme: Joi.object({
        primary: Joi.string().regex(hex_color_regex).default('rgba(5, 102, 141, 1)'),
        alternate: Joi.string().regex(hex_color_regex).default('rgba(0, 168, 150, 1)'),
        now: Joi.string().regex(hex_color_regex).default('rgba(240, 243, 189, 1)'),
        grid: Joi.string().regex(hex_color_regex).default('rgba(255, 255, 255, 1)')
    }).default()
})).unique('name').unique('id').min(1).required();

module.exports.client = Joi.object({
    day_length: Joi.number().integer().min(1).max(24).default(10),
    grid_step: Joi.number().integer().min(14).max(45).multiple(15).default(30),
    start_of_agenda: Joi.number().integer().min(0).max(23).default(8),
    nav_header_height: Joi.string().default('10vh'),
    time_zone: Joi.string().only(joda.ZoneRulesProvider.getAvailableZoneIds()).default(joda.ZoneId.systemDefault())
});
