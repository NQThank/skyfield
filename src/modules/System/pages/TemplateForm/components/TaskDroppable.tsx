import { useDroppable } from '@dnd-kit/core';
import { Col, Row } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';

import SortableList from '@/core/components/SortableList';
import { useAppDispatch } from '@/core/hooks';
import { ITemplateItem } from '@/core/types';
import { sortTemplateItemsSubTask } from '../template-form.slice';
import TemplateItem from './TemplateItem';

interface TaskDroppableProps {
  items: ITemplateItem[];
  id: string;
  isPreview?: boolean;
}

const TaskDroppable: React.FC<TaskDroppableProps> = ({ items, id, isPreview = false }) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });
  const dispatch = useAppDispatch();

  return (
    <div
      ref={setNodeRef}
      className={clsx('min-h-40 w-full bg-white', { 'rounded-lg border border-dashed border-primary': isOver })}
    >
      <SortableList
        items={items}
        onChange={(values) => {
          dispatch(sortTemplateItemsSubTask({ subTaskId: id, data: values }));
        }}
        renderItem={(item: ITemplateItem) => (
          <SortableList.Item id={item.id}>
            <TemplateItem item={item} overlay subTaskId={id}>
              <SortableList.DragHandle className="text-black" />
            </TemplateItem>
          </SortableList.Item>
        )}
      >
        <Row gutter={[12, 12]} className="min-h-[120px] overflow-x-auto overflow-y-hidden p-4">
          {items.map((item) => (
            <Col span={24} key={item.id}>
              <SortableList.Item id={item.id}>
                <TemplateItem item={item} subTaskId={id} isPreview={isPreview}>
                  {!isPreview && <SortableList.DragHandle className="text-black" />}
                </TemplateItem>
              </SortableList.Item>
            </Col>
          ))}
        </Row>
      </SortableList>
    </div>
  );
};

export default memo(TaskDroppable);
