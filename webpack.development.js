const path = require('path');

module.exports = {
    devtool: 'eval-source-map',

    devServer: {
        contentBase: path.join(__dirname, 'data'),
        historyApiFallback: true
    }
};
