var webpack = require('webpack');
module.exports = {
    entry: './src/entry.js',
    output: {
        path: __dirname + '/build/',
        filename: 'vr.js'
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules|bower_components|src\/lib/,
                loader: 'jshint-loader'
            }
        ],
        loaders: [
            {
                test: /\.png$/,
                loader: 'url-loader',
                query: {
                    mimetype: 'image/png'
                }
            },
            {
                test: /\.jpg$/,
                loader: 'url-loader',
                query: {
                    mimetype: 'image/jpg',
                    limit: 8000,
                    name: 'image/[name].[ext]'
                }
            },
            { test: /\.css$/, loader: ['style', 'css'] }
        ]
    },
    resolve: {
        modulesDirectories: ['web_modules', 'node_modules', 'bower_components']
    },
    plugins: [
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
        ),
        new webpack.DefinePlugin({
            __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
            __ASSET_PATH__: JSON.stringify('http://pov-tc.pbs.org/pov/flv/2015/webvr-starter-kit/')
        })
    ],

    //pretty strict
    jshint: {
        globals: {
            __DEV__: true,
            __ASSET_PATH__: true,
            console: true
        },

        bitwise: true,
        browser: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        es3: true,
        forin: true,
        freeze: true,
        funcscope: true,
        globalstrict: true,
        immed: true,
        iterator: true,
        latedef: true,
        maxparams: 4,
        newcap: true,
        noarg: true,
        nonbsp: true,
        nonew: true,
        notypeof: true,
        quotmark: 'single',
        shadow: true,
        //singleGroups: true,
        undef: true,
        //unused: true, todo: add this back in when more stuff is working

        failOnHint: true,
        emitErrors: true
    }
};