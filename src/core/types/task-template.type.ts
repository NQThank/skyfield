import { UploadFile } from 'antd';

import { LocationTypeEnum, PriorityEnum, TemplateTypeEnum } from '../enums';
import { ParamsCommon, SelectType } from './common.type';
import { EnumAsUnion } from './enum-as-union';
import { Priority } from './job.type';

export type TaskTemplateType = EnumAsUnion<TemplateTypeEnum>;
export type LocationType = EnumAsUnion<LocationTypeEnum>;
export type FormItemType =
  | 'text_area'
  | 'photo_collection'
  | 'option'
  | 'check_list'
  | 'checkin'
  | 'date'
  | 'text'
  | 'radio'
  | 'pre_post_photo'
  | 'photo'
  | 'inspection_photos_collection'
  | 'punch_list_inspection_collection';
export type FilterItemType = 'all' | 'text' | 'numeric' | 'list' | 'date_time' | 'image';
export type FormItemStatus = 'active' | 'inactive';

export type CollapseKey = 'sub-task';

export type ModalType = 'template-item-form-edit' | 'sector-position';

export type SubTaskItemRes = {
  id?: string;
  uid: string;
  name: FormItemType;
  inspected_value: string;
  value: string;
  order_value: number;
  documents: TaskTemplateDocument[];
};

export type SubTaskEquipmentRes = {
  id?: string;
  uid: string;
  quantity: number;
  serial_number: string;
  asset_serial_number: string;
  equipment_id: string;
  equipment_name: string;
  equipment_type: string;
};

export type JobSubTaskTemplateRes = {
  id: string;
  name: string;
  parent_id: string;
  sector_id: string;
  position_id: string;
  order_value: number;
  parent_order: number;
  job_task_items: SubTaskItemRes[];
  job_sub_task_equipments: SubTaskEquipmentRes[];
};

export type JobTaskTemplateRes = {
  id: string;
  job_sub_tasks: JobSubTaskTemplateRes[];
  location_type: LocationTypeEnum;
  name: string;
  priority: PriorityEnum;
  type: TemplateTypeEnum;
  documents: TaskTemplateDocument[];
};

export type SubTaskTemplateRes = {
  id?: string;
  name: string;
  parent_id: string;
  sector_id: string;
  position_id: string;
  order_value: number;
  parent_order: number;
  task_item_templates: SubTaskItemRes[];
  sub_task_template_equipments: SubTaskEquipmentRes[];
  approve_required?: boolean;
  item_required?: boolean;
  marked?: boolean;
};

export type TaskTemplateDocument = {
  id: string;
  name: string;
  download_url: string;
};

export interface TaskTemplate {
  scope_of_work?: string;
  id: string;
  name: string;
  location_type: LocationType;
  type?: TaskTemplateType;
  priority?: Priority;
  sub_task_templates: SubTaskTemplateRes[];
  documents: TaskTemplateDocument[];
  number_of_men: number;
  total_working_hour: number;
}

export type TaskTemplateFilter = ParamsCommon & {
  q?: string;
};

