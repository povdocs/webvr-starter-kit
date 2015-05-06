//based on example: https://github.com/webpack/webpack-with-common-libs/blob/master/gulpfile.js

var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./config');

// Build and watch cycle (another option for development)
// Advantage: No server required, can run app from filesystem
// Disadvantage: Requests are not blocked until bundle is available,
//               can serve an old app on refresh
gulp.task('watch', ['webpack:build-dev'], function() {
	gulp.watch(['src/**/*'], ['webpack:build-dev']);
});

// Development build
gulp.task('default', ['webpack:build-dev']);

// Production build
gulp.task('build', function(callback) {
	var compiler = webpack(config.production);
	compiler.run(function(err, stats) {
		if(err) throw new gutil.PluginError('webpack:build', err);
		gutil.log('[webpack:build]', stats.toString({
			colors: true
		}));
		callback();
	});
});

// The development server (the recommended option for development)
gulp.task('server', ['webpack-dev-server']);

// create a single instance of the compiler to allow caching
var devCompiler = webpack(config.dev);
gulp.task('webpack:build-dev', function(callback) {
	// run webpack
	devCompiler.run(function(err, stats) {
		if(err) throw new gutil.PluginError('webpack:build-dev', err);
		gutil.log('[webpack:build-dev]', stats.toString({
			colors: true
		}));
		callback();
	});
});

/*
This is broken right now. don't use it
*/
gulp.task('webpack-dev-server', function(callback) {
	// Start a webpack-dev-server
	new WebpackDevServer(webpack(config.dev), {
		publicPath: '/' + myConfig.output.publicPath,
		stats: {
			colors: true
		}
	}).listen(8080, 'localhost', function(err) {
		if(err) throw new gutil.PluginError('webpack-dev-server', err);
		gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
	});
});
