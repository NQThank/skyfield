import { AxiosRequestConfig } from 'axios';

import { IResponseList, ResponseCommon } from '@/core/types';
import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { Contact, ContactFilter, ContactPayload } from '../types/contact.type';

class ContactService extends BaseService {
  getContactList(params: ContactFilter, config?: AxiosRequestConfig): Promise<IResponseList<Contact[]>> {
    return this.get('', params, config);
  }

  addContact(payload: ContactPayload): Promise<ResponseCommon<null>> {
    return this.post('', payload);
  }

  updateContact(id: string, payload: ContactPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteContact(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }

  getContactById(id: string, config?: AxiosRequestConfig): Promise<IResponseList<Contact>> {
    return this.get(`/${id}`, config);
  }
}

export default new ContactService(ApiURL.contact);
