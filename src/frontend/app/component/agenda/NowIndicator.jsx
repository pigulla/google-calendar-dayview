import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import classnames from 'classnames';
import Color from 'color';

import { ZonedDateTime } from 'js-joda';
import { rfc3339 } from 'date_formatter';

class NowIndicator extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        color: PropTypes.instanceOf(Color).isRequired,
        now: PropTypes.instanceOf(ZonedDateTime).isRequired,
        top_percent: PropTypes.number.isRequired
    }

    render() {
        const classes = classnames(this.props.className, 'now');

        return <time className={classes} dateTime={rfc3339(this.props.now)}/>;
    }
}

export default styled(NowIndicator)`
    top: ${props => props.top_percent}%;
    background-color: ${props => props.color.string()};
    
    &::before {
        border-color: transparent transparent transparent #f0f3bd;
    }
    
    &::after {
        border-color: transparent #f0f3bd transparent transparent;
    }
`;
