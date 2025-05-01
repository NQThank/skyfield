import { Flex, Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';

import { AppButton } from '@/core/components';
import { DragDropWrapper, SubTaskView, TaskDocuments, TaskGeneralInfo } from '@/core/components/sections/tasks';
import { TaskGeneralInfoFormRef } from '@/core/components/sections/tasks/TaskGeneralInfo';
import { APP_NAME } from '@/core/constants';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { JobService, JobTaskService } from '@/core/services';
import jobService from '@/core/services/job.service';
import { UploadFileType } from '@/core/types';
import { useJobTask } from '@/store';
import { setNameMap } from '../../common.slice';
import { DataHelper } from '@/utils/helpers';

type JobTaskFormProps = {};

const JobTaskForm: React.FC<JobTaskFormProps> = () => {
  const formRef = useRef<TaskGeneralInfoFormRef>(null);
  const fileRef = useRef(null);
  const dispatch = useAppDispatch();
  const { nameMap } = useAppSelector((state) => state.common);

  const generalInfo = Form.useWatch([], formRef.current ?? undefined);

  const [_fileRemoved, setFileRemoved] = useState<UploadFileType[]>([]);
  const [fileList, setFileList] = useState<UploadFileType[]>([]);

  const { id, milestoneId, jobId } = useParams();
  const {
    setLoading,
    setJobTaskInfo,
    setTemplateItemSubTask,
    setJobSubTaskEquipment,
    setJobSubTasks,
    loadItems,
    jobTaskInfo,
    isUpdateTask,
    setIsUpdateTask
  } = useJobTask();
  const fetchTask = async () => {
    if (!id || !milestoneId || !jobId) return;
    setLoading(true);
    try {
      const res = await JobService.getTaskById(jobId, milestoneId, id);
      const { data: dataMilestone } = await jobService.getMilestonesByJobId(jobId || '');
      if (res.success && res.data) {
        console.log('🚀 ~ fetchTask ~ res.data:', res.data);
        const mileStone = dataMilestone?.find((item) => item.id === milestoneId);
        const { documents, ...info } = res.data;
        setJobTaskInfo(info);
        dispatch(
          setNameMap({
            ...nameMap,
            [mileStone?.id as string]: mileStone?.name ?? '',
            [info.id as string]: info?.name
          })
        );
        setFileList(
          (documents ?? []).map((item) => ({
            name: item.name,
            uid: item.id,
            fileType: 'old' as const,
            url: DataHelper.getUrlFile(item.download_url)
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchSubtaskList = async () => {
    if (!id || !milestoneId || !jobId) return;
    setLoading(true);
    try {
      const result = await JobTaskService.getSubTaskList(jobId, milestoneId, id);
      if (result.success) {
        const subTasks = result.data ?? [];
        setJobSubTasks(subTasks);
      }
    } finally {
      setLoading(false);
    }
  };
  const updateInfor = async () => {
    if (!id || !milestoneId || !jobId) return;

    try {
      const res = await JobService.getTaskById(jobId, milestoneId, id);
      if (res.success && res.data) {
        const { documents, ...info } = res.data;
        setJobTaskInfo(info);
        setIsUpdateTask(false);
      }
    } catch (error) {}
  };
  useEffect(() => {
    if (isUpdateTask) updateInfor();
  }, [isUpdateTask]);
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    setJobTaskInfo({ ...(jobTaskInfo ?? {}), ...generalInfo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalInfo]);

  useEffect(() => {
    fetchTask();
    fetchSubtaskList();
  }, [
    setLoading,
    id,
    milestoneId,
    jobId,
    setJobTaskInfo,
    setJobSubTaskEquipment,
    setTemplateItemSubTask,
    setJobSubTasks
  ]);
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>{`${APP_NAME} - Edit Job Task`}</title>
      </Helmet>
      <div className="flex flex-col gap-4 backdrop:bg-bg-main" id="task-container">
        <Flex gap={8} justify="end">
          <AppButton type="text" onClick={() => navigate(-1)}>
            Cancel
          </AppButton>
          {/* <AppButton type="primary" onClick={handleUpdate}>
            Update
          </AppButton> */}
          {/* <FullscreenButton containerId="task-container" /> */}
        </Flex>

        <div className="flex flex-col gap-4 xl:flex-row" id="content">
          <div className="flex w-full flex-col gap-y-4 xl:w-[500px]">
            <TaskGeneralInfo ref={formRef} />
            <SubTaskView />
            <TaskDocuments ref={fileRef} fileList={fileList} setFileRemoved={setFileRemoved} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <DragDropWrapper />
          </div>
        </div>
      </div>
    </>
  );
};

export default JobTaskForm;
