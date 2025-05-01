import { Breadcrumb } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import PathURL from '@/core/class/PathURL';
import { BREAD_CRUMB_DISABLED, BREAD_CRUMB_HIDDEN } from '@/core/constants';
import { useAppSelector } from '@/core/hooks';

interface BreadCrumbProp {
  className?: string;
}

const generatePathLabel = (pathKey: string) => {
  if (pathKey === '') return PathURL.dashboard;
  return pathKey.replace('-', ' ');
};

const BreadCrumb: React.FC<BreadCrumbProp> = ({ className }) => {
  const { nameMap } = useAppSelector((state) => state.common);

  const location = useLocation();
  const items = useMemo(() => {
    const { pathname } = location;
    const pathnames: string[] = pathname.split('/').filter((item) => item);
    if (!pathnames.includes(PathURL.dashboard)) {
      pathnames.unshift(PathURL.dashboard);
    }
    let result: (ItemType & { isDisabled?: boolean })[] = [];
    let isNextDisable = false;
    pathnames.forEach((item, index) => {
      const nameMapLabel = nameMap[item];
      const isDisabled = BREAD_CRUMB_DISABLED.includes(item);
      if (BREAD_CRUMB_HIDDEN.includes(item)) return;
      result.push({
        title: nameMapLabel ?? generatePathLabel(item),
        href: pathnames.slice(1, index + 1).join('/'),
        className: nameMapLabel ? '' : 'text-sm capitalize',
        isDisabled: isDisabled || isNextDisable
      });
      isNextDisable = isDisabled;
    });

    result = result.map(({ href, isDisabled, ...item }, index) => {
      if (index === result.length - 1 || isDisabled) return item;
      return {
        ...item,
        title: <Link to={`/${href}`}>{item.title}</Link>
      };
    });

    return result;
  }, [location, nameMap]);

  return (
    <Breadcrumb
      items={items}
      className={twMerge(className)}
      separator={<i className="fa-sharp fa-solid fa-chevrons-right fa-xs text-black" />}
    />
  );
};

export default BreadCrumb;