export interface GeneralInfoForm {
  name?: string;
  location_type?: LocationType;
  type?: TaskTemplateType;
  priority?: Priority;
  sector_required?: boolean;
  description?: string;
  scope_of_work?: string;
  number_of_men?: number | string;
  total_working_hour?: number | string;
}
export type PayloadJobTemplate = {
  name: string;
  scope_of_work: string;
  priority: string;
  description: string;
  type: string;
  job_milestone_templates: {
    name: string;
    order_value: number;
    task_template_ids: string[];
  }[];
  add_document_ids: string[];
  delete_document_ids: string[];
};
export type FormItem = {
  id: string;
  description: string;
  master_value: any;
  name: FormItemType;
  status: FormItemStatus;
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

export interface ITemplateItem {
  id: string;
  uid?: string;
  value: MasterValue;
  name: FormItemType;
  inspected_value?: string;
  order_value: number;
  parent_id: string;
  documents?: UploadFile[];
  add_document_ids?: string[];
  delete_document_ids?: string[];
}

export type IFormItemMap = {
  [key in FormItemType]?: {
    label: string;
    icon: JSX.Element;
  };
};

export type IFilterItemMap = {
  [key in FilterItemType]?: {
    label: string;
    value: FilterItemType;
    types?: FormItemType[];
  };
};

export interface Sector {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface SectorPositionForm {
  sector_id: string;
  position_id: string;
  title: string;
}

// slice

export type LoadingType = 'loadingFormItems' | 'loadingData';
export type Loading = {
  [key in LoadingType]: boolean;
};

export type IsOpen = {
  [key in ModalType]: boolean;
};

export interface TemplateSubTask {
  id: string;
  title: string;
}

export interface SectorPositionTemplate {
  id: string;
  sector_id?: string;
  position_id?: string;
  title: string;
  isSubTask: boolean;
  subTasks?: TemplateSubTask[];
}

export type SubTaskGroup = {
  id: string;
  uid?: string;
  sector_id: string;
  position_id?: string;
  order_value: number;
  name: string;
  isSubTask: boolean;
};

export type SubTaskTemplate = {
  id: string;
  uid?: string;
  name: string;
  sector_id: string;
  position_id: string;
  order_value: number;
  parent_id: string;
};

export interface EquipmentSubTask {
  id?: string;
  uid?: string;
  equipment_name?: string;
  equipment_id?: string;
  equipment_type?: string;
  quantity: number;
  serial_number: string;
}

export type ItemTemplate = {
  [key: string]: ITemplateItem[];
};

export type EquipmentSubTaskPayload = {
  [key: string]: EquipmentSubTask[];
};
export type TemplateForm = {
  loading: Loading;
  isOpen: IsOpen;
  formItems: FormItem[];
  sectors: Sector[];
  positions: Position[];
  subTaskActive: TemplateSubTask | null;
  subTaskGroupIdActive?: string;
  template: {
    documentList: UploadFile[];
    delete_document_ids: string[];
    delete_sub_task_equipment_ids: string[];
    delete_template_item_ids: string[];
    delete_sub_task_ids: string[];
    generalInfo?: GeneralInfoForm;
    name: string;
    sector_required: boolean;
    subTasksTemplate: SubTaskTemplate[];
    itemTemplates: ItemTemplate;
    equipmentsSubTask: EquipmentSubTaskPayload;
    activeKeySectorPosition: string | string[];
    activeKeySubTaskListParent: CollapseKey[];
    itemTemplateEdit?: ITemplateItem;
    subTasksGroup: SubTaskGroup[];
  };
};

export type ItemTemplateForm = {
  label: string;
};

export type TaskItemTemplatePayload = {
  name: FormItemType;
  order_value: number;
  value: string;
  inspected_value?: string;
  form_item_type_ids: string[];
  add_document_ids?: string[];
  delete_document_ids?: string[];
};

export type SubTaskTemplateEquipmentPayload = {
  quantity: number;
  serial_number: string;
  asset_serial_number: string;
  equipment_id: string;
};

export type SubTaskTemplatePayload = {
  id?: string;
  name: string;
  parent_order?: number;
  order_value: number;
  sector_id: string;
  position_id: string;
  parent_id: string;
  sub_task_template_equipment_rqs: SubTaskTemplateEquipmentPayload[];
  task_item_template_rqs: TaskItemTemplatePayload[];
};

export type TaskTemplatePayload = {
  name: string;
  type: TaskTemplateType;
  location_type: LocationType;
  priority: Priority;
  sub_task_template_rqs: SubTaskTemplatePayload[];
  delete_sub_task_template_equipment_ids: string[];
  delete_task_item_template_ids: string[];
  delete_sub_task_template_ids: string[];
  add_document_ids: string[];
  delete_document_ids: string[];
};

export type JobSubTaskTemplatePayload = {
  id?: string;
  name: string;
  parent_order?: number;
  order_value: number;
  sector_id: string;
  position_id: string;
  parent_id: string;
  job_sub_task_equipments: SubTaskTemplateEquipmentPayload[];
  job_task_items: TaskItemTemplatePayload[];
};

export type JobTaskTemplatePayload = {
  name: string;
  type: TaskTemplateType;
  location_type: LocationType;
  priority: Priority;
  job_sub_tasks: JobSubTaskTemplatePayload[];
  delete_job_sub_task_equipment_ids: string[];
  delete_job_task_item_ids: string[];
  delete_job_sub_task_ids: string[];
  add_document_ids: string[];
  delete_document_ids: string[];
};
