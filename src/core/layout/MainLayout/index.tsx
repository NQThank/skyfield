import { APP_NAME } from '@/core/constants';
import React from 'react';
import { Helmet } from 'react-helmet';

interface MainLayoutProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  filter?: React.ReactNode;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ title, actions, filter, children }) => {
  return (
    <>
      <Helmet>
        <title>{`${APP_NAME} - ${title}`}</title>
      </Helmet>
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div>{actions}</div>
        </div>
        {filter && <div>{filter}</div>}
        <div>{children}</div>
      </div>
    </>
  );
};

export default MainLayout;
