import { Pagination, PaginationProps, Select } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppSelect from './AppSelect';

interface AppPaginationProps extends PaginationProps {
  onSizeChange?: (page_number: number, size: number) => void;
}

const AppPagination: React.FC<AppPaginationProps> = ({ onSizeChange, pageSizeOptions, ...props }) => {
  const { t } = useTranslation(['common']);
  const [options] = useState(pageSizeOptions ?? [10, 20, 30]);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 10);

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <i className="fa-solid fa-angle-left" />;
    }
    if (type === 'next') {
      return <i className="fa-solid fa-angle-right" />;
    }
    return originalElement;
  };

  const onChangeSize = (value: number) => {
    if (props?.total && props?.current) {
      const maxPage = Math.ceil(props.total / value);
      onSizeChange?.(props.current <= maxPage ? props.current : maxPage, value);
      setPageSize(value);
    }
  };
  return (
    <div className="app-pagination flex items-center justify-end">
      <div className="flex items-center gap-x-1">
        {t('row per page')}:
        <AppSelect
          value={pageSize}
          onChange={onChangeSize}
          variant={'borderless'}
          className="app-pagination__option !w-16"
        >
          {options.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </AppSelect>
      </div>
      <Pagination
        size="default"
        showTotal={(total, range) => t('pagination', { from: range[0], to: range[1], total: total })}
        className="pagination-custom"
        itemRender={itemRender}
        showSizeChanger={false}
        onChange={onSizeChange}
        {...props}
      />
    </div>
  );
};

export default AppPagination;
