import React from 'react';

import { AppTag } from '@/core/components';

interface ExpandRowItemProps {
  title: string;
  children: React.ReactNode;
}

const ExpandRowItem: React.FC<ExpandRowItemProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex justify-center">
        <AppTag>{title}</AppTag>
      </div>
      {children}
    </div>
  );
};

export default ExpandRowItem;
