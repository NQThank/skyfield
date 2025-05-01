import { TableProps } from 'antd';
import { Action, Pagination } from './common.type';
export type MenuActionType = 'menu' | 'icon';

export type TableEmptyMessage = {
  emptyStateTitle?: React.ReactNode;
  emptyStateMessage?: React.ReactNode;
  emptyStateActionMessage?: React.ReactNode;
};

export type TableErrorMessage = {
  errorStateTitle?: React.ReactNode;
  errorStateMessage?: React.ReactNode;
};

export type AppTableType = TableProps<any> &
  TableEmptyMessage &
  TableErrorMessage & {
    emptyStateActionOnClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void | Promise<void>;
    page_number?: number;
    page_size?: number;
    total_elements?: number;
    onChangePagination?: (payload: Pagination) => void;
    showPagination?: boolean;
    enableExpandable?: boolean;
    actions?: Action[];
    showColumnNo?: boolean;
    showToggleColumn?: boolean;
    customLoadingEmpty?: boolean;
    menuActionType?: MenuActionType;
    widthScroll?: number;
    isError?: boolean;
    shouldSetParams?: boolean;
  };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type SearchPageCoreRef<T> = {
  fetchData: () => void;
};
