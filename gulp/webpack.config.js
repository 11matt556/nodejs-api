const path = require('path');
const webpack = require("webpack");

 module.exports = {
     entry: './src/tictactoe.js',
     output: {
         path: path.resolve(__dirname, 'dist'),
         filename: 'tictactoe.js'
     },
     module: {
         loaders: [{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader'
         }]
     },
     plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true,
            },
            output: {
                comments: false,
            },
        }),
    ]
 };