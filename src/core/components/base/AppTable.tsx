import { Button, Checkbox, Popover, Table, TableProps, Tooltip } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { ColumnsType } from 'antd/es/table';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { Action, IconType, Pagination } from '@/core/types';
import AppButton from './AppButton';
import AppPagination from './AppPagination';

type AppTableProps = TableProps<any> & {
  page_number?: number;
  page_size?: number;
  total_elements?: number;
  onChangePagination?: (payload: Pagination) => void;
  showPagination?: boolean;
  enableExpandable?: boolean;
  actions?: Action[];
  showColumnNo?: boolean;
  showToggleColumn?: boolean;
};

type ActionComponentType = {
  action: Action;
  onClick: () => void;
};

const AppTable: React.FC<AppTableProps> = ({
  page_number = 1,
  page_size = 10,
  total_elements = 0,
  showPagination = true,
  enableExpandable = false,
  actions,
  showColumnNo = true,
  showToggleColumn = false,
  columns,
  ...props
}) => {
  const { t } = useTranslation(['common']);

  const [scrollY, setScrollY] = useState(false);
  const [widthTable] = useState(800);
  const [heightTable] = useState(500);
  const [pageNumber, setPageNumber] = useState(page_number);
  const [pageSize, setPageSize] = useState(page_size);
  const [pageSizeOptions] = useState([10, 50, 100]);
  const [columnsChecked, setColumnsChecked] = useState<CheckboxValueType[]>([]);
  const [columnsShow, setColumnsShow] = useState<ColumnsType<any>>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (props?.dataSource && props.dataSource?.length > 10) {
      setScrollY(true);
    } else {
      setScrollY(false);
    }
  }, [props?.dataSource]);

  useEffect(() => {
    const page_size = Number(searchParams.get('page_size'));
    const page_number = Number(searchParams.get('page_number'));

    if (!page_size) return;
    const _pageSize = pageSizeOptions.includes(page_size) ? page_size : 10;
    setPageSize(pageSizeOptions.includes(page_size) ? page_size : 10);
    if (page_number) {
      setPageNumber(page_number <= Math.ceil(total_elements / _pageSize) ? page_number : 1);
    }
  }, [searchParams, pageSizeOptions, total_elements]);

  const _columns = useMemo<ColumnsType<any>>(
    () => [
      ...(showColumnNo
        ? ([
            {
              title: 'No.',
              dataIndex: 'no',
              key: 'no',
              render(_, _record, index: number) {
                return (pageNumber - 1) * pageSize + index + 1;
              },
              width: 60,
              ellipsis: true
            }
          ] as ColumnsType<any>)
        : []),
      ...(columns ?? []),
      ...(actions && actions.length > 0
        ? ([
            {
              title: 'Action',
              dataIndex: 'action',
              key: 'action',
              align: 'center',
              render: (_, record, index) => {
                return (
                  <div className="flex justify-center gap-x-2">
                    {actions.map((action) => (
                      <ActionComponent
                        key={action.type}
                        action={action}
                        onClick={() => action.callback(record, index)}
                      />
                    ))}
                  </div>
                );
              },
              width: actions.length === 2 ? 120 : 80,
              ellipsis: true,
              fixed: 'right'
            }
          ] as ColumnsType<any>)
        : [])
    ],
    [pageNumber, pageSize, columns, actions, showColumnNo]
  );
  useEffect(() => {
    setColumnsChecked(_columns.map((item) => item.key as string));
  }, [_columns]);

  useEffect(() => {
    const _columnsFilter = _columns.filter((item) => item.key && columnsChecked.includes(item.key as string));
    setColumnsShow(_columnsFilter);
  }, [_columns, columnsChecked]);

  const expandIcon = useCallback(
    ({
      expanded,
      onExpand,
      record
    }: {
      expanded: boolean;
      onExpand: (record: any, event: React.MouseEvent<HTMLElement>) => void;
      record: any;
    }) => {
      return (
        <i
          className={clsx('fa-regular cursor-pointer', expanded ? 'fa-chevron-down' : 'fa-chevron-right')}
          onClick={(e) => onExpand(record, e)}
        />
      );
    },
    []
  );

  const handleChangePagination = (page_number: number, page_size: number) => {
    setSearchParams((preSearchParams) => ({ ...preSearchParams, page_number, page_size }));
    setPageNumber(page_number);
    setPageSize(page_size);
  };

  const onChangeChecked = useCallback((checkedValue: CheckboxValueType[]) => {
    setColumnsChecked(checkedValue);
  }, []);

  const title = useCallback(() => {
    if (!showToggleColumn) return;
    return (
      <div className="relative flex justify-end">
        <Popover
          getPopupContainer={(triggerNode) => triggerNode.parentElement!}
          content={
            <div>
              <Checkbox.Group value={columnsChecked} onChange={onChangeChecked}>
                <div className="flex flex-col gap-y-4">
                  {_columns.map((item) => (
                    <div key={item.key}>
                      <Checkbox value={item.key}>{item.title as React.ReactNode}</Checkbox>
                    </div>
                  ))}
                </div>
              </Checkbox.Group>
            </div>
          }
          placement="leftBottom"
          trigger={['click']}
        >
          <Tooltip title={'Toggle Columns'}>
            <Button
              icon={<i className="fa-sharp fa-solid fa-filter-list fa-lg" />}
              type="text"
              shape="circle"
              size="large"
            />
          </Tooltip>
        </Popover>
      </div>
    );
  }, [_columns, columnsChecked, onChangeChecked, showToggleColumn]);

  return (
    <div className="flex flex-col gap-y-4">
      <Table
        locale={{ emptyText: <span className="inline-block py-8 font-normal text-zinc-400">{t('no data')}</span> }}
        rowKey={'id'}
        pagination={false}
        scroll={scrollY ? { y: heightTable, x: widthTable } : { x: widthTable }}
        rowClassName={(_, index) => {
          return index % 2 ? 'row-odd' : 'row-even';
        }}
        className={clsx({ 'hide-title shadow-md': !showToggleColumn })}
        expandable={
          enableExpandable
            ? {
                ...props.expandable,
                expandIcon
              }
            : {}
        }
        columns={columnsShow}
        title={title}
        {...props}
      />
      {showPagination && total_elements > 0 && (
        <AppPagination
          pageSize={pageSize}
          current={pageNumber}
          total={total_elements}
          pageSizeOptions={pageSizeOptions}
          onChange={handleChangePagination}
          onSizeChange={handleChangePagination}
        />
      )}
    </div>
  );
};

const ActionComponent: React.FC<ActionComponentType> = ({ action, onClick }) => {
  const iconType = useMemo<IconType | undefined>(() => {
    switch (action.type) {
      case 'edit':
        return 'edit';
      case 'delete':
        return 'delete';
      case 'download':
        return 'download';

      default:
        break;
    }
  }, [action.type]);
  return (
    <Tooltip title={action.label} key={`${action.label}`}>
      <AppButton iconType={iconType} type="text" shape="circle" onClick={onClick} />
    </Tooltip>
  );
};

export default AppTable;
