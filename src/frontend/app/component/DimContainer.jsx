import classnames from 'classnames';
import React, { PureComponent, Children } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { connected, styled } from 'app/decorator/';
import { set_brightness } from 'app/store/action/application';

// The router is injected to avoid blocked updates.
// See https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md

@withRouter
@connected(state => ({
    is_idle: state.getIn(['application', 'is_idle']),
    brightness_supported: state.getIn(['backend_capability', 'backlight_brightness'])
}))
@styled`
    opacity: ${({ is_idle, brightness_supported }) => ((is_idle && !brightness_supported) ? 0.2 : 1.0)};
    transition: opacity 0.5s;
`
export default class DimContainer extends PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired,
        className: PropTypes.string,
        children: PropTypes.node,
        is_idle: PropTypes.bool.isRequired,
        brightness_supported: PropTypes.bool.isRequired
    }

    componentWillReceiveProps(next_props) {
        if (next_props.brightness_supported && (next_props.is_idle !== this.props.is_idle)) {
            next_props.dispatch(set_brightness(next_props.is_idle ? 20 : 255));
        }
    }

    render() {
        const classes = classnames('dim-container', this.props.className);

        return (
            <div className={classes}>
                {Children.only(this.props.children)}
            </div>
        );
    }
}
