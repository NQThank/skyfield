import { JobStatusEnum, PriorityEnum } from '../enums';
import { BaseItem, ParamsCommon } from './common.type';
import { EnumAsUnion } from './enum-as-union';
import { Equipment } from './equipment.type';
import { Project } from './project.type';
import { Sitelocation } from './sitelocation.type';
import { Team } from './team.type';

export type JobStatus = EnumAsUnion<JobStatusEnum>;
export type Priority = EnumAsUnion<PriorityEnum>;
export type MilestoneStatus = 'scheduled' | 'init' | 'done';

export interface DailyReport {
  id: string;
  job_id: string;
  user_id: string;
  name: string;
  description: string;
  date: string;
}

export interface JobIssue {
  create_at: string;
  id: string;
  job_id: string;
  user_id: string;
  name: string;
  description: string;
}

export interface JobTask {
  task_id: string;
  task_name: string;
  description: string;
  category: string;
  type: string;
  location_type: string;
  status: MilestoneStatus;
  priority: Priority;
  milestone_id: string;
}

// Milestone
export type JobMilestone = {
  id: string;
  name: string;
  end_date: string;
  status: MilestoneStatus;
  order_value: number;
  job_tasks?: JobTask[];
};

export type JobMilestonePayload = {
  id?: string;
  name: string;
  end_date: string;
  order_value?: number;
};

export type JobBase = {
  id: string;
  name: string;
  scope_of_work: string;
  start_date: string;
  end_date: string;
  priority: PriorityEnum;
  status: JobStatus;
  type: string;
  description: string;
  contact?: string;
  phone?: string;
};

export type Job = JobBase & {
  customer_name: string;
  team_name: string;
  project_name: Project;
  site_location?: Sitelocation;
};

export interface JobDetail {
  dailyReports: DailyReport[];
  equipments: Equipment[];
  info: Job;
  jobIssues: JobIssue[];
  milestones: JobMilestone[];
  process: number;
  siteLocation: Sitelocation;
  team: Team;
}

export type JobPayload = {
  name: string;
  scope_of_work?: string;
  start_date: string | null;
  end_date: string | null;
  priority: Priority;
  type?: string;
  project_id?: string;
  team_id?: [string];
  site_location_id?: [string];
  equipment_ids?: string[];
  description?: string;
  document_ids: string[];
  assignees?: string[];
  market?: string[];
  assign_user_ids?: string[];
  delete_assignee?: string[];
  delete_team_id?: string[];
  add_team_id?: string[];
  add_assignee?: string[];
};

export interface JobSearch {}

export interface JobFilter extends ParamsCommon, JobSearch {}

export interface MilestoneStatusValue {
  label: string;
  color: string;
}
export type MilestoneStatusType = {
  [key in MilestoneStatus]: string;
};

export interface JobDetailInfo {
  name: string;
  start_end_date: string;
  scope_of_work: string;
  customer: string;
  site_location: string;
  tower_type: string;
  tower_owner: string;
  tower_owner_poc: string;
  contact: string;
  phone_number: string;
  description: string;
  lat: number | null;
  lng: number | null;
}

export type JobDetail1 = JobBase & {
  equipments: Equipment[];
  job_daily_reports: DailyReport[];
  job_issues: JobIssue[];
  project?: Project;
  site_location?: Sitelocation[];
  team?: Team[];
  assignees: any[];
};

export type EquipmentJobPayload = {
  job_equipments: {
    equipment_id: string;
    quantity: number;
  }[];
};

export type TeamJobPayload = {
  team_id: string;
};

export type TaskMilestonePayload = {
  name: string;
  description?: string;
  task_template_id?: string;
};

export type UpdateDocumentPayload = {
  add_document_ids: string[];
  delete_document_ids: string[];
};

export type GalleryFileType = BaseItem & {
  img: string;
};

export type AddSubTaskRes = {
  id: string;
  job_task_id: string;
  name: string;
};

export type SubTaskType = {
  id: string;
  name: string;
  job_task_items: SubTaskItemType[];
  job_sub_task_equipments: EquipmentSubTaskItemType[];
};

export type SubTaskItemType = {
  id: string;
  name: string;
};
export type EquipmentSubTaskItemType = {
  id: string;
  equipment_id: string;
  asset_serial_number: string;
  quantity: number;
  serial_number: string;
};
