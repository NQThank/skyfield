import { rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { JobTaskService } from '@/core/services';
import { TJobTemplateItemSubTask } from '@/core/types';
import { useJobTask } from '@/store';
import SubTaskItem from './SubTaskItem';
import { pathNameTaskTemplate } from '@/core/constants';

type SubTaskItemListDroppableProps = {
  items: TJobTemplateItemSubTask[];
  subTaskId: string;
  drag_status: boolean;
};

const SubTaskItemListDroppable = ({ items, subTaskId, drag_status }: SubTaskItemListDroppableProps) => {
  return (
    <SortableContext id={subTaskId} items={items} strategy={rectSortingStrategy} disabled={!drag_status}>
      <div>
        {items.map((item) => (
          <SortableItem key={item.id} item={item} subTaskId={subTaskId} />
        ))}
      </div>
    </SortableContext>
  );
};

export default SubTaskItemListDroppable;

type SortableItemProps = {
  item: TJobTemplateItemSubTask;
  subTaskId: string;
};

const SortableItem: React.FC<SortableItemProps> = ({ item, subTaskId }) => {
  const { jobId, milestoneId, id } = useParams();
  const { pathname } = useLocation();
  const { deleteTemplateItemSubTaskItem, setIsOpenJobTask, setTemplateItemActive, jobTemplateItemsSubTaskMap } =
    useJobTask();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { item, subTaskId }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleDeleteTemplateItem = useCallback(
    async (subTaskId: string, templateItemId: string) => {
      if (pathname.includes(pathNameTaskTemplate)) {
        deleteTemplateItemSubTaskItem?.(subTaskId, templateItemId);
      } else {
        if (!jobId || !milestoneId || !id) {
          return;
        }
        const res = await JobTaskService.deleteSubTaskItemImage(jobId, milestoneId, id, subTaskId, templateItemId);
        if (res.success) deleteTemplateItemSubTaskItem?.(subTaskId, templateItemId);
      }
    },
    [deleteTemplateItemSubTaskItem, id, jobId, milestoneId, pathname]
  );

  const handleEditTemplateItem = useCallback(
    async (subTaskId: string, templateItemId: string) => {
      const templateItemEdit = jobTemplateItemsSubTaskMap[subTaskId]?.find((item) => item.id === templateItemId);
      if (!templateItemEdit) return;
      setIsOpenJobTask('template-item', true);
      setTemplateItemActive(templateItemEdit);
    },
    [jobTemplateItemsSubTaskMap, setIsOpenJobTask, setTemplateItemActive]
  );

  return (
    <li style={style} ref={setNodeRef}>
      <SubTaskItem
        item={item}
        subTaskId={subTaskId}
        onDeleteTemplateItem={handleDeleteTemplateItem}
        onEditTemplateItem={handleEditTemplateItem}
      >
        <button className={clsx('DragHandle !cursor-move text-white caret-black')} {...attributes} {...listeners}>
          <svg viewBox="0 0 20 20" width="12">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
          </svg>
        </button>
      </SubTaskItem>
    </li>
  );
};
