import { CommonHelper } from '@/utils/helpers';
import { MilestoneStatusType } from '../types';
import { JobStatusEnum, PriorityEnum } from '../enums';

export const MILESTONE_STATUSES: MilestoneStatusType = {
  scheduled: 'Scheduled',
  done: 'Done',
  init: 'Init'
};

export const PRIORITIES = CommonHelper.EnumToArrayObject(PriorityEnum);

export const JOB_STATUSES = CommonHelper.EnumToArrayObject(JobStatusEnum);

export const actions = [
  {
    label: 'Reject',
    key: 'job_po_rejected',
    status: ['job_issued']
  },
  {
    label: 'Approve',
    key: 'job_po_approved',
    status: ['job_issued', 'job_po_rejected']
  }
];

export const TaskCategories = [
  {
    label: 'General',
    value: 'general'
  },
  {
    label: 'Inspection',
    value: 'inspection'
  },
  {
    label: 'Common',
    value: 'common'
  }
];

export const pathNameTaskTemplate = '/task-templates';
