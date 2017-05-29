import { connect } from 'react-redux';

export default function connected(...args) {
    return function (WrappedComponent) {
        return connect(...args)(WrappedComponent);
    };
}
