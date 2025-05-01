import clsx from 'clsx';
import React from 'react';

import { AppTag } from '@/core/components';
import { UserStatusType } from '@/core/types';

interface EmployeeStatusTagProps {
  status: UserStatusType;
  className?: string;
}

const EmployeeStatusTag: React.FC<EmployeeStatusTagProps> = ({ status, className }) => {
  return (
    <AppTag
      className={clsx(
        'capitalize',
        { '!bg-green-100 !text-green-400': status === 'active' },
        { '!bg-red-100 !text-red-400': status === 'inactive' },
        className
      )}
      bordered={false}
    >
      {status}
    </AppTag>
  );
};

export default EmployeeStatusTag;
