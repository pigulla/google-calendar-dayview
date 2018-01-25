/* eslint-disable global-require */

module.exports = function (wallaby) {
    return {
        files: [
            { pattern: 'test/setup.js', instrument: false },
            'src/isomorphic/**/*.js',
            'src/frontend/**/*.js'
        ],

        tests: [
            'test/frontend/**/*.spec.js'
        ],

        compilers: {
            '**/*.js': wallaby.compilers.babel({
                babel: require('babel-core')
            })
        },

        env: {
            type: 'node'
        },

        testFramework: 'mocha',

        setup(wallaby_instance) {
            require('./test/setup');
        }
    };
};
