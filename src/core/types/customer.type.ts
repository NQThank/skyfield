import { ParamsCommon } from './common.type';
import { Market } from './market.type';

export type CustomerStatusType = 'pending' | 'active' | 'inactive' | 'disabled';
export type ContactRoleType =
  | 'project_manager'
  | 'field_manager'
  | 'safety_manager'
  | 'warehouse_manager'
  | 'closeout_manager'
  | 'project_coordinator'
  | 'technical_manager'
  | 'construction_manager';

export type Customer = {
  id: string;
  name: string;
  address: string;
  website: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: CustomerStatusType;
  contract_status: CustomerStatusType;
  net_term?: number;
  markets: Market[];
};

export type CustomerPayload = Omit<Customer, 'id'>;

export type CustomerSearch = {
  q?: string;
  status?: CustomerStatusType;
};

export type CustomerFilter = CustomerSearch & ParamsCommon;
