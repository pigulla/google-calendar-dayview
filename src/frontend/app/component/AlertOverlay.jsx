import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Duration, ZonedDateTime } from 'js-joda';
import { Howl } from 'howler';

import connected from 'app/decorator/connected';
import User from 'app/component/User';
import Event from 'record/Event';
import { rfc3339 } from 'date_formatter';
import alert_sound from 'file-loader!assets/audio/pager-beep.mp3';

@connected((state, props) => ({
    time: state.getIn(['application', 'time'])
}))
class AlertOverlay extends PureComponent {
    static propTypes = {
        dismiss: PropTypes.func.isRequired,
        className: PropTypes.string,
        event: PropTypes.instanceOf(Event).isRequired,
        time: PropTypes.instanceOf(ZonedDateTime).isRequired
    }

    constructor(props, context) {
        super(...arguments);

        this.sound = new Howl({
            src: [alert_sound]
        });
    }

    componentDidMount() {
        this.sound.play();
    }

    componentWillUnmount() {
        this.sound.stop();
    }

    render() {
        const { time, event, dismiss, className } = this.props;
        const dt = Duration.between(time, event.start);
        const minutes = Math.floor(dt.seconds() / 60);
        const seconds = dt.seconds() - 60 * minutes;

        return (
            <div className={className}>
                <div className="content" onClick={click => dismiss()}>
                    <h2>{event.summary}</h2>
                    <User component="h3" email={event.creator}/>
                    <time dateTime={rfc3339(event.start)}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </time>
                </div>
            </div>
        );
    }
}

export default styled(AlertOverlay)`
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
    
    .content {
        cursor: pointer;
        max-width: 75%;
        max-height: 75%;
        border: 1px solid rgb(62, 72, 125);
        border-radius: 1.5vw;
        color: white;
        padding: 3vw;
        background-color: rgb(45, 52, 90);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        
        h2, h3 {
            text-align: center;
        }
        
        h2 {
            font-size: 5vw;
        }
        
        h3 {
            padding: 2vw 0;
            font-size: 3vw;
        }
    }
`;
