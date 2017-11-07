const joda_tz = require('js-joda-timezone');
const joda = require('js-joda').use(joda_tz);
const { Record, Set: ImmutableSet } = require('immutable');

const { ZonedDateTime, Duration } = joda;

class Event extends Record({
    id: null,
    confirmed: null,
    attendees: null,
    link: null,
    created: null,
    updated: null,
    start: null,
    end: null,
    summary: null,
    creator: null,
    organizer: null,
    is_private: null
}) {
    static parse(event, time_zone) {
        const attendees = (event.attendees || [])
            .filter(attendee => !attendee.resource)
            .filter(attendee => attendee.responseStatus === 'accepted')
            .map(attendee => attendee.email);

        const confirmed = !event.attendees || event.attendees
            .filter(attendee => attendee.self && attendee.responseStatus === 'accepted')
            .length > 0;

        return new Event({
            id: event.id,
            confirmed,
            attendees: new ImmutableSet(attendees),
            link: event.htmlLink || null,
            created: event.created ? ZonedDateTime.parse(event.created).withZoneSameInstant(time_zone) : null,
            updated: ZonedDateTime.parse(event.updated).withZoneSameInstant(time_zone),
            start: ZonedDateTime.parse(event.start.dateTime).withZoneSameInstant(time_zone),
            end: ZonedDateTime.parse(event.end.dateTime).withZoneSameInstant(time_zone),
            summary: event.summary || null,
            creator: event.creator ? event.creator.email : null,
            organizer: event.organizer ? event.organizer.email : null,
            is_private: event.visibility === 'private'
        });
    }

    toJSON() {
        // Unlike v3, Immutable v4 does not do deep conversion by default so this is future-proofing

        return Object.assign({}, super.toJSON(), {
            attendees: this.attendees.toArray(),
            created: this.created ? this.created.toString() : null,
            updated: this.updated.toString(),
            start: this.start.toString(),
            end: this.end.toString()
        });
    }


    static fromJSON(json) {
        return new Event(Object.assign({}, json, {
            attendees: new ImmutableSet(json.attendees),
            created: json.created ? ZonedDateTime.parse(json.created) : null,
            updated: ZonedDateTime.parse(json.updated),
            start: ZonedDateTime.parse(json.start),
            end: ZonedDateTime.parse(json.end),
            creator: json.creator,
            organizer: json.organizer
        }));
    }

    equals(other) {
        return this === other || (
            other instanceof Event &&
            this.id === other.id &&
            this.confirmed === other.confirmed &&
            this.attendees.equals(other.attendees) &&
            this.link === other.link &&
            (this.created === other.created || this.created.equals(other.created)) &&
            this.updated.equals(other.updated) &&
            this.start.equals(other.start) &&
            this.end.equals(other.end) &&
            this.summary === other.summary &&
            this.creator === other.creator &&
            this.organizer === other.organizer &&
            this.is_private === other.is_private
        );
    }

    get duration() {
        return Duration.between(this.start, this.end);
    }

    get all_users() {
        let users = this.attendees;

        if (this.creator) {
            users = users.add(this.creator);
        }
        if (this.organizer) {
            users = users.add(this.organizer);
        }

        return users;
    }

    in_progress_at(time) {
        return this.start.isBefore(time) && this.end.isAfter(time);
    }
}

module.exports = Event;
