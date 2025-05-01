import { ParamsCommon } from './common.type';

export type Contact = {
  id: string;
  customer_name: string;
  phone_number: string;
  email: string;
  role: string;
  company_name: string;
  company?: string;
};

export type ContactPayload = Omit<Contact, 'id'>;

export type ContactSearch = {
  q?: string;
};

export type ContactFilter = ContactSearch & ParamsCommon;
