import { AxiosRequestConfig } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import axiosClient from '@/apis/axiosClient';
import useCancelToken from './useCancelToken';

interface AxiosResponse<T = any> {
  data: T;
}

interface UseAxiosResult<T> {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: () => void;
}

const useAxios = <T>(initialConfig: AxiosRequestConfig): UseAxiosResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [newCancelToken, isCancel, source] = useCancelToken();

  const fetchData = useCallback(
    async (config: AxiosRequestConfig) => {
      try {
        setLoading(true);
        setError(null);

        const response: AxiosResponse<T> = await axiosClient({
          ...config,
          cancelToken: newCancelToken()
        });

        setData(response.data);
      } catch (err) {
        console.log('🚀 ~ file: useAxios.ts:37 ~ err:', err);
        if (!isCancel(err)) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [isCancel, newCancelToken]
  );

  useEffect(() => {
    console.log('fetch');
    fetchData(initialConfig);
  }, [initialConfig, fetchData]);

  const refetch = () => {
    source && source.cancel();
    fetchData(initialConfig);
  };

  return { data, loading, error, refetch };
};

export default useAxios;
