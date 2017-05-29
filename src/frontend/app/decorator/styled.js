import styled from 'styled-components';

export default function (strings, ...items) {
    return function (WrappedComponent) {
        return styled(WrappedComponent)(strings, ...items);
    };
}
