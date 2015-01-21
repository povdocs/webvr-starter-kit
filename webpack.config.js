var webpack = require("webpack");
module.exports = {
    entry: "./src/entry.js",
    output: {
        path: __dirname + '/build/',
        filename: "bundle.js"
    },
    module: {
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
        modulesDirectories: ["web_modules", "node_modules", "bower_components"]
    },
    plugins: [
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
        )
    ]
};