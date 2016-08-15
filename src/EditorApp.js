// This component handles the App templates used on every page.
import React, { PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { default as TouchBackend } from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';
import Dustbin from './Dustbin/index';

class EditorApp extends React.Component {
	render() {
		return (
				<Dustbin />
		);
	}
}

export default DragDropContext(TouchBackend)(EditorApp);
