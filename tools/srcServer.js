import express from 'express';
import webpack from 'webpack';
// webpack-dev-middleware's a simple wrapper middleware for webpack.
// It serves the files emitted from webpack over a connect server.
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import path from 'path';
import config from '../webpack.config.dev';
import open from 'open';

const port = 3000;
const app = express();
// webpack with the config in webpack.config.dev file becomes our app main compiler
const compiler = webpack(config);

/* eslint-disable no-console */

app.use(webpackDevMiddleware(compiler, {
	noInfo: true,
	publicPath: config.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.get('*', function(req, res) {
	res.sendFile(path.join( __dirname, '../src/index.html'));
});

app.listen(port, function(err) {
	if (err) {
		console.log(err);
	} else {
		open(`http://localhost:${port}`);
	}
});











