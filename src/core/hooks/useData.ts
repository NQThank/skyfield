import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_FILTER, DEFAULT_PAGINATION } from '../constants';
import { SharedService } from '../services';
import { IResponseList, Pagination } from '../types';
import useSearchParamsState from './useSearchParamsState';
import useCancelToken from './useCancelToken';

const useData = <T>(apiEndPoint: string, defaultFilter?: any) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [searchParams, isReady] = useSearchParamsState();
  const [cancelToken] = useCancelToken();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response: IResponseList<T[]> = await SharedService.get(
        `${apiEndPoint}`,
        {
          ...DEFAULT_FILTER,
          ...defaultFilter,
          ...searchParams
        },
        { cancelToken: cancelToken() }
      );
      if (response.success) {
        setData(response.data ?? []);
        setPagination((prePagination) => ({
          ...prePagination,
          page_number: response.page_number,
          total_elements: response.total_elements
        }));
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, apiEndPoint, cancelToken]);

  useEffect(() => {
    isReady && fetchData();
  }, [fetchData, isReady]);

  return { loading, data, pagination, fetchData };
};

export default useData;
