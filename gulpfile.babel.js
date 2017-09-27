import gulp from 'gulp';
import webpack from 'webpack';
import chalk from 'chalk';
import rimraf from 'rimraf'
import serverWebpackConfig from './webpack.server';
import clientWebpackConfig from './webpack.client';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

/** CLIENT CONFIG OBJECT */
const createClientConfig = Object.assign({}, clientWebpackConfig);
createClientConfig.devtool = 'source-map';
createClientConfig.plugins.push(new webpack.optimize.UglifyJsPlugin());
createClientConfig.plugins.push(new ExtractTextPlugin('[name].css'));

delete createClientConfig.module.rules[3].loader;
delete createClientConfig.module.rules[4].loader;
createClientConfig.module.rules[3].use = ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader'});
createClientConfig.module.rules[4].use = ExtractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader','sass-loader']});

/** SERVER CONFIG OBJECT */
const createServerConfig = Object.assign({}, serverWebpackConfig);
createServerConfig.plugins.push(new webpack.optimize.UglifyJsPlugin());
const $ = require('gulp-load-plugins')();

// PUBLIC TASKS
gulp.task('clean:server', cb => rimraf('./build', cb));
gulp.task('clean:client', cb => rimraf('./public/build', cb));
gulp.task('clean', gulp.parallel('clean:server', 'clean:client'));

gulp.task('dev:server', gulp.series('clean:server', devServerBuild));
gulp.task('dev', gulp.series('clean', devServerBuild, gulp.parallel(devServerWatch, devServerReload)));
gulp.task('prod:server', gulp.series('clean:server', prodServerBuild));
gulp.task('prod:client', gulp.series('clean:client', prodClientBuild));
gulp.task('prod', gulp.series('clean', gulp.parallel(prodServerBuild, prodClientBuild)));


// PRIVATE SERVER TASKS
function prodClientBuild(callback) {
	const compiler = webpack(createClientConfig);
	compiler.run((err, stats) => {
		outputWebpack('Prod:Client', err, stats);
		callback();
	});
}
// PRIVATE SERVER TASKS
const devServerWebpack = webpack(serverWebpackConfig);

function devServerBuild(callback) {
	devServerWebpack.run((error, stats) => {
		outputWebpack('Dev:Server', error, stats);
		callback();
	});
}

function devServerWatch() {
	devServerWebpack.watch({}, (error, stats) => {
		outputWebpack('Dev:Server', error, stats);
	});
}

function devServerReload() {
	return $.nodemon({
		script: './build/server.js',
		watch: './build',
		env: {'NODE_ENV': 'development', 'USE_WEBPACK': 'true'}
	});
}

function prodServerBuild(callback) {
	const prodServerWebpack = webpack(createServerConfig);
	prodServerWebpack.run((error, stats) => {
		outputWebpack('Prod:Server', error, stats);
		callback();
	});
}

// HELPERS
function outputWebpack(label, error, stats) {
	if (error) {
		throw new Error(error);
	}

	if (stats.hasErrors()) {
		$.util.log(stats.toString({colors: true}));
	} else {
		const time = stats.endTime - stats.startTime;
		$.util.log(chalk.bgBlack(`Built in ${label} in ${time} ms.`))
	}
}