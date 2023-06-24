import { Draggable } from 'react-beautiful-dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const listItem = {
  display: 'flex',
  alignItems: 'center',
  border: 'solid 2px #d0d0d0',
  borderRadius: '.2em',
  padding: '.5em .8em .5em .5em',
  marginBottom: '1em',
};

const thumbImgContainer = {
  overflow: 'hidden',
  flexShrink: '0',
  width: '2em',
  height: '2em',
  backgroundColor: '#e8e8e8',
  padding: '.5em',
  marginRight: '.5em',
};

const thumbImg = {
  display: 'block',
  width: '100%',
  height: 'auto',
};

const thumbFont = {
  maxWidth: 'none',
  fontWeight: 'bold',
  margin: '0',
};

export default function DragItem({ id, url, title, index }) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          // isDragging={snapshot.isDragging}
          sx={listItem}
        >
          <div style={thumbImgContainer}>
            <img src={url} alt={`${title} Thumb`} style={thumbImg} />
          </div>
          <p style={thumbFont}>{title}</p>
          <p>{id}</p>
        </ListItem>
      )}
    </Draggable>
  );
}
