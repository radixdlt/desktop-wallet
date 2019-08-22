const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/main/main.ts',
    target: 'electron-main',
    mode: 'production',
    output: {
        filename: 'build-prod/main.js',
        path: __dirname,
    },
    resolve: {
        extensions: [ '.ts', '.js', '.json' ]
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' },
            //{ test: /\.json$/, use: 'json-loader' }
        ]
    },
    plugins: [
        new UglifyJSPlugin(),
    ],
    // devtool: '#source-map',
    externals: {
		'@sentry/electron': 'require("@sentry/electron")'
	},
}
