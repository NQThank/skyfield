import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type SearchParamsValue = {
  [key: string]: string | number;
};

export default function useSearchParamsState(): readonly [searchParamsState: SearchParamsValue, isReady: boolean] {
  const [searchParams, _setSearchParams] = useSearchParams();
  const [searchParamsValue, setSearchParamsValue] = useState<SearchParamsValue>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const _searchParamsValue: SearchParamsValue = {};
    for (const entry of searchParams.entries()) {
      const [param, value] = entry;
      _searchParamsValue[param] = value;
    }
    setSearchParamsValue(_searchParamsValue);
    setIsReady(true);
  }, [searchParams]);
  return [searchParamsValue, isReady];
}
