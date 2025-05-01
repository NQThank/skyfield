import { Skeleton } from 'antd';
import React from 'react';

import { Box } from '@/core/components';
import { CommonHelper } from '@/utils/helpers';
import { useLocation } from 'react-router-dom';

interface CardDetailProps {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const CardDetail: React.FC<CardDetailProps> = ({ title, extra: action, children, className, loading = false }) => {
  const location = useLocation();
  return (
    <Box className={CommonHelper.cn('p-4', className)}>
      {loading ? (
        <Skeleton active title={false} paragraph={{ width: ['100%', '100%', '100%', '100%', '100%'], rows: 5 }} />
      ) : (
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <h3 className="truncate text-xl font-semibold">{title}</h3>
            {action}
          </div>
          <div
            className={`scrollbar ${
              !location.pathname.includes('/job-templates/') ? 'max-h-[400px]' : 'flex-wrap'
            } overflow-y-auto overflow-x-hidden`}
          >
            {children}
          </div>
        </div>
      )}
    </Box>
  );
};

export default CardDetail;
