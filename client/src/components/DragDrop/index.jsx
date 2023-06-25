import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext } from 'react-beautiful-dnd';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Container from '@mui/material/Container';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { useState } from 'react';
import DragItem from './DragItem';
import StrictModeDroppable from './StrictModeDroppable';
import { updateImageOrder } from '../../features/imageSlice';

const containerStyle = {
  // textAlign: 'center'
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'calc(10px + 1.5vmin)',
};

const listStyle = {
  listStyle: 'none',
};

export default function DragDrop() {
  const dispatch = useDispatch();
  const { data } = useSelector(({ images }) => images);
  const [imageOrder, setImageOrder] = useState(data);

  function handleOnDragEnd(result) {
    if (!result.destination) return;
    const images = Array.from(imageOrder);
    const [reorderedImages] = images.splice(result.source.index, 1);
    images.splice(result.destination.index, 0, reorderedImages);

    // setImageOrder(images);
    dispatch(updateImageOrder(images));
    setImageOrder(images);
  }
  return (
    <div style={containerStyle}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <StrictModeDroppable droppableId="images">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
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
