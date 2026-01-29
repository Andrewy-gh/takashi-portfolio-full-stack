import type { CSSProperties, ReactNode } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ListItem from '@mui/material/ListItem';
import CldThumb from '../Images/CldThumb';
import type { ImageRecord } from '../../services/image';

const flexCol: CSSProperties = {
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

const spaceBetween: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export default function DragItem({
  children,
  cloudName,
  image,
  index,
}: {
  children: ReactNode;
  cloudName: string;
  image: ImageRecord;
  index: number;
}) {
  return (
    <Draggable key={image.id} draggableId={image.id} index={index}>
      {(provided) => (
        <ListItem
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          sx={listItem}
        >
          <div>
            {image.cloudinaryId ? (
              <CldThumb cloudName={cloudName} cloudinaryId={image.cloudinaryId} />
            ) : null}
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
