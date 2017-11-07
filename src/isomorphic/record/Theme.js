const { Record } = require('immutable');
const color = require('color');

class Theme extends Record({
    primary: null,
    alternate: null,
    now: null,
    grid: null
}) {
    static fromJSON(json) {
        return new Theme(Object.assign({}, json, {
            primary: color(json.primary),
            alternate: color(json.alternate),
            now: color(json.now),
            grid: color(json.grid)
        }));
    }

    toJSON() {
        return {
            primary: this.primary.rgb().string(),
            alternate: this.alternate.rgb().string(),
            now: this.now.rgb().string(),
            grid: this.grid.rgb().string()
        };
    }
}

module.exports = Theme;
