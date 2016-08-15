// Set the process.env.NODE_ENV to "test" so that dev environment features like hot module reloading
// are disable
process.env.NODE_ENV = "test";

require('babel-register');

require.extensions['.css'] = function () {
	return null;
};

require.extensions['.png'] = function () {
	return null;
};

require.extensions['.jpg'] = function () {
	return null;
};

// jsdom helps us to test react components without opening the browser
var jsdom = require('jsdom').jsdom;

var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
	if (typeof global[property] === 'undefined') {
		exposedProperties.push(property);
		global[property] = document.defaultView[property];
	}
});

global.navigator = {
	userAgent: 'node.js'
};

documentRef = document; //eslint-disable-line no-undef
