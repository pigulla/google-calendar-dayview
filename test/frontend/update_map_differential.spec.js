import assert from 'assert-plus';
import omit from 'lodash.omit';
import should from 'should/as-function';
import Immutable, { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';

const { analyze, default: update_map_differential } = require_app('store/reducer/update_map_differential');
const User = require_isomorphic('record/User');

function fixture() {
    return {
        a: {
            id: 'a',
            email: 'peter.pan@invalid',
            first_name: 'Peter',
            last_name: 'Pan'
        },
        b: {
            id: 'b',
            email: 'hans.wurst@invalid',
            first_name: 'Hans',
            last_name: 'Wurst'
        },
        c: {
            id: 'c',
            email: 'john.wayne@invalid',
            first_name: 'John',
            last_name: 'Wayne'
        },
        d: {
            id: 'd',
            email: 'bruce.wayne@invalid',
            first_name: 'Bruce',
            last_name: 'Wayne'
        }
    };
}

function user(id, properties = {}) {
    const props = Object.assign({}, {
        email: `${id}@invalid`,
        first_name: `First_${id}`,
        last_name: `Last_${id}`
    }, properties);

    return {
        [id]: {
            id,
            ...props
        }
    };
}

describe('update_map_differential', function () {
    let before;

    function from_users(users) {
        const map = Object.keys(users).map(id => [id, User.fromJSON(users[id])]);
        return new ImmutableMap(map);
    }

    beforeEach(function () {
        before = from_users(fixture());
    });

    it('does not update if values are identical', function () {
        const update = from_users(Object.assign(fixture(), user('a', {
            email: 'peter.pan@invalid',
            first_name: 'Peter',
            last_name: 'Pan'
        })));
        const after = update_map_differential(before, update);

        should(after).equal(before);
    });

    it('does update if values are different', function () {
        const update = from_users(Object.assign(fixture(), {
            a: {
                id: 'a',
                email: 'peter.pan@invalid',
                first_name: 'Peter',
                last_name: 'Griffin'
            }
        }));
        const after = update_map_differential(before, update);

        should(after).not.equal(before);
    });

    it('deletes obsolete values', function () {
        const update = before.deleteAll(['b', 'c']);
        const after = update_map_differential(before, update);

        should([...after.keys()]).deepEqual(['a', 'd']);
        should(after.get('a')).equal(before.get('a'));
        should(after.get('d')).equal(before.get('d'));
    });

    it('updates new values', function () {
        const update = before.set('b', Object.assign(fixture().b, {
            last_name: 'Meiser'
        }));
        const after = update_map_differential(before, update);

        should([...after.keys()]).deepEqual(['a', 'b', 'c', 'd']);
        should(after.get('a')).equal(before.get('a'));
        should(after.get('b')).not.equal(before.get('b'));
        should(after.get('c')).equal(before.get('c'));
        should(after.get('d')).equal(before.get('d'));
    });
});

describe('analyze', function () {
    let before;

    beforeEach(function () {
        before = Immutable.fromJS(fixture());
    });

    function should_set_equal(set, values) {
        assert.arrayOfString(values, 'values');

        should(set).be.instanceof(ImmutableSet);
        should(set.toJSON().sort()).deepEqual(values.sort());
    }

    it('finds new ids', function () {
        const update = Immutable.fromJS(Object.assign(fixture(), user('e')));
        const { new_ids, obsolete_ids, updated_ids } = analyze(before, update, o => o.get('id'));

        should_set_equal(new_ids, ['e']);
        should_set_equal(obsolete_ids, []);
        should_set_equal(updated_ids, []);
    });

    it('finds obsolete ids', function () {
        const update = Immutable.fromJS(omit(fixture(), ['b', 'c']));
        const { new_ids, obsolete_ids, updated_ids } = analyze(before, update, o => o.get('id'));

        should_set_equal(new_ids, []);
        should_set_equal(obsolete_ids, ['b', 'c']);
        should_set_equal(updated_ids, []);
    });

    it('finds updated ids', function () {
        const update = Immutable.fromJS(Object.assign(fixture(), user('d', { last_name: 'Lee' })));
        const { new_ids, obsolete_ids, updated_ids } = analyze(before, update, o => o.get('id'));

        should_set_equal(new_ids, []);
        should_set_equal(obsolete_ids, []);
        should_set_equal(updated_ids, ['d']);
    });

    it('finds new, obsolete and updated ids', function () {
        const update = Immutable.fromJS(omit(Object.assign(fixture(), user('e'), user('a')), ['b']));
        const { new_ids, obsolete_ids, updated_ids } = analyze(before, update, o => o.get('id'));

        should_set_equal(new_ids, ['e']);
        should_set_equal(obsolete_ids, ['b']);
        should_set_equal(updated_ids, ['a']);
    });
});
