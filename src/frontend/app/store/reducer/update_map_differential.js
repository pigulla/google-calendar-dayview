import assert from 'assert-plus';
import { is, Map as ImmutableMap } from 'immutable';

export function analyze(current_map, next_map, get_id) {
    const next_ids = next_map.keySeq().toSet();
    const current_ids = current_map.valueSeq().map(get_id).toSet();
    const new_ids = next_ids.subtract(current_ids);
    const obsolete_ids = current_ids.subtract(next_ids);
    const updated_ids = current_ids
        .intersect(next_ids)
        .filter(id => !is(current_map.get(id), next_map.get(id)));

    return { new_ids, obsolete_ids, updated_ids };
}

/**
 * @param {Immutable.Map} current_map The map holding the current state
 * @param {Immutable.Map} next_map The map holding the target state
 * @param {function(string):string=} get_id A function returning the id of an item (i.e., the key used in the map)
 * @returns {Immutable.Map} The updated map with the minimal amount of modifications
 */
export default function update_map_differential(current_map, next_map, get_id = item => item.id) {
    assert(ImmutableMap.isMap(current_map), 'current_map');
    assert(ImmutableMap.isMap(next_map), 'next_map');

    const { new_ids, obsolete_ids, updated_ids } = analyze(current_map, next_map, get_id);

    return current_map.withMutations(function (state) {
        // remove entries that are obsolete
        state.deleteAll(obsolete_ids);

        // add new entries
        new_ids.reduce((map, id) => map.set(id, next_map.get(id)), state);

        // update entries if necessary
        for (const updated_id of updated_ids) {
            state.set(updated_id, next_map.get(updated_id));
        }

        return state;
    });
}
