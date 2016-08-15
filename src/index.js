/*eslint-disable import/default*/
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import './assets/styles/css/main.css'; 
import EditorApp from './EditorApp';

ReactDOM.render(
	<EditorApp />,
	document.getElementById('app')
);
