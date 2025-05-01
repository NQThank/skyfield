import { AxiosRequestConfig } from 'axios';

import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import {
  Equipment,
  EquipmentFilter,
  EquipmentPayload,
  IResponseList,
  ResponseCommon,
  ResponseCommonOld
} from '../types';

class EquipmentService extends BaseService {
  getAllEquipment(config?: AxiosRequestConfig): Promise<ResponseCommonOld<Equipment[]>> {
    return this.get(`/all`, {}, config);
  }

  getEquipmentList(params: EquipmentFilter, config?: AxiosRequestConfig): Promise<IResponseList<Equipment[]>> {
    return this.get(``, params, config);
  }

  addEquipment(payload: EquipmentPayload): Promise<ResponseCommon<any>> {
    return this.post(``, payload);
  }

  updateEquipment(id: string, payload: EquipmentPayload): Promise<ResponseCommon<any>> {
    return this.put(`/${id}`, payload);
  }

  deleteEquipment(id: string): Promise<ResponseCommon<any>> {
    return this.delete(`/${id}`);
  }
}

export default new EquipmentService(ApiURL.equipment);
