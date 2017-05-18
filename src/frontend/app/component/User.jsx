import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import UserRecord from 'record/User';

class User extends PureComponent {
    static propTypes = {
        dispatch: PropTypes.func.isRequired, // added by connect()
        component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        user: PropTypes.instanceOf(UserRecord),
        email: PropTypes.string
    }

    render() {
        const { component, user, email, dispatch, ...props } = this.props; // eslint-disable-line no-unused-vars

        if (user === null) {
            return null;
        }

        const Tag = component ? component : 'span';
        const name = `${user.is_unknown ? user.email : user.full_name}`;
        const suffix = user.is_unknown ? '' : ` (${user.email})`;
        const title = `${name}${suffix}`;
        const content = user.is_unknown ? user.email : user.last_name;

        return <Tag title={title} {...props}>{content}</Tag>;
    }
}

export default connect((state, props) => ({
    user: state.get('users').get(props.email, null)
}))(User);
