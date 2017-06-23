import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import FetchError from 'app/FetchError';
import { styled } from 'app/decorator/';

@styled`
    position: absolute;
    bottom: 0;
    height: 3rem;
    right: 0;
    left: 0;
    background-color: rgba(255, 0, 0, 0.9);
    color: white;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
`
class ErrorBanner extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        error: PropTypes.instanceOf(FetchError)
    }

    render() {
        if (!this.props.error) {
            return null;
        }

        return (
            <div className={this.props.className}>
                {this.props.error.message}
            </div>
        );
    }
}

export default ErrorBanner;
