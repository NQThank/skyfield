import { Button, ButtonProps } from 'antd';
import React, { useMemo } from 'react';

import { IconType } from '@/core/types';

type AppButtonProps = ButtonProps & {
  iconType?: IconType;
};

const AppButton: React.FC<AppButtonProps> = ({ iconType, icon, ...props }) => {
  const iconButton = useMemo(() => {
    if (icon) return icon;
    switch (iconType) {
      case 'add':
        return <i className="fa-sharp fa-solid fa-plus" />;
      case 'edit':
        return <i className="fa-sharp fa-solid fa-pen" />;
      case 'delete':
        return <i className="fa-solid fa-trash text-red-500" />;
      case 'search':
        return <i className="fa-sharp fa-regular fa-magnifying-glass" />;
      case 'download':
        return <i className="fa-sharp fa-regular fa-download" />;
    }
  }, [icon, iconType]);

  return <Button {...props} icon={iconButton} />;
};

export default AppButton;
