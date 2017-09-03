const Joi = require('joi');

const {
    get_support,
    enable_backlight,
    set_brightness
} = require('~/server/lib/raspberry_pi_touchscreen_control');
const {
    NO_CONTENT,
    UNPROCESSABLE_ENTITY,
    NOT_IMPLEMENTED
} = require('http-status-codes');

const SCHEMA = Joi.object({
    brightness: Joi.number().integer().min(0).max(255),
    backlight: Joi.bool()
});

module.exports = function (app) {
    app.get('/backlight', async function (request, response) {
        const support = await get_support();

        response.json(support).end();
    });

    app.post('/backlight', async function (request, response) {
        const result = Joi.validate(request.body, SCHEMA, { convert: false });

        if (result.error) {
            response.status(UNPROCESSABLE_ENTITY).json({
                error: result.error.details[0].message
            }).end();
        } else {
            try {
                if ('brightness' in result.value) {
                    console.log(`Setting backlight brightness to ${result.value}`);
                    await set_brightness(result.value.brightness);
                }
                if ('backlight' in result.value) {
                    console.log(`Turning backlight power ${result.value ? 'ON' : 'OFF'}`);
                    await enable_backlight(result.value.backlight);
                }

                response.status(NO_CONTENT).end();
            } catch (error) {
                response.status(NOT_IMPLEMENTED).json({ error: error.message }).end();
            }
        }
    });
};
