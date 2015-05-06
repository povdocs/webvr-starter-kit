module.exports = (function () {
	'use strict';

	var extend = require('xtend');
	var webpack = require('webpack');
	var pkg = require('../package.json');

	var banner = [
		pkg.name + ' - ' + pkg.description,
		'@version v' + pkg.version,
		'@link ' + pkg.homepage,
		'@license ' + pkg.license
	].join('\n');

	var common = {
		entry: './src/entry.js',
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

	var exports = {};

	exports.dev = extend(common, {
		debug: true,
		devtool: 'eval', //sourcemap?
		output: {
			path: './build/',
			filename: 'vr.dev.js',
			pathInfo: true
		},
		plugins: [
			new webpack.ResolverPlugin(
				new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
			),
			new webpack.DefinePlugin({
				__DEV__: true,
				__ASSET_PATH__: JSON.stringify('http://pov-tc.pbs.org/pov/flv/2015/webvr-starter-kit/')
			})
		],
	});

	exports.production = extend(common, {
		devtool: 'source-map',
		output: {
			path: './build/',
			filename: 'vr.js',
			sourceMapFilename: '[file].map'
		},
		plugins: [
			new webpack.ResolverPlugin(
				new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
			),
			new webpack.DefinePlugin({
				__DEV__: false,
				__ASSET_PATH__: JSON.stringify('http://pov-tc.pbs.org/pov/flv/2015/webvr-starter-kit/')
			}),
			new webpack.DefinePlugin({
				'process.env': {
					// This has effect on the react lib size
					'NODE_ENV': JSON.stringify('production')
				}
			}),
			new webpack.optimize.DedupePlugin(),
			new webpack.optimize.UglifyJsPlugin({
	            compress: {
	                warnings: false
	            },
	        }),
			new webpack.BannerPlugin(banner)
		],
	});

	return exports;
}());