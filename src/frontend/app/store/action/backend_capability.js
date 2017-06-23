import JSONs from 'json-strictify';

import fetch_and_parse from 'app/fetch_and_parse';

export const QUERY_BACKLIGHT_SUPPORT = 'BACKEND_CAPABILITY_QUERY_BACKLIGHT_SUPPORT';
export const SET_BRIGHTNESS = 'BACKEND_CAPABILITY_SET_BRIGHTNESS';

export function query_backlight_support() {
    return {
        type: QUERY_BACKLIGHT_SUPPORT,
        promise: fetch_and_parse('/backlight')
    };
}

export function set_brightness(brightness) {
    return {
        type: SET_BRIGHTNESS,
        promise: fetch_and_parse('/backlight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSONs.stringify({ brightness })
        })
    };
}
