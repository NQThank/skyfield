import { Tooltip, Typography } from 'antd';
import React, { memo } from 'react';

import { AppButton } from '@/core/components';
import { useAppDispatch } from '@/core/hooks';
import { deleteSubTaskTemplate, updateNameSubTaskTemplate } from '../template-form.slice';

type SubTaskEditableProps = {
  name: string;
  id: string;
  uid?: string;
  isGroup: boolean;
};

const { Text } = Typography;

const SubTaskEditable: React.FC<SubTaskEditableProps> = ({ id, name, isGroup, uid }) => {
  const dispatch = useAppDispatch();

  const onDeleteSubTask = () => {
    dispatch(deleteSubTaskTemplate({ uid, id, isGroup }));
  };

  return (
    <div className="flex items-center justify-between">
      <Text
        editable={{
          autoSize: false,
          icon: <i className="fa-solid fa-pen-to-square fa-sm" />,
          onChange: (value) => {
            dispatch(updateNameSubTaskTemplate({ name: value, isGroup, id }));
          }
        }}
        className="[&.ant-typography-edit-content]: !start-0 !mt-0"
      >
        {name}
      </Text>
      <Tooltip title="Delete">
        <AppButton type="text" shape="circle" iconType="delete" onClick={onDeleteSubTask} />
      </Tooltip>
    </div>
  );
};

export default memo(SubTaskEditable);
