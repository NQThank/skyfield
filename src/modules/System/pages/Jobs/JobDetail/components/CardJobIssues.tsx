import { Divider } from 'antd';
import React, { memo } from 'react';

import { AppEmpty } from '@/core/components';
import { JobIssue } from '@/core/types';
import CardDetail from './CardDetail';

type CardJobIssuesProps = {
  data: JobIssue[];
};

const CardJobIssues: React.FC<CardJobIssuesProps> = ({ data }) => {
  return (
    <CardDetail title="Job Notes">
      {data?.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          {data.map((item) => {
            return (
              <>
                <div key={item.id} className="flex flex-col gap-y-2">
                  <span>{item.name}</span>
                  <span className="text-sm text-gray-600">{item.description ?? ''}</span>
                </div>
                {<Divider className="!my-1 last:hidden" />}
              </>
            );
          })}
        </div>
      ) : (
        <AppEmpty />
      )}
    </CardDetail>
  );
};

export default memo(CardJobIssues);
