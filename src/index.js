/*eslint-disable import/default*/
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Dustbin from './Dustbin/index.js';
import MultiBackend from '../tools/MultiBackend.js';
import HTML5Backend from 'react-dnd-html5-backend';
import { default as Touch } from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';
import './assets/styles/css/main.css';


var DragDropApp = DragDropContext(MultiBackend(HTML5Backend, Touch))(Dustbin);

ReactDOM.render(
	<DragDropApp />,
	document.getElementById('app')
);



