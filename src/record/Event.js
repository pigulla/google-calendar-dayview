const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);
const { Record, List: ImmutableList } = require('immutable');
const Promise = require('bluebird');

const { ZonedDateTime, Duration } = joda;

// https://developers.google.com/google-apps/calendar/v3/reference/events

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
    static async fromJSON(event, user_cache) {
        const start = ZonedDateTime.parse(event.start.dateTime);
        const end = ZonedDateTime.parse(event.end.dateTime);
        const participant_emails = event.attendees
            .filter(attendee => !attendee.resource)
            .filter(attendee => attendee.responseStatus === 'accepted')
            .map(attendee => attendee.email);
        const confirmed = event.attendees
            .filter(attendee => attendee.self && attendee.responseStatus === 'accepted')
            .length > 0;
        const participants = await Promise.map(participant_emails, user_cache);

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
            creator: await user_cache(event.creator.email),
            organizer: await user_cache(event.organizer.email)
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
