import { type CSSProperties, Fragment, useMemo, useState } from 'react';

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { IImage } from '@server/src/models/image';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import { theme } from '@/theme';
import { DragItem } from '@/components/edit/drag-item';
import { EditButtonDialog } from './edit-button-dialog';
import { DeleteButtonDialog } from './delete-button-dialog';

const containerStyle: CSSProperties = {
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

export function DragDrop({ images }: { images: IImage[] }) {
  const [imageOrder, setImageOrder] = useState(images);
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => imageOrder?.map(({ id }) => id.toString()),
    [imageOrder]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  function handleDragEnd(event: DragEndEvent) {
    console.log('event', event);
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setImageOrder((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <section style={containerStyle}>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <List sx={{ ...listStyle, ...(isMobile && mobileWidth) }}>
          {imageOrder.map((image) => (
            <Fragment key={image.id}>
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                <DragItem image={image}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <EditButtonDialog fullScreen={isMobile} image={image} />
                    <DeleteButtonDialog fullScreen={isMobile} image={image} />
                  </div>
                </DragItem>
              </SortableContext>
            </Fragment>
          ))}
        </List>
      </DndContext>
    </section>
  );
}
