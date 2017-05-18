import React, { Children } from 'react';
import with_side_effect from 'react-side-effect';

function handle_state_change_on_client(font_size) {
    document.documentElement.style.fontSize = font_size;
}

function reduce_props_to_state(props_list) {
    const [last] = props_list.slice(-1);

    return last ? last.font_size : null;
}

const RootFontSizeSideEffect = with_side_effect(
    reduce_props_to_state,
    handle_state_change_on_client
)(function RootFontSize(props) {
    return props.children ? Children.only(props.children) : null;
});

export default function rootFontSize(get_font_size) {
    return function (BaseComponent) {
        return function RootFontSizeWrapper(props) {
            const font_size = get_font_size(props);

            return <RootFontSizeSideEffect font_size={font_size}><BaseComponent {...props}/></RootFontSizeSideEffect>;
        };
    };
}
