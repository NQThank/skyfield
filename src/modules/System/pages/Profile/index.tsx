import { Tab } from 'rc-tabs/lib/interface';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';

import { AppTabs } from '@/core/components';
import { APP_NAME } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import ChangePassword from './components/ChangePassword';
import ProfileInfo from './components/ProfileInfo';

const ProfilePage = () => {
  const items = useMemo<Tab[]>(
    () => [
      {
        label: 'Profile',
        key: 'profile',
        children: <ProfileInfo />
      },
      {
        label: 'Change Password',
        key: 'change-password',
        children: <ChangePassword />
      }
    ],
    []
  );
  return (
    <>
      <Helmet>
        <title> {`${APP_NAME} - ${PathLabelEnum.profile}`}</title>
      </Helmet>
      <AppTabs defaultActiveKey="1" items={items} />
    </>
  );
};

export default ProfilePage;
