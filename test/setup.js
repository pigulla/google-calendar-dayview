const path = require('path');

/* eslint-disable global-require */

global.require_app = function require_app(file) {
    return require(path.join(__dirname, '..', 'src', 'frontend', 'app', file));
};

global.require_backend = function require_backend(file) {
    return require(path.join(__dirname, '..', 'src', 'backend', file));
};

global.require_isomorphic = function require_isomorphic(file) {
    return require(path.join(__dirname, '..', 'src', 'isomorphic', file));
};
