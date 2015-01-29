var webpack = require('webpack');
module.exports = {
    entry: './src/entry.js',
    output: {
        path: __dirname + '/build/',
        filename: 'bundle.js'
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
            __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false'))
        })
    ],

    //pretty strict
    jshint: {
        globals: {
            __DEV__: true,
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