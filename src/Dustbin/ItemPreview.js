'use strict';

import React from 'react';
import DragLayer from 'react-dnd/lib/DragLayer';

function collect (monitor) {
	/**
	 * getItem(): Returns a plain object representing the currently dragged item.
	 * Every drag source must specify it by returning an object from its beginDrag() method.
	 * Returns null if no item is being dragged.
	 */
	var item = monitor.getItem();
	return {
		item: monitor.getItem(),
		name: item && item.name,
		itemType: 'box',
		currentOffset: monitor.getSourceClientOffset(),
		isDragging: monitor.isDragging()
	};
}

function getItemStyles (currentOffset) {
	if (!currentOffset) {
		return {
			display: 'none'
		};
	}
	// console.log(currentOffset);
	// http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
	var x = currentOffset.x;
	var y = currentOffset.y;
	var transform = `translate(${x}px, ${y}px)`;

	return {
		pointerEvents: 'none',
		transform: transform,
		WebkitTransform: transform
	};
}

class ItemPreview extends React.Component {
	render () {
		if (!this.props.isDragging) {
			return null;
		}
		return (
			<div
				className="item preview"
				style={getItemStyles(this.props.currentOffset)}
			>
				Test test test
			</div>
		);
	}
}

export default DragLayer(collect)(ItemPreview);
