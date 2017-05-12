/* eslint-disable newline-per-chained-call */

const Joi = require('joi');

module.exports = Joi.object({
    calendars: Joi.array().items(Joi.object({
        name: Joi.string().min(1),
        id: Joi.string().email()
    })).min(1).required(),
    options: Joi.object({
        client_refresh_interval_seconds: Joi.number().integer().min(1).default(30),
        start_of_day_hour: Joi.number().positive().multiple(0.5).default(7.5),
        grid_step_minutes: Joi.number().positive().integer().multiple(15).default(30),
        day_length_hours: Joi.number().positive().multiple(0.5).default(10.5)
    }).default()
});