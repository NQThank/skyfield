import { JobDetail } from '@/core/types';
import React from 'react';
import ExpandRowItem from './ExpandRowItem';
import JobMilestoneItem from './JobMilestoneItem';
import { Progress } from 'antd';
import JobIssueItem from './JobIssueItem';

interface ExpandRowProps {
  data: JobDetail | null;
}

const ExpandRow: React.FC<ExpandRowProps> = ({ data }) => {
  return (
    <div>
      {data ? (
        <div className="flex">
          <div className="flex-1 border-r px-2">
            <ExpandRowItem title="Job Milestones">
              {data.milestones.map((item) => (
                <JobMilestoneItem key={item.id} name={item.name} status={item.status} />
              ))}
              {data?.milestones?.length > 0 && <Progress percent={data?.process ?? 0} />}
            </ExpandRowItem>
          </div>
          <div className="flex-1 border-r px-2">
            <ExpandRowItem title="Daily Reports">Daily Reports</ExpandRowItem>
          </div>
          <div className="flex-1 px-2">
            <ExpandRowItem title="Job Notes">
              <div className="flex flex-col gap-y-2">
                {data.jobIssues.map((item) => (
                  <div key={item.id} className="border-b border-gray-300 last:border-none">
                    <JobIssueItem name={item.name} employee_id={item.user_id} />
                  </div>
                ))}
              </div>
            </ExpandRowItem>
          </div>
        </div>
      ) : (
        'No data'
      )}
    </div>
  );
};

export default ExpandRow;
