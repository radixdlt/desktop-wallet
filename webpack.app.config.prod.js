var CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var path = require('path');

module.exports = {
    entry: './src/app/renderer.ts',
    target: 'electron-renderer',
    mode: 'production',
    output: {
        filename: 'build-prod/app.js',
        path: __dirname,
    },
    resolve: {
        extensions: [ '.ts', '.vue', '.js', '.node' ],
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@app': path.resolve(__dirname, './src/app'),
            '@assets': path.resolve(__dirname, './src/app/assets')
        },
    },
    module: {
        rules: [
            { test: /\.vue$/, use: { loader: 'vue-loader', options: { esModule: true }} },
            { test: /\.ts$/, use: { loader: 'ts-loader', options: { appendTsSuffixTo: [ /\.vue$/ ] } } } ,
            { test: /\.node$/, use: 'node-loader' },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            { test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    { 
                        loader: 'sass-loader',
                        options: {
                            data: '@import "main";',
                            includePaths: [
                                path.resolve(__dirname, "./src/app/assets/sass")
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.pug$/,
                loader: 'pug-plain-loader'
            },
            { test: /\.(png|woff|woff2|eot|ttf|otf|svg)$/, loader: 'url-loader?limit=200000&publicPath=../&name=build-prod/[name].[ext]' },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new UglifyJSPlugin(),
        new CopyWebpackPlugin([
            { from: './src/app/index.html', to: 'build-prod/index.html' },
            { from: './src/update.html', to: 'build-prod/update.html' },
            { from: './src/app/assets/png/icon.png', to: 'build-prod/icon.png' },
            { from: 'entitlements.mac.plist', to: 'build/entitlements.mac.plist' },
        ])
    ],
    // devtool: '#source-map',
    externals: {
		'@sentry/electron': 'require("@sentry/electron")'
	},
}
