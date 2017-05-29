import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Instant, ZonedDateTime } from 'js-joda';

export default function throttled_time(duration) {
    const seconds = duration.seconds();

    function discrete(time) {
        const epoch_seconds = time.toInstant(time.zone()).epochSecond();
        const adjust_seconds = epoch_seconds % seconds;
        const discrete_instant = Instant.ofEpochSecond(epoch_seconds - adjust_seconds, 0);

        return ZonedDateTime.ofInstant(discrete_instant, time.zone());
    }

    return function (WrappedComponent) {
        class ThrottledTime extends PureComponent {
            static propTypes = {
                time: PropTypes.instanceOf(ZonedDateTime).isRequired
            }

            constructor(props, context) {
                super(...arguments);

                this.state = {
                    time: discrete(props.time)
                };
            }

            componentWillReceiveProps(next_props) {
                this.setState(function (prev_state, prev_props) {
                    const time = discrete(next_props.time);
                    return prev_state.time.equals(time) ? {} : { time };
                });
            }

            static get displayName() {
                const display_name = WrappedComponent.displayName || WrappedComponent.name || 'Component';

                return `ThrottledTime(${display_name})`;
            }

            render() {
                const { time, ...props } = this.props; // eslint-disable-line no-unused-vars

                return <WrappedComponent time={this.state.time} {...props}/>;
            }
        }

        return connect((state, props) => ({
            time: state.getIn(['application', 'time'])
        }))(ThrottledTime);
    };
}
