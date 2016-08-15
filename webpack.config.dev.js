import webpack from 'webpack';
import path from 'path';

export default {
	debug: true, // enable displaying debug information
	devtool: 'cheap-module-eval-source-map', // a developer tool to enhance debugging,
											// https://webpack.github.io/docs/configuration.html#devtool
	noInfo: false, // false --> Display info about all the files that webpack bundles
	entry: [
		'eventsource-polyfill', // necessary for hot reloading with IE
		'webpack-hot-middleware/client?reload=true', // reload the page if hot module reloading fails.
		'./src/index' /* entry point for our application (could be an array of entry points)
						must be the last element in entry array
						*/
	],
	target: 'web', // to bundle our app specifically for the web browsers (instead of native environment)
	output: {
		// At development state, we can not see the bundle.js file, it gets simulated in memory bt webpack
		// at directory specified by path key below.
		path: __dirname + '/dist',
		publicPath: '/',
		filename: 'bundle.js'
	},
	devServer: { // tells webpack-dev-server where our code is
		contentBase: './src'
	},
	plugins: [
		// allow us to replace module without the need of a full browser refresh
		new webpack.HotModuleReplacementPlugin(),
		// keep errors from breaking our hot reloading experience
		new webpack.NoErrorsPlugin()
	],
	module: {
		loaders: [
			{test: /\.js$/, include: path.join(__dirname, 'src'), loaders: ['babel']},
			{test: /(\.css)$/, loaders: ['style', 'css']},
			{ test: /\.json$/, loader: 'json-loader' }
			// using path.join instead of string concatenation would simplify your code and prevent bugs
			// TODO: what difference (\.css)$ makes (compared to \.css$?
			// TODO: loaders for Bootstrap fonts, svg ...
		]
	},
	resolve: {
		extensions: ['', '.js']
	},
	node: {
		console: true,
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	}
};

/**
 * Resources collected from the Internet
 *
 * https://medium.com/@dabit3/beginner-s-guide-to-webpack-b1f1a3638460#.hcm9qcbfk
 * http://stackoverflow.com/questions/37452402/webpack-loaders-vs-plugins-whats-the-difference
 *
 * test — a regular expression that tests what kind of files to run through this loader.
 * As you can see, we have added a regex to test all files with an es6 extension.
 * Introduction to Regular Expression: http://www.w3schools.com/Js/js_regexp.asp
 * http://regexone.com/lesson/
 *
 * Loaders: Loaders allow you to preprocess files as you require() or “load” them.
 * Loaders are kind of like “tasks” are in other build tools
 */
