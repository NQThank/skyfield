import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React, { memo } from 'react';

import { FormItem } from '@/core/types';

interface FormItemDraggableProps {
  children: React.ReactNode;
  item: FormItem;
}

const FormItemDraggable: React.FC<FormItemDraggableProps> = ({ children, item }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { name: item.name }
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), zIndex: 10 }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

export default memo(FormItemDraggable);
