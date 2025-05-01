import { faBuilding, faFilePen, faUsersGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, MenuProps } from 'antd';
import { MenuInfo, SelectInfo } from 'rc-menu/lib/interface';
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import PathURL from '@/core/class/PathURL';
import { LocalStorageKeyEnum, PathLabelEnum } from '@/core/enums';
import { useRole } from '@/core/hooks';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';

interface SidebarProps {}

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: keyof typeof PathLabelEnum,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type
  } as MenuItem;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useLocalStorage<string[]>(LocalStorageKeyEnum.selectedKey, [
    PathURL.dashboard
  ]);
  const [openKeys, setOpenKeys] = useLocalStorage<string[]>(LocalStorageKeyEnum.openKeys, []);
  const { pathname } = location;

  const { isEmployee } = useRole();

  useEffect(() => {
    const pathnames = pathname
      .split('/')
      .filter((item: string) => item)
      .join('/');
    if (pathnames === '') {
      setSelectedKeys([PathURL.dashboard]);
      return;
    }
    setSelectedKeys([pathnames]);
  }, [pathname, setSelectedKeys]);

  const items: MenuItem[] = useMemo(
    () => [
      getItem(PathLabelEnum.dashboard, PathURL.dashboard, <i className="fa-solid fa-gauge-simple-high" />),
      getItem(PathLabelEnum.operations, PathURL.operations, <FontAwesomeIcon icon={faFilePen} />, [
        getItem(PathLabelEnum.projects, PathURL.projects, <i className="fa-solid fa-folder-open" />),
        getItem(PathLabelEnum.teams, PathURL.teams, <i className="fa-solid fa-users" />),
        !isEmployee ? getItem(PathLabelEnum.employees, PathURL.employees, <i className="fa-solid fa-user" />) : null
        // getItem(PathLabelEnum.certificate, PathURL.certificate, <i className="fa-solid fa-users" />)
      ]),
      getItem(PathLabelEnum.crm, PathURL.crm, <FontAwesomeIcon icon={faUsersGear} />, [
        getItem(PathLabelEnum.markets, PathURL.markets, <i className="fa-solid fa-shop" />),
        getItem(PathLabelEnum.contact, PathURL.contact, <i className="fa-regular fa-address-book" />),
        getItem(PathLabelEnum.customers, PathURL.customers, <i className="fa-solid fa-user-secret" />),
        getItem(PathLabelEnum.sitelocations, PathURL.sitelocations, <i className="fa-sharp fa-solid fa-location-dot" />)
      ]),
      getItem(PathLabelEnum.company, PathURL.company, <FontAwesomeIcon icon={faBuilding} />, [
        getItem(PathLabelEnum.equipments, PathURL.equipments, <i className="fa-solid fa-computer-speaker" />),
        getItem(PathLabelEnum.documents, PathURL.documents, <i className="fa-solid fa-computer-speaker" />)
      ]),
      // getItem(PathLabelEnum.profile, PathURL.profile, <i className="fa-solid fa-id-badge"></i>),
      getItem(PathLabelEnum.settings, PathURL.settings, <i className="fa-solid fa-gear" />, [
        getItem(PathLabelEnum['task-templates'], PathURL.taskTemplates),
        getItem(PathLabelEnum['job-templates'], PathURL.jobTemplates)
      ])
    ],
    [isEmployee]
  );

  const onClickMenu = ({ key }: MenuInfo) => {
    navigate(`/${key}`);
  };

  const onSelect = ({ selectedKeys }: SelectInfo) => {
    setSelectedKeys(selectedKeys);
  };
  const onOpenChange = (openKeys: string[]) => {
    setOpenKeys(openKeys);
  };
  return (
    <Menu
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      mode="inline"
      theme="dark"
      items={items}
      onClick={onClickMenu}
      onSelect={onSelect}
      onOpenChange={onOpenChange}
    />
  );
};

export default Sidebar;
