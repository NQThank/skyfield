import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React, { memo, useEffect } from 'react';

import { BaseItem } from '@/core/types';

type FormItemDraggableProps<T> = {
  children: React.ReactNode;
  item: T;
  setIsDragging?: (data: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
};

function FormItemDraggable<T extends BaseItem>({
  children,
  item,
  setIsDragging,
  onClick
}: Readonly<FormItemDraggableProps<T>>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item
  });
  useEffect(() => {
    setIsDragging?.(isDragging);
  }, [isDragging, setIsDragging]);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), zIndex: isDragging ? 100 : 10 }}
      {...attributes}
      {...listeners}
      onMouseDown={onClick}
    >
      {children}
    </div>
  );
}

export default memo(FormItemDraggable) as <T extends BaseItem>(props: FormItemDraggableProps<T>) => React.ReactElement;
