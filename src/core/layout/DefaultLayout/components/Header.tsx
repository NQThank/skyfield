import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Image, MenuProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { AppButton } from '@/core/components';
import { ActionKeyEnum, LocalStorageKeyEnum, PathLabelEnum } from '@/core/enums';
import { useAppDispatch, useAuth } from '@/core/hooks';
import { setCollapse, setUser } from '@/modules/Authentication/pages/Login/auth.slice';
import { StorageHelper } from '@/utils/helpers';

import logo from '@/assets/images/skynet_logo.png';
import PathURL from '@/core/class/PathURL';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const { t } = useTranslation(['button']);
  const [items, setItems] = useState<MenuProps['items']>([]);
  const navigate = useNavigate();
  const auth = useAuth();

  const dispatch = useAppDispatch();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === ActionKeyEnum.Logout) {
      StorageHelper.remove(LocalStorageKeyEnum.auth);
      dispatch(setUser(null));
      navigate(PathURL.login);
    }
    if (key === PathLabelEnum.profile) {
      navigate(PathURL.profile);
    }
  };

  useEffect(() => {
    setItems([
      {
        label: t(['logout']),
        key: ActionKeyEnum.Logout,
        icon: <i className="fa-regular fa-arrow-right-from-bracket" />
      },
      {
        label: PathLabelEnum.profile,
        key: PathLabelEnum.profile,
        icon: <i className="fa-solid fa-id-badge"></i>
      }
    ]);
  }, [t]);
  const menuProps = {
    items,
    onClick: handleMenuClick
  };

  return (
    <div className="fixed inset-x-0 top-0">
      <header className="h-16 bg-gradient-to-r from-gradient-from to-gradient-to shadow-sm">
        <div className="h-full px-4">
          <div className="flex h-full items-stretch justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-x-8">
              <div className="cursor-pointer text-2xl text-white" onClick={() => dispatch(setCollapse())}>
                <i className="fa-solid fa-bars" />
              </div>
              <Link to={'/dashboard'}>
                <Image className="mt-[-2px]" preview={false} src={logo} height={90} />
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <Dropdown menu={menuProps}>
                <AppButton ghost className="!border-none !text-white" size="large">
                  <div className="flex h-full items-center gap-x-2">
                    <Avatar icon={<UserOutlined />} />
                    <span>{auth?.last_name ?? 'Admin'}</span>
                    <DownOutlined />
                  </div>
                </AppButton>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
