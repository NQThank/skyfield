import { SelectType, UserStatusType, UserType } from '@/core/types';

export const EmployeeTypes: SelectType<UserType>[] = [
  {
    label: 'User',
    value: 'employee'
  },
  {
    label: 'Admin',
    value: 'admin'
  },
  {
    label: 'Project Manager',
    value: 'pm'
  }
];

export const EmployeeStatus: SelectType<UserStatusType>[] = [
  {
    label: 'Pending',
    value: 'pending'
  },
  {
    label: 'Active',
    value: 'active'
  },
  {
    label: 'Inactive',
    value: 'inactive'
  },
  {
    label: 'Disabled',
    value: 'disabled'
  }
];
