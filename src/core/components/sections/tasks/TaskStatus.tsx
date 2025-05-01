import { Badge } from 'antd';
import React, { useMemo } from 'react';
import colors from 'tailwindcss/colors';

import { TaskStatusEnum } from '@/core/enums';
import { JobTaskStatus } from '@/core/types';

type TaskStatusProps = {
  status?: JobTaskStatus;
};

const TaskStatus: React.FC<TaskStatusProps> = ({ status = 'not_started' }) => {
  const color = useMemo(() => {
    switch (status) {
      case 'not_started':
        return colors.gray['500'];
      case 'in_progress':
        return colors.blue['500'];
      case 'completed':
        return colors.green['500'];

      default:
        return colors.gray['500'];
    }
  }, [status]);
  return <Badge status="processing" color={color} text={TaskStatusEnum[status]} />;
};

export default TaskStatus;
