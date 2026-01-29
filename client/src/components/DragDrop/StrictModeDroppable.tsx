import { useEffect, useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import type { DroppableProps } from 'react-beautiful-dnd';

type StrictModeDroppableProps = DroppableProps;

export default function StrictModeDroppable({
  children,
  ...props
}: StrictModeDroppableProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
}
