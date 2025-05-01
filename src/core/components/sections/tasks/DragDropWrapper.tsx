import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { JobTaskService } from '@/core/services';
import { FormItemType, JobImage, OpenJobTaskType, TJobTemplateItemSubTask } from '@/core/types';
import { useJobTask } from '@/store';
import { CommonHelper } from '@/utils/helpers';
import GalleryFile from './GalleryFile';
import SubTaskDetailGroup from './SubTaskDetailGroup';
import SubTaskItemImageDrawer from './SubTaskItemImageDrawer';
import TaskTitle from './TaskTitle';

type DragDropWrapperProps = {};
const uniqById = (array: JobImage[]) => {
  const seen = new Set();
  return array.filter((item) => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
};
const DragDropWrapper: React.FC<DragDropWrapperProps> = () => {
  const { jobId } = useParams();
  const {
    updateTemplateItem,
    isOpenJobTask,
    setIsOpenJobTask,
    updateImagesJobSubTaskItem,
    deleteGalleryImage,
    updateTemplateItemsSubTask,
    jobTemplateItemsSubTaskMap,
    setIsUpdateTask,
    galleryImagesActive,
    setGalleryImagesActive
  } = useJobTask();
  const _itemsAcceptImage: FormItemType[] = [
    'inspection_photos_collection',
    'photo',
    'pre_post_photo',
    'punch_list_inspection_collection',
    'photo_collection'
  ];
  const handleUpdateImagesJobSubTaskItem = async (item: any, imageData: any, subTaskId: string) => {
    await JobTaskService.updateImagesTaskItem(jobId!, item.id, { add_gallery_ids: [imageData.id] });
    setIsUpdateTask(true);
    updateTemplateItem(
      {
        ...item,
        files_url: [...(item.files_url ?? []), { ...imageData, id: CommonHelper.generateStr() }]
      },
      subTaskId
    );
    deleteGalleryImage(imageData);
    updateImagesJobSubTaskItem(item.id, [imageData], 'add');
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (over.id === active.id) return;
    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    if (activeContainer === overContainer) {
      const activeIndex = active.data.current?.sortable?.index;
      const overIndex = over.data.current?.sortable?.index;

      return updateTemplateItemsSubTask(
        arrayMove(jobTemplateItemsSubTaskMap[activeContainer], activeIndex, overIndex),
        activeContainer
      );
    }

    const { item, subTaskId }: { item: TJobTemplateItemSubTask; subTaskId: string } = over?.data?.current as any;

    if (!item || !subTaskId) return;

    // const { name } = item;
    // if (!itemsAcceptImage.includes(name)) return;
    const imageData = active.data.current as JobImage;
    const updatedGalleryImagesActive = uniqById([...galleryImagesActive, imageData]);
    updatedGalleryImagesActive.forEach((image) => {
      handleUpdateImagesJobSubTaskItem(item, image, subTaskId);
    });
    setGalleryImagesActive([]);
  };
  const handleCloseModal = useCallback(
    (type: OpenJobTaskType) => {
      setIsOpenJobTask(type, false);
    },
    [setIsOpenJobTask]
  );

  return (
    <>
      <DndContext onDragEnd={onDragEnd}>
        <GalleryFile />
        <TaskTitle />
        <SubTaskDetailGroup />
      </DndContext>

      <SubTaskItemImageDrawer open={isOpenJobTask['subtask-image']} onClose={() => handleCloseModal('subtask-image')} />
    </>
  );
};

export default DragDropWrapper;
