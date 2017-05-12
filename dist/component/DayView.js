const classnames = require('classnames');
const Inferno = require('inferno');
const Component = require('inferno-component');
const { DateTimeFormatter, ChronoUnit, Duration } = require('js-joda');

const Event = require('./Event');
const rfc3339_formatter = require('../lib/rfc3339_date_formatter');

const hour_formatter = DateTimeFormatter.ofPattern('HH:mm');

function minutes_in_day(time) {
    return 60 * time.hour() + time.minute();
}

var createVNode = Inferno.createVNode;
class DayView extends Component {
    constructor(props, context) {
        super(props, context);

        const offset = Duration.ofHours(props.start_of_day_hour);
        const start = props.now.truncatedTo(ChronoUnit.DAYS).plus(offset);
        const end = start.plusHours(props.day_length_hours);
        const window = Duration.between(start, end);
        const grid_step = Duration.ofMinutes(props.grid_step_minutes);
        const steps = 60 * props.day_length_hours / props.grid_step_minutes;

        this.state = {
            steps,
            start,
            end,
            window,
            grid_step
        };
    }

    static render_row(hour) {
        const classes = classnames({ full: hour.minute() === 0 });

        return createVNode(2, 'li', classes, createVNode(2, 'time', 'hour', hour_formatter.format(hour), {
            'dateTime': rfc3339_formatter.format(hour)
        }));
    }

    is_event_upcoming_or_in_progress() {
        const now = this.props.now;
        const soon = now.plusMinutes(5);

        return this.props.calendar.events.filter(function (event) {
            return event.in_progress_at(now) || event.in_progress_at(soon);
        }).size > 0;
    }

    render_rows() {
        const result = [];
        let cursor = this.state.start;

        while (cursor.isBefore(this.state.end)) {
            result.push(DayView.render_row(cursor));
            cursor = cursor.plus(this.state.grid_step);
        }

        return result;
    }

    /**
     * Returns the percent value of the given point in time (the date part is ignored) relative to the current window.
     *
     * @param {joda.DateTime} time
     * @returns {number}
     */
    get_percent_for_time(time) {
        const minutes_since_start_of_day = minutes_in_day(time) - minutes_in_day(this.state.start);

        return 100 * (minutes_since_start_of_day / this.state.window.toMinutes());
    }

    get_percent_for_duration(duration) {
        return 100 * (duration.toMinutes() / this.state.window.toMinutes());
    }

    render_now_indicator() {
        const percent = this.get_percent_for_time(this.props.now);
        const styles = {
            top: `${percent.toFixed(1)}%`
        };

        return createVNode(2, 'div', 'now', null, {
            'style': styles
        });
    }

    render_event(event) {
        const classes = classnames({
            past: event.end.isBefore(this.props.now),
            active: event.in_progress_at(this.props.now)
        });
        const styles = {
            top: `${this.get_percent_for_time(event.start).toFixed(1)}%`,
            height: `${this.get_percent_for_duration(event.duration).toFixed(1)}%`
        };

        return createVNode(16, Event, null, null, {
            'event': event,
            'className': classes,
            'style': styles
        });
    }

    render_events() {
        return this.props.calendar.events.map(this.render_event, this).toArray();
    }

    render() {
        const classes = classnames('content', { dimmed: !this.is_event_upcoming_or_in_progress() });

        return createVNode(2, 'div', classes, [createVNode(2, 'div', 'nav', [createVNode(2, 'a', 'prev', '\u25C0', {
            'href': this.props.prev_url
        }), createVNode(2, 'div', 'self', this.props.calendar.name), createVNode(2, 'a', 'next', '\u25B6', {
            'href': this.props.next_url
        })]), this.render_now_indicator(), this.render_events(), createVNode(2, 'ol', 'dayview', this.render_rows())]);
    }
}

module.exports = DayView;