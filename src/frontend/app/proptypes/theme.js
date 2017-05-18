import Color from 'color';
import PropTypes from 'prop-types';
import { contains } from 'react-immutable-proptypes';

export default contains({
    priamry: PropTypes.instanceOf(Color).isRequired,
    alternate: PropTypes.instanceOf(Color).isRequired,
    now: PropTypes.instanceOf(Color).isRequired
}).isRequired;
