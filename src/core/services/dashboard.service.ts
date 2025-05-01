import { AxiosRequestConfig } from 'axios';

import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { ResponseCommonOld } from '../types';

class DashboardService extends BaseService {
  getAll(config?: AxiosRequestConfig): Promise<ResponseCommonOld<any[]>> {
    return this.get(`/`, {}, config);
  }
}

export default new DashboardService(ApiURL.dashboard);
