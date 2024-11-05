const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: {
        api: './netlify/functions/api.js',
    },
    output: {
        path: path.resolve(__dirname, 'functions-build'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    node: '14'
                                }
                            }]
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
    }
};