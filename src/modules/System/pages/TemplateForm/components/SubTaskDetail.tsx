import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { memo, useMemo, useState } from 'react';

import { AppTable } from '@/core/components';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { EquipmentSubTask, ITemplateItem } from '@/core/types';
import { toggleOpenModal } from '../template-form.slice';
import TaskDroppable from './TaskDroppable';
import TemplateItemEditForm from './TemplateItemEditForm';
import { EquipmentTypes } from '@/core/constants';

interface SubTaskDetailProps {
  items: ITemplateItem[];
  id: string;
  isPreview?: boolean;
}

const SubTaskDetail: React.FC<SubTaskDetailProps> = ({ items, id, isPreview }) => {
  const [collapse, setCollapse] = useState(true);

  const {
    template: { equipmentsSubTask },
    isOpen
  } = useAppSelector((state) => state.templateForm);
  const dispatch = useAppDispatch();

  const columns = useMemo<ColumnsType<EquipmentSubTask>>(
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
  return (
    <>
      <div className="relative">
        <Row gutter={[24, 12]} className="pr-6">
          <Col span={collapse ? 24 : 12}>
            <TaskDroppable items={items} id={id} isPreview={isPreview} />
          </Col>
          <Col span={collapse ? 0 : 12}>
            <AppTable columns={columns} dataSource={equipmentsSubTask[id] || []} />
          </Col>
        </Row>
        <div className="absolute right-1 top-0 z-[2] cursor-pointer" onClick={() => setCollapse(!collapse)}>
          {collapse ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </div>
      </div>
      <TemplateItemEditForm
        open={isOpen['template-item-form-edit']}
        onCancel={() => dispatch(toggleOpenModal('template-item-form-edit'))}
      />
    </>
  );
};

export default memo(SubTaskDetail);
