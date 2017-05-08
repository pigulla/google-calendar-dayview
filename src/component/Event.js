const Inferno = require('inferno');
const Component = require('inferno-component');
const classnames = require('classnames');

class Event extends Component {
    static render_attendee(attendee, classes = null, field = 'abbreviated_full_name') {
        const classname = classnames(classes);

        return <a className={classname} href={`mailto:${attendee.email}`}>{attendee[field]}</a>;
    }

    render() {
        const { event, className, style } = this.props;
        const classes = classnames('event', className);

        return (
            <div className={classes} style={style}>
                <a href={event.link} className="summary">{event.summary}</a>
                {Event.render_attendee(event.creator, 'creator', 'last_name')}
                <ul className="attendees">
                    {event.participants.map(attendee => <li>{Event.render_attendee(attendee)}</li>).toArray()}
                </ul>
            </div>
        );
    }
}

module.exports = Event;
