import { UploadFile } from 'antd';

import { SelectType } from './common.type';
import { FormItemType } from './task-template.type';
import { TaskStatusEnum } from '../enums';
import { EnumAsUnion } from './enum-as-union';

export type OpenJobTaskType = 'subtask-image' | 'equipment' | 'template-item' | 'add-item' | 'add-item-image';
export type LoadingJobTaskType = 'form-items' | 'job-image';
export type TaskStatusType = EnumAsUnion<typeof TaskStatusEnum>;
export type JobImageStatus = 'UPLOADED' | 'APPROVE' | 'REJECT';
export type JobTaskStatus = 'not_started' | 'in_progress' | 'completed';

export type TaskGeneralInfoType = {
  id?: string;
  name: string;
  progress: number;
  status: JobTaskStatus;
  sector_required?: boolean;
  location_type?: string;
  priority?: string;
  type?: string;
};

export type JobTaskResponse = {
  id: string;
  name: string;
  progress: number;
  status: JobTaskStatus;
  documents?: {
    download_url: string;
    id: string;
    name: string;
  }[];
};

export interface MasterValue {
  label: string;
  type: FormItemType;
  value?: SelectType<string | number>[];
  comment?: '';
  example_image?: any[];
  inspection_instruction?: string;
  quantity?: number;
  status?: string;
  summary?: string;
  url?: string;
  inspected_notes?: string;
  urls?: any[];
  field_notes?: string;
  files_url?: any[];
  post_photos?: any[];
  post_quantity?: number;
  pre_photos?: any[];
  pre_quantity?: number;
  inspection_photos?: any[];
  description?: string;
  type_add_item?: string;
}

export type TJobTemplateItemSubTask = {
  id: string;
  uid?: string;
  value?: MasterValue;
  name: FormItemType | any;
  inspected_value?: string;
  order_value?: number;
  parent_id?: string;
  documents?: UploadFile[];
  add_document_ids?: string[];
  delete_document_ids?: string[];
  label?: string;
  files_url?: any[];
  status?: 'init' | 'done';
};

export type TComment = {
  user_name: string;
  created_at: string;
  action: 'APPROVE' | 'REJECT';
  comment: string;
};

export type JobSubTaskTemplate = {
  id: string;
  uid?: string;
  name: string;
  order_value: number;
  drag_status: boolean;
  parent_id?: string;
  parent_order?: number;
  position_id?: string;
  sector_id?: string;
  children?: JobSubTaskTemplate[];
  status: 'done' | 'init';
  item_count?: number;
  job_task_items?: {
    id: string;
    name: string;
  }[];
  approve_required?: boolean;
  item_required?: boolean;
  marked?: boolean;
};

export type JobSubTaskEquipment = {
  id?: string;
  uid?: string;
  quantity: number;
  serial_number: string;
  asset_serial_number?: string;
  equipment_id: string;
  equipment_name: string;
  equipment_type: string;
};

export interface Sector {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

export type JobImage = {
  document_id: string;
  id: string;
  name: string;
  status: JobImageStatus;
  url: string;
  job_id?: string;
  job_items_id?: string;
};

export type ImageSubTaskItemPayload = {
  add_gallery_ids?: string[];
  delete_gallery_ids?: string[];
};
