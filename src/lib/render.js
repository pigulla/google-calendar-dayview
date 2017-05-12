const fs = require('mz/fs');
const path = require('path');

const assert = require('assert-plus');
const dot = require('dot');
const less = require('less');
const Inferno = require('inferno');
const InfernoServer = require('inferno-server');

const DayView = require('../component/DayView');

async function templatize(name) {
    assert.string(name, 'file');

    const file = path.join(__dirname, '..', 'template', name);
    const source = await fs.readFile(file);

    return dot.template(source.toString());
}

async function render_css(options) {
    assert.object(options, 'options');
    assert.finite(options.day_length_hours, 'options.day_length_hours');
    assert.finite(options.grid_step_minutes, 'options.grid_step_minutes');

    const file = path.join(__dirname, '..', 'styles.less');
    const styles = await fs.readFile(file);
    const step_count = ((60 * options.day_length_hours) / options.grid_step_minutes) - 1;
    const result = await less.render(styles.toString(), {
        globalVars: {
            '@scheme-base-color': '#05668D',
            '@scheme-alternate-color': '#00A896',
            '@step-percentage': 100 / step_count
        }
    });

    return result.css;
}

async function render_index(main_calendar_id) {
    assert.string(main_calendar_id, 'main_calendar_id');

    const template = await templatize('index.html');

    return template({
        redirect_to: `${main_calendar_id}.html`
    });
}

async function render_dayview(calendar, prev_url, next_url, time_zone, options, now) {
    assert.object(calendar, 'calendar');
    assert.string(prev_url, 'prev_url');
    assert.string(next_url, 'next_url');
    assert.object(options, 'options');
    assert.object(time_zone, 'time_zone');
    assert.finite(options.start_of_day_hour, 'options.start_of_day_hour');
    assert.finite(options.grid_step_minutes, 'options.grid_step_minutes');
    assert.finite(options.day_length_hours, 'options.day_length_hours');
    assert.finite(options.client_refresh_interval_seconds, 'options.client_refresh_interval_seconds');
    assert.optionalObject(now, 'now');

    const props = {
        now,
        calendar,
        prev_url,
        next_url,
        time_zone,
        start_of_day_hour: options.start_of_day_hour,
        grid_step_minutes: options.grid_step_minutes,
        day_length_hours: options.day_length_hours
    };

    const body = InfernoServer.renderToString(<DayView {...props}/>);
    const template = await templatize('dayview.html');

    return template({
        body,
        refresh_interval: options.client_refresh_interval_seconds
    });
}

module.exports = {
    render_css,
    render_dayview,
    render_index
};
