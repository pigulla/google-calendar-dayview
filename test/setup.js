import path from 'path';

/* eslint-disable global-require */

global.require_app = function (file) {
    return require(path.join(__dirname, '..', 'src', 'frontend', 'app', file));
};

global.require_backend = function (file) {
    return require(path.join(__dirname, '..', 'src', 'backend', file));
};

global.require_isomorphic = function (file) {
    return require(path.join(__dirname, '..', 'src', 'isomorphic', file));
};
