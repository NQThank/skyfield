import { ParamsCommon } from './common.type';
import { Customer } from './customer.type';

export type Project = {
  id: string;
  customer_id: string;
  name: string;
  description?: string;
  forecast_start_date: string;
  forecast_end_date: string;
  customer_name: string;
  customer: Customer;
  market_id?: string | null;
  market_name?: string | null;
};

export type ProjectFilter = ParamsCommon & {
  q?: string;
};

export type ProjectPayload = Omit<Project, 'id' | 'customer_name' | 'customer'>;
