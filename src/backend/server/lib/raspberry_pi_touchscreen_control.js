const assert = require('assert-plus');
const fs = require('mz/fs');

const POWER_FILE = '/sys/class/backlight/rpi_backlight/bl_power';
const BRIGHTNESS_FILE = '/sys/class/backlight/rpi_backlight/brightness';

module.exports = {
    async get_support() {
        return {
            power: await fs.exists(POWER_FILE),
            brightness: await fs.exists(BRIGHTNESS_FILE)
        };
    },

    enable_backlight(enabled) {
        assert.bool(enabled, 'enabled');

        return fs.writeFile(POWER_FILE, enabled ? '1' : '0');
    },

    set_brightness(value) {
        assert.finite(value, 'value');
        assert.ok(value >= 0 && value <= 255, 'value must be between 0 and 255');

        return fs.writeFile(BRIGHTNESS_FILE, value|0); // eslint-disable-line no-bitwise, space-infix-ops
    }
};
