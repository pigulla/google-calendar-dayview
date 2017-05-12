const Inferno = require('inferno');
const Component = require('inferno-component');
const classnames = require('classnames');

var createVNode = Inferno.createVNode;
class Event extends Component {
    static render_attendee(attendee, classes = null, field = 'abbreviated_full_name') {
        const classname = classnames(classes);

        return createVNode(2, 'a', classname, attendee[field], {
            'href': `mailto:${attendee.email}`
        });
    }

    render() {
        const { event, className, style } = this.props;
        const classes = classnames('event', className);

        return createVNode(2, 'div', classes, [createVNode(2, 'a', 'summary', event.summary, {
            'href': event.link
        }), Event.render_attendee(event.creator, 'creator', 'last_name'), createVNode(2, 'ul', 'attendees', event.participants.map(attendee => createVNode(2, 'li', null, Event.render_attendee(attendee))).toArray())], {
            'style': style
        });
    }
}

module.exports = Event;