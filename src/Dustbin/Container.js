import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ItemPreview from './ItemPreview';
import Dustbin from './Dustbin';
import Box from './Box';

export default class Container extends Component {
  render() {
	  const boxes = [{name: 'Glass', id: 1}, {name:'Banana', id: 2}, {name: 'Paper', id:3}]
		  .map(function(box) {
			  return <Box key={box.id} name={box.name} id={box.id}/>
		  });
    return (
      <div>
          <Dustbin />
			{boxes}
			<ItemPreview />
      </div>
    );
  }
}
