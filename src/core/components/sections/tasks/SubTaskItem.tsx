import { useDroppable } from '@dnd-kit/core';
import { Checkbox, DatePicker, Flex, Input, Radio, Select, Tooltip } from 'antd';
import clsx from 'clsx';
import React, { memo, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { AppButton } from '@/core/components';
import { JobTaskService } from '@/core/services';
import { JobImage, TJobTemplateItemSubTask } from '@/core/types';
import { useJobTask } from '@/store';
import { DataHelper } from '@/utils/helpers';
import GalleryImage from './GalleryImage';
import ImageSkeleton from './ImageSkeleton';

interface SubTaskItemProps {
  item: TJobTemplateItemSubTask;
  children?: React.ReactNode;
  overlay?: boolean;
  subTaskId: string;
  onDeleteTemplateItem?: (subTaskId: string, templateItemId: string) => void;
  onEditTemplateItem?: (subTaskId: string, templateItemId: string) => void;
  preview?: boolean;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({
  item,
  children,
  overlay,
  onDeleteTemplateItem,
  subTaskId,
  preview
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: item.id,
    data: {
      data: item,
      subTaskId
    },
    disabled: item.status === 'done'
  });

  const { t } = useTranslation(['message']);
  const { setIsOpenJobTask, setTemplateItemActive, setSubTaskIdActive, setIsUpdateTask } = useJobTask();

  const _component = useMemo(() => {
    switch (item.name) {
      case 'text':
        return <Input />;
      case 'date':
        return <DatePicker />;
      case 'option':
        return <Select options={item?.value?.value ?? []} className="w-full" />;
      case 'check_list':
        return <Checkbox.Group options={item?.value?.value ?? []} />;
      case 'radio':
        return <Radio.Group options={[]} />;
      case 'text_area':
        return <Input.TextArea />;
      case 'checkin':
        return <AppButton>Check in</AppButton>;
      case 'pre_post_photo':
        return <PhotoComponent quantity={1} item={item} />;
      case 'punch_list_inspection_collection':
      case 'inspection_photos_collection':
      case 'photo_collection':
      case 'photo':
        return <PhotoComponent item={item} />;
    }
  }, [item]);

  const onEditItemTemplate = () => {
    // onEditTemplateItem?.(subTaskId, item.id);
    setIsOpenJobTask('add-item-image', true);
    setSubTaskIdActive(subTaskId);
    setTemplateItemActive(item);
  };

  return (
    <div ref={setNodeRef} className="min-h-[60px]">
      <div
        className={clsx(
          'group/item relative flex items-center gap-x-2 rounded-lg border border-dashed border-transparent p-2 transition-all',
          { 'hover:border-primary': !preview, '!border-primary': isOver }
        )}
      >
        {children}
        <div className="scrollbar flex flex-1 flex-col overflow-x-auto overflow-y-hidden">
          <label className="text-gray-500">{item.name ?? item.label ?? item?.value?.label ?? ''}</label>
          <div>
            <PhotoComponent item={item} />
          </div>
        </div>
        <div
          className={clsx(
            'invisible absolute -top-4 right-1 flex gap-x-1 rounded-md bg-slate-50 px-2 py-1 shadow-xl transition-all',
            {
              'group-hover/item:visible': !overlay
            },
            { hidden: preview }
          )}
        >
          <Tooltip title={t('edit')}>
            <AppButton
              shape="circle"
              type="text"
              size="small"
              icon={<i className="fa-solid fa-pen-to-square fa-sm cursor-pointer" />}
              className="transition-none"
              onClick={onEditItemTemplate}
            />
          </Tooltip>
          <Tooltip title={t('delete')}>
            <AppButton
              shape="circle"
              type="text"
              size="small"
              icon={<i className="fa-solid fa-trash-can fa-sm cursor-pointer text-red-500" />}
              className="transition-none"
              onClick={() => {
                onDeleteTemplateItem?.(subTaskId, item.id);
                setIsUpdateTask(true);
              }}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default memo(SubTaskItem);

const PhotoComponent: React.FC<{ item: TJobTemplateItemSubTask; quantity?: number }> = ({ item }) => {
  const { jobId } = useParams();
  const {
    setIsOpenJobTask,
    isOpenJobTask,
    imagesJobSubTaskItemMap,
    updateImagesJobSubTaskItem,
    setImageSubTaskItemActive,
    fetchJobImages,
    setIsUpdateTask
  } = useJobTask();
  const [loading, setLoading] = useState(false);
  const [idActive, setIdActive] = useState<string>();

  const handleClickImage = async (id: string) => {
    if (!jobId) return;
    setIdActive(id);
    try {
      const res = await JobTaskService.getDetailImageSubTaskItemById(jobId, item.id, id);
      setImageSubTaskItemActive(res.data);
    } finally {
      setIsOpenJobTask('subtask-image', true);
    }
  };
  useEffect(() => {
    if (!jobId) return;
    const fetchImagesItem = async () => {
      try {
        setLoading(true);
        const res = await JobTaskService.getImagesBySubTaskItem(jobId, item.id);
        if (res.success) {
          updateImagesJobSubTaskItem(item.id, res.data ?? [], 'reset');
          setIsUpdateTask(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchImagesItem();
    return () => {
      updateImagesJobSubTaskItem(item.id, [], 'add');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useLayoutEffect(() => {
    if (isOpenJobTask['subtask-image']) return;
    setIdActive(undefined);
  }, [isOpenJobTask]);

  const handleDeleteImage = async (image: JobImage) => {
    if (!jobId) return;
    try {
      await JobTaskService.updateImagesTaskItem(jobId, item.id, { delete_gallery_ids: [image.id] });
      updateImagesJobSubTaskItem(item.id, [image], 'delete');
      await fetchJobImages(jobId);
    } catch (error) {
      console.log('Delele image error: ', error);
    }
  };
  return (
    <Flex wrap={false} gap={4}>
      {loading && <ImageSkeleton count={2} />}
      {!loading &&
        imagesJobSubTaskItemMap?.[item.id]?.map((item) => (
          <div key={item.id} className="group relative box-border">
            <GalleryImage
              src={DataHelper.getUrlFile(item.url)}
              active={idActive === item.id && isOpenJobTask['subtask-image']}
              onClick={() => handleClickImage(item.id)}
              className="hover:!border-primary"
              status={item.status}
            />
            {item.status === 'UPLOADED' && (
              <AppButton
                onClick={() => handleDeleteImage(item)}
                icon={<i className="fa-solid fa-xmark" />}
                shape="circle"
                size="small"
                className="absolute -right-2 -top-2 !hidden group-hover:!flex"
              />
            )}
          </div>
        ))}
    </Flex>
  );
};
