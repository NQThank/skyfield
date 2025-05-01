export enum PathKeyEnum {
  Dashboard = 'dashboard'
}

export enum PathLabelEnum {
  dashboard = 'Dashboard',
  login = 'Login',
  'operations' = 'Operations',
  projects = 'Projects',
  'crm' = 'CRM',
  'company' = 'Company',
  jobs = 'Jobs',
  task = 'Task',
  'edit-task' = 'Edit Task',
  employees = 'Users',
  'employees-detail' = 'User Detail',
  teams = 'Teams',
  customers = 'Customers',
  settings = 'Settings',
  equipments = 'Equipments',
  sitelocations = 'Site Locations',
  markets = 'Markets',
  contact = 'Contact',
  'task-templates' = 'Task Templates',
  'create-task-templates' = 'Create Task Templates',
  'edit-task-templates' = 'Edit Task Templates',
  profile = 'Profile',
  'job-templates' = 'Job Templates',
  documents = 'Documents',
  certificate = 'Certificate'
}

export enum PathEnum {
  dashboard = 'dashboard',
  login = 'login',
  projects = 'projects',
  jobs = 'jobs',
  task = 'task',
  'edit-task' = 'dit-task',
  employees = 'employees',
  teams = 'teams',
  customers = 'customers',
  settings = 'settings',
  equipments = 'equipments',
  sitelocations = 'sitelocations',
  markets = 'markets',
  'task-templates' = 'task-templates',
  'create-task-templates' = 'task-templates/add',
  'edit-task-templates' = 'task-templates/edit',
  profile = 'profile',
  'job-templates' = 'job-templates'
}

export enum ActionKeyEnum {
  Edit = 'edit',
  Delete = 'delete',
  Logout = 'logout',
  Add = 'add',
  ChangeStatus = 'change-status',
  Download = 'download'
}

// Enum Dateformat
export enum DateFormat {
  'DD/MM/YYYY' = 'DD/MM/YYYY',
  'DD/MM/YYYYHHmm' = 'DD/MM/YYYY HH:mm',
  'DD/MM/YYYYHHmmss' = 'DD/MM/YYYY HH:mm:ss',
  'YYYYMMDDHHmm' = 'YYYYMMDDHHmm',
  'YYYYMMDDHHmmss' = 'YYYYMMDDHHmmss',
  'YYYYMMDD' = 'YYYYMMDD',
  'dddDD/MM/YYYY' = 'ddd, DD/MM/YYYY',
  'ddddDD/MM/YYYYHHmm' = 'dddd, DD/MM/YYYY HH:mm',
  'dddd' = 'dddd',
  'dddd, MMMM DD' = 'dddd, MMMM DD',
  'MMMM YYYY' = 'MMMM YYYY',
  'MMMM DD' = 'MMMM DD',
  'DD dddd' = 'DD dddd',
  'HH:mm' = 'HH:mm',
  'MM/DD/YYYY' = 'MM/DD/YYYY'
}

export enum LocalStorageKeyEnum {
  selectedKey = 'selectedKey',
  openKeys = 'openKeys',
  auth = 'auth'
}

export enum JobStatusEnum {
  'NOT STARTED' = 'not_started',
  'FORECAST' = 'forecast',
  'IN PROGRESS' = 'in_progress',
  'COMPLETED' = 'completed'
}

export enum ContactRoleEnum {
  'Project Manager' = 'project_manager',
  'Field Manager' = 'field_manager',
  'Safety Manager' = 'safety_manager',
  'Warehouse Manager' = 'warehouse_manager',
  'Closeout Manager' = 'closeout_manager',
  'Project Coordinator' = 'project_coordinator',
  'Technical Manager' = 'technical_manager',
  'Construction Manager' = 'construction_manager'
}

export enum PriorityEnum {
  'High' = 'high',
  'Medium' = 'medium',
  'Low' = 'low'
}

export enum LocationTypeEnum {
  'Admin' = 'admin',
  // 'Field' = 'field',
  // 'Ground' = 'ground',
  'Technician' = 'technician',
  'Tower' = 'tower'
}

export enum TemplateTypeEnum {
  'Audit' = 'audit',
  'Decomm' = 'decomm',
  'Document' = 'document',
  'Install' = 'install',
  'Logistic' = 'logistic',
  'Maintenance' = 'maintenance',
  'Mobilization' = 'mobilization',
  'Relocate' = 'relocate',
  'Survey' = 'survey',
  'Testing' = 'testing',
  'Transfer' = 'transfer'
}

export enum SliceEnum {
  'task-template-form' = 'task-template-form',
  auth = 'auth'
}

export enum TaskStatusEnum {
  'not_started' = 'Not Started',
  'in_progress' = 'In Progress',
  'completed' = 'Completed'
}
