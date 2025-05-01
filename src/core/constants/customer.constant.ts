import { SelectType, CustomerStatusType } from '../types';

export const CustomerStatus: SelectType<CustomerStatusType>[] = [
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
