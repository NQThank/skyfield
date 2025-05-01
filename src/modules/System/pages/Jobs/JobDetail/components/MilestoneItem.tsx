import { SettingOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import clsx from 'clsx';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppButton } from '@/core/components';
import { DateFormat } from '@/core/enums';
import { JobService } from '@/core/services';
import { JobMilestone } from '@/core/types';
import { FormatHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import TaskItem from './TaskItem';
import TaskModal from './TaskModal';
import { useRole } from '@/core/hooks';

type MilestoneItemProps = {
  children: React.ReactNode;
  data: any;
  fetchData?: () => void;
  onEdit?: (data: JobMilestone) => void;
};

const MilestoneItem: React.FC<MilestoneItemProps> = ({ children, data, fetchData, onEdit }) => {
  const { id } = useParams();
  const { t } = useTranslation(['message']);

  const [open, setOpen] = useState(false);

  const { isAdmin, isPM } = useRole();

  const items: MenuProps['items'] = useMemo(() => {
    const _items = [
      {
        label: 'Edit',
        key: 'edit'
      }
    ];
    if (isAdmin || isPM) {
      _items.push({
        label: 'Delete',
        key: 'delete'
      });
    }
    return _items;
  }, [isAdmin, isPM]);
  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (!id || !data) return;
    if (key === 'delete') {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'milestone' }),
        async onOk() {
          try {
            const res = await JobService.deleteMilestone(id, data.id);
            if (res.success) {
              toast.success(t(['message:success']));
              fetchData?.();
            }
          } catch (error) {
            LogHelper.logError(error);
          }
        }
      });
    } else if (key === 'edit') {
      onEdit?.(data);
    }
  };
  const onAddTask = () => {
    setOpen(true);
  };
  return (
    <>
      <div>
        <div
          className={clsx('rounded-t-md px-2 py-1', {
            'bg-[#fb923c]': data?.status === 'in_progress' || data?.status === 'forecast',
            'bg-[#8f8a8a]': data?.status === 'not_started',
            'bg-[#55ce63]': data?.status === 'completed'
          })}
        >
          <div className="flex items-center justify-between">
            <h3 className="flex-1 text-white">{data?.name || ''}</h3>
            <Dropdown menu={{ items, onClick }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()}>
                <SettingOutlined className="text-white" />
              </a>
            </Dropdown>

            {children}
          </div>
          <div className="flex items-center justify-between text-white">
            <span>End Date</span>
            <span>{FormatHelper.formatDate(data?.end_date, DateFormat['dddDD/MM/YYYY'])}</span>
          </div>
        </div>
        {data?.job_tasks?.map((item: any) => (
          <TaskItem key={item.task_id} data={item} milestoneId={data.id} fetchData={fetchData} />
        ))}

        <AppButton style={{ borderRadius: '0 0 5px 5px', borderTop: 'none' }} block onClick={onAddTask} iconType="add">
          Add Task
        </AppButton>
      </div>
      <TaskModal open={open} onCancel={() => setOpen(false)} data={data} fetchData={fetchData} />
    </>
  );
};

export default memo(MilestoneItem);
