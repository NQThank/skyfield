import React, { memo } from 'react';

interface JobIssueItemProps {
  name: string;
  employee_id: string;
}

export const JobIssueItem: React.FC<JobIssueItemProps> = ({ name, employee_id }) => {
  return (
    <div className="flex flex-col">
      <i>{name}</i>
      <div>
        <span>Report by: </span> <span className="font-semibold">{employee_id}</span>
      </div>
    </div>
  );
};

export default memo(JobIssueItem);
