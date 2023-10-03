import { DragDropContext } from 'react-beautiful-dnd';
import List from '@mui/material/List';
import { useEffect, useState } from 'react';
import DragItem from './DragItem';
import StrictModeDroppable from './StrictModeDroppable';
import useMediaQuery from '@mui/material/useMediaQuery';
import { theme } from '../../styles/styles';

import EditButton from '../ImageEdit/EditButton';
import DeleteButton from '../ImageDelete/DeleteButton';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'calc(10px + 1.5vmin)',
};

const listStyle = {
  width: 'min(60ch, 100% - 2rem)',
  marginInline: 'auto',
};

const mobileWidth = {
  width: 'calc(100% - 2rem)',
};

export default function DragDrop({
  cloudName,
  images,
  updateImageOrder,
  updateImageDetails,
  removeOneImage,
}) {
  const [imageOrder, setImageOrder] = useState(images);
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  useEffect(() => {
    setImageOrder(images);
  }, [images]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const images = Array.from(imageOrder);
    const [reorderedImages] = images.splice(result.source.index, 1);
    images.splice(result.destination.index, 0, reorderedImages);
    updateImageOrder(images);
    setImageOrder(images);
  };

  return (
    <div style={containerStyle}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <StrictModeDroppable droppableId="images">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ ...listStyle, ...(isMobile && mobileWidth) }}
            >
              {imageOrder.map((image, index) => {
                return (
                  <DragItem
                    key={image.id}
                    cloudName={cloudName}
                    image={image}
                    index={index}
                  >
                    <EditButton
                      image={image}
                      updateImageDetails={updateImageDetails}
                    />
                    <DeleteButton
                      image={image}
                      removeOneImage={removeOneImage}
                    />
                  </DragItem>
                );
              })}
              {provided.placeholder}
            </List>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    </div>
  );
}
