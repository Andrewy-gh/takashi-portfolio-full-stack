import { useEffect } from 'react';

import { DragDropContext } from 'react-beautiful-dnd';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Container from '@mui/material/Container';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { useState } from 'react';
import DragItem from './DragItem';
import StrictModeDroppable from './StrictModeDroppable';

const containerStyle = {
  // textAlign: 'center'
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'calc(10px + 1.5vmin)',
};

const listStyle = {
  width: 'min(40ch, 100% - 2rem)',
  marginInline: 'auto',
};

export default function DragDrop({ images, updateOrder }) {
  const [imageOrder, setImageOrder] = useState(images);

  function handleOnDragEnd(result) {
    if (!result.destination) return;
    const images = Array.from(imageOrder);
    const [reorderedImages] = images.splice(result.source.index, 1);
    images.splice(result.destination.index, 0, reorderedImages);
    updateOrder(images);
    setImageOrder(images);
  }
  return (
    <div style={containerStyle}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <StrictModeDroppable droppableId="images">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={listStyle}
            >
              {imageOrder.map((image, index) => {
                return <DragItem key={image.id} image={image} index={index} />;
              })}
              {provided.placeholder}
            </List>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    </div>
  );
}
