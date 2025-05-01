import { Tabs, TabsProps } from 'antd';
import React from 'react';

type AppTabsProps = TabsProps;

const AppTabs: React.FC<AppTabsProps> = ({ ...props }) => {
  return <Tabs {...props} className="app-tabs" />;
};

export default AppTabs;
