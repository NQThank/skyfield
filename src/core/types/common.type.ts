import { UniqueIdentifier } from '@dnd-kit/core';
import { ActionKeyEnum, DateFormat } from '../enums';
import { EnumAsUnion } from './enum-as-union';
import { ColumnGroupType, ColumnType } from 'antd/es/table';
import { Dayjs } from 'dayjs';
import { PickerMode } from 'antd/node_modules/rc-picker/lib/interface';

export type ActionType = EnumAsUnion<typeof ActionKeyEnum>;
export type Place = google.maps.LatLng | google.maps.LatLngLiteral;
export type AutocompleteType = google.maps.places.Autocomplete;
export type Map = google.maps.Map;
export type ScreenPage = 'jobs' | 'equipments';

export type ColumnTableType<T> = ColumnGroupType<T> | ColumnType<T> | null;
export type ColumnsTableType<T> = ColumnTableType<T>[];
export type ColumnTableTypeExcludeNull<T> = ColumnGroupType<T> | ColumnType<T>;
export type ColumnsTableTypeExcludeNull<T> = ColumnTableTypeExcludeNull<T>[];
export type FilterItem = {
  type: 'input' | 'select' | 'date' | 'range-date' | 'autocomplete';
  placeholder: string | [string, string];
  name: string;
  size?: Size;
  options?: SelectType<string | number>[];
  defaultValue?: number | string | Dayjs | [Dayjs, Dayjs];
  mode?: PickerMode;
  conditionDisplay?: Record<string, string>;
  allowClear?: boolean;
};

export interface SelectType<T> {
  label: string;
  labelEn?: string;
  value: T;
}
export interface ParamsCommon {
  page_number: number;
  page_size: number;
}

export interface Pagination {
  page_number: number;
  page_size: number;
  total_elements?: number;
}

export interface ErrorObject {
  code: string;
  message: string;
}

export interface ResponseCommon<T> {
  success: boolean;
  data?: T;
  error: ErrorObject;
}

export interface IResponseList<T> extends ResponseCommon<T> {
  page_number: number;
  total_elements: number;
  total_pages: number;
}

export interface FormLayoutItem {
  labelCol?: {
    span?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
    offset?: number;
  };
  wrapperCol?: {
    span?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
    offset?: number;
  };
}

export type FormatDate = `${DateFormat}`;

export interface ResponseList<T> {
  items: T[];
  page: {
    page: number;
    size: number;
    totalElements: number;
  };
}

export interface ResponseListNew<T> {
  items: T[];
  pageNumber: number;
  numberPerPage: number;
  rowCount: number;
}

export interface ResponseCommonOld<T> {
  data: T;
  success: boolean;
  status: boolean;
  message: string;
}

export type ModalBaseProps<T> = {
  open: boolean;
  onCancel: () => void;
  actionType?: ActionType;
  data?: T;
  fetchData?: () => void | Promise<void>;
};

export type Action = {
  label: React.ReactNode;
  callback: (record: any, index: number) => void;
  type: ActionType;
};

export type BaseItem = {
  id: UniqueIdentifier;
  type: 'image' | 'item';
};

export type Size = {
  span?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
  offset?: number;
};

export type InfoItem<T> = {
  icon?: JSX.Element;
  label?: React.ReactNode;
  dataIndex: keyof T;
  size?: Size;
  render?: (value?: any, data?: T) => React.ReactNode;
  isHidden?: boolean;
};

export type SearchParamsValue = Record<string, string | number | boolean>;
export type PayloadValue = Record<string, string | number | boolean>;
export type IconType = 'edit' | 'add' | 'delete' | 'search' | 'download';
