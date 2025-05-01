import { ContactRoleType, Pagination, SelectType } from '@/core/types';
import PathURL from '../class/PathURL';

export const APP_VERSION = 'v1.0.0';

export const APP_NAME = 'Skyfields';

export const FILE_TYPE_OLD = 'old';

export const DEFAULT_PAGINATION: Pagination = {
  page_number: 1,
  page_size: 10,
  total_elements: 0
};

export const DEFAULT_FILTER = {
  page_number: 1,
  page_size: 10
};

export const BREAD_CRUMB_DISABLED = [PathURL.milestones, PathURL.tasks];

export const BREAD_CRUMB_HIDDEN = [PathURL.edit, PathURL.jobs];

export const ContactRoleStatus: SelectType<ContactRoleType>[] = [
  {
    label: 'Project Manager',
    value: 'project_manager'
  },
  {
    label: 'Field Manager',
    value: 'field_manager'
  },
  {
    label: 'Safety Manager',
    value: 'safety_manager'
  },
  {
    label: 'Warehouse Manager',
    value: 'warehouse_manager'
  },
  {
    label: 'Closeout Manager',
    value: 'closeout_manager'
  },
  {
    label: 'Project Coordinator',
    value: 'project_coordinator'
  },
  {
    label: 'Technical Manager',
    value: 'technical_manager'
  },
  {
    label: 'Construction Manager',
    value: 'construction_manager'
  }
];
