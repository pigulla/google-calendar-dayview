const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);
const { Record, List: ImmutableList } = require('immutable');
const Promise = require('bluebird');

const { ZonedDateTime, Duration } = joda;

class Event extends Record({
    id: null,
    confirmed: null,
    participants: null,
    link: null,
    created: null,
    updated: null,
    start: null,
    end: null,
    summary: null,
    creator: null,
    organizer: null
}) {
    static async from_json(event, user_cache) {
        const start = ZonedDateTime.parse(event.start.dateTime);
        const end = ZonedDateTime.parse(event.end.dateTime);
        const participant_emails = event.attendees
            .filter(attendee => !attendee.resource)
            .filter(attendee => attendee.responseStatus === 'accepted')
            .map(attendee => attendee.email);
        const confirmed = event.attendees
            .filter(attendee => attendee.self && attendee.responseStatus === 'accepted')
            .length > 0;

        const [participants, creator, organizer] = await Promise.join(
            Promise.map(participant_emails, email => user_cache(email, event.summary)),
            user_cache(event.creator.email, event.summary),
            user_cache(event.organizer.email, event.summary)
        );

        return new Event({
            id: event.id,
            confirmed,
            participants: new ImmutableList(participants),
            link: event.htmlLink,
            created: ZonedDateTime.parse(event.created),
            updated: ZonedDateTime.parse(event.updated),
            start,
            end,
            summary: event.summary,
            creator,
            organizer
        });
    }

    get duration() {
        return Duration.between(this.start, this.end);
    }

    in_progress_at(time) {
        return this.start.isBefore(time) && this.end.isAfter(time);
    }
}

module.exports = Event;
