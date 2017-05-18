import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { ZonedDateTime } from 'js-joda';
import clock_face from 'assets/images/clock-face.svg';

// Based on https://cssanimation.rocks/clocks/
export default class Clock extends PureComponent {
    static propTypes = {
        time: PropTypes.instanceOf(ZonedDateTime)
    }

    render() {
        const now = this.props.time;
        const seconds_in_hour = 60 * now.minute() + now.second();
        const seconds_in_day = (3600 * now.hour() + seconds_in_hour) % 43200;
        const hours_angle = (seconds_in_day / 43200) * 360;
        const minutes_angle = (seconds_in_hour / 3600) * 360;

        return (
            <div className="clock">
                <div className="face" dangerouslySetInnerHTML={{ __html: clock_face }}/>
                <div className="hours">
                    <div style={{ transform: `rotateZ(${hours_angle}deg)` }}/>
                </div>
                <div className="minutes">
                    <div style={{ transform: `rotateZ(${minutes_angle}deg)` }}/>
                </div>
            </div>
        );
    }
}
