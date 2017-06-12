import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import NotFoundPage from 'app/page/NotFoundPage';
import AgendaPage from 'app/page/AgendaPage';
import DashPage from 'app/page/DashPage';
import DimContainer from 'app/component/DimContainer';
import { set_primary } from 'app/store/action/calendars';

const set_primary_and_redirect = connect()(function (props) {
    const name = props.match.params.name;

    props.dispatch(set_primary(name));
    return <Redirect to={`/calendar/${name}`}/>;
});

const redirect_to_primary = connect(state => ({ primary: state.getIn(['calendars', 'primary']) }))(function (props) {
    return <Redirect to={`/calendar/${props.primary.name}`}/>;
});

export default (
    <DimContainer>
        <Switch>
            <Route path="/" component={redirect_to_primary} exact/>
            <Route path="/dash" component={DashPage}/>
            <Route path="/calendar/" component={redirect_to_primary} exact/>
            <Route path="/calendar/:name" component={AgendaPage} exact/>
            <Route path="/calendar/:name/set-primary" component={set_primary_and_redirect}/>
            <Route component={NotFoundPage}/>
        </Switch>
    </DimContainer>
);
