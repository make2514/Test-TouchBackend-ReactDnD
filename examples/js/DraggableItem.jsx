/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';

import React from 'react';
import DragSource from 'react-dnd/lib/DragSource';
import DropTarget from 'react-dnd/lib/DropTarget';

import classnames from 'classnames';

/**
 * The docs for the following functions can be found in
 * react-dnd's docs: http://gaearon.github.io/react-dnd/docs-overview.html
 */
const dragSource = {
    beginDrag (props) {
        return {
            id: props.id,
            listId: props.listId,
            name: props.name,
            onReorder: props.onReorder
        };
    }
};

const dropTarget = {
    drop (props, monitor) {
        const item = monitor.getItem();
        // Don't trigger reorder if it's to the same spot
        if (
            item.listId === props.listId &&
            item.id === props.id
        ) {
            return;
        }
        item.onReorder(
            {
                listId: item.listId,
                id: item.id
            },
            {
                listId: props.listId,
                id: props.id
            });
    }
};

export default class Item extends React.Component {
    render () {
        const className = classnames('item', {
            'is-over': this.props.isOver
        });

        let content = (
            <li className={className}>
                {this.props.id} <a href="http://google.com">{this.props.name}</a>
            </li>
        );

        // Connect as drag source
        content = this.props.connectDragSource(content, { dropEffect: 'move' });
        // Connect as drop target
        content = this.props.connectDropTarget(content);
        // Connect to drag layer
        content = this.props.connectDragPreview(content);

        return content;
    }
}

Item.PropTypes = {
    id: React.PropTypes.number.isRequired,
    listId: React.PropTypes.number.isRequired,
    text: React.PropTypes.string,

    // react-dnd props
    connectDragSource: React.PropTypes.func,
    connectDropTarget: React.PropTypes.func,
    connectDragPreview: React.PropTypes.func,
    onReorder: React.PropTypes.func,
    isDragging: React.PropTypes.bool,
    isOver: React.PropTypes.bool
};

export default DragSource(
    'Item',
    dragSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
)(DropTarget(
    'Item',
    dropTarget,
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    })
)(Item));
