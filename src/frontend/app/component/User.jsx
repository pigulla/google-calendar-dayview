import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import connected from 'app/decorator/connected';
import UserRecord from 'record/User';

@connected((state, props) => ({
    user: state.get('users').get(props.email, null)
}))
class User extends PureComponent {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        user: PropTypes.instanceOf(UserRecord),
        email: PropTypes.string
    }

    static defaultProps = {
        component: 'span',
        user: null,
        email: null
    }

    render() {
        const { component: Component, user, email, dispatch, ...props } = this.props; // eslint-disable-line no-unused-vars

        if (user === null) {
            return null;
        }

        const name = `${user.is_unknown ? user.email : user.full_name}`;
        const suffix = user.is_unknown ? '' : ` (${user.email})`;
        const title = `${name}${suffix}`;
        const content = user.is_unknown ? user.email : user.last_name;

        return <Component title={title} {...props}>{content}</Component>;
    }
}

export default User;
