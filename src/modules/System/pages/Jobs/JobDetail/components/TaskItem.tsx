import { CloseOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import PathURL from '@/core/class/PathURL';
import { JobService } from '@/core/services';
import { DataHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import { PriorityEnum, TemplateTypeEnum } from '@/core/enums';

type TaskItemProps = {
  // data: JobTask;
  data: any;
  milestoneId: string;
  fetchData?: () => void;
};

const TaskItem: React.FC<TaskItemProps> = ({ data, milestoneId, fetchData }) => {
  const { t } = useTranslation(['message']);
  const { id, projectId } = useParams();

  const onDelete = useCallback(() => {
    ModalHelper.confirm({
      title: 'Are you sure delete this task?',
      async onOk() {
        try {
          const res = await JobService.deleteTaskMilestone(id || '', projectId || '', data.task_id);
          if (res.success) {
            toast.success(t(['message:success']));
            fetchData?.();
          }
        } catch (error) {
          LogHelper.logError(error);
        }
      }
    });
  }, [data.task_id, t]);
  return (
    <div className="relative max-w-full border border-t-0 border-solid border-gray-300 bg-white p-3 pr-5">
      <div
        className={clsx('absolute left-[0px] top-1 h-[90%] w-[6px]', {
          'bg-orange-400': data?.status === 'in_progress',
          'bg-green-600': data?.status === 'completed',
          'bg-gray-600': data?.status === 'not_started'
        })}
      />
      <CloseOutlined onClick={onDelete} className="absolute right-1 top-1 cursor-pointer" />
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between gap-x-2">
          <div className="flex-1 truncate">{data.task_name ?? ''}</div>
          <div></div>
        </div>
        <div className="flex justify-between gap-x-2">
          <div className="flex-1">Type</div>
          <div className="font-semibold">
            {data?.type && DataHelper.getEnumKeyByValue(data?.type, TemplateTypeEnum)}
          </div>
        </div>
        <div className="flex justify-between gap-x-2">
          <div className="flex-1">Numbers of Man</div>
          <div className="font-semibold">{data?.number_of_men}</div>
        </div>
        <div className="flex justify-between gap-x-2">
          <div className="flex-1">Man Hours</div>
          <div className="font-semibold">{data?.total_working_hour}</div>
        </div>
        <div className="flex justify-between gap-x-2">
          <div className="flex-1"></div>
          <Link
            to={`/${PathURL.projects}/${projectId}/${PathURL.jobs}/${id}/${PathURL.milestones}/${milestoneId}/${PathURL.tasks}/${data.task_id}`}
          >
            Update Task
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
