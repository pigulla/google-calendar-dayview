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
        time: PropTypes.instanceOf(ZonedDateTime).isRequired,
        top_percent: PropTypes.number.isRequired
    }

    render() {
        const classes = classnames(this.props.className, 'now');
        const style = {
            top: `${this.props.top_percent}%`
        };

        return (
            <time
                className={classes}
                style={style}
                dateTime={rfc3339(this.props.time)}/>
        );
    }
}

export default styled(NowIndicator)`
    background-color: ${props => props.color.string()};
    
    &::before {
        border-color: transparent transparent transparent #f0f3bd;
    }
    
    &::after {
        border-color: transparent #f0f3bd transparent transparent;
    }
`;
