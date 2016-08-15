import webpack from 'webpack';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const GLOBALS = {
	'process.env.NODE_ENV': JSON.stringify('production')
};

export default {
	debug: true, // enable displaying debug information
	devtool: 'source-map', // this tool is slower than the one used for dev environment but more thorough
											// https://webpack.github.io/docs/configuration.html#devtool
	noInfo: false, // false --> Display info about all the files that webpack bundles
	entry: './src/index',
	target: 'web', // to bundle our app specifically for the web browsers (instead of native environment)
	output: {
		path: __dirname + '/dist',
		publicPath: '/',
		filename: 'bundle.js'
	},
	devServer: { // tells webpack-dev-server where our code is
		contentBase: './dist'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.DefinePlugin(GLOBALS),
		new ExtractTextPlugin('styles.css'),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	],
	module: {
		loaders: [
			{test: /\.js$/, include: path.join(__dirname, 'src'), loaders: ['babel']},
			{test: /(\.css)$/, loader: ExtractTextPlugin.extract("css?sourcemap")},
			{ test: /\.json$/, loader: 'json-loader' }
			// using path.join instead of string concatenation would simplify your code and prevent bugs
			// TODO: what difference (\.css)$ makes (compared to \.css$?
			// TODO: loaders for Bootstrap fonts, svg ...
		],
		noParse: /node_modules\/json-schema\/lib\/validate\.js/
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
