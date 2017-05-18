const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'src', 'frontend'),
    entry: './index.js',

    output: {
        path: path.resolve('dist', 'frontend'),
        filename: 'bundle.js',
        publicPath: '/'
    },

    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
            'node_modules',
            path.resolve(__dirname, 'src', 'frontend'),
            path.resolve(__dirname, 'src', 'isomorphic')
        ]
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('style.css'),
        new HtmlWebpackPlugin({
            title: 'google-calendar-dayview',
            template: 'assets/index.html',
            filename: 'index.html',
            inject: 'body'
        })
    ]
};