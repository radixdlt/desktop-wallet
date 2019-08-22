module.exports = {
    entry: './src/main/main.ts',
    target: 'electron-main',
    mode: 'development',
    output: {
        filename: 'build/main.js',
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
    devtool: '#source-map',
    externals: {
		'@sentry/electron': 'require("@sentry/electron")'
	},
}
