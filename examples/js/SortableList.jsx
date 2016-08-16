/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';

import React from 'react';
import DraggableItem from './DraggableItem.jsx';
import { List } from 'immutable';

export default class SortableList extends React.Component {
    render () {
        const items = this.props.data.toArray().map(obj => (
            <DraggableItem
                key={obj.get('id')}
                id={obj.get('id')}
                listId={this.props.id}
                name={obj.get('name')}
                onReorder={this.props.onReorder}
            />
        ));
		console.log(items);

        return (
            <ul className="list">
                {items}
            </ul>
        );
    }
}

SortableList.propTypes = {
    id: React.PropTypes.number.isRequired,
    data: React.PropTypes.instanceOf(List).isRequired,
    onReorder: React.PropTypes.func
};
