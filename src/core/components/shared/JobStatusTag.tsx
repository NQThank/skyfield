import React from 'react';

import { JobStatusEnum } from '@/core/enums';
import { JobTaskStatus } from '@/core/types';
import AppTag from '../base/AppTag';
import { DataHelper } from '@/utils/helpers';

interface JobStatusTagProps {
  status: JobTaskStatus;
}

const JobStatusTag: React.FC<JobStatusTagProps> = ({ status }) => {
  return <AppTag>{DataHelper.getEnumKeyByValue(status, JobStatusEnum)}</AppTag>;
};

export default JobStatusTag;
