import classnames from 'classnames';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Swipeable from 'react-swipeable';
import { Duration, LocalTime } from 'js-joda';
import { orderedMapOf, contains } from 'react-immutable-proptypes';
import { Redirect } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import connected from 'app/decorator/connected';
import DayView from 'app/component/agenda/DayView';
import FetchError from 'app/FetchError';
import NavigationHeader from 'app/component/agenda/NavigationHeader';
import root_font_size from 'app/decorator/root_font_size';
import { Calendar, Theme, Event } from 'record/';
import ErrorBanner from 'app/component/ErrorBanner';

function calculate_row_height(props) {
    const row_count = props.config.get('day_length').toMinutes() / props.config.get('grid_step').toMinutes();

    return `calc((100vh - ${props.config.get('nav_header_height')}) / ${row_count - 1})`;
}

function map_state_to_props(state, props) {
    const calendars = state.getIn(['calendars', 'all']);
    const selected = calendars.find(calendar => calendar.name === props.match.params.name);

    const list = calendars.toList();
    const index = calendars.valueSeq().indexOf(selected);
    const next = list.get((index + 1) % list.count());
    const prev = list.get((index - 1 + list.count()) % list.count());
    const upcoming = state.getIn(['calendars', 'upcoming']);

    return {
        calendars,
        selected,
        error: state.getIn(['calendars', 'last_error']),
        theme: selected ? selected.theme : null,
        next: next === selected ? null : next,
        prev: prev === selected ? null : prev,
        upcoming: upcoming ? upcoming.get('event') : null,
        primary: state.getIn(['calendars', 'primary']),
        config: state.getIn(['application', 'agenda_config'])
    };
}

@connected(map_state_to_props)
@root_font_size(calculate_row_height)
class AgendaPage extends PureComponent {
    static propTypes = {
        error: PropTypes.instanceOf(FetchError),
        calendars: orderedMapOf(PropTypes.instanceOf(Calendar), PropTypes.string).isRequired,
        theme: PropTypes.instanceOf(Theme),
        upcoming: PropTypes.instanceOf(Event),
        primary: PropTypes.instanceOf(Calendar).isRequired,
        selected: PropTypes.instanceOf(Calendar),
        next: PropTypes.instanceOf(Calendar),
        prev: PropTypes.instanceOf(Calendar),
        match: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        config: contains({
            grid_step: PropTypes.instanceOf(Duration).isRequired,
            day_length: PropTypes.instanceOf(Duration).isRequired,
            start_of_agenda: PropTypes.instanceOf(LocalTime).isRequired,
            nav_header_height: PropTypes.string.isRequired
        }).isRequired
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            theme: props.theme ? props.theme.toObject() : null
        };
    }

    componentWillReceiveProps(next_props) {
        // The ThemeProvider only accepts POJOs. To avoid unnecessary re-renderings, do not do this conversion on the
        // fly in the render method but only do it once when it changes.
        this.setState({
            theme: next_props.theme ? next_props.theme.toObject() : null
        });
    }

    swipedLeft(event, dx, isFlick) {
        if (this.props.next) {
            this.props.history.push(`/calendar/${this.props.next.name}`);
        }
    }

    swipedRight(event, dx, isFlick) {
        if (this.props.prev) {
            this.props.history.push(`/calendar/${this.props.prev.name}`);
        }
    }

    swipedDown(event, dy, isFlick) {
        this.props.history.push('/dash');
    }

    render() {
        if (!this.props.selected) {
            return <Redirect to="/"/>;
        }

        const classes = classnames('agenda-page', { primary: this.props.selected === this.props.primary });

        return (
            <DocumentTitle title={this.props.selected.name}>
                <ThemeProvider theme={this.state.theme}>
                    <Swipeable
                        className={classes}
                        onSwipedDown={::this.swipedDown}
                        onSwipedLeft={::this.swipedLeft}
                        onSwipedRight={::this.swipedRight}>

                        <ErrorBanner error={this.props.error}/>

                        <NavigationHeader
                            height={this.props.config.get('nav_header_height')}
                            title={this.props.match.params.name}
                            next_calendar={this.props.next}
                            prev_calendar={this.props.prev}/>

                        <DayView
                            style={{ top: this.props.config.get('nav_header_height') }}
                            upcoming={this.props.upcoming}
                            events={this.props.selected.events}
                            start_of_agenda={this.props.config.get('start_of_agenda')}
                            day_length={this.props.config.get('day_length')}
                            grid_step={this.props.config.get('grid_step')}/>
                    </Swipeable>
                </ThemeProvider>
            </DocumentTitle>
        );
    }
}

export default AgendaPage;
