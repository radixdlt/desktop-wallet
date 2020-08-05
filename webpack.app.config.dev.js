var CopyWebpackPlugin = require('copy-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
var path = require('path')

// Prevent nedb from substituting browser storage when running from the
// Electron renderer thread.
const fixNedbForElectronRenderer = {
    apply(resolver) {
        resolver
            // Plug in after the description file (package.json) has been
            // identified for the import, because we'll depend on it for some of
            // the logic below.
            .getHook("beforeDescribed-relative")
            .tapAsync(
                "FixNedbForElectronRenderer",
                (request, resolveContext, callback) => {
                    // Detect that the import is from NeDB via the description file
                    // dectect for the import. Calling `callback` with no parameters
                    // "bails", which proceeds with the normal resolution process.
                    if (!request.descriptionFileData.name === "nedb") {
                        return callback()
                    }

                    // When a require/import matches the target files from nedb, we
                    // can form the paths to the Node-specific versions of the files
                    // relative to the location of the description file. We can then
                    // short-circuit the Webpack resolution process by calling the
                    // callback with the finalized request object -- meaning that
                    // the `path` is pointing at the file that should be imported.
                    let relativePath
                    if (
                        request.path.startsWith(
                            resolver.join(request.descriptionFileRoot, "lib/storage")
                        )
                    ) {
                        relativePath = "lib/storage.js"
                    } else if (
                        request.path.startsWith(
                            resolver.join(
                                request.descriptionFileRoot,
                                "lib/customUtils"
                            )
                        )
                    ) {
                        relativePath = "lib/customUtils.js"
                    } else {
                        // Must be a different file from NeDB, so bail.
                        return callback()
                    }

                    const path = resolver.join(
                        request.descriptionFileRoot,
                        relativePath
                    )
                    const newRequest = Object.assign({}, request, { path })
                    callback(null, newRequest)
                }
            )
    }
}

module.exports = {
    entry: './src/app/renderer.ts',
    target: 'electron-renderer',
    mode: 'development',
    output: {
        filename: 'build/app.js',
        path: __dirname,
    },
    resolve: {
        extensions: ['.ts', '.vue', '.js', '.node'],
        plugins: [fixNedbForElectronRenderer],
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@app': path.resolve(__dirname, './src/app'),
            '@assets': path.resolve(__dirname, './src/app/assets')
        },
    },
    module: {
        rules: [
            { test: /\.vue$/, use: { loader: 'vue-loader', options: { esModule: true } } },
            { test: /\.ts$/, use: { loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } } },
            { test: /\.node$/, use: 'node-loader' },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
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
