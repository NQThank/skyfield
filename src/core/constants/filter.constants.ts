import { Filter } from '../types';
import { CustomerStatus } from './customer.constant';
import { EmployeeStatus, EmployeeTypes } from './employee.constant';
import { JOB_STATUSES, PRIORITIES } from './job.constant';
import { Priorities, TemplateTypes } from './task-template.constant';

export const filters: Filter[] = [{ label: 'Equipment Name', name: 'q', type: 'textbox' }];

export const filtersEquipments: Filter[] = [{ label: 'Equipment Name', name: 'q', type: 'textbox' }];
export const filtersDocuments: Filter[] = [{ label: 'Document Name', name: 'q', type: 'textbox' }];

export const filtersJob: Filter[] = [
  { label: 'Job Name', name: 'name', type: 'textbox' },
  { label: 'Job Status', name: 'status', type: 'select', options: JOB_STATUSES },
  { label: 'Priority', name: 'priority', type: 'select', options: PRIORITIES },
  { label: 'Start Date', name: 'start_date', type: 'datepicker' },
  { label: 'End Date', name: 'end_date', type: 'datepicker' },
  { label: 'Team', name: 'team_id', type: 'autocomplete' }
];

export const filtersEmployee: Filter[] = [
  { label: 'User Name', name: 'q', type: 'textbox' },
  { label: 'User Status', name: 'status', type: 'radio-group', options: EmployeeStatus },
  { label: 'User Type', name: 'type', type: 'select', options: EmployeeTypes }
];

export const filtersCustomer: Filter[] = [
  { label: 'Customer Name', name: 'q', type: 'textbox' },
  { label: 'Status', name: 'status', type: 'select', options: CustomerStatus }
];

export const filtersContact: Filter[] = [{ label: 'Contact Name', name: 'q', type: 'textbox' }];

export const filtersSitelocation: Filter[] = [{ label: 'Sitelocation Name', name: 'q', type: 'textbox' }];

export const filtersMarket: Filter[] = [{ label: 'Market Name', name: 'q', type: 'textbox' }];

export const filtersTaskTemplate: Filter[] = [{ label: 'Task Template Name', name: 'q', type: 'textbox' }];

export const filtersTeam: Filter[] = [{ label: 'Team Name', name: 'q', type: 'textbox' }];

export const filtersProject: Filter[] = [{ label: 'Project Name', name: 'q', type: 'textbox' }];

export const filtersCertificate: Filter[] = [{ label: 'Certificate Name', name: 'q', type: 'textbox' }];

export const filtersJobTemplate: Filter[] = [
  { label: 'Job Template Name', name: 'q', type: 'textbox' },
  { label: 'Type', name: 'type', type: 'select', options: TemplateTypes },
  { label: 'Priority', name: 'priority', type: 'select', options: Priorities },
  { label: 'Scope', name: 'scope', type: 'textbox' },
  { label: 'Description', name: 'description', type: 'textbox' }
];
export const filtersNewJob: Filter[] = [
  { label: 'Start Date', name: 'date', type: 'date-range' },
  { label: 'Job Name', name: 'name', type: 'textbox' },
  { label: 'Job Status', name: 'status', type: 'select', options: JOB_STATUSES }
];
export const filterCheckInOut: Filter[] = [
  { label: 'Check in / Check out', name: 'searchDate', type: 'datepicker' },
  { label: 'User Name', name: 'employeeName', type: 'textbox' }
];
