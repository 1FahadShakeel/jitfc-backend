const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: {
        // api: './netlify/functions/api.js',
        api: './src/functions/api.js',
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
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@models': path.resolve(__dirname, 'src/models'),
            '@controllers': path.resolve(__dirname, 'src/controllers'),
            '@middleware': path.resolve(__dirname, 'src/middleware'),
            '@utils': path.resolve(__dirname, 'src/utils')
        }
    }
};