import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, CollapseProps } from 'antd';
import React, { useCallback } from 'react';

interface AppCollapseProps extends CollapseProps {}

const AppCollapse: React.FC<AppCollapseProps> = (props) => {
  const expandIcon = useCallback(({ isActive }: { isActive?: boolean }): React.ReactNode => {
    return <CaretRightOutlined rotate={isActive ? 90 : 0} />;
  }, []);

  return <Collapse expandIcon={expandIcon} {...props} />;
};

export default AppCollapse;
