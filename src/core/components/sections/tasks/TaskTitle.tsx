import { Divider } from 'antd';
import React from 'react';

import { useJobTask } from '@/store';

type TaskTitleProps = {};

const TaskTitle: React.FC<TaskTitleProps> = () => {
  const { jobTaskInfo } = useJobTask();
  return <Divider>{jobTaskInfo?.name}</Divider>;
};

export default TaskTitle;
