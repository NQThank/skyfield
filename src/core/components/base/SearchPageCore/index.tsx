import { Form } from 'antd';
import { AxiosRequestConfig } from 'axios';
import clsx from 'clsx';
import { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppTable from '@/core/components/base/AppTable';
import { DEFAULT_PAGINATION } from '@/core/constants';
import {
  AppTableType,
  ColumnsTableType,
  ColumnsTableTypeExcludeNull,
  FilterItem,
  IResponseList,
  Pagination,
  SearchPageCoreRef,
  SearchParamsValue
} from '@/core/types';
import SearchPageCoreFilter from './SearchPageCoreFilter';

type SearchPageCoreProps<T> = {
  filterItems?: FilterItem[];
  columns: ColumnsTableType<T>;
  loadData: (params: SearchParamsValue, config?: AxiosRequestConfig) => Promise<IResponseList<T[]>>;
  onBeforeSearch?: (params: any) => void;
  header?: React.ReactNode;
  extra?: React.ReactNode;
  handleData?: (data: T[]) => void;
  extraFilter?: React.ReactNode;
  forceRefresh?: boolean;
  titlePage?: React.ReactNode;
} & AppTableType;

function SearchPageCoreInner<T>(
  {
    filterItems,
    columns,
    loadData,
    onBeforeSearch,
    header,
    handleData,
    extra,
    extraFilter,
    forceRefresh = false,
    titlePage,
    ...props
  }: SearchPageCoreProps<T>,
  ref: Ref<SearchPageCoreRef<T>>
) {
  const { t } = useTranslation([]);
  const [refreshLocal, setRefreshLocal] = useState(forceRefresh ?? false);

  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [filter, setFilter] = useState<Record<string, any>>({ page_number: 1, page_size: 10 });
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    fetchData
  }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = { ...filter, ...form.getFieldsValue(true) };
    onBeforeSearch?.(params);
    try {
      const res = await loadData(params);
      if (res.success) {
        handleData?.(res.data ?? []);
        setData(res.data ?? []);
        setPagination((pre) => ({ ...pre, page_number: res.page_number, total_elements: res.total_elements }));
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData, filter, onBeforeSearch, form]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (refreshLocal) {
      fetchData();
      setRefreshLocal(false);
    }
  }, [refreshLocal, fetchData]);

  const handleChangePagination = (data: Pagination) => {
    setPagination((pre) => ({ ...pre, ...data }));
    setFilter((pre) => ({ ...pre, ...data }));
  };

  const resetPageNumber = () => {
    setFilter((pre) => ({ ...pre, page_number: 1 }));
  };

  const handleFilter = useCallback(() => {
    resetPageNumber();
  }, []);

  const _filter = useMemo(() => {
    if (header) return header;
    if ((filterItems && filterItems.length > 0) || extraFilter)
      return (
        <SearchPageCoreFilter items={filterItems || []} onFilter={handleFilter} form={form} extraFilter={extraFilter} />
      );
    return null;
  }, [filterItems, header, form, handleFilter, extraFilter]);
  const _columns = useMemo(
    () =>
      (columns.filter((item) => Boolean(item)) as ColumnsTableTypeExcludeNull<T>).map((item) => ({
        ...item,
        title: t([item.title])
      })),
    [columns, t]
  );
  return (
    <div>
      <div className={clsx('flex max-w-full flex-col', { 'gap-y-4': _filter || titlePage || extra })}>
        {(titlePage || extra) && (
          <div className={clsx('flex items-center justify-between', { '!justify-end': !titlePage })}>
            {titlePage && <h1 className="xs:text-xl text-skin-base font-bold sm:text-2xl">{titlePage}</h1>}
            {extra}
          </div>
        )}

        {_filter && <div className="flex-1">{_filter}</div>}
        <AppTable
          columns={_columns}
          {...pagination}
          loading={loading}
          dataSource={data}
          onChangePagination={handleChangePagination}
          shouldSetParams={false}
          {...props}
        />
      </div>
    </div>
  );
}
const SearchPageCore = forwardRef(SearchPageCoreInner) as <T>(
  props: SearchPageCoreProps<T> & { ref?: Ref<SearchPageCoreRef<T>> }
) => ReturnType<typeof SearchPageCoreInner>;

export default SearchPageCore;
