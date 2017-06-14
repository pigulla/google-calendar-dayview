import JSONs from 'json-strictify';

export const QUERY_BACKLIGHT_SUPPORT = 'BACKEND_CAPABILITY_QUERY_BACKLIGHT_SUPPORT';
export const SET_BRIGHTNESS = 'BACKEND_CAPABILITY_SET_BRIGHTNESS';

export function query_backlight_support() {
    return {
        type: QUERY_BACKLIGHT_SUPPORT,
        promise: (async () => {
            const response = await fetch('/backlight');
            return response.json();
        })()
    };
}

export function set_brightness(brightness) {
    return {
        type: SET_BRIGHTNESS,
        promise: (async () => {
            await fetch('/backlight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSONs.stringify({ brightness })
            });
        })()
    };
}
