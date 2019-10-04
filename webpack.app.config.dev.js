var CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
var path = require('path');

module.exports = {
    entry: './src/app/renderer.ts',
    target: 'electron-renderer',
    mode: 'development',
    output: {
        filename: 'build/app.js',
        path: __dirname,
    },
    resolve: {
        extensions: [ '.ts', '.vue', '.js', '.node' ]
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
                            data: '@import "main.scss";',
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
            { test: /\.(png|woff|woff2|eot|ttf|otf|svg)$/, loader: 'url-loader?limit=200000&publicPath=../&name=build/[name].[ext]' },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyWebpackPlugin([
            { from: './src/app/index.html', to: 'build/index.html' },
            { from: './src/update.html', to: 'build/update.html' },
            { from: './src/app/assets/png/icon.png', to: 'build/icon.png' },
            { from: 'entitlements.mac.plist', to: 'build/entitlements.mac.plist' },
        ])
    ],
    devtool: '#source-map',
    externals: {
		'@sentry/electron': 'require("@sentry/electron")'
	},
}
