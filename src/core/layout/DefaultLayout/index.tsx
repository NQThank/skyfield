import { Divider, FloatButton, Layout } from 'antd';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import PathURL from '@/core/class/PathURL';
import { useAppSelector } from '@/core/hooks';
import BreadCrumb from './components/BreadCrum';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const { Content, Sider } = Layout;
interface DefaultLayoutProps {}
const DefaultLayout: React.FC<DefaultLayoutProps> = () => {
  const [transition] = useState('!transition-all !duration-[0.2s] !ease');
  const { pathname } = useLocation();

  const { isCollapsed, user } = useAppSelector((state) => state.auth);

  const isShowBreadCrumb = useMemo(() => {
    return pathname !== PathURL.dashboard;
  }, [pathname]);

  if (!user) {
    return <Navigate to={`/${PathURL.login}`} />;
  }

  return (
    <Layout className="default-layout !bg-white">
      <Header />
      <Layout>
        <Sider
          className={clsx(
            'sider-wrapper',
            '!fixed bottom-0 left-0 top-16 overflow-y-auto overflow-x-hidden border-r shadow-md',
            transition
          )}
          trigger={null}
          width={230}
          collapsedWidth={80}
          collapsed={isCollapsed}
        >
          <Sidebar />
        </Sider>
        <Layout
          className={clsx(
            'h-screen overflow-hidden !bg-[#F0F1F7] pt-16',
            transition,
            isCollapsed ? 'pl-[80px]' : 'pl-[230px]'
          )}
        >
          <Content className="flex flex-col">
            {isShowBreadCrumb && (
              <>
                <BreadCrumb className="!px-4 !py-2" />
                <Divider className="!m-0" />
              </>
            )}

            <div className="default-layout__content min-h-0 flex-1 overflow-y-auto bg-[#F0F1F7] px-6 py-2" id="content">
              <Outlet />
              <FloatButton.BackTop
                icon={<i className="fa-regular fa-arrow-up-to-line" />}
                target={() => document.getElementById('content')!}
                visibilityHeight={100}
                tooltip="Back To Top"
                className="bottom-6"
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;
