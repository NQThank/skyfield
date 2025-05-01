import { AxiosRequestConfig } from 'axios';

import {
  Employee,
  EmployeeCertPayload,
  EmployeePayload,
  EmployeePayloadEdit,
  EmployeeSearchFilter,
  IResponseList,
  ResponseCommon,
  ResponseCommonOld,
  UserStatusType
} from '@/core/types';
import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';

class EmployeeService extends BaseService {
  getAllEmployee(): Promise<ResponseCommonOld<Employee[]>> {
    return this.get(`/all`);
  }

  getEmployeeList(params: EmployeeSearchFilter, config?: AxiosRequestConfig): Promise<IResponseList<Employee[]>> {
    return this.get('', params, config);
  }
  getEmployeeById(id: string): Promise<ResponseCommon<Employee>> {
    return this.get(`/${id}`);
  }

  addEmployee(payload: EmployeePayload): Promise<ResponseCommon<null>> {
    return this.post(``, payload);
  }

  updateEmployee(id: string, payload: EmployeePayloadEdit): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteEmployee(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }

  uploadAvatar(id: string, payload: FormData): Promise<ResponseCommon<string>> {
    return this.patch(`/${id}/avatar`, payload, { headers: { 'content-type': 'multipart/form-data' } });
  }

  updateStatusEmployee(id: string, payload: { status: UserStatusType }): Promise<ResponseCommon<null>> {
    return this.patch(`/${id}/status`, payload);
  }
  // cert
  getEmployeeCertList(id: string, config?: AxiosRequestConfig): Promise<IResponseList<EmployeePayloadEdit[]>> {
    return this.get(`/${id}/cert`, {}, config);
  }
  addEmployeeCert(id: string, payload: EmployeeCertPayload): Promise<ResponseCommon<null>> {
    return this.post(`/${id}/cert`, payload);
  }
  updateEmployeeCert(id: string, idCert: string, payload: EmployeeCertPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${id}/cert/${idCert}`, payload);
  }
  deleteEmployeeCert(id: string, idCert: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}/cert/${idCert}`);
  }
}

export default new EmployeeService(ApiURL.employee);
