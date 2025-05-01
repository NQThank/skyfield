import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import clsx from 'clsx';
import React, { memo, useEffect, useMemo, useState } from 'react';

import { EquipmentTypes, pathNameTaskTemplate } from '@/core/constants';
import { JobSubTaskEquipment, TJobTemplateItemSubTask } from '@/core/types';
import AppTable from '../../base/AppTable';
import SubTaskItemListDroppable from './SubTaskItemListDropable';
import { useJobTask } from '@/store';
import { JobTaskService } from '@/core/services';
import { useLocation, useParams } from 'react-router-dom';

interface SubTaskItemDroppableProps {
  items: TJobTemplateItemSubTask[];
  id: string;
  equipments: JobSubTaskEquipment[];
  drag_status: boolean;
}

const SubTaskItemDroppable: React.FC<SubTaskItemDroppableProps> = ({ items, id, equipments, drag_status }) => {
  const { jobId, milestoneId, id: taskId } = useParams();
  const { jobTemplateItemsSubTaskMap, setTemplateItemSubTask } = useJobTask();

  const [collapse, setCollapse] = useState(true);
  const [_, setLoading] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (jobTemplateItemsSubTaskMap[id]) return;
    if (!jobId || !milestoneId || !taskId) return;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const result = await JobTaskService.getItemsSubTask(jobId, milestoneId, taskId, id);
        setTemplateItemSubTask({ [id]: result.data ?? [] });
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [jobTemplateItemsSubTaskMap, id, jobId, milestoneId, taskId, setTemplateItemSubTask]);

  const columns = useMemo<ColumnsType<JobSubTaskEquipment>>(
    () => [
      {
        title: 'Name',
        key: 'name',
        dataIndex: 'equipment_name',
        ellipsis: true,
        width: '40%'
      },
      {
        title: 'Type',
        key: 'type',
        dataIndex: 'equipment_type',
        ellipsis: true,
        width: '30%',
        render(value) {
          return EquipmentTypes.find((item) => item.value === value)?.label ?? '';
        }
      },
      {
        title: 'Quantity',
        key: 'quantity',
        dataIndex: 'quantity',
        width: '30%'
      }
    ],
    []
  );

  const buildItems = useMemo(
    () => (
      <div className="relative">
        <Row>
          <Col span={collapse ? 24 : 12}>
            <SubTaskItemListDroppable items={items} subTaskId={id} drag_status={drag_status} />
          </Col>
          <Col span={collapse ? 0 : 12}>
            <AppTable columns={columns} dataSource={equipments} />
          </Col>
        </Row>
        {!pathname.includes(pathNameTaskTemplate) && (
          <div className="absolute right-1 top-0 z-[2] cursor-pointer" onClick={() => setCollapse(!collapse)}>
            {collapse ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          </div>
        )}
      </div>
    ),
    [collapse, columns, drag_status, equipments, id, items, pathname]
  );

  return <div className={clsx('min-h-40 w-full bg-white')}>{buildItems}</div>;
};

export default memo(SubTaskItemDroppable);
