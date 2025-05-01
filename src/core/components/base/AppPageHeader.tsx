import { Tooltip } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

const AppPageHeader: React.FC<PageHeaderProps> = ({ children, className, onBack }) => {
  const { t } = useTranslation(['common']);
  return (
    <div className={twMerge('flex items-center gap-x-4 text-xl font-semibold', className)}>
      <Tooltip title={t(['back'])}>
        <span className="flex h-6 w-6 cursor-pointer items-center justify-center" onClick={onBack}>
          <i className="fa-sharp fa-solid fa-arrow-left cursor-pointer text-xl" />
        </span>
      </Tooltip>
      {children}
    </div>
  );
};

export default AppPageHeader;
