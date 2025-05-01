import { Card } from 'antd';
import React, { useMemo } from 'react';

import { InfoItem } from '@/core/types';
import ViewInfos from '../../shared/ViewInfos';
import TaskStatus from './TaskStatus';

type MilestoneInfoProps = {};

const MilestoneInfo: React.FC<MilestoneInfoProps> = () => {
  const infos = useMemo<InfoItem<any>[]>(
    () => [
      {
        label: 'Inprogress',
        dataIndex: 'inprogress',
        render() {
          return '60%';
        }
      },
      {
        label: 'Task Status',
        dataIndex: 'status',
        render() {
          return <TaskStatus status={'completed'} />;
        }
      },
      {
        label: 'Subtotal Man Hours',
        dataIndex: 'hours',
        render() {
          return '100 hours';
        }
      }
    ],
    []
  );
  return (
    <Card>
      <h2>Milestone 01</h2>
      <ViewInfos items={infos} />
    </Card>
  );
};

export default MilestoneInfo;
