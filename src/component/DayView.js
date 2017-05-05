const Inferno = require('inferno');
const Component = require('inferno-component');
const { ZonedDateTime, ZoneId, DateTimeFormatter, ChronoUnit, Duration } = require('js-joda');

const hour_formatter = DateTimeFormatter.ofPattern('HH:mm');

class Event extends Component {
    render() {
        return (
            <div className="event">{this.props.event.summary}</div>
        );
    }
}

class DayView extends Component {
    render_row(hour) {
        return (
            <li>
                <p className="hour">{hour_formatter.format(hour)}</p>
            </li>
        );
    }

    render_rows(start, step, window) {
        const result = [];
        const end = start.plus(window);
        let cursor = start;

        while (cursor.isBefore(end)) {
            result.push(this.render_row(cursor));
            cursor = cursor.plus(step);
        }

        return result;
    }

    get_offset_percent_by_time(time, offset, window) {
        const minutes_passed = time.minute() + (time.hour() * 60) - offset.toMinutes();
        const minutes_in_window = window.toMinutes();

        return 100 * (minutes_passed / minutes_in_window);
    }

    render_now_indicator(offset, window) {
        const now = ZonedDateTime.now(ZoneId.of('Europe/Berlin'));
        const percent = this.get_offset_percent_by_time(now, offset, window);

        return <div className="now" style={{ top: `${percent.toFixed(2)}%` }}/>;
    }

    render() {
        const offset = Duration.ofHours(8);
        const step = Duration.ofMinutes(30);
        const window = Duration.ofHours(12);
        const start = ZonedDateTime.now(ZoneId.of('Europe/Berlin')).truncatedTo(ChronoUnit.DAYS).plus(offset);

        return (
            <div className="content">
                {this.render_now_indicator(offset, window)}
                <ol>
                    {this.render_rows(start, step, window)}
                </ol>
            </div>
        );
    }
}

module.exports = DayView;
