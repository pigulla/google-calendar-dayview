import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styled from 'styled-components';
import Color from 'color';

import EventRecord from 'record/Event';
import User from 'app/component/User';

const { hour, rfc3339 } = require('date_formatter');

class Event extends PureComponent {
    static propTypes = {
        color: PropTypes.instanceOf(Color).isRequired,
        className: PropTypes.string,
        event: PropTypes.instanceOf(EventRecord).isRequired,
        past: PropTypes.bool.isRequired,
        upcoming: PropTypes.bool.isRequired,
        active: PropTypes.bool.isRequired,
        top_percent: PropTypes.number.isRequired,
        height_percent: PropTypes.number.isRequired
    }

    render_attendees() {
        return (
            <ul className="attendees">
                {this.props.event.attendees.toArray()
                    .map(email => <User component="li" key={email} email={email}/>)}
            </ul>
        );
    }

    render() {
        const { summary, start, end } = this.props.event;
        const classes = classnames(this.props.className, {
            active: this.props.active,
            past: this.props.past,
            upcoming: this.props.upcoming
        });
        const title = `${summary || '(booked privately)'} (${hour(start)} - ${hour(end)})`;

        return (
            <article className={classes} title={title}>
                <h2>{summary}</h2>
                <User component="a" rel="author" email={this.props.event.creator}/>
                <time style={{ display: 'none' }} dateTime={rfc3339(start)}>
                    {hour(start)}
                </time>
                {this.render_attendees()}
            </article>
        );
    }
}

function border_left_color({ color, past }) {
    return (past ? color.desaturate(0.8).darken(0.2) : color.lighten(0.2)).string();
}

function bg({ color, active, past }) {
    if (active) {
        return `repeating-linear-gradient(
            -45deg,
            ${color.string()},
            ${color.string()} 2vw,
            ${color.lighten(0.1).string()} 2vw,
            ${color.lighten(0.1).string()} 4vw
        )`;
    } else if (past) {
        return `linear-gradient(
            to top,
            ${color.desaturate(0.8).darken(0.1).string()} 0%,
            ${color.desaturate(0.8).darken(0.1).darken(0.3).string()} 100%
        )`;
    } else {
        return `linear-gradient(
            to top,
            ${color.string()} 0%,
            ${color.darken(0.2).string()}
             100%
        )`;
    }
}

export default styled(Event)`
    top: ${props => props.top_percent}%;
    height: ${props => props.height_percent}%;
    border-left-color: ${border_left_color};
    background: ${bg};
`;
