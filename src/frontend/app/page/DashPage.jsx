import classnames from 'classnames';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Swipeable from 'react-swipeable';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { ZonedDateTime } from 'js-joda';

import Clock from 'app/component/Clock';
import Calendar from 'record/Calendar';
import { rfc3339, hour } from 'date_formatter';

class DashPage extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        primary: PropTypes.instanceOf(Calendar).isRequired,
        time: PropTypes.instanceOf(ZonedDateTime).isRequired,
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

const StyledDashPage = styled(DashPage)`
    &::after {
        background-image: ${({ primary }) => (primary.background_image ? `url(${primary.background_image})` : 'none')};
    }
`;

export default connect(state => ({
    primary: state.getIn(['calendars', 'primary']),
    time: state.getIn(['application', 'time'])
}))(StyledDashPage);
