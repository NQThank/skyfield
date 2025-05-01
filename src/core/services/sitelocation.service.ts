import { AxiosRequestConfig } from 'axios';

import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import {
  IResponseList,
  ResponseCommon,
  ResponseCommonOld,
  Sitelocation,
  SitelocationFilter,
  SitelocationPayload
} from '../types';

class SitelocationService extends BaseService {
  getAllSitelocation(config?: AxiosRequestConfig): Promise<ResponseCommonOld<Sitelocation[]>> {
    return this.get(`/all`, {}, config);
  }

  getSitelocationList(params: SitelocationFilter, config?: AxiosRequestConfig): Promise<IResponseList<Sitelocation[]>> {
    return this.get('', params, config);
  }

  getSitelocationById(id: string): Promise<ResponseCommon<Sitelocation>> {
    return this.get(`/${id}`);
  }

  addSitelocation(payload: SitelocationPayload): Promise<ResponseCommon<null>> {
    return this.post('', payload);
  }

  updateSitelocation(id: string, payload: SitelocationPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteSitelocation(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }
}

export default new SitelocationService(ApiURL.sitelocation);
