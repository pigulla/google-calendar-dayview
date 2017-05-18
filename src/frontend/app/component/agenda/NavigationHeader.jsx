import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Calendar from 'record/Calendar';

export default class NavigationHeader extends PureComponent {
    static propTypes = {
        height: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        next_calendar: PropTypes.instanceOf(Calendar),
        prev_calendar: PropTypes.instanceOf(Calendar)
    }

    render() {
        const { title, height, next_calendar, prev_calendar } = this.props;

        return (
            <nav style={{ height, fontSize: height }}>
                {prev_calendar && <Link rel="prev" to={`/calendar/${prev_calendar.name}`}>&#9664;</Link>}
                <Link className="self" to="/dash">{title}</Link>
                {next_calendar && <Link rel="next" to={`/calendar/${next_calendar.name}`}>&#9654;</Link>}
            </nav>
        );
    }
}
