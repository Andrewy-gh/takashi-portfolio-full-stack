import { type CSSProperties, type ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ListItem from '@mui/material/ListItem';
import type { IImage } from '@server/src/models/image';

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

const spaceBetween = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export function DragItem({
  children,
  image,
}: {
  children?: ReactNode;
  image: IImage;
}) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
    isDragging,
  } = useSortable({
    id: image.id,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
  };
  return (
    <ListItem sx={listItem} style={style}>
      <div>
        <img src={image.url} alt={image.title} style={{ width: '150px' }} />
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
            {children}
            <DragHandleIcon
              ref={setNodeRef as React.Ref<SVGSVGElement>}
              sx={{ placeSelf: 'start end' }}
              {...attributes}
              {...listeners}
            />
          </div>
        </div>
      </div>
    </ListItem>
  );
}
