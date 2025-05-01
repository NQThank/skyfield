import React, { useMemo } from 'react';

import { AppTag } from '@/core/components';
import { CustomerStatusType } from '@/core/types';
import { CustomerStatus } from '@/core/constants';
import { clsx } from 'clsx';

type CustomerStatusTagProps = {
  status: CustomerStatusType;
};

const CustomerStatusTag: React.FC<CustomerStatusTagProps> = ({ status }) => {
  const label = useMemo(() => {
    return CustomerStatus.find((item) => item.value === status)?.label ?? '';
  }, [status]);

  const color = useMemo<string>(() => {
    switch (status) {
      case 'pending':
        return 'text-orange-400 bg-orange-100';
      case 'active':
        return 'text-green-400 bg-green-100';
      case 'inactive':
        return 'text-red-400 bg-red-100';
      case 'disabled':
        return 'text-gray-400 bg-gray-100';
    }
  }, [status]);
  return (
    <AppTag className={clsx(color)} bordered={false}>
      {label}
    </AppTag>
  );
};

export default CustomerStatusTag;
