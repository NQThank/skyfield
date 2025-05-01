import { AxiosRequestConfig } from 'axios';

import {
  Customer,
  CustomerFilter,
  CustomerPayload,
  IResponseList,
  ResponseCommon,
  ResponseCommonOld
} from '@/core/types';
import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';

class CustomerService extends BaseService {
  getAllCustomer(): Promise<ResponseCommonOld<Customer[]>> {
    return this.get(`/all`);
  }

  getCustomerList(params: CustomerFilter, config?: AxiosRequestConfig): Promise<IResponseList<Customer[]>> {
    return this.get('', params, config);
  }

  addCustomer(payload: CustomerPayload): Promise<ResponseCommon<null>> {
    return this.post('', payload);
  }

  updateCustomer(id: string, payload: CustomerPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteCustomer(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }

  getCustomerById(id: string, config?: AxiosRequestConfig): Promise<IResponseList<Customer>> {
    return this.get(`/${id}`, config);
  }
}

export default new CustomerService(ApiURL.customer);
