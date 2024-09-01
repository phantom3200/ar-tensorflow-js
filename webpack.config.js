const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devServer: {
        static: {
            directory: path.join(__dirname, '/'),
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            base:
                process.env.NODE_ENV === 'development'
                    ? '/'
                    : `${process.env.PROD_BASE_URL}`,
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/gifs'),
                    to: path.resolve(__dirname, 'dist/gifs'),
                },
                {
                    from: path.resolve(__dirname, 'src/icons'),
                    to: path.resolve(__dirname, 'dist/icons'),
                },
                {
                    from: path.resolve(__dirname, 'src/img'),
                    to: path.resolve(__dirname, 'dist/img'),
                },
                {
                    from: path.resolve(__dirname, 'src/model'),
                    to: path.resolve(__dirname, 'dist/model'),
                },
            ],
        }),
        new Dotenv(),
    ],
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
