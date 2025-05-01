// import { StatusTag } from '@/core/components';
import { JOB_STATUSES } from '@/core/constants';
import { DateFormat, JobStatusEnum, PriorityEnum } from '@/core/enums';
import { FilterItem, JobTaskStatus } from '@/core/types';
import { DataHelper, FormatHelper } from '@/utils/helpers';
import { ColumnType } from 'antd/es/table';
import { Link } from 'react-router-dom';

export const customerNameCol: ColumnType<any> = {
  title: 'Customer',
  key: 'customer_name',
  dataIndex: 'customer_name'
};
export const jobCol: ColumnType<any> = {
  title: 'Job Name',
  key: 'name',
  dataIndex: 'name',
  render: (name) => {
    return <Link to={`#`}>{name}</Link>;
  }
};
export const statusCol: ColumnType<any> = {
  title: 'Status',
  key: 'status',
  dataIndex: 'status',
  render(status: JobTaskStatus) {
    return DataHelper.getEnumKeyByValue(status, JobStatusEnum);
  }
};
export const teamCol: ColumnType<any> = {
  title: 'Team',
  key: 'team_name',
  dataIndex: 'team_name'
};
export const startDateCol: ColumnType<any> = {
  title: 'Start Date',
  key: 'start_date',
  dataIndex: 'start_date',
  render: (start_date) => {
    return FormatHelper.formatDate(start_date, DateFormat['MM/DD/YYYY']);
  }
};
export const endDateCol: ColumnType<any> = {
  title: 'End Date',
  key: 'end_date',
  dataIndex: 'end_date',
  render: (end_date) => {
    return FormatHelper.formatDate(end_date, DateFormat['MM/DD/YYYY']);
  }
};
export const priorityDateCol: ColumnType<any> = {
  title: 'Priority',
  key: 'priority',
  dataIndex: 'priority',
  render: (priority) => {
    return DataHelper.getEnumKeyByValue(priority, PriorityEnum);
  }
};
export const dateSearch: FilterItem = {
  name: 'Start Date - End Date',
  placeholder: ['From', 'To'],
  type: 'range-date',
  size: {
    xl: 5,
    lg: 5,
    sm: 8,
    xs: 8
  }
};
export const CustomerSearch: FilterItem = {
  name: 'customer_name',
  placeholder: 'Customer',
  type: 'input',
  size: {
    xl: 4,
    lg: 4,
    sm: 8,
    xs: 8
  }
};
export const JobSearch: FilterItem = {
  name: 'name',
  placeholder: 'Job Name',
  type: 'input',
  size: {
    xl: 4,
    lg: 4,
    sm: 8,
    xs: 8
  }
};
export const statusSearch: FilterItem = {
  name: 'status',
  placeholder: 'Status',
  type: 'select',
  options: JOB_STATUSES,
  size: {
    xl: 4,
    lg: 4,
    sm: 8,
    xs: 8
  }
};
