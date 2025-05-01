import { SettingOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import clsx from 'clsx';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AppButton } from '@/core/components';
import { DateFormat } from '@/core/enums';
import { ActionType, JobMilestone, JobTask } from '@/core/types';
import { FormatHelper, ModalHelper } from '@/utils/helpers';
import { useRole } from '@/core/hooks';
import TaskModalTemplate from './TaskModalTemplate';
import TaskItemTemplate from './TaskItemTemplate';
import { ListAddMilestone } from './CardMilestoneTemplate';

type MilestoneItemProps = {
  children: React.ReactNode;
  data: any;
  onEditMilestone: (data: JobMilestone) => void;
  list: ListAddMilestone;
};

const MilestoneItem: React.FC<MilestoneItemProps> = ({ children, data, onEditMilestone, list }) => {
  const { t } = useTranslation(['message']);

  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('add');
  const [dataSelected, setDataSelected] = useState<any>(data);
  const [milestoneSelected, setMilestoneSelected] = useState<string>('');
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
    if (!data) return;
    if (key === 'delete') {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'milestone' }),
        async onOk() {
          const newList = list.milestone.filter((e: any) => e.id !== data.id);
          list.setMilestone(newList);
          toast.success(t(['success']));
        }
      });
    } else if (key === 'edit') {
      onEditMilestone(data);
    }
  };
  const onAddTask = () => {
    setOpen(true);
  };
  const onEditTask = useCallback((task: JobTask, milestone: string) => {
    setOpen(true);
    setActionType('edit');
    setDataSelected(task);
    setMilestoneSelected(milestone);
  }, []);

  return (
    <>
      <div>
        <div className={clsx('rounded-t-md bg-[#8f8a8a] px-2 py-1')}>
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
        {data?.job_tasks?.map((item: any, index: number) => (
          <TaskItemTemplate
            key={`${item.id}_${index}`}
            data={item}
            list={list}
            milestoneId={data.id}
            onEditTask={onEditTask}
          />
        ))}

        <AppButton style={{ borderRadius: '0 0 5px 5px', borderTop: 'none' }} block onClick={onAddTask} iconType="add">
          Add Task
        </AppButton>
      </div>
      <TaskModalTemplate
        open={open}
        onCancel={() => setOpen(false)}
        data={dataSelected}
        list={list}
        actionType={actionType}
        milestoneSelected={milestoneSelected}
      />
    </>
  );
};

export default memo(MilestoneItem);
