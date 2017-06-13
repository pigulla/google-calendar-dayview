import assert from 'assert-plus';
import JSONs from 'json-strictify';
import { createAction } from 'redux-actions';

export const QUERY_BACKLIGHT_SUPPORT_START = 'BACKEND_CAPABILITY_QUERY_BACKLIGHT_SUPPORT_START';
export const QUERY_BACKLIGHT_SUPPORT_SUCCESSFUL = 'BACKEND_CAPABILITY_QUERY_BACKLIGHT_SUPPORT_SUCCESSFUL';
export const QUERY_BACKLIGHT_SUPPORT_FAILED = 'BACKEND_CAPABILITY_QUERY_BACKLIGHT_SUPPORT_FAILED';
export const SET_BRIGHTNESS_START = 'BACKEND_CAPABILITY_SET_BRIGHTNESS_START';
export const SET_BRIGHTNESS_SUCCESSFUL = 'BACKEND_CAPABILITY_SET_BRIGHTNESS_SUCCESSFUL';
export const SET_BRIGHTNESS_FAILED = 'BACKEND_CAPABILITY_SET_BRIGHTNESS_FAILED';

const query_backlight_support_start = createAction(QUERY_BACKLIGHT_SUPPORT_START);
const query_backlight_support_successful = createAction(QUERY_BACKLIGHT_SUPPORT_SUCCESSFUL);
const query_backlight_support_failed = createAction(QUERY_BACKLIGHT_SUPPORT_FAILED);
const set_brightness_start = createAction(SET_BRIGHTNESS_START);
const set_brightness_successful = createAction(SET_BRIGHTNESS_SUCCESSFUL);
const set_brightness_failed = createAction(SET_BRIGHTNESS_FAILED);

export function query_backlight_support() {
    return async function (dispatch) {
        dispatch(query_backlight_support_start());

        try {
            const response = await fetch('/backlight');
            const json = await response.json();

            dispatch(query_backlight_support_successful(json));
        } catch (error) {
            dispatch(query_backlight_support_failed(error));
        }
    };
}

export function set_brightness(brightness) {
    assert.finite(brightness, 'brightness');

    return async function (dispatch) {
        dispatch(set_brightness_start());

        try {
            await fetch('/backlight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSONs.stringify({ brightness })
            });

            dispatch(set_brightness_successful());
        } catch (error) {
            dispatch(set_brightness_failed(error));
        }
    };
}
