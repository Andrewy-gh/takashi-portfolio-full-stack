import { Draggable } from 'react-beautiful-dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ListItem from '@mui/material/ListItem';
import CldThumb from '../Images/CldThumb';

const flexCol = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  marginRight: '1rem',
};

const listItem = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '.5em',
  border: 'solid 2px #d0d0d0',
  borderRadius: '.2em',
  padding: '.5em .2em .5em .5em',
  marginBottom: '1em',
  cursor: 'grab',
};

const spaceBetween = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export default function DragItem({ children, cloudName, image, index }) {
  return (
    <Draggable key={image.id} draggableId={image.id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          // isDragging={snapshot.isDragging}
          sx={listItem}
        >
          <div>
            <CldThumb cloudName={cloudName} cloudinaryId={image.cloudinaryId} />
          </div>

          <div
            style={{
              ...spaceBetween,
              width: '60%',
            }}
          >
            <div style={flexCol}>
              <span style={{ fontSize: '.875rem', marginBottom: '.5rem' }}>
                {image.title}
              </span>
              <div style={spaceBetween}>
                <div>{children}</div>
                <DragHandleIcon sx={{ placeSelf: 'start end' }} />
              </div>
            </div>
          </div>
        </ListItem>
      )}
    </Draggable>
  );
}
