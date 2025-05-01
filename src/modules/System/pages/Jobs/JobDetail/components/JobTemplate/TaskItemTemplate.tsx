import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Priorities, TemplateTypes } from '@/core/constants';
import { CommonService } from '@/core/services';
import { JobTask } from '@/core/types';
import { LogHelper, ModalHelper } from '@/utils/helpers';
import { CloseOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ListAddMilestone } from './CardMilestoneTemplate';

type TaskItemProps = {
  data: any;
  list: ListAddMilestone;
  milestoneId: string;
  onEditTask: (task: JobTask, milestoneId: string) => void;
};

const TaskItemTemplate: React.FC<TaskItemProps> = ({ data, list, milestoneId, onEditTask }) => {
  const { id } = useParams();
  const [task, setTask] = useState<any>({ ...data });

  const fetchTaskTemplates = useCallback(
    async (value: string) => {
      try {
        const res = await CommonService.getTaskTemplates(value);
        if (res.success && res.data?.length && id && res.data) {
          const result = res.data.find((e) => e.id === data.id || e.id === data.task_id) as any;
          setTask({ ...data, ...result });
        }
      } finally {
        console.log('res');
      }
    },
    [data, id]
  );
  useEffect(() => {
    if (data) fetchTaskTemplates('');
  }, [data, fetchTaskTemplates]);
  const onDelete = useCallback(() => {
    ModalHelper.confirm({
      title: 'Are you sure delete this task?',
      async onOk() {
        try {
          const newList = list.milestone.map((milestone: any) => {
            if (milestone.id === milestoneId) {
              const result = {
                ...milestone,
                job_tasks: milestone.job_tasks.filter((task: any) => task.id !== data.id)
              };
              return result;
            } else {
              return milestone;
            }
          });
          list.setMilestone(newList);
        } catch (error) {
          LogHelper.logError(error);
        }
      }
    });
  }, [list, data.id, milestoneId]);
  return (
    <div className="relative max-w-full border border-t-0 border-solid border-gray-300 bg-white p-3 pr-5">
      <div
        className={clsx('absolute left-[0px] top-1 h-[90%] w-[10px]', {
          'bg-orange-400': task?.status === 'in_progress',
          'bg-green-600': task?.status === 'completed',
          'bg-gray-600': task?.status === 'not_started'
        })}
      />
      <CloseOutlined onClick={onDelete} className="absolute right-1 top-1 cursor-pointer" />
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between gap-x-2">
          <div className="flex-1 truncate">{task?.name ?? ''}</div>
          <div>{task?.end_date && dayjs(task?.end_date).format('YYYY/MM/DD')}</div>
        </div>
        <div className="flex justify-between gap-x-2">
          <div className="flex-1">Type</div>
          <div className="font-semibold">{TemplateTypes.find((i) => i.value === task?.type)?.label}</div>
        </div>
        <div className="flex justify-between gap-x-2">
          <div className="flex-1">Numbers of Man</div>
          <div className="font-semibold">{task?.number_of_men}</div>
        </div>
        <div className="flex justify-between gap-x-2">
          <div className="flex-1">Man Hours</div>
          <div className="font-semibold">{task?.total_working_hour}</div>
        </div>
        <div className="flex justify-between gap-x-2">
          <div className="flex-1"></div>

          <Link onClick={() => onEditTask(task, milestoneId)} to={''}>
            Update Task
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskItemTemplate;
