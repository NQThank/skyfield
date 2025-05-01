import { Flex } from 'antd';
import React, { useRef, useState } from 'react';

import { UploadFileType } from '@/core/types';
import AppButton from '../../base/AppButton';
import DragDropWrapper from './DragDropWrapper';
import GalleryFile from './GalleryFile';
import SubTaskView from './SubTaskView';
import TaskDocuments from './TaskDocuments';
import TaskGeneralInfo, { TaskGeneralInfoFormRef } from './TaskGeneralInfo';
import PreviewModal from './PreviewModal';

type JobTaskProps = {};

const JobTask: React.FC<JobTaskProps> = () => {
  const [openPreviewModal, setOpenPreviewModal] = useState(false);

  const [_fileRemoved, setFileRemoved] = useState<UploadFileType[]>([]);

  const formRef = useRef<TaskGeneralInfoFormRef>(null);
  const fileRef = useRef(null);

  return (
    <>
      <div className="flex flex-col gap-4">
        <Flex justify="flex-end" gap={8}>
          <AppButton size="large" type="text">
            Cancel
          </AppButton>
          <AppButton size="large" type="primary">
            Update
          </AppButton>
        </Flex>

        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex w-full flex-col gap-y-4 xl:w-[500px]">
            <TaskGeneralInfo ref={formRef} />
            <SubTaskView />
            <TaskDocuments ref={fileRef} fileList={[]} setFileRemoved={setFileRemoved} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <GalleryFile />
            <DragDropWrapper />
          </div>
        </div>
      </div>
      <PreviewModal open={openPreviewModal} onCancel={() => setOpenPreviewModal(false)} />
    </>
  );
};

export default JobTask;
