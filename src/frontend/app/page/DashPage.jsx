import classnames from 'classnames';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Swipeable from 'react-swipeable';
import { Link } from 'react-router-dom';
import { Duration, ZonedDateTime } from 'js-joda';

import Calendar from 'record/Calendar';
import Clock from 'app/component/Clock';
import connected from 'app/decorator/connected';
import styled from 'app/decorator/styled';
import { rfc3339, hour } from 'date_formatter';
import throttled_time from 'app/decorator/throttled_time';

@connected(state => ({
    primary: state.getIn(['calendars', 'primary'])
}))
@throttled_time(Duration.ofSeconds(15))
@styled`
    &::after {
        background-image: ${({ primary }) => (primary.background_image ? `url(${primary.background_image})` : 'none')};
    }
`
class DashPage extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        time: PropTypes.instanceOf(ZonedDateTime).isRequired,
        primary: PropTypes.instanceOf(Calendar).isRequired,
        history: PropTypes.object.isRequired
    }

    swipedUp(event, dy, isFlick) {
        this.props.history.push(`/calendar/${this.props.primary.name}`);
    }

    render() {
        const { className, time, primary } = this.props;
        const classes = classnames(className, 'dash-page');

        return (
            <DocumentTitle title={primary.name}>
                <Swipeable className={classes} onSwipedUp={::this.swipedUp}>
                    <nav>
                        <Link to={`/calendar/${primary.name}`} className="blank">&#9776;</Link>
                    </nav>
                    <main>
                        <Clock time={time}/>
                    </main>
                    <footer>
                        <p>{primary.name}</p>
                        <time dateTime={rfc3339(time)}>
                            {hour(time)}
                        </time>
                    </footer>
                </Swipeable>
            </DocumentTitle>
        );
    }
}

export default DashPage;
