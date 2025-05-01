import { Checkbox, Spin } from 'antd';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Collapse, Space } from 'antd';

import CardDetail from './CardDetail';
import clsx from 'clsx';
import './index.scss';
import { useParams } from 'react-router-dom';
import { JobService } from '@/core/services';
import { LogHelper } from '@/utils/helpers';

type CheckInCheckOutType = {
  status: string;
  date: string;
};
type CardJobDailyReportProps = {
  data: CheckInCheckOutType[];
};
function formatDateTime(input: string): string {
  const year = input.substring(0, 4);
  const month = input.substring(4, 6);
  const day = input.substring(6, 8);
  const hour = input.substring(8, 10);
  const minute = input.substring(10, 12);

  return `${year}/${month}/${day} ${hour}:${minute}`;
}
const CardJobDailyReport: React.FC<CardJobDailyReportProps> = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [CheckinCheckout, setCheckinCheckout] = useState<any>([]);

  const fetchCheckinCheckout = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(false);
      const { success, data } = await JobService.getCheckinCheckout(id);
      if (success && data) {
        setCheckinCheckout(data);
      }
    } catch (error) {
      LogHelper.logError(error);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchCheckinCheckout();
  }, [fetchCheckinCheckout]);
  return (
    <CardDetail className="Checkin_Checkout " title="Check in / Check out">
      <Spin spinning={loading}>
        <Space direction="vertical">
          {CheckinCheckout.map((task: { job_id: React.Key | null | undefined; status: string }, index: number) => (
            <Collapse
              collapsible={task?.status === 'completed' ? 'header' : 'icon'}
              key={`${task.job_id}_${index}`}
              className={clsx('', {
                'bg-orange-400': task?.status === 'general_in_progress',
                'bg-green-600': task?.status === 'completed',
                // 'bg-gray-600': task?.status === 'not_started',
                'bg-gray-600': !['general_in_progress', 'completed'].includes(task?.status)
              })}
              items={[
                {
                  label: <TaskContent data={task} />,
                  children: <SubTaskContent data={task} />
                }
              ]}
            />
          ))}
        </Space>
      </Spin>
    </CardDetail>
  );
};

export default memo(CardJobDailyReport);

const TaskContent = (data: any) => {
  return (
    <div className="relative text-white">
      {data.data.status === 'completed' && (
        <Checkbox className="absolute right-0 scale-150" checked={true} disabled={true} />
      )}
      <h3>{data.data.job_name}</h3>
      <p>Date : {formatDateTime(data.data.created_at)}</p>
      <p>Engineer : {data.data.engineer}</p>
      <p>Location : {data.data.location}</p>
    </div>
  );
};
const SubTaskContent = (data: any) => {
  return (
    <div
      className={clsx(' p-4 text-white', {
        'bg-orange-400': data.data?.status === 'inprogess',
        'bg-green-600': data.data?.status === 'completed',
        'bg-gray-600': data.data?.status === 'not_started'
      })}
      style={{ borderRadius: '0 0 5px 5px' }}
    >
      {data?.data?.job_sub_tasks &&
        data?.data?.job_sub_tasks.map((subtask: any) => (
          <div key={subtask.id} className="flex gap-x-4">
            <p className="w-28">{subtask.name}</p>
            <Checkbox checked={subtask.status === 'completed' ? true : false} disabled={true} />
            <p className="w-28">{subtask.name}</p>
          </div>
        ))}
    </div>
  );
};
