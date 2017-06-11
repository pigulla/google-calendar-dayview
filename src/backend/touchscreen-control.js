const assert = require('assert-plus');
const fs = require('mz/fs');

const POWER_FILE = '/sys/class/backlight/rpi_backlight/bl_power';
const BRIGHTNESS_FILE = '/sys/class/backlight/rpi_backlight/brightness';

async function assert_file_exists(file) {
    const exists = await fs.exists(file);

    if (!exists) {
        throw new Error(`Backlight control file ${file} not found`);
    }
}

module.exports.enable_backlight = async function enable_backlight(enabled) {
    assert.bool(enabled, 'enabled');

    await assert_file_exists(POWER_FILE);

    return fs.writeFile(POWER_FILE, enabled ? '1' : '0');
};

module.exports.set_brightness = async function set_brightness(value) {
    assert.finite(value, 'value');
    assert.ok(value >= 0 && value <= 255, 'value must be between 0 and 255');

    await assert_file_exists(BRIGHTNESS_FILE);

    return fs.writeFile(BRIGHTNESS_FILE, value|0); // eslint-disable-line no-bitwise, space-infix-ops
};
