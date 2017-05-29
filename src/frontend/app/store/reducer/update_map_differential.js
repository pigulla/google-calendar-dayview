import assert from 'assert-plus';
import { is, Map as ImmutableMap } from 'immutable';

/**
 * @param {Immutable.Map} current_map The map holding the current state
 * @param {Immutable.Map} next_map The map holding the target state
 * @param {function(string):string=} get_id A function returning the id of an item (i.e., the key used in the map)
 * @returns {Immutable.Map} The updated map with the minimal amount of modifications
 */
export default function update_map_differential(current_map, next_map, get_id = item => item.id) {
    assert(ImmutableMap.isMap(current_map), 'current_map');
    assert(ImmutableMap.isMap(next_map), 'next_map');

    const next_ids = next_map.keySeq().toSet();
    const current_ids = current_map.valueSeq().map(get_id).toSet();
    const new_ids = next_ids.subtract(current_ids);
    const obsolete_ids = current_ids.subtract(next_ids);
    const potentially_updated_ids = current_ids.intersect(next_ids);

    return current_map.withMutations(function (state) {
        // remove entries that are obsolete (Immutable 4 has deleteAll(), but we're using v3)
        obsolete_ids.reduce((map, id) => map.delete(id), state);

        // add new entries
        new_ids.reduce((map, id) => map.set(id, next_map.get(id)), state);

        // update entries if necessary
        return potentially_updated_ids.reduce(function (map, id) {
            const before = map.get(id);
            const after = next_map.get(id);

            return map.set(id, is(after, before) ? before : after);
        }, state);
    });
}
