import { AxiosRequestConfig } from 'axios';

import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { IResponseList, Market, MarketFilter, MarketPayload, ResponseCommon } from '../types';

class MarketService extends BaseService {
  getMarketList(params: MarketFilter, config?: AxiosRequestConfig): Promise<IResponseList<Market[]>> {
    return this.get('', params, config);
  }

  addMarket(payload: MarketPayload): Promise<ResponseCommon<null>> {
    return this.post('', payload);
  }

  updateMarket(id: string, payload: MarketPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteMarket(id: string): Promise<ResponseCommon<any>> {
    return this.delete(`/${id}`);
  }
}

export default new MarketService(ApiURL.market);
