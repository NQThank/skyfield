import clsx from 'clsx';
import React, { memo, useMemo } from 'react';

import { MILESTONE_STATUSES } from '@/core/constants';
import { MilestoneStatus } from '@/core/types';

interface JobMilestoneItemProps {
  status: MilestoneStatus;
  name: string;
}

const JobMilestoneItem: React.FC<JobMilestoneItemProps> = ({ status, name }) => {
  const icon = useMemo(() => {
    switch (status) {
      case 'init':
        return <i className={clsx(`fa-light fa-circle-check text-milestone-not_started`)} />;
      case 'scheduled':
        return <i className={clsx(`fa-solid fa-spinner text-milestone-in_progress`)} />;
      case 'done':
        return <i className={clsx(`fa-sharp fa-solid fa-circle-check text-milestone-completed`)} />;
      default:
        return '';
    }
  }, [status]);

  return (
    <div className="flex items-center justify-between gap-x-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-x-2">
          {icon}
          <span>{name}</span>
        </div>
      </div>
      <div className="font-semibold">{MILESTONE_STATUSES?.[status] || ''}</div>
    </div>
  );
};

export default memo(JobMilestoneItem);
