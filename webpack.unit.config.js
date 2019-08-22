var CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: './test/unit/index.js',
    target: 'electron-renderer',
    mode: 'development',
    output: {
        filename: 'test/out/app.js',
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
                    'sass-loader'
                ]
            },
            {
                test: /\.pug$/,
                loader: 'pug-plain-loader'
            },
            { test: /\.(png|woff|woff2|eot|ttf|otf|svg)$/, loader: 'url-loader?limit=100000&publicPath=../&name=build/[name].[ext]' },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyWebpackPlugin([
            // {output}/file.txt
            { from: './src/app/index.html', to: 'test/out/index.html' }
        ])
    ],
    devtool: '#source-map'
}
