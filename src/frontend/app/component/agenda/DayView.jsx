import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { listOf } from 'react-immutable-proptypes';
import { ChronoUnit, Duration, LocalTime, ZonedDateTime } from 'js-joda';
import classnames from 'classnames';
import styled, { withTheme } from 'styled-components';

import Event from 'app/component/agenda/Event';
import NowIndicator from './NowIndicator';
import EventRecord from 'record/Event';
import { hour, rfc3339 } from 'date_formatter';
import throttled_time from 'app/decorator/throttled_time';

function minutes_in_day(time) {
    return (60 * time.hour()) + time.minute();
}

@throttled_time(Duration.ofSeconds(60))
class DayView extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        theme: PropTypes.object.isRequired,
        events: listOf(PropTypes.instanceOf(EventRecord)).isRequired,
        upcoming: PropTypes.instanceOf(EventRecord),
        time: PropTypes.instanceOf(ZonedDateTime).isRequired,
        start_of_agenda: PropTypes.instanceOf(LocalTime).isRequired,
        day_length: PropTypes.instanceOf(Duration).isRequired,
        grid_step: PropTypes.instanceOf(Duration).isRequired
    }

    constructor(props, context) {
        super(props, context);

        this.state = DayView.getStateFromProps(props);
    }

    static getStateFromProps(props, current_state = null) {
        const start = props.time.truncatedTo(ChronoUnit.DAYS)
            .plusHours(props.start_of_agenda.hour())
            .plusMinutes(props.start_of_agenda.minute());
        const end = start.plus(props.day_length);
        const unchanged = current_state && current_state.start.equals(start) && current_state.end.equals(end);

        return unchanged ? {} : {
            start,
            end,
            window: Duration.between(start, end)
        };
    }

    componentWillReceiveProps(next_props) {
        this.setState(current_state => DayView.getStateFromProps(next_props, current_state));
    }

    renderRows() {
        const result = [];
        let cursor = this.state.start;
        let i = 0;

        while (cursor.isBefore(this.state.end)) {
            result.push(this.renderRow(cursor, i++));
            cursor = cursor.plus(this.props.grid_step);
        }

        return result;
    }

    renderRow(time, row) {
        const classes = classnames({ full: time.minute() === 0 });
        const text = hour(time);

        return (
            <time
                dateTime={rfc3339(time)}
                className={classes}
                key={text}
                style={{
                    top: `${this.getPercentForTime(time)}%`
                }}>
                <span>{text}</span>
            </time>
        );
    }

    get isEventUpcomingOrInProgress() {
        const time = this.props.time;
        const soon = time.plusMinutes(5);

        return !!this.props.events
            .find(event => event.in_progress_at(time) || event.in_progress_at(soon));
    }

    getPercentForTime(time) {
        const minutes_since_start_of_agenda = minutes_in_day(time) - minutes_in_day(this.state.start);

        return 100 * (minutes_since_start_of_agenda / this.state.window.toMinutes());
    }

    getPercentForDuration(duration) {
        return 100 * (duration.toMinutes() / this.state.window.toMinutes());
    }

    renderEvent(event, index) {
        return (
            <Event
                key={event.id}
                event={event}
                color={index % 2 ? this.props.theme.primary : this.props.theme.alternate}
                past={event.end.isBefore(this.props.time)}
                active={event.in_progress_at(this.props.time)}
                upcoming={event === this.props.upcoming}
                top_percent={this.getPercentForTime(event.start)}
                height_percent={this.getPercentForDuration(event.duration)}/>
        );
    }

    renderEvents() {
        const start_of_day = this.props.time.truncatedTo(ChronoUnit.DAYS);
        const end_of_day = start_of_day.plusDays(1);

        return this.props.events
            .filter(event => event.start.isBefore(end_of_day) && event.end.isAfter(start_of_day))
            .map(::this.renderEvent)
            .toArray();
    }

    render() {
        const classes = classnames(this.props.className, {
            vacant: !this.isEventUpcomingOrInProgress
        });

        return (
            <main className={classes} style={this.props.style}>
                <NowIndicator
                    color={this.props.theme.now}
                    time={this.props.time}
                    top_percent={this.getPercentForTime(this.props.time)}/>
                {this.renderEvents()}
                <div className="day">
                    {this.renderRows()}
                </div>
            </main>
        );
    }
}

export default styled(withTheme(DayView))`
    time.full {
        border-top-color: ${props => props.theme.grid.alpha(0.3).string()};
    }

    time:not(.full)::after {
        border-top-color: ${props => props.theme.grid.alpha(0.2).string()};
    }
`;
