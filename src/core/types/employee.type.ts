import { ParamsCommon } from './common.type';

export type EmployeeType = 'Contractor' | 'Employee';

export type UserStatusType = 'pending' | 'active' | 'inactive' | 'disabled';
export type UserType = 'admin' | 'employee' | 'pm';

export type EmployeeBase = {
  id: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  address?: string;
  phone?: string;
  email: string;
  type: UserType;
  status: UserStatusType;
  hire_date?: string;
  termination_date?: string;
  full_name?: string;
  avatar_path?: string;
  team_id?: string;
};

export type Employee = EmployeeBase & {
  password: string;
  signature_url?: string;
  company?: string;
  positions?: string;
  notes?: string;
  payroll_type?: string;
  payroll_rate?: number;
};

export type EmployeePM = {
  id: string;
  name: string;
};

export type EmployeePayload = Omit<Employee, 'id'> & {
  hire_date?: string;
  termination_date?: string;
};
export type EmployeeCertPayload = {
  id?: string;
  document_id: string;
  expire_date: string | Date;
  issue_date: string | Date;
  name: string;
  status: string;
  type: string;
};

export type EmployeePayloadEdit = Omit<EmployeePayload, 'password' | 'email'>;

export type EmployeeSearch = {
  q?: string;
};

export type EmployeeMoreFilter = {
  status?: UserStatusType;
  type?: UserType;
};

export type EmployeeFilter = EmployeeSearch & EmployeeMoreFilter;

export type EmployeeSearchFilter = EmployeeFilter & ParamsCommon;

export type Profile = EmployeeBase;

export type ProfilePayload = Pick<Profile, 'address' | 'first_name' | 'last_name' | 'middle_name' | 'phone'>;
